import { useId, useState } from 'react'
import { t } from '../i18n/pt-BR'

const a = t.auth

// "De PENDENTE para CONCLUÍDA": o trajeto que o app inteiro promete.
export function Rota() {
  return (
    <div className="route" role="img" aria-label={a.rota.rotulo}>
      <div className="route__leg">
        <span className="label">{a.rota.de}</span>
        <span className="route__value">{a.rota.origem}</span>
      </div>
      <svg className="route__arrow" viewBox="0 0 32 16" fill="none" aria-hidden="true">
        <path d="M1 8h29M23 1.5 30 8l-7 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      </svg>
      <div className="route__leg route__leg--dest">
        <span className="label">{a.rota.para}</span>
        <span className="route__value">{a.rota.destino}</span>
      </div>
    </div>
  )
}

export function CampoSenha({ rotulo, valor, aoMudar, novaSenha = false, dica = null, nome = 'senha' }) {
  const [visivel, setVisivel] = useState(false)
  const id = useId()
  const dicaId = `${id}-dica`
  return (
    <div className="field">
      <span className="field__top">
        <label className="label" htmlFor={id}>
          {rotulo}
        </label>
        <button
          type="button"
          className="field__toggle"
          aria-controls={id}
          aria-pressed={visivel}
          onClick={() => setVisivel((v) => !v)}
        >
          {visivel ? a.campos.ocultar : a.campos.mostrar}
        </button>
      </span>
      <input
        id={id}
        className="input"
        type={visivel ? 'text' : 'password'}
        name={nome}
        autoComplete={novaSenha ? 'new-password' : 'current-password'}
        minLength={novaSenha ? 6 : undefined}
        required
        value={valor}
        aria-describedby={dica ? dicaId : undefined}
        onChange={(ev) => aoMudar(ev.target.value)}
      />
      {dica && (
        <span className="hint" id={dicaId}>
          {dica}
        </span>
      )}
    </div>
  )
}

export function Aviso({ children }) {
  return (
    <p className="notice" role="alert">
      <span className="notice__tag">{a.erroTag}</span>
      <span>{children}</span>
    </p>
  )
}
