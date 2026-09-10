import { IconeLapis, IconeMais } from './icones'
import { t } from '../i18n/pt-BR'

// Trilho de categorias: filtra a lista/quadro. Desktop: coluna lateral. Celular: chips roláveis.
export function Trilho({ categorias, pendentesPorCategoria, totalPendentes, selecionada, onSelecionar, onNova, onEditar }) {
  return (
    <nav className="trilho" aria-label={t.trilho.titulo}>
      <h2 className="label trilho__titulo">{t.trilho.titulo}</h2>
      <ul className="trilho__lista">
        <li className="trilho__li">
          <button
            type="button"
            className="trilho__item"
            aria-current={selecionada === null ? 'true' : undefined}
            onClick={() => onSelecionar(null)}
          >
            <span className="trilho__nome">{t.trilho.todas}</span>
            <span className="trilho__n">
              {totalPendentes}
              <span className="visually-hidden"> {t.trilho.pendentes}</span>
            </span>
          </button>
        </li>
        {categorias.map((c) => (
          <li key={c.id} className="trilho__li trilho__li--cat">
            <button
              type="button"
              className="trilho__item"
              aria-current={selecionada === c.id ? 'true' : undefined}
              onClick={() => onSelecionar(c.id)}
            >
              <span className="dot" style={{ background: c.cor }} />
              <span className="trilho__nome">{c.nome}</span>
              <span className="trilho__n">
                {pendentesPorCategoria[c.id] ?? 0}
                <span className="visually-hidden"> {t.trilho.pendentes}</span>
              </span>
            </button>
            <button type="button" className="trilho__editar" onClick={() => onEditar(c)} aria-label={t.trilho.editar(c.nome)}>
              <IconeLapis />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="trilho__nova" onClick={onNova}>
        <IconeMais />
        {t.trilho.nova}
      </button>
    </nav>
  )
}
