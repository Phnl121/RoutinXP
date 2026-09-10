import { supabase } from '../lib/supabase'
import { iniciaisDoPerfil } from '../lib/datas'
import { nomeCompleto } from '../lib/perfil'
import { BadgeNivel, BarraXp } from './Progresso'
import { useMedidorNivel } from '../lib/useMedidorNivel'
import { IconeMenu } from './icones'
import { Logo } from './Logo'
import { t } from '../i18n/pt-BR'

// Barra superior do app: botão do menu (celular), logo (celular), medidor de nível
// (sempre no centro) e menu da conta. No desktop a logo fica no menu lateral.
// "Nova tarefa" fica no título da página de Tarefas (e no botão flutuante no celular).
export function TopBar({ stats, perfil, email, onAbrirMenu, gavetaAberta }) {
  const medidor = useMedidorNivel(stats?.xp_total ?? 0, Boolean(stats))
  const streak = stats?.streak_atual ?? 0

  return (
    <header className="topo">
      <button
        type="button"
        className="topo__menu"
        onClick={onAbrirMenu}
        aria-label={t.menu.abrir}
        aria-expanded={gavetaAberta}
        aria-controls="menu-lateral"
      >
        <IconeMenu />
      </button>
      <Logo className="topo__logo" />

      {stats ? (
        <div className="topo__nivel" role="group" aria-label={t.topo.progresso}>
          <BadgeNivel nivel={medidor.nivel} animar={medidor.animar} />
          <div className="topo__xp">
            <BarraXp xpNoNivel={medidor.xpNoNivel} meta={medidor.meta} instantaneo={medidor.instantaneo} />
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
        <button type="button" className="avatar avatar--btn" popoverTarget="menu-conta" aria-label={t.conta.menu}>
          {iniciaisDoPerfil(perfil, email)}
        </button>
        <div id="menu-conta" popover="auto" className="menu">
          {perfil && <p className="menu__nome">{nomeCompleto(perfil)}</p>}
          <p className="menu__email">{email}</p>
          <button type="button" className="menu__item" onClick={() => supabase.auth.signOut()}>
            {t.conta.sair}
          </button>
        </div>
      </div>
    </header>
  )
}
