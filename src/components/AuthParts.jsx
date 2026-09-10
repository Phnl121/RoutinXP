import { useId, useState } from 'react'
import { t } from '../i18n/pt-BR'

const a = t.auth

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
