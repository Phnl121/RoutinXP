import { IconeLupa } from './icones'
import { PRAZOS, alternar } from '../lib/filtros'
import { t } from '../i18n/pt-BR'

const f = t.tarefas.filtros

// Painel do filtro: busca pelo nome, categorias, tags e prazo. Vale para todas as visões.
export function FiltroTarefas({ id, filtro, onMudar, onLimpar, categorias, tags, resumo, ativos }) {
  const mudar = (campo, valor) => onMudar({ ...filtro, [campo]: valor })

  return (
    <div id={id} className="panel filtros">
      <div className="filtros__busca">
        <IconeLupa />
        <input
          className="input"
          type="search"
          autoFocus
          aria-label={f.busca}
          placeholder={f.busca}
          value={filtro.busca}
          onChange={(e) => mudar('busca', e.target.value)}
        />
      </div>

      <fieldset className="filtros__grupo">
        <legend className="label">{f.categorias}</legend>
        <div className="tags-opcoes">
          {categorias.map((c) => (
            <button
              key={c.id}
              type="button"
              className="tag-chip"
              aria-pressed={filtro.categorias.includes(c.id)}
              onClick={() => mudar('categorias', alternar(filtro.categorias, c.id))}
            >
              <span className="dot" style={{ background: c.cor }} />
              {c.nome}
            </button>
          ))}
        </div>
      </fieldset>

      {tags.length > 0 && (
        <fieldset className="filtros__grupo">
          <legend className="label">{f.tags}</legend>
          <div className="tags-opcoes">
            {tags.map((g) => (
              <button
                key={g.id}
                type="button"
                className="tag-chip"
                aria-pressed={filtro.tags.includes(g.id)}
                onClick={() => mudar('tags', alternar(filtro.tags, g.id))}
              >
                <span className="tag-marca" style={{ '--c': g.cor }} />
                {g.nome}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="filtros__grupo">
        <legend className="label">{f.prazo}</legend>
        <div className="tags-opcoes">
          {PRAZOS.map((p) => (
            <button key={p || 'qualquer'} type="button" className="tag-chip" aria-pressed={filtro.prazo === p} onClick={() => mudar('prazo', p)}>
              {f.prazos[p || 'qualquer']}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="filtros__rodape">
        <span className="hint" role="status">
          {resumo}
        </span>
        {ativos > 0 && (
          <button type="button" className="link-btn" onClick={onLimpar}>
            {f.limpar}
          </button>
        )}
      </div>
    </div>
  )
}
