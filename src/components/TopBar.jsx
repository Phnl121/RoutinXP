import { supabase } from '../lib/supabase'
import { calcularNivel } from '../lib/nivel'
import { iniciaisDoEmail } from '../lib/datas'
import { BadgeNivel, BarraXp } from './Progresso'
import { IconeMais } from './icones'
import { t } from '../i18n/pt-BR'

export function TopBar({ stats, email, onNovaTarefa }) {
  const info = calcularNivel(stats?.xp_total ?? 0)
  const streak = stats?.streak_atual ?? 0

  return (
    <header className="topo">
      <span className="wordmark">{t.app.nome}</span>

      {stats ? (
        <div className="topo__nivel" role="group" aria-label={t.topo.progresso}>
          <BadgeNivel nivel={info.nivel} />
          <div className="topo__xp">
            <BarraXp xpNoNivel={info.xpNoNivel} meta={info.meta} />
          </div>
          <div className="topo__streak">
            <span className="topo__streak-n">{t.topo.dias(streak)}</span>
            <span className="label">{t.topo.streak}</span>
          </div>
        </div>
      ) : (
        // Até as estatísticas chegarem: espaço reservado neutro, sem números falsos.
        <div className="topo__nivel topo__nivel--carregando" aria-busy="true" aria-label={t.topo.progresso}>
          <span className="topo__esqueleto" />
        </div>
      )}

      <div className="topo__acoes">
        <button type="button" className="btn btn--compacto topo__nova" onClick={onNovaTarefa}>
          <IconeMais />
          {t.topo.novaTarefa}
        </button>
        <button type="button" className="avatar avatar--btn" popoverTarget="menu-conta" aria-label={t.conta.menu}>
          {iniciaisDoEmail(email)}
        </button>
        <div id="menu-conta" popover="auto" className="menu">
          <p className="menu__email">{email}</p>
          <button type="button" className="menu__item" onClick={() => supabase.auth.signOut()}>
            {t.conta.sair}
          </button>
        </div>
      </div>
    </header>
  )
}
