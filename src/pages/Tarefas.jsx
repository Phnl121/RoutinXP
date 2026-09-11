import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'
import { useDadosApp } from '../lib/dadosContexto'
import { ordenarConcluidas, ordenarPendentes } from '../lib/datas'
import { useConcluirComVoo } from '../lib/useVooXp'
import { FILTRO_VAZIO, contarFiltros, filtrarTarefas } from '../lib/filtros'
import { FiltroTarefas } from '../components/FiltroTarefas'
import { Lista } from '../components/VisoesTarefas'
import { Kanban } from '../components/Kanban'
import { ColunaDialog } from '../components/ColunaDialog'
import { VisaoCalendario } from '../components/VisaoCalendario'
import { TarefaDialog } from '../components/TarefaDialog'
import { CategoriaDialog } from '../components/CategoriaDialog'
import { Toast } from '../components/Toast'
import { VoosXp } from '../components/VoosXp'
import { Aviso } from '../components/AuthParts'
import { IconeFiltro, IconeMais } from '../components/icones'
import { t } from '../i18n/pt-BR'
import './tarefas.css'

const tt = t.tarefas
const CHAVE_VISAO = 'routinxp:visao'
const CHAVE_MODO_CAL = 'routinxp:calendario:modo'
const VISOES = ['lista', 'quadro', 'calendario']
const MODOS_CAL = ['mes', 'semana', 'dia', 'linha']

// A visão vem de ?visao=lista|quadro|calendario (link direto) ou da última escolha salva.
function lerVisao() {
  const daUrl = new URLSearchParams(window.location.search).get('visao')
  if (VISOES.includes(daUrl)) return daUrl
  try {
    const salva = localStorage.getItem(CHAVE_VISAO)
    return VISOES.includes(salva) ? salva : 'lista'
  } catch {
    return 'lista'
  }
}

function lerModoCal() {
  const daUrl = new URLSearchParams(window.location.search).get('modo')
  if (MODOS_CAL.includes(daUrl)) return daUrl
  try {
    const salvo = localStorage.getItem(CHAVE_MODO_CAL)
    return MODOS_CAL.includes(salvo) ? salvo : 'mes'
  } catch {
    return 'mes'
  }
}

function salvar(chave, valor) {
  try {
    localStorage.setItem(chave, valor)
  } catch {
    /* armazenamento indisponível: a escolha vale só nesta sessão */
  }
}

export default function Tarefas() {
  const d = useDadosApp()
  const location = useLocation()
  const [filtro, setFiltroTarefas] = useState(FILTRO_VAZIO)
  const [filtroAberto, setFiltroAberto] = useState(false)
  const [visao, setVisao] = useState(lerVisao)
  const [modoCal, setModoCal] = useState(lerModoCal)
  const [situacao, setSituacao] = useState('pendente')

  // O link direto (?visao=…&modo=…) vale só na abertura; depois manda a escolha salva.
  useEffect(() => {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('visao') && !url.searchParams.has('modo')) return
    url.searchParams.delete('visao')
    url.searchParams.delete('modo')
    window.history.replaceState(window.history.state, '', url)
  }, [])
  const [dlgTarefa, setDlgTarefa] = useState(null) // { tarefa: objeto | null }
  const [dlgCategoria, setDlgCategoria] = useState(null) // { categoria: objeto | null }
  const [dlgColuna, setDlgColuna] = useState(null) // { coluna: objeto | null }
  const { concluirComVoo, voos } = useConcluirComVoo(d)

  // "Nova tarefa" da barra superior (de qualquer página) chega aqui como estado da navegação.
  const pedidoNovaTarefa = location.state?.novaTarefa ?? null
  const [pedidoAtendido, setPedidoAtendido] = useState(null)
  if (pedidoNovaTarefa && pedidoNovaTarefa !== pedidoAtendido) {
    setPedidoAtendido(pedidoNovaTarefa)
    setDlgTarefa({ tarefa: null })
  }

  const categoriasPorId = Object.fromEntries(d.categorias.map((c) => [c.id, c]))
  const tagsPorId = Object.fromEntries(d.tags.map((g) => [g.id, g]))
  const filtrosAtivos = contarFiltros(filtro)
  const visiveis = filtrosAtivos ? filtrarTarefas(d.tarefas, filtro) : d.tarefas
  const pendentes = visiveis.filter((x) => x.status === 'pendente').sort(ordenarPendentes)
  const concluidas = visiveis.filter((x) => x.status === 'concluida').sort(ordenarConcluidas)
  // Uma categoria só no filtro: ela vira a sugestão de categoria da tarefa nova.
  const categoriaFiltrada = filtro.categorias.length === 1 ? filtro.categorias[0] : undefined

  function trocarVisao(nova) {
    setVisao(nova)
    salvar(CHAVE_VISAO, nova)
  }

  function trocarModoCal(novo) {
    setModoCal(novo)
    salvar(CHAVE_MODO_CAL, novo)
  }

  const abrirNovaTarefa = () => setDlgTarefa({ tarefa: null })

  // Colunas do meio do Kanban (entre Pendentes e Concluídas), na ordem.
  const colunasDoMeio = d.colunas.filter((c) => c.tipo === 'custom')
  const proximaPosicao = () => Math.max(0, ...colunasDoMeio.map((c) => c.posicao)) + 10
  function vizinhasDaColuna(coluna) {
    const i = coluna ? colunasDoMeio.findIndex((c) => c.id === coluna.id) : -1
    return { anterior: i > 0 ? colunasDoMeio[i - 1] : null, proxima: i >= 0 && i < colunasDoMeio.length - 1 ? colunasDoMeio[i + 1] : null }
  }

  const acoes = {
    onConcluir: concluirComVoo,
    onEditar: (tarefa) => setDlgTarefa({ tarefa }),
    onExcluir: d.excluir,
  }

  const listaFiltrada = situacao === 'pendente' ? pendentes : concluidas
  const grupos = d.categorias
    .map((c) => ({ categoria: c, tarefas: listaFiltrada.filter((x) => x.category_id === c.id) }))
    .filter((g) => g.tarefas.length)

  let conteudo
  if (d.estado === 'carregando') {
    conteudo = <p className="label estado">{tt.carregando}</p>
  } else if (d.estado === 'erro') {
    conteudo = (
      <div className="panel vazio">
        <Aviso>{tt.erroCarregar}</Aviso>
        <button type="button" className="btn" onClick={d.carregar}>
          {tt.tentarDeNovo}
        </button>
      </div>
    )
  } else if (d.categorias.length === 0) {
    conteudo = (
      <div className="panel vazio">
        <h2 className="vazio__titulo">{tt.vazio.semCategoriaTitulo}</h2>
        <p className="vazio__texto">{tt.vazio.semCategoriaTexto}</p>
        <button type="button" className="btn" onClick={() => setDlgCategoria({ categoria: null })}>
          <IconeMais />
          {tt.vazio.semCategoriaAcao}
        </button>
      </div>
    )
  } else if (d.tarefas.length === 0) {
    conteudo = (
      <div className="panel vazio">
        <h2 className="vazio__titulo">{tt.vazio.semTarefaTitulo}</h2>
        <p className="vazio__texto">{tt.vazio.semTarefaTexto}</p>
        <button type="button" className="btn" onClick={abrirNovaTarefa}>
          <IconeMais />
          {t.topo.novaTarefa}
        </button>
      </div>
    )
  } else if (visao === 'calendario') {
    conteudo = (
      <VisaoCalendario
        modo={modoCal}
        onModo={trocarModoCal}
        tarefas={visiveis}
        categoriasPorId={categoriasPorId}
        tagsPorId={tagsPorId}
        recem={d.recem}
        acoes={acoes}
      />
    )
  } else if (visao === 'quadro') {
    conteudo = (
      <Kanban
        tarefas={visiveis}
        colunas={d.colunas}
        categoriasPorId={categoriasPorId}
        tagsPorId={tagsPorId}
        recem={d.recem}
        acoes={acoes}
        onMover={d.moverParaColuna}
        onEditarColuna={(coluna) => setDlgColuna({ coluna })}
        onNovaColuna={() => setDlgColuna({ coluna: null })}
      />
    )
  } else {
    conteudo = (
      <Lista
        grupos={grupos}
        mostrarTitulos
        vazio={filtrosAtivos ? tt.filtros.nenhuma : situacao === 'pendente' ? tt.vazio.pendentes : tt.vazio.concluidas}
        categoriasPorId={categoriasPorId}
        tagsPorId={tagsPorId}
        recem={d.recem}
        acoes={acoes}
      />
    )
  }

  const temConteudo = d.estado === 'pronto' && d.categorias.length > 0 && d.tarefas.length > 0

  return (
    <>
      <div className="app__corpo">
        <main className="app__main">
          <header className="main__cabeca">
            <div className="main__titulo-linha">
              <h1 className="main__titulo">{filtrosAtivos ? tt.filtros.tituloFiltrado : tt.tituloTodas}</h1>
              <div className="titulo-acoes">
                {temConteudo && (
                  <button
                    type="button"
                    className="botao-filtro"
                    aria-expanded={filtroAberto}
                    aria-controls="filtro-tarefas"
                    aria-label={tt.filtros.rotulo(filtrosAtivos)}
                    onClick={() => setFiltroAberto((aberto) => !aberto)}
                  >
                    <IconeFiltro />
                    {tt.filtros.botao}
                    {filtrosAtivos > 0 && (
                      <span className="botao-filtro__n" aria-hidden="true">
                        {filtrosAtivos}
                      </span>
                    )}
                  </button>
                )}
                <button type="button" className="btn btn--compacto main__nova" onClick={abrirNovaTarefa}>
                  <IconeMais />
                  {t.topo.novaTarefa}
                </button>
              </div>
            </div>
            {temConteudo && (
              <div className="main__controles">
                <div className="tabs" role="group" aria-label={tt.visoes.rotulo}>
                  <button type="button" aria-pressed={visao === 'lista'} onClick={() => trocarVisao('lista')}>
                    {tt.visoes.lista}
                  </button>
                  <button type="button" aria-pressed={visao === 'quadro'} onClick={() => trocarVisao('quadro')}>
                    {tt.visoes.quadro}
                  </button>
                  <button type="button" aria-pressed={visao === 'calendario'} onClick={() => trocarVisao('calendario')}>
                    {tt.visoes.calendario}
                  </button>
                </div>
                {visao === 'calendario' && (
                  <div className="segmentos cal-modos" role="group" aria-label={tt.calendario.modos.rotulo}>
                    {MODOS_CAL.map((m) => (
                      <button key={m} type="button" aria-pressed={modoCal === m} onClick={() => trocarModoCal(m)}>
                        {tt.calendario.modos[m]}
                      </button>
                    ))}
                  </div>
                )}
                {visao === 'lista' && (
                  <div className="segmentos" role="group" aria-label={tt.filtro.rotulo}>
                    <button type="button" aria-pressed={situacao === 'pendente'} onClick={() => setSituacao('pendente')}>
                      {tt.filtro.pendentes} · {pendentes.length}
                    </button>
                    <button type="button" aria-pressed={situacao === 'concluida'} onClick={() => setSituacao('concluida')}>
                      {tt.filtro.concluidas} · {concluidas.length}
                    </button>
                  </div>
                )}
              </div>
            )}
          </header>
          {temConteudo && filtroAberto && (
            <FiltroTarefas
              id="filtro-tarefas"
              filtro={filtro}
              onMudar={setFiltroTarefas}
              onLimpar={() => setFiltroTarefas(FILTRO_VAZIO)}
              categorias={d.categorias}
              tags={d.tags}
              resumo={
                visao === 'lista'
                  ? tt.filtros.resultadoLista(listaFiltrada.length, situacao === 'pendente')
                  : tt.filtros.resultado(visiveis.length)
              }
              ativos={filtrosAtivos}
            />
          )}
          {conteudo}
        </main>
      </div>

      {d.estado === 'pronto' && (
        <button type="button" className="fab" onClick={abrirNovaTarefa} aria-label={t.topo.novaTarefa}>
          <IconeMais />
        </button>
      )}

      {dlgTarefa && (
        <TarefaDialog
          tarefa={dlgTarefa.tarefa}
          categorias={d.categorias}
          tags={d.tags}
          colunas={colunasDoMeio}
          onCriarTag={d.salvarTag}
          categoriaPadrao={categoriaFiltrada}
          onFechar={() => setDlgTarefa(null)}
          onSalvar={d.salvarTarefa}
          onExcluir={d.excluir}
          onCriarCategoria={() => {
            setDlgTarefa(null)
            setDlgCategoria({ categoria: null })
          }}
        />
      )}

      {dlgColuna && (
        <ColunaDialog
          coluna={dlgColuna.coluna}
          vizinhas={vizinhasDaColuna(dlgColuna.coluna)}
          totalTarefas={
            dlgColuna.coluna ? d.tarefas.filter((x) => x.status === 'pendente' && x.column_id === dlgColuna.coluna.id).length : 0
          }
          onFechar={() => setDlgColuna(null)}
          onSalvar={({ id, ...campos }) =>
            d.salvarColuna(id ? { id, ...campos } : { ...campos, posicao: proximaPosicao() })
          }
          onMover={d.trocarColunas}
          onExcluir={d.excluirColuna}
        />
      )}

      {dlgCategoria && (
        <CategoriaDialog
          categoria={dlgCategoria.categoria}
          totalTarefas={dlgCategoria.categoria ? d.tarefas.filter((x) => x.category_id === dlgCategoria.categoria.id).length : 0}
          onFechar={() => setDlgCategoria(null)}
          onSalvar={d.salvarCategoria}
          onExcluir={d.excluirCategoria}
        />
      )}

      <VoosXp voos={voos} />

      <Toast aviso={d.aviso} onDesfazer={d.desfazerExclusao} onFechar={d.fecharAviso} />
    </>
  )
}
