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

const EVENTO = 'routinxp:pagamentos'

// Gastos fixos chama depois de pagar, desfazer ou ligar pagamentos: a faixa lê de novo.
export const avisarPagamentosMudaram = () => window.dispatchEvent(new Event(EVENTO))

// Gastos fixos para pagar (atrasados, hoje e amanhã), para a faixa no topo do app. Recarrega ao
// entrar ou sair das páginas do Financeiro, quando um pagamento muda e quando o dia vira.
export function useVencimentos(ativo) {
  const location = useLocation()
  const chave = location.pathname.startsWith('/financeiro') ? location.pathname : 'fora'
  const [dados, setDados] = useState(VAZIO)
  const [versao, setVersao] = useState(0)
  const hojeAgora = hojeBrasilia()

  useEffect(() => {
    const aoMudar = () => setVersao((n) => n + 1)
    window.addEventListener(EVENTO, aoMudar)
    return () => window.removeEventListener(EVENTO, aoMudar)
  }, [])

  useEffect(() => {
    if (!ativo) return undefined
    let vivo = true
    const hoje = hojeBrasilia()
    Promise.all([
      api.listarRecorrencias(),
      api.listarPagamentos(somarDias(hoje, -DIAS_ATRAS), somarDias(hoje, 1)),
      api.listarContasFin(),
      api.listarSaldosFin(),
    ])
      .then(([recorrencias, pagamentos, contas, saldos]) => {
        const porConta = Object.fromEntries(saldos.map((s) => [s.conta_id, s.saldo_centavos]))
        if (vivo)
          setDados(vencimentosProximos(recorrencias, pagamentos, hoje, DIAS_ATRAS, (rec) => diaBrasilia(rec.created_at), contas, porConta))
      })
      // Sem conexão ou sem dados: a faixa só não aparece.
      .catch(() => {})
    return () => {
      vivo = false
    }
  }, [ativo, chave, versao, hojeAgora])

  return ativo ? dados : VAZIO
}
