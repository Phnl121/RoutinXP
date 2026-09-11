import { NavLink, useLocation } from 'react-router'
import { IconeFechar, IconeRelogio } from './icones'
import { t } from '../i18n/pt-BR'

const p = t.prazosAviso

// Aviso no topo quando há tarefas para hoje ou atrasadas. Quem decide se aparece
// (e guarda a dispensa até amanhã) é a casca (Shell), que organiza a fila de avisos.
export function LembretePrazos({ paraHoje, atrasadas, onDispensar }) {
  const location = useLocation()
  return (
    <div className="lembrete lembrete--prazos" role="status">
      <IconeRelogio />
      <p>{p.texto(paraHoje, atrasadas)}</p>
      {location.pathname !== '/' && (
        <NavLink to="/" className="link-btn">
          {p.acao}
        </NavLink>
      )}
      <button type="button" className="lembrete__fechar" onClick={onDispensar} aria-label={p.dispensar}>
        <IconeFechar />
      </button>
    </div>
  )
}
