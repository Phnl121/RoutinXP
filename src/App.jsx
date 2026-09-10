import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { useSession } from './lib/useSession'
import Entrar from './pages/Entrar'
import RedefinirSenha from './pages/RedefinirSenha'
import Inicio from './pages/Inicio'
import { t } from './i18n/pt-BR'

export default function App() {
  const { session, recovery, clearRecovery } = useSession()

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
        <Route
          path="/"
          element={
            !session ? (
              <Navigate to="/entrar" replace />
            ) : recovery ? (
              <Navigate to="/redefinir-senha" replace />
            ) : (
              <Inicio session={session} />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
