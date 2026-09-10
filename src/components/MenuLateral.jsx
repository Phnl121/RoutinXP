import { useEffect } from 'react'
import { NavLink } from 'react-router'
import { Logo } from './Logo'
import { IconeFechar, IconeGrafico, IconeLista, IconeMenuLateral, IconePessoa } from './icones'
import { calcularNivel } from '../lib/nivel'
import { iniciaisDoPerfil } from '../lib/datas'
import { nomeCompleto } from '../lib/perfil'
import { t } from '../i18n/pt-BR'

const m = t.menu
const ITENS = [
  { para: '/', rotulo: m.tarefas, Icone: IconeLista },
  { para: '/painel', rotulo: m.painel, Icone: IconeGrafico },
  { para: '/perfil', rotulo: m.perfil, Icone: IconePessoa },
]

// Menu lateral fixo e retrátil (como o do app do Claude). Desktop: expandido ou em trilho
// de ícones. Celular: gaveta sobre a página, aberta pelo botão da barra superior.
export function MenuLateral({ recolhido, onAlternar, gavetaAberta, onFecharGaveta, perfil, stats, email }) {
  // Gaveta aberta: foco vai para dentro dela e Esc fecha. Ao fechar, o foco volta
  // para o botão que abriu.
  useEffect(() => {
    if (!gavetaAberta) return undefined
    document.querySelector('.menu-lateral__fechar')?.focus()
    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') onFecharGaveta()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => {
      window.removeEventListener('keydown', aoTeclar)
      document.querySelector('.topo__menu')?.focus()
    }
  }, [gavetaAberta, onFecharGaveta])

  const nivel = calcularNivel(stats?.xp_total ?? 0).nivel

  return (
    <>
      {gavetaAberta && <div className="menu-lateral__fundo" onClick={onFecharGaveta} aria-hidden="true" />}
      <aside id="menu-lateral" className="menu-lateral" data-recolhido={recolhido} data-gaveta={gavetaAberta} aria-label={m.rotulo}>
        <div className="menu-lateral__topo">
          <Logo className="menu-lateral__logo" />
          <img className="menu-lateral__icone" src="/marca/routinxp-icone.svg" alt={t.app.nome} width="32" height="32" />
          <button
            type="button"
            className="menu-lateral__botao menu-lateral__alternar"
            onClick={onAlternar}
            aria-label={recolhido ? m.expandir : m.recolher}
            aria-expanded={!recolhido}
            title={recolhido ? m.expandir : m.recolher}
          >
            <IconeMenuLateral />
          </button>
          <button type="button" className="menu-lateral__botao menu-lateral__fechar" onClick={onFecharGaveta} aria-label={m.fechar}>
            <IconeFechar />
          </button>
        </div>

        <nav className="menu-lateral__nav">
          {ITENS.map(({ para, rotulo, Icone }) => (
            <NavLink key={para} to={para} end={para === '/'} className="menu-lateral__item" title={recolhido ? rotulo : undefined}>
              <Icone />
              <span className="menu-lateral__texto">{rotulo}</span>
            </NavLink>
          ))}
        </nav>

        <NavLink to="/perfil" className="menu-lateral__usuario" title={recolhido ? nomeCompleto(perfil) ?? m.completarPerfil : undefined}>
          <span className="avatar" aria-hidden="true">
            {iniciaisDoPerfil(perfil, email)}
          </span>
          <span className="menu-lateral__texto menu-lateral__quem">
            <span className="menu-lateral__nome">{nomeCompleto(perfil) ?? m.completarPerfil}</span>
            <span className="menu-lateral__nivel">{t.nivel.rotulo(nivel)}</span>
          </span>
        </NavLink>
      </aside>
    </>
  )
}
