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

export async function listarTags() {
  return ok(await supabase.from('tags').select('id, nome, cor').order('nome'))
}

// Falha com código 23505 se já existir uma tag com o mesmo nome.
export async function criarTag({ nome, cor }) {
  return ok(await supabase.from('tags').insert({ nome: nome.trim(), cor }).select('id, nome, cor').single())
}

export async function atualizarTag(id, { nome, cor }) {
  return ok(await supabase.from('tags').update({ nome: nome.trim(), cor }).eq('id', id).select('id, nome, cor').single())
}

// Os vínculos com tarefas saem junto (FK on delete cascade).
export async function excluirTag(id) {
  ok(await supabase.from('tags').delete().eq('id', id))
}

const CAMPOS_TAREFA = 'id, titulo, descricao, status, data_prevista, xp_value, created_at, completed_at, category_id, task_tags(tag_id)'

// O Supabase devolve as tags como [{ tag_id }]; a interface usa tag_ids: [id, ...].
function comTags({ task_tags, ...tarefa }) {
  return { ...tarefa, tag_ids: (task_tags ?? []).map((x) => x.tag_id) }
}

const conteudo = ({ titulo, descricao, categoriaId, dataPrevista }) => ({
  titulo: titulo.trim(),
  descricao: descricao?.trim() || null,
  category_id: categoriaId,
  data_prevista: dataPrevista || null,
})

// Deixa a tarefa com exatamente estas tags: remove as que saíram e liga as novas.
async function definirTags(taskId, tagIds) {
  const remover = supabase.from('task_tags').delete().eq('task_id', taskId)
  ok(await (tagIds.length ? remover.not('tag_id', 'in', `(${tagIds.join(',')})`) : remover))
  if (tagIds.length) {
    ok(
      await supabase
        .from('task_tags')
        .upsert(
          tagIds.map((tag_id) => ({ task_id: taskId, tag_id })),
          { onConflict: 'task_id,tag_id', ignoreDuplicates: true },
        ),
    )
  }
}

export async function listarTarefas() {
  return ok(await supabase.from('tasks').select(CAMPOS_TAREFA).order('created_at')).map(comTags)
}

export async function criarTarefa({ tagIds = [], ...campos }) {
  const salva = comTags(ok(await supabase.from('tasks').insert(conteudo(campos)).select(CAMPOS_TAREFA).single()))
  if (tagIds.length) await definirTags(salva.id, tagIds)
  return { ...salva, tag_ids: tagIds }
}

export async function atualizarTarefa(id, { tagIds = [], ...campos }) {
  const salva = comTags(ok(await supabase.from('tasks').update(conteudo(campos)).eq('id', id).select(CAMPOS_TAREFA).single()))
  await definirTags(id, tagIds)
  return { ...salva, tag_ids: tagIds }
}

export async function excluirTarefa(id) {
  ok(await supabase.from('tasks').delete().eq('id', id))
}

// Conclui no servidor (função concluir_tarefa): XP, teto diário e streak são calculados
// no banco, no horário de Brasília. Devolve { tarefa, xp_ganho, motivo, estatisticas }.
export async function concluirTarefa(id) {
  return ok(await supabase.rpc('concluir_tarefa', { p_task_id: id }))
}

const CAMPOS_PERFIL = 'primeiro_nome, sobrenome, data_nascimento, ocupacao'

// null se a conta ainda não completou o perfil (criada antes do passo 11).
export async function lerPerfil() {
  return ok(await supabase.from('profiles').select(CAMPOS_PERFIL).maybeSingle())
}

// A idade mínima (13 anos) e o formato são conferidos também no banco.
export async function salvarPerfil({ primeiro_nome, sobrenome, data_nascimento, ocupacao }, existe, userId) {
  const campos = { primeiro_nome: primeiro_nome.trim(), sobrenome: sobrenome.trim(), data_nascimento, ocupacao }
  const consulta = existe
    ? supabase.from('profiles').update(campos).eq('user_id', userId)
    : supabase.from('profiles').insert(campos)
  return ok(await consulta.select(CAMPOS_PERFIL).single())
}

// { xp_total, streak_atual (já zerado se passou um dia sem concluir), streak_recorde, xp_hoje, teto_diario }
export async function lerEstatisticas() {
  return ok(await supabase.rpc('minhas_estatisticas'))
}
