import { useState } from 'react'
import { formatarPrazo } from '../lib/datas'
import { IconeCheck } from './icones'
import { t } from '../i18n/pt-BR'

const tt = t.tarefas

export function LinhaTarefa({ tarefa, categoria, tags = [], mostrarCategoria = true, arrastavel = false, recem = false, onConcluir, onEditar, onExcluir }) {
  const feita = tarefa.status === 'concluida'
  const [arrastando, setArrastando] = useState(false)
  const mostrarCat = mostrarCategoria && Boolean(categoria)
  const prazo = feita ? null : formatarPrazo(tarefa.data_prevista)
  const nomesTags = tags.map((g) => g.nome).join(', ')

  return (
    <li
      className="linha"
      // A borda de cima de cada tarefa leva a cor da categoria.
      style={categoria ? { '--cor-cat': categoria.cor } : undefined}
      data-feita={feita}
      data-recem={recem}
      data-arrastando={arrastando}
      draggable={arrastavel && !feita}
      onDragStart={(evento) => {
        evento.dataTransfer.setData('text/plain', tarefa.id)
        evento.dataTransfer.effectAllowed = 'move'
        setArrastando(true)
      }}
      onDragEnd={() => setArrastando(false)}
    >
      <button
        type="button"
        className="linha__check"
        aria-label={tt.concluir(tarefa.titulo)}
        disabled={feita}
        onClick={(evento) => onConcluir(tarefa.id, evento.currentTarget.getBoundingClientRect())}
      >
        <span className="linha__circulo">
          <IconeCheck />
        </span>
      </button>

      <button
        type="button"
        className="linha__corpo"
        onClick={() => onEditar(tarefa)}
        aria-label={nomesTags ? `${tt.editar(tarefa.titulo)}, ${t.formTarefa.tagsDaTarefa(nomesTags)}` : tt.editar(tarefa.titulo)}
      >
        <span className="linha__titulo">{tarefa.titulo}</span>
        {(mostrarCat || prazo || nomesTags) && (
          <span className="linha__meta" data-so-data={!mostrarCat && !nomesTags}>
            {mostrarCat && (
              <span className="linha__cat">
                <span className="dot" style={{ background: categoria.cor }} />
                {categoria.nome}
              </span>
            )}
            {/* Fora da tarefa aberta, cada tag é só um anel na cor dela (a categoria é um ponto cheio). */}
            {nomesTags && (
              <span className="linha__tags" title={t.formTarefa.tagsDaTarefa(nomesTags)} aria-hidden="true">
                {tags.map((g) => (
                  <span key={g.id} className="tag-marca" style={{ '--c': g.cor }} />
                ))}
              </span>
            )}
            {prazo && (
              <span className="linha__meta-data" data-prazo={prazo.estado}>
                {prazo.texto}
              </span>
            )}
          </span>
        )}
      </button>

      {feita ? (
        tarefa.xp_value == null ? (
          // Aguardando o servidor calcular o XP.
          <span className="linha__xp" data-pendente="true" aria-hidden="true">
            …
          </span>
        ) : (
          <span className="linha__xp" data-zero={tarefa.xp_value === 0}>
            {tt.xp(tarefa.xp_value)}
          </span>
        )
      ) : (
        <span className="linha__data" data-prazo={prazo.estado}>
          {prazo.texto}
        </span>
      )}

      {!feita && (
        <button type="button" className="linha__excluir" onClick={() => onExcluir(tarefa.id)} aria-label={tt.excluirRotulo(tarefa.titulo)}>
          {tt.excluir}
        </button>
      )}
    </li>
  )
}
