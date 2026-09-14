import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { useSession } from './lib/useSession'
import Entrar from './pages/Entrar'
import RedefinirSenha from './pages/RedefinirSenha'
import Tarefas from './pages/Tarefas'
import Agenda from './pages/Agenda'
import PortaoConta from './pages/PortaoConta'
import Perfil from './pages/Perfil'
import Painel from './pages/Painel'
import Integracoes from './pages/Integracoes'
import Categorias from './pages/Categorias'
import Financeiro from './pages/Financeiro'
import GastosFixos from './pages/GastosFixos'
import Controle from './pages/Controle'
import Admin from './pages/Admin'
import AdminConta from './pages/AdminConta'
import { t } from './i18n/pt-BR'
import { emPrevia, sessaoPrevia } from './dev/previa'

export default function App() {
  const real = useSession()
  const { recovery, convite, clearRecovery } = real
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
          element={<RedefinirSenha session={session} convite={convite} aoConcluir={clearRecovery} />}
        />
        {/* Páginas do app logado: primeiro a verificação em duas etapas e a troca da senha
            provisória (PortaoConta), depois a casca com menu lateral. */}
        <Route
          element={
            !session ? (
              <Navigate to="/entrar" replace />
            ) : recovery ? (
              <Navigate to="/redefinir-senha" replace />
            ) : (
              <PortaoConta session={session} />
            )
          }
        >
          <Route path="/" element={<Tarefas />} />
          {/* A página Foco fica montada na casca (Shell) para o cronômetro e a música
              continuarem ao trocar de página; a rota só a mostra. */}
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/foco" element={null} />
          <Route path="/painel" element={<Painel />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/financeiro/controle" element={<Controle />} />
          <Route path="/financeiro/gastos-fixos" element={<GastosFixos />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/integracoes" element={<Integracoes />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/:id" element={<AdminConta />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
