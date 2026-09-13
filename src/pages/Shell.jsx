import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router'
import { useDados } from '../lib/useDados'
import { primeiraRota, rotaPermitida, temFuncao, useConta } from '../lib/conta'
import { DadosContexto } from '../lib/dadosContexto'
import { MenuLateral } from '../components/MenuLateral'
import { TopBar } from '../components/TopBar'
import { LembreteStreak } from '../components/LembreteStreak'
import { ConviteInstalar } from '../components/ConviteInstalar'
import { DialogoInstalarIos } from '../components/DialogoInstalarIos'
import { IconeMais, IconeSemConexao } from '../components/icones'
import { pedirInstalacao, useInstalacao } from '../lib/instalacao'
import { useConexao } from '../lib/useConexao'
import { contarPrazos, streakEmRisco } from '../lib/lembrete'
import { LembretePrazos } from '../components/LembretePrazos'
import { hojeBrasilia } from '../lib/datas'
import { FocoContexto, formatarTempo, restanteDe, useAgora, useFoco, useFocoApp } from '../lib/foco'
import { garantirInscricao } from '../lib/push'
import Foco from './Foco'
import { t } from '../i18n/pt-BR'
import './tarefas.css'
import './shell.css'

const CHAVE_MENU = 'routinxp:menu'

// Um aviso dispensado fica fora até o dia seguinte (a chave leva a data).
function useDispensaDoDia(chave) {
  const [dispensado, setDispensado] = useState(() => {
    try {
      return localStorage.getItem(chave) === '1'
    } catch {
      return false
    }
  })
  function dispensar() {
    setDispensado(true)
    try {
      localStorage.setItem(chave, '1')
    } catch {
      /* sem armazenamento: some só nesta sessão */
    }
  }
  return [dispensado, dispensar]
}

// Com uma sessão de foco em andamento, a aba do navegador mostra o tempo que falta.
function TituloAba() {
  const { estado } = useFocoApp()
  const ativo = estado.fase !== 'parado'
  const agora = useAgora(ativo && estado.rodando, 1000)
  const aguardando = estado.aguardando && !estado.rodando
  const fase = aguardando ? (estado.fase === 'foco' ? t.foco.proximo : t.foco.horaDa[estado.fase]) : t.foco.fases[estado.fase]
  const titulo = ativo ? t.foco.tituloAba(formatarTempo(restanteDe(estado, agora)), fase) : 'RoutinXP'
  useEffect(() => {
    document.title = titulo
  }, [titulo])
  useEffect(
    () => () => {
      document.title = 'RoutinXP'
    },
    [],
  )
  return null
}

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
  // Papel e funções liberadas da conta (PortaoConta já conferiu a verificação).
  const conta = useConta()
  const d = useDados(session.user.id, conta.funcoes)
  // Pomodoro da página Foco: vive na casca para continuar ao trocar de página.
  const foco = useFoco(session.user.id, d.registrarFoco, t.foco.aviso, () => garantirInscricao(d.registrarPush).catch(() => {}))
  const [recolhido, setRecolhido] = useState(lerMenuRecolhido)
  const [gavetaAberta, setGavetaAberta] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Aviso por push do fim da fase (tela bloqueada, outra aba, app fechado, outro aparelho):
  // agendado no servidor quando a fase começa a correr. Só é cancelado quando a fase para antes
  // da hora (pausar, pular, encerrar); no fim natural ele segue, para o celular no bolso tocar
  // também. As chamadas vão em fila, na ordem em que aconteceram.
  const agendadoAte = useRef(null) // fimEm do aviso agendado
  const fila = useRef(Promise.resolve())
  const { rodando: focoRodando, fimEm: focoFimEm, fase: focoFase } = foco.estado
  const { registrarPush, agendarAvisoFoco, cancelarAvisoFoco } = d
  useEffect(() => {
    const enfileirar = (tarefa) => {
      fila.current = fila.current.then(tarefa).catch(() => {})
    }
    if (focoRodando && focoFimEm) {
      const tipo = focoFase === 'foco' ? 'fim_foco' : 'fim_pausa'
      // Marcado já aqui: um Pausar logo depois de iniciar precisa enfileirar o cancelamento,
      // que roda depois do agendamento (cancelar sem nada agendado não apaga nada).
      agendadoAte.current = focoFimEm
      enfileirar(async () => {
        // Sem push neste navegador, não há o que agendar (e o agendamento do banco nem acorda).
        if (!(await garantirInscricao(registrarPush))) return
        await agendarAvisoFoco(new Date(focoFimEm).toISOString(), tipo)
      })
    } else if (agendadoAte.current) {
      const fim = agendadoAte.current
      agendadoAte.current = null
      if (Date.now() < fim - 2000) enfileirar(() => cancelarAvisoFoco())
    }
  }, [focoRodando, focoFimEm, focoFase, registrarPush, agendarAvisoFoco, cancelarAvisoFoco])

  // Tocar num aviso com o app aberto: o service worker pede para abrir a página Foco.
  useEffect(() => {
    const sw = navigator.serviceWorker
    if (!sw) return undefined
    const aoReceber = (evento) => {
      const url = evento.data?.tipo === 'abrir' ? evento.data.url : null
      if (typeof url === 'string' && url.startsWith('/')) navigate(url)
    }
    sw.addEventListener('message', aoReceber)
    return () => sw.removeEventListener('message', aoReceber)
  }, [navigate])

  // A página Foco é montada na primeira visita e não desmonta mais: o player do Spotify
  // (e a música) continua tocando nas outras páginas.
  const noFoco = location.pathname === '/foco'
  const [focoMontado, setFocoMontado] = useState(noFoco)
  if (noFoco && !focoMontado) setFocoMontado(true)

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

  // PWA: instalar (botão do navegador ou passo a passo do iPhone) e aviso sem conexão.
  const modoInstalacao = useInstalacao()
  const [dlgIos, setDlgIos] = useState(false)
  const instalar = () => (modoInstalacao === 'ios' ? setDlgIos(true) : pedirInstalacao())

  const online = useConexao()
  const hoje = hojeBrasilia()
  // Fila de avisos (um por vez): streak em risco, depois prazos, depois o convite para instalar.
  // Dispensar um aviso vale até amanhã e libera o próximo da fila.
  const [streakDispensado, dispensarStreak] = useDispensaDoDia(`routinxp:lembrete:${hoje}`)
  const [prazosDispensado, dispensarPrazos] = useDispensaDoDia(`routinxp:prazos:${hoje}`)
  // Streak e prazos só falam de tarefas: sem a função Tarefas, esses avisos não aparecem.
  const comTarefas = temFuncao(conta, 'tarefas')
  const streakVisivel = comTarefas && streakEmRisco(d.stats, hoje) && !streakDispensado
  const prazos = contarPrazos(d.tarefas, hoje)
  const prazosVisivel = comTarefas && !streakVisivel && prazos.paraHoje + prazos.atrasadas > 0 && !prazosDispensado
  const { estado, carregar } = d
  // A internet voltou depois de uma falha de carregamento: busca os dados de novo.
  useEffect(() => {
    if (online && estado === 'erro') carregar()
  }, [online, estado, carregar])

  // "Nova tarefa" funciona de qualquer página: leva para Tarefas e abre o formulário.
  const novaTarefa = () => navigate('/', { state: { novaTarefa: Date.now() } })

  // Página de uma função que a conta não tem (link antigo, função desligada): vai para a primeira liberada.
  if (!rotaPermitida(conta, location.pathname)) return <Navigate to={primeiraRota(conta)} replace />

  return (
    <DadosContexto.Provider value={d}>
      <FocoContexto.Provider value={foco}>
      <TituloAba />
      <div className="shell" data-recolhido={recolhido}>
        <MenuLateral
          recolhido={recolhido}
          onAlternar={alternarMenu}
          gavetaAberta={gavetaAberta}
          onFecharGaveta={fecharGaveta}
          perfil={d.perfil}
          stats={d.stats}
          email={session.user.email}
          onInstalar={modoInstalacao ? instalar : undefined}
        />
        <div className="shell__conteudo">
          <TopBar
            stats={d.stats}
            perfil={d.perfil}
            email={session.user.email}
            onAbrirMenu={() => setGavetaAberta(true)}
            gavetaAberta={gavetaAberta}
          />
          {/* Região de status sempre montada: leitor de tela anuncia quando a conexão cai. */}
          <div role="status">
            {!online && (
              <div className="lembrete">
                <IconeSemConexao />
                <p>{t.conexao.offline}</p>
              </div>
            )}
          </div>
          {/* Offline, o lembrete de streak espera: concluir agora não salvaria. */}
          {online && streakVisivel && <LembreteStreak stats={d.stats} onDispensar={dispensarStreak} />}
          {online && prazosVisivel && (
            <LembretePrazos paraHoje={prazos.paraHoje} atrasadas={prazos.atrasadas} onDispensar={dispensarPrazos} />
          )}
          {online && modoInstalacao && !streakVisivel && !prazosVisivel && <ConviteInstalar onInstalar={instalar} />}
          <Outlet context={{ session }} />
          {focoMontado && temFuncao(conta, 'foco') && <Foco visivel={noFoco} userId={session.user.id} />}
          {dlgIos && <DialogoInstalarIos onFechar={() => setDlgIos(false)} />}
          {/* No celular a barra não tem "Nova tarefa": o botão flutuante faz esse papel em
              todas as páginas (a de Tarefas tem o próprio, que abre o formulário ali mesmo; a do
              Financeiro tem o de novo lançamento). */}
          {comTarefas && location.pathname !== '/' && !location.pathname.startsWith('/financeiro') && (
            <button type="button" className="fab" onClick={novaTarefa} aria-label={t.topo.novaTarefa}>
              <IconeMais />
            </button>
          )}
        </div>
      </div>
      </FocoContexto.Provider>
    </DadosContexto.Provider>
  )
}
