import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useFinanceiro } from '../lib/useFinanceiro'
import { useAcoesFinanceiro } from '../lib/useAcoesFinanceiro'
import { mesAtual, mesValido, nomeDoMes } from '../lib/dinheiro'
import { ehAdmin, useConta } from '../lib/conta'
import { detectarRecorrencias } from '../lib/recorrencias'
import { mensagemErroDados } from '../lib/dadosErros'
import { ContasCartoes, ListaPorDia, MesSeletor } from '../components/FinanceiroLista'
import { FinanceiroDialogos } from '../components/FinanceiroDialogos'
import { BancosConectados } from '../components/FinanceiroBancos'
import { Segmentos } from '../components/FinanceiroParts'
import { Aviso } from '../components/AuthParts'
import { IconeMais } from '../components/icones'
import { t } from '../i18n/pt-BR'
import './financeiro.css'

const fin = t.financeiro
const l = fin.lancamentos

// Lançamentos (pedido do usuário, 2026-09-14): só lançar entradas e saídas e categorizá-las.
// Placar, gráficos, DRE e filtros ficam na página Controle, logo abaixo no menu.
export default function Financeiro() {
  const [params, setParams] = useSearchParams()
  const mes = mesValido(params.get('mes')) ?? mesAtual()
  const setMes = (novo) => setParams({ mes: novo }, { replace: true })
  const d = useFinanceiro(mes)
  const acoes = useAcoesFinanceiro(d)
  const { setDlg, setAviso, sugerirRegra } = acoes
  const conta = useConta()
  const [visao, setVisao] = useState('todos') // 'todos' | 'revisar'

  const contaPorId = useMemo(() => Object.fromEntries(d.contas.map((c) => [c.id, c])), [d.contas])
  const categoriaPorId = useMemo(() => Object.fromEntries(d.categorias.map((c) => [c.id, c])), [d.categorias])

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

  const semContas = d.contas.length === 0
  const aRevisar = d.transacoes.filter((x) => x.tipo !== 'transferencia' && !x.categoria_id)
  const revisando = visao === 'revisar'
  const lista = revisando ? aRevisar : d.transacoes
  const novoLancamento = () => setDlg({ tipo: 'lancamento' })
  const sugestoes = detectarRecorrencias(d.historico, d.recorrencias, d.ignoradas)

  async function categorizar(x, categoriaId) {
    try {
      await d.categorizar(x.id, categoriaId)
      if (x.origem === 'banco') sugerirRegra(x, categoriaId)
    } catch (erro) {
      setAviso({ tipo: 'erro', texto: mensagemErroDados(erro) })
    }
  }

  return (
    <>
      <main className="fin">
        <header className="fin__cabeca">
          <h1 className="main__titulo">{fin.titulo}</h1>
          <MesSeletor mes={mes} onMudar={setMes} />
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
          <div className="fin__grade">
            <section className="fin-lanc" aria-labelledby="fin-lanc">
              <h2 id="fin-lanc" className="visually-hidden">
                {l.titulo}
              </h2>
              <div className="fin-lanc__barra">
                <Segmentos
                  rotulo={fin.revisar.visao}
                  valor={visao}
                  onMudar={setVisao}
                  opcoes={[
                    { valor: 'todos', rotulo: fin.revisar.todos(d.transacoes.length) },
                    { valor: 'revisar', rotulo: fin.revisar.aRevisar(aRevisar.length) },
                  ]}
                />
                <Link to={`/financeiro/controle?mes=${mes}`} className="link-btn">
                  {fin.verControle}
                </Link>
              </div>

              {sugestoes.length > 0 && !revisando && (
                <p className="fin-revisar fin-revisar--sugestao">
                  <span>{t.gastosFixos.sugestoes.faixa(sugestoes.length)}</span>
                  <Link to="/financeiro/gastos-fixos" className="link-btn">
                    {t.gastosFixos.sugestoes.ver}
                  </Link>
                </p>
              )}

              {d.carregandoMes ? (
                <p className="label" aria-busy="true">
                  {t.app.carregando}
                </p>
              ) : d.erroMes ? (
                <Aviso>{fin.erroMes}</Aviso>
              ) : lista.length === 0 ? (
                <div className="fin-vazio">
                  <p>{revisando ? fin.revisar.vazio : l.vazioMes(nomeDoMes(mes))}</p>
                  {!revisando && (
                    <button type="button" className="acao-nova" onClick={novoLancamento}>
                      <IconeMais />
                      {fin.novoLancamentoRotulo}
                    </button>
                  )}
                </div>
              ) : (
                <ListaPorDia
                  transacoes={lista}
                  contaPorId={contaPorId}
                  categoriaPorId={categoriaPorId}
                  categorias={d.categorias}
                  revisando={revisando}
                  onAbrir={(x) => setDlg({ tipo: 'lancamento', item: x })}
                  onCategorizar={categorizar}
                />
              )}
            </section>

            <aside className="fin__lado">
              <ContasCartoes contas={d.contas} saldos={d.saldos} onAbrir={(c) => setDlg({ tipo: 'conta', item: c })} onNova={() => setDlg({ tipo: 'conta' })} />
              {ehAdmin(conta) && <BancosConectados conexoes={d.conexoes} onLer={d.lerBancos} onDesconectar={d.desconectarBanco} />}
            </aside>
          </div>
        )}
      </main>

      {!semContas && (
        <button type="button" className="fab fin__fab" onClick={novoLancamento} aria-label={fin.novoLancamentoRotulo}>
          <IconeMais />
        </button>
      )}

      <FinanceiroDialogos d={d} acoes={acoes} avisoNoCanto={revisando} />
    </>
  )
}
