// Avisa por Web Push, um dia antes, os gastos fixos que vencem amanhã ("Conta de luz vence
// amanhã · R$ 180,00"), para o celular lembrar mesmo com o app fechado (fase 3.6 do Financeiro).
//
// Chamada só pelo agendamento do banco (todo dia às 8h de Brasília), com o cabeçalho
// x-cron-secret. Parceladas ficam de fora: as parcelas já entram lançadas no cartão.
// Cobrança já marcada como paga (lançamento ligado ao gasto e ao dia) não gera aviso.
//
// Segredos (supabase secrets): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY.

import { createClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
})

webpush.setVapidDetails('https://routinxp.vercel.app', Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!)

type Recorrencia = {
  id: string
  user_id: string
  nome: string
  valor_centavos: number
  valor_variavel: boolean
  frequencia: 'mensal' | 'anual' | 'semanal'
  inicio: string
  fim: string | null
}
type Inscricao = { id: string; user_id: string; endpoint: string; p256dh: string; auth: string }

// Lê todas as linhas, de 1000 em 1000 (o limite de cada consulta da API).
async function todas<T>(consulta: (de: number, ate: number) => PromiseLike<{ data: T[] | null; error: unknown }>) {
  const linhas: T[] = []
  for (let de = 0; ; de += 1000) {
    const { data, error } = await consulta(de, de + 999)
    if (error) throw error
    linhas.push(...(data ?? []))
    if (!data || data.length < 1000) return linhas
  }
}

function resposta(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } })
}

// Datas como no app ("2026-09-13"), contas em UTC.
const partes = (dia: string) => dia.split('-').map(Number)
const formatar = (ano: number, mes: number, dia: number) => `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
const ultimoDia = (ano: number, mes: number) => new Date(Date.UTC(ano, mes, 0)).getUTCDate()

function somarMeses(dia: string, n: number) {
  const [ano, mes, d] = partes(dia)
  const base = new Date(Date.UTC(ano, mes - 1 + n, 1))
  const a = base.getUTCFullYear()
  const m = base.getUTCMonth() + 1
  return formatar(a, m, Math.min(d, ultimoDia(a, m)))
}

function somarDias(dia: string, n: number) {
  const [ano, mes, d] = partes(dia)
  const x = new Date(Date.UTC(ano, mes - 1, d + n))
  return formatar(x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate())
}

// O gasto cobra neste dia? Mesma regra de src/lib/gastosFixos.js (dia 31 cai no último dia
// dos meses curtos; anual a cada 12 meses; semanal a cada 7 dias).
function cobraEm(rec: Recorrencia, dia: string) {
  if (dia < rec.inicio || (rec.fim && dia > rec.fim)) return false
  const [ai, mi, di] = partes(rec.inicio)
  const [ad, md, dd] = partes(dia)
  if (rec.frequencia === 'semanal') return Math.round((Date.UTC(ad, md - 1, dd) - Date.UTC(ai, mi - 1, di)) / 86400000) % 7 === 0
  const meses = (ad - ai) * 12 + (md - mi)
  if (rec.frequencia === 'anual' && meses % 12 !== 0) return false
  return somarMeses(rec.inicio, meses) === dia
}

const reais = (centavos: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(centavos / 100)

function texto(recs: Recorrencia[]) {
  if (recs.length === 1) {
    const [r] = recs
    return {
      titulo: `${r.nome} vence amanhã`,
      corpo: `${r.valor_variavel ? 'Cerca de ' : ''}${reais(r.valor_centavos)}. Abra Gastos fixos para marcar quando pagar.`,
    }
  }
  const total = recs.reduce((soma, r) => soma + r.valor_centavos, 0)
  const nomes = recs.map((r) => r.nome)
  const lista = nomes.length > 3 ? `${nomes.slice(0, 3).join(', ')} e mais ${nomes.length - 3}` : `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}`
  return { titulo: `${recs.length} gastos fixos vencem amanhã`, corpo: `${lista} · ${reais(total)} no total.` }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return resposta({ erro: 'metodo' }, 405)

  // Sem o cabeçalho, recusa antes de consultar o banco.
  const segredo = req.headers.get('x-cron-secret') ?? ''
  if (!segredo) return resposta({ erro: 'nao_autorizado' }, 401)
  const { data: valido } = await admin.rpc('segredo_cron_valido', { p_segredo: segredo })
  if (!valido) return resposta({ erro: 'nao_autorizado' }, 401)

  const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
  const amanha = somarDias(hoje, 1)

  // Quem recebe: conta com o Financeiro liberado, algum aparelho inscrito e o aviso ligado.
  let inscricoes: Inscricao[]
  try {
    inscricoes = await todas<Inscricao>((de, ate) => admin.from('push_subscriptions').select('id, user_id, endpoint, p256dh, auth').order('id').range(de, ate))
  } catch {
    return resposta({ erro: 'falha' }, 500)
  }
  const comAparelho = [...new Set(inscricoes.map((s) => s.user_id))]
  if (!comAparelho.length) return resposta({ enviados: 0 })

  const [{ data: contas, error: erroContas }, { data: desligados, error: erroPreferencias }] = await Promise.all([
    admin.from('contas_app').select('user_id').contains('funcoes', ['financeiro']).in('user_id', comAparelho),
    admin.from('fin_preferencias').select('user_id').eq('avisar_vencimentos', false).in('user_id', comAparelho),
  ])
  if (erroContas || erroPreferencias) return resposta({ erro: 'falha' }, 500)
  const semAviso = new Set((desligados ?? []).map((p) => p.user_id))
  const usuarios = (contas ?? []).map((c) => c.user_id).filter((id) => !semAviso.has(id))
  if (!usuarios.length) return resposta({ enviados: 0 })

  let recorrencias: Recorrencia[]
  try {
    recorrencias = await todas<Recorrencia>((de, ate) =>
      admin
        .from('fin_recorrencias')
        .select('id, user_id, nome, valor_centavos, valor_variavel, frequencia, inicio, fim')
        .eq('ativa', true)
        .neq('tipo', 'parcelada')
        .lte('inicio', amanha)
        .or(`fim.is.null,fim.gte.${amanha}`)
        .in('user_id', usuarios)
        .order('id')
        .range(de, ate),
    )
  } catch {
    return resposta({ erro: 'falha' }, 500)
  }
  const vencem = recorrencias.filter((r) => cobraEm(r, amanha))
  if (!vencem.length) return resposta({ enviados: 0 })

  // Já pago antes do vencimento: não avisa.
  // Sem saber o que já foi pago, melhor não avisar do que avisar conta paga.
  const { data: pagos, error: erroPagos } = await admin
    .from('fin_transacoes')
    .select('recorrencia_id')
    .in('recorrencia_id', vencem.map((r) => r.id))
    .eq('referencia', amanha)
  if (erroPagos) return resposta({ erro: 'falha' }, 500)
  const pagas = new Set((pagos ?? []).map((p) => p.recorrencia_id))
  const porUsuario = new Map<string, Recorrencia[]>()
  for (const r of vencem) {
    if (pagas.has(r.id)) continue
    porUsuario.set(r.user_id, [...(porUsuario.get(r.user_id) ?? []), r])
  }
  if (!porUsuario.size) return resposta({ enviados: 0 })

  const vencidas: string[] = []
  let enviados = 0
  await Promise.allSettled(
    inscricoes
      .filter((s) => porUsuario.has(s.user_id))
      .map(async (s) => {
        const recs = porUsuario.get(s.user_id)!.sort((a, b) => b.valor_centavos - a.valor_centavos)
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            JSON.stringify({ ...texto(recs), url: '/financeiro/gastos-fixos', tag: 'routinxp-vencimento' }),
            // Vale até o fim do dia: um celular desligado de manhã ainda recebe à tarde.
            { TTL: 12 * 60 * 60, urgency: 'normal' },
          )
          enviados += 1
        } catch (erro) {
          const status = (erro as { statusCode?: number })?.statusCode
          if (status === 404 || status === 410) vencidas.push(s.id)
        }
      }),
  )

  if (vencidas.length) await admin.from('push_subscriptions').delete().in('id', vencidas)
  return resposta({ enviados, removidas: vencidas.length })
})
