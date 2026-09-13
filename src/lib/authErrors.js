import { t } from '../i18n/pt-BR'

const e = t.auth.erros

const porCodigo = {
  invalid_credentials: e.credenciais,
  email_not_confirmed: e.naoConfirmado,
  over_email_send_rate_limit: e.limite,
  over_request_rate_limit: e.limite,
  weak_password: e.senhaFraca,
  same_password: e.mesmaSenha,
  email_address_invalid: e.emailInvalido,
  validation_failed: e.emailInvalido,
  captcha_failed: e.captcha,
}

// Traduz um erro do Supabase Auth para uma mensagem em pt-BR que diz o problema e a saída.
export function mensagemDeErro(error) {
  if (!error) return null
  if (porCodigo[error.code]) return porCodigo[error.code]
  if (error.status === 429) return e.limite
  if (error.name === 'AuthRetryableFetchError' || /fetch|network/i.test(error.message ?? '')) return e.rede
  return e.generico
}
