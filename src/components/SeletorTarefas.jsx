import { useId, useRef, useState } from 'react'
import { Dialogo } from './Dialogo'
import { IconeLupa } from './icones'
import { formatarPrazo, ordenarPendentes } from '../lib/datas'
import { alternar } from '../lib/filtros'
import { t } from '../i18n/pt-BR'

const ss = t.foco.seletor

const semAcento = (texto) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

// Janela para escolher as tarefas pendentes da sessão de foco (de qualquer categoria).
export function SeletorTarefas({ tarefas, categorias, onAdicionar, onFechar }) {
  const id = useId()
  const ref = useRef(null)
  const [busca, setBusca] = useState('')
  const [filtroCats, setFiltroCats] = useState([])
  const [marcadas, setMarcadas] = useState([])
  const categoriasPorId = Object.fromEntries(categorias.map((c) => [c.id, c]))
  const fechar = () => ref.current?.close()

  const termo = semAcento(busca.trim())
  const visiveis = tarefas
    .filter((x) => (!filtroCats.length || filtroCats.includes(x.category_id)) && (!termo || semAcento(x.titulo).includes(termo)))
    .sort(ordenarPendentes)

  function adicionar(evento) {
    evento.preventDefault()
    if (marcadas.length) onAdicionar(marcadas)
    fechar()
  }

  return (
    <Dialogo tituloId={`${id}-titulo`} dialogoRef={ref} onFechar={onFechar}>
      <h2 id={`${id}-titulo`} className="dialogo__titulo">
        {ss.titulo}
      </h2>
      {tarefas.length === 0 ? (
        <p className="dialogo__texto">{ss.nenhumaPendente}</p>
      ) : (
        <form className="seletor" onSubmit={adicionar}>
          <div className="filtros__busca">
            <IconeLupa />
            <input
              className="input"
              type="search"
              aria-label={ss.busca}
              placeholder={ss.busca}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <div className="tags-opcoes" role="group" aria-label={t.tarefas.filtros.categorias}>
            <button type="button" className="tag-chip" aria-pressed={filtroCats.length === 0} onClick={() => setFiltroCats([])}>
              {ss.todas}
            </button>
            {categorias.map((c) => (
              <button
                key={c.id}
                type="button"
                className="tag-chip"
                aria-pressed={filtroCats.includes(c.id)}
                onClick={() => setFiltroCats((atual) => alternar(atual, c.id))}
              >
                <span className="dot" style={{ background: c.cor }} />
                {c.nome}
              </button>
            ))}
          </div>

          {visiveis.length === 0 ? (
            <p className="seletor__vazio">{ss.vazio}</p>
          ) : (
            <ul className="seletor__lista">
              {visiveis.map((x) => {
                const categoria = categoriasPorId[x.category_id]
                const prazo = formatarPrazo(x.data_prevista)
                return (
                  <li key={x.id}>
                    <label className="seletor__item" style={categoria ? { '--cor-cat': categoria.cor } : undefined}>
                      <input
                        type="checkbox"
                        className="seletor__caixa"
                        checked={marcadas.includes(x.id)}
                        onChange={() => setMarcadas((atual) => alternar(atual, x.id))}
                      />
                      <span className="seletor__texto">
                        <span className="seletor__titulo">{x.titulo}</span>
                        <span className="linha__meta">
                          {categoria && (
                            <span className="linha__cat">
                              <span className="dot" style={{ background: categoria.cor }} />
                              {categoria.nome}
                            </span>
                          )}
                          {prazo.estado !== 'sem' && <span>{prazo.texto}</span>}
                        </span>
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="dialogo__acoes">
            <button type="button" className="link-btn" onClick={fechar}>
              {ss.cancelar}
            </button>
            <button type="submit" className="btn" disabled={!marcadas.length}>
              {ss.confirmar(marcadas.length)}
            </button>
          </div>
        </form>
      )}
    </Dialogo>
  )
}
