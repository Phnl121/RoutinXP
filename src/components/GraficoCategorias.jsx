// Conclusões por categoria: barras horizontais verdes (magnitude). A cor da categoria
// aparece só no ponto ao lado do nome (regra do DESIGN.md), nunca na barra.
export function GraficoCategorias({ linhas }) {
  const maior = Math.max(...linhas.map((l) => l.total), 1)
  return (
    <ul className="cat-barras">
      {linhas.map(({ categoria, total }) => (
        <li key={categoria.id} className="cat-barras__linha">
          <span className="cat-barras__nome">
            <span className="dot" style={{ background: categoria.cor }} />
            <span className="cat-barras__texto">{categoria.nome}</span>
          </span>
          <span className="cat-barras__trilho" aria-hidden="true">
            <span className="cat-barras__barra" style={{ width: `${(total / maior) * 100}%` }} />
          </span>
          <span className="cat-barras__valor">{total}</span>
        </li>
      ))}
    </ul>
  )
}
