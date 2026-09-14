import { useEffect } from 'react'
import { NavLink } from 'react-router'
import { Logo } from './Logo'
import { IconeBaixar, IconeCalendario, IconeCarteira, IconeRepetir, IconeRosca, IconeEscudo, IconeEtiqueta, IconeFechar, IconeFoco, IconeGrafico, IconeLista, IconeMenuLateral, IconePessoa } from './icones'
import { calcularNivel } from '../lib/nivel'
import { rotaPermitida, useConta } from '../lib/conta'
import { iniciaisDoPerfil } from '../lib/datas'
import { nomeCompleto } from '../lib/perfil'
import { t } from '../i18n/pt-BR'

const m = t.menu
// Páginas em seções: o dia a dia no alto, o que se configura de vez em quando embaixo.
const SECOES = [
  {
    id: 'rotina',
    titulo: m.secoes.rotina,
    itens: [
      { para: '/', rotulo: m.tarefas, Icone: IconeLista },
      { para: '/foco', rotulo: m.foco, Icone: IconeFoco },
      { para: '/painel', rotulo: m.painel, Icone: IconeGrafico },
    ],
  },
  {
    id: 'financas',
    titulo: m.secoes.financas,
    itens: [
      { para: '/financeiro', rotulo: m.financeiro, Icone: IconeCarteira },
      { para: '/financeiro/controle', rotulo: m.controle, Icone: IconeRosca },
      { para: '/financeiro/gastos-fixos', rotulo: m.gastosFixos, Icone: IconeRepetir },
    ],
  },
  {
    id: 'organizacao',
    titulo: m.secoes.organizacao,
    itens: [
      { para: '/categorias', rotulo: t.categoriasPagina.titulo, Icone: IconeEtiqueta },
      { para: '/integracoes', rotulo: t.integracoes.titulo, Icone: IconeCalendario },
    ],
  },
  {
    id: 'conta',
    titulo: m.secoes.conta,
    itens: [
      { para: '/perfil', rotulo: m.perfil, Icone: IconePessoa },
      { para: '/admin', rotulo: m.admin, Icone: IconeEscudo },
    ],
  },
]

// Menu lateral fixo e retrátil (como o do app do Claude). Desktop: expandido ou em trilho
// de ícones. Celular: gaveta sobre a página, aberta pelo botão da barra superior.
export function MenuLateral({ recolhido, onAlternar, gavetaAberta, onFecharGaveta, perfil, stats, email, onInstalar }) {
  // Gaveta aberta: foco vai para dentro dela, fica preso nela (Tab e Shift+Tab dão a volta)
  // e Esc fecha. Ao fechar, o foco volta para o botão que abriu.
  useEffect(() => {
    if (!gavetaAberta) return undefined
    document.querySelector('.menu-lateral__fechar')?.focus()
    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') {
        onFecharGaveta()
        return
      }
      if (evento.key !== 'Tab') return
      const gaveta = document.getElementById('menu-lateral')
      if (!gaveta) return
      // Só os focáveis visíveis: o botão de recolher fica escondido no celular.
      const focaveis = [...gaveta.querySelectorAll('a[href], button:not(:disabled)')].filter((el) => el.getClientRects().length > 0)
      if (!focaveis.length) return
      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]
      const ativo = document.activeElement
      if (evento.shiftKey && (ativo === primeiro || !gaveta.contains(ativo))) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && (ativo === ultimo || !gaveta.contains(ativo))) {
        evento.preventDefault()
        primeiro.focus()
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => {
      window.removeEventListener('keydown', aoTeclar)
      document.querySelector('.topo__menu')?.focus()
    }
  }, [gavetaAberta, onFecharGaveta])

  const nivel = calcularNivel(stats?.xp_total ?? 0).nivel
  // Só as páginas que a conta tem (funções liberadas; Administração só para administradores).
  const conta = useConta()
  const secoes = SECOES.map((secao) => ({ ...secao, itens: secao.itens.filter((item) => rotaPermitida(conta, item.para)) })).filter(
    (secao) => secao.itens.length,
  )

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
          {secoes.map(({ id, titulo, itens }) => (
            <div key={id} className="menu-lateral__secao" role="group" aria-labelledby={`menu-secao-${id}`}>
              {/* Recolhido, o título some e um fio separa as seções. */}
              <span id={`menu-secao-${id}`} className="menu-lateral__titulo">
                {titulo}
              </span>
              {itens.map(({ para, rotulo, Icone }) => (
                <NavLink key={para} to={para} end={para === '/' || para === '/financeiro'} className="menu-lateral__item" title={recolhido ? rotulo : undefined}>
                  <Icone />
                  <span className="menu-lateral__texto">{rotulo}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {onInstalar && (
          <button type="button" className="menu-lateral__item menu-lateral__instalar" onClick={onInstalar} title={recolhido ? t.instalar.menu : undefined}>
            <IconeBaixar />
            <span className="menu-lateral__texto">{t.instalar.menu}</span>
          </button>
        )}

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
