import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import * as apiReal from './financeiro'
import * as apiPrevia from '../dev/previaFinanceiro'
import { emPrevia } from '../dev/previa'
import { diaBrasilia, hojeBrasilia } from './datas'
import { somarDias, vencimentosProximos } from './gastosFixos'

const api = emPrevia ? apiPrevia : apiReal

// Atrasadas aparecem na faixa por até uma semana; depois disso ficam só em Gastos fixos.
const DIAS_ATRAS = 7
const VAZIO = { atrasadas: [], hoje: [], amanha: [] }

// Gastos fixos para pagar (atrasados, hoje e amanhã), para a faixa no topo do app. Recarrega ao
// entrar ou sair das páginas do Financeiro, onde os pagamentos mudam.
export function useVencimentos(ativo) {
  const location = useLocation()
  const chave = location.pathname.startsWith('/financeiro') ? location.pathname : 'fora'
  const [dados, setDados] = useState(VAZIO)

  useEffect(() => {
    if (!ativo) return undefined
    let vivo = true
    const hoje = hojeBrasilia()
    Promise.all([api.listarRecorrencias(), api.listarPagamentos(somarDias(hoje, -DIAS_ATRAS), somarDias(hoje, 1))])
      .then(([recorrencias, pagamentos]) => {
        if (vivo) setDados(vencimentosProximos(recorrencias, pagamentos, hoje, DIAS_ATRAS, (rec) => diaBrasilia(rec.created_at)))
      })
      // Sem conexão ou sem dados: a faixa só não aparece.
      .catch(() => {})
    return () => {
      vivo = false
    }
  }, [ativo, chave])

  return ativo ? dados : VAZIO
}
