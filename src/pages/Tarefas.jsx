import { useState } from 'react'
import { useLocation } from 'react-router'
import { useDadosApp } from '../lib/dadosContexto'
import { ordenarConcluidas, ordenarPendentes } from '../lib/datas'
import { calcularNivel } from '../lib/nivel'
import { Trilho } from '../components/Trilho'
import { Lista, Quadro } from '../components/VisoesTarefas'
import { TarefaDialog } from '../components/TarefaDialog'
import { CategoriaDialog } from '../components/CategoriaDialog'
import { Toast } from '../components/Toast'
import { Aviso } from '../components/AuthParts'
import { IconeMais } from '../components/icones'
import { t } from '../i18n/pt-BR'
import './tarefas.css'

const tt = t.tarefas
const CHAVE_VISAO = 'routinxp:visao'

// A visão vem de ?visao=lista|quadro (link direto) ou da última escolha salva.
function lerVisao() {
  const daUrl = new URLSearchParams(window.location.search).get('visao')
  if (daUrl === 'lista' || daUrl === 'quadro') return daUrl
  try {
    return localStorage.getItem(CHAVE_VISAO) === 'quadro' ? 'quadro' : 'lista'
  } catch {
    return 'lista'
  }
}

export default function Tarefas() {
  const d = useDadosApp()
  const location = useLocation()
  const [selecionada, setSelecionada] = useState(null)
  const [visao, setVisao] = useState(lerVisao)
  const [filtro, setFiltro] = useState('pendente')
  const [dlgTarefa, setDlgTarefa] = useState(null) // { tarefa: objeto | null }
  const [dlgCategoria, setDlgCategoria] = useState(null) // { categoria: objeto | null }
  const [voos, setVoos] = useState([]) // "+XP" em voo até a barra superior

  // "Nova tarefa" da barra superior (de qualquer página) chega aqui como estado da navegação.
  const pedidoNovaTarefa = location.state?.novaTarefa ?? null
  const [pedidoAtendido, setPedidoAtendido] = useState(null)
  if (pedidoNovaTarefa && pedidoNovaTarefa !== pedidoAtendido) {
    setPedidoAtendido(pedidoNovaTarefa)
    setDlgTarefa({ tarefa: null })
  }

  const categoriaSel = d.categorias.find((c) => c.id === selecionada) ?? null
  const categoriasPorId = Object.fromEntries(d.categorias.map((c) => [c.id, c]))
  const visiveis = categoriaSel ? d.tarefas.filter((x) => x.category_id === categoriaSel.id) : d.tarefas
  const pendentes = visiveis.filter((x) => x.status === 'pendente').sort(ordenarPendentes)
  const concluidas = visiveis.filter((x) => x.status === 'concluida').sort(ordenarConcluidas)

  const pendentesPorCategoria = {}
  for (const x of d.tarefas) {
    if (x.status === 'pendente') pendentesPorCategoria[x.category_id] = (pendentesPorCategoria[x.category_id] ?? 0) + 1
  }
  const totalPendentes = d.tarefas.filter((x) => x.status === 'pendente').length

  function trocarVisao(nova) {
    setVisao(nova)
    try {
      localStorage.setItem(CHAVE_VISAO, nova)
    } catch {
      /* armazenamento indisponível: a escolha vale só nesta sessão */
    }
  }

  const abrirNovaTarefa = () => setDlgTarefa({ tarefa: null })

  // Conclui e faz o "+XP" voar da tarefa até o contador da barra superior.
  // As estatísticas novas só entram quando o voo chega (o número conta e a barra enche);
  // se o nível subir, o aviso aparece depois que a barra enche e vira.
  async function concluirComVoo(id, origem) {
    const nivelAntes = calcularNivel(d.stats?.xp_total ?? 0).nivel
    const r = await d.concluir(id)
    if (!r) return
    const aplicar = () => {
      d.aplicarEstatisticas(r.estatisticas)
      const nivelDepois = calcularNivel(r.estatisticas?.xp_total ?? 0).nivel
      if (nivelDepois > nivelAntes) setTimeout(() => d.avisar({ tipo: 'nivel', nivel: nivelDepois }), 1500)
    }
    const alvo = document.querySelector('.topo .xp__valor')?.getBoundingClientRect()
    if (r.xp > 0 && origem && alvo) {
      const x = origem.left + origem.width / 2
      const y = origem.top + origem.height / 2 - 10
      let chegou = false
      const voo = { seq: `${id}-${Date.now()}`, x, y, dx: alvo.left - x, dy: alvo.top - y, xp: r.xp }
      voo.chegar = () => {
        if (chegou) return
        chegou = true
        setVoos((v) => v.filter((outro) => outro.seq !== voo.seq))
        aplicar()
      }
      setVoos((v) => [...v, voo])
      // Garantia caso a animação não termine (aba em segundo plano).
      setTimeout(voo.chegar, 850)
    } else {
      aplicar()
    }
  }

  const acoes = {
    onConcluir: concluirComVoo,
    onEditar: (tarefa) => setDlgTarefa({ tarefa }),
    onExcluir: d.excluir,
  }

  const listaFiltrada = filtro === 'pendente' ? pendentes : concluidas
  const grupos = categoriaSel
    ? [{ categoria: categoriaSel, tarefas: listaFiltrada }]
    : d.categorias.map((c) => ({ categoria: c, tarefas: listaFiltrada.filter((x) => x.category_id === c.id) })).filter((g) => g.tarefas.length)

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
  } else if (visao === 'quadro') {
    conteudo = (
      <Quadro
        pendentes={pendentes}
        concluidas={concluidas}
        categoriasPorId={categoriasPorId}
        mostrarCategoria={!categoriaSel}
        recem={d.recem}
        acoes={acoes}
      />
    )
  } else {
    conteudo = (
      <Lista
        grupos={grupos}
        mostrarTitulos={!categoriaSel}
        vazio={filtro === 'pendente' ? tt.vazio.pendentes : tt.vazio.concluidas}
        categoriasPorId={categoriasPorId}
        recem={d.recem}
        acoes={acoes}
      />
    )
  }

  const temConteudo = d.estado === 'pronto' && d.categorias.length > 0 && d.tarefas.length > 0

  return (
    <>
      <div className="app__corpo">
        <Trilho
          categorias={d.categorias}
          pendentesPorCategoria={pendentesPorCategoria}
          totalPendentes={totalPendentes}
          selecionada={categoriaSel?.id ?? null}
          onSelecionar={setSelecionada}
          onNova={() => setDlgCategoria({ categoria: null })}
          onEditar={(categoria) => setDlgCategoria({ categoria })}
        />

        <main className="app__main">
          <header className="main__cabeca">
            <div className="main__titulo-linha">
              <h1 className="main__titulo">{categoriaSel?.nome ?? tt.tituloTodas}</h1>
              <button type="button" className="btn btn--compacto main__nova" onClick={abrirNovaTarefa}>
                <IconeMais />
                {t.topo.novaTarefa}
              </button>
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
                </div>
                {visao === 'lista' && (
                  <div className="segmentos" role="group" aria-label={tt.filtro.rotulo}>
                    <button type="button" aria-pressed={filtro === 'pendente'} onClick={() => setFiltro('pendente')}>
                      {tt.filtro.pendentes} · {pendentes.length}
                    </button>
                    <button type="button" aria-pressed={filtro === 'concluida'} onClick={() => setFiltro('concluida')}>
                      {tt.filtro.concluidas} · {concluidas.length}
                    </button>
                  </div>
                )}
              </div>
            )}
          </header>
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
          categoriaPadrao={categoriaSel?.id}
          onFechar={() => setDlgTarefa(null)}
          onSalvar={d.salvarTarefa}
          onExcluir={d.excluir}
          onCriarCategoria={() => {
            setDlgTarefa(null)
            setDlgCategoria({ categoria: null })
          }}
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

      {voos.map((voo) => (
        <span
          key={voo.seq}
          className="xp-voo-app"
          aria-hidden="true"
          style={{ left: voo.x, top: voo.y, '--dx': `${voo.dx}px`, '--dy': `${voo.dy}px` }}
          onAnimationEnd={voo.chegar}
        >
          {tt.xp(voo.xp)}
        </span>
      ))}

      <Toast aviso={d.aviso} onDesfazer={d.desfazerExclusao} onFechar={d.fecharAviso} />
    </>
  )
}
