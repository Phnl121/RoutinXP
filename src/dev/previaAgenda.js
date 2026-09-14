// Eventos da Agenda na pré-visualização (/agenda?previa), com a mesma interface de lib/agendaApi.js.
import { hojeBrasilia } from '../lib/datas'
import { inicioSemana, somarDias } from '../lib/calendario'
import { ocorrencias } from '../lib/agenda'

const espera = (valor) => new Promise((ok) => setTimeout(() => ok(structuredClone(valor)), 120))
let seq = 1
const hoje = hojeBrasilia()
const semana = inicioSemana(hoje)
const em = (dia, hora) => `${dia}T${hora}:00`

const evento = (titulo, inicio, fim, extra = {}) => ({
  id: `ev-${seq++}`,
  titulo,
  descricao: null,
  local: null,
  dia_todo: false,
  inicio,
  fim,
  categoria_id: null,
  repeticao: 'nao',
  repetir_ate: null,
  excluidas: [],
  lembrete_min: null,
  created_at: new Date().toISOString(),
  ...extra,
})

let eventos = [
  evento('Aula de Cálculo II', em(somarDias(semana, -13), '08:00'), em(somarDias(semana, -13), '09:40'), {
    repeticao: 'semanal',
    categoria_id: 'c1',
    local: 'Bloco C, sala 204',
    lembrete_min: 10,
  }),
  evento('Aula de Estatística', em(somarDias(semana, -11), '10:00'), em(somarDias(semana, -11), '11:40'), {
    repeticao: 'semanal',
    categoria_id: 'c1',
    local: 'Bloco A, sala 12',
  }),
  evento('Reunião com o orientador', em(hoje, '11:00'), em(hoje, '12:00'), {
    categoria_id: 'c1',
    local: 'meet.google.com/abc-defg-hij',
    descricao: 'Levar o rascunho do capítulo 2.',
    lembrete_min: 30,
  }),
  evento('Almoço com a equipe', em(hoje, '12:30'), em(hoje, '13:30'), { categoria_id: 'c3' }),
  evento('Daily', em(somarDias(semana, 1), '09:00'), em(somarDias(semana, 1), '09:15'), {
    repeticao: 'diaria',
    categoria_id: 'c3',
    repetir_ate: somarDias(semana, 5),
  }),
  evento('Dentista', em(somarDias(hoje, 2), '17:00'), em(somarDias(hoje, 2), '18:00'), { categoria_id: 'c4', lembrete_min: 60 }),
  evento('Aniversário da Júlia', em(somarDias(hoje, 3), '00:00'), em(somarDias(hoje, 3), '00:00'), {
    dia_todo: true,
    repeticao: 'anual',
    categoria_id: 'c4',
  }),
  evento('Congresso de Tecnologia', em(somarDias(hoje, 8), '00:00'), em(somarDias(hoje, 10), '00:00'), {
    dia_todo: true,
    categoria_id: 'c2',
    local: 'Centro de Convenções',
  }),
  evento('Plantão de dúvidas', em(hoje, '11:30'), em(hoje, '12:15')),
]

export async function listarEventos(diaInicio, diaFim) {
  return espera(eventos.filter((e) => ocorrencias(e, diaInicio, diaFim).length || e.repeticao !== 'nao'))
}

export async function salvarEvento(dados) {
  const salvo = dados.id
    ? { ...eventos.find((e) => e.id === dados.id), ...dados }
    : { ...evento(dados.titulo, dados.inicio, dados.fim), ...dados, id: `ev-${seq++}` }
  if (salvo.repeticao === 'nao') salvo.repetir_ate = null
  eventos = dados.id ? eventos.map((e) => (e.id === dados.id ? salvo : e)) : [...eventos, salvo]
  return espera(salvo)
}

export async function excluirEvento(id) {
  eventos = eventos.filter((e) => e.id !== id)
  return espera(null)
}

export async function excluirOcorrencia(alvo, dia) {
  eventos = eventos.map((e) => (e.id === alvo.id ? { ...e, excluidas: [...new Set([...e.excluidas, dia])] } : e))
  return espera(eventos.find((e) => e.id === alvo.id))
}
