import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { DIAS_A_FRENTE, DIAS_ATRAS, useGastosFixos } from '../lib/useGastosFixos'
import { chaveCobranca, cobrancasEntre, custoAnual, custoMensal, progressoParcelas, proximaCobranca, somarDias } from '../lib/gastosFixos'
import { formatarReais, mesDe, rotuloDia } from '../lib/dinheiro'
import { diaBrasilia, formatarPrazo, hojeBrasilia } from '../lib/datas'
import { GastoFixoDialog, PagarDialog } from '../components/GastosFixosParts'
import { Toast } from '../components/Toast'
import { Aviso } from '../components/AuthParts'
import { IconeCheck, IconeMais, IconeRelogio } from '../components/icones'
import { t } from '../i18n/pt-BR'
import './financeiro.css'

const g = t.gastosFixos
const TIPOS = ['assinatura', 'parcelada', 'conta', 'outro']
const DIAS_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

// Como o gasto se repete, em palavras: "todo dia 6", "todo ano em 3 nov", "toda segunda".
function repeticao(rec) {
  const [ano, mes, dia] = rec.inicio.split('-').map(Number)
  if (rec.frequencia === 'semanal') return g.todaSemana(DIAS_SEMANA[new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay()])
  if (rec.frequencia === 'anual') {
    const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(ano, mes - 1, dia))).replace('.', '')
    return g.todoAno(`${dia} ${nomeMes}`)
  }
  return g.todoDia(dia)
}

// Gastos fixos (fase 3 do Financeiro), estrutura escolhida pelo usuário: próximas cobranças à
// esquerda, cadastros agrupados por tipo à direita.
export default function GastosFixos() {
  const d = useGastosFixos()
  const [dlg, setDlg] = useState(null) // { tipo: 'gasto', item? } | { tipo: 'pagar', rec, dia }
  const [aviso, setAviso] = useState(null)
  const fecharAviso = useCallback(() => setAviso(null), [])
  const hoje = hojeBrasilia()

  const contaPorId = useMemo(() => Object.fromEntries(d.contas.map((c) => [c.id, c])), [d.contas])
  const pagoPor = useMemo(() => new Map(d.pagamentos.map((x) => [chaveCobranca(x.recorrencia_id, x.referencia), x])), [d.pagamentos])

  if (d.estado !== 'pronto') {
    return (
      <main className="fin">
        <h1 className="main__titulo">{g.titulo}</h1>
        {d.estado === 'erro' ? (
          <div className="fin__erro">
            <Aviso>{g.erro}</Aviso>
            <button type="button" className="btn btn--compacto" onClick={d.tentarDeNovo}>
              {g.tentar}
            </button>
          </div>
        ) : (
          <p className="label" aria-busy="true">
            {g.carregando}
          </p>
        )}
      </main>
    )
  }

  const recs = d.recorrencias
  const semContas = d.contas.length === 0

  // Cobranças: vencidas sem pagamento (últimos dias) e as dos próximos 30 dias.
  const limite = somarDias(hoje, DIAS_A_FRENTE)
  const desdeCadastro = (rec) => {
    const cadastro = diaBrasilia(rec.created_at)
    const janela = somarDias(hoje, -DIAS_ATRAS)
    return cadastro > janela ? cadastro : janela
  }
  const cobrancas = recs.flatMap((rec) =>
    cobrancasEntre(rec, rec.tipo === 'parcelada' ? hoje : desdeCadastro(rec), limite).map((c) => ({
      rec,
      ...c,
      pagamento: pagoPor.get(chaveCobranca(rec.id, c.dia)) ?? null,
    })),
  )
  const vencidas = cobrancas.filter((c) => c.rec.tipo !== 'parcelada' && c.dia < hoje && !c.pagamento).sort((a, b) => a.dia.localeCompare(b.dia))
  const proximas = cobrancas.filter((c) => c.dia >= hoje).sort((a, b) => a.dia.localeCompare(b.dia) || a.rec.nome.localeCompare(b.rec.nome))
  // Pagas neste mês com o dia já passado: continuam à vista, com o check e o Desfazer.
  const inicioMes = `${mesDe(hoje)}-01`
  // (desde o começo do mês, mesmo antes do cadastro: o que foi pago aparece)
  const pagasNoMes = recs
    .filter((rec) => rec.tipo !== 'parcelada')
    .flatMap((rec) =>
      cobrancasEntre(rec, inicioMes, somarDias(hoje, -1)).map((c) => ({ rec, ...c, pagamento: pagoPor.get(chaveCobranca(rec.id, c.dia)) ?? null })),
    )
    .filter((c) => c.pagamento)
    .sort((a, b) => a.dia.localeCompare(b.dia))
  const porDia = proximas.reduce((mapa, c) => mapa.set(c.dia, [...(mapa.get(c.dia) ?? []), c]), new Map())

  // Placar.
  const mensal = recs.reduce((soma, rec) => soma + custoMensal(rec, hoje), 0)
  const assinaturasAno = recs
    .filter((rec) => rec.tipo === 'assinatura' && rec.ativa && (!rec.fim || rec.fim >= hoje))
    .reduce((soma, rec) => soma + custoAnual(rec), 0)
  const parceladasAbertas = recs.filter((rec) => rec.tipo === 'parcelada').map((rec) => progressoParcelas(rec, hoje)).filter((p) => p.restantes > 0)
  const parcelasFalta = parceladasAbertas.reduce((soma, p) => soma + p.falta, 0)
  const mes = mesDe(hoje)
  // Pagas contam sempre; em aberto, só as que a lista também mostra (desde o cadastro).
  const doMes = recs
    .filter((rec) => rec.tipo !== 'parcelada')
    .flatMap((rec) => {
      const piso = desdeCadastro(rec)
      return cobrancasEntre(rec, `${mes}-01`, `${mes}-31`)
        .map((c) => ({ paga: pagoPor.has(chaveCobranca(rec.id, c.dia)), visivel: c.dia >= piso }))
        .filter((c) => c.paga || c.visivel)
        .map((c) => c.paga)
    })
  const pagosNoMes = doMes.filter(Boolean).length

  async function pagar(c) {
    if (c.rec.valor_variavel) {
      setDlg({ tipo: 'pagar', rec: c.rec, dia: c.dia })
      return
    }
    try {
      const pagamento = await d.pagar({
        rec: c.rec,
        referencia: c.dia,
        valor_centavos: c.rec.valor_centavos,
        // Pagamento é registrado no dia em que foi feito (hoje), não no vencimento.
        data: hoje,
        conta_id: c.rec.conta_id,
      })
      avisarPago(c.rec.nome, pagamento.id)
    } catch (e) {
      setAviso({ tipo: 'erro', texto: t.dadosErros.generico, chave: `erro-${Date.now()}`, detalhe: e })
    }
  }

  function avisarPago(nome, transacaoId) {
    setAviso({
      tipo: 'desfazer',
      chave: `pago-${transacaoId}`,
      texto: g.proximas.pagoAviso(nome),
      onDesfazer: () => {
        d.desfazerPagamento(transacaoId).catch(() => setAviso({ tipo: 'erro', texto: t.dadosErros.generico }))
        setAviso(null)
      },
    })
  }

  const linhaCobranca = (c) => {
    const prazo = formatarPrazo(c.dia)
    const parcelada = c.rec.tipo === 'parcelada'
    return (
      <li key={chaveCobranca(c.rec.id, c.dia)} className="gf-cobranca" data-paga={!parcelada && Boolean(c.pagamento)}>
        <span className="gf-cobranca__texto">
          <span className="gf-cobranca__nome">{c.rec.nome}</span>
          <span className="gf-cobranca__detalhe">
            {parcelada ? g.proximas.parcela(c.parcela, c.rec.parcelas) : g.tipo[c.rec.tipo]}
            {c.rec.valor_variavel && !c.pagamento ? ` · ${g.proximas.aproximado}` : ''}
            {contaPorId[c.rec.conta_id] ? ` · ${contaPorId[c.rec.conta_id].nome}` : ''}
          </span>
        </span>
        <span className="gf-cobranca__lado">
          <span className="gf-cobranca__valor">{formatarReais((!parcelada && c.pagamento?.valor_centavos) || c.rec.valor_centavos)}</span>
          {parcelada ? (
            <span className="gf-cobranca__estado hint">{g.proximas.lancada}</span>
          ) : c.pagamento ? (
            <span className="gf-cobranca__estado">
              <span className="gf-pago">
                <IconeCheck />
                {g.proximas.paga}
              </span>
              <button type="button" className="link-btn" onClick={() => d.desfazerPagamento(c.pagamento.id)} aria-label={g.proximas.desfazerRotulo(c.rec.nome)}>
                {g.proximas.desfazer}
              </button>
            </span>
          ) : (
            <span className="gf-cobranca__estado">
              <span className="prazo" data-prazo={prazo.estado}>
                <IconeRelogio />
                {prazo.texto}
              </span>
              <button type="button" className="link-btn" onClick={() => pagar(c)} aria-label={g.proximas.pagarRotulo(c.rec.nome, rotuloDia(c.dia))}>
                {g.proximas.pagar}
              </button>
            </span>
          )}
        </span>
      </li>
    )
  }

  return (
    <>
      <main className="fin gf">
        <header className="gf__cabeca">
          <h1 className="main__titulo">{g.titulo}</h1>
          {!semContas && (
            <button type="button" className="btn fin__novo" onClick={() => setDlg({ tipo: 'gasto' })} aria-label={g.novo}>
              <IconeMais />
              {g.novoCurto}
            </button>
          )}
        </header>

        {semContas || recs.length === 0 ? (
          <section className="panel fin-comecar" aria-labelledby="gf-vazio">
            <h2 id="gf-vazio" className="fin-comecar__titulo">
              {g.vazio.titulo}
            </h2>
            <p className="fin-comecar__texto">{semContas ? g.vazio.semConta : g.vazio.texto}</p>
            {semContas ? (
              <Link to="/financeiro" className="btn">
                {g.vazio.irFinanceiro}
              </Link>
            ) : (
              <button type="button" className="btn" onClick={() => setDlg({ tipo: 'gasto' })}>
                <IconeMais />
                {g.novo}
              </button>
            )}
          </section>
        ) : (
          <>
            <section className="panel fin-placar" aria-label={g.placar.rotulo}>
              <dl className="fin-placar__itens">
                <div>
                  <dt className="label">{g.placar.mensal}</dt>
                  <dd className="fin-placar__valor">{formatarReais(mensal)}</dd>
                  <dd className="fin-placar__var">{g.placar.mensalDica}</dd>
                </div>
                <div>
                  <dt className="label">{g.placar.anual}</dt>
                  <dd className="fin-placar__valor">{formatarReais(assinaturasAno)}</dd>
                </div>
                <div>
                  <dt className="label">{g.placar.parcelas}</dt>
                  <dd className="fin-placar__valor">{formatarReais(parcelasFalta)}</dd>
                  <dd className="fin-placar__var">{g.placar.parcelasDica(parceladasAbertas.length)}</dd>
                </div>
                <div>
                  <dt className="label">{g.placar.pagos}</dt>
                  <dd className="fin-placar__valor">{g.placar.pagosValor(pagosNoMes, doMes.length)}</dd>
                </div>
              </dl>
            </section>

            <div className="gf__grade">
              <section className="panel gf-proximas" aria-labelledby="gf-proximas">
                <h2 id="gf-proximas" className="label">
                  {g.proximas.titulo}
                </h2>
                {vencidas.length > 0 && (
                  <div className="gf-dia">
                    <h3 className="gf-dia__cabeca label">{g.proximas.vencidas}</h3>
                    <ul className="gf-cobrancas">{vencidas.map(linhaCobranca)}</ul>
                  </div>
                )}
                {porDia.size === 0 && vencidas.length === 0 && pagasNoMes.length === 0 ? (
                  <p className="hint">{g.proximas.vazio}</p>
                ) : (
                  [...porDia.entries()].map(([dia, itens]) => (
                    <div key={dia} className="gf-dia">
                      <h3 className="gf-dia__cabeca label">{rotuloDia(dia)}</h3>
                      <ul className="gf-cobrancas">{itens.map(linhaCobranca)}</ul>
                    </div>
                  ))
                )}
                {pagasNoMes.length > 0 && (
                  <div className="gf-dia">
                    <h3 className="gf-dia__cabeca label">{g.proximas.pagasNoMes}</h3>
                    <ul className="gf-cobrancas">{pagasNoMes.map(linhaCobranca)}</ul>
                  </div>
                )}
              </section>

              <div className="gf-grupos">
                {TIPOS.map((tipo) => {
                  const itens = recs.filter((rec) => rec.tipo === tipo).sort((a, b) => Number(b.ativa) - Number(a.ativa) || a.nome.localeCompare(b.nome))
                  if (!itens.length) return null
                  const subtotal = itens.reduce((soma, rec) => soma + custoMensal(rec, hoje), 0)
                  return (
                    <section key={tipo} className="panel gf-grupo" aria-labelledby={`gf-${tipo}`}>
                      <div className="fin-resumo__cabeca">
                        <h2 id={`gf-${tipo}`} className="label">
                          {g.tipos[tipo]}
                        </h2>
                        <span className="gf-grupo__subtotal">{g.subtotal(formatarReais(subtotal))}</span>
                      </div>
                      <ul className="gf-lista">
                        {itens.map((rec) => (
                          <li key={rec.id}>
                            <LinhaGasto rec={rec} conta={contaPorId[rec.conta_id]} hoje={hoje} onAbrir={() => setDlg({ tipo: 'gasto', item: rec })} />
                          </li>
                        ))}
                      </ul>
                    </section>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </main>

      {!semContas && (
        <button type="button" className="fab fin__fab" onClick={() => setDlg({ tipo: 'gasto' })} aria-label={g.novo}>
          <IconeMais />
        </button>
      )}

      {dlg?.tipo === 'gasto' && (
        <GastoFixoDialog
          recorrencia={dlg.item}
          contas={d.contas}
          categorias={d.categorias}
          onSalvar={d.salvar}
          onExcluir={d.excluir}
          onFechar={() => setDlg(null)}
        />
      )}
      {dlg?.tipo === 'pagar' && (
        <PagarDialog
          recorrencia={dlg.rec}
          referencia={dlg.dia}
          rotuloDia={rotuloDia(dlg.dia)}
          contas={d.contas}
          onPagar={async (cobranca) => {
            const pagamento = await d.pagar(cobranca)
            avisarPago(dlg.rec.nome, pagamento.id)
          }}
          onFechar={() => setDlg(null)}
        />
      )}
      <Toast aviso={aviso} onFechar={fecharAviso} />
    </>
  )
}

// Um gasto fixo cadastrado: como se repete, onde é cobrado e quanto pesa.
function LinhaGasto({ rec, conta, hoje, onAbrir }) {
  const parcelada = rec.tipo === 'parcelada'
  const progresso = parcelada ? progressoParcelas(rec, hoje) : null
  const proxima = !parcelada && rec.ativa ? proximaCobranca(rec, hoje) : null
  const detalhe = parcelada
    ? g.progresso(progresso.pagas, progresso.total, formatarReais(progresso.falta))
    : [repeticao(rec), rec.valor_variavel ? g.proximas.aproximado : null, conta?.nome].filter(Boolean).join(' · ')
  const lateral = !rec.ativa
    ? g.pausada
    : parcelada
      ? progresso.restantes === 0
        ? g.quitada
        : conta?.nome
      : rec.tipo === 'assinatura'
        ? g.porAno(formatarReais(custoAnual(rec)))
        : proxima
          ? g.proxima(rotuloDia(proxima.dia))
          : null
  return (
    <button type="button" className="gf-gasto" onClick={onAbrir} data-pausada={!rec.ativa || (parcelada && progresso.restantes === 0)}>
      <span className="gf-gasto__texto">
        <span className="gf-gasto__nome">{rec.nome}</span>
        <span className="gf-gasto__detalhe">{detalhe}</span>
      </span>
      <span className="gf-gasto__lado">
        <span className="gf-gasto__valor">
          {formatarReais(rec.valor_centavos)}
        </span>
        {lateral && <span className="gf-gasto__extra">{lateral}</span>}
      </span>
    </button>
  )
}
