import { t } from '../i18n/pt-BR'

// Logotipo horizontal (ícone + nome). O tamanho vem do CSS (.logo), pela altura;
// width/height aqui só reservam a proporção 1992:512 para a página não pular ao carregar.
export function Logo({ className = '' }) {
  return (
    <img
      className={`logo ${className}`.trim()}
      src="/marca/routinxp-logo-horizontal.svg"
      alt={t.app.nome}
      width="1992"
      height="512"
      decoding="async"
    />
  )
}
