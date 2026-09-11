import { useEffect, useRef, useState } from 'react'
import { LinhaTarefa } from './LinhaTarefa'
import { IconeSetaDireita, IconeSetaEsquerda } from './icones'
import { hojeBrasilia } from '../lib/datas'
import {
  NOMES_SEMANA,
  diasDaSemana,
  gradeMes,
  mesmoMes,
  numeroDia,
  rotuloDiaCurto,
  rotuloDiaLongo,
  rotuloMes,
  rotuloSemana,
  somarDias,
  somarMeses,
} from '../lib/calendario'
import { t } from '../i18n/pt-BR'
import './calendario.css'

const c = t.tarefas.calendario
const MAX_NA_CELULA = 3

// Pendentes primeiro, depois concluídas; dentro de cada grupo, pela ordem de criação.
const ordemNoDia = (a, b) =>
  (a.status === 'concluida') - (b.status === 'concluida') || a.created_at.localeCompare(b.created_at)

// Tarefa compacta (Mês e Semana): ponto da categoria e título. Abre a tarefa.
function Pilula({ tarefa, categoria, onEditar }) {
  const feita = tarefa.status === 'concluida'
  const nome = [t.tarefas.editar(tarefa.titulo), categoria?.nome, feita ? c.concluida : null].filter(Boolean).join(', ')
  return (
    <button type="button" className="cal-pilula" data-feita={feita} title={tarefa.titulo} onClick={() => onEditar(tarefa)} aria-label={nome}>
      {categoria && <span className="dot" style={{ background: categoria.cor }} />}
      <span className="cal-pilula__titulo">{tarefa.titulo}</span>
    </button>
  )
}

// Linhas completas (Dia e Linha do tempo): as mesmas da Lista, com concluir e voo do XP.
function Grupo({ titulo, tarefas, categoriasPorId, tagsPorId, recem, acoes, Titulo = 'h2' }) {
  return (
    <section className="grupo" aria-label={titulo}>
      <Titulo className="label grupo__titulo">
        {titulo} · {tarefas.length}
      </Titulo>
      <ul className="linhas">
        {tarefas.map((tarefa) => (
          <LinhaTarefa
            key={tarefa.id}
            tarefa={tarefa}
            categoria={categoriasPorId[tarefa.category_id]}
            tags={(tarefa.tag_ids ?? []).map((id) => tagsPorId[id]).filter(Boolean)}
            recem={recem === tarefa.id}
            {...acoes}
          />
        ))}
      </ul>
    </section>
  )
}

export function VisaoCalendario({ modo, onModo, tarefas, categoriasPorId, tagsPorId, recem, acoes }) {
  const hoje = hojeBrasilia()
  const [cursor, setCursor] = useState(hoje)
  const [verAnteriores, setVerAnteriores] = useState(false)
  const tituloRef = useRef(null)
  const corpoRef = useRef(null)
  const levarFoco = useRef(false)

  // Trocar de modo por um botão que some (número do dia, "+n", "Ver na Linha do tempo"):
  // o foco vai para o título do período (ou para o começo da lista), e não se perde.
  useEffect(() => {
    if (!levarFoco.current) return
    levarFoco.current = false
    ;(tituloRef.current ?? corpoRef.current)?.focus()
  }, [modo, cursor])

  const porDia = new Map()
  for (const tarefa of tarefas) {
    if (!tarefa.data_prevista) continue
    if (!porDia.has(tarefa.data_prevista)) porDia.set(tarefa.data_prevista, [])
    porDia.get(tarefa.data_prevista).push(tarefa)
  }
  for (const lista of porDia.values()) lista.sort(ordemNoDia)
  const doDia = (dia) => porDia.get(dia) ?? []
  const semData = tarefas.filter((x) => !x.data_prevista).sort(ordemNoDia)

  function andar(passo) {
    if (modo === 'mes') setCursor(somarMeses(cursor, passo))
    else if (modo === 'semana') setCursor(somarDias(cursor, 7 * passo))
    else setCursor(somarDias(cursor, passo))
  }

  function irPara(novoModo, dia) {
    levarFoco.current = true
    if (dia) setCursor(dia)
    onModo(novoModo)
  }

  const rotulo = modo === 'mes' ? rotuloMes(cursor) : modo === 'semana' ? rotuloSemana(cursor) : rotuloDiaLongo(cursor)

  const numero = (dia, fora = false) => {
    const lista = doDia(dia)
    const feitas = lista.filter((x) => x.status === 'concluida').length
    return (
      <button
        type="button"
        className="cal-num"
        data-hoje={dia === hoje}
        data-fora={fora}
        onClick={() => irPara('dia', dia)}
        aria-label={c.abrirDia(rotuloDiaLongo(dia), lista.length, feitas)}
        aria-current={dia === hoje ? 'date' : undefined}
      >
        {numeroDia(dia)}
      </button>
    )
  }

  const props = { categoriasPorId, tagsPorId, recem, acoes }
  let corpo
  if (modo === 'mes') {
    corpo = (
      <div className="panel cal-mes">
        <div className="cal-mes__cabeca" aria-hidden="true">
          {NOMES_SEMANA.map((nome) => (
            <span key={nome}>{nome}</span>
          ))}
        </div>
        <div className="cal-mes__grade">
          {gradeMes(cursor).map((dia) => {
            const lista = doDia(dia)
            const sobra = lista.length - MAX_NA_CELULA
            const fora = !mesmoMes(dia, cursor)
            return (
              <div key={dia} className="cal-celula" data-fora={fora}>
                {numero(dia, fora)}
                {lista.slice(0, MAX_NA_CELULA).map((tarefa) => (
                  <Pilula key={tarefa.id} tarefa={tarefa} categoria={categoriasPorId[tarefa.category_id]} onEditar={acoes.onEditar} />
                ))}
                {sobra > 0 && (
                  <button type="button" className="cal-mais" onClick={() => irPara('dia', dia)} aria-label={c.maisRotulo(sobra, rotuloDiaLongo(dia))}>
                    {c.mais(sobra)}
                  </button>
                )}
                {/* Espaço estreito: só os pontos das categorias; o dia inteiro abre o modo Dia. */}
                {lista.length > 0 && (
                  <span className="cal-pontos" aria-hidden="true">
                    {lista.slice(0, 4).map((tarefa) => (
                      <span
                        key={tarefa.id}
                        className="dot"
                        data-feita={tarefa.status === 'concluida'}
                        style={{ background: categoriasPorId[tarefa.category_id]?.cor }}
                      />
                    ))}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  } else if (modo === 'semana') {
    corpo = (
      <div className="panel cal-semana">
        {diasDaSemana(cursor).map((dia, i) => (
          <section key={dia} className="cal-semana__dia" aria-label={rotuloDiaLongo(dia)}>
            <div className="cal-semana__cabeca">
              <span className="label">{NOMES_SEMANA[i]}</span>
              {numero(dia)}
            </div>
            {doDia(dia).map((tarefa) => (
              <Pilula key={tarefa.id} tarefa={tarefa} categoria={categoriasPorId[tarefa.category_id]} onEditar={acoes.onEditar} />
            ))}
          </section>
        ))}
      </div>
    )
  } else if (modo === 'dia') {
    const lista = doDia(cursor)
    corpo = (
      <div className="panel lista" ref={corpoRef} tabIndex={-1}>
        {lista.length ? (
          <Grupo titulo={cursor === hoje ? c.hoje : rotuloDiaCurto(cursor)} tarefas={lista} Titulo="h3" {...props} />
        ) : (
          <p className="lista__vazio">{c.diaVazio}</p>
        )}
      </div>
    )
  } else {
    // Linha do tempo, em ordem: dias anteriores (recolhidos), atrasadas, hoje, amanhã,
    // cada data seguinte e, no fim, as sem data.
    const amanha = somarDias(hoje, 1)
    const datas = [...porDia.keys()].sort()
    const atrasadas = tarefas
      .filter((x) => x.status === 'pendente' && x.data_prevista && x.data_prevista < hoje)
      .sort((a, b) => a.data_prevista.localeCompare(b.data_prevista) || ordemNoDia(a, b))
    // As pendentes vencidas já estão em Atrasadas; nos dias anteriores ficam as concluídas.
    const anteriores = datas
      .filter((dia) => dia < hoje)
      .map((dia) => ({ chave: dia, titulo: rotuloDiaCurto(dia), tarefas: doDia(dia).filter((x) => x.status === 'concluida') }))
      .filter((g) => g.tarefas.length)
    const grupos = []
    if (verAnteriores) grupos.push(...anteriores)
    if (atrasadas.length) grupos.push({ chave: 'atrasadas', titulo: c.atrasadas, tarefas: atrasadas })
    for (const dia of datas.filter((x) => x >= hoje)) {
      grupos.push({ chave: dia, titulo: dia === hoje ? c.hoje : dia === amanha ? c.amanha : rotuloDiaCurto(dia), tarefas: doDia(dia) })
    }
    if (semData.length) grupos.push({ chave: 'sem-data', titulo: c.semDataTitulo, tarefas: semData })
    const totalAnteriores = anteriores.reduce((n, g) => n + g.tarefas.length, 0)

    corpo = (
      <div className="panel lista" ref={corpoRef} tabIndex={-1}>
        {totalAnteriores > 0 && (
          <button type="button" className="cal-anteriores" aria-expanded={verAnteriores} onClick={() => setVerAnteriores((v) => !v)}>
            {verAnteriores ? c.esconderAnteriores : c.verAnteriores(totalAnteriores)}
          </button>
        )}
        {grupos.length ? grupos.map((g) => <Grupo key={g.chave} titulo={g.titulo} tarefas={g.tarefas} {...props} />) : <p className="lista__vazio">{c.linhaVazia}</p>}
      </div>
    )
  }

  return (
    <div className="cal">
      {modo !== 'linha' && (
        <div className="cal__barra">
          <div className="cal__nav">
            <button type="button" className="cal__seta" onClick={() => andar(-1)} aria-label={c.anterior[modo]}>
              <IconeSetaEsquerda />
            </button>
            <button type="button" className="cal__hoje" onClick={() => setCursor(hoje)}>
              {c.hojeBotao}
            </button>
            <button type="button" className="cal__seta" onClick={() => andar(1)} aria-label={c.proximo[modo]}>
              <IconeSetaDireita />
            </button>
          </div>
          <h2 className="cal__titulo" ref={tituloRef} tabIndex={-1} aria-live="polite">
            {rotulo}
          </h2>
        </div>
      )}
      {corpo}
      {modo !== 'linha' && semData.length > 0 && (
        <p className="hint cal__nota">
          {c.semData(semData.length)}{' '}
          <button type="button" className="link-btn" onClick={() => irPara('linha')}>
            {c.verLinha}
          </button>
        </p>
      )}
    </div>
  )
}
