import { useId, useRef, useState } from 'react'
import { Dialogo } from './Dialogo'
import { Aviso } from './AuthParts'
import { mensagemErroDados } from '../lib/dadosErros'
import { t } from '../i18n/pt-BR'

const f = t.formCategoria

export function CategoriaDialog({ categoria, totalTarefas, onFechar, onSalvar, onExcluir }) {
  const ref = useRef(null)
  const id = useId()
  const [nome, setNome] = useState(categoria?.nome ?? '')
  const [cor, setCor] = useState(categoria?.cor ?? f.cores[0].valor)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)
  const fechar = () => ref.current?.close()

  async function enviar(evento) {
    evento.preventDefault()
    setSalvando(true)
    setErro(null)
    try {
      await onSalvar({ id: categoria?.id, nome, cor })
      fechar()
    } catch (e) {
      setErro(mensagemErroDados(e))
      setSalvando(false)
    }
  }

  async function excluir() {
    // A FK impede excluir categoria com tarefas; explica antes de tentar.
    if (totalTarefas > 0) {
      setErro(f.emUso(totalTarefas))
      return
    }
    try {
      await onExcluir(categoria.id)
      fechar()
    } catch (e) {
      setErro(mensagemErroDados(e))
    }
  }

  return (
    <Dialogo tituloId={`${id}-titulo`} onFechar={onFechar} dialogoRef={ref}>
      <h2 id={`${id}-titulo`} className="dialogo__titulo">
        {categoria ? f.editarTitulo : f.novaTitulo}
      </h2>
      <form className="form" onSubmit={enviar}>
        <div className="field">
          <label className="label" htmlFor={`${id}-n`}>
            {f.nome}
          </label>
          <input
            id={`${id}-n`}
            className="input"
            required
            maxLength={60}
            autoFocus
            placeholder={f.nomeExemplo}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <fieldset className="cores">
          <legend className="label">{f.cor}</legend>
          <div className="cores__opcoes">
            {f.cores.map((opcao) => (
              <label key={opcao.valor} className="cor" title={opcao.nome}>
                <input
                  type="radio"
                  name={`${id}-cor`}
                  className="visually-hidden"
                  value={opcao.valor}
                  checked={cor === opcao.valor}
                  onChange={() => setCor(opcao.valor)}
                />
                <span className="cor__amostra" style={{ '--c': opcao.valor }} />
                <span className="visually-hidden">{opcao.nome}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {erro && <Aviso>{erro}</Aviso>}

        <div className="dialogo__acoes">
          {categoria && (
            <button type="button" className="dialogo__excluir" onClick={excluir}>
              {f.excluir}
            </button>
          )}
          <button type="button" className="link-btn" onClick={fechar}>
            {f.cancelar}
          </button>
          <button className="btn" type="submit" disabled={salvando}>
            {salvando ? f.salvando : categoria ? f.salvar : f.criar}
          </button>
        </div>
      </form>
    </Dialogo>
  )
}
