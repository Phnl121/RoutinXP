import { supabase } from '../lib/supabase'
import { t } from '../i18n/pt-BR'

// Provisório até a etapa 9 (lista de tarefas): confirma que o login funcionou.
export default function Inicio({ session }) {
  return (
    <>
      <header className="topbar">
        <span className="wordmark">{t.app.nome}</span>
        <button type="button" className="link-btn" onClick={() => supabase.auth.signOut()}>
          {t.app.sair}
        </button>
      </header>
      <main className="inicio">
        <h1 className="auth__title">{t.inicio.titulo}</h1>
        <p className="auth__text">{t.inicio.texto(session.user.email)}</p>
      </main>
    </>
  )
}
