import { useState } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { mensagemDeErro } from '../lib/authErrors'
import { BoardingPass } from '../components/BoardingPass'
import { Aviso, CampoSenha } from '../components/AuthParts'
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

  const email = session?.user?.email ?? ''

  return (
    <main className="auth">
      <BoardingPass tag={t.pass.tags.redefinir} email={email}>
        <header className="pass__head">
          <h1 className="wordmark">{t.app.nome}</h1>
        </header>

        {!session ? (
          <div className="auth__panel" role="status">
            <h2 className="auth__title">{a.redefinir.expiradoTitulo}</h2>
            <p className="auth__text">{a.redefinir.expirado}</p>
            <div className="form__foot">
              <button type="button" className="link-btn" onClick={() => navigate('/entrar', { replace: true })}>
                {a.links.voltar}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="auth__panel">
              <h2 className="auth__title">{a.redefinir.titulo}</h2>
              <p className="auth__text">{a.redefinir.texto}</p>
            </div>
            <form className="form" onSubmit={enviar}>
              <div className="form__fields">
                <CampoSenha rotulo={a.campos.novaSenha} valor={senha} aoMudar={setSenha} novaSenha dica={a.dicaSenha} />
                <CampoSenha
                  rotulo={a.campos.repetirSenha}
                  valor={repetida}
                  aoMudar={setRepetida}
                  novaSenha
                  nome="senha-repetida"
                />
              </div>
              {erro && <Aviso>{erro}</Aviso>}
              <div className="form__foot">
                <button className="btn" type="submit" disabled={enviando}>
                  {enviando ? a.botoes.salvando : a.botoes.salvarSenha}
                </button>
              </div>
            </form>
          </>
        )}
      </BoardingPass>
    </main>
  )
}
