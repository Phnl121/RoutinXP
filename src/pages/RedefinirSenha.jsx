import { useState } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { mensagemDeErro } from '../lib/authErrors'
import { Aviso, CampoSenha } from '../components/AuthParts'
import { Logo } from '../components/Logo'
import { t } from '../i18n/pt-BR'
import './auth.css'

const a = t.auth

// Chega aqui pelo link do e-mail de "esqueci minha senha"; o Supabase já abriu uma sessão de recuperação.
export default function RedefinirSenha({ session, aoConcluir }) {
  const navigate = useNavigate()
  const [senha, setSenha] = useState('')
  const [repetida, setRepetida] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  async function enviar(evento) {
    evento.preventDefault()
    if (senha !== repetida) {
      setErro(a.redefinir.naoConfere)
      return
    }
    setEnviando(true)
    setErro(null)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setEnviando(false)
    if (error) {
      setErro(mensagemDeErro(error))
      return
    }
    aoConcluir()
    navigate('/', { replace: true })
  }

  return (
    <main className="auth-simples">
      <div className="auth-simples__col">
        <Logo />
        <div className="entrar__form panel">
          {!session ? (
            <div role="status">
              <h1 className="auth__title">{a.redefinir.expiradoTitulo}</h1>
              <p className="auth__text">{a.redefinir.expirado}</p>
              <div className="form__foot">
                <button type="button" className="link-btn" onClick={() => navigate('/entrar', { replace: true })}>
                  {a.links.voltar}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="auth__title">{a.redefinir.titulo}</h1>
              <p className="auth__text">{a.redefinir.texto}</p>
              <form className="form" onSubmit={enviar}>
                <CampoSenha rotulo={a.campos.novaSenha} valor={senha} aoMudar={setSenha} novaSenha dica={a.dicaSenha} />
                <CampoSenha
                  rotulo={a.campos.repetirSenha}
                  valor={repetida}
                  aoMudar={setRepetida}
                  novaSenha
                  nome="senha-repetida"
                />
                {erro && <Aviso>{erro}</Aviso>}
                <div className="form__foot">
                  <button className="btn" type="submit" disabled={enviando}>
                    {enviando ? a.botoes.salvando : a.botoes.salvarSenha}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
