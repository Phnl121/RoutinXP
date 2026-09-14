import { useEffect, useRef } from 'react'
import { IconeBandeira, IconeCheck, IconeLocal } from './icones'
import { agoraBrasilia, horaDe, itensDoDia, paraMinutos, rotuloHorario } from '../lib/agenda'
import { NOMES_SEMANA, gradeMes, mesmoMes, numeroDia, rotuloDiaCurto, rotuloDiaLongo } from '../lib/calendario'
import { t } from '../i18n/pt-BR'

const a = t.agenda
const ALTURA_HORA = 52 // px por hora na grade
const HORAS = Array.from({ length: 24 }, (_, i) => i)
const MAX_NO_MES = 3

const corDoItem = (item, categoriasPorId) => {
  const id = item.tipo === 'evento' ? item.evento.categoria_id : item.tarefa.category_id
  return categoriasPorId[id]?.cor ?? null
}
const tituloDoItem = (item) => (item.tipo === 'evento' ? item.evento.titulo : item.tarefa.titulo)
const rotuloDoItem = (item) => {
  const horario = rotuloHorario(item, rotuloDiaCurto)
  if (item.tipo === 'prazo') return a.prazoRotulo(item.tarefa.titulo)
  if (item.tipo === 'tarefa') return a.tarefaRotulo(item.tarefa.titulo, horario)
  return a.eventoRotulo(item.evento.titulo, horario)
}

// Círculo de concluir das tarefas (o mesmo gesto da lista, com o voo do XP).
function Concluir({ tarefa, onConcluir }) {
  const feita = tarefa.status === 'concluida'
  return (
    <button
      type="button"
      className="ag-check"
      data-feita={feita}
      disabled={feita}
      aria-label={a.concluir(tarefa.titulo)}
      onClick={(evento) => {
        evento.stopPropagation()
        onConcluir(tarefa.id, evento.currentTarget.getBoundingClientRect())
      }}
    >
      <IconeCheck />
    </button>
  )
}

// Um item fora da grade de horas: no topo do dia, no mês e na lista do celular.
// Evento: bloco cheio na cor. Tarefa: contorno tracejado com o círculo de concluir. Prazo: bandeira.
export function ItemCompacto({ item, categoriasPorId, onAbrir, onConcluir, mostrarHora = false }) {
  const cor = corDoItem(item, categoriasPorId)
  const horario = mostrarHora && !item.diaTodo ? horaDe(item.inicio) : null
  const estilo = cor ? { '--c': cor } : undefined
  if (item.tipo === 'prazo') {
    return (
      <button
        type="button"
        className="ag-item"
        data-tipo="prazo"
        style={estilo}
        onClick={() => onAbrir(item)}
        aria-label={rotuloDoItem(item)}
        title={tituloDoItem(item)}
      >
        <IconeBandeira />
        <span className="ag-item__titulo">{tituloDoItem(item)}</span>
      </button>
    )
  }
  if (item.tipo === 'tarefa') {
    return (
      <div className="ag-item" data-tipo="tarefa" data-feita={item.tarefa.status === 'concluida'} style={estilo}>
        <Concluir tarefa={item.tarefa} onConcluir={onConcluir} />
        <button
          type="button"
          className="ag-item__abrir"
          onClick={() => onAbrir(item)}
          aria-label={rotuloDoItem(item)}
          title={tituloDoItem(item)}
        >
          {horario && <span className="ag-item__hora">{horario}</span>}
          <span className="ag-item__titulo">{tituloDoItem(item)}</span>
        </button>
      </div>
    )
  }
  return (
    <button
      type="button"
      className="ag-item"
      data-tipo="evento"
      data-dia-todo={item.diaTodo}
      data-sem-cor={!cor}
      style={estilo}
      onClick={() => onAbrir(item)}
      aria-label={rotuloDoItem(item)}
      title={tituloDoItem(item)}
    >
      {!item.diaTodo && <span className="ag-item__ponto" aria-hidden="true" />}
      {horario && <span className="ag-item__hora">{horario}</span>}
      <span className="ag-item__titulo">{tituloDoItem(item)}</span>
    </button>
  )
}

// Bloco na grade de horas: altura pela duração; os que se sobrepõem dividem a largura.
function Bloco({ bloco, categoriasPorId, onAbrir, onConcluir }) {
  const { item } = bloco
  const cor = corDoItem(item, categoriasPorId)
  const altura = Math.max(((bloco.ate - bloco.de) / 60) * ALTURA_HORA, 22)
  const curto = altura < 44
  const estilo = {
    top: `${(bloco.de / 60) * ALTURA_HORA}px`,
    height: `${altura}px`,
    left: `calc(${(bloco.coluna / bloco.colunas) * 100}% + 2px)`,
    width: `calc(${((bloco.largura ?? 1) * 100) / bloco.colunas}% - 4px)`,
    ...(cor ? { '--c': cor } : {}),
  }
  const horario = rotuloHorario(item, rotuloDiaCurto)
  if (item.tipo === 'tarefa') {
    return (
      <div
        className="ag-bloco"
        data-tipo="tarefa"
        data-curto={curto}
        data-feita={item.tarefa.status === 'concluida'}
        style={estilo}
        title={tituloDoItem(item)}
      >
        <Concluir tarefa={item.tarefa} onConcluir={onConcluir} />
        <button type="button" className="ag-bloco__abrir" onClick={() => onAbrir(item)} aria-label={rotuloDoItem(item)}>
          <span className="ag-bloco__titulo">{item.tarefa.titulo}</span>
          {!curto && <span className="ag-bloco__hora">{horario}</span>}
        </button>
      </div>
    )
  }
  return (
    <button
      type="button"
      className="ag-bloco"
      title={tituloDoItem(item)}
      data-tipo="evento"
      data-curto={curto}
      data-sem-cor={!cor}
      data-continua={bloco.continua}
      style={estilo}
      onClick={() => onAbrir(item)}
      aria-label={rotuloDoItem(item)}
    >
      <span className="ag-bloco__titulo">{item.evento.titulo}</span>
      {!curto && <span className="ag-bloco__hora">{horario}</span>}
      {altura >= 78 && item.evento.local && (
        <span className="ag-bloco__local">
          <IconeLocal />
          {item.evento.local}
        </span>
      )}
    </button>
  )
}

// Semana ou Dia: cabeçalho dos dias, faixa de dia todo e a grade de 24 horas com a linha do agora.
export function GradeHoras({ dias, itens, categoriasPorId, onAbrir, onConcluir, onNovoNoHorario, onAbrirDia }) {
  const corpo = useRef(null)
  const agora = agoraBrasilia()
  const hoje = agora.slice(0, 10)
  const minutoAgora = paraMinutos(agora) - paraMinutos(hoje)
  const porDia = dias.map((dia) => ({ dia, ...itensDoDia(itens, dia) }))
  const temTopo = porDia.some((d) => d.topo.length)
  const chaveDias = dias.join(',')

  // Ao abrir ou trocar de período: rola até uma hora antes do primeiro compromisso (ou das 7h).
  useEffect(() => {
    const primeiro = Math.min(...porDia.flatMap((d) => d.blocos.map((b) => b.de)), dias.includes(hoje) ? minutoAgora : 7 * 60)
    corpo.current?.scrollTo({ top: Math.max(0, ((primeiro - 60) / 60) * ALTURA_HORA) })
    // Só quando os dias mudam: rolar a cada item salvo atrapalharia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveDias])

  function tocarColuna(evento, dia) {
    if (evento.target !== evento.currentTarget) return
    const y = evento.clientY - evento.currentTarget.getBoundingClientRect().top
    const minutos = Math.min(Math.floor((y / ALTURA_HORA) * 2) * 30, 23 * 60 + 30)
    onNovoNoHorario(dia, minutos)
  }

  return (
    <div className="ag-grade" ref={corpo} style={{ '--dias': dias.length, '--altura-hora': `${ALTURA_HORA}px` }}>
      <div className="ag-grade__fixo">
        <div className="ag-grade__cabeca" aria-hidden={dias.length === 1}>
          <span className="ag-grade__canto" />
          {dias.map((dia) => (
            <button
              key={dia}
              type="button"
              className="ag-grade__dia"
              data-hoje={dia === hoje}
              onClick={() => onAbrirDia(dia)}
              disabled={dias.length === 1}
              aria-label={a.abrirDia(rotuloDiaLongo(dia))}
            >
              <span className="ag-grade__semana">{NOMES_SEMANA[new Date(`${dia}T00:00:00Z`).getUTCDay()]}</span>
              <span className="ag-grade__numero">{numeroDia(dia)}</span>
            </button>
          ))}
        </div>

        {temTopo && (
          <div className="ag-grade__topo">
            <span className="ag-grade__canto label">{a.diaTodo}</span>
            {porDia.map(({ dia, topo }) => (
              <ul key={dia} className="ag-grade__topo-dia" aria-label={`${a.diaTodo}, ${rotuloDiaLongo(dia)}`}>
                {topo.map((item) => (
                  <li key={item.chave}>
                    <ItemCompacto item={item} categoriasPorId={categoriasPorId} onAbrir={onAbrir} onConcluir={onConcluir} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        )}
      </div>

      <div className="ag-grade__corpo">
        <div className="ag-grade__horas" aria-hidden="true">
          {HORAS.map((h) => (
            <span key={h} className="ag-grade__hora">
              {h === 0 ? '' : `${String(h).padStart(2, '0')}:00`}
            </span>
          ))}
        </div>
        {porDia.map(({ dia, blocos }) => (
          // Tocar num espaço vazio cria um evento naquele horário (clique; teclado usa o botão Novo).
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div key={dia} className="ag-grade__coluna" data-hoje={dia === hoje} onClick={(evento) => tocarColuna(evento, dia)}>
            {blocos.map((bloco) => (
              <Bloco key={bloco.item.chave} bloco={bloco} categoriasPorId={categoriasPorId} onAbrir={onAbrir} onConcluir={onConcluir} />
            ))}
            {dia === hoje && (
              <span
                className="ag-agora"
                style={{ top: `${(minutoAgora / 60) * ALTURA_HORA}px` }}
                aria-label={`${a.agora}: ${horaDe(agora)}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Mês: grade de semanas; cada dia mostra até 3 itens e "+n" leva ao Dia.
export function GradeMes({ cursor, itens, categoriasPorId, onAbrir, onConcluir, onAbrirDia }) {
  const hoje = agoraBrasilia().slice(0, 10)
  return (
    <div className="ag-mes">
      <div className="ag-mes__semana" aria-hidden="true">
        {NOMES_SEMANA.map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
      <div className="ag-mes__dias">
        {gradeMes(cursor).map((dia) => {
          const { topo, blocos } = itensDoDia(itens, dia)
          const doDia = [...topo, ...blocos.map((b) => b.item).sort((x, y) => x.inicio.localeCompare(y.inicio))]
          const extras = doDia.length - MAX_NO_MES
          return (
            // Tocar em qualquer lugar do dia abre o Dia (no celular os itens viram marcas).
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div
              key={dia}
              className="ag-mes__dia"
              data-fora={!mesmoMes(dia, cursor)}
              data-hoje={dia === hoje}
              onClick={(evento) => evento.target === evento.currentTarget && onAbrirDia(dia)}
            >
              <button
                type="button"
                className="cal-num"
                data-hoje={dia === hoje}
                data-fora={!mesmoMes(dia, cursor)}
                onClick={() => onAbrirDia(dia)}
                aria-label={a.abrirDia(rotuloDiaLongo(dia))}
              >
                {numeroDia(dia)}
              </button>
              <ul className="ag-mes__itens">
                {doDia.slice(0, extras > 0 ? MAX_NO_MES - 1 : MAX_NO_MES).map((item) => (
                  <li key={item.chave}>
                    <ItemCompacto item={item} categoriasPorId={categoriasPorId} onAbrir={onAbrir} onConcluir={onConcluir} mostrarHora />
                  </li>
                ))}
              </ul>
              {extras > 0 && (
                <button
                  type="button"
                  className="ag-mes__mais"
                  onClick={() => onAbrirDia(dia)}
                  aria-label={a.maisRotulo(extras + 1, rotuloDiaLongo(dia))}
                >
                  {a.mais(extras + 1)}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Semana no celular: lista por dia, com o horário à esquerda.
export function ListaSemana({ dias, itens, categoriasPorId, onAbrir, onConcluir }) {
  const hoje = agoraBrasilia().slice(0, 10)
  const comItens = dias.map((dia) => {
    const { topo, blocos } = itensDoDia(itens, dia)
    return { dia, lista: [...topo, ...blocos.map((b) => b.item).sort((x, y) => x.inicio.localeCompare(y.inicio))] }
  })
  if (comItens.every((d) => !d.lista.length)) return <p className="hint ag-vazio">{a.vazioSemana}</p>
  return (
    <div className="ag-lista">
      {comItens.map(({ dia, lista }) => (
        <section key={dia} className="ag-lista__dia" data-hoje={dia === hoje} aria-label={rotuloDiaLongo(dia)}>
          <h3 className="ag-lista__titulo label">{rotuloDiaCurto(dia)}</h3>
          {lista.length === 0 ? (
            <p className="hint ag-lista__nada">—</p>
          ) : (
            <ul className="ag-lista__itens">
              {lista.map((item) => (
                <li key={item.chave} className="ag-lista__linha">
                  <span className="ag-lista__hora">
                    {item.diaTodo || item.tipo === 'prazo' ? (item.tipo === 'prazo' ? a.prazo : a.diaTodo) : horaDe(item.inicio)}
                  </span>
                  <ItemCompacto item={item} categoriasPorId={categoriasPorId} onAbrir={onAbrir} onConcluir={onConcluir} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
