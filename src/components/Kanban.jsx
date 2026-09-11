import { useState } from 'react'
import { LinhaTarefa } from './LinhaTarefa'
import { IconeMais, IconeReticencias } from './icones'
import { ordenarConcluidas, ordenarPendentes } from '../lib/datas'
import { t } from '../i18n/pt-BR'

const k = t.tarefas.kanban

// Uma coluna do Kanban. Cor opcional: a coluna inteira ganha o tom; o card mantém a capa da categoria.
function Coluna({ coluna, tarefas, categoriasPorId, tagsPorId, recem, acoes, onSoltar, onEditar }) {
  const [alvo, setAlvo] = useState(false)
  const concluida = coluna.tipo === 'concluida'
  return (
    <section
      className="panel kanban__coluna"
      data-alvo={alvo}
      data-concluida={concluida}
      style={coluna.cor ? { '--cor-col': coluna.cor } : undefined}
      data-cor={Boolean(coluna.cor)}
      aria-label={`${coluna.nome}, ${k.contagem(tarefas.length)}`}
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
        if (id) onSoltar(id, coluna, { left: evento.clientX, top: evento.clientY, width: 0, height: 0 })
      }}
    >
      <header className="kanban__cabeca">
        <h2 className="label kanban__titulo">
          {coluna.nome} · {tarefas.length}
        </h2>
        <button type="button" className="kanban__editar" onClick={() => onEditar(coluna)} aria-label={k.editarColuna(coluna.nome)}>
          <IconeReticencias />
        </button>
      </header>
      {alvo && <p className="coluna__soltar">{concluida ? t.tarefas.soltar : k.soltarAqui}</p>}
      {tarefas.length ? (
        <ul className="linhas">
          {tarefas.map((tarefa) => (
            <LinhaTarefa
              key={tarefa.id}
              tarefa={tarefa}
              categoria={categoriasPorId[tarefa.category_id]}
              tags={(tarefa.tag_ids ?? []).map((id) => tagsPorId[id]).filter(Boolean)}
              arrastavel
              recem={recem === tarefa.id}
              {...acoes}
            />
          ))}
        </ul>
      ) : (
        !alvo && <p className="coluna__vazio">{concluida ? t.tarefas.vazio.concluidas : k.vazia}</p>
      )}
    </section>
  )
}

// Kanban: Pendentes, as colunas do usuário e Concluídas. Arrastar muda a coluna;
// soltar em Concluídas conclui a tarefa (XP), sem volta (decisão da v1).
export function Kanban({ tarefas, colunas, categoriasPorId, tagsPorId, recem, acoes, onMover, onEditarColuna, onNovaColuna }) {
  const fixa = (tipo) => colunas.find((c) => c.tipo === tipo)
  const pendente = fixa('pendente') ?? { id: 'pendente', tipo: 'pendente', nome: k.pendentes, cor: null }
  const concluida = fixa('concluida') ?? { id: 'concluida', tipo: 'concluida', nome: k.concluidas, cor: null }
  const doMeio = colunas.filter((c) => c.tipo === 'custom')
  const idsDoMeio = new Set(doMeio.map((c) => c.id))

  const pendentes = tarefas.filter((x) => x.status === 'pendente').sort(ordenarPendentes)
  const naColuna = (coluna) => {
    if (coluna.tipo === 'concluida') return tarefas.filter((x) => x.status === 'concluida').sort(ordenarConcluidas)
    if (coluna.tipo === 'pendente') return pendentes.filter((x) => !x.column_id || !idsDoMeio.has(x.column_id))
    return pendentes.filter((x) => x.column_id === coluna.id)
  }

  function soltar(id, coluna, origem) {
    if (coluna.tipo === 'concluida') acoes.onConcluir(id, origem)
    else onMover(id, coluna.tipo === 'pendente' ? null : coluna.id)
  }

  const props = { categoriasPorId, tagsPorId, recem, acoes, onSoltar: soltar, onEditar: onEditarColuna }
  return (
    <div className="kanban">
      {[pendente, ...doMeio, concluida].map((coluna) => (
        <Coluna key={coluna.id} coluna={coluna} tarefas={naColuna(coluna)} {...props} />
      ))}
      <button type="button" className="kanban__nova" onClick={onNovaColuna}>
        <IconeMais />
        {k.novaColuna}
      </button>
    </div>
  )
}
