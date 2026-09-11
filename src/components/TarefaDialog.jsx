import { useId, useRef, useState } from 'react'
import { Dialogo } from './Dialogo'
import { Aviso } from './AuthParts'
import { SeletorTags } from './SeletorTags'
import { mensagemErroDados } from '../lib/dadosErros'
import { t } from '../i18n/pt-BR'

const f = t.formTarefa

export function TarefaDialog({ tarefa, categorias, tags = [], colunas = [], categoriaPadrao, onFechar, onSalvar, onExcluir, onCriarCategoria, onCriarTag }) {
  const ref = useRef(null)
  const id = useId()
  const [titulo, setTitulo] = useState(tarefa?.titulo ?? '')
  const [descricao, setDescricao] = useState(tarefa?.descricao ?? '')
  const [tagIds, setTagIds] = useState(tarefa?.tag_ids ?? [])
  const [idSalvo, setIdSalvo] = useState(tarefa?.id)
  // Coluna do Kanban (só para pendentes, e só quando o usuário criou colunas próprias).
  const [colunaId, setColunaId] = useState(tarefa?.column_id ?? '')
  const mostrarColuna = colunas.length > 0 && tarefa?.status !== 'concluida'
  const alternarTag = (tagId, marcar) => setTagIds((atuais) => (marcar ? [...new Set([...atuais, tagId])] : atuais.filter((x) => x !== tagId)))
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
      await onSalvar({
        id: idSalvo,
        titulo,
        descricao,
        categoriaId,
        dataPrevista: data,
        tagIds,
        ...(mostrarColuna ? { colunaId: colunas.some((c) => c.id === colunaId) ? colunaId : null } : {}),
      })
      fechar()
    } catch (e) {
      // A tarefa foi criada e só as tags falharam: tentar de novo salva a mesma tarefa.
      if (e?.tarefaSalva) setIdSalvo(e.tarefaSalva.id)
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

          <div className="field">
            <label className="label" htmlFor={`${id}-desc`}>
              {f.descricao}
            </label>
            <textarea
              id={`${id}-desc`}
              className="input textarea"
              rows={3}
              maxLength={1000}
              placeholder={f.descricaoExemplo}
              aria-describedby={`${id}-descd`}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
            <span className="hint" id={`${id}-descd`}>
              {f.descricaoDica}
            </span>
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

          {mostrarColuna && (
            <div className="field">
              <label className="label" htmlFor={`${id}-col`}>
                {t.tarefas.kanban.campo}
              </label>
              <span className="select">
                <select id={`${id}-col`} className="input" value={colunaId} onChange={(e) => setColunaId(e.target.value)}>
                  <option value="">{t.tarefas.kanban.pendentes}</option>
                  {colunas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </span>
            </div>
          )}

          <SeletorTags tags={tags} selecionadas={tagIds} onAlternar={alternarTag} onCriar={onCriarTag} />

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
