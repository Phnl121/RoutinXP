import { useId, useRef, useState } from 'react'
import { Dialogo } from './Dialogo'
import { Aviso } from './AuthParts'
import { mensagemErroDados } from '../lib/dadosErros'
import { t } from '../i18n/pt-BR'

const f = t.formTarefa

export function TarefaDialog({ tarefa, categorias, categoriaPadrao, onFechar, onSalvar, onExcluir, onCriarCategoria }) {
  const ref = useRef(null)
  const id = useId()
  const [titulo, setTitulo] = useState(tarefa?.titulo ?? '')
  const [categoriaId, setCategoriaId] = useState(tarefa?.category_id ?? categoriaPadrao ?? categorias[0]?.id ?? '')
  const [data, setData] = useState(tarefa?.data_prevista ?? '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)
  const fechar = () => ref.current?.close()

  async function enviar(evento) {
    evento.preventDefault()
    setSalvando(true)
    setErro(null)
    try {
      await onSalvar({ id: tarefa?.id, titulo, categoriaId, dataPrevista: data })
      fechar()
    } catch (e) {
      setErro(mensagemErroDados(e))
      setSalvando(false)
    }
  }

  return (
    <Dialogo tituloId={`${id}-titulo`} onFechar={onFechar} dialogoRef={ref}>
      <h2 id={`${id}-titulo`} className="dialogo__titulo">
        {tarefa ? f.editarTitulo : f.novaTitulo}
      </h2>

      {categorias.length === 0 ? (
        <>
          <p className="dialogo__texto">{f.semCategoria}</p>
          <div className="dialogo__acoes">
            <button type="button" className="link-btn" onClick={fechar}>
              {f.cancelar}
            </button>
            <button type="button" className="btn" onClick={onCriarCategoria}>
              {f.criarCategoria}
            </button>
          </div>
        </>
      ) : (
        <form className="form" onSubmit={enviar}>
          <div className="field">
            <label className="label" htmlFor={`${id}-t`}>
              {f.titulo}
            </label>
            <input
              id={`${id}-t`}
              className="input"
              required
              maxLength={200}
              autoFocus
              placeholder={f.tituloExemplo}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>

          <div className="dialogo__campos">
            <div className="field">
              <label className="label" htmlFor={`${id}-c`}>
                {f.categoria}
              </label>
              <span className="select">
                <select id={`${id}-c`} className="input" required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </span>
            </div>

            <div className="field">
              <label className="label" htmlFor={`${id}-d`}>
                {f.data}
              </label>
              <input
                id={`${id}-d`}
                className="input"
                type="date"
                value={data}
                aria-describedby={`${id}-dd`}
                onChange={(e) => setData(e.target.value)}
              />
              <span className="hint" id={`${id}-dd`}>
                {f.dataDica}
              </span>
            </div>
          </div>

          {erro && <Aviso>{erro}</Aviso>}

          <div className="dialogo__acoes">
            {tarefa && (
              <button
                type="button"
                className="dialogo__excluir"
                onClick={() => {
                  onExcluir(tarefa.id)
                  fechar()
                }}
              >
                {f.excluir}
              </button>
            )}
            <button type="button" className="link-btn" onClick={fechar}>
              {f.cancelar}
            </button>
            <button className="btn" type="submit" disabled={salvando}>
              {salvando ? f.salvando : tarefa ? f.salvar : f.criar}
            </button>
          </div>
        </form>
      )}
    </Dialogo>
  )
}
