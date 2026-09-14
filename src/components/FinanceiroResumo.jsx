import { useId, useState } from 'react'
import { Link } from 'react-router'
import { formatarReais, mesCurto, rotuloMes } from '../lib/dinheiro'
import { cobrancasEntre, custoMensal, somarDias } from '../lib/gastosFixos'
import { hojeBrasilia } from '../lib/datas'
import { t } from '../i18n/pt-BR'

const r = t.financeiro.resumo

// Para onde foi o dinheiro: saídas do mês por categoria, da maior para a menor.
// Barras neutras (dinheiro não ganha cor); a maior fica em Ink. A cor da categoria
// aparece só no ponto ao lado do nome. Tocar numa categoria filtra os lançamentos.
export function GastosPorCategoria({ linhas, onEscolher }) {
  const maior = linhas[0]?.total ?? 1
  return (
    <section className="panel fin-resumo" aria-labelledby="fin-gastos">
      <h2 id="fin-gastos" className="label">
        {r.gastos.titulo}
      </h2>
      {linhas.length === 0 ? (
        <p className="hint">{r.gastos.vazio}</p>
      ) : (
        <>
          <p className="fin-resumo__destaque">
            {r.gastos.maisGastou(linhas[0].categoria?.nome ?? t.financeiro.lancamentos.semCategoria, Math.round(linhas[0].fatia * 100))}
          </p>
          <ul className="fin-gastos">
            {linhas.map(({ categoria, total, fatia }, i) => (
              <li key={categoria?.id ?? 'revisar'}>
                <button
                  type="button"
                  className="fin-gastos__linha"
                  data-maior={i === 0}
                  onClick={() => onEscolher(categoria?.id ?? 'revisar')}
                  aria-label={r.gastos.rotulo(categoria?.nome ?? t.financeiro.lancamentos.semCategoria, formatarReais(total), Math.round(fatia * 100))}
                >
                  <span className="fin-gastos__nome">
                    <span className="fin-linha__ponto" data-vazio={!categoria} style={categoria ? { '--c': categoria.cor } : undefined} />
                    <span className="fin-gastos__texto">{categoria?.nome ?? t.financeiro.lancamentos.semCategoria}</span>
                  </span>
                  <span className="fin-gastos__fatia" aria-hidden="true">
                    {Math.round(fatia * 100)}%
                  </span>
                  <span className="fin-gastos__valor">{formatarReais(total)}</span>
                  {/* O trilho ocupa a linha inteira: todas as barras medem sobre o mesmo comprimento. */}
                  <span className="fin-gastos__trilho" aria-hidden="true">
                    <span
                      className="fin-gastos__barra"
                      style={{ width: `${Math.max((total / maior) * 100, 1.5)}%`, ...(categoria ? { '--c': categoria.cor } : {}) }}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

const LINHAS_DRE = [
  { chave: 'receitas', sinal: 1 },
  { chave: 'fixa', sinal: -1 },
  { chave: 'variavel', sinal: -1 },
  { chave: 'assinatura', sinal: -1 },
  { chave: 'revisar', sinal: -1 },
]

// DRE pessoal: receitas − fixas − variáveis − assinaturas (− a revisar) = resultado.
// Cada linha abre as categorias que a compõem; a fatia é sobre as receitas do mês.
export function DrePessoal({ dre }) {
  const id = useId()
  const [aberta, setAberta] = useState(null)
  const base = dre.receitas.total
  const linhas = LINHAS_DRE.filter((l) => l.chave !== 'revisar' || dre.revisar.total > 0)

  return (
    <section className="panel fin-resumo" aria-labelledby={`${id}-titulo`}>
      <h2 id={`${id}-titulo`} className="label">
        {r.dre.titulo}
      </h2>
      <ul className="fin-dre">
        {linhas.map(({ chave, sinal }) => {
          const linha = dre[chave]
          const abrir = linha.itens.length > 0
          const expandida = aberta === chave
          const conteudo = (
            <>
              <span className="fin-dre__nome">
                {abrir && <span className="fin-dre__seta" data-aberta={expandida} aria-hidden="true" />}
                <span className="fin-dre__rotulo">{r.dre.linhas[chave]}</span>
              </span>
              <span className="fin-dre__fatia">{base > 0 && chave !== 'receitas' ? `${Math.round((linha.total / base) * 100)}%` : ''}</span>
              <span className="fin-dre__valor" data-direcao={linha.total === 0 ? undefined : sinal > 0 ? 'entrada' : 'saida'}>
                {formatarReais(sinal * linha.total, { sinal: sinal > 0 && linha.total > 0 })}
              </span>
            </>
          )
          return (
            <li key={chave} className="fin-dre__linha" data-receita={chave === 'receitas'}>
              {abrir ? (
                <button
                  type="button"
                  className="fin-dre__botao"
                  aria-expanded={expandida}
                  aria-controls={`${id}-${chave}`}
                  onClick={() => setAberta(expandida ? null : chave)}
                >
                  {conteudo}
                </button>
              ) : (
                <div className="fin-dre__botao">{conteudo}</div>
              )}
              {abrir && (
                <ul id={`${id}-${chave}`} className="fin-dre__itens" hidden={!expandida}>
                  {linha.itens.map(({ categoria, total }) => (
                    <li key={categoria.id}>
                      <span className="fin-dre__item-nome">
                        <span className="fin-linha__ponto" style={{ '--c': categoria.cor }} aria-hidden="true" />
                        {categoria.nome}
                      </span>
                      <span className="fin-dre__item-valor">{formatarReais(total)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
        <li className="fin-dre__linha fin-dre__resultado" data-tom={dre.resultado > 0 ? 'entrada' : dre.resultado < 0 ? 'saida' : 'neutro'}>
          <div className="fin-dre__botao">
            <span className="fin-dre__nome">{r.dre.linhas.resultado}</span>
            <span className="fin-dre__fatia">{base > 0 ? `${Math.round((dre.resultado / base) * 100)}%` : ''}</span>
            <span className="fin-dre__valor" data-direcao={dre.resultado > 0 ? 'entrada' : dre.resultado < 0 ? 'saida' : undefined}>
              {formatarReais(dre.resultado, { sinal: true })}
            </span>
          </div>
        </li>
      </ul>
    </section>
  )
}

// Entradas × saídas dos últimos meses. Duas séries neutras separadas pela forma, não pela cor:
// entradas em barra cheia (Ink), saídas em barra vazada. Legenda, dica no hover e tabela.
export function EvolucaoMeses({ meses, mesAtual }) {
  const id = useId()
  const [escolhido, setEscolhido] = useState(mesAtual)
  const selecionado = meses.find((m) => m.mes === escolhido) ?? meses[meses.length - 1]
  const escala = Math.max(...meses.flatMap((m) => [m.entradas, m.saidas]), 1)
  const altura = (v) => `${Math.max((v / escala) * 100, v > 0 ? 1.5 : 0)}%`

  return (
    <section className="panel fin-resumo" aria-labelledby={`${id}-titulo`}>
      <div className="fin-resumo__cabeca">
        <h2 id={`${id}-titulo`} className="label">
          {r.evolucao.titulo(meses.length)}
        </h2>
        <span className="fin-evol__legenda" aria-hidden="true">
          <span className="fin-evol__chave" data-serie="entradas" />
          {r.evolucao.entradas}
          <span className="fin-evol__chave" data-serie="saidas" />
          {r.evolucao.saidas}
        </span>
      </div>
      <figure className="fin-evol">
        <div className="fin-evol__area">
          {meses.map((m) => (
            <button
              key={m.mes}
              type="button"
              className="fin-evol__coluna"
              data-atual={m.mes === mesAtual}
              aria-pressed={m.mes === selecionado.mes}
              aria-label={r.evolucao.coluna(rotuloMes(m.mes), formatarReais(m.entradas), formatarReais(m.saidas))}
              onClick={() => setEscolhido(m.mes)}
              onMouseEnter={() => setEscolhido(m.mes)}
              onFocus={() => setEscolhido(m.mes)}
            >
              <span className="fin-evol__barra" data-serie="entradas" style={{ height: altura(m.entradas) }} />
              <span className="fin-evol__barra" data-serie="saidas" style={{ height: altura(m.saidas) }} />
            </button>
          ))}
        </div>
        <div className="fin-evol__eixo" aria-hidden="true">
          {meses.map((m) => (
            <span key={m.mes} data-atual={m.mes === selecionado.mes}>
              {mesCurto(m.mes)}
            </span>
          ))}
        </div>
        {/* Os números do mês escolhido (toque, foco ou mouse) ficam em texto, não só na dica. */}
        <figcaption className="fin-evol__detalhe" aria-live="polite">
          <strong>{rotuloMes(selecionado.mes)}</strong>
          <span>
            {r.evolucao.entradas} {formatarReais(selecionado.entradas)}
          </span>
          <span>
            {r.evolucao.saidas} {formatarReais(selecionado.saidas)}
          </span>
          <span>
            {r.evolucao.resultado} {formatarReais(selecionado.resultado, { sinal: true })}
          </span>
        </figcaption>
      </figure>
    </section>
  )
}

// Resumo dos gastos fixos: quanto está comprometido por mês e o que vence nos próximos 7 dias.
export function CartaoGastosFixos({ recorrencias }) {
  if (!recorrencias.length) return null
  const hoje = hojeBrasilia()
  const gf = t.gastosFixos.cartao
  return (
    <section className="panel fin-resumo gf-cartao" aria-labelledby="gf-cartao">
      <h2 id="gf-cartao" className="label">
        {gf.titulo}
      </h2>
      <p className="gf-cartao__valor">{gf.mensal(formatarReais(recorrencias.reduce((soma, rec) => soma + custoMensal(rec, hoje), 0)))}</p>
      <p className="hint">{gf.proximas(recorrencias.flatMap((rec) => cobrancasEntre(rec, hoje, somarDias(hoje, 7))).length)}</p>
      <Link to="/financeiro/gastos-fixos" className="link-btn gf-cartao__ver">
        {gf.ver}
      </Link>
    </section>
  )
}
