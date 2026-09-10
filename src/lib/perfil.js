import { idadeEm } from './datas'
import { t } from '../i18n/pt-BR'

export const PERFIL_VAZIO = { primeiro_nome: '', sobrenome: '', data_nascimento: '', ocupacao: '' }

// Mesmas regras do banco (trigger validar_perfil), com mensagem amigável antes de enviar.
export function validarPerfil({ primeiro_nome, sobrenome, data_nascimento, ocupacao }) {
  const e = t.perfil.erros
  if (!primeiro_nome.trim() || !sobrenome.trim() || !data_nascimento || !ocupacao) return e.obrigatorio
  if (data_nascimento < '1900-01-01' || idadeEm(data_nascimento) < 0) return e.data
  if (idadeEm(data_nascimento) < 13) return e.idade
  return null
}

export function nomeCompleto(perfil) {
  return perfil ? `${perfil.primeiro_nome} ${perfil.sobrenome}` : null
}
