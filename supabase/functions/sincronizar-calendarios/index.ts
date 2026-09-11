// Sincroniza calendários iCal (Blackboard, Moodle, Google Agenda…) com as tarefas do RoutinXP.
//
// Modos (POST, corpo JSON):
// - { modo: 'cron' } com o cabeçalho x-cron-secret: sincroniza todas as fontes (agendamento a cada 3 h).
// - { modo: 'sincronizar', fonteId? } com o login do usuário: sincroniza as fontes dele (ou uma).
// - { modo: 'previa', url } com o login do usuário: lê o link e devolve as próximas atividades, sem gravar.
//
// Regras: atividade nova vira tarefa (título, dia do prazo, categoria e tag da fonte); prazo alterado
// atualiza a tarefa pendente; título só é atualizado se o usuário não o editou; tarefa concluída
// nunca é mexida; tarefa excluída pelo usuário não volta.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const LIMITE_BYTES = 2_000_000
const TEMPO_MS = 10_000
const FUSO = 'America/Sao_Paulo'
const ERROS = new Set(['link_invalido', 'link_inacessivel', 'nao_e_calendario', 'muito_grande', 'sem_categoria'])

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
})

type Evento = { uid: string; titulo: string; data: string }
type Fonte = {
  id: string
  user_id: string
  url: string
  category_id: string | null
  tag_id: string | null
  importar_passadas: boolean
  ultima_sync: string | null
}

function resposta(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

const hojeBrasilia = () => new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date())
const normalizar = (url: unknown) => String(url ?? '').trim().replace(/^webcal:\/\//i, 'https://')
const codigoErro = (erro: unknown) => {
  const mensagem = erro instanceof Error ? erro.message : String(erro)
  return ERROS.has(mensagem) ? mensagem : 'falha'
}

// Só https para nomes públicos: recusa localhost, redes internas e IPs escritos direto (SSRF).
function urlPermitida(texto: string) {
  let u: URL
  try {
    u = new URL(texto)
  } catch {
    return false
  }
  if (u.protocol !== 'https:') return false
  const host = u.hostname.toLowerCase()
  if (!host.includes('.')) return false
  if (/(^|\.)(localhost|local|internal|intranet|lan|home)$/.test(host)) return false
  if (/^\d+(\.\d+){3}$/.test(host) || host.includes(':') || host.startsWith('[')) return false
  return true
}

// Baixa o link com limite de tempo e tamanho, seguindo até 3 redirecionamentos (cada um conferido).
async function baixar(url: string): Promise<string> {
  let atual = url
  for (let salto = 0; salto < 4; salto++) {
    if (!urlPermitida(atual)) throw new Error('link_invalido')
    const controle = new AbortController()
    const timer = setTimeout(() => controle.abort(), TEMPO_MS)
    try {
      let res: Response
      try {
        res = await fetch(atual, {
          redirect: 'manual',
          signal: controle.signal,
          headers: { Accept: 'text/calendar, text/plain, */*' },
        })
      } catch {
        throw new Error('link_inacessivel')
      }
      const destino = res.headers.get('location')
      if (res.status >= 300 && res.status < 400 && destino) {
        atual = new URL(destino, atual).toString()
        continue
      }
      if (!res.ok || !res.body) throw new Error('link_inacessivel')

      const leitor = res.body.getReader()
      const partes: Uint8Array[] = []
      let total = 0
      try {
        while (true) {
          const { done, value } = await leitor.read()
          if (done) break
          total += value.length
          if (total > LIMITE_BYTES) {
            controle.abort()
            throw new Error('muito_grande')
          }
          partes.push(value)
        }
      } catch (erro) {
        throw ERROS.has((erro as Error).message) ? erro : new Error('link_inacessivel')
      }
      const bytes = new Uint8Array(total)
      let pos = 0
      for (const parte of partes) {
        bytes.set(parte, pos)
        pos += parte.length
      }
      const texto = new TextDecoder().decode(bytes)
      if (!texto.includes('BEGIN:VCALENDAR')) throw new Error('nao_e_calendario')
      return texto
    } finally {
      clearTimeout(timer)
    }
  }
  throw new Error('link_inacessivel')
}

const desescapar = (v: string) => v.replace(/\\n/gi, ' ').replace(/\\([,;\\])/g, '$1')

// "20260910T235900" (hora local do evento), "20260910T235900Z" (UTC) ou "20260910" (dia inteiro)
// → "2026-09-10". Horário em UTC é convertido para o dia de Brasília.
function dataDoEvento(valor: string) {
  const m = valor.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/)
  if (!m) return null
  const [, a, me, d, h, mi, s, z] = m
  if (z) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date(Date.UTC(+a, +me - 1, +d, +h, +mi, +s)))
  }
  return `${a}-${me}-${d}`
}

function lerIcs(texto: string): Evento[] {
  // Linhas longas continuam na linha seguinte começando com espaço ou tab (RFC 5545).
  const linhas = texto.replace(/\r?\n[ \t]/g, '').split(/\r?\n/)
  const eventos: Evento[] = []
  let atual: Partial<Evento> | null = null
  for (const linha of linhas) {
    if (linha === 'BEGIN:VEVENT') {
      atual = {}
      continue
    }
    if (linha === 'END:VEVENT') {
      if (atual?.uid && atual.data) eventos.push({ uid: atual.uid, data: atual.data, titulo: atual.titulo ?? '' })
      atual = null
      continue
    }
    if (!atual) continue
    const i = linha.indexOf(':')
    if (i < 0) continue
    const nome = linha.slice(0, i).split(';')[0].toUpperCase()
    const valor = linha.slice(i + 1).trim()
    if (nome === 'UID') atual.uid = valor
    else if (nome === 'SUMMARY') atual.titulo = desescapar(valor).trim()
    else if (nome === 'DTSTART') atual.data = dataDoEvento(valor) ?? undefined
  }
  return eventos
}

const tituloDe = (e: Evento) => (e.titulo || 'Atividade sem nome').slice(0, 200)

async function sincronizarFonte(fonte: Fonte) {
  try {
    const eventos = lerIcs(await baixar(fonte.url))
    const hoje = hojeBrasilia()

    const { data: itens, error: erroItens } = await admin
      .from('calendar_items')
      .select('uid, task_id, data_origem, titulo_origem')
      .eq('source_id', fonte.id)
    if (erroItens) throw erroItens
    const porUid = new Map(itens.map((x) => [x.uid, x]))

    const idsTarefas = itens.map((x) => x.task_id).filter(Boolean)
    const { data: tarefas, error: erroTarefas } = idsTarefas.length
      ? await admin.from('tasks').select('id, titulo, status, data_prevista').in('id', idsTarefas)
      : { data: [], error: null }
    if (erroTarefas) throw erroTarefas
    const tarefaPorId = new Map((tarefas ?? []).map((t) => [t.id, t]))

    let novas = 0
    let atualizadas = 0
    for (const evento of eventos) {
      const titulo = tituloDe(evento)
      const item = porUid.get(evento.uid)

      if (!item) {
        if (!fonte.importar_passadas && evento.data < hoje) continue
        if (!fonte.category_id) throw new Error('sem_categoria')
        // Reserva a atividade antes de criar a tarefa: duas sincronizações ao mesmo tempo não duplicam.
        const { data: reserva, error: erroReserva } = await admin
          .from('calendar_items')
          .upsert(
            { source_id: fonte.id, uid: evento.uid, user_id: fonte.user_id, data_origem: evento.data, titulo_origem: titulo },
            { onConflict: 'source_id,uid', ignoreDuplicates: true },
          )
          .select('uid')
        if (erroReserva) throw erroReserva
        if (!reserva?.length) continue

        const { data: tarefa, error: erroTarefa } = await admin
          .from('tasks')
          .insert({ user_id: fonte.user_id, category_id: fonte.category_id, titulo, data_prevista: evento.data })
          .select('id')
          .single()
        if (erroTarefa) {
          await admin.from('calendar_items').delete().eq('source_id', fonte.id).eq('uid', evento.uid)
          throw erroTarefa
        }
        if (fonte.tag_id) {
          await admin.from('task_tags').insert({ task_id: tarefa.id, tag_id: fonte.tag_id, user_id: fonte.user_id })
        }
        await admin.from('calendar_items').update({ task_id: tarefa.id }).eq('source_id', fonte.id).eq('uid', evento.uid)
        novas++
        continue
      }

      const mudouNoCalendario = evento.data !== item.data_origem || titulo !== item.titulo_origem
      const tarefa = item.task_id ? tarefaPorId.get(item.task_id) : null
      // Excluída pelo usuário (task_id nulo) ou concluída: fica como está.
      if (tarefa && tarefa.status === 'pendente' && mudouNoCalendario) {
        const mudancas: Record<string, string> = {}
        if (evento.data !== item.data_origem) mudancas.data_prevista = evento.data
        if (titulo !== item.titulo_origem && tarefa.titulo === item.titulo_origem) mudancas.titulo = titulo
        if (Object.keys(mudancas).length) {
          const { error } = await admin.from('tasks').update(mudancas).eq('id', tarefa.id)
          if (error) throw error
          atualizadas++
        }
      }
      if (mudouNoCalendario) {
        await admin
          .from('calendar_items')
          .update({ data_origem: evento.data, titulo_origem: titulo })
          .eq('source_id', fonte.id)
          .eq('uid', evento.uid)
      }
    }

    await admin
      .from('calendar_sources')
      .update({ ultima_sync: new Date().toISOString(), ultimo_erro: null, total_importadas: itens.length + novas })
      .eq('id', fonte.id)
    return { id: fonte.id, novas, atualizadas }
  } catch (erro) {
    const codigo = codigoErro(erro)
    if (codigo === 'falha') console.error('sincronizarFonte', fonte.id, erro)
    await admin.from('calendar_sources').update({ ultima_sync: new Date().toISOString(), ultimo_erro: codigo }).eq('id', fonte.id)
    return { id: fonte.id, erro: codigo }
  }
}

const CAMPOS_FONTE = 'id, user_id, url, category_id, tag_id, importar_passadas, ultima_sync'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return resposta({ erro: 'metodo' }, 405)

  let corpo: Record<string, unknown> = {}
  try {
    corpo = await req.json()
  } catch {
    /* corpo vazio */
  }

  if (corpo.modo === 'cron') {
    const { data: valido } = await admin.rpc('segredo_cron_valido', { p_segredo: req.headers.get('x-cron-secret') ?? '' })
    if (!valido) return resposta({ erro: 'nao_autorizado' }, 401)
    const { data: fontes } = await admin.from('calendar_sources').select(CAMPOS_FONTE)
    const resultados = []
    for (const fonte of fontes ?? []) resultados.push(await sincronizarFonte(fonte))
    return resposta({ resultados })
  }

  // Pedidos do app: exigem o usuário logado.
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  const { data: auth, error: erroAuth } = await admin.auth.getUser(token)
  const usuario = auth?.user
  if (erroAuth || !usuario) return resposta({ erro: 'nao_autorizado' }, 401)

  if (corpo.modo === 'previa') {
    const url = normalizar(corpo.url)
    if (!urlPermitida(url)) return resposta({ erro: 'link_invalido' }, 400)
    try {
      const eventos = lerIcs(await baixar(url))
      const hoje = hojeBrasilia()
      const futuras = eventos.filter((e) => e.data >= hoje).sort((a, b) => a.data.localeCompare(b.data))
      return resposta({
        total: eventos.length,
        futuras: futuras.length,
        proximas: futuras.slice(0, 5).map((e) => ({ titulo: tituloDe(e), data: e.data })),
      })
    } catch (erro) {
      return resposta({ erro: codigoErro(erro) }, 400)
    }
  }

  if (corpo.modo === 'sincronizar') {
    let consulta = admin.from('calendar_sources').select(CAMPOS_FONTE).eq('user_id', usuario.id)
    if (typeof corpo.fonteId === 'string') consulta = consulta.eq('id', corpo.fonteId)
    const { data: fontes } = await consulta
    const resultados = []
    for (const fonte of fontes ?? []) {
      // O botão "Atualizar" vale no máximo uma vez por minuto por calendário.
      if (fonte.ultima_sync && Date.now() - new Date(fonte.ultima_sync).getTime() < 60_000) {
        resultados.push({ id: fonte.id, pulada: true })
        continue
      }
      resultados.push(await sincronizarFonte(fonte))
    }
    return resposta({ resultados })
  }

  return resposta({ erro: 'modo' }, 400)
})
