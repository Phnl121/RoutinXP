import { diaBrasilia, hojeBrasilia, horaBrasilia } from '../lib/datas'
import { rotuloDiaMes, rotuloDiaSemana, ultimosDias } from '../lib/painel'
import { IconeCheck } from './icones'
import { t } from '../i18n/pt-BR'

const p = t.painel

function rotuloDoDia(dia) {
  if (dia === hojeBrasilia()) return p.hoje
  if (dia === ultimosDias(2)[0]) return p.ontem
  return `${rotuloDiaSemana(dia)}, ${rotuloDiaMes(dia)}`
}

// Conclusões recentes agrupadas por dia (Brasília), com hora e XP ganho.
export function LinhaDoTempo({ tarefas, categoriasPorId, limite = 12 }) {
  const recentes = tarefas
    .filter((x) => x.status === 'concluida' && x.completed_at)
    .sort((a, b) => b.completed_at.localeCompare(a.completed_at))
    .slice(0, limite)

  if (recentes.length === 0) return <p className="linha-tempo__vazio">{p.vazioTempo}</p>

  const grupos = []
  for (const tarefa of recentes) {
    const dia = diaBrasilia(tarefa.completed_at)
    const ultimo = grupos[grupos.length - 1]
    if (ultimo?.dia === dia) ultimo.itens.push(tarefa)
    else grupos.push({ dia, itens: [tarefa] })
  }

  return (
    <ol className="linha-tempo">
      {grupos.map((grupo) => (
        <li key={grupo.dia} className="linha-tempo__grupo">
          <h3 className="label linha-tempo__dia">{rotuloDoDia(grupo.dia)}</h3>
          <ul className="linha-tempo__lista">
            {grupo.itens.map((tarefa) => {
              const categoria = categoriasPorId[tarefa.category_id]
              return (
                <li key={tarefa.id} className="linha-tempo__item">
                  <span className="linha-tempo__check" aria-hidden="true">
                    <IconeCheck />
                  </span>
                  <span className="linha-tempo__texto">
                    <span className="linha-tempo__titulo">{tarefa.titulo}</span>
                    {categoria && (
                      <span className="linha-tempo__cat">
                        <span className="dot" style={{ background: categoria.cor }} />
                        {categoria.nome}
                      </span>
                    )}
                  </span>
                  <time className="linha-tempo__hora" dateTime={tarefa.completed_at}>
                    {horaBrasilia(tarefa.completed_at)}
                  </time>
                  <span className="linha-tempo__xp" data-zero={!tarefa.xp_value}>
                    {t.tarefas.xp(tarefa.xp_value ?? 0)}
                  </span>
                </li>
              )
            })}
          </ul>
        </li>
      ))}
    </ol>
  )
}
