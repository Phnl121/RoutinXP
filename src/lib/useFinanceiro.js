import { useCallback, useEffect, useRef, useState } from 'react'
import * as apiReal from './financeiro'
import * as apiPrevia from '../dev/previaFinanceiro'
import { emPrevia } from '../dev/previa'
import { andarMes } from './dinheiro'

// Em /financeiro?previa (só em desenvolvimento) os dados vêm de uma fixture em memória.
const api = import.meta.env.DEV && emPrevia ? apiPrevia : apiReal

// Tempo para desfazer a exclusão de um lançamento antes de ela ir para o banco.
const PRAZO_DESFAZER = 5000

// Meses buscados de uma vez: o da tela e os anteriores, para o resumo e a evolução.
export const MESES_DO_RESUMO = 6
const lerJanela = (mes) => api.listarTransacoesDosMeses(andarMes(mes, -(MESES_DO_RESUMO - 1)), mes)

// Dados do Financeiro para um mês: contas, saldos, categorias e os lançamentos do mês.
// Carrega só quando a página abre (não fica na casca, como os dados das tarefas).
export function useFinanceiro(mes) {
  const [base, setBase] = useState({
    estado: 'carregando',
    contas: [],
    categorias: [],
    saldos: {},
    recorrencias: [],
    conexoes: [],
    regras: [],
  })
  const [doMes, setDoMes] = useState({ mes: null, transacoes: [] })
  const [ocultas, setOcultas] = useState([]) // ids com exclusão aguardando o Desfazer
  const [tentativa, setTentativa] = useState(0)
  const exclusoes = useRef(new Map()) // id → timer

  const lerSaldos = async () => Object.fromEntries((await api.listarSaldosFin()).map((s) => [s.conta_id, s.saldo_centavos]))
  // Gastos fixos e conexões só alimentam partes da página: se falharem, o resto carrega.
  const lerBase = async () => {
    const [contas, categorias, saldos, recorrencias, conexoes, regras, preferencias, orcamentos] = await Promise.all([
      api.listarContasFin(),
      api.listarCategoriasFin(),
      lerSaldos(),
      api.listarRecorrencias().catch(() => []),
      api.listarConexoes().catch(() => []),
      api.listarRegras().catch(() => []),
      api.lerPreferencias().catch(() => ({ sugestoes_ignoradas: [] })),
      api.listarOrcamentos().catch(() => []),
    ])
    return {
      contas,
      categorias,
      saldos,
      recorrencias,
      conexoes,
      regras,
      preferencias,
      orcamentos,
      ignoradas: preferencias.sugestoes_ignoradas ?? [],
    }
  }

  // Primeira carga: categorias iniciais, depois contas, categorias e saldos.
  useEffect(() => {
    let ativo = true
    api
      .prepararFinanceiro()
      .then(() => api.lancarCobrancasCartao().catch(() => 0))
      // Primeira visita: dicionário inicial de regras e, se criou, aplica logo.
      .then(() =>
        api
          .prepararRegras()
          .then((criadas) => (criadas > 0 ? api.aplicarRegras() : 0))
          .catch(() => 0),
      )
      .then(lerBase)
      .then(
        (dados) => ativo && setBase({ estado: 'pronto', ...dados }),
        (erro) => ativo && setBase((b) => ({ ...b, estado: 'erro', erro })),
      )
    return () => {
      ativo = false
    }
  }, [tentativa])

  // Lançamentos do mês escolhido e dos anteriores do resumo.
  useEffect(() => {
    let ativo = true
    lerJanela(mes).then(
      (transacoes) => ativo && setDoMes({ mes, transacoes }),
      (erro) => ativo && setDoMes({ mes, transacoes: [], erro }),
    )
    return () => {
      ativo = false
    }
  }, [mes, tentativa])

  // Enquanto o Desfazer está no ar, a exclusão ainda não foi feita: ao sair da página, grava.
  useEffect(() => {
    const pendentes = exclusoes.current
    return () => {
      for (const [id, timer] of pendentes) {
        clearTimeout(timer)
        api.excluirTransacaoFin(id).catch(() => {})
      }
    }
  }, [])

  const tentarDeNovo = useCallback(() => {
    setBase((b) => ({ ...b, estado: 'carregando' }))
    setTentativa((n) => n + 1)
  }, [])

  // Depois de gravar: saldos e lançamentos do mês voltam do banco (fonte da verdade).
  const atualizar = useCallback(async () => {
    const [saldos, transacoes] = await Promise.all([lerSaldos(), lerJanela(mes)])
    setBase((b) => ({ ...b, saldos }))
    setDoMes({ mes, transacoes })
  }, [mes])

  const salvarTransacao = useCallback(
    async (transacao) => {
      await api.salvarTransacaoFin(transacao)
      await atualizar()
    },
    [atualizar],
  )

  // Some da lista na hora; vai para o banco depois do prazo, a menos que venha o Desfazer.
  const excluirTransacao = useCallback(
    (id, aoFalhar) => {
      setOcultas((lista) => [...lista, id])
      const timer = setTimeout(async () => {
        exclusoes.current.delete(id)
        try {
          await api.excluirTransacaoFin(id)
          await atualizar()
        } catch (erro) {
          // Não saiu do banco: a linha volta e a tela avisa.
          aoFalhar?.(erro)
        } finally {
          setOcultas((lista) => lista.filter((x) => x !== id))
        }
      }, PRAZO_DESFAZER)
      exclusoes.current.set(id, timer)
    },
    [atualizar],
  )

  const desfazerExclusao = useCallback((id) => {
    clearTimeout(exclusoes.current.get(id))
    exclusoes.current.delete(id)
    setOcultas((lista) => lista.filter((x) => x !== id))
  }, [])

  const salvarConta = useCallback(async (conta) => {
    const salva = await api.salvarContaFin(conta)
    const saldos = await lerSaldos()
    setBase((b) => ({
      ...b,
      saldos,
      contas: conta.id ? b.contas.map((c) => (c.id === salva.id ? salva : c)) : [...b.contas, salva],
    }))
  }, [])

  const excluirConta = useCallback(async (id) => {
    await api.excluirContaFin(id)
    setBase((b) => ({ ...b, contas: b.contas.filter((c) => c.id !== id) }))
  }, [])

  const salvarCategoria = useCallback(async (categoria) => {
    const salva = await api.salvarCategoriaFin(categoria)
    setBase((b) => ({
      ...b,
      categorias: categoria.id ? b.categorias.map((c) => (c.id === salva.id ? salva : c)) : [...b.categorias, salva],
    }))
    return salva
  }, [])

  const excluirCategoria = useCallback(
    async (id) => {
      await api.excluirCategoriaFin(id)
      setBase((b) => ({ ...b, categorias: b.categorias.filter((c) => c.id !== id) }))
      await atualizar()
    },
    [atualizar],
  )

  // Tudo de novo, sem voltar para "carregando" (depois de ler o banco ou juntar contas).
  const recarregar = useCallback(async () => {
    const [dados, transacoes] = await Promise.all([lerBase(), lerJanela(mes)])
    setBase((b) => ({ ...b, ...dados }))
    setDoMes({ mes, transacoes })
  }, [mes])

  // Open Finance (fase 4).
  const lerBancos = useCallback(
    async (modo) => {
      const resumo = await api.lerBancos(modo)
      await recarregar()
      return resumo
    },
    [recarregar],
  )
  const desconectarBanco = useCallback(
    async (conexao, apagar) => {
      await api.desconectarBanco(conexao, apagar)
      await recarregar()
    },
    [recarregar],
  )
  const juntarContas = useCallback(
    async (importadaId, manualId) => {
      await api.juntarContas(importadaId, manualId)
      await recarregar()
    },
    [recarregar],
  )
  const resolverDuplicata = useCallback(
    async (transacao, manual, juntar) => {
      await api.resolverDuplicata(transacao, manual, juntar)
      await recarregar()
    },
    [recarregar],
  )

  // Regras (fase 5).
  const salvarRegra = useCallback(
    async (regra) => {
      await api.salvarRegra(regra)
      const mudaram = await api.aplicarRegras()
      await recarregar()
      return mudaram
    },
    [recarregar],
  )
  const excluirRegra = useCallback(async (id) => {
    await api.excluirRegra(id)
    setBase((b) => ({ ...b, regras: b.regras.filter((x) => x.id !== id) }))
  }, [])
  const aplicarRegras = useCallback(async () => {
    const mudaram = await api.aplicarRegras()
    await recarregar()
    return mudaram
  }, [recarregar])
  const categorizar = useCallback(async (id, categoriaId) => {
    await api.categorizarTransacao(id, categoriaId)
    setDoMes((m) => ({
      ...m,
      transacoes: m.transacoes.map((x) => (x.id === id ? { ...x, categoria_id: categoriaId, categoria_origem: 'manual' } : x)),
    }))
  }, [])

  // Orçamento e meta (fase 6).
  const salvarOrcamentos = useCallback(async (limites) => {
    await api.salvarOrcamentos(limites)
    setBase((b) => ({ ...b, orcamentos: limites }))
  }, [])
  const salvarMeta = useCallback(async (meta) => {
    await api.salvarMeta(meta)
    setBase((b) => ({ ...b, preferencias: { ...b.preferencias, ...meta } }))
  }, [])

  const carregandoMes = doMes.mes !== mes
  const janela = carregandoMes ? [] : doMes.transacoes.filter((x) => !ocultas.includes(x.id))
  return {
    estado: base.estado,
    contas: base.contas,
    categorias: base.categorias,
    saldos: base.saldos,
    recorrencias: base.recorrencias,
    conexoes: base.conexoes,
    regras: base.regras,
    ignoradas: base.ignoradas ?? [],
    preferencias: base.preferencias ?? {},
    orcamentos: base.orcamentos ?? [],
    salvarOrcamentos,
    salvarMeta,
    salvarRegra,
    excluirRegra,
    aplicarRegras,
    categorizar,
    lerBancos,
    desconectarBanco,
    juntarContas,
    resolverDuplicata,
    // Lançamentos do mês na tela; `historico` traz também os meses anteriores do resumo.
    transacoes: janela.filter((x) => x.data.startsWith(mes)),
    historico: janela,
    carregandoMes,
    erroMes: carregandoMes ? null : doMes.erro,
    tentarDeNovo,
    salvarTransacao,
    excluirTransacao,
    desfazerExclusao,
    salvarConta,
    excluirConta,
    salvarCategoria,
    excluirCategoria,
  }
}
