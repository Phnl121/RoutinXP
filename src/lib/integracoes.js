import { mensagemErroDados } from './dadosErros'
import { t } from '../i18n/pt-BR'

// Erros da sincronização (códigos da Edge Function) ou do banco, em pt-BR.
export const mensagemIntegracao = (erro) => t.integracoes.erros[erro?.codigoIntegracao] ?? mensagemErroDados(erro)
