import { useState } from 'react'
import { useOutletContext } from 'react-router'
import { supabase } from '../lib/supabase'
import { useDadosApp } from '../lib/dadosContexto'
import { PERFIL_VAZIO, validarPerfil } from '../lib/perfil'
import { mensagemErroDados } from '../lib/dadosErros'
import { CamposPerfil } from '../components/CamposPerfil'
import { Aviso } from '../components/AuthParts'
import { t } from '../i18n/pt-BR'

const p = t.perfil

function FormPerfil({ inicial, salvar }) {
  const [valores, setValores] = useState(inicial ?? PERFIL_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)
  const [salvo, setSalvo] = useState(false)

  async function enviar(evento) {
    evento.preventDefault()
    const problema = validarPerfil(valores)
    if (problema) {
      setErro(problema)
      return
    }
    setSalvando(true)
    setErro(null)
    setSalvo(false)
    try {
      await salvar(valores)
      setSalvo(true)
    } catch (e) {
      setErro(mensagemErroDados(e))
    }
    setSalvando(false)
  }

  return (
    <form className="form" onSubmit={enviar}>
      <CamposPerfil
        id="perfil"
        valores={valores}
        aoMudar={(campo, valor) => {
          setValores((v) => ({ ...v, [campo]: valor }))
          setSalvo(false)
        }}
      />
      {erro && <Aviso>{erro}</Aviso>}
      <div className="perfil__acoes">
        <button className="btn" type="submit" disabled={salvando}>
          {salvando ? p.salvando : p.salvar}
        </button>
        {salvo && (
          <span className="perfil__salvo" role="status">
            {p.salvo}
          </span>
        )}
      </div>
    </form>
  )
}

export default function Perfil() {
  const d = useDadosApp()
  const { session } = useOutletContext()
  const completo = Boolean(d.perfil)

  return (
    <main className="pagina">
      <h1 className="main__titulo">{completo ? p.titulo : p.tituloCompletar}</h1>

      <section className="panel pagina__painel" aria-labelledby="perfil-dados">
        {!completo && <p className="pagina__texto">{p.textoCompletar}</p>}
        <h2 id="perfil-dados" className="visually-hidden">
          {p.titulo}
        </h2>
        {d.estado === 'carregando' ? (
          <p className="label">{t.app.carregando}</p>
        ) : (
          <FormPerfil key={completo ? 'com-perfil' : 'sem-perfil'} inicial={d.perfil} salvar={d.salvarPerfil} />
        )}
      </section>

      <section className="panel pagina__painel" aria-labelledby="perfil-conta">
        <h2 id="perfil-conta" className="label">
          {p.conta}
        </h2>
        <dl className="perfil__conta">
          <dt className="hint">{p.email}</dt>
          <dd>{session.user.email}</dd>
        </dl>
        {/* A casca só abre depois do código do autenticador: aqui a verificação sempre está ativa. */}
        <p className="hint">{t.verificacao.ativa}</p>
        <button type="button" className="link-btn" onClick={() => supabase.auth.signOut()}>
          {p.sair}
        </button>
      </section>
    </main>
  )
}
