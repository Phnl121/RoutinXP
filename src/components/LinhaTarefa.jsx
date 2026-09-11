import { useState } from 'react'
import { formatarPrazo } from '../lib/datas'
import { alternarTagsCompactas, useTagsCompactas } from '../lib/tagsCompactas'
import { IconeCheck, IconeRelogio } from './icones'
import { t } from '../i18n/pt-BR'

const tt = t.tarefas

// Selo de prazo (como no Trello): relógio + data, com cor pela urgência.
function Prazo({ prazo }) {
  return (
    <span className="prazo" data-prazo={prazo.estado}>
      {prazo.estado !== 'sem' && <IconeRelogio />}
      {prazo.texto}
    </span>
  )
}

export function LinhaTarefa({ tarefa, categoria, tags = [], mostrarCategoria = true, arrastavel = false, recem = false, onConcluir, onEditar, onExcluir }) {
  const feita = tarefa.status === 'concluida'
  const [arrastando, setArrastando] = useState(false)
  const mostrarCat = mostrarCategoria && Boolean(categoria)
  const prazo = feita ? null : formatarPrazo(tarefa.data_prevista)
  const nomesTags = tags.map((g) => g.nome).join(', ')
  const compactas = useTagsCompactas()

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

      <div className="linha__principal">
        {/* Etiquetas como no Trello: com o nome ou só a cor. Clicar em qualquer uma
            alterna todas (a escolha fica salva). Não abre a tarefa. */}
        {tags.length > 0 && (
          <div className="etiquetas">
            {tags.map((g) => (
              <button
                key={g.id}
                type="button"
                className="etiqueta"
                data-compacta={compactas}
                style={{ '--c': g.cor }}
                title={g.nome}
                aria-label={`${g.nome}: ${compactas ? t.etiquetas.mostrarNomes : t.etiquetas.soCores}`}
                onClick={alternarTagsCompactas}
              >
                {!compactas && g.nome}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          className="linha__corpo"
          onClick={() => onEditar(tarefa)}
          aria-label={nomesTags ? `${tt.editar(tarefa.titulo)}, ${t.formTarefa.tagsDaTarefa(nomesTags)}` : tt.editar(tarefa.titulo)}
        >
          <span className="linha__titulo">{tarefa.titulo}</span>
          {(mostrarCat || prazo) && (
            <span className="linha__meta" data-so-data={!mostrarCat}>
              {mostrarCat && (
                <span className="linha__cat">
                  <span className="dot" style={{ background: categoria.cor }} />
                  {categoria.nome}
                </span>
              )}
              {prazo && (
                <span className="linha__meta-data">
                  <Prazo prazo={prazo} />
                </span>
              )}
            </span>
          )}
        </button>
      </div>

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
        <span className="linha__data">
          <Prazo prazo={prazo} />
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
