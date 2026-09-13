import { useCallback, useEffect, useState } from 'react'
import * as apiReal from './financeiro'
import * as apiPrevia from '../dev/previaFinanceiro'
import { emPrevia } from '../dev/previa'
import { hojeBrasilia } from './datas'
import { somarDias } from './gastosFixos'

const api = emPrevia ? apiPrevia : apiReal

// Janela das cobranças na página: vencidas dos últimos 60 dias até os próximos 31.
export const DIAS_ATRAS = 60
export const DIAS_A_FRENTE = 30

// Dados da página Gastos fixos: contas, categorias de despesa, os gastos fixos e os pagamentos
// ligados a eles na janela de cobranças.
export function useGastosFixos() {
  const [dados, setDados] = useState({ estado: 'carregando', contas: [], categorias: [], recorrencias: [], pagamentos: [] })
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
      .then(() => Promise.all([api.listarContasFin(), api.listarCategoriasFin(), api.listarRecorrencias(), api.listarPagamentos(inicio, fim)]))
      .then(
        ([contas, categorias, recorrencias, pagamentos]) =>
          ativo && setDados({ estado: 'pronto', contas, categorias, recorrencias, pagamentos }),
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
      const salva = await api.salvarRecorrencia(rec)
      setDados((d) => ({
        ...d,
        recorrencias: rec.id ? d.recorrencias.map((x) => (x.id === salva.id ? salva : x)) : [...d.recorrencias, salva],
      }))
      if (salva.tipo === 'parcelada') await recarregarPagamentos()
    },
    [recarregarPagamentos],
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
    return pagamento
  }, [])

  // Desfazer o pagamento apaga o lançamento que ele criou.
  const desfazerPagamento = useCallback(async (transacaoId) => {
    await api.excluirTransacaoFin(transacaoId)
    setDados((d) => ({ ...d, pagamentos: d.pagamentos.filter((x) => x.id !== transacaoId) }))
  }, [])

  return { ...dados, tentarDeNovo, salvar, excluir, pagar, desfazerPagamento }
}
