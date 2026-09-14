import { useMemo, useState } from 'react'
import { MESES_DO_RESUMO, useFinanceiro } from '../lib/useFinanceiro'
import { useAcoesFinanceiro } from '../lib/useAcoesFinanceiro'
import { andarMes, formatarReais, gastosPorCategoria, mesAtual, mesesAte, montarDre, somarFiltro, somarPorMes } from '../lib/dinheiro'
import { hojeBrasilia } from '../lib/datas'
import { ContasCartoes, ListaPorDia, MesSeletor } from '../components/FinanceiroLista'
import { FinanceiroDialogos } from '../components/FinanceiroDialogos'
import { PlacarMes } from '../components/FinanceiroPlacar'
import { CartaoGastosFixos, DrePessoal, EvolucaoMeses, GastosPorCategoria } from '../components/FinanceiroResumo'
import { Segmentos } from '../components/FinanceiroParts'
import { Aviso } from '../components/AuthParts'
import { IconeLupa } from '../components/icones'
import { t } from '../i18n/pt-BR'
import './financeiro.css'

const fin = t.financeiro
const l = fin.lancamentos
const c = t.controle

// Controle (pedido do usuário, 2026-09-14): o detalhamento do mês numa aba própria, abaixo de
// Lançamentos. Placar com comparação, filtros que valem para todos os números, para onde foi o
// dinheiro, resultado do mês (DRE), evolução, saldos e gastos fixos.
export default function Controle() {
  const [mes, setMes] = useState(mesAtual)
  const d = useFinanceiro(mes)
  const acoes = useAcoesFinanceiro(d)
  const [busca, setBusca] = useState('')
  const [tipo, setTipo] = useState('todos')
  const [categoriaId, setCategoriaId] = useState('')
  const [contaId, setContaId] = useState('')

  const contaPorId = useMemo(() => Object.fromEntries(d.contas.map((x) => [x.id, x])), [d.contas])
  const categoriaPorId = useMemo(() => Object.fromEntries(d.categorias.map((x) => [x.id, x])), [d.categorias])

  if (d.estado !== 'pronto') {
    return (
      <main className="fin">
        <h1 className="main__titulo">{c.titulo}</h1>
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

  // Um filtro só para tudo: placar, gráficos, DRE e a lista.
  const termo = busca.trim().toLocaleLowerCase('pt-BR')
  const filtrando = Boolean(termo || tipo !== 'todos' || categoriaId || contaId)
  const passa = (x) =>
    (tipo === 'todos' || x.tipo === tipo) &&
    (!categoriaId || (categoriaId === 'revisar' ? x.tipo !== 'transferencia' && !x.categoria_id : x.categoria_id === categoriaId)) &&
    (!contaId || x.conta_id === contaId || x.conta_destino_id === contaId) &&
    (!termo || x.descricao.toLocaleLowerCase('pt-BR').includes(termo))

  const hojeDia = hojeBrasilia()
  const doMes = d.transacoes.filter(passa)
  const efetivas = doMes.filter((x) => x.data <= hojeDia)
  const mesAnterior = andarMes(mes, -1)
  const doMesAnterior = d.historico.filter((x) => x.data.startsWith(mesAnterior) && passa(x))
  const evolucao = somarPorMes(
    d.historico.filter((x) => x.data <= hojeDia && passa(x)),
    mesesAte(mes, MESES_DO_RESUMO),
  )
  const soma = somarFiltro(doMes, contaId)

  const limpar = () => {
    setBusca('')
    setTipo('todos')
    setCategoriaId('')
    setContaId('')
  }
  const verCategoria = (id) => {
    setCategoriaId(id)
    setTipo('todos')
    document.getElementById('ctl-lista')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <main className="fin">
        <header className="fin__cabeca">
          <h1 className="main__titulo">{c.titulo}</h1>
          <MesSeletor mes={mes} onMudar={setMes} />
          <div className="fin__acoes" />
        </header>

        <PlacarMes mes={mes} doMes={doMes} doMesAnterior={doMesAnterior} mesAnterior={mesAnterior} contaId={contaId} />

        <section className="panel ctl-filtros" aria-labelledby="ctl-filtros">
          <h2 id="ctl-filtros" className="label">
            {c.filtros}
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
                {d.categorias.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.nome} · {x.tipo === 'despesa' ? fin.formLancamento.tipos.saida : fin.formLancamento.tipos.entrada}
                  </option>
                ))}
              </select>
            </span>
            <span className="select fin-filtros__select">
              <select className="input" aria-label={fin.contas.titulo} value={contaId} onChange={(e) => setContaId(e.target.value)}>
                <option value="">{l.todasContas}</option>
                {d.contas.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.nome}
                  </option>
                ))}
              </select>
            </span>
          </div>
          {filtrando && (
            <p className="fin-filtros__resumo" role="status">
              <span>{l.filtrados(doMes.length, formatarReais(soma.entradas), formatarReais(soma.saidas))}</span>
              <button type="button" className="link-btn" onClick={limpar}>
                {l.limpar}
              </button>
            </p>
          )}
        </section>

        <div className="ctl__grade">
          <div className="ctl__coluna">
            <GastosPorCategoria linhas={gastosPorCategoria(efetivas, categoriaPorId)} onEscolher={verCategoria} />
            <DrePessoal dre={montarDre(efetivas, categoriaPorId)} />
          </div>
          <div className="ctl__coluna">
            <EvolucaoMeses meses={evolucao} mesAtual={mes} />
            <ContasCartoes contas={d.contas} saldos={d.saldos} />
            <CartaoGastosFixos recorrencias={d.recorrencias} />
          </div>
        </div>

        {/* A lista só aparece com filtro: é o detalhe do que os números mostram. */}
        <section className="ctl-lista" id="ctl-lista" aria-labelledby="ctl-lista-titulo">
          <h2 id="ctl-lista-titulo" className="label">
            {filtrando ? c.listaFiltro : c.lista}
          </h2>
          {!filtrando ? (
            <p className="hint">{c.listaDica}</p>
          ) : doMes.length === 0 ? (
            <div className="fin-vazio">
              <p>{l.vazioFiltro}</p>
            </div>
          ) : (
            <ListaPorDia
              transacoes={doMes}
              contaPorId={contaPorId}
              categoriaPorId={categoriaPorId}
              categorias={d.categorias}
              revisando={false}
              onAbrir={(x) => acoes.setDlg({ tipo: 'lancamento', item: x })}
              onCategorizar={() => {}}
            />
          )}
        </section>
      </main>

      <FinanceiroDialogos d={d} acoes={acoes} />
    </>
  )
}
