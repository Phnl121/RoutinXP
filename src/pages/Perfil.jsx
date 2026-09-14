import { useState } from 'react'
import { useOutletContext } from 'react-router'
import { supabase } from '../lib/supabase'
import { useDadosApp } from '../lib/dadosContexto'
import { PERFIL_VAZIO, validarPerfil } from '../lib/perfil'
import { mensagemErroDados } from '../lib/dadosErros'
import { CamposPerfil } from '../components/CamposPerfil'
import { Aviso } from '../components/AuthParts'
import { t } from '../i18n/pt-BR'
import { TEMAS, useTema } from '../lib/tema'

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

// Tema do app: sistema, claro ou escuro (salvo neste navegador).
function Aparencia() {
  const [preferencia, , mudar] = useTema()
  return (
    <section className="panel pagina__painel" aria-labelledby="perfil-tema">
      <h2 id="perfil-tema" className="label">
        {t.tema.titulo}
      </h2>
      <div className="tema-escolha" role="radiogroup" aria-label={t.tema.rotulo}>
        {TEMAS.map((opcao) => (
          <button
            key={opcao}
            type="button"
            role="radio"
            aria-checked={preferencia === opcao}
            className="tema-escolha__opcao"
            data-opcao={opcao}
            onClick={() => mudar(opcao)}
          >
            <span className="tema-escolha__amostra" aria-hidden="true">
              <span />
              <span />
            </span>
            {t.tema.opcoes[opcao]}
          </button>
        ))}
      </div>
      <p className="hint">{t.tema.dica}</p>
    </section>
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

      <Aparencia />

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
