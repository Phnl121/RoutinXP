import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router'
import { useDadosApp } from '../lib/dadosContexto'
import { ATALHOS, LIMITES, atalhoDe, duracao, formatarTempo, restanteDe, useAgora, useFocoApp } from '../lib/foco'
import { focoDeHoje } from '../lib/painel'
import { useConcluirComVoo } from '../lib/useVooXp'
import { LinhaTarefa } from '../components/LinhaTarefa'
import { SeletorTarefas } from '../components/SeletorTarefas'
import { PlayerSpotify } from '../components/PlayerSpotify'
import { TarefaDialog } from '../components/TarefaDialog'
import { Toast } from '../components/Toast'
import { VoosXp } from '../components/VoosXp'
import { Aviso } from '../components/AuthParts'
import { IconeMais, IconePausa, IconePlay, IconePular } from '../components/icones'
import { t } from '../i18n/pt-BR'
import './foco.css'

const ff = t.foco

// Trocar entre montar e rodar usa a transição de vista do navegador: o painel de intervalos
// cresce e vira o relógio. Sem suporte (ou com movimento reduzido), a troca é instantânea.
function comTransicao(mudar) {
  const reduzir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduzir) return mudar()
  document.startViewTransition(() => flushSync(mudar))
}

// Tela acesa enquanto o cronômetro corre com a página Foco à vista (celular sobre a mesa).
function useTelaAcesa(ativo) {
  useEffect(() => {
    if (!ativo || !('wakeLock' in navigator)) return undefined
    let trava = null
    let vivo = true
    const pedir = () =>
      navigator.wakeLock
        .request('screen')
        .then((nova) => (vivo ? (trava = nova) : nova.release()))
        .catch(() => {})
    pedir()
    const aoVoltar = () => document.visibilityState === 'visible' && pedir()
    document.addEventListener('visibilitychange', aoVoltar)
    return () => {
      vivo = false
      trava?.release().catch(() => {})
      document.removeEventListener('visibilitychange', aoVoltar)
    }
  }, [ativo])
}

// Minutos de um intervalo: o texto fica livre enquanto digita e é ajustado aos limites ao sair.
function CampoMinutos({ nome, valor, unidade, onConfirmar }) {
  const [texto, setTexto] = useState(String(valor))
  const [min, max] = LIMITES[nome]
  return (
    <label className="foco-campo">
      <span className="label">{ff.campos[nome]}</span>
      <span className="foco-campo__caixa">
        <input
          className="input"
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onBlur={() => onConfirmar(texto)}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
        <span className="foco-campo__unidade" aria-hidden="true">
          {unidade}
        </span>
      </span>
    </label>
  )
}

function Intervalos({ config, onMudar }) {
  const atalho = atalhoDe(config)
  const [personalizado, setPersonalizado] = useState(atalho === 'personalizado')
  const abrirCampos = personalizado || atalho === 'personalizado'

  return (
    <section className="panel foco-intervalos" aria-labelledby="foco-intervalos">
      <header className="foco-secao__cabeca">
        <h2 id="foco-intervalos" className="label">
          {ff.intervalos}
        </h2>
      </header>
      <div className="segmentos" role="group" aria-label={ff.atalhos.rotulo}>
        {ATALHOS.map((a) => (
          <button
            key={a.id}
            type="button"
            aria-pressed={!abrirCampos && atalho === a.id}
            onClick={() => {
              setPersonalizado(false)
              onMudar(a)
            }}
          >
            {ff.atalhos[a.id]}
          </button>
        ))}
        <button type="button" aria-pressed={abrirCampos} onClick={() => setPersonalizado(true)}>
          {ff.atalhos.personalizado}
        </button>
      </div>
      {abrirCampos && (
        <div className="foco-campos">
          {['foco', 'pausa', 'pausaLonga', 'ciclos'].map((nome) => (
            <CampoMinutos
              // A chave muda quando o valor salvo muda: o campo volta a mostrar o número ajustado.
              key={`${nome}-${config[nome]}`}
              nome={nome}
              valor={config[nome]}
              unidade={nome === 'ciclos' ? ff.unidade.ciclos : ff.unidade.min}
              onConfirmar={(texto) => onMudar({ ...config, [nome]: texto })}
            />
          ))}
        </div>
      )}
      <p className="hint">{ff.resumoIntervalos(config)}</p>
    </section>
  )
}

function Relogio({ estado, visivel, onIniciar, onPausar, onPular, onEncerrar }) {
  const agora = useAgora(estado.rodando && visivel)
  const restante = restanteDe(estado, agora)
  const fase = ff.fases[estado.fase]
  // Foco ainda não começado (depois de uma pausa) × foco pausado no meio.
  const aguardando = !estado.rodando && estado.fase === 'foco' && restante >= duracao(estado.config, 'foco')
  const pausado = !estado.rodando && !aguardando
  // Focos já feitos nesta rodada (a pausa longa fecha a rodada).
  const feitos = estado.fase === 'foco' ? estado.ciclo - 1 : estado.ciclo
  const total = estado.config.ciclos

  return (
    <section className="panel foco-relogio" data-pausado={pausado} aria-labelledby="foco-fase">
      <p id="foco-fase" className="label foco-relogio__fase">
        {aguardando ? ff.proximo : fase} · {ff.ciclo(Math.min(estado.ciclo, total), total)}
        {pausado && ` · ${ff.pausado}`}
      </p>
      <ol className="foco-ciclos" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <li key={i} data-estado={i < feitos ? 'feito' : i === feitos && estado.fase === 'foco' ? 'atual' : 'resto'} />
        ))}
      </ol>
      <p className="foco-relogio__tempo" role="timer">
        {formatarTempo(restante)}
      </p>
      <div className="foco-relogio__controles">
        {estado.rodando ? (
          <button type="button" className="btn foco-relogio__principal" onClick={onPausar}>
            <IconePausa />
            {ff.pausar}
          </button>
        ) : (
          <button type="button" className="btn foco-relogio__principal" onClick={onIniciar}>
            <IconePlay />
            {aguardando ? ff.iniciar : ff.retomar}
          </button>
        )}
        <button type="button" className="botao-contorno" onClick={onPular} aria-label={ff.pularRotulo(fase)}>
          <IconePular />
          {ff.pular}
        </button>
      </div>
      <button type="button" className="link-btn foco-relogio__encerrar" onClick={onEncerrar}>
        {ff.encerrar}
      </button>
    </section>
  )
}

// Cards das tarefas da sessão (os mesmos da Lista). "Tirar" só tira da sessão.
function Cartoes({ tarefas, categoriasPorId, tagsPorId, recem, acoes }) {
  return (
    <ul className="linhas">
      {tarefas.map((x) => (
        <LinhaTarefa
          key={x.id}
          tarefa={x}
          categoria={categoriasPorId[x.category_id]}
          tags={(x.tag_ids ?? []).map((g) => tagsPorId[g]).filter(Boolean)}
          recem={recem === x.id}
          excluirTexto={ff.tirar}
          excluirRotulo={ff.remover}
          {...acoes}
        />
      ))}
    </ul>
  )
}

export default function Foco({ visivel, userId }) {
  const d = useDadosApp()
  const f = useFocoApp()
  const navigate = useNavigate()
  const { estado } = f
  const [seletor, setSeletor] = useState(false)
  const [dlgTarefa, setDlgTarefa] = useState(null) // { tarefa }
  const { concluirComVoo, voos } = useConcluirComVoo(d)
  const parado = estado.fase === 'parado'
  const emPausa = estado.rodando && (estado.fase === 'pausa' || estado.fase === 'pausaLonga')
  useTelaAcesa(visivel && estado.rodando)

  const categoriasPorId = Object.fromEntries(d.categorias.map((c) => [c.id, c]))
  const tagsPorId = Object.fromEntries(d.tags.map((g) => [g.id, g]))
  const naSessao = estado.tarefaIds.map((id) => d.tarefas.find((x) => x.id === id)).filter(Boolean)
  const pendentes = naSessao.filter((x) => x.status === 'pendente')
  const feitas = naSessao.filter((x) => x.status === 'concluida')
  const atual = pendentes[0] ?? null
  const disponiveis = d.tarefas.filter((x) => x.status === 'pendente' && !estado.tarefaIds.includes(x.id))
  const hoje = focoDeHoje(d.focos)
  const cartoes = { categoriasPorId, tagsPorId, recem: d.recem }
  const acoes = { onConcluir: concluirComVoo, onEditar: (tarefa) => setDlgTarefa({ tarefa }), onExcluir: f.removerTarefa }

  // Estado atual para o "Desfazer" (o aviso guarda a função criada no momento do encerramento).
  const estadoAtual = useRef(estado)
  useEffect(() => {
    estadoAtual.current = estado
  })

  // Uma sessão nova fecha o "Desfazer" da anterior: desfazer ali apagaria a sessão nova.
  const fecharDesfazer = () => d.avisar((a) => (a?.chave?.startsWith('sessao-') ? null : a))
  const iniciar = () => {
    fecharDesfazer()
    if (parado) comTransicao(f.iniciar)
    else f.iniciar()
  }

  // Encerrar tira da sessão o que já foi concluído; as pendentes ficam para a próxima.
  // Um aviso com "Desfazer" devolve a sessão como estava (o bloco em andamento inclusive).
  function encerrar() {
    const anterior = estado
    const chave = `sessao-${crypto.randomUUID()}`
    comTransicao(() => {
      f.encerrar()
      feitas.forEach((x) => f.removerTarefa(x.id))
    })
    d.avisar({
      tipo: 'desfazer',
      chave,
      texto: ff.encerrada,
      onDesfazer: () => {
        // Só desfaz se nenhuma sessão nova começou nesse meio-tempo.
        if (estadoAtual.current.fase === 'parado') comTransicao(() => f.restaurar(anterior))
        d.fecharAviso()
      },
    })
    setTimeout(() => d.avisar((a) => (a?.chave === chave ? null : a)), 5000)
  }

  const adicionar = (
    <button type="button" className="link-btn foco-adicionar" onClick={() => setSeletor(true)}>
      <IconeMais />
      {ff.adicionar}
    </button>
  )

  let principal
  let lateral
  if (d.estado !== 'pronto') {
    principal = d.estado === 'erro' ? <Aviso>{t.tarefas.erroCarregar}</Aviso> : <p className="label">{t.app.carregando}</p>
  } else if (parado) {
    principal = (
      <>
        <Intervalos config={estado.config} onMudar={f.definirConfig} />
        <section className="foco-secao foco-tarefas" aria-labelledby="foco-tarefas">
          <header className="foco-secao__cabeca">
            <h2 id="foco-tarefas" className="label">
              {ff.tarefas} · {naSessao.length}
            </h2>
            {adicionar}
          </header>
          {naSessao.length === 0 ? (
            <p className="foco-secao__vazio">{ff.semTarefas}</p>
          ) : (
            <div className="lista">
              <Cartoes tarefas={[...pendentes, ...feitas]} {...cartoes} acoes={acoes} />
            </div>
          )}
        </section>
      </>
    )
    lateral = (
      <div className="foco-partida">
        <button type="button" className="btn foco-partida__iniciar" onClick={iniciar}>
          <IconePlay />
          {ff.iniciar}
        </button>
      </div>
    )
  } else {
    const fila = pendentes.slice(1)
    principal = (
      <>
        <Relogio
          estado={estado}
          visivel={visivel}
          onIniciar={iniciar}
          onPausar={f.pausar}
          onPular={f.pular}
          onEncerrar={encerrar}
        />
        {atual && (
          <section className="foco-secao foco-agora lista" aria-labelledby="foco-agora">
            <h2 id="foco-agora" className="label foco-secao__cabeca">
              {ff.agora}
            </h2>
            <Cartoes tarefas={[atual]} {...cartoes} acoes={acoes} />
          </section>
        )}
      </>
    )
    lateral = (
      <section className="foco-secao foco-tarefas foco-tarefas--fila" aria-labelledby="foco-fila">
        <header className="foco-secao__cabeca">
          <h2 id="foco-fila" className="label">
            {ff.fila(fila.length)}
          </h2>
          {adicionar}
        </header>
        {naSessao.length === 0 ? (
          <p className="foco-secao__vazio">{ff.semTarefas}</p>
        ) : pendentes.length === 0 ? (
          <p className="foco-secao__vazio">{ff.todasFeitas}</p>
        ) : (
          fila.length > 0 && (
            <div className="lista">
              <Cartoes tarefas={fila} {...cartoes} acoes={acoes} />
            </div>
          )
        )}
        {feitas.length > 0 && (
          <div className="lista foco-feitas">
            <h3 className="label foco-secao__cabeca">{ff.feitas(feitas.length)}</h3>
            <Cartoes tarefas={feitas} {...cartoes} acoes={acoes} />
          </div>
        )}
      </section>
    )
  }

  return (
    <>
      <main className="foco" data-fase={parado ? 'montar' : 'rodar'} hidden={!visivel} aria-labelledby="foco-titulo">
        <header className="foco__cabeca">
          <h1 id="foco-titulo" className="main__titulo">
            {ff.titulo}
          </h1>
          <p className="foco__hoje">{ff.hoje(hoje.focos, hoje.minutos)}</p>
        </header>
        <div className="foco__grade">
          <div className="foco__principal">{principal}</div>
          <div className="foco__lateral">
            {lateral}
            {/* Mesma posição nas duas fases: o player (e a música) nunca recomeça. */}
            <PlayerSpotify key="musica" userId={userId} emPausa={emPausa} />
          </div>
        </div>
      </main>

      {visivel && <Toast aviso={d.aviso} onDesfazer={d.desfazerExclusao} onFechar={d.fecharAviso} />}
      <VoosXp voos={voos} />

      {seletor && (
        <SeletorTarefas
          tarefas={disponiveis}
          categorias={d.categorias}
          onAdicionar={f.adicionarTarefas}
          onFechar={() => setSeletor(false)}
        />
      )}

      {dlgTarefa && (
        <TarefaDialog
          tarefa={dlgTarefa.tarefa}
          categorias={d.categorias}
          tags={d.tags}
          colunas={d.colunas.filter((c) => c.tipo === 'custom')}
          onCriarTag={d.salvarTag}
          onFechar={() => setDlgTarefa(null)}
          onSalvar={d.salvarTarefa}
          onExcluir={d.excluir}
          onCriarCategoria={() => {
            setDlgTarefa(null)
            navigate('/categorias')
          }}
        />
      )}
    </>
  )
}
