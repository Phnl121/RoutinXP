import { useId, useRef, useState } from 'react'
import { Dialogo } from './Dialogo'
import { Aviso } from './AuthParts'
import { mensagemErroDados } from '../lib/dadosErros'
import { t } from '../i18n/pt-BR'

const g = t.financeiro.regras

// Regras de categoria: criar ("descrição contém X → categoria Y"), ver, excluir e aplicar agora.
// Com `sugestao` ({ termo, categoria_id, tipo }), abre com a nova regra já preenchida.
export function RegrasDialog({ regras, categorias, sugestao, onSalvar, onExcluir, onAplicar, onFechar }) {
  const id = useId()
  const ref = useRef(null)
  const [termo, setTermo] = useState(sugestao?.termo ?? '')
  const [categoriaId, setCategoriaId] = useState(sugestao?.categoria_id ?? '')
  const [tipo, setTipo] = useState(sugestao?.tipo ?? '')
  const [salvando, setSalvando] = useState(false)
  const [aplicando, setAplicando] = useState(false)
  const [erro, setErro] = useState(null)
  const [status, setStatus] = useState(null)
  const fechar = () => ref.current?.close()
  const categoriaPorId = Object.fromEntries(categorias.map((c) => [c.id, c]))
  const ativas = categorias.filter((c) => !c.arquivada)
  // O tipo da regra acompanha a categoria: receita só vale para entradas, despesa para saídas.
  const tipoCategoria = categoriaPorId[categoriaId]?.tipo

  async function criar(evento) {
    evento.preventDefault()
    setSalvando(true)
    setErro(null)
    setStatus(null)
    try {
      const mudaram = await onSalvar({
        termo,
        categoria_id: categoriaId,
        tipo: tipo || (tipoCategoria === 'receita' ? 'entrada' : tipoCategoria === 'despesa' ? 'saida' : ''),
      })
      setTermo('')
      setStatus(g.criada(mudaram))
    } catch (e) {
      setErro(e?.code === '23505' ? g.duplicada : mensagemErroDados(e))
    } finally {
      setSalvando(false)
    }
  }

  async function aplicar() {
    setAplicando(true)
    setErro(null)
    try {
      setStatus(g.aplicadas(await onAplicar()))
    } catch (e) {
      setErro(mensagemErroDados(e))
    } finally {
      setAplicando(false)
    }
  }

  return (
    <Dialogo tituloId={`${id}-titulo`} dialogoRef={ref} onFechar={onFechar}>
      <h2 id={`${id}-titulo`} className="dialogo__titulo">
        {g.titulo}
      </h2>
      <p className="dialogo__texto">{g.texto}</p>

      <form className="form fin-regra-nova" onSubmit={criar}>
        <div className="field">
          <label className="label" htmlFor={`${id}-t`}>
            {g.termo}
          </label>
          <input
            id={`${id}-t`}
            className="input"
            required
            minLength={2}
            maxLength={60}
            autoFocus
            placeholder={g.termoExemplo}
            aria-describedby={`${id}-td`}
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
          />
          <span className="hint" id={`${id}-td`}>
            {g.termoDica}
          </span>
        </div>
        <div className="dialogo__campos">
          <div className="field">
            <label className="label" htmlFor={`${id}-c`}>
              {g.categoria}
            </label>
            <span className="select">
              <select id={`${id}-c`} className="input" required value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                <option value="" disabled>
                  {t.financeiro.formLancamento.escolha}
                </option>
                {['despesa', 'receita'].map((grupo) => (
                  <optgroup key={grupo} label={grupo === 'despesa' ? t.financeiro.formCategorias.despesas : t.financeiro.formCategorias.receitas}>
                    {ativas
                      .filter((c) => c.tipo === grupo)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </span>
          </div>
          <div className="field">
            <label className="label" htmlFor={`${id}-tp`}>
              {g.tipo}
            </label>
            <span className="select">
              <select id={`${id}-tp`} className="input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {['', 'saida', 'entrada']
                  .filter((v) => !v || !tipoCategoria || (tipoCategoria === 'receita') === (v === 'entrada'))
                  .map((v) => (
                    <option key={v} value={v}>
                      {g.tipos[v]}
                    </option>
                  ))}
              </select>
            </span>
          </div>
        </div>
        {erro && <Aviso>{erro}</Aviso>}
        <p className="hint fin-regras__status" role="status">
          {status ?? ''}
        </p>
        <div className="fin-regras__acoes">
          <button className="btn" type="submit" disabled={salvando}>
            {salvando ? g.salvando : g.criar}
          </button>
          <button type="button" className="link-btn" onClick={aplicar} disabled={aplicando}>
            {aplicando ? g.aplicando : g.aplicar}
          </button>
        </div>
      </form>

      {regras.length === 0 ? (
        <p className="hint">{g.vazio}</p>
      ) : (
        <ul className="fin-regras">
          {regras.map((regra) => {
            const categoria = categoriaPorId[regra.categoria_id]
            return (
              <li key={regra.id} className="fin-regras__item">
                <span className="fin-regras__texto">
                  <span className="fin-regras__termo">{regra.termo}</span>
                  <span className="hint">
                    → {categoria?.nome ?? '—'}
                    {regra.origem === 'sugerida' ? ` · ${g.sugerida}` : ''}
                  </span>
                </span>
                <button type="button" className="link-btn" onClick={() => onExcluir(regra.id).catch((e) => setErro(mensagemErroDados(e)))} aria-label={g.excluirRotulo(regra.termo)}>
                  {g.excluir}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="dialogo__acoes">
        <button type="button" className="botao-contorno" onClick={fechar}>
          {g.fechar}
        </button>
      </div>
    </Dialogo>
  )
}
