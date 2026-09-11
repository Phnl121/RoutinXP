import { useEffect, useId, useRef, useState } from 'react'
import { carregarApiSpotify, ehLinkCurto, uriSpotify } from '../lib/spotify'
import { Aviso } from './AuthParts'
import { t } from '../i18n/pt-BR'

const s = t.foco.spotify

function lerLocal(chave, padrao) {
  try {
    const valor = localStorage.getItem(chave)
    return valor === null ? padrao : JSON.parse(valor)
  } catch {
    return padrao
  }
}

function gravarLocal(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    /* sem armazenamento: vale só nesta aba */
  }
}

// Player oficial do Spotify a partir de um link colado (sem conectar conta). O iframe é criado
// uma vez: trocar o link carrega o conteúdo novo no mesmo player, e a página Foco fica montada
// na casca, então a música continua ao trocar de página. Nas pausas do pomodoro a música pode
// pausar sozinha e voltar quando o foco recomeça.
export function PlayerSpotify({ userId, emPausa }) {
  const id = useId()
  const chave = `routinxp:spotify:${userId}`
  const [uri, setUri] = useState(() => lerLocal(chave, null))
  const [editando, setEditando] = useState(() => !lerLocal(chave, null))
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState(null)
  const [pausarNasPausas, setPausarNasPausas] = useState(() => lerLocal(`${chave}:pausas`, true))
  const [falhou, setFalhou] = useState(false)
  const [tentativa, setTentativa] = useState(0)
  const host = useRef(null)
  const controle = useRef(null)
  const tocando = useRef(false)
  const pausadoPorNos = useRef(false)

  // Cria o player (uma vez por link inicial ou nova tentativa).
  useEffect(() => {
    if (!uri || controle.current) return undefined
    let cancelado = false
    carregarApiSpotify().then(
      (api) => {
        if (cancelado || !host.current) return
        const alvo = document.createElement('div')
        host.current.replaceChildren(alvo)
        api.createController(alvo, { uri, width: '100%', height: 152 }, (c) => {
          if (cancelado) return c.destroy()
          controle.current = c
          c.addListener('playback_update', (evento) => {
            tocando.current = !evento.data.isPaused
          })
        })
      },
      () => !cancelado && setFalhou(true),
    )
    return () => {
      cancelado = true
    }
    // Só o primeiro link cria o player; os seguintes vão por loadUri (efeito abaixo).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Boolean(uri), tentativa])

  useEffect(() => {
    if (uri && controle.current) controle.current.loadUri(uri)
  }, [uri])

  // Sair do app (a casca desmonta): fecha o player.
  useEffect(
    () => () => {
      controle.current?.destroy()
      controle.current = null
    },
    [],
  )

  // Pausa na pausa do pomodoro e retoma no foco, só se foi o app que pausou.
  useEffect(() => {
    const c = controle.current
    if (!c || !pausarNasPausas) return
    if (emPausa && tocando.current) {
      c.pause()
      pausadoPorNos.current = true
    } else if (!emPausa && pausadoPorNos.current) {
      c.resume()
      pausadoPorNos.current = false
    }
  }, [emPausa, pausarNasPausas])

  function usar(evento) {
    evento.preventDefault()
    if (ehLinkCurto(texto)) return setErro(s.curto)
    const novo = uriSpotify(texto)
    if (!novo) return setErro(s.invalido)
    setErro(null)
    setTexto('')
    setUri(novo)
    gravarLocal(chave, novo)
    setEditando(false)
  }

  function alternarPausas(evento) {
    setPausarNasPausas(evento.target.checked)
    gravarLocal(`${chave}:pausas`, evento.target.checked)
  }

  function tentarDeNovo() {
    setFalhou(false)
    setTentativa((n) => n + 1)
  }

  return (
    <section className="foco-secao foco-musica" aria-labelledby={`${id}-titulo`}>
      <header className="foco-secao__cabeca">
        <h2 id={`${id}-titulo`} className="label">
          {s.titulo}
        </h2>
        {uri && !editando && (
          <button type="button" className="link-btn" onClick={() => setEditando(true)}>
            {s.trocar}
          </button>
        )}
      </header>

      {/* Sempre montado: o iframe do Spotify vive aqui dentro. */}
      <div ref={host} className="foco-musica__player" hidden={!uri || falhou} />

      {falhou && (
        <div className="foco-musica__falha">
          <Aviso>{s.falhou}</Aviso>
          <button type="button" className="link-btn" onClick={tentarDeNovo}>
            {s.tentar}
          </button>
        </div>
      )}

      {editando && (
        <form className="foco-musica__form" onSubmit={usar} noValidate>
          {/* O título "Música" já nomeia a seção: o rótulo do campo fica só para leitor de tela. */}
          <label className="visually-hidden" htmlFor={`${id}-link`}>
            {s.campo}
          </label>
          <div className="foco-musica__linha">
            <input
              id={`${id}-link`}
              className="input"
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder={s.placeholder}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              aria-invalid={Boolean(erro)}
              aria-describedby={`${id}-dica`}
            />
            <button type="submit" className="btn btn--compacto">
              {s.usar}
            </button>
          </div>
          <p id={`${id}-dica`} className="hint">
            {erro ?? s.dica}
          </p>
          {uri && (
            <button type="button" className="link-btn foco-musica__cancelar" onClick={() => setEditando(false)}>
              {t.foco.seletor.cancelar}
            </button>
          )}
        </form>
      )}

      {uri && (
        <>
          <label className="foco-musica__opcao">
            <input type="checkbox" checked={pausarNasPausas} onChange={alternarPausas} />
            <span>{s.pausarNasPausas}</span>
          </label>
          <p className="hint">{s.trechos}</p>
        </>
      )}
    </section>
  )
}
