// Agenda (pedido do usuário, 2026-09-14): eventos com repetição e as tarefas marcadas para um dia.
// Horários são o relógio de Brasília em texto ("2026-09-15T14:00:00"), como o banco guarda
// (timestamp sem fuso). As contas tratam esse relógio como UTC, sem deslocamento no caminho.

import { somarDias } from './calendario'
import { somarMeses } from './gastosFixos'

const MIN_DIA = 1440

// "2026-09-15T14:30:00" em minutos desde 1970 (no relógio de Brasília).
export function paraMinutos(texto) {
  const [dia, hora = '00:00'] = texto.replace(' ', 'T').split('T')
  const [a, m, d] = dia.split('-').map(Number)
  const [h, mi] = hora.split(':').map(Number)
  return Date.UTC(a, m - 1, d, h, mi) / 60000
}

export function deMinutos(min) {
  const x = new Date(min * 60000)
  const dois = (n) => String(n).padStart(2, '0')
  return `${x.getUTCFullYear()}-${dois(x.getUTCMonth() + 1)}-${dois(x.getUTCDate())}T${dois(x.getUTCHours())}:${dois(x.getUTCMinutes())}:00`
}

export const diaDe = (texto) => texto.slice(0, 10)
export const horaDe = (texto) => texto.replace(' ', 'T').slice(11, 16)
const minutosNoDia = (texto) => paraMinutos(texto) - paraMinutos(diaDe(texto))

// Agora no relógio de Brasília, no mesmo formato.
export function agoraBrasilia() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date())
      .map((x) => [x.type, x.value]),
  )
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:00`
}

const diferencaDias = (a, b) => Math.round((paraMinutos(b) - paraMinutos(a)) / MIN_DIA)

// Início da n-ésima repetição (0 = a original).
function inicioDaVez(evento, n) {
  const dia = diaDe(evento.inicio)
  const hora = evento.inicio.replace(' ', 'T').slice(10)
  if (evento.repeticao === 'diaria') return somarDias(dia, n) + hora
  if (evento.repeticao === 'semanal') return somarDias(dia, 7 * n) + hora
  if (evento.repeticao === 'mensal') return somarMeses(dia, n) + hora
  if (evento.repeticao === 'anual') return somarMeses(dia, 12 * n) + hora
  return evento.inicio.replace(' ', 'T')
}

// Primeira vez que pode tocar o período: pula as repetições que acabaram antes dele.
function primeiraVez(evento, diaInicio, duracaoDias) {
  const alvo = somarDias(diaInicio, -duracaoDias - 1)
  const inicio = diaDe(evento.inicio)
  if (alvo <= inicio) return 0
  const dias = diferencaDias(inicio, alvo)
  if (evento.repeticao === 'diaria') return dias
  if (evento.repeticao === 'semanal') return Math.floor(dias / 7)
  const meses = (Number(alvo.slice(0, 4)) - Number(inicio.slice(0, 4))) * 12 + Number(alvo.slice(5, 7)) - Number(inicio.slice(5, 7))
  if (evento.repeticao === 'mensal') return Math.max(0, meses - 1)
  if (evento.repeticao === 'anual') return Math.max(0, Math.floor(meses / 12) - 1)
  return 0
}

// Ocorrências de um evento que tocam os dias [diaInicio, diaFim] (inclusive). Cada uma tem
// início e fim no relógio de Brasília; no dia todo, o fim é exclusivo (meia-noite do dia seguinte).
export function ocorrencias(evento, diaInicio, diaFim) {
  const inicioOriginal = paraMinutos(evento.inicio)
  const fimOriginal = paraMinutos(evento.fim) + (evento.dia_todo ? MIN_DIA : 0)
  const duracao = fimOriginal - inicioOriginal
  const limiteIni = paraMinutos(diaInicio)
  const limiteFim = paraMinutos(somarDias(diaFim, 1))
  const excluidas = new Set(evento.excluidas ?? [])
  const lista = []
  const repete = evento.repeticao && evento.repeticao !== 'nao'
  const n0 = repete ? primeiraVez(evento, diaInicio, Math.ceil(duracao / MIN_DIA)) : 0
  for (let n = n0; n < n0 + 1200; n++) {
    const inicio = inicioDaVez(evento, n)
    const dia = diaDe(inicio)
    if (evento.repetir_ate && dia > evento.repetir_ate) break
    const ini = paraMinutos(inicio)
    if (ini >= limiteFim) break
    const fim = ini + duracao
    if (fim > limiteIni && !excluidas.has(dia)) {
      lista.push({
        tipo: 'evento',
        evento,
        chave: `${evento.id}|${dia}`,
        dia,
        inicio: deMinutos(ini),
        fim: deMinutos(fim),
        diaTodo: evento.dia_todo,
      })
    }
    if (!repete) break
  }
  return lista
}

// Tarefas no período: as marcadas para um dia (com ou sem horário) e os prazos em aberto.
export function itensDeTarefas(tarefas, diaInicio, diaFim) {
  const itens = []
  for (const tarefa of tarefas) {
    const dia = tarefa.planejada_dia
    if (dia && dia >= diaInicio && dia <= diaFim) {
      if (tarefa.planejada_inicio) {
        const inicio = `${dia}T${tarefa.planejada_inicio.slice(0, 5)}:00`
        const fim = tarefa.planejada_fim ? `${dia}T${tarefa.planejada_fim.slice(0, 5)}:00` : deMinutos(paraMinutos(inicio) + 30)
        itens.push({ tipo: 'tarefa', tarefa, chave: `t-${tarefa.id}`, dia, inicio, fim, diaTodo: false })
      } else {
        itens.push({
          tipo: 'tarefa',
          tarefa,
          chave: `t-${tarefa.id}`,
          dia,
          inicio: `${dia}T00:00:00`,
          fim: `${somarDias(dia, 1)}T00:00:00`,
          diaTodo: true,
        })
      }
    }
    const prazo = tarefa.data_prevista
    if (prazo && tarefa.status !== 'concluida' && prazo >= diaInicio && prazo <= diaFim) {
      itens.push({
        tipo: 'prazo',
        tarefa,
        chave: `p-${tarefa.id}`,
        dia: prazo,
        inicio: `${prazo}T00:00:00`,
        fim: `${somarDias(prazo, 1)}T00:00:00`,
        diaTodo: true,
      })
    }
  }
  return itens
}

// Itens de um dia: os de dia todo (e os que atravessam a meia-noite por mais de um dia) em cima;
// os com horário viram blocos com início e fim em minutos daquele dia.
export function itensDoDia(itens, dia) {
  const ini = paraMinutos(dia)
  const fim = ini + MIN_DIA
  const topo = []
  const blocos = []
  for (const item of itens) {
    const a = paraMinutos(item.inicio)
    const b = paraMinutos(item.fim)
    if (b <= ini || a >= fim) continue
    if (item.diaTodo || b - a >= MIN_DIA) topo.push(item)
    else blocos.push({ item, de: Math.max(a, ini) - ini, ate: Math.min(b, fim) - ini, continua: a < ini, segue: b > fim })
  }
  const ordemTopo = { prazo: 0, evento: 1, tarefa: 2 }
  topo.sort((x, y) => ordemTopo[x.tipo] - ordemTopo[y.tipo] || x.inicio.localeCompare(y.inicio))
  return { topo, blocos: organizarColunas(blocos) }
}

// Blocos que se sobrepõem dividem a largura: cada um ganha uma coluna e o total do grupo.
function organizarColunas(blocos) {
  const ordenados = [...blocos].sort((a, b) => a.de - b.de || b.ate - a.ate)
  const grupos = []
  let grupo = []
  let fimGrupo = -1
  for (const bloco of ordenados) {
    if (grupo.length && bloco.de >= fimGrupo) {
      grupos.push(grupo)
      grupo = []
    }
    grupo.push(bloco)
    fimGrupo = Math.max(fimGrupo, bloco.ate)
  }
  if (grupo.length) grupos.push(grupo)
  for (const g of grupos) {
    const colunas = []
    for (const bloco of g) {
      // Um bloco curto (menos de 20 min) ocupa visualmente 20 min.
      const i = colunas.findIndex((ate) => ate <= bloco.de)
      const coluna = i >= 0 ? i : colunas.length
      colunas[coluna] = Math.max(bloco.ate, bloco.de + 20)
      bloco.coluna = coluna
    }
    for (const bloco of g) bloco.colunas = colunas.length
  }
  return ordenados
}

export const minutosDoHorario = (texto) => minutosNoDia(texto)

// Tempo em palavras: "14:00–15:30", "14:00 – qua 16:00" ou "dia todo".
export function rotuloHorario(item, diasCurtos) {
  if (item.diaTodo) return null
  const mesmoDia = diaDe(item.inicio) === diaDe(item.fim) || horaDe(item.fim) === '00:00'
  if (mesmoDia && diferencaDias(diaDe(item.inicio), diaDe(item.fim)) <= 1) return `${horaDe(item.inicio)}–${horaDe(item.fim)}`
  return `${horaDe(item.inicio)} – ${diasCurtos(diaDe(item.fim))} ${horaDe(item.fim)}`
}

// Início sugerido para um evento novo: o horário tocado, ou a próxima hora cheia de hoje.
export function inicioSugerido(dia, minutos) {
  const inicio = `${dia}T${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}:00`
  const fim = deMinutos(Math.min(paraMinutos(inicio) + 60, paraMinutos(`${somarDias(dia, 1)}T00:00`) - 5))
  return { inicio, fim, dia_todo: false }
}
