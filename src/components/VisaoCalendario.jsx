import { useState } from 'react'
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
  return (
    <button
      type="button"
      className="cal-pilula"
      data-feita={tarefa.status === 'concluida'}
      title={tarefa.titulo}
      onClick={() => onEditar(tarefa)}
      aria-label={t.tarefas.editar(tarefa.titulo)}
    >
      {categoria && <span className="dot" style={{ background: categoria.cor }} />}
      <span className="cal-pilula__titulo">{tarefa.titulo}</span>
    </button>
  )
}

// Linhas completas (Dia e Linha do tempo): as mesmas da Lista, com concluir e voo do XP.
function Grupo({ titulo, tarefas, categoriasPorId, tagsPorId, recem, acoes }) {
  return (
    <section className="grupo" aria-label={titulo}>
      <h2 className="label grupo__titulo">
        {titulo} · {tarefas.length}
      </h2>
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

  const porDia = new Map()
  for (const tarefa of tarefas) {
    if (!tarefa.data_prevista) continue
    if (!porDia.has(tarefa.data_prevista)) porDia.set(tarefa.data_prevista, [])
    porDia.get(tarefa.data_prevista).push(tarefa)
  }
  for (const lista of porDia.values()) lista.sort(ordemNoDia)
  const doDia = (dia) => porDia.get(dia) ?? []
  const semData = tarefas.filter((x) => !x.data_prevista && x.status === 'pendente')

  function andar(passo) {
    if (modo === 'mes') setCursor(somarMeses(cursor, passo))
    else if (modo === 'semana') setCursor(somarDias(cursor, 7 * passo))
    else setCursor(somarDias(cursor, passo))
  }

  function abrirDia(dia) {
    setCursor(dia)
    onModo('dia')
  }

  const rotulo = modo === 'mes' ? rotuloMes(cursor) : modo === 'semana' ? rotuloSemana(cursor) : rotuloDiaLongo(cursor)

  const numero = (dia, fora = false) => (
    <button
      type="button"
      className="cal-num"
      data-hoje={dia === hoje}
      data-fora={fora}
      onClick={() => abrirDia(dia)}
      aria-label={c.abrirDia(rotuloDiaLongo(dia))}
      aria-current={dia === hoje ? 'date' : undefined}
    >
      {numeroDia(dia)}
    </button>
  )

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
                  <button type="button" className="cal-mais" onClick={() => abrirDia(dia)} aria-label={c.maisRotulo(sobra, rotuloDiaLongo(dia))}>
                    {c.mais(sobra)}
                  </button>
                )}
                {/* Celular: só os pontos das categorias; tocar no número abre o dia. */}
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
        {diasDaSemana(cursor).map((dia, i) => {
          const lista = doDia(dia)
          return (
            <section key={dia} className="cal-semana__dia" aria-label={rotuloDiaLongo(dia)}>
              <div className="cal-semana__cabeca">
                <span className="label">{NOMES_SEMANA[i]}</span>
                {numero(dia)}
              </div>
              {lista.map((tarefa) => (
                <Pilula key={tarefa.id} tarefa={tarefa} categoria={categoriasPorId[tarefa.category_id]} onEditar={acoes.onEditar} />
              ))}
            </section>
          )
        })}
      </div>
    )
  } else if (modo === 'dia') {
    const lista = doDia(cursor)
    corpo = (
      <div className="panel lista">
        {lista.length ? (
          <Grupo
            titulo={cursor === hoje ? c.hoje : rotuloDiaCurto(cursor)}
            tarefas={lista}
            categoriasPorId={categoriasPorId}
            tagsPorId={tagsPorId}
            recem={recem}
            acoes={acoes}
          />
        ) : (
          <p className="lista__vazio">{c.diaVazio}</p>
        )}
      </div>
    )
  } else {
    // Linha do tempo: atrasadas, depois cada dia de hoje em diante, e as sem data no fim.
    const grupos = []
    const atrasadas = tarefas
      .filter((x) => x.status === 'pendente' && x.data_prevista && x.data_prevista < hoje)
      .sort((a, b) => a.data_prevista.localeCompare(b.data_prevista) || ordemNoDia(a, b))
    if (atrasadas.length) grupos.push({ chave: 'atrasadas', titulo: c.atrasadas, tarefas: atrasadas })
    const amanha = somarDias(hoje, 1)
    for (const dia of [...porDia.keys()].filter((x) => x >= hoje).sort()) {
      const titulo = dia === hoje ? c.hoje : dia === amanha ? c.amanha : rotuloDiaCurto(dia)
      grupos.push({ chave: dia, titulo, tarefas: doDia(dia) })
    }
    if (semData.length) grupos.push({ chave: 'sem-data', titulo: c.semDataTitulo, tarefas: semData })

    corpo = (
      <div className="panel lista">
        {grupos.length ? (
          grupos.map((g) => (
            <Grupo
              key={g.chave}
              titulo={g.titulo}
              tarefas={g.tarefas}
              categoriasPorId={categoriasPorId}
              tagsPorId={tagsPorId}
              recem={recem}
              acoes={acoes}
            />
          ))
        ) : (
          <p className="lista__vazio">{c.linhaVazia}</p>
        )}
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
          <h2 className="cal__titulo" aria-live="polite">
            {rotulo}
          </h2>
        </div>
      )}
      {corpo}
      {modo !== 'linha' && semData.length > 0 && (
        <p className="hint cal__nota">
          {c.semData(semData.length)}{' '}
          <button type="button" className="link-btn" onClick={() => onModo('linha')}>
            {c.verLinha}
          </button>
        </p>
      )}
    </div>
  )
}
