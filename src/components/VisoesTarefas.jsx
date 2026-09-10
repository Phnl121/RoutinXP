import { useState } from 'react'
import { LinhaTarefa } from './LinhaTarefa'
import { t } from '../i18n/pt-BR'

const tt = t.tarefas

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
    <div className="panel lista">
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

// Quadro: arrastar uma pendente para Concluídas conclui a tarefa. Não há volta (decisão da v1).
export function Quadro({ pendentes, concluidas, categoriasPorId, tagsPorId, mostrarCategoria, recem, acoes }) {
  const [alvo, setAlvo] = useState(false)

  return (
    <div className="quadro">
      <section className="panel coluna" aria-labelledby="coluna-pendentes">
        <h2 id="coluna-pendentes" className="label coluna__titulo">
          {tt.filtro.pendentes} · {pendentes.length}
        </h2>
        {pendentes.length ? (
          <Linhas
            tarefas={pendentes}
            categoriasPorId={categoriasPorId}
            tagsPorId={tagsPorId}
            mostrarCategoria={mostrarCategoria}
            arrastavel
            recem={recem}
            acoes={acoes}
          />
        ) : (
          <p className="coluna__vazio">{tt.vazio.pendentes}</p>
        )}
      </section>

      <section
        className="panel coluna"
        aria-labelledby="coluna-concluidas"
        data-alvo={alvo}
        onDragOver={(evento) => {
          if (!evento.dataTransfer.types.includes('text/plain')) return
          evento.preventDefault()
          evento.dataTransfer.dropEffect = 'move'
          setAlvo(true)
        }}
        onDragLeave={(evento) => {
          if (!evento.currentTarget.contains(evento.relatedTarget)) setAlvo(false)
        }}
        onDrop={(evento) => {
          evento.preventDefault()
          setAlvo(false)
          const id = evento.dataTransfer.getData('text/plain')
          // O "+XP" sai do ponto onde a tarefa foi solta.
          if (id) acoes.onConcluir(id, { left: evento.clientX, top: evento.clientY, width: 0, height: 0 })
        }}
      >
        <h2 id="coluna-concluidas" className="label coluna__titulo">
          {tt.filtro.concluidas} · {concluidas.length}
        </h2>
        {alvo && <p className="coluna__soltar">{tt.soltar}</p>}
        {concluidas.length ? (
          <Linhas tarefas={concluidas} categoriasPorId={categoriasPorId} tagsPorId={tagsPorId} mostrarCategoria={mostrarCategoria} recem={recem} acoes={acoes} />
        ) : (
          !alvo && <p className="coluna__vazio">{tt.vazio.concluidas}</p>
        )}
      </section>
    </div>
  )
}
