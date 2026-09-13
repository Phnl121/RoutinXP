import { Fragment, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { autenticadorCadastrado, confirmarCodigo, iniciarCadastroAutenticador } from '../lib/conta'
import { Aviso } from '../components/AuthParts'
import { Logo } from '../components/Logo'
import { t } from '../i18n/pt-BR'
import './auth.css'

const v = t.verificacao

function mensagem(erro) {
  const codigo = erro?.code ?? ''
  if (/verification_failed|invalid|expired/i.test(codigo) || erro?.status === 422) return v.erros.codigo
  if (erro?.status === 429) return t.auth.erros.limite
  return v.erros.geral
}

// Campo do código: só números, 6 dígitos, e o celular sugere o código recebido.
function CampoCodigo({ valor, aoMudar }) {
  return (
    <div className="field">
      <label className="label" htmlFor="verificacao-codigo">
        {v.campo}
      </label>
      <input
        id="verificacao-codigo"
        className="input verificacao__codigo"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        autoFocus
        required
        value={valor}
        onChange={(e) => aoMudar(e.target.value.replace(/\D/g, '').slice(0, 6))}
      />
    </div>
  )
}

// Verificação em duas etapas, obrigatória para todas as contas.
// modo 'autenticador': primeiro acesso, cadastra o app autenticador (QR code ou chave).
// modo 'codigo': acesso de sempre, pede o código de 6 dígitos.
export default function Verificacao({ modo, aoVerificar }) {
  const [fator, setFator] = useState(null) // { id, qr?, chave? }
  const [codigo, setCodigo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [copiada, setCopiada] = useState(false)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true
    const buscar = modo === 'autenticador' ? iniciarCadastroAutenticador() : autenticadorCadastrado()
    buscar.then(
      (f) => ativo && setFator(f),
      (e) => ativo && setErro(mensagem(e)),
    )
    return () => {
      ativo = false
    }
  }, [modo, tentativa])

  async function enviar(evento) {
    evento.preventDefault()
    if (codigo.length !== 6) {
      setErro(v.erros.formato)
      return
    }
    setEnviando(true)
    setErro(null)
    try {
      await confirmarCodigo(fator.id, codigo)
      aoVerificar()
    } catch (e) {
      setErro(mensagem(e))
      setCodigo('')
      setEnviando(false)
    }
  }

  async function copiarChave() {
    try {
      await navigator.clipboard.writeText(fator.chave)
      setCopiada(true)
    } catch {
      /* sem permissão de área de transferência: a chave continua visível para copiar à mão */
    }
  }

  const cadastro = modo === 'autenticador'

  return (
    <main className="auth-simples">
      <div className="auth-simples__col">
        <Logo />
        <div className="panel auth-simples__painel">
          <h1 className="auth__title">{cadastro ? v.tituloCadastro : v.tituloCodigo}</h1>
          <p className="auth__text">{cadastro ? v.textoCadastro : v.textoCodigo}</p>

          {cadastro && (
            <ol className="verificacao__passos">
              <li>{v.passo1}</li>
              <li>
                {v.passo2}
                {fator ? (
                  <div className="verificacao__qr">
                    <img src={fator.qr} alt={v.qrAlt} width="176" height="176" />
                    <div className="verificacao__chave">
                      <span className="label">{v.chave}</span>
                      {/* Em grupos de 4 para ler e digitar; o Copiar leva a chave sem espaços. */}
                      <code>
                        {fator.chave.match(/.{1,4}/g).map((grupo, i) => (
                          <Fragment key={i}>
                            <span className="verificacao__grupo">{grupo}</span>{' '}
                          </Fragment>
                        ))}
                      </code>
                      <button type="button" className="link-btn" onClick={copiarChave}>
                        {copiada ? v.copiada : v.copiar}
                      </button>
                    </div>
                  </div>
                ) : (
                  !erro && <p className="hint">{v.carregandoQr}</p>
                )}
              </li>
              <li>{v.passo3}</li>
            </ol>
          )}

          {fator ? (
            <form className="form" onSubmit={enviar}>
              <CampoCodigo valor={codigo} aoMudar={setCodigo} />
              {erro && <Aviso>{erro}</Aviso>}
              <div className="form__foot">
                <button className="btn" type="submit" disabled={enviando}>
                  {cadastro ? (enviando ? v.ativando : v.ativar) : enviando ? v.confirmando : v.confirmar}
                </button>
                <button type="button" className="link-btn" onClick={() => supabase.auth.signOut()}>
                  {v.sair}
                </button>
              </div>
            </form>
          ) : (
            erro && (
              <div className="form">
                <Aviso>{erro}</Aviso>
                <div className="form__foot">
                  <button type="button" className="btn" onClick={() => setTentativa((n) => n + 1)}>
                    {t.acesso.tentar}
                  </button>
                  <button type="button" className="link-btn" onClick={() => supabase.auth.signOut()}>
                    {v.sair}
                  </button>
                </div>
              </div>
            )
          )}

          {!cadastro && <p className="hint verificacao__perdeu">{v.perdeu}</p>}
        </div>
      </div>
    </main>
  )
}
