import { Link, useLocation } from 'react-router'
import { supabase } from '../lib/supabase'
import { iniciaisDoPerfil } from '../lib/datas'
import { nomeCompleto } from '../lib/perfil'
import { formatarTempo, restanteDe, useAgora, useFocoApp } from '../lib/foco'
import { BadgeNivel, BarraXp } from './Progresso'
import { useMedidorNivel } from '../lib/useMedidorNivel'
import { IconeFoco, IconeLua, IconeMenu, IconePausa, IconePlay, IconeSol } from './icones'
import { useTema } from '../lib/tema'
import { Logo } from './Logo'
import { t } from '../i18n/pt-BR'

// Barra superior do app: botão do menu (celular), logo (celular), medidor de nível
// (sempre no centro) e menu da conta. No desktop a logo fica no menu lateral.
// "Nova tarefa" fica no título da página de Tarefas (e no botão flutuante no celular).
// Sessão de foco em andamento, fora da página Foco: um atalho com o tempo que falta.
function ChipFoco({ estado }) {
  const agora = useAgora(estado.rodando, 1000)
  const restante = restanteDe(estado, agora)
  // Parado, o chip diz por quê: a fase acabou e a próxima espera ("Hora da pausa",
  // "Próximo foco") ou pausado no meio.
  const aguardando = Boolean(estado.aguardando) && !estado.rodando
  const fase = t.foco.fases[estado.fase]
  const rotulo = aguardando
    ? estado.fase === 'foco'
      ? t.foco.proximo
      : t.foco.horaDa[estado.fase]
    : estado.rodando
      ? fase
      : `${fase} ${t.foco.pausado}`
  const tempo = formatarTempo(restante)
  return (
    <Link
      to="/foco"
      className="topo__foco"
      data-pausado={!estado.rodando && !aguardando}
      data-aguardando={aguardando}
      aria-label={t.foco.chipRotulo(rotulo, tempo)}
    >
      {/* Correndo: cronômetro; esperando o usuário começar: play; pausado: pausa. */}
      {estado.rodando ? <IconeFoco /> : aguardando ? <IconePlay /> : <IconePausa />}
      <span>{t.foco.chip(rotulo, tempo)}</span>
    </Link>
  )
}

export function TopBar({ stats, perfil, email, onAbrirMenu, gavetaAberta }) {
  const medidor = useMedidorNivel(stats?.xp_total ?? 0, Boolean(stats))
  const streak = stats?.streak_atual ?? 0
  const foco = useFocoApp()
  const { pathname } = useLocation()
  const focoFora = foco && foco.estado.fase !== 'parado' && pathname !== '/foco'
  const [, tema, mudarTema] = useTema()

  return (
    <header className="topo" data-foco={Boolean(focoFora)}>
      {focoFora && <ChipFoco estado={foco.estado} />}
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
          {/* Um toque troca entre claro e escuro (Bege e Sistema ficam no Perfil). */}
          <button type="button" className="menu__item menu__item--icone" onClick={() => mudarTema(tema === 'escuro' ? 'claro' : 'escuro')}>
            {tema === 'escuro' ? <IconeSol /> : <IconeLua />}
            {tema === 'escuro' ? t.conta.temaClaro : t.conta.temaEscuro}
          </button>
          <button type="button" className="menu__item" onClick={() => supabase.auth.signOut()}>
            {t.conta.sair}
          </button>
        </div>
      </div>
    </header>
  )
}
