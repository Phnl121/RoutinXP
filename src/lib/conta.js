import { createContext, useContext } from 'react'
import { supabase } from './supabase'
import { emPrevia, previaAdmin } from '../dev/previa'

// Conta do app (painel de administração, 2026-09-13): papel, funções liberadas e verificação em
// duas etapas. O banco cobra tudo isto nas políticas; aqui o app só decide o que mostrar.

// QR de mentira para a pré-visualização (as telas de verificação não falam com o Supabase ali).
const QR_PREVIA =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21"><path d="M0 0h7v7H0zM14 0h7v7h-7zM0 14h7v7H0zM9 2h2v2H9zM9 9h3v3H9zM15 10h2v4h-2zM10 15h4v2h-4zM18 17h3v4h-3z"/></svg>'

export const FUNCOES = ['tarefas', 'agenda', 'kanban', 'calendario', 'foco', 'painel', 'integracoes', 'financeiro']

export const ContaContexto = createContext(null)
export const useConta = () => useContext(ContaContexto)

export const temFuncao = (conta, funcao) => Boolean(conta?.funcoes?.includes(funcao))
export const ehAdmin = (conta) => conta?.papel === 'admin'

// Páginas do app e o que libera cada uma. Perfil fica sempre aberto.
const ROTAS = [
  { para: '/', funcao: 'tarefas' },
  { para: '/agenda', funcao: 'agenda' },
  { para: '/foco', funcao: 'foco' },
  { para: '/painel', funcao: 'painel' },
  { para: '/financeiro', funcao: 'financeiro' },
  { para: '/categorias', funcao: 'tarefas' },
  { para: '/integracoes', funcao: 'integracoes' },
  { para: '/admin', admin: true },
  { para: '/perfil' },
]

function rotaDe(caminho) {
  return ROTAS.find((r) => (r.para === '/' ? caminho === '/' : caminho === r.para || caminho.startsWith(`${r.para}/`)))
}

export function rotaPermitida(conta, caminho) {
  const rota = rotaDe(caminho)
  if (!rota) return true
  if (rota.admin) return ehAdmin(conta)
  return !rota.funcao || temFuncao(conta, rota.funcao)
}

// Para onde mandar quem abriu uma página que a conta não tem.
export const primeiraRota = (conta) => ROTAS.find((r) => r.para !== '/perfil' && rotaPermitida(conta, r.para))?.para ?? '/perfil'

// { papel, funcoes, senha_provisoria } — funciona antes da verificação (decide o que pedir).
export async function lerMinhaConta() {
  const { data, error } = await supabase.rpc('minha_conta')
  if (error) throw error
  return data
}

// { currentLevel: 'aal1' | 'aal2', nextLevel: 'aal1' | 'aal2' }
// nextLevel aal2 com currentLevel aal1: já tem autenticador, falta o código desta sessão.
// nextLevel aal1: ainda não cadastrou o autenticador.
export async function nivelDeVerificacao() {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (error) throw error
  return data
}

// Começa o cadastro do app autenticador. Descarta cadastros abandonados (não confirmados).
// Devolve { id, qr, chave }.
export async function iniciarCadastroAutenticador() {
  if (emPrevia) return { id: 'previa', qr: QR_PREVIA, chave: 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP' }
  const { data: fatores, error: erroLista } = await supabase.auth.mfa.listFactors()
  if (erroLista) throw erroLista
  for (const fator of fatores.all.filter((f) => f.factor_type === 'totp' && f.status !== 'verified')) {
    await supabase.auth.mfa.unenroll({ factorId: fator.id })
  }
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'RoutinXP' })
  if (error) throw error
  return { id: data.id, qr: data.totp.qr_code, chave: data.totp.secret }
}

// O autenticador já cadastrado (para pedir o código no login).
export async function autenticadorCadastrado() {
  if (emPrevia) return { id: 'previa' }
  const { data, error } = await supabase.auth.mfa.listFactors()
  if (error) throw error
  return data.totp[0] ?? null
}

// Confere o código de 6 dígitos; com sucesso, a sessão passa a ser verificada (aal2).
export async function confirmarCodigo(factorId, codigo) {
  if (emPrevia) return
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: codigo })
  if (error) throw error
}

// Depois de trocar a senha provisória: o banco libera a conta se a senha for outra.
export async function confirmarTrocaDeSenha() {
  const { data, error } = await supabase.rpc('confirmar_troca_de_senha')
  if (error) throw error
  return data === true
}

// Painel de administração (Edge Function admin-usuarios). Erros chegam como { codigoAdmin }.
export async function chamarAdmin(acao, dados = {}) {
  if (emPrevia) return previaAdmin(acao, dados)
  const { data, error } = await supabase.functions.invoke('admin-usuarios', { body: { acao, ...dados } })
  if (error) {
    let detalhe = null
    try {
      detalhe = await error.context?.json()
    } catch {
      /* resposta sem corpo */
    }
    throw { message: detalhe?.erro ?? error.message, codigoAdmin: detalhe?.erro ?? 'falha' }
  }
  return data
}
