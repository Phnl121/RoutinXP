// Sincroniza calendários iCal (Blackboard, Moodle, Google Agenda…) com as tarefas do RoutinXP.
//
// Modos (POST, corpo JSON):
// - { modo: 'cron' } com o cabeçalho x-cron-secret: lê, em lote, os calendários sem tentativa há 3 h.
// - { modo: 'sincronizar', fonteId? } com o login do usuário: lê os calendários dele (ou um).
// - { modo: 'previa', url } com o login do usuário: lê o link e devolve as próximas atividades, sem gravar.
//
// Regras: atividade nova vira tarefa (título, dia do prazo, categoria e tag da fonte), numa transação
// só (função importar_atividade); prazo alterado atualiza a tarefa pendente; título só é atualizado se
// o usuário não o editou; tarefa concluída nunca é mexida; tarefa excluída pelo usuário não volta.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const LIMITE_BYTES = 2_000_000
const TEMPO_MS = 8_000
const FUSO = 'America/Sao_Paulo'
const INTERVALO_CRON_MS = 3 * 60 * 60 * 1000 // cada calendário é lido a cada ~3 h
const LOTE_CRON = 40
const SIMULTANEAS = 4
const PRAZO_CRON_MS = 45_000 // o agendamento desiste da chamada em 60 s
const ESPERA_BOTAO_MS = 60_000
const ERROS = new Set(['link_invalido', 'link_inacessivel', 'nao_e_calendario', 'muito_grande', 'sem_categoria', 'muitas_tentativas'])

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
})

type Evento = { uid: string; titulo: string; data: string }
type Fonte = {
  id: string
  user_id: string
  url: string
  importar_passadas: boolean
  ultima_tentativa: string | null
}

function resposta(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

const hojeBrasilia = () => new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date())
const normalizar = (url: unknown) => String(url ?? '').trim().replace(/^webcal:\/\//i, 'https://')
function codigoErro(erro: unknown) {
  const mensagem = erro instanceof Error ? erro.message : ((erro as { message?: string })?.message ?? String(erro))
  for (const codigo of ERROS) if (mensagem.includes(codigo)) return codigo
  return 'falha'
}

// ---------- Proteção contra endereços internos (SSRF) ----------

function ipv4ParaNumero(ip: string) {
  const p = ip.split('.').map(Number)
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null
  return ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3]
}

const FAIXAS_V4: [string, number][] = [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12],
  ['192.0.0.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['224.0.0.0', 4], ['240.0.0.0', 4],
]

function ipv4Privado(ip: string) {
  const n = ipv4ParaNumero(ip)
  if (n === null) return true
  return FAIXAS_V4.some(([base, bits]) => {
    const mascara = (0xffffffff << (32 - bits)) >>> 0
    return ((n & mascara) >>> 0) === ((ipv4ParaNumero(base)! & mascara) >>> 0)
  })
}

function ipv6Privado(ip: string) {
  const x = ip.toLowerCase()
  if (x === '::' || x === '::1') return true
  if (/^f[cd]/.test(x) || /^fe[89ab]/.test(x) || x.startsWith('64:ff9b:')) return true
  const mapeado = x.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  return mapeado ? ipv4Privado(mapeado[1]) : false
}

// Só https para nomes públicos, e o nome precisa apontar só para endereços públicos.
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

async function hostPublico(host: string) {
  if (typeof Deno.resolveDns !== 'function') return true
  const enderecos: string[] = []
  for (const tipo of ['A', 'AAAA'] as const) {
    try {
      enderecos.push(...(await Deno.resolveDns(host, tipo)))
    } catch {
      /* sem registro desse tipo */
    }
  }
  if (!enderecos.length) throw new Error('link_inacessivel')
  return enderecos.every((ip) => (ip.includes(':') ? !ipv6Privado(ip) : !ipv4Privado(ip)))
}

// Baixa o link com limite de tempo e tamanho, seguindo até 3 redirecionamentos (cada um conferido).
async function baixar(url: string): Promise<string> {
  let atual = url
  for (let salto = 0; salto < 4; salto++) {
    if (!urlPermitida(atual) || !(await hostPublico(new URL(atual).hostname))) throw new Error('link_invalido')
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

// ---------- Leitura do .ics ----------

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

function exigir<T>({ data, error }: { data: T; error: unknown }) {
  if (error) throw error
  return data
}

// ---------- Sincronização ----------

async function sincronizarFonte(fonte: Fonte) {
  try {
    const eventos = lerIcs(await baixar(fonte.url))
    const hoje = hojeBrasilia()

    const itens = exigir(
      await admin.from('calendar_items').select('uid, task_id, data_origem, titulo_origem').eq('source_id', fonte.id),
    )
    const porUid = new Map(itens.map((x) => [x.uid, x]))
    const idsTarefas = itens.map((x) => x.task_id).filter(Boolean)
    const tarefas = idsTarefas.length
      ? exigir(await admin.from('tasks').select('id, titulo, status').in('id', idsTarefas))
      : []
    const tarefaPorId = new Map(tarefas.map((t) => [t.id, t]))

    let novas = 0
    let atualizadas = 0
    for (const evento of eventos) {
      const titulo = tituloDe(evento)
      const item = porUid.get(evento.uid)

      if (!item) {
        if (!fonte.importar_passadas && evento.data < hoje) continue
        const idTarefa = exigir(
          await admin.rpc('importar_atividade', { p_source: fonte.id, p_uid: evento.uid, p_titulo: titulo, p_data: evento.data }),
        )
        if (idTarefa) novas++
        continue
      }

      const mudouNoCalendario = evento.data !== item.data_origem || titulo !== item.titulo_origem
      if (!mudouNoCalendario) continue
      const tarefa = item.task_id ? tarefaPorId.get(item.task_id) : null
      // Excluída pelo usuário (task_id nulo) ou concluída: fica como está.
      if (tarefa && tarefa.status === 'pendente') {
        const mudancas: Record<string, string> = {}
        if (evento.data !== item.data_origem) mudancas.data_prevista = evento.data
        if (titulo !== item.titulo_origem && tarefa.titulo === item.titulo_origem) mudancas.titulo = titulo
        if (Object.keys(mudancas).length) {
          exigir(await admin.from('tasks').update(mudancas).eq('id', tarefa.id))
          atualizadas++
        }
      }
      exigir(
        await admin
          .from('calendar_items')
          .update({ data_origem: evento.data, titulo_origem: titulo })
          .eq('source_id', fonte.id)
          .eq('uid', evento.uid),
      )
    }

    // Conta só as tarefas que ainda existem (as excluídas pelo usuário ficam de fora).
    const vinculadas = itens.filter((x) => x.task_id).length + novas
    const agora = new Date().toISOString()
    exigir(
      await admin
        .from('calendar_sources')
        .update({ ultima_sync: agora, ultima_tentativa: agora, ultimo_erro: null, total_importadas: vinculadas })
        .eq('id', fonte.id),
    )
    return { id: fonte.id, novas, atualizadas }
  } catch (erro) {
    const codigo = codigoErro(erro)
    if (codigo === 'falha') console.error('sincronizarFonte', fonte.id, erro)
    // A última leitura boa (ultima_sync) continua valendo; registra só a tentativa e o erro.
    await admin
      .from('calendar_sources')
      .update({ ultima_tentativa: new Date().toISOString(), ultimo_erro: codigo })
      .eq('id', fonte.id)
    return { id: fonte.id, erro: codigo }
  }
}

// Lê várias fontes com poucas ao mesmo tempo, parando no prazo (o que sobrar fica para a próxima rodada).
async function sincronizarLote(fontes: Fonte[], prazoMs: number) {
  const inicio = Date.now()
  const resultados: unknown[] = []
  let proxima = 0
  async function trabalhador() {
    while (proxima < fontes.length && Date.now() - inicio < prazoMs) {
      resultados.push(await sincronizarFonte(fontes[proxima++]))
    }
  }
  await Promise.all(Array.from({ length: SIMULTANEAS }, trabalhador))
  return resultados
}

const CAMPOS_FONTE = 'id, user_id, url, importar_passadas, ultima_tentativa'

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
    const limite = new Date(Date.now() - INTERVALO_CRON_MS).toISOString()
    const { data: fontes, error } = await admin
      .from('calendar_sources')
      .select(CAMPOS_FONTE)
      .or(`ultima_tentativa.is.null,ultima_tentativa.lt.${limite}`)
      .order('ultima_tentativa', { ascending: true, nullsFirst: true })
      .limit(LOTE_CRON)
    if (error) return resposta({ erro: 'falha' }, 500)
    return resposta({ resultados: await sincronizarLote(fontes ?? [], PRAZO_CRON_MS) })
  }

  // Pedidos do app: exigem o usuário logado.
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  const { data: auth, error: erroAuth } = await admin.auth.getUser(token)
  const usuario = auth?.user
  if (erroAuth || !usuario) return resposta({ erro: 'nao_autorizado' }, 401)

  if (corpo.modo === 'previa') {
    const url = normalizar(corpo.url)
    if (!urlPermitida(url)) return resposta({ erro: 'link_invalido' }, 400)
    const { data: permitido } = await admin.rpc('registrar_previa', { p_user: usuario.id })
    if (!permitido) return resposta({ erro: 'muitas_tentativas' }, 429)
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
    const { data: fontes, error } = await consulta
    if (error) return resposta({ erro: 'falha' }, 500)
    // O botão "Atualizar" vale no máximo uma vez por minuto por calendário.
    const agora = Date.now()
    const liberadas = (fontes ?? []).filter(
      (f) => !f.ultima_tentativa || agora - new Date(f.ultima_tentativa).getTime() >= ESPERA_BOTAO_MS,
    )
    const puladas = (fontes ?? []).filter((f) => !liberadas.includes(f)).map((f) => ({ id: f.id, pulada: true }))
    return resposta({ resultados: [...puladas, ...(await sincronizarLote(liberadas, PRAZO_CRON_MS))] })
  }

  return resposta({ erro: 'modo' }, 400)
})
