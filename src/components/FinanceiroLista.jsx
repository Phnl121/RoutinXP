import { useState } from 'react'
import { agruparPorDia, formatarReais, rotuloDia, rotuloMes, andarMes } from '../lib/dinheiro'
import { hojeBrasilia } from '../lib/datas'
import { IconeMais, IconeSetaDireita, IconeSetaEsquerda } from './icones'
import { t } from '../i18n/pt-BR'

const fin = t.financeiro
const l = fin.lancamentos

// ‹ Setembro de 2026 ›
export function MesSeletor({ mes, onMudar }) {
  return (
    <div className="fin__mes" role="group" aria-label={rotuloMes(mes)}>
      <button type="button" className="fin__seta" onClick={() => onMudar(andarMes(mes, -1))} aria-label={fin.mesAnterior}>
        <IconeSetaEsquerda />
      </button>
      <h2 className="fin__mes-nome" aria-live="polite">
        {rotuloMes(mes)}
      </h2>
      <button type="button" className="fin__seta" onClick={() => onMudar(andarMes(mes, 1))} aria-label={fin.proximoMes}>
        <IconeSetaDireita />
      </button>
    </div>
  )
}

// Lançamentos agrupados por dia, com o resultado de cada dia. Com `revisando`, cada linha sem
// categoria ganha o seletor para categorizar ali mesmo.
export function ListaPorDia({ transacoes, contaPorId, categoriaPorId, categorias, revisando, onAbrir, onCategorizar }) {
  const hojeDia = hojeBrasilia()
  return agruparPorDia(transacoes).map((g) => (
    <section key={g.dia} className="fin-dia" aria-labelledby={`fin-dia-${g.dia}`}>
      <h3 className="fin-dia__cabeca" id={`fin-dia-${g.dia}`}>
        <span className="label">
          {rotuloDia(g.dia)}
          {g.dia > hojeDia && ` · ${l.agendado}`}
        </span>
        {/* Dia só com transferências (ou só agendado) não mexe no resultado: sem total. */}
        {g.total !== 0 && g.dia <= hojeDia && (
          <span
            className="fin-dia__total"
            data-direcao={g.total > 0 ? 'entrada' : 'saida'}
            aria-label={l.totalDia(formatarReais(g.total, { sinal: true }))}
          >
            {formatarReais(g.total, { sinal: true })}
          </span>
        )}
      </h3>
      <ul className="fin-lista">
        {g.itens.map((x) => (
          <li key={x.id} className="fin-lista__item">
            <LinhaLancamento
              transacao={x}
              conta={contaPorId[x.conta_id]}
              destino={contaPorId[x.conta_destino_id]}
              categoria={categoriaPorId[x.categoria_id]}
              onAbrir={() => onAbrir(x)}
            />
            {revisando && x.tipo !== 'transferencia' && !x.categoria_id && (
              <span className="select fin-lista__categoria">
                <select
                  className="input"
                  aria-label={fin.revisar.categoriaDe(x.descricao)}
                  value=""
                  onChange={(e) => onCategorizar(x, e.target.value)}
                >
                  <option value="" disabled>
                    {fin.revisar.escolher}
                  </option>
                  {categorias
                    .filter((c) => !c.arquivada && c.tipo === (x.tipo === 'entrada' ? 'receita' : 'despesa'))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                </select>
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  ))
}

// Uma linha do extrato: bloco da categoria, descrição, de onde veio e o valor com sinal.
function LinhaLancamento({ transacao: x, conta, destino, categoria, onAbrir }) {
  const transferencia = x.tipo === 'transferencia'
  const revisar = !transferencia && !categoria
  const detalhe = transferencia ? l.transferencia(conta?.nome ?? '—', destino?.nome ?? '—') : (conta?.nome ?? '—')
  const marcas = [x.pendente ? l.pendente : null, x.duplicata_de ? l.duplicata : null].filter(Boolean).join(' · ')
  const valor = x.tipo === 'saida' ? -x.valor_centavos : x.valor_centavos
  return (
    <button
      type="button"
      className="fin-linha"
      onClick={onAbrir}
      data-tipo={x.tipo}
      data-agendado={x.data > hojeBrasilia()}
      data-categoria={Boolean(categoria)}
      style={categoria ? { '--c': categoria.cor } : undefined}
    >
      <span className="fin-linha__ponto" data-vazio={transferencia || revisar} aria-hidden="true" />
      <span className="fin-linha__texto">
        <span className="fin-linha__descricao">{x.descricao}</span>
        {/* As marcas ficam fora das reticências: no celular, "possível duplicata" não some. */}
        <span className="fin-linha__detalhes">
          <span className="fin-linha__detalhe" data-revisar={revisar}>
            {!transferencia && (
              <>
                <span className="fin-linha__cat">{categoria?.nome ?? l.semCategoria}</span>
                {' · '}
              </>
            )}
            {detalhe}
          </span>
          {marcas && <span className="fin-linha__marcas">{marcas}</span>}
        </span>
      </span>
      <span className="fin-linha__valor">{formatarReais(valor, { sinal: x.tipo === 'entrada' })}</span>
    </button>
  )
}

// Contas e cartões com saldo e total. Com `onAbrir`, cada conta abre a edição e aparece
// "+ Nova conta" (página Lançamentos); sem, é só a leitura dos saldos (página Controle).
export function ContasCartoes({ contas, saldos, onAbrir, onNova, recolhivel = false }) {
  const [aberto, setAberto] = useState(false)
  const visiveis = contas.filter((c) => !c.arquivada)
  const arquivadas = contas.length - visiveis.length
  const total = visiveis.reduce((soma, c) => soma + (saldos[c.id] ?? c.saldo_inicial_centavos), 0)
  return (
    <section className="panel fin-contas" data-recolhivel={recolhivel} data-aberto={aberto} aria-labelledby="fin-contas">
      <h2 id="fin-contas" className="label">
        {fin.contas.titulo}
      </h2>
      <ul className="fin-contas__lista">
        {visiveis.map((c) => {
          const saldo = saldos[c.id] ?? c.saldo_inicial_centavos
          const conteudo = (
            <>
              <span className="fin-conta__quem">
                <span className="fin-conta__nome">{c.nome}</span>
                <span className="hint">
                  {fin.contas.tipos[c.tipo]}
                  {c.origem === 'banco' ? ` · ${l.doBanco}` : ''}
                  {c.tipo === 'cartao' && c.dia_vencimento ? ` · ${fin.contas.vence(c.dia_vencimento)}` : ''}
                </span>
              </span>
              <span className="fin-conta__saldo" data-direcao={saldo < 0 ? 'saida' : undefined}>
                {c.tipo === 'cartao' && saldo < 0 && <span className="hint">{fin.contas.fatura} </span>}
                {formatarReais(c.tipo === 'cartao' && saldo < 0 ? -saldo : saldo)}
              </span>
            </>
          )
          return (
            <li key={c.id}>
              {onAbrir ? (
                <button type="button" className="fin-conta" onClick={() => onAbrir(c)}>
                  {conteudo}
                </button>
              ) : (
                <div className="fin-conta" data-leitura="true">
                  {conteudo}
                </div>
              )}
            </li>
          )
        })}
      </ul>
      <div className="fin-contas__total" data-tom={total < 0 ? 'saida' : 'entrada'}>
        <span className="label">{fin.contas.total}</span>
        <span className="fin-contas__valor">{formatarReais(total)}</span>
      </div>
      {recolhivel && (
        <button type="button" className="link-btn fin-contas__alternar" aria-expanded={aberto} onClick={() => setAberto((a) => !a)}>
          {aberto ? fin.contas.esconder : fin.contas.ver(visiveis.length)}
        </button>
      )}
      {(onNova || arquivadas > 0) && (
        <div className="fin-contas__pe">
          {onNova && (
            <button type="button" className="acao-nova" onClick={onNova}>
              <IconeMais />
              {fin.contas.nova}
            </button>
          )}
          {arquivadas > 0 && <span className="hint">{fin.contas.arquivadas(arquivadas)}</span>}
        </div>
      )}
    </section>
  )
}
