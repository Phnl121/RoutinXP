import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { useSession } from './lib/useSession'
import Entrar from './pages/Entrar'
import RedefinirSenha from './pages/RedefinirSenha'
import Tarefas from './pages/Tarefas'
import Shell from './pages/Shell'
import Perfil from './pages/Perfil'
import { t } from './i18n/pt-BR'
import { emPrevia, sessaoPrevia } from './dev/previa'

export default function App() {
  const real = useSession()
  const { recovery, clearRecovery } = real
  const session = emPrevia ? sessaoPrevia : real.session

  if (session === undefined) {
    return (
      <div className="carregando" aria-busy="true">
        <span className="label">{t.app.carregando}</span>
      </div>
    )
  }

  const destinoLogado = recovery ? '/redefinir-senha' : '/'

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/entrar" element={session ? <Navigate to={destinoLogado} replace /> : <Entrar />} />
        <Route
          path="/redefinir-senha"
          element={<RedefinirSenha session={session} aoConcluir={clearRecovery} />}
        />
        {/* Páginas do app logado, dentro da casca com menu lateral. */}
        <Route
          element={
            !session ? (
              <Navigate to="/entrar" replace />
            ) : recovery ? (
              <Navigate to="/redefinir-senha" replace />
            ) : (
              <Shell session={session} />
            )
          }
        >
          <Route path="/" element={<Tarefas />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
