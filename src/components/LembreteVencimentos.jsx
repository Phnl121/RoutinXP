import { NavLink, useLocation } from 'react-router'
import { IconeFechar, IconeRepetir } from './icones'
import { formatarReais } from '../lib/dinheiro'
import { t } from '../i18n/pt-BR'

const v = t.vencimentosAviso

// Faixa no topo com os gastos fixos para pagar ("Conta de luz vence amanhã"). Quem decide se
// aparece (e guarda a dispensa até amanhã) é a casca (Shell), que organiza a fila de avisos.
export function LembreteVencimentos({ atrasadas, hoje, amanha, onDispensar }) {
  const location = useLocation()
  const todas = [...atrasadas, ...hoje, ...amanha]
  let texto
  if (todas.length === 1) {
    const [c] = todas
    const quando = atrasadas.length ? 'atrasada' : hoje.length ? 'hoje' : 'amanha'
    texto = c.rec.fatura
      ? v.fatura(c.rec.nome, hoje.length ? 'hoje' : 'amanha', formatarReais(c.rec.valor_centavos))
      : v.um(c.rec.nome, quando, formatarReais(c.rec.valor_centavos), c.rec.valor_variavel)
  } else {
    texto = v.varios(atrasadas.length, hoje.length, amanha.length, formatarReais(todas.reduce((soma, c) => soma + c.rec.valor_centavos, 0)))
  }
  // Só faturas: o lugar delas é Lançamentos (contas e cartões).
  const destino = todas.every((c) => c.rec.fatura) ? '/financeiro' : '/financeiro/gastos-fixos'
  return (
    <div className="lembrete lembrete--vencimentos" data-atrasada={atrasadas.length > 0} role="status">
      <IconeRepetir />
      <p>{texto}</p>
      {location.pathname !== destino && (
        <NavLink to={destino} className="link-btn">
          {destino === '/financeiro' ? v.acaoFatura : v.acao}
        </NavLink>
      )}
      <button type="button" className="lembrete__fechar" onClick={onDispensar} aria-label={v.dispensar}>
        <IconeFechar />
      </button>
    </div>
  )
}
