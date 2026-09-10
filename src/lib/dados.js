import { supabase } from './supabase'

// Acesso a dados de categorias, tarefas e estatísticas.
// Cada função lança o erro do Supabase; a interface traduz a mensagem.
// user_id é preenchido pelo banco (default auth.uid()) e protegido por RLS.

function ok({ data, error }) {
  if (error) throw error
  return data
}

export async function listarCategorias() {
  return ok(await supabase.from('categories').select('id, nome, cor, created_at').order('nome'))
}

export async function criarCategoria({ nome, cor }) {
  return ok(await supabase.from('categories').insert({ nome: nome.trim(), cor }).select().single())
}

export async function atualizarCategoria(id, { nome, cor }) {
  return ok(await supabase.from('categories').update({ nome: nome.trim(), cor }).eq('id', id).select().single())
}

// Falha com código 23503 se a categoria ainda tiver tarefas (FK on delete restrict).
export async function excluirCategoria(id) {
  ok(await supabase.from('categories').delete().eq('id', id))
}

const CAMPOS_TAREFA = 'id, titulo, status, data_prevista, xp_value, created_at, completed_at, category_id'

export async function listarTarefas() {
  return ok(await supabase.from('tasks').select(CAMPOS_TAREFA).order('created_at'))
}

export async function criarTarefa({ titulo, categoriaId, dataPrevista }) {
  return ok(
    await supabase
      .from('tasks')
      .insert({ titulo: titulo.trim(), category_id: categoriaId, data_prevista: dataPrevista || null })
      .select(CAMPOS_TAREFA)
      .single(),
  )
}

export async function atualizarTarefa(id, { titulo, categoriaId, dataPrevista }) {
  return ok(
    await supabase
      .from('tasks')
      .update({ titulo: titulo.trim(), category_id: categoriaId, data_prevista: dataPrevista || null })
      .eq('id', id)
      .select(CAMPOS_TAREFA)
      .single(),
  )
}

export async function excluirTarefa(id) {
  ok(await supabase.from('tasks').delete().eq('id', id))
}

// Provisório até o passo 10: só marca como concluída.
// No passo 10 vira uma função no banco que também calcula XP e streak.
export async function concluirTarefa(id) {
  return ok(
    await supabase
      .from('tasks')
      .update({ status: 'concluida', completed_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pendente')
      .select(CAMPOS_TAREFA)
      .single(),
  )
}

export async function lerEstatisticas() {
  return ok(
    await supabase.from('user_stats').select('xp_total, streak_atual, streak_recorde, ultima_data_conclusao').maybeSingle(),
  )
}
