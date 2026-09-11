import { useCallback, useEffect, useRef, useState } from 'react'
import * as apiReal from './dados'
import { mensagemErroDados } from './dadosErros'
import { emPrevia, previaApi } from '../dev/previa'
import { t } from '../i18n/pt-BR'

// Em /?previa (só em desenvolvimento) os dados vêm de uma fixture em memória.
const api = emPrevia ? previaApi : apiReal

// Tempo para desfazer uma exclusão antes de ela ir para o banco.
const PRAZO_DESFAZER = 5000

const porCriacao = (a, b) => a.created_at.localeCompare(b.created_at)

// Aviso quando a conclusão rende menos que o normal (a regra fica visível).
function mensagemDoGanho(xp, motivo) {
  const m = t.tarefas.motivoXp
  if (motivo === 'recem_criada') return m.recemCriada
  if (motivo === 'teto') return m.teto
  if (motivo === 'teto_parcial') return m.tetoParcial(xp)
  return null
}

const buscarTudo = () =>
  Promise.all([
    api.listarCategorias(),
    api.listarTarefas(),
    api.lerEstatisticas(),
    api.lerPerfil(),
    api.listarTags(),
    api.listarFontes(),
    api.listarColunas(),
    // Os minutos de foco são extras: se falharem, o resto do app carrega mesmo assim.
    api.listarFocos().catch(() => []),
  ])

// Blocos de foco que não chegaram ao banco (sem internet): ficam guardados e vão depois.
const chavePendentes = (userId) => `routinxp:focos-pendentes:${userId}`
function lerPendentes(userId) {
  try {
    const lista = JSON.parse(localStorage.getItem(chavePendentes(userId)))
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}
function gravarPendentes(userId, lista) {
  try {
    localStorage.setItem(chavePendentes(userId), JSON.stringify(lista))
  } catch {
    /* sem armazenamento: o bloco se perde se a internet não voltar nesta aba */
  }
}

// Estado de categorias, tarefas, estatísticas e perfil do usuário, com atualizações otimistas.
export function useDados(userId) {
  const [perfil, setPerfil] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [tags, setTags] = useState([])
  const [fontes, setFontes] = useState([]) // calendários conectados (Integrações)
  const [colunas, setColunas] = useState([]) // colunas do Kanban
  const [tarefas, setTarefas] = useState([])
  const [focos, setFocos] = useState([]) // blocos de foco dos últimos 31 dias
  const [stats, setStats] = useState(null)
  const [estado, setEstado] = useState('carregando') // 'carregando' | 'pronto' | 'erro'
  const [aviso, setAviso] = useState(null) // { tipo: 'desfazer', tarefa } | { tipo: 'erro', texto }
  const [recem, setRecem] = useState(null) // id da tarefa concluída por último (para a animação)
  const exclusao = useRef(null) // { tarefa, timer }

  const aplicar = useCallback(([c, tf, s, p, tg, fo, co, fc]) => {
    // Blocos ainda não enviados aparecem desde já (vão ao banco em seguida).
    const pendentes = lerPendentes(userId).filter((b) => !fc.some((f) => f.id === b.id))
    setFocos([...fc, ...pendentes])
    setColunas(co)
    setCategorias(c)
    setTarefas(tf)
    setStats(s)
    setPerfil(p)
    setTags(tg)
    setFontes(fo)
    setEstado('pronto')
  }, [userId])
  const falhouCarregar = useCallback(() => setEstado('erro'), [])

  // "Tentar de novo": volta ao estado de carregamento e busca outra vez.
  const carregar = useCallback(() => {
    setEstado('carregando')
    buscarTudo().then(aplicar, falhouCarregar)
  }, [aplicar, falhouCarregar])

  // Busca de novo sem voltar ao estado "carregando" (depois de uma sincronização, por exemplo).
  const recarregar = useCallback(() => buscarTudo().then(aplicar, () => {}), [aplicar])

  useEffect(() => {
    let ativo = true
    buscarTudo().then(
      (dados) => ativo && aplicar(dados),
      () => ativo && falhouCarregar(),
    )
    return () => {
      ativo = false
    }
  }, [aplicar, falhouCarregar])

  // Se a tela fechar com uma exclusão pendente, ela é enviada na hora.
  useEffect(
    () => () => {
      const pendente = exclusao.current
      if (pendente) {
        clearTimeout(pendente.timer)
        api.excluirTarefa(pendente.tarefa.id).catch(() => {})
      }
    },
    [],
  )

  const fecharAviso = useCallback(() => setAviso(null), [])
  const falhar = (erro) => setAviso({ tipo: 'erro', texto: mensagemErroDados(erro) })

  async function salvarTarefa({ id, ...campos }) {
    let salva
    try {
      salva = id ? await api.atualizarTarefa(id, campos) : await api.criarTarefa(campos)
    } catch (erro) {
      // Criou a tarefa mas falhou ao ligar as tags: ela entra na lista (sem tags).
      if (erro?.tarefaSalva) setTarefas((ts) => [...ts, erro.tarefaSalva])
      throw erro
    }
    setTarefas((ts) => (id ? ts.map((x) => (x.id === id ? salva : x)) : [...ts, salva]))
    return salva
  }

  // Conclui no servidor, que calcula XP e streak. Devolve { xp, motivo, estatisticas }
  // (ou null se falhar). As estatísticas não entram aqui: a tela aplica depois que o
  // "+XP" chega ao contador, com aplicarEstatisticas.
  async function concluir(id) {
    const antes = tarefas.find((x) => x.id === id)
    if (!antes || antes.status === 'concluida') return null
    setRecem(id)
    setTarefas((ts) =>
      ts.map((x) =>
        x.id === id ? { ...x, status: 'concluida', completed_at: new Date().toISOString(), xp_value: null } : x,
      ),
    )
    try {
      const r = await api.concluirTarefa(id)
      // O servidor devolve a linha da tarefa, sem as tags: elas continuam as mesmas.
      setTarefas((ts) => ts.map((x) => (x.id === id ? { ...x, ...r.tarefa, tag_ids: x.tag_ids } : x)))
      const texto = mensagemDoGanho(r.xp_ganho, r.motivo)
      if (texto) setAviso({ tipo: 'info', texto })
      return { xp: r.xp_ganho, motivo: r.motivo, estatisticas: r.estatisticas }
    } catch (erro) {
      setTarefas((ts) => ts.map((x) => (x.id === id ? antes : x)))
      // Já concluída em outra aba/aparelho: recarrega em vez de mostrar erro.
      if (/tarefa_ja_concluida/.test(erro?.message ?? '')) carregar()
      else falhar(erro)
      return null
    }
  }

  function enviarExclusao(pendente) {
    clearTimeout(pendente.timer)
    api.excluirTarefa(pendente.tarefa.id).catch((erro) => {
      setTarefas((ts) => [...ts, pendente.tarefa].sort(porCriacao))
      falhar(erro)
    })
  }

  function excluir(id) {
    const tarefa = tarefas.find((x) => x.id === id)
    if (!tarefa) return
    if (exclusao.current) enviarExclusao(exclusao.current)
    setTarefas((ts) => ts.filter((x) => x.id !== id))
    const timer = setTimeout(() => {
      const pendente = exclusao.current
      exclusao.current = null
      if (pendente) enviarExclusao(pendente)
      setAviso((a) => (a?.tipo === 'desfazer' ? null : a))
    }, PRAZO_DESFAZER)
    exclusao.current = { tarefa, timer }
    setAviso({ tipo: 'desfazer', tarefa })
  }

  function desfazerExclusao() {
    const pendente = exclusao.current
    if (!pendente) return
    clearTimeout(pendente.timer)
    exclusao.current = null
    setTarefas((ts) => [...ts, pendente.tarefa].sort(porCriacao))
    setAviso(null)
  }

  async function salvarCategoria({ id, nome, cor }) {
    const salva = id ? await api.atualizarCategoria(id, { nome, cor }) : await api.criarCategoria({ nome, cor })
    setCategorias((cs) =>
      (id ? cs.map((c) => (c.id === id ? salva : c)) : [...cs, salva]).sort((a, b) => a.nome.localeCompare(b.nome)),
    )
    return salva
  }

  async function salvarTag({ id, nome, cor }) {
    const salva = id ? await api.atualizarTag(id, { nome, cor }) : await api.criarTag({ nome, cor })
    setTags((ts) => (id ? ts.map((x) => (x.id === id ? salva : x)) : [...ts, salva]).sort((a, b) => a.nome.localeCompare(b.nome)))
    return salva
  }

  // A tag sai também das tarefas (no banco, o vínculo é apagado em cascata).
  async function excluirTag(id) {
    await api.excluirTag(id)
    setTags((ts) => ts.filter((x) => x.id !== id))
    setTarefas((ts) => ts.map((x) => (x.tag_ids?.includes(id) ? { ...x, tag_ids: x.tag_ids.filter((g) => g !== id) } : x)))
  }

  const porPosicao = (a, b) => a.posicao - b.posicao

  async function salvarColuna({ id, ...campos }) {
    const salva = id ? await api.atualizarColuna(id, campos) : await api.criarColuna(campos)
    setColunas((cs) => (id ? cs.map((c) => (c.id === id ? salva : c)) : [...cs, salva]).sort(porPosicao))
    return salva
  }

  // Troca a posição de duas colunas do meio (setas "mover" da janela da coluna).
  async function trocarColunas(a, b) {
    const [salvaA, salvaB] = await Promise.all([
      api.atualizarColuna(a.id, { posicao: b.posicao }),
      api.atualizarColuna(b.id, { posicao: a.posicao }),
    ])
    setColunas((cs) => cs.map((c) => (c.id === a.id ? salvaA : c.id === b.id ? salvaB : c)).sort(porPosicao))
  }

  async function excluirColuna(id) {
    await api.excluirColuna(id)
    setColunas((cs) => cs.filter((c) => c.id !== id))
    setTarefas((ts) => ts.map((x) => (x.column_id === id ? { ...x, column_id: null } : x)))
  }

  // Arrastar entre colunas (menos Concluídas, que conclui): otimista, desfaz se falhar.
  async function moverParaColuna(id, colunaId) {
    const antes = tarefas.find((x) => x.id === id)
    if (!antes || antes.status !== 'pendente' || (antes.column_id ?? null) === colunaId) return
    setTarefas((ts) => ts.map((x) => (x.id === id ? { ...x, column_id: colunaId } : x)))
    try {
      await api.moverTarefaColuna(id, colunaId)
    } catch (erro) {
      setTarefas((ts) => ts.map((x) => (x.id === id ? antes : x)))
      falhar(erro)
    }
  }

  async function salvarFonte({ id, ...campos }) {
    const salva = id ? await api.atualizarFonte(id, campos) : await api.criarFonte(campos)
    setFontes((fs) => (id ? fs.map((f) => (f.id === id ? salva : f)) : [...fs, salva]))
    return salva
  }

  async function excluirFonte(id, apagarPendentes) {
    await api.excluirFonte(id, apagarPendentes)
    setFontes((fs) => fs.filter((f) => f.id !== id))
    if (apagarPendentes) await recarregar()
  }

  // Lê os calendários no servidor e traz as tarefas novas para a tela.
  async function sincronizarFontes(fonteId) {
    const r = await api.sincronizarFontes(fonteId)
    await recarregar()
    return r
  }

  // Bloco de foco completo (página Foco): aparece na hora e vai ao banco. Sem internet, fica
  // guardado no navegador e é reenviado quando os dados carregarem de novo.
  const enviarFoco = useCallback(
    async (bloco) => {
      try {
        await api.registrarFoco(bloco)
        gravarPendentes(userId, lerPendentes(userId).filter((b) => b.id !== bloco.id))
      } catch {
        const pendentes = lerPendentes(userId)
        if (!pendentes.some((b) => b.id === bloco.id)) gravarPendentes(userId, [...pendentes, bloco])
      }
    },
    [userId],
  )

  const registrarFoco = useCallback(
    (bloco) => {
      const completo = { ...bloco, concluida_em: new Date().toISOString() }
      setFocos((fs) => (fs.some((f) => f.id === bloco.id) ? fs : [...fs, completo]))
      return enviarFoco(completo)
    },
    [enviarFoco],
  )

  // Depois de carregar, reenvia o que ficou guardado.
  useEffect(() => {
    if (estado !== 'pronto') return
    lerPendentes(userId).forEach((bloco) => enviarFoco(bloco))
  }, [estado, userId, enviarFoco])

  async function salvarPerfil(campos) {
    const salvo = await api.salvarPerfil(campos, Boolean(perfil), userId)
    setPerfil(salvo)
    return salvo
  }

  async function excluirCategoria(id) {
    await api.excluirCategoria(id)
    setCategorias((cs) => cs.filter((c) => c.id !== id))
  }

  return {
    perfil,
    salvarPerfil,
    categorias,
    tags,
    salvarTag,
    excluirTag,
    colunas,
    salvarColuna,
    trocarColunas,
    excluirColuna,
    moverParaColuna,
    fontes,
    salvarFonte,
    excluirFonte,
    sincronizarFontes,
    previaFonte: api.previaFonte,
    tarefas,
    focos,
    registrarFoco,
    stats,
    estado,
    aviso,
    recem,
    carregar,
    fecharAviso,
    avisar: setAviso,
    aplicarEstatisticas: setStats,
    salvarTarefa,
    concluir,
    excluir,
    desfazerExclusao,
    salvarCategoria,
    excluirCategoria,
  }
}
