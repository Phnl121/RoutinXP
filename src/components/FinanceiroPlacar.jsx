import { formatarReais, mesAtual, nomeDoMes, somarFiltro, variacaoPct } from '../lib/dinheiro'
import { hojeBrasilia } from '../lib/datas'
import { t } from '../i18n/pt-BR'

const p = t.financeiro.placar

// Placar do mês em quatro cards (Entradas, Saídas, Resultado, Poupado), comparado com o mês
// anterior (no mês em andamento, até o mesmo dia). Recebe os lançamentos já filtrados.
export function PlacarMes({ mes, doMes, doMesAnterior, mesAnterior, contaId, atalho }) {
  const placar = somarFiltro(doMes, contaId)
  const emAndamento = mes === mesAtual()
  const diaHoje = Number(hojeBrasilia().slice(8, 10))
  const antes = somarFiltro(
    doMesAnterior.filter((x) => !emAndamento || Number(x.data.slice(8, 10)) <= diaHoje),
    contaId,
  )
  const nomeAntes = emAndamento ? p.ateDia(nomeDoMes(mesAnterior), diaHoje) : nomeDoMes(mesAnterior)
  const poupado = placar.entradas > 0 ? Math.round((placar.resultado / placar.entradas) * 100) : null
  const poupadoAntes = antes.entradas > 0 ? Math.round((antes.resultado / antes.entradas) * 100) : null
  const comparar = doMesAnterior.length > 0
  const variacao = (texto) => texto !== null && <dd className="fin-placar__var">{texto}</dd>
  const sinal = (v) => (v > 0 ? 'entrada' : v < 0 ? 'saida' : undefined)

  return (
    <section className="panel fin-placar" aria-label={p.rotulo}>
      <dl className="fin-placar__itens">
        <div data-tom="entrada">
          <dt className="label">{p.entradas}</dt>
          <dd className="fin-placar__valor" data-direcao="entrada">
            {formatarReais(placar.entradas)}
          </dd>
          {comparar && variacaoPct(placar.entradas, antes.entradas) !== null && variacao(p.pct(variacaoPct(placar.entradas, antes.entradas), nomeAntes))}
        </div>
        <div data-tom="saida">
          <dt className="label">{p.saidas}</dt>
          <dd className="fin-placar__valor" data-direcao="saida">
            {formatarReais(placar.saidas)}
          </dd>
          {comparar && variacaoPct(placar.saidas, antes.saidas) !== null && variacao(p.pct(variacaoPct(placar.saidas, antes.saidas), nomeAntes))}
        </div>
        <div data-tom={sinal(placar.resultado) ?? 'neutro'}>
          <dt className="label">{p.resultado}</dt>
          <dd className="fin-placar__valor" data-direcao={sinal(placar.resultado)}>
            {formatarReais(placar.resultado, { sinal: true })}
          </dd>
          {comparar &&
            placar.resultado !== antes.resultado &&
            variacao(p.diferenca(formatarReais(Math.abs(placar.resultado - antes.resultado)), placar.resultado > antes.resultado, nomeAntes))}
        </div>
        <div data-tom="poupado">
          <dt className="label">{p.poupado}</dt>
          <dd className="fin-placar__valor">{poupado === null ? <span className="fin-placar__nada">{p.semEntradas}</span> : `${poupado}%`}</dd>
          {comparar && poupado !== null && poupadoAntes !== null && variacao(p.pontos(poupado - poupadoAntes, nomeAntes))}
        </div>
      </dl>
      {atalho}
    </section>
  )
}
