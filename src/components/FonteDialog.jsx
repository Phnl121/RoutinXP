import { useId, useRef, useState } from 'react'
import { Dialogo } from './Dialogo'
import { Aviso } from './AuthParts'
import { mensagemIntegracao } from '../lib/integracoes'
import { rotuloDiaMes, rotuloDiaSemana } from '../lib/painel'
import { t } from '../i18n/pt-BR'

const i = t.integracoes
const f = i.form
const CORES = t.formCategoria.cores
const NOVA_TAG = '__nova'

const linkValido = (url) => /^(https|webcal):\/\/\S+$/i.test(url.trim())

// Conectar ou editar um calendário (link .ics de uma disciplina).
export function FonteDialog({ fonte, categorias, tags, onFechar, onSalvar, onExcluir, onCriarTag, onPrevia }) {
  const ref = useRef(null)
  const id = useId()
  const faculdade = categorias.find((c) => /faculdade/i.test(c.nome))
  const [nome, setNome] = useState(fonte?.nome ?? '')
  const [url, setUrl] = useState('')
  const [trocandoLink, setTrocandoLink] = useState(!fonte)
  const [categoriaId, setCategoriaId] = useState(fonte?.category_id ?? faculdade?.id ?? categorias[0]?.id ?? '')
  const [tagId, setTagId] = useState(fonte ? (fonte.tag_id ?? '') : NOVA_TAG)
  const [passadas, setPassadas] = useState(fonte?.importar_passadas ?? false)
  const [previa, setPrevia] = useState(null) // { carregando } | { dados } | { erro }
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)
  const [removendo, setRemovendo] = useState(false)
  const [apagarPendentes, setApagarPendentes] = useState(false)
  const fechar = () => ref.current?.close()

  const tagExistente = tags.find((g) => g.nome.toLowerCase() === nome.trim().toLowerCase())
  const podeNovaTag = nome.trim() && !tagExistente

  async function testar() {
    if (!linkValido(url)) {
      setPrevia({ erro: i.erros.link_invalido })
      return
    }
    setPrevia({ carregando: true })
    try {
      setPrevia({ dados: await onPrevia(url) })
    } catch (e) {
      setPrevia({ erro: mensagemIntegracao(e) })
    }
  }

  async function enviar(evento) {
    evento.preventDefault()
    if (trocandoLink && !linkValido(url)) {
      setErro(i.erros.link_invalido)
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      let tagFinal = tagId
      if (tagId === NOVA_TAG) {
        if (tagExistente) tagFinal = tagExistente.id
        else if (nome.trim()) {
          const usadas = new Set(tags.map((g) => g.cor))
          const cor = (CORES.find((c) => !usadas.has(c.valor)) ?? CORES[0]).valor
          tagFinal = (await onCriarTag({ nome: nome.trim().slice(0, 40), cor })).id
        } else tagFinal = ''
      }
      await onSalvar({
        id: fonte?.id,
        nome,
        url: trocandoLink ? url : null,
        categoriaId,
        tagId: tagFinal,
        importarPassadas: passadas,
      })
      fechar()
    } catch (e) {
      setErro(mensagemIntegracao(e))
      setSalvando(false)
    }
  }

  async function remover() {
    try {
      await onExcluir(fonte.id, apagarPendentes)
      fechar()
    } catch (e) {
      setErro(mensagemIntegracao(e))
    }
  }

  return (
    <Dialogo tituloId={`${id}-titulo`} onFechar={onFechar} dialogoRef={ref}>
      <h2 id={`${id}-titulo`} className="dialogo__titulo">
        {removendo ? f.remover : fonte ? f.editarTitulo : f.novaTitulo}
      </h2>

      {categorias.length === 0 ? (
        <>
          <p className="dialogo__texto">{f.semCategoria}</p>
          <div className="dialogo__acoes">
            <button type="button" className="btn" onClick={fechar}>
              {f.cancelar}
            </button>
          </div>
        </>
      ) : removendo ? (
        <>
          <fieldset className="opcoes-remover">
            <legend className="dialogo__texto">{f.removerTitulo}</legend>
            <label className="opcao">
              <input type="radio" name={`${id}-rem`} checked={!apagarPendentes} onChange={() => setApagarPendentes(false)} />
              {f.manter}
            </label>
            <label className="opcao">
              <input type="radio" name={`${id}-rem`} checked={apagarPendentes} onChange={() => setApagarPendentes(true)} />
              {f.apagar}
            </label>
          </fieldset>
          {erro && <Aviso>{erro}</Aviso>}
          <div className="dialogo__acoes">
            <button type="button" className="link-btn" onClick={() => setRemovendo(false)}>
              {f.cancelar}
            </button>
            <button type="button" className="btn" onClick={remover}>
              {f.confirmarRemover}
            </button>
          </div>
        </>
      ) : (
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

          <div className="field">
            <label className="label" htmlFor={`${id}-u`}>
              {f.link}
            </label>
            {trocandoLink ? (
              <>
                <div className="link-teste">
                  <input
                    id={`${id}-u`}
                    className="input"
                    required
                    inputMode="url"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={f.linkExemplo}
                    aria-describedby={`${id}-ud`}
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value)
                      setPrevia(null)
                    }}
                  />
                  <button type="button" className="link-btn" onClick={testar} disabled={!url.trim() || previa?.carregando}>
                    {f.testar}
                  </button>
                </div>
                <span className="hint" id={`${id}-ud`}>
                  {f.linkDica}
                </span>
              </>
            ) : (
              <div className="link-salvo">
                <span>{f.linkSalvo(fonte.dominio)}</span>
                <button type="button" className="link-btn" onClick={() => setTrocandoLink(true)}>
                  {f.trocarLink}
                </button>
              </div>
            )}
          </div>

          {previa && (
            <div className="previa" role="status">
              {previa.carregando && <p className="hint">{f.testando}</p>}
              {previa.erro && <Aviso>{previa.erro}</Aviso>}
              {previa.dados && (
                <>
                  <p className="hint">{f.previa(previa.dados.total, previa.dados.futuras)}</p>
                  {previa.dados.proximas.length === 0 ? (
                    <p className="hint">{f.previaVazia}</p>
                  ) : (
                    <ul className="previa__lista">
                      {previa.dados.proximas.map((a) => (
                        <li key={`${a.data}-${a.titulo}`}>
                          <span className="previa__titulo">{a.titulo}</span>
                          <span className="previa__data">
                            {rotuloDiaSemana(a.data)}, {rotuloDiaMes(a.data)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}

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
              <label className="label" htmlFor={`${id}-g`}>
                {f.tag}
              </label>
              <span className="select">
                <select id={`${id}-g`} className="input" value={tagId} onChange={(e) => setTagId(e.target.value)}>
                  <option value="">{f.semTag}</option>
                  {(podeNovaTag || tagId === NOVA_TAG) && <option value={NOVA_TAG}>{f.novaTag(nome.trim() || '…')}</option>}
                  {tags.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nome}
                    </option>
                  ))}
                </select>
              </span>
            </div>
          </div>

          <label className="opcao">
            <input type="checkbox" checked={passadas} onChange={(e) => setPassadas(e.target.checked)} />
            {f.passadas}
          </label>

          {erro && <Aviso>{erro}</Aviso>}

          <div className="dialogo__acoes">
            {fonte && (
              <button type="button" className="dialogo__excluir" onClick={() => setRemovendo(true)}>
                {f.remover}
              </button>
            )}
            <button type="button" className="link-btn" onClick={fechar}>
              {f.cancelar}
            </button>
            <button className="btn" type="submit" disabled={salvando}>
              {salvando ? f.salvando : fonte ? f.salvar : f.conectar}
            </button>
          </div>
        </form>
      )}
    </Dialogo>
  )
}
