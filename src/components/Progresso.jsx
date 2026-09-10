import { useEffect, useRef, useState } from 'react'
import { t } from '../i18n/pt-BR'
import './progresso.css'

const DURACAO_CONTAGEM = 700

// Conta de um valor ao outro (ease-out), no mesmo ritmo em que a barra enche.
function useNumeroAnimado(alvo, instantaneo) {
  const [valor, setValor] = useState(alvo)
  const atual = useRef(alvo)

  useEffect(() => {
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf
    if (instantaneo || semMovimento) {
      atual.current = alvo
      raf = requestAnimationFrame(() => setValor(alvo))
      return () => cancelAnimationFrame(raf)
    }
    const de = atual.current
    const inicio = performance.now()
    const passo = (agora) => {
      // O timestamp do rAF pode ser anterior a `inicio`; sem o limite, o número ficaria negativo.
      const k = Math.min(1, Math.max(0, (agora - inicio) / DURACAO_CONTAGEM))
      const v = Math.round(de + (alvo - de) * (1 - Math.pow(1 - k, 4)))
      atual.current = v
      setValor(v)
      if (k < 1) raf = requestAnimationFrame(passo)
    }
    raf = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(raf)
  }, [alvo, instantaneo])

  return instantaneo ? alvo : valor
}

export function BadgeNivel({ nivel, animar = false }) {
  return (
    <span className="nivel-badge" data-animar={animar} key={nivel}>
      {t.nivel.rotulo(nivel)}
    </span>
  )
}

export function BarraXp({ xpNoNivel, meta, instantaneo = false, valorRef }) {
  const numero = useNumeroAnimado(xpNoNivel, instantaneo)
  return (
    <div className="xp">
      <div className="xp__top">
        <span className="xp__valor" ref={valorRef}>
          {t.nivel.xp(numero, meta)}
        </span>
        <span className="xp__falta">{t.nivel.falta(meta - xpNoNivel)}</span>
      </div>
      <div
        className="xp__track"
        role="progressbar"
        aria-label={t.nivel.barra}
        aria-valuemin={0}
        aria-valuemax={meta}
        aria-valuenow={xpNoNivel}
      >
        <div className="xp__fill" data-instantaneo={instantaneo} style={{ '--p': xpNoNivel / meta }} />
      </div>
    </div>
  )
}

export function Avatar({ iniciais }) {
  return (
    <span className="avatar" aria-hidden="true">
      {iniciais}
    </span>
  )
}
