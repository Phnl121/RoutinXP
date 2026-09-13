// Regras de categorização (fase 5 do Financeiro): a comparação é a mesma do banco
// (fin_normalizar): sem maiúsculas, acentos e símbolos, por palavras inteiras.

export const normalizar = (texto) =>
  (texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

export const combina = (descricao, termo) => ` ${normalizar(descricao)} `.includes(` ${normalizar(termo)} `)

// Palavras que aparecem em qualquer extrato e não dizem onde foi o gasto.
const RUIDO = new Set([
  'pag', 'pagto', 'pagamento', 'compra', 'compras', 'pix', 'ted', 'doc', 'debito', 'credito', 'cartao', 'transferencia',
  'enviada', 'recebida', 'enviado', 'recebido', 'pedido', 'parcela', 'loja', 'app', 'br', 'sa', 'ltda', 'me', 'eireli', 'com', 'www', 'http', 'https', 'de', 'da', 'do', 'em', 'no', 'na',
])

// Sugestão de termo a partir da descrição do banco: a primeira palavra que diz algo
// ("UBER *TRIP HELP.UBER.COM" → "uber"; "PAG*POSTO SHELL" → "posto").
export function termoSugerido(descricao) {
  return (
    normalizar(descricao)
      .split(' ')
      .find((p) => p.length >= 3 && !/^\d+$/.test(p) && !RUIDO.has(p)) ?? ''
  )
}
