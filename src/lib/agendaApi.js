import { supabase } from './supabase'
import { somarDias } from './calendario'

// Eventos da Agenda. user_id vem do banco (auth.uid()) e a RLS confere dono e função.

function ok({ data, error }) {
  if (error) throw error
  return data
}

const CAMPOS_EVENTO =
  'id, titulo, descricao, local, dia_todo, inicio, fim, categoria_id, repeticao, repetir_ate, excluidas, lembrete_min, created_at'

// Eventos que podem aparecer entre dois dias: os únicos que tocam o período e as repetições
// que começaram antes do fim dele e ainda não acabaram.
export async function listarEventos(diaInicio, diaFim) {
  const depois = `${somarDias(diaFim, 1)}T00:00:00`
  const antes = `${somarDias(diaInicio, -1)}T00:00:00`
  return ok(
    await supabase
      .from('agenda_eventos')
      .select(CAMPOS_EVENTO)
      .lt('inicio', depois)
      .or(`and(repeticao.eq.nao,fim.gte.${antes}),and(repeticao.neq.nao,or(repetir_ate.is.null,repetir_ate.gte.${diaInicio}))`)
      .order('inicio')
      .limit(2000),
  )
}

const camposEvento = (e) => ({
  titulo: e.titulo.trim(),
  descricao: e.descricao?.trim() || null,
  local: e.local?.trim() || null,
  dia_todo: Boolean(e.dia_todo),
  inicio: e.inicio,
  fim: e.fim,
  categoria_id: e.categoria_id || null,
  repeticao: e.repeticao || 'nao',
  repetir_ate: e.repeticao && e.repeticao !== 'nao' ? e.repetir_ate || null : null,
  lembrete_min: e.lembrete_min ?? null,
})

export async function salvarEvento(evento) {
  const consulta = evento.id
    ? supabase.from('agenda_eventos').update(camposEvento(evento)).eq('id', evento.id)
    : supabase.from('agenda_eventos').insert(camposEvento(evento))
  return ok(await consulta.select(CAMPOS_EVENTO).single())
}

export async function excluirEvento(id) {
  ok(await supabase.from('agenda_eventos').delete().eq('id', id))
}

// "Excluir só este dia" numa repetição.
export async function excluirOcorrencia(evento, dia) {
  const excluidas = [...new Set([...(evento.excluidas ?? []), dia])]
  return ok(await supabase.from('agenda_eventos').update({ excluidas }).eq('id', evento.id).select(CAMPOS_EVENTO).single())
}
