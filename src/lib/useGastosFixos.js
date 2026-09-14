import { useCallback, useEffect, useRef, useState } from 'react'
import * as apiReal from './financeiro'
import * as apiPrevia from '../dev/previaFinanceiro'
import { emPrevia } from '../dev/previa'
import { hojeBrasilia } from './datas'
import { somarDias } from './gastosFixos'
import { andarMes, mesDe } from './dinheiro'
import { avisarPagamentosMudaram } from './useVencimentos'

const api = emPrevia ? apiPrevia : apiReal

// Janela das cobranças na página: vencidas dos últimos 60 dias até os próximos 31.
export const DIAS_ATRAS = 60
export const DIAS_A_FRENTE = 30

// Dados da página Gastos fixos: contas, categorias de despesa, os gastos fixos e os pagamentos
// ligados a eles na janela de cobranças.
export function useGastosFixos() {
  const [dados, setDados] = useState({
    estado: 'carregando',
    contas: [],
    categorias: [],
    recorrencias: [],
    pagamentos: [],
    historico: [],
    ignoradas: [],
    avisarVencimentos: true,
  })
  const [tentativa, setTentativa] = useState(0)

  const janela = () => {
    const hoje = hojeBrasilia()
    return [somarDias(hoje, -DIAS_ATRAS), somarDias(hoje, DIAS_A_FRENTE + 31)]
  }

  useEffect(() => {
    let ativo = true
    const [inicio, fim] = janela()
    api
      .prepararFinanceiro()
      .then(() => {
        const mes = mesDe(hojeBrasilia())
        return Promise.all([
          api.listarContasFin(),
          api.listarCategoriasFin(),
          api.listarRecorrencias(),
          api.listarPagamentos(inicio, fim),
          // Seis meses de lançamentos para detectar cobranças que se repetem (fase 5.5).
          api.listarTransacoesDosMeses(andarMes(mes, -5), mes).catch(() => []),
          api.lerPreferencias().catch(() => ({ sugestoes_ignoradas: [] })),
        ])
      })
      .then(
        ([contas, categorias, recorrencias, pagamentos, historico, preferencias]) =>
          ativo &&
          setDados({
            estado: 'pronto',
            contas,
            categorias,
            recorrencias,
            pagamentos,
            historico,
            ignoradas: preferencias.sugestoes_ignoradas ?? [],
            avisarVencimentos: preferencias.avisar_vencimentos ?? true,
          }),
        (erro) => ativo && setDados((d) => ({ ...d, estado: 'erro', erro })),
      )
    return () => {
      ativo = false
    }
  }, [tentativa])

  const tentarDeNovo = useCallback(() => {
    setDados((d) => ({ ...d, estado: 'carregando' }))
    setTentativa((n) => n + 1)
  }, [])

  const recarregarPagamentos = useCallback(async () => {
    const [inicio, fim] = janela()
    const pagamentos = await api.listarPagamentos(inicio, fim)
    setDados((d) => ({ ...d, pagamentos }))
  }, [])

  const salvar = useCallback(
    async (rec) => {
      const anterior = rec.id ? dados.recorrencias.find((x) => x.id === rec.id) : null
      const salva = await api.salvarRecorrencia(rec, anterior)
      setDados((d) => ({
        ...d,
        recorrencias: rec.id ? d.recorrencias.map((x) => (x.id === salva.id ? salva : x)) : [...d.recorrencias, salva],
      }))
      if (salva.tipo === 'parcelada') await recarregarPagamentos()
      return salva
    },
    [recarregarPagamentos, dados.recorrencias],
  )

  const excluir = useCallback(
    async (id) => {
      await api.excluirRecorrencia(id, hojeBrasilia())
      setDados((d) => ({ ...d, recorrencias: d.recorrencias.filter((x) => x.id !== id) }))
      await recarregarPagamentos()
    },
    [recarregarPagamentos],
  )

  const pagar = useCallback(async (cobranca) => {
    const pagamento = await api.pagarCobranca(cobranca)
    setDados((d) => ({ ...d, pagamentos: [...d.pagamentos, pagamento] }))
    avisarPagamentosMudaram()
    return pagamento
  }, [])

  // Desfazer o pagamento apaga o lançamento que ele criou.
  const desfazerPagamento = useCallback(async (transacaoId) => {
    await api.excluirTransacaoFin(transacaoId)
    setDados((d) => ({ ...d, pagamentos: d.pagamentos.filter((x) => x.id !== transacaoId) }))
    avisarPagamentosMudaram()
  }, [])

  // Sugestão aceita: cadastra e liga os lançamentos antigos como pagamentos das cobranças.
  // Se ligar falhar, tentar de novo só refaz a ligação (o gasto fixo já foi cadastrado).
  const sugestoesSalvas = useRef(new Map()) // chave da sugestão → gasto fixo salvo
  const cadastrarSugestao = useCallback(
    async (rec, sugestao) => {
      let salva = sugestoesSalvas.current.get(sugestao.chave)
      if (!salva) {
        salva = await salvar(rec)
        sugestoesSalvas.current.set(sugestao.chave, salva)
      }
      await api.vincularPagamentos(salva.id, sugestao.ocorrencias)
      avisarPagamentosMudaram()
      const ids = new Set(sugestao.ocorrencias.map((o) => o.id))
      setDados((d) => ({
        ...d,
        historico: d.historico.map((x) => (ids.has(x.id) ? { ...x, recorrencia_id: salva.id } : x)),
      }))
      await recarregarPagamentos()
    },
    [salvar, recarregarPagamentos],
  )

  // Some na hora; se não gravar, volta e o erro sobe para a página avisar.
  const ignorarSugestao = useCallback(async (chave) => {
    setDados((d) => ({ ...d, ignoradas: [...d.ignoradas, chave] }))
    try {
      const lista = await api.ignorarSugestao(chave)
      setDados((d) => ({ ...d, ignoradas: lista }))
    } catch (erro) {
      setDados((d) => ({ ...d, ignoradas: d.ignoradas.filter((x) => x !== chave) }))
      throw erro
    }
  }, [])

  const mudarAvisoVencimentos = useCallback(async (ligado) => {
    setDados((d) => ({ ...d, avisarVencimentos: ligado }))
    try {
      await api.salvarAvisoVencimentos(ligado)
    } catch (erro) {
      setDados((d) => ({ ...d, avisarVencimentos: !ligado }))
      throw erro
    }
  }, [])

  return { ...dados, tentarDeNovo, salvar, excluir, pagar, desfazerPagamento, cadastrarSugestao, ignorarSugestao, mudarAvisoVencimentos }
}
