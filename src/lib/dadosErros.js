import { t } from '../i18n/pt-BR'

const e = t.dadosErros

// Traduz erros de categorias/tarefas (PostgREST) para pt-BR.
export function mensagemErroDados(error) {
  if (!error) return null
  if (/idade_minima/.test(error.message ?? '')) return t.perfil.erros.idade
  if (/data_nascimento_invalida/.test(error.message ?? '')) return t.perfil.erros.data
  if (/limite_atingido/.test(error.message ?? '')) return e.limite
  if (error.code === '23503') return e.emUso
  if (error.code === '23505') return e.tagDuplicada
  if (error.code === '23514' || error.code === '22001') return e.validacao
  if (error.name === 'TypeError' || /fetch|network/i.test(error.message ?? '')) return e.rede
  return e.generico
}
