// Datas do calendário de tarefas. Todo dia é uma string "AAAA-MM-DD" (como data_prevista);
// as contas usam meia-noite UTC, então não há deslocamento de fuso no meio do caminho.

const DIA_MS = 86400000

const paraData = (dia) => {
  const [a, m, d] = dia.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d))
}
const paraDia = (data) => data.toISOString().slice(0, 10)
const formato = (opcoes) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', ...opcoes })

export const somarDias = (dia, n) => paraDia(new Date(paraData(dia).getTime() + n * DIA_MS))

// A semana começa no domingo, como nos calendários brasileiros.
export const inicioSemana = (dia) => somarDias(dia, -paraData(dia).getUTCDay())
export const diasDaSemana = (dia) => Array.from({ length: 7 }, (_, i) => somarDias(inicioSemana(dia), i))

export function somarMeses(dia, n) {
  const d = paraData(dia)
  return paraDia(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1)))
}

// Grade do mês: semanas completas (domingo a sábado) que cobrem o mês inteiro.
export function gradeMes(dia) {
  const d = paraData(dia)
  const primeiro = paraDia(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)))
  const ultimo = paraDia(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)))
  const fim = somarDias(inicioSemana(ultimo), 6)
  const dias = []
  for (let x = inicioSemana(primeiro); x <= fim; x = somarDias(x, 1)) dias.push(x)
  return dias
}

export const mesmoMes = (a, b) => a.slice(0, 7) === b.slice(0, 7)
export const numeroDia = (dia) => Number(dia.slice(8))
export const NOMES_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

// "setembro de 2026"
export const rotuloMes = (dia) => formato({ month: 'long', year: 'numeric' }).format(paraData(dia))

// "quinta-feira, 11 de setembro"
export const rotuloDiaLongo = (dia) => formato({ weekday: 'long', day: 'numeric', month: 'long' }).format(paraData(dia))

// "qui, 11 set"
export const rotuloDiaCurto = (dia) =>
  formato({ weekday: 'short', day: 'numeric', month: 'short' }).format(paraData(dia)).replaceAll('.', '')

// "6–12 de setembro" ou "30 ago – 5 set"
export function rotuloSemana(dia) {
  const inicio = paraData(inicioSemana(dia))
  const fim = paraData(somarDias(inicioSemana(dia), 6))
  if (inicio.getUTCMonth() === fim.getUTCMonth()) {
    return `${inicio.getUTCDate()}–${fim.getUTCDate()} de ${formato({ month: 'long' }).format(fim)}`
  }
  const mesCurto = (data) => formato({ month: 'short' }).format(data).replace('.', '')
  return `${inicio.getUTCDate()} ${mesCurto(inicio)} – ${fim.getUTCDate()} ${mesCurto(fim)}`
}
