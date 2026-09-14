import { Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { useSession } from './lib/useSession'
import Tarefas from './pages/Tarefas'
import PortaoConta from './pages/PortaoConta'
import { t } from './i18n/pt-BR'
import { carregarPagina } from './lib/carregarPagina'

// Carregamento por página: Tarefas (a página inicial) e a casca vêm no pacote principal; cada
// outra página é um arquivo à parte, baixado só quando é aberta pela primeira vez.
const Entrar = carregarPagina(() => import('./pages/Entrar'))
const RedefinirSenha = carregarPagina(() => import('./pages/RedefinirSenha'))
const Agenda = carregarPagina(() => import('./pages/Agenda'))
const Perfil = carregarPagina(() => import('./pages/Perfil'))
const Painel = carregarPagina(() => import('./pages/Painel'))
const Integracoes = carregarPagina(() => import('./pages/Integracoes'))
const Categorias = carregarPagina(() => import('./pages/Categorias'))
const Financeiro = carregarPagina(() => import('./pages/Financeiro'))
const GastosFixos = carregarPagina(() => import('./pages/GastosFixos'))
const Controle = carregarPagina(() => import('./pages/Controle'))
const Admin = carregarPagina(() => import('./pages/Admin'))
const AdminConta = carregarPagina(() => import('./pages/AdminConta'))

// Enquanto a página baixa (fora da casca: entrar e redefinir senha).
const telaCarregando = (
  <div className="carregando" aria-busy="true">
    <span className="label">{t.app.carregando}</span>
  </div>
)
import { emPrevia, sessaoPrevia } from './dev/previa'

export default function App() {
  const real = useSession()
  const { recovery, convite, clearRecovery } = real
  const session = import.meta.env.DEV && emPrevia ? sessaoPrevia : real.session

  if (session === undefined) {
    return telaCarregando
  }

  const destinoLogado = recovery ? '/redefinir-senha' : '/'

  return (
    <BrowserRouter>
      <Suspense fallback={telaCarregando}>
        <Routes>
          <Route path="/entrar" element={session ? <Navigate to={destinoLogado} replace /> : <Entrar />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha session={session} convite={convite} aoConcluir={clearRecovery} />} />
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
      </Suspense>
    </BrowserRouter>
  )
}
