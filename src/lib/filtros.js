import { hojeBrasilia } from './datas'
import { somarDias } from './calendario'

// Filtro das tarefas (Lista, Kanban e Calendário): nome, categorias, tags e prazo.
export const FILTRO_VAZIO = { busca: '', categorias: [], tags: [], prazo: '' }

export const PRAZOS = ['', 'atrasadas', 'hoje', 'semana', 'sem-data']

const semAcento = (texto) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export function filtrarTarefas(tarefas, filtro) {
  const hoje = hojeBrasilia()
  const emUmaSemana = somarDias(hoje, 7)
  const termo = semAcento(filtro.busca.trim())
  return tarefas.filter((x) => {
    if (termo && !semAcento(`${x.titulo} ${x.descricao ?? ''}`).includes(termo)) return false
    if (filtro.categorias.length && !filtro.categorias.includes(x.category_id)) return false
    if (filtro.tags.length && !(x.tag_ids ?? []).some((g) => filtro.tags.includes(g))) return false
    const data = x.data_prevista
    if (filtro.prazo === 'atrasadas') return x.status === 'pendente' && Boolean(data) && data < hoje
    if (filtro.prazo === 'hoje') return data === hoje
    if (filtro.prazo === 'semana') return Boolean(data) && data >= hoje && data <= emUmaSemana
    if (filtro.prazo === 'sem-data') return !data
    return true
  })
}

export const contarFiltros = (filtro) =>
  (filtro.busca.trim() ? 1 : 0) + filtro.categorias.length + filtro.tags.length + (filtro.prazo ? 1 : 0)

export const alternar = (lista, id) => (lista.includes(id) ? lista.filter((x) => x !== id) : [...lista, id])
