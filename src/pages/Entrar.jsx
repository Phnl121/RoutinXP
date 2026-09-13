import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { mensagemDeErro } from '../lib/authErrors'
import { Aviso, CampoSenha } from '../components/AuthParts'
import { DemoXp } from '../components/DemoXp'
import { Logo } from '../components/Logo'
import { Captcha } from '../components/Captcha'
import { captchaAtivo } from '../lib/captcha'
import { t } from '../i18n/pt-BR'
import './auth.css'

const a = t.auth

// O RoutinXP é por convite (decisão do usuário, 2026-09-13): o cadastro está desligado no
// Supabase e as contas são criadas pelo dono no painel. Aqui só se entra ou recupera a senha.
// modo: 'entrar' | 'esqueci' | 'confira-reset'
export default function Entrar() {
  const [modo, setModo] = useState('entrar')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [captchaToken, setCaptchaToken] = useState(null)
  const [reinicioCaptcha, setReinicioCaptcha] = useState(0)

  function trocarModo(novo) {
    setModo(novo)
    setErro(null)
    setSenha('')
  }

  async function enviar(evento) {
    evento.preventDefault()
    if (captchaAtivo && !captchaToken) {
      setErro(a.captcha.aguarde)
      return
    }
    setEnviando(true)
    setErro(null)
    const emailLimpo = email.trim()
    const token = captchaToken ?? undefined
    // O token do CAPTCHA vale uma vez: descarta e pede outro para a próxima tentativa.
    if (captchaAtivo) {
      setCaptchaToken(null)
      setReinicioCaptcha((n) => n + 1)
    }

    if (modo === 'entrar') {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailLimpo,
        password: senha,
        options: { captchaToken: token },
      })
      if (error) setErro(mensagemDeErro(error))
      // Com sucesso, a sessão muda e o App leva para o início.
    } else if (modo === 'esqueci') {
      const { error } = await supabase.auth.resetPasswordForEmail(emailLimpo, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
        captchaToken: token,
      })
      if (error) setErro(mensagemDeErro(error))
      else trocarModo('confira-reset')
    }

    setEnviando(false)
  }

  const [frase1, frase2, frase3] = t.entrar.titulo

  return (
    <main className="entrar">
      <div className="entrar__grid">
        <Logo className="entrar__marca" />
        <div className="entrar__intro">
          <h1 className="entrar__titulo">
            {frase1} {frase2} <span className="destaque">{frase3}</span>
          </h1>
          <p className="entrar__texto">{t.entrar.texto}</p>
        </div>

        <div className="entrar__form panel">
          {modo === 'confira-reset' ? (
            <div role="status">
              <h2 className="auth__title">{a.confira.titulo}</h2>
              <p className="auth__text">{a.confira.reset(email.trim())}</p>
              <p className="hint">{a.confira.semEmail}</p>
              <div className="form__foot">
                <button type="button" className="link-btn" onClick={() => trocarModo('entrar')}>
                  {a.links.voltar}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h2 className="auth__title">{modo === 'esqueci' ? a.esqueci.titulo : a.entrarTitulo}</h2>
                <p className="auth__text">{modo === 'esqueci' ? a.esqueci.texto : a.convite}</p>
              </div>

              <form className="form" onSubmit={enviar}>
                <div className="field">
                  <span className="field__top">
                    <label className="label" htmlFor="entrar-email">
                      {a.campos.email}
                    </label>
                  </span>
                  <input
                    id="entrar-email"
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
                </div>

                {modo === 'entrar' && <CampoSenha rotulo={a.campos.senha} valor={senha} aoMudar={setSenha} />}

                <Captcha onToken={setCaptchaToken} reinicio={reinicioCaptcha} />

                {erro && <Aviso>{erro}</Aviso>}

                <div className="form__foot">
                  <button className="btn" type="submit" disabled={enviando}>
                    {modo === 'entrar' && (enviando ? a.botoes.entrando : a.botoes.entrar)}
                    {modo === 'esqueci' && (enviando ? a.botoes.enviando : a.botoes.enviarLink)}
                  </button>
                  {modo === 'entrar' ? (
                    <button type="button" className="link-btn" onClick={() => trocarModo('esqueci')}>
                      {a.links.esqueci}
                    </button>
                  ) : (
                    <button type="button" className="link-btn" onClick={() => trocarModo('entrar')}>
                      {a.links.voltar}
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>

        <DemoXp className="entrar__demo" />
      </div>
    </main>
  )
}
