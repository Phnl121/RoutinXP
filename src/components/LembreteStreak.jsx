import { NavLink, useLocation } from 'react-router'
import { IconeFechar, IconeRelogio } from './icones'
import { t } from '../i18n/pt-BR'

// Lembrete neutro quando a sequência está por um fio: streak acima de zero e
// nenhuma conclusão hoje (Brasília). Sem cor de alarme. Pode ser dispensado até amanhã.
// Quem decide se aparece é a casca (Shell), que também organiza a fila de avisos.
export function LembreteStreak({ stats, onDispensar }) {
  const location = useLocation()
  return (
    <div className="lembrete" role="status">
      <IconeRelogio />
      <p>{t.lembrete.texto(stats.streak_atual)}</p>
      {location.pathname !== '/' && (
        <NavLink to="/" className="link-btn">
          {t.lembrete.acao}
        </NavLink>
      )}
      <button type="button" className="lembrete__fechar" onClick={onDispensar} aria-label={t.lembrete.dispensar}>
        <IconeFechar />
      </button>
    </div>
  )
}
