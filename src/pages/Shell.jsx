import { useCallback, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { useDados } from '../lib/useDados'
import { DadosContexto } from '../lib/dadosContexto'
import { MenuLateral } from '../components/MenuLateral'
import { TopBar } from '../components/TopBar'
import { LembreteStreak } from '../components/LembreteStreak'
import { IconeMais } from '../components/icones'
import { t } from '../i18n/pt-BR'
import './tarefas.css'
import './shell.css'

const CHAVE_MENU = 'routinxp:menu'

function lerMenuRecolhido() {
  try {
    return localStorage.getItem(CHAVE_MENU) === 'recolhido'
  } catch {
    return false
  }
}

// Casca do app logado: menu lateral + barra superior + lembrete + página atual.
// Os dados do usuário ficam aqui e são compartilhados pelas páginas (DadosContexto).
export default function Shell({ session }) {
  const d = useDados(session.user.id)
  const [recolhido, setRecolhido] = useState(lerMenuRecolhido)
  const [gavetaAberta, setGavetaAberta] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Trocar de página fecha a gaveta do celular.
  const [rota, setRota] = useState(location.pathname)
  if (rota !== location.pathname) {
    setRota(location.pathname)
    setGavetaAberta(false)
  }

  // Referência estável: o efeito da gaveta (foco e Esc) não deve rodar a cada render.
  const fecharGaveta = useCallback(() => setGavetaAberta(false), [])

  function alternarMenu() {
    setRecolhido((atual) => {
      const novo = !atual
      try {
        localStorage.setItem(CHAVE_MENU, novo ? 'recolhido' : 'aberto')
      } catch {
        /* sem armazenamento: vale só nesta sessão */
      }
      return novo
    })
  }

  // "Nova tarefa" funciona de qualquer página: leva para Tarefas e abre o formulário.
  const novaTarefa = () => navigate('/', { state: { novaTarefa: Date.now() } })

  return (
    <DadosContexto.Provider value={d}>
      <div className="shell" data-recolhido={recolhido}>
        <MenuLateral
          recolhido={recolhido}
          onAlternar={alternarMenu}
          gavetaAberta={gavetaAberta}
          onFecharGaveta={fecharGaveta}
          perfil={d.perfil}
          stats={d.stats}
          email={session.user.email}
        />
        <div className="shell__conteudo">
          <TopBar
            stats={d.stats}
            perfil={d.perfil}
            email={session.user.email}
            onNovaTarefa={novaTarefa}
            onAbrirMenu={() => setGavetaAberta(true)}
            gavetaAberta={gavetaAberta}
          />
          <LembreteStreak stats={d.stats} />
          <Outlet context={{ session }} />
          {/* No celular a barra não tem "Nova tarefa": o botão flutuante faz esse papel em
              todas as páginas (a de Tarefas tem o próprio, que abre o formulário ali mesmo). */}
          {location.pathname !== '/' && (
            <button type="button" className="fab" onClick={novaTarefa} aria-label={t.topo.novaTarefa}>
              <IconeMais />
            </button>
          )}
        </div>
      </div>
    </DadosContexto.Provider>
  )
}
