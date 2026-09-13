import { useState } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../lib/supabase'
import { confirmarTrocaDeSenha } from '../lib/conta'
import { mensagemDeErro } from '../lib/authErrors'
import { Aviso, CampoSenha } from '../components/AuthParts'
import { Logo } from '../components/Logo'
import { t } from '../i18n/pt-BR'
import './auth.css'

const a = t.auth

// Chega aqui pelo link do e-mail de "esqueci minha senha" ou pelo link de convite; o Supabase já
// abriu a sessão. No convite a pessoa ainda não tem senha, então a tela diz "Crie sua senha".
// provisoria: conta criada pelo painel, entrando com a senha provisória (troca obrigatória).
export default function RedefinirSenha({ session, convite = false, provisoria = false, aoConcluir }) {
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
    if (error) {
      setEnviando(false)
      setErro(mensagemDeErro(error))
      return
    }
    if (provisoria) {
      // O banco só libera a conta se a senha gravada for outra (a provisória não vale).
      try {
        if (!(await confirmarTrocaDeSenha())) {
          setEnviando(false)
          setErro(a.erros.mesmaSenha)
          return
        }
      } catch {
        setEnviando(false)
        setErro(a.erros.generico)
        return
      }
      aoConcluir()
      return
    }
    setEnviando(false)
    aoConcluir()
    navigate('/', { replace: true })
  }

  const titulo = provisoria ? a.redefinir.tituloProvisoria : convite ? a.redefinir.tituloConvite : a.redefinir.titulo
  const texto = provisoria ? a.redefinir.textoProvisoria : convite ? a.redefinir.textoConvite : a.redefinir.texto

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
              <h1 className="auth__title">{titulo}</h1>
              <p className="auth__text">{texto}</p>
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
                    {enviando ? a.botoes.salvando : convite || provisoria ? a.botoes.criarSenha : a.botoes.salvarSenha}
                  </button>
                  {provisoria && (
                    <button type="button" className="link-btn" onClick={() => supabase.auth.signOut()}>
                      {t.verificacao.sair}
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
