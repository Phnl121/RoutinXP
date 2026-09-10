import { t } from '../i18n/pt-BR'

const e = t.dadosErros

// Traduz erros de categorias/tarefas (PostgREST) para pt-BR.
export function mensagemErroDados(error) {
  if (!error) return null
  if (error.code === '23503') return e.emUso
  if (error.code === '23514' || error.code === '22001') return e.validacao
  if (error.name === 'TypeError' || /fetch|network/i.test(error.message ?? '')) return e.rede
  return e.generico
}
