import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { mensagemDeErro } from '../lib/authErrors'
import { BoardingPass } from '../components/BoardingPass'
import { Aviso, CampoSenha, Rota } from '../components/AuthParts'
import { t } from '../i18n/pt-BR'
import './auth.css'

const a = t.auth

// modo: 'entrar' | 'cadastrar' | 'esqueci' | 'confira-cadastro' | 'confira-reset'
export default function Entrar() {
  const [modo, setModo] = useState('entrar')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  function trocarModo(novo) {
    setModo(novo)
    setErro(null)
    setSenha('')
  }

  async function enviar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setErro(null)
    const emailLimpo = email.trim()

    if (modo === 'entrar') {
      const { error } = await supabase.auth.signInWithPassword({ email: emailLimpo, password: senha })
      if (error) setErro(mensagemDeErro(error))
      // Com sucesso, a sessão muda e o App leva para o início.
    } else if (modo === 'cadastrar') {
      const { data, error } = await supabase.auth.signUp({
        email: emailLimpo,
        password: senha,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) setErro(mensagemDeErro(error))
      // O Supabase não revela que o e-mail já existe: devolve um usuário sem identidades.
      else if (data.user && data.user.identities?.length === 0) setErro(a.erros.jaExiste)
      else if (!data.session) trocarModo('confira-cadastro')
    } else if (modo === 'esqueci') {
      const { error } = await supabase.auth.resetPasswordForEmail(emailLimpo, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      })
      if (error) setErro(mensagemDeErro(error))
      else trocarModo('confira-reset')
    }

    setEnviando(false)
  }

  const conferindo = modo === 'confira-cadastro' || modo === 'confira-reset'
  const tag = conferindo ? t.pass.tags.aguardando : t.pass.tags[modo]

  return (
    <main className="auth">
      <BoardingPass tag={tag} email={email}>
        <header className="pass__head">
          <h1 className="wordmark">{t.app.nome}</h1>
          {(modo === 'entrar' || modo === 'cadastrar') && (
            <div className="tabs" role="group" aria-label={a.abas.rotulo}>
              <button type="button" aria-pressed={modo === 'entrar'} onClick={() => trocarModo('entrar')}>
                {a.abas.entrar}
              </button>
              <button type="button" aria-pressed={modo === 'cadastrar'} onClick={() => trocarModo('cadastrar')}>
                {a.abas.cadastrar}
              </button>
            </div>
          )}
        </header>

        {conferindo ? (
          <div className="auth__panel" role="status">
            <h2 className="auth__title">{a.confira.titulo}</h2>
            <p className="auth__text">
              {modo === 'confira-cadastro' ? a.confira.cadastro(email.trim()) : a.confira.reset(email.trim())}
            </p>
            <p className="hint">{a.confira.semEmail}</p>
            <div className="form__foot">
              <button type="button" className="link-btn" onClick={() => trocarModo('entrar')}>
                {a.links.voltar}
              </button>
            </div>
          </div>
        ) : (
          <>
            {modo === 'esqueci' ? (
              <div className="auth__panel">
                <h2 className="auth__title">{a.esqueci.titulo}</h2>
                <p className="auth__text">{a.esqueci.texto}</p>
              </div>
            ) : (
              <Rota />
            )}

            <form className="form" onSubmit={enviar} noValidate={false}>
              <div className={modo === 'esqueci' ? 'form__fields form__fields--single' : 'form__fields'}>
                <label className="field">
                  <span className="field__top">
                    <span className="label">{a.campos.email}</span>
                  </span>
                  <input
                    className="input"
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder={a.campos.emailExemplo}
                    required
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                  />
                </label>

                {modo !== 'esqueci' && (
                  <CampoSenha
                    rotulo={a.campos.senha}
                    valor={senha}
                    aoMudar={setSenha}
                    novaSenha={modo === 'cadastrar'}
                    dica={modo === 'cadastrar' ? a.dicaSenha : null}
                  />
                )}
              </div>

              {erro && <Aviso>{erro}</Aviso>}

              <div className="form__foot">
                <button className="btn" type="submit" disabled={enviando}>
                  {modo === 'entrar' && (enviando ? a.botoes.entrando : a.botoes.entrar)}
                  {modo === 'cadastrar' && (enviando ? a.botoes.cadastrando : a.botoes.cadastrar)}
                  {modo === 'esqueci' && (enviando ? a.botoes.enviando : a.botoes.enviarLink)}
                </button>
                {modo === 'entrar' && (
                  <button type="button" className="link-btn" onClick={() => trocarModo('esqueci')}>
                    {a.links.esqueci}
                  </button>
                )}
                {modo === 'esqueci' && (
                  <button type="button" className="link-btn" onClick={() => trocarModo('entrar')}>
                    {a.links.voltar}
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </BoardingPass>
    </main>
  )
}
