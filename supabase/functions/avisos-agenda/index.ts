// Lembretes da Agenda por Web Push ("Reunião com o orientador · em 30 min").
//
// Chamada pelo agendamento do banco a cada 5 minutos, com o cabeçalho x-cron-secret. Procura as
// ocorrências (inclusive de eventos que se repetem) cujo aviso caiu nos últimos minutos, registra
// cada uma em agenda_avisos_enviados (para não repetir) e manda o push para os aparelhos da pessoa.
// No dia todo, o lembrete conta a partir das 9h do dia.
//
// Segredos (supabase secrets): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY.

import { createClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
})

webpush.setVapidDetails('https://routinxp.vercel.app', Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!)

type Evento = {
  id: string
  user_id: string
  titulo: string
  local: string | null
  dia_todo: boolean
  inicio: string
  fim: string
  repeticao: 'nao' | 'diaria' | 'semanal' | 'mensal' | 'anual'
  repetir_ate: string | null
  excluidas: string[]
  lembrete_min: number
}
type Inscricao = { id: string; user_id: string; endpoint: string; p256dh: string; auth: string }

// Janela de busca: o cron roda a cada 5 min; 10 min cobre um atraso sem avisar duas vezes (o
// registro em agenda_avisos_enviados impede a repetição).
const JANELA_MIN = 10

function resposta(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } })
}

// Relógio de Brasília em minutos (tratado como UTC, como no app).
const paraMin = (texto: string) => {
  const [dia, hora = '00:00'] = texto.replace(' ', 'T').split('T')
  const [a, m, d] = dia.split('-').map(Number)
  const [h, mi] = hora.split(':').map(Number)
  return Date.UTC(a, m - 1, d, h, mi) / 60000
}
const deMin = (min: number) => new Date(min * 60000).toISOString().slice(0, 19)
const ultimoDia = (ano: number, mes: number) => new Date(Date.UTC(ano, mes, 0)).getUTCDate()

function somarMeses(dia: string, n: number) {
  const [ano, mes, d] = dia.split('-').map(Number)
  const base = new Date(Date.UTC(ano, mes - 1 + n, 1))
  const a = base.getUTCFullYear()
  const m = base.getUTCMonth() + 1
  return `${a}-${String(m).padStart(2, '0')}-${String(Math.min(d, ultimoDia(a, m))).padStart(2, '0')}`
}

function agoraBrasilia() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date())
      .map((x) => [x.type, x.value]),
  )
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:00`
}

// Inícios das ocorrências entre dois instantes (minutos). Mesma regra de src/lib/agenda.js.
function iniciosEntre(e: Evento, de: number, ate: number) {
  const inicio = e.inicio.replace(' ', 'T').slice(0, 19)
  const dia = inicio.slice(0, 10)
  const hora = inicio.slice(10)
  const lista: string[] = []
  if (e.repeticao === 'nao') {
    const x = paraMin(inicio)
    if (x >= de && x <= ate) lista.push(inicio)
    return lista
  }
  const passo = (n: number) =>
    e.repeticao === 'diaria'
      ? deMin(paraMin(dia) + n * 1440).slice(0, 10) + hora
      : e.repeticao === 'semanal'
        ? deMin(paraMin(dia) + n * 7 * 1440).slice(0, 10) + hora
        : e.repeticao === 'mensal'
          ? somarMeses(dia, n) + hora
          : somarMeses(dia, 12 * n) + hora
  // Começa perto da janela, sem percorrer anos de repetições.
  const diasAteJanela = Math.max(0, Math.floor((de - paraMin(dia)) / 1440) - 2)
  const n0 =
    e.repeticao === 'diaria' ? diasAteJanela : e.repeticao === 'semanal' ? Math.floor(diasAteJanela / 7) : e.repeticao === 'mensal' ? Math.max(0, Math.floor(diasAteJanela / 31) - 1) : Math.max(0, Math.floor(diasAteJanela / 366) - 1)
  for (let n = n0; n < n0 + 400; n++) {
    const x = passo(n)
    if (e.repetir_ate && x.slice(0, 10) > e.repetir_ate) break
    const m = paraMin(x)
    if (m > ate) break
    if (m >= de && !(e.excluidas ?? []).includes(x.slice(0, 10))) lista.push(x)
  }
  return lista
}

const hhmm = (texto: string) => texto.slice(11, 16)

// "em 25 min", "agora", "amanhã" ou "hoje": pelo tempo que falta de verdade (o evento pode ter
// sido criado dentro da janela do lembrete).
function quando(e: Evento, ocorrencia: string, agora: number) {
  if (e.dia_todo) return ocorrencia.slice(0, 10) === deMin(agora).slice(0, 10) ? 'hoje' : 'amanhã'
  const falta = Math.round((paraMin(ocorrencia) - agora) / 5) * 5
  if (falta <= 0) return 'agora'
  if (falta >= 1380) return 'amanhã'
  if (falta >= 60) return `em ${Math.floor(falta / 60)} h${falta % 60 ? ` ${falta % 60} min` : ''}`
  return `em ${falta} min`
}

function texto(e: Evento, ocorrencia: string, agora: number) {
  const duracao = paraMin(e.fim) - paraMin(e.inicio)
  const fim = deMin(paraMin(ocorrencia) + duracao)
  const horario = e.dia_todo ? 'Dia todo' : `${hhmm(ocorrencia)}–${hhmm(fim)}`
  return {
    titulo: `${e.titulo} · ${quando(e, ocorrencia, agora)}`,
    corpo: [horario, e.local].filter(Boolean).join(' · '),
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return resposta({ erro: 'metodo' }, 405)

  const segredo = req.headers.get('x-cron-secret') ?? ''
  if (!segredo) return resposta({ erro: 'nao_autorizado' }, 401)
  const { data: valido } = await admin.rpc('segredo_cron_valido', { p_segredo: segredo })
  if (!valido) return resposta({ erro: 'nao_autorizado' }, 401)

  const agora = paraMin(agoraBrasilia())
  // Um aviso de 1 dia antes olha ocorrências até amanhã, 9h (dia todo) mais a folga.
  const limite = deMin(agora + 1440 + 9 * 60 + JANELA_MIN)

  const eventos: Evento[] = []
  for (let de = 0; ; de += 1000) {
    const { data, error } = await admin
      .from('agenda_eventos')
      .select('id, user_id, titulo, local, dia_todo, inicio, fim, repeticao, repetir_ate, excluidas, lembrete_min')
      .not('lembrete_min', 'is', null)
      .lte('inicio', limite)
      .or(`repeticao.neq.nao,inicio.gte.${deMin(agora - 1440 * 2)}`)
      .order('id')
      .range(de, de + 999)
    if (error) return resposta({ erro: 'falha' }, 500)
    eventos.push(...((data ?? []) as Evento[]))
    if (!data || data.length < 1000) break
  }

  // Ocorrências cujo aviso (início − lembrete; no dia todo, 9h − lembrete) caiu na janela.
  const devidos: { evento: Evento; ocorrencia: string }[] = []
  for (const e of eventos) {
    const base = e.dia_todo ? 9 * 60 : 0
    const de = agora - JANELA_MIN + e.lembrete_min - base
    const ate = agora + e.lembrete_min - base
    for (const ocorrencia of iniciosEntre(e, de, ate)) devidos.push({ evento: e, ocorrencia })
  }
  if (!devidos.length) return resposta({ enviados: 0 })

  // Só quem ainda tem a Agenda liberada.
  const usuarios = [...new Set(devidos.map((x) => x.evento.user_id))]
  const { data: contas, error: erroContas } = await admin.from('contas_app').select('user_id').contains('funcoes', ['agenda']).in('user_id', usuarios)
  if (erroContas) return resposta({ erro: 'falha' }, 500)
  const liberados = new Set((contas ?? []).map((c) => c.user_id))
  const candidatos = devidos.filter((x) => liberados.has(x.evento.user_id))
  if (!candidatos.length) return resposta({ enviados: 0 })

  // Reserva: só avisa o que entrou agora no registro (outra execução não repete).
  const { data: reservados, error: erroReserva } = await admin
    .from('agenda_avisos_enviados')
    .upsert(
      candidatos.map((x) => ({ evento_id: x.evento.id, ocorrencia: x.ocorrencia })),
      { onConflict: 'evento_id,ocorrencia', ignoreDuplicates: true },
    )
    .select('evento_id, ocorrencia')
  if (erroReserva) return resposta({ erro: 'falha' }, 500)
  const chave = (id: string, ocorrencia: string) => `${id}|${ocorrencia.replace(' ', 'T').slice(0, 16)}`
  const novos = new Set((reservados ?? []).map((r) => chave(r.evento_id, r.ocorrencia)))
  const aEnviar = candidatos.filter((x) => novos.has(chave(x.evento.id, x.ocorrencia)))
  if (!aEnviar.length) return resposta({ enviados: 0 })

  const { data: inscricoes, error: erroInscricoes } = await admin
    .from('push_subscriptions')
    .select('id, user_id, endpoint, p256dh, auth')
    .in('user_id', [...new Set(aEnviar.map((x) => x.evento.user_id))])
  if (erroInscricoes) return resposta({ erro: 'falha' }, 500)

  const vencidas: string[] = []
  // Ocorrências que chegaram a pelo menos um aparelho (ou que não têm aparelho para chegar).
  const entregues = new Set<string>()
  const tentadas = new Set<string>()
  let enviados = 0
  await Promise.allSettled(
    aEnviar.flatMap(({ evento, ocorrencia }) =>
      ((inscricoes ?? []) as Inscricao[])
        .filter((s) => s.user_id === evento.user_id)
        .map(async (s) => {
          const id = chave(evento.id, ocorrencia)
          tentadas.add(id)
          try {
            await webpush.sendNotification(
              { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
              JSON.stringify({
                ...texto(evento, ocorrencia, agora),
                url: `/agenda?modo=dia&dia=${ocorrencia.slice(0, 10)}`,
                tag: `routinxp-agenda-${evento.id}`,
              }),
              { TTL: 30 * 60, urgency: 'high' },
            )
            enviados += 1
            entregues.add(id)
          } catch (erro) {
            const status = (erro as { statusCode?: number })?.statusCode
            if (status === 404 || status === 410) {
              vencidas.push(s.id)
              // Aparelho que não existe mais não merece nova tentativa.
              entregues.add(id)
            }
          }
        }),
    ),
  )

  if (vencidas.length) await admin.from('push_subscriptions').delete().in('id', [...new Set(vencidas)])

  // Falha passageira (serviço de push fora, tempo esgotado): libera o registro para a próxima
  // execução, 5 min depois, ainda dentro da janela, tentar de novo.
  for (const { evento, ocorrencia } of aEnviar) {
    const id = chave(evento.id, ocorrencia)
    if (tentadas.has(id) && !entregues.has(id)) {
      await admin.from('agenda_avisos_enviados').delete().match({ evento_id: evento.id, ocorrencia })
    }
  }
  return resposta({ enviados, removidas: vencidas.length })
})
