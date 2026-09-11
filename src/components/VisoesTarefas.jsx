import { LinhaTarefa } from './LinhaTarefa'

function Linhas({ tarefas, categoriasPorId, tagsPorId = {}, mostrarCategoria, arrastavel, recem, acoes }) {
  return (
    <ul className="linhas">
      {tarefas.map((tarefa) => (
        <LinhaTarefa
          key={tarefa.id}
          tarefa={tarefa}
          categoria={categoriasPorId[tarefa.category_id]}
          tags={(tarefa.tag_ids ?? []).map((tagId) => tagsPorId[tagId]).filter(Boolean)}
          mostrarCategoria={mostrarCategoria}
          arrastavel={arrastavel}
          recem={recem === tarefa.id}
          {...acoes}
        />
      ))}
    </ul>
  )
}

// Lista agrupada por categoria (com "Todas") ou de uma categoria só.
export function Lista({ grupos, mostrarTitulos, vazio, categoriasPorId, tagsPorId, recem, acoes }) {
  const total = grupos.reduce((n, g) => n + g.tarefas.length, 0)
  return (
    <div className="lista">
      {total === 0 ? (
        <p className="lista__vazio">{vazio}</p>
      ) : (
        grupos.map((g) => (
          <section key={g.categoria.id} className="grupo" aria-label={g.categoria.nome}>
            {mostrarTitulos && (
              <h2 className="label grupo__titulo">
                <span className="dot" style={{ background: g.categoria.cor }} />
                {g.categoria.nome} · {g.tarefas.length}
              </h2>
            )}
            <Linhas
              tarefas={g.tarefas}
              categoriasPorId={categoriasPorId}
              tagsPorId={tagsPorId}
              mostrarCategoria={!mostrarTitulos}
              recem={recem}
              acoes={acoes}
            />
          </section>
        ))
      )}
    </div>
  )
}
