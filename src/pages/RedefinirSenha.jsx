import { useState } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { mensagemDeErro } from '../lib/authErrors'
import { Aviso, CampoSenha } from '../components/AuthParts'
import { Logo } from '../components/Logo'
import { t } from '../i18n/pt-BR'
import './auth.css'

const a = t.auth

// Chega aqui pelo link do e-mail de "esqueci minha senha" ou pelo link de convite; o Supabase já
// abriu a sessão. No convite a pessoa ainda não tem senha, então a tela diz "Crie sua senha".
export default function RedefinirSenha({ session, convite = false, aoConcluir }) {
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
        <div className="panel auth-simples__painel">
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
              <h1 className="auth__title">{convite ? a.redefinir.tituloConvite : a.redefinir.titulo}</h1>
              <p className="auth__text">{convite ? a.redefinir.textoConvite : a.redefinir.texto}</p>
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
                    {enviando ? a.botoes.salvando : convite ? a.botoes.criarSenha : a.botoes.salvarSenha}
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
