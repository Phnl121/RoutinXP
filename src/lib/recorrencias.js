// Recorrências detectadas (fase 5.5 do Financeiro): saídas que se repetem todo mês, com valor
// parecido, viram a sugestão "Parece um gasto fixo: cadastrar?".
// Critério (o mesmo que a Pluggy usa): 3 ou mais cobranças, a cada ~30 dias (25 a 35), com o
// valor até 10% longe da mediana.
import { normalizar } from './regras'
import { hojeBrasilia } from './datas'
import { somarMeses } from './gastosFixos'

const MINIMO = 3
const INTERVALO_MIN = 25
const INTERVALO_MAX = 35
const TOLERANCIA = 0.1

const diasEntre = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)
const mediana = (valores) => {
  const ordenados = [...valores].sort((a, b) => a - b)
  const meio = Math.floor(ordenados.length / 2)
  return ordenados.length % 2 ? ordenados[meio] : Math.round((ordenados[meio - 1] + ordenados[meio]) / 2)
}
const maisComum = (lista) => {
  const contagem = new Map()
  for (const x of lista) if (x) contagem.set(x, (contagem.get(x) ?? 0) + 1)
  return [...contagem.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

// Chave do "mesmo gasto": a descrição sem números nem símbolos, nas três primeiras palavras
// ("NETFLIX.COM 0923" e "NETFLIX.COM 1023" → "netflix com").
export const chaveDaDescricao = (descricao) =>
  normalizar(descricao)
    .split(' ')
    .filter((p) => p.length >= 2 && !/\d/.test(p))
    .slice(0, 3)
    .join(' ')

// Nome sugerido para o gasto fixo: a descrição mais recente, sem os números do fim.
const nomeSugerido = (descricao) =>
  descricao
    .replace(/[*#]+/g, ' ')
    .replace(/\s+\d[\d./-]*\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)

// Devolve as sugestões, da mais cara para a mais barata:
// { chave, nome, valor_centavos, inicio, conta_id, categoria_id, ocorrencias: [{ id, data, referencia }] }
export function detectarRecorrencias(transacoes, recorrencias, ignoradas = []) {
  const hoje = hojeBrasilia()
  const cadastradas = recorrencias.map((r) => normalizar(r.nome)).filter(Boolean)
  const grupos = new Map()
  for (const x of transacoes) {
    if (x.tipo !== 'saida' || x.recorrencia_id || x.data > hoje) continue
    const chave = chaveDaDescricao(x.descricao)
    if (!chave) continue
    grupos.set(chave, [...(grupos.get(chave) ?? []), x])
  }

  const sugestoes = []
  for (const [chave, lista] of grupos) {
    if (ignoradas.includes(chave)) continue
    // Já cadastrado: o nome do gasto fixo aparece na chave (ou o contrário).
    if (cadastradas.some((nome) => ` ${chave} `.includes(` ${nome} `) || ` ${nome} `.includes(` ${chave} `))) continue

    // Uma cobrança por mês (a de valor mais perto da mediana do grupo).
    const referenciaValor = mediana(lista.map((x) => x.valor_centavos))
    const porMes = new Map()
    for (const x of lista) {
      const mes = x.data.slice(0, 7)
      const atual = porMes.get(mes)
      if (!atual || Math.abs(x.valor_centavos - referenciaValor) < Math.abs(atual.valor_centavos - referenciaValor)) porMes.set(mes, x)
    }
    const serie = [...porMes.values()].sort((a, b) => a.data.localeCompare(b.data))
    if (serie.length < MINIMO) continue

    const intervalosOk = serie.slice(1).every((x, i) => {
      const dias = diasEntre(serie[i].data, x.data)
      return dias >= INTERVALO_MIN && dias <= INTERVALO_MAX
    })
    if (!intervalosOk) continue
    const valor = mediana(serie.map((x) => x.valor_centavos))
    if (!serie.every((x) => Math.abs(x.valor_centavos - valor) <= valor * TOLERANCIA)) continue

    // A primeira cobrança dá o dia; cada lançamento vira o pagamento da cobrança mais próxima.
    const inicio = serie[0].data
    // Uma por mês: a cobrança do mês do lançamento (sem repetir referência).
    const mesesDesde = (data) => (Number(data.slice(0, 4)) - Number(inicio.slice(0, 4))) * 12 + Number(data.slice(5, 7)) - Number(inicio.slice(5, 7))
    const ocorrencias = serie.map((x) => ({ id: x.id, data: x.data, referencia: somarMeses(inicio, mesesDesde(x.data)) }))
    const ultima = serie[serie.length - 1]
    sugestoes.push({
      chave,
      nome: nomeSugerido(ultima.descricao) || chave,
      valor_centavos: valor,
      inicio,
      conta_id: maisComum(serie.map((x) => x.conta_id)),
      categoria_id: maisComum(serie.map((x) => x.categoria_id)),
      variavel: serie.some((x) => x.valor_centavos !== valor),
      ocorrencias,
    })
  }
  return sugestoes.sort((a, b) => b.valor_centavos - a.valor_centavos)
}
