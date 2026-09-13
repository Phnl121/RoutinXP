import { useCallback, useEffect, useMemo, useState } from 'react'
import { MESES_DO_RESUMO, useFinanceiro } from '../lib/useFinanceiro'
import {
  agruparPorDia,
  andarMes,
  formatarReais,
  gastosPorCategoria,
  mesAtual,
  mesesAte,
  montarDre,
  nomeDoMes,
  rotuloDia,
  rotuloMes,
  somar,
  somarPorMes,
  variacaoPct,
} from '../lib/dinheiro'
import { DrePessoal, EvolucaoMeses, GastosPorCategoria } from '../components/FinanceiroResumo'
import { BancosConectados } from '../components/FinanceiroBancos'
import { RegrasDialog } from '../components/FinanceiroRegras'
import { combina, termoSugerido } from '../lib/regras'
import { ehAdmin, useConta } from '../lib/conta'
import { Link } from 'react-router'
import { cobrancasEntre, custoMensal, somarDias } from '../lib/gastosFixos'
import { CategoriasFinDialog, ContaFinDialog, LancamentoDialog, Segmentos } from '../components/FinanceiroParts'
import { Toast } from '../components/Toast'
import { Aviso } from '../components/AuthParts'
import { hojeBrasilia } from '../lib/datas'
import { mensagemErroDados } from '../lib/dadosErros'
import { IconeLupa, IconeMais, IconeSetaDireita, IconeSetaEsquerda } from '../components/icones'
import { t } from '../i18n/pt-BR'
import './financeiro.css'

const fin = t.financeiro
const l = fin.lancamentos

// O mês numa página só (estrutura escolhida pelo usuário, 2026-09-13): placar do mês no alto,
// lançamentos por dia à esquerda, contas e cartões à direita.
export default function Financeiro() {
  const [mes, setMes] = useState(mesAtual)
  const d = useFinanceiro(mes)
  const conta = useConta()
  const [dlg, setDlg] = useState(null) // { tipo: 'lancamento' | 'conta' | 'categorias', item? }
  const [aviso, setAviso] = useState(null)
  const [busca, setBusca] = useState('')
  const [tipo, setTipo] = useState('todos')
  const [categoriaId, setCategoriaId] = useState('')
  const [contaId, setContaId] = useState('')

  const contaPorId = useMemo(() => Object.fromEntries(d.contas.map((c) => [c.id, c])), [d.contas])
  const categoriaPorId = useMemo(() => Object.fromEntries(d.categorias.map((c) => [c.id, c])), [d.categorias])

  const termo = busca.trim().toLocaleLowerCase('pt-BR')
  const filtrando = Boolean(termo || tipo !== 'todos' || categoriaId || contaId)
  const filtradas = d.transacoes.filter(
    (x) =>
      (tipo === 'todos' || x.tipo === tipo) &&
      (!categoriaId || (categoriaId === 'revisar' ? x.tipo !== 'transferencia' && !x.categoria_id : x.categoria_id === categoriaId)) &&
      (!contaId || x.conta_id === contaId || x.conta_destino_id === contaId) &&
      (!termo || x.descricao.toLocaleLowerCase('pt-BR').includes(termo)),
  )
  // Parcelas com data futura aparecem na lista como agendadas, mas ainda não contam nos totais.
  const hojeDia = hojeBrasilia()
  const efetivas = d.transacoes.filter((x) => x.data <= hojeDia)
  const placar = somar(efetivas)
  // Com uma conta escolhida, transferências contam: entram ou saem daquela conta.
  const somaFiltro = contaId
    ? filtradas.reduce(
        (soma, x) => {
          if (x.data > hojeDia) return soma
          const entra = x.tipo === 'entrada' || (x.tipo === 'transferencia' && x.conta_destino_id === contaId)
          return entra ? { ...soma, entradas: soma.entradas + x.valor_centavos } : { ...soma, saidas: soma.saidas + x.valor_centavos }
        },
        { entradas: 0, saidas: 0 },
      )
    : somar(filtradas.filter((x) => x.data <= hojeDia))
  const grupos = agruparPorDia(filtradas)

  const excluir = useCallback(
    (id) => {
      d.excluirTransacao(id, (erro) => setAviso({ tipo: 'erro', texto: mensagemErroDados(erro) }))
      setAviso({
        tipo: 'desfazer',
        chave: `fin-${id}`,
        texto: l.excluido,
        onDesfazer: () => {
          d.desfazerExclusao(id)
          setAviso(null)
        },
      })
    },
    [d],
  )
  const fecharAviso = useCallback(() => setAviso(null), [])
  const regrasAtuais = d.regras
  // A sugestão de regra some sozinha junto com a barra de tempo do aviso (5 s).
  useEffect(() => {
    if (!aviso?.chave?.startsWith('regra-')) return undefined
    const timer = setTimeout(() => setAviso((a) => (a?.chave === aviso.chave ? null : a)), 5000)
    return () => clearTimeout(timer)
  }, [aviso])

  // Depois de escolher a categoria de um lançamento do banco: "Criar uma regra para ...?".
  const sugerirRegra = useCallback((transacao, categoriaId) => {
    const termo = termoSugerido(transacao.descricao)
    if (!termo || !categoriaId) return
    // Já existe regra que pega esta descrição: não sugere outra.
    if (regrasAtuais.some((regra) => combina(transacao.descricao, regra.termo))) return
    setAviso({
      tipo: 'desfazer',
      chave: `regra-${transacao.id}-${categoriaId}`,
      texto: t.financeiro.regras.categoriaSalva(termo.toUpperCase()),
      acaoTexto: t.financeiro.regras.criarRegra,
      onDesfazer: () => {
        setAviso(null)
        setDlg({ tipo: 'regras', sugestao: { termo, categoria_id: categoriaId, tipo: transacao.tipo } })
      },
    })
  }, [regrasAtuais])

  const limparFiltros = () => {
    setBusca('')
    setTipo('todos')
    setCategoriaId('')
    setContaId('')
  }

  const novoLancamento = () => setDlg({ tipo: 'lancamento' })
  const semContas = d.estado === 'pronto' && d.contas.length === 0
  const aRevisar = d.transacoes.filter((x) => x.tipo !== 'transferencia' && !x.categoria_id).length

  if (d.estado !== 'pronto') {
    return (
      <main className="fin">
        <h1 className="main__titulo">{fin.titulo}</h1>
        {d.estado === 'erro' ? (
          <div className="fin__erro">
            <Aviso>{fin.erro}</Aviso>
            <button type="button" className="btn btn--compacto" onClick={d.tentarDeNovo}>
              {fin.tentar}
            </button>
          </div>
        ) : (
          <p className="label" aria-busy="true">
            {fin.carregando}
          </p>
        )}
      </main>
    )
  }

  const contasVisiveis = d.contas.filter((c) => !c.arquivada)
  const arquivadas = d.contas.length - contasVisiveis.length
  const saldoTotal = contasVisiveis.reduce((soma, c) => soma + (d.saldos[c.id] ?? c.saldo_inicial_centavos), 0)
  const porCategoria = d.transacoes.reduce((mapa, x) => (x.categoria_id ? { ...mapa, [x.categoria_id]: (mapa[x.categoria_id] ?? 0) + 1 } : mapa), {})
  const poupado = placar.entradas > 0 ? Math.round((placar.resultado / placar.entradas) * 100) : null

  // Resumo (fase 2): comparação com o mês anterior, gastos por categoria, DRE e evolução.
  const evolucao = somarPorMes(
    d.historico.filter((x) => x.data <= hojeDia),
    mesesAte(mes, MESES_DO_RESUMO),
  )
  const mesAnterior = evolucao[evolucao.length - 2].mes
  const temAntes = d.historico.some((x) => x.data.startsWith(mesAnterior))
  // No mês em andamento, a comparação é com o mês anterior até o mesmo dia (13 dias contra 13).
  const emAndamento = mes === mesAtual()
  const diaHoje = Number(hojeBrasilia().slice(8, 10))
  const antes = somar(
    d.historico.filter((x) => x.data.startsWith(mesAnterior) && (!emAndamento || Number(x.data.slice(8, 10)) <= diaHoje)),
  )
  const nomeAntes = emAndamento ? fin.placar.ateDia(nomeDoMes(mesAnterior), diaHoje) : nomeDoMes(mesAnterior)
  const poupadoAntes = antes.entradas > 0 ? Math.round((antes.resultado / antes.entradas) * 100) : null
  const comparacao = temAntes
    ? {
        entradas: variacaoPct(placar.entradas, antes.entradas),
        saidas: variacaoPct(placar.saidas, antes.saidas),
        resultado: placar.resultado - antes.resultado,
        poupado: poupado !== null && poupadoAntes !== null ? poupado - poupadoAntes : null,
      }
    : null
  const gastos = gastosPorCategoria(efetivas, categoriaPorId)
  const dre = montarDre(efetivas, categoriaPorId)
  const verCategoria = (id) => {
    setCategoriaId(id)
    setTipo('todos')
    document.getElementById('fin-lanc')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const variacao = (texto) => texto !== null && <dd className="fin-placar__var">{texto}</dd>

  return (
    <>
      <main className="fin">
        <header className="fin__cabeca">
          <h1 className="main__titulo">{fin.titulo}</h1>
          <div className="fin__mes" role="group" aria-label={rotuloMes(mes)}>
            <button type="button" className="fin__seta" onClick={() => setMes((m) => andarMes(m, -1))} aria-label={fin.mesAnterior}>
              <IconeSetaEsquerda />
            </button>
            <h2 className="fin__mes-nome" aria-live="polite">
              {rotuloMes(mes)}
            </h2>
            <button type="button" className="fin__seta" onClick={() => setMes((m) => andarMes(m, 1))} aria-label={fin.proximoMes}>
              <IconeSetaDireita />
            </button>
          </div>
          <div className="fin__acoes">
            <button type="button" className="link-btn" onClick={() => setDlg({ tipo: 'regras' })}>
              {fin.regras.abrir}
            </button>
            <button type="button" className="link-btn" onClick={() => setDlg({ tipo: 'categorias' })}>
              {fin.categorias}
            </button>
            {!semContas && (
              <button type="button" className="btn fin__novo" onClick={novoLancamento} aria-label={fin.novoLancamentoRotulo}>
                <IconeMais />
                {fin.novoLancamento}
              </button>
            )}
          </div>
        </header>

        {semContas ? (
          <section className="panel fin-comecar" aria-labelledby="fin-comecar">
            <h2 id="fin-comecar" className="fin-comecar__titulo">
              {fin.comecar.titulo}
            </h2>
            <p className="fin-comecar__texto">{fin.comecar.texto}</p>
            <button type="button" className="btn" onClick={() => setDlg({ tipo: 'conta' })}>
              <IconeMais />
              {fin.comecar.acao}
            </button>
          </section>
        ) : (
          <>
            <section className="panel fin-placar" aria-label={fin.placar.rotulo}>
              <dl className="fin-placar__itens">
                <div data-tom="entrada">
                  <dt className="label">{fin.placar.entradas}</dt>
                  <dd className="fin-placar__valor" data-direcao="entrada">
                    {formatarReais(placar.entradas)}
                  </dd>
                  {comparacao && comparacao.entradas !== null && variacao(fin.placar.pct(comparacao.entradas, nomeAntes))}
                </div>
                <div data-tom="saida">
                  <dt className="label">{fin.placar.saidas}</dt>
                  <dd className="fin-placar__valor" data-direcao="saida">
                    {formatarReais(placar.saidas)}
                  </dd>
                  {comparacao && comparacao.saidas !== null && variacao(fin.placar.pct(comparacao.saidas, nomeAntes))}
                </div>
                <div data-tom={placar.resultado > 0 ? 'entrada' : placar.resultado < 0 ? 'saida' : 'neutro'}>
                  <dt className="label">{fin.placar.resultado}</dt>
                  <dd className="fin-placar__valor" data-direcao={placar.resultado > 0 ? 'entrada' : placar.resultado < 0 ? 'saida' : undefined}>
                    {formatarReais(placar.resultado, { sinal: true })}
                  </dd>
                  {comparacao &&
                    comparacao.resultado !== 0 &&
                    variacao(fin.placar.diferenca(formatarReais(Math.abs(comparacao.resultado)), comparacao.resultado > 0, nomeAntes))}
                </div>
                <div data-tom="poupado">
                  <dt className="label">{fin.placar.poupado}</dt>
                  <dd className="fin-placar__valor">
                    {poupado === null ? <span className="fin-placar__nada">{fin.placar.semEntradas}</span> : `${poupado}%`}
                  </dd>
                  {comparacao && comparacao.poupado !== null && variacao(fin.placar.pontos(comparacao.poupado, nomeAntes))}
                </div>
              </dl>
              {/* Uma coluna só: o resumo fica depois dos lançamentos; o atalho leva até ele. */}
              <a className="link-btn fin-placar__atalho" href="#fin-gastos">
                {fin.placar.verResumo}
              </a>
            </section>

            <div className="fin__grade">
              <section className="fin-lanc" aria-labelledby="fin-lanc">
                <h2 id="fin-lanc" className="visually-hidden">
                  {l.titulo}
                </h2>
                <div className="fin-filtros">
                  <label className="fin-busca">
                    <IconeLupa />
                    <span className="visually-hidden">{l.busca}</span>
                    <input className="input" type="search" placeholder={l.busca} value={busca} onChange={(e) => setBusca(e.target.value)} />
                  </label>
                  <Segmentos
                    rotulo={l.tipoRotulo}
                    valor={tipo}
                    onMudar={setTipo}
                    opcoes={['todos', 'entrada', 'saida', 'transferencia'].map((v) => ({ valor: v, rotulo: l.tipos[v] }))}
                  />
                  <span className="select fin-filtros__select">
                    <select className="input" aria-label={t.formTarefa.categoria} value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
                      <option value="">{l.todasCategorias}</option>
                      <option value="revisar">{l.semCategoria}</option>
                      {d.categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome} · {c.tipo === 'despesa' ? t.financeiro.formLancamento.tipos.saida : t.financeiro.formLancamento.tipos.entrada}
                        </option>
                      ))}
                    </select>
                  </span>
                  <span className="select fin-filtros__select">
                    <select className="input" aria-label={fin.contas.titulo} value={contaId} onChange={(e) => setContaId(e.target.value)}>
                      <option value="">{l.todasContas}</option>
                      {d.contas.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                  </span>
                </div>

                {aRevisar > 0 && categoriaId !== 'revisar' && (
                  <p className="fin-revisar">
                    <span>{fin.revisar.faixa(aRevisar)}</span>
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => {
                        setCategoriaId('revisar')
                        setTipo('todos')
                      }}
                    >
                      {fin.revisar.ver}
                    </button>
                  </p>
                )}

                {filtrando && (
                  <p className="fin-filtros__resumo" role="status">
                    <span>{l.filtrados(filtradas.length, formatarReais(somaFiltro.entradas), formatarReais(somaFiltro.saidas))}</span>
                    <button type="button" className="link-btn" onClick={limparFiltros}>
                      {l.limpar}
                    </button>
                  </p>
                )}

                {d.carregandoMes ? (
                  <p className="label" aria-busy="true">
                    {t.app.carregando}
                  </p>
                ) : d.erroMes ? (
                  <Aviso>{fin.erroMes}</Aviso>
                ) : grupos.length === 0 ? (
                  <div className="fin-vazio">
                    <p>{filtrando ? l.vazioFiltro : l.vazioMes(nomeDoMes(mes))}</p>
                    {!filtrando && (
                      <button type="button" className="acao-nova" onClick={novoLancamento}>
                        <IconeMais />
                        {fin.novoLancamentoRotulo}
                      </button>
                    )}
                  </div>
                ) : (
                  grupos.map((g) => (
                    <section key={g.dia} className="fin-dia" aria-labelledby={`fin-dia-${g.dia}`}>
                      <h3 className="fin-dia__cabeca" id={`fin-dia-${g.dia}`}>
                        <span className="label">
                          {rotuloDia(g.dia)}
                          {g.dia > hojeDia && ` · ${l.agendado}`}
                        </span>
                        {/* Dia só com transferências não mexe no resultado: sem total. */}
                        {g.total !== 0 && g.dia <= hojeDia && (
                          <span className="fin-dia__total" data-direcao={g.total > 0 ? 'entrada' : 'saida'} aria-label={l.totalDia(formatarReais(g.total, { sinal: true }))}>
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
                              onAbrir={() => setDlg({ tipo: 'lancamento', item: x })}
                            />
                            {/* Na fila "A revisar": a categoria se escolhe na própria linha. */}
                            {categoriaId === 'revisar' && x.tipo !== 'transferencia' && (
                              <span className="select fin-lista__categoria">
                                <select
                                  className="input"
                                  aria-label={fin.revisar.categoriaDe(x.descricao)}
                                  value=""
                                  onChange={async (e) => {
                                    const escolhida = e.target.value
                                    try {
                                      await d.categorizar(x.id, escolhida)
                                      if (x.origem === 'banco') sugerirRegra(x, escolhida)
                                    } catch (erro) {
                                      setAviso({ tipo: 'erro', texto: mensagemErroDados(erro) })
                                    }
                                  }}
                                >
                                  <option value="" disabled>
                                    {fin.revisar.escolher}
                                  </option>
                                  {d.categorias
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
                )}
              </section>

              <aside className="fin__lado">
                <section className="panel fin-contas" aria-labelledby="fin-contas">
                  <h2 id="fin-contas" className="label">
                    {fin.contas.titulo}
                  </h2>
                  <ul className="fin-contas__lista">
                    {contasVisiveis.map((c) => {
                      const saldo = d.saldos[c.id] ?? c.saldo_inicial_centavos
                      return (
                        <li key={c.id}>
                          <button type="button" className="fin-conta" onClick={() => setDlg({ tipo: 'conta', item: c })}>
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
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                  <div className="fin-contas__total" data-tom={saldoTotal < 0 ? 'saida' : 'entrada'}>
                    <span className="label">{fin.contas.total}</span>
                    <span className="fin-contas__valor">{formatarReais(saldoTotal)}</span>
                  </div>
                  <div className="fin-contas__pe">
                    <button type="button" className="acao-nova" onClick={() => setDlg({ tipo: 'conta' })}>
                      <IconeMais />
                      {fin.contas.nova}
                    </button>
                    {arquivadas > 0 && <span className="hint">{fin.contas.arquivadas(arquivadas)}</span>}
                  </div>
                </section>

                {ehAdmin(conta) && <BancosConectados conexoes={d.conexoes} onLer={d.lerBancos} onDesconectar={d.desconectarBanco} />}

                {d.recorrencias.length > 0 && (
                  <section className="panel fin-resumo gf-cartao" aria-labelledby="gf-cartao">
                    <h2 id="gf-cartao" className="label">
                      {t.gastosFixos.cartao.titulo}
                    </h2>
                    <p className="gf-cartao__valor">
                      {t.gastosFixos.cartao.mensal(formatarReais(d.recorrencias.reduce((soma, rec) => soma + custoMensal(rec, hojeBrasilia()), 0)))}
                    </p>
                    <p className="hint">
                      {t.gastosFixos.cartao.proximas(
                        d.recorrencias.flatMap((rec) => cobrancasEntre(rec, hojeBrasilia(), somarDias(hojeBrasilia(), 7))).length,
                      )}
                    </p>
                    <Link to="/financeiro/gastos-fixos" className="link-btn gf-cartao__ver">
                      {t.gastosFixos.cartao.ver}
                    </Link>
                  </section>
                )}

                <GastosPorCategoria linhas={gastos} onEscolher={verCategoria} />
                <DrePessoal dre={dre} />
                <EvolucaoMeses meses={evolucao} mesAtual={mes} />
              </aside>
            </div>
          </>
        )}
      </main>

      {!semContas && (
        <button type="button" className="fab fin__fab" onClick={novoLancamento} aria-label={fin.novoLancamentoRotulo}>
          <IconeMais />
        </button>
      )}

      {dlg?.tipo === 'lancamento' && (
        <LancamentoDialog
          transacao={dlg.item}
          contas={d.contas}
          categorias={d.categorias}
          manualParecido={dlg.item?.duplicata_de ? d.historico.find((x) => x.id === dlg.item.duplicata_de) : null}
          onResolverDuplicata={d.resolverDuplicata}
          onSalvar={async (transacao) => {
            await d.salvarTransacao(transacao)
            if (dlg.item?.origem === 'banco' && transacao.categoria_id && transacao.categoria_id !== dlg.item.categoria_id) {
              sugerirRegra(dlg.item, transacao.categoria_id)
            }
          }}
          onExcluir={excluir}
          onFechar={() => setDlg(null)}
        />
      )}
      {dlg?.tipo === 'conta' && (
        <ContaFinDialog conta={dlg.item} saldoAtual={dlg.item ? d.saldos[dlg.item.id] : undefined} contas={d.contas} onJuntar={d.juntarContas} onSalvar={d.salvarConta} onExcluir={d.excluirConta} onFechar={() => setDlg(null)} />
      )}
      {dlg?.tipo === 'regras' && (
        <RegrasDialog
          regras={d.regras}
          categorias={d.categorias}
          sugestao={dlg.sugestao}
          onSalvar={d.salvarRegra}
          onExcluir={d.excluirRegra}
          onAplicar={d.aplicarRegras}
          onFechar={() => setDlg(null)}
        />
      )}
      {dlg?.tipo === 'categorias' && (
        <CategoriasFinDialog
          categorias={d.categorias}
          transacoesPorCategoria={porCategoria}
          onSalvar={d.salvarCategoria}
          onExcluir={d.excluirCategoria}
          onFechar={() => setDlg(null)}
        />
      )}
      {/* Na fila "A revisar", o aviso vai para o canto e não cobre o seletor da próxima linha. */}
      <div className="fin-toast" data-fila={categoriaId === 'revisar'}>
        <Toast aviso={aviso} onFechar={fecharAviso} />
      </div>
    </>
  )
}

// Uma linha do extrato: ponto da categoria, descrição, de onde veio e o valor com sinal.
function LinhaLancamento({ transacao: x, conta, destino, categoria, onAbrir }) {
  const transferencia = x.tipo === 'transferencia'
  const revisar = !transferencia && !categoria
  const detalhe = transferencia ? l.transferencia(conta?.nome ?? '—', destino?.nome ?? '—') : conta?.nome ?? '—'
  const marcas = [x.pendente ? l.pendente : null, x.duplicata_de ? l.duplicata : null].filter(Boolean).join(' · ')
  const valor = x.tipo === 'entrada' ? x.valor_centavos : x.tipo === 'saida' ? -x.valor_centavos : x.valor_centavos
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
      <span
        className="fin-linha__ponto"
        data-vazio={transferencia || revisar}
        style={categoria ? { '--c': categoria.cor } : undefined}
        aria-hidden="true"
      />
      <span className="fin-linha__texto">
        <span className="fin-linha__descricao">{x.descricao}</span>
        {/* As marcas ficam fora das reticências: no celular, "possível duplicata" não some. */}
        <span className="fin-linha__detalhes">
          <span className="fin-linha__detalhe" data-revisar={revisar}>
            {!transferencia && (
              <>
                <span className="fin-linha__cat" style={categoria ? { '--c': categoria.cor } : undefined}>
                  {categoria?.nome ?? l.semCategoria}
                </span>
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
