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

const buscarTudo = () => Promise.all([api.listarCategorias(), api.listarTarefas(), api.lerEstatisticas()])

// Estado de categorias, tarefas e estatísticas do usuário, com atualizações otimistas.
export function useDados() {
  const [categorias, setCategorias] = useState([])
  const [tarefas, setTarefas] = useState([])
  const [stats, setStats] = useState(null)
  const [estado, setEstado] = useState('carregando') // 'carregando' | 'pronto' | 'erro'
  const [aviso, setAviso] = useState(null) // { tipo: 'desfazer', tarefa } | { tipo: 'erro', texto }
  const [recem, setRecem] = useState(null) // id da tarefa concluída por último (para a animação)
  const exclusao = useRef(null) // { tarefa, timer }

  const aplicar = useCallback(([c, tf, s]) => {
    setCategorias(c)
    setTarefas(tf)
    setStats(s)
    setEstado('pronto')
  }, [])
  const falhouCarregar = useCallback(() => setEstado('erro'), [])

  // "Tentar de novo": volta ao estado de carregamento e busca outra vez.
  const carregar = useCallback(() => {
    setEstado('carregando')
    buscarTudo().then(aplicar, falhouCarregar)
  }, [aplicar, falhouCarregar])

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
    const salva = id ? await api.atualizarTarefa(id, campos) : await api.criarTarefa(campos)
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
      setTarefas((ts) => ts.map((x) => (x.id === id ? r.tarefa : x)))
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

  async function excluirCategoria(id) {
    await api.excluirCategoria(id)
    setCategorias((cs) => cs.filter((c) => c.id !== id))
  }

  return {
    categorias,
    tarefas,
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
