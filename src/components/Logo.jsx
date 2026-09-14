import { t } from '../i18n/pt-BR'

// Logotipo horizontal (ícone + nome). O tamanho vem do CSS (.logo), pela altura;
// width/height aqui só reservam a proporção 1992:512 para a página não pular ao carregar.
// Duas versões: o nome "Routin" claro no tema escuro e escuro no tema claro (o CSS mostra uma).
export function Logo({ className = '' }) {
  return (
    <>
      <img
        className={`logo logo--escuro ${className}`.trim()}
        src="/marca/routinxp-logo-horizontal.svg"
        alt={t.app.nome}
        width="1992"
        height="512"
        decoding="async"
      />
      <img
        className={`logo logo--claro ${className}`.trim()}
        src="/marca/routinxp-logo-horizontal-claro.svg"
        alt={t.app.nome}
        width="1992"
        height="512"
        decoding="async"
      />
    </>
  )
}
