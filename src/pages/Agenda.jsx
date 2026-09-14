import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useDadosApp } from '../lib/dadosContexto'
import { useConcluirComVoo } from '../lib/useVooXp'
import { useAgenda } from '../lib/useAgenda'
import { agoraBrasilia, inicioSugerido, itensDeTarefas, ocorrencias, paraMinutos } from '../lib/agenda'
import { diasDaSemana, gradeMes, rotuloDiaCurto, rotuloDiaLongo, rotuloMes, rotuloSemana, somarDias, somarMeses } from '../lib/calendario'
import { GradeHoras, GradeMes, ListaSemana } from '../components/AgendaVisoes'
import { EventoDialog } from '../components/EventoDialog'
import { TarefaDialog } from '../components/TarefaDialog'
import { Toast } from '../components/Toast'
import { VoosXp } from '../components/VoosXp'
import { Aviso } from '../components/AuthParts'
import { IconeAgenda, IconeBandeira, IconeCheck, IconeMais, IconeSetaDireita, IconeSetaEsquerda } from '../components/icones'
import { t } from '../i18n/pt-BR'
import '../components/calendario.css'
import './agenda.css'

const a = t.agenda
const MODOS = ['dia', 'semana', 'mes']
const CHAVE_MODO = 'routinxp:agenda:modo'
const CHAVE_TAREFAS = 'routinxp:agenda:tarefas'
const diaValido = (texto) => (/^\d{4}-\d{2}-\d{2}$/.test(texto ?? '') ? texto : null)

function lerSalvo(chave, padrao) {
  try {
    return localStorage.getItem(chave) ?? padrao
  } catch {
    return padrao
  }
}
function salvar(chave, valor) {
  try {
    localStorage.setItem(chave, valor)
  } catch {
    /* sem armazenamento: vale só nesta sessão */
  }
}

// Celular: a Semana vira lista por dia (a grade de 7 colunas não cabe).
function useEstreito() {
  const consulta = '(max-width: 47.99rem)'
  const [estreito, setEstreito] = useState(() => window.matchMedia?.(consulta).matches ?? false)
  useEffect(() => {
    const m = window.matchMedia?.(consulta)
    const mudar = () => setEstreito(m.matches)
    m?.addEventListener('change', mudar)
    return () => m?.removeEventListener('change', mudar)
  }, [])
  return estreito
}

// Botão "Novo" com a escolha entre evento e tarefa.
function MenuNovo({ onEvento, onTarefa, flutuante = false }) {
  const [aberto, setAberto] = useState(false)
  const raiz = useRef(null)
  useEffect(() => {
    if (!aberto) return undefined
    const fora = (evento) => !raiz.current?.contains(evento.target) && setAberto(false)
    const tecla = (evento) => evento.key === 'Escape' && setAberto(false)
    document.addEventListener('pointerdown', fora)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('pointerdown', fora)
      document.removeEventListener('keydown', tecla)
    }
  }, [aberto])
  const escolher = (acao) => {
    setAberto(false)
    acao()
  }
  return (
    <div className="ag-novo" data-flutuante={flutuante} ref={raiz}>
      <button
        type="button"
        className={flutuante ? 'fab ag-novo__fab' : 'btn btn--compacto ag-novo__botao'}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label={a.novoRotulo}
        onClick={() => setAberto((x) => !x)}
      >
        <IconeMais />
        {!flutuante && a.novo}
      </button>
      {aberto && (
        <div className="ag-novo__menu" role="menu">
          <button type="button" role="menuitem" className="ag-novo__opcao" data-tipo="evento" autoFocus onClick={() => escolher(onEvento)}>
            <span className="ag-novo__icone" aria-hidden="true">
              <IconeAgenda />
            </span>
            <span>
              <span className="ag-novo__nome">{a.novoEvento}</span>
              <span className="ag-novo__dica">{a.novoEventoDica}</span>
            </span>
          </button>
          <button type="button" role="menuitem" className="ag-novo__opcao" data-tipo="tarefa" onClick={() => escolher(onTarefa)}>
            <span className="ag-novo__icone" aria-hidden="true">
              <IconeCheck />
            </span>
            <span>
              <span className="ag-novo__nome">{a.novaTarefa}</span>
              <span className="ag-novo__dica">{a.novaTarefaDica}</span>
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

// Agenda (pedido do usuário, 2026-09-14): eventos e tarefas marcadas por dia, semana e mês.
export default function Agenda() {
  const d = useDadosApp()
  const { concluirComVoo, voos } = useConcluirComVoo(d)
  const estreito = useEstreito()
  const [params, setParams] = useSearchParams()
  const hoje = agoraBrasilia().slice(0, 10)
  const modoUrl = params.get('modo')
  const modo = MODOS.includes(modoUrl) ? modoUrl : MODOS.includes(lerSalvo(CHAVE_MODO, '')) ? lerSalvo(CHAVE_MODO, '') : 'semana'
  const cursor = diaValido(params.get('dia')) ?? hoje
  const [comTarefas, setComTarefas] = useState(() => lerSalvo(CHAVE_TAREFAS, 'sim') !== 'nao')
  const [dlgEvento, setDlgEvento] = useState(null) // { evento?, inicial?, ocorrencia? }
  const [dlgTarefa, setDlgTarefa] = useState(null) // { tarefa?, inicial? }
  const [aviso, setAviso] = useState(null)
  const fecharAviso = useCallback(() => setAviso(null), [setAviso])

  const ir = (novo) => setParams({ modo: novo.modo ?? modo, dia: novo.dia ?? cursor }, { replace: true })
  const trocarModo = (novo) => {
    salvar(CHAVE_MODO, novo)
    ir({ modo: novo })
  }

  const dias = modo === 'dia' ? [cursor] : modo === 'semana' ? diasDaSemana(cursor) : gradeMes(cursor)
  const [diaInicio, diaFim] = [dias[0], dias[dias.length - 1]]
  const agenda = useAgenda(diaInicio, diaFim)

  const categoriasPorId = Object.fromEntries(d.categorias.map((c) => [c.id, c]))
  const itens = [
    ...agenda.eventos.flatMap((evento) => ocorrencias(evento, diaInicio, diaFim)),
    ...(comTarefas ? itensDeTarefas(d.tarefas, diaInicio, diaFim) : []),
  ]

  const passo = { dia: (n) => somarDias(cursor, n), semana: (n) => somarDias(cursor, 7 * n), mes: (n) => somarMeses(cursor, n) }[modo]
  const tituloPeriodo = modo === 'dia' ? (estreito ? rotuloDiaCurto(cursor) : rotuloDiaLongo(cursor)) : modo === 'semana' ? rotuloSemana(cursor) : rotuloMes(cursor)

  // Dia sugerido para criar algo: o do Dia aberto; na semana ou mês, hoje (se estiver na tela).
  const diaParaNovo = modo === 'dia' ? cursor : dias.includes(hoje) ? hoje : diaInicio
  const agora = agoraBrasilia()
  const proximaHora = Math.min((Math.floor((paraMinutos(agora) - paraMinutos(hoje)) / 60) + 1) * 60, 23 * 60)
  const novoEvento = (dia = diaParaNovo, minutos = dia === hoje ? proximaHora : 9 * 60) =>
    setDlgEvento({ inicial: inicioSugerido(dia, minutos) })
  const novaTarefa = () => setDlgTarefa({ inicial: { planejada_dia: diaParaNovo } })

  function abrir(item) {
    if (item.tipo === 'evento') setDlgEvento({ evento: item.evento, ocorrencia: item.evento.repeticao !== 'nao' ? item.dia : null })
    else setDlgTarefa({ tarefa: item.tarefa })
  }

  const visao =
    modo === 'mes' ? (
      <GradeMes
        cursor={cursor}
        itens={itens}
        categoriasPorId={categoriasPorId}
        onAbrir={abrir}
        onConcluir={concluirComVoo}
        onAbrirDia={(dia) => ir({ modo: 'dia', dia })}
      />
    ) : modo === 'semana' && estreito ? (
      <ListaSemana dias={dias} itens={itens} categoriasPorId={categoriasPorId} onAbrir={abrir} onConcluir={concluirComVoo} />
    ) : (
      <GradeHoras
        dias={dias}
        itens={itens}
        categoriasPorId={categoriasPorId}
        onAbrir={abrir}
        onConcluir={concluirComVoo}
        onNovoNoHorario={(dia, minutos) => novoEvento(dia, minutos)}
        onAbrirDia={(dia) => ir({ modo: 'dia', dia })}
      />
    )

  return (
    <>
      <main className="ag">
        <header className="ag__cabeca">
          <h1 className="main__titulo">{a.titulo}</h1>
          <div className="ag__periodo">
            <div className="cal__nav">
              <button type="button" className="cal__seta" onClick={() => ir({ dia: passo(-1) })} aria-label={a.anterior[modo]}>
                <IconeSetaEsquerda />
              </button>
              <button type="button" className="cal__hoje" onClick={() => ir({ dia: hoje })}>
                {a.hoje}
              </button>
              <button type="button" className="cal__seta" onClick={() => ir({ dia: passo(1) })} aria-label={a.proximo[modo]}>
                <IconeSetaDireita />
              </button>
            </div>
            <h2 className="cal__titulo ag__titulo-periodo" aria-live="polite">
              {tituloPeriodo}
            </h2>
          </div>
          <div className="ag__acoes">
            <div className="segmentos ag__modos" role="group" aria-label={a.modos.rotulo}>
              {MODOS.map((m) => (
                <button key={m} type="button" aria-pressed={modo === m} onClick={() => trocarModo(m)}>
                  {a.modos[m]}
                </button>
              ))}
            </div>
            <MenuNovo onEvento={() => novoEvento()} onTarefa={novaTarefa} />
          </div>
        </header>

        <div className="ag__barra">
          <ul className="ag-legenda" aria-label={a.legenda.rotulo}>
            <li data-tipo="evento">
              <span className="ag-legenda__marca" aria-hidden="true" />
              {a.legenda.evento}
            </li>
            <li data-tipo="tarefa">
              <span className="ag-legenda__marca" aria-hidden="true" />
              {a.legenda.tarefa}
            </li>
            <li data-tipo="prazo">
              <IconeBandeira />
              {a.legenda.prazo}
            </li>
          </ul>
          <label className="ag__filtro">
            <input
              type="checkbox"
              className="seletor__caixa"
              checked={comTarefas}
              onChange={(evento) => {
                setComTarefas(evento.target.checked)
                salvar(CHAVE_TAREFAS, evento.target.checked ? 'sim' : 'nao')
              }}
            />
            <span>{a.mostrarTarefasRotulo}</span>
          </label>
        </div>

        {agenda.erro && (
          <div className="ag__erro">
            <Aviso>{a.erro}</Aviso>
            <button type="button" className="btn btn--compacto" onClick={agenda.tentarDeNovo}>
              {a.tentar}
            </button>
          </div>
        )}
        <div className="ag__visao" aria-busy={agenda.carregando}>
          {visao}
        </div>
      </main>

      <MenuNovo flutuante onEvento={() => novoEvento()} onTarefa={novaTarefa} />

      {dlgEvento && (
        <EventoDialog
          evento={dlgEvento.evento}
          inicial={dlgEvento.inicial}
          ocorrencia={dlgEvento.ocorrencia}
          categorias={d.categorias}
          registrarPush={d.registrarPush}
          onSalvar={async (evento) => {
            const salvo = await agenda.salvar(evento)
            setAviso({ tipo: 'info', texto: a.evento.salvo(salvo.titulo), chave: `ev-${salvo.id}-${Date.now()}` })
          }}
          onExcluir={async (evento) => {
            await agenda.excluir(evento.id)
            setAviso({ tipo: 'info', texto: a.evento.excluido(evento.titulo), chave: `ex-${evento.id}` })
          }}
          onExcluirOcorrencia={agenda.excluirOcorrencia}
          onFechar={() => setDlgEvento(null)}
        />
      )}

      {dlgTarefa && (
        <TarefaDialog
          tarefa={dlgTarefa.tarefa}
          inicial={dlgTarefa.inicial}
          categorias={d.categorias}
          tags={d.tags}
          onCriarTag={d.salvarTag}
          onFechar={() => setDlgTarefa(null)}
          onSalvar={d.salvarTarefa}
          onExcluir={d.excluir}
          onCriarCategoria={() => setDlgTarefa(null)}
        />
      )}

      <VoosXp voos={voos} />
      <Toast aviso={aviso ?? d.aviso} onDesfazer={d.desfazerExclusao} onFechar={aviso ? fecharAviso : d.fecharAviso} />
    </>
  )
}
