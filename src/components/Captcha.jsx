import { useEffect, useRef, useState } from 'react'
import { t } from '../i18n/pt-BR'
import { TURNSTILE_SITE_KEY as SITE_KEY } from '../lib/captcha'

let carregamento = null

function carregarTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (!carregamento) {
    carregamento = new Promise((ok, falha) => {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.onload = () => ok(window.turnstile)
      script.onerror = () => {
        carregamento = null
        falha(new Error('turnstile'))
      }
      document.head.appendChild(script)
    })
  }
  return carregamento
}

// Verificação anti-robô (Cloudflare Turnstile). Normalmente é invisível:
// o widget só aparece quando o Cloudflare precisa de uma interação.
// `reinicio` muda a cada envio, porque cada token só vale uma vez.
export function Captcha({ onToken, reinicio = 0 }) {
  const caixa = useRef(null)
  const widget = useRef(null)
  const [falhou, setFalhou] = useState(false)
  // O widget só ocupa espaço quando o Cloudflare pede interação (ou quando falha).
  const [interativo, setInterativo] = useState(false)

  useEffect(() => {
    if (!SITE_KEY) return undefined
    let ativo = true
    carregarTurnstile().then(
      (turnstile) => {
        if (!ativo || !caixa.current) return
        widget.current = turnstile.render(caixa.current, {
          sitekey: SITE_KEY,
          theme: 'dark',
          size: 'flexible',
          appearance: 'interaction-only',
          language: 'pt-BR',
          callback: (token) => {
            setFalhou(false)
            onToken(token)
          },
          'expired-callback': () => onToken(null),
          'before-interactive-callback': () => setInterativo(true),
          'after-interactive-callback': () => setInterativo(false),
          'error-callback': () => {
            onToken(null)
            setFalhou(true)
          },
        })
      },
      () => ativo && setFalhou(true),
    )
    return () => {
      ativo = false
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current)
      widget.current = null
    }
  }, [onToken])

  useEffect(() => {
    if (reinicio && widget.current && window.turnstile) window.turnstile.reset(widget.current)
  }, [reinicio])

  if (!SITE_KEY) return null

  return (
    <div className="captcha" data-visivel={interativo || falhou}>
      <div ref={caixa} />
      {falhou && <p className="hint">{t.auth.captcha.falhou}</p>}
    </div>
  )
}
