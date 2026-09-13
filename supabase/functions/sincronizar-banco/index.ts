// Open Finance pelo MeuPluggy (fase 4 do Financeiro): lê contas e lançamentos dos bancos
// conectados e grava no Financeiro, sem duplicar.
//
// Modos (POST, corpo JSON):
// - { modo: 'conectar' } com o login do administrador verificado: liga os itens de PLUGGY_ITEM_IDS
//   à conta dele (inclusive os que tinham sido desconectados) e lê todos agora.
// - { modo: 'sincronizar' } com o mesmo login: lê agora as conexões que existem (botão Atualizar).
// - { modo: 'cron' } com o cabeçalho x-cron-secret: leitura diária das conexões existentes.
//
// Regras:
// - Conta nova da Pluggy vira conta do Financeiro (origem banco); a primeira leitura traz 90 dias.
// - Lançamento importado guarda o id da Pluggy (externo_id): ler de novo só atualiza valor, data e
//   pendência. Categoria e descrição editadas pela pessoa ficam.
// - Saída numa conta e entrada de mesmo valor em outra conta conectada, com até 2 dias de
//   diferença, viram uma transferência (pagamento de fatura, Pix entre contas próprias).
// - Lançamento com mesmo tipo e valor de um manual (data ±2 dias) é marcado como possível
//   duplicata; a tela sugere juntar.
// - O saldo de cada conta importada acompanha o saldo informado pelo banco.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const PLUGGY = 'https://api.pluggy.ai'
const FUSO = 'America/Sao_Paulo'
const DIAS_PRIMEIRA_LEITURA = 90
// Releitura larga: um lançamento pendente pode compensar com data mais antiga.
const DIAS_RELEITURA = 30
// Itens nessa situação não foram lidos de verdade: a tela mostra o erro, não "lido hoje".
const STATUS_COM_ERRO = new Set(['LOGIN_ERROR', 'OUTDATED', 'WAITING_USER_INPUT'])
const ESPERA_BOTAO_MS = 5 * 60_000

const URL_SUPABASE = Deno.env.get('SUPABASE_URL')!
const admin = createClient(URL_SUPABASE, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })

type ContaPluggy = {
  id: string
  type: string
  subtype: string
  name: string
  marketingName?: string | null
  balance: number
  creditData?: { balanceCloseDate?: string | null; balanceDueDate?: string | null } | null
}
type TransacaoPluggy = { id: string; description: string; amount: number; date: string; type: 'DEBIT' | 'CREDIT'; status?: string }
type Importada = {
  externo: string
  conta_id: string
  tipo: 'entrada' | 'saida'
  valor: number
  data: string
  descricao: string
  pendente: boolean
}

function resposta(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

const diaBrasilia = (iso: string | Date) => new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date(iso))
// Datas só com o dia chegam como meia-noite UTC: convertê-las para Brasília voltaria um dia.
const diaDaPluggy = (iso: string) => (/T00:00:00(\.0+)?Z$/.test(iso) ? iso.slice(0, 10) : diaBrasilia(iso))
const hoje = () => diaBrasilia(new Date())
function somarDias(dia: string, n: number) {
  const [a, m, d] = dia.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10)
}
const distanciaDias = (a: string, b: string) => Math.abs(Date.parse(a) - Date.parse(b)) / 86_400_000
const centavos = (valor: number) => Math.round(Math.abs(valor) * 100)
const tipoConta = (c: ContaPluggy) =>
  c.subtype === 'CREDIT_CARD' || c.type === 'CREDIT' ? 'cartao' : c.subtype === 'SAVINGS_ACCOUNT' ? 'poupanca' : 'corrente'

async function chavePluggy() {
  const r = await fetch(`${PLUGGY}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: Deno.env.get('PLUGGY_CLIENT_ID'), clientSecret: Deno.env.get('PLUGGY_CLIENT_SECRET') }),
  })
  if (!r.ok) throw new Error(`pluggy_auth_${r.status}`)
  return (await r.json()).apiKey as string
}

async function pluggy(chave: string, caminho: string) {
  const r = await fetch(`${PLUGGY}${caminho}`, { headers: { 'X-API-KEY': chave } })
  if (!r.ok) throw new Error(`pluggy_${r.status}`)
  return await r.json()
}

async function lancamentosDaConta(chave: string, contaId: string, desde: string) {
  const lista: TransacaoPluggy[] = []
  let depois: string | null = null
  for (let pagina = 0; pagina < 40; pagina++) {
    const params = new URLSearchParams({ accountId: contaId, dateFrom: desde })
    if (depois) params.set('after', depois)
    const dados = await pluggy(chave, `/v2/transactions?${params}`)
    lista.push(...(dados.results ?? []))
    depois = dados.next ? decodeURIComponent(dados.next) : null
    if (!depois) break
  }
  return lista
}

const itensConfigurados = () =>
  (Deno.env.get('PLUGGY_ITEM_IDS') ?? '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)

// Lê todos os itens de uma pessoa e grava contas e lançamentos.
async function sincronizar(userId: string, itens: string[]) {
  const chave = await chavePluggy()
  const dia = hoje()
  const resumo = { contas: 0, importados: 0, atualizados: 0, transferencias: 0, duplicatas: 0, erros: [] as string[] }
  const importadas: Importada[] = []
  const contasLidas: { id: string; tipo: string; saldoBanco: number; saldoInicialEm: string; desde: string }[] = []

  for (const itemId of itens) {
    const agora = new Date().toISOString()
    try {
      const item = await pluggy(chave, `/items/${encodeURIComponent(itemId)}`)
      const itemComErro = STATUS_COM_ERRO.has(item.status)
      await admin
        .from('fin_conexoes')
        .update({
          banco: item.connector?.name ?? null,
          imagem_url: item.connector?.imageUrl ?? null,
          status: item.status ?? null,
          ultimo_erro: itemComErro ? (item.error?.message ?? item.status) : null,
          consentimento_expira: item.consentExpiresAt ?? null,
          ultima_tentativa: agora,
        })
        .eq('user_id', userId)
        .eq('item_id', itemId)

      const { results: contas = [] } = await pluggy(chave, `/accounts?itemId=${encodeURIComponent(itemId)}`)
      for (const c of contas as ContaPluggy[]) {
        const tipo = tipoConta(c)
        const { data: existente } = await admin
          .from('fin_contas')
          .select('id, tipo, saldo_inicial_em')
          .eq('user_id', userId)
          .eq('externo_id', c.id)
          .maybeSingle()
        let conta = existente
        const desde = existente ? somarDias(dia, -DIAS_RELEITURA) : somarDias(dia, -DIAS_PRIMEIRA_LEITURA)
        if (!conta) {
          const diaDe = (iso?: string | null) => (iso ? Number(diaDaPluggy(iso).slice(8, 10)) : null)
          const { data: nova, error } = await admin
            .from('fin_contas')
            .insert({
              user_id: userId,
              nome: (c.marketingName?.trim() || c.name?.trim() || 'Conta do banco').slice(0, 60),
              tipo,
              origem: 'banco',
              externo_id: c.id,
              item_id: itemId,
              saldo_inicial_em: desde,
              dia_fechamento: tipo === 'cartao' ? diaDe(c.creditData?.balanceCloseDate) : null,
              dia_vencimento: tipo === 'cartao' ? diaDe(c.creditData?.balanceDueDate) : null,
            })
            .select('id, tipo, saldo_inicial_em')
            .single()
          if (error) throw error
          conta = nova
          resumo.contas++
        }
        // No cartão, o saldo do banco é o que se deve: no Financeiro fica negativo (crédito, positivo).
        const saldoBanco = conta.tipo === 'cartao' ? -Math.round(c.balance * 100) : Math.round(c.balance * 100)
        const lidos = await lancamentosDaConta(chave, c.id, desde)
        // Só entra na lista depois de ler: se a leitura falhar, nada desta conta é apagado.
        contasLidas.push({ id: conta.id, tipo: conta.tipo, saldoBanco, saldoInicialEm: conta.saldo_inicial_em, desde })

        for (const x of lidos) {
          const valor = centavos(x.amount)
          if (!valor) continue
          importadas.push({
            externo: x.id,
            conta_id: conta.id,
            tipo: x.type === 'CREDIT' ? 'entrada' : 'saida',
            valor,
            data: diaDaPluggy(x.date),
            descricao: (x.description?.trim() || 'Lançamento do banco').slice(0, 200),
            pendente: x.status === 'PENDING',
          })
        }
      }
      if (itemComErro) resumo.erros.push(item.status)
      else await admin.from('fin_conexoes').update({ ultima_sync: agora, ultimo_erro: null }).eq('user_id', userId).eq('item_id', itemId)
    } catch (erro) {
      const codigo = erro instanceof Error ? erro.message : 'falha'
      resumo.erros.push(codigo)
      await admin.from('fin_conexoes').update({ ultimo_erro: codigo, ultima_tentativa: agora }).eq('user_id', userId).eq('item_id', itemId)
    }
  }

  try {
    if (importadas.length) await gravarLancamentos(userId, importadas, contasLidas, resumo)
    await ajustarSaldos(userId, contasLidas)
  } catch (erro) {
    // Falha ao gravar fica registrada nas conexões, para a tela mostrar.
    const codigo = erro instanceof Error ? erro.message : ((erro as { message?: string })?.message ?? 'falha_gravar')
    resumo.erros.push(codigo)
    await admin.from('fin_conexoes').update({ ultimo_erro: codigo }).eq('user_id', userId).in('item_id', itens)
  }
  return resumo
}

async function emLotes<T>(lista: T[], tamanho: number, fn: (lote: T[]) => Promise<void>) {
  for (let i = 0; i < lista.length; i += tamanho) await fn(lista.slice(i, i + tamanho))
}

async function gravarLancamentos(
  userId: string,
  importadas: Importada[],
  contasLidas: { id: string; tipo: string; desde: string }[],
  resumo: { importados: number; atualizados: number; transferencias: number; duplicatas: number },
) {
  const ids = importadas.map((x) => x.externo)
  const tipoDaConta = new Map(contasLidas.map((c) => [c.id, c.tipo]))
  const conhecidos = new Map<string, { id: string; tipo: string }>()
  const destinos = new Set<string>()
  await emLotes(ids, 200, async (lote) => {
    const { data: porOrigem } = await admin.from('fin_transacoes').select('id, tipo, externo_id').eq('user_id', userId).in('externo_id', lote)
    for (const t of porOrigem ?? []) conhecidos.set(t.externo_id, { id: t.id, tipo: t.tipo })
    const { data: porDestino } = await admin.from('fin_transacoes').select('externo_id_destino').eq('user_id', userId).in('externo_id_destino', lote)
    for (const t of porDestino ?? []) destinos.add(t.externo_id_destino)
  })

  // Já importados: valor, data e pendência podem mudar (compra que compensou).
  for (const x of importadas) {
    const atual = conhecidos.get(x.externo)
    if (!atual) continue
    const campos: Record<string, unknown> = { valor_centavos: x.valor, data: x.data, pendente: x.pendente }
    await admin.from('fin_transacoes').update(campos).eq('id', atual.id)
    resumo.atualizados++
  }

  const novas = importadas.filter((x) => !conhecidos.has(x.externo) && !destinos.has(x.externo))

  // Transferências entre contas conectadas: saída de um lado, entrada do mesmo valor do outro.
  const usadas = new Set<string>()
  const linhas: Record<string, unknown>[] = []
  for (const saida of novas.filter((x) => x.tipo === 'saida' && tipoDaConta.get(x.conta_id) !== 'cartao')) {
    const candidatos = novas
      .filter((e) => e.tipo === 'entrada' && !usadas.has(e.externo) && e.conta_id !== saida.conta_id && e.valor === saida.valor && distanciaDias(e.data, saida.data) <= 2)
      .sort((a, b) => distanciaDias(a.data, saida.data) - distanciaDias(b.data, saida.data))
    if (!candidatos.length) continue
    // Dois candidatos igualmente próximos: ambíguo, ficam como lançamentos comuns.
    if (candidatos.length > 1 && distanciaDias(candidatos[0].data, saida.data) === distanciaDias(candidatos[1].data, saida.data)) continue
    const par = candidatos[0]
    usadas.add(par.externo)
    usadas.add(saida.externo)
    linhas.push({
      user_id: userId,
      tipo: 'transferencia',
      valor_centavos: saida.valor,
      data: saida.data,
      descricao: saida.descricao,
      conta_id: saida.conta_id,
      conta_destino_id: par.conta_id,
      origem: 'banco',
      externo_id: saida.externo,
      externo_id_destino: par.externo,
      pendente: saida.pendente || par.pendente,
    })
    resumo.transferencias++
  }

  // Possíveis duplicatas de lançamentos manuais (mesmo tipo e valor, data ±2 dias).
  const simples = novas.filter((x) => !usadas.has(x.externo))
  let manuais: { id: string; tipo: string; valor_centavos: number; data: string }[] = []
  if (simples.length) {
    const inicio = somarDias(simples.reduce((m, x) => (x.data < m ? x.data : m), simples[0].data), -2)
    const { data } = await admin
      .from('fin_transacoes')
      .select('id, tipo, valor_centavos, data')
      .eq('user_id', userId)
      .eq('origem', 'manual')
      .gte('data', inicio)
    manuais = data ?? []
    const { data: jaApontados } = await admin.from('fin_transacoes').select('duplicata_de').eq('user_id', userId).not('duplicata_de', 'is', null)
    const ocupados = new Set((jaApontados ?? []).map((x) => x.duplicata_de))
    for (const x of simples) {
      const manual = manuais.find((m) => !ocupados.has(m.id) && m.tipo === x.tipo && m.valor_centavos === x.valor && distanciaDias(m.data, x.data) <= 2)
      if (manual) {
        ocupados.add(manual.id)
        resumo.duplicatas++
      }
      linhas.push({
        user_id: userId,
        tipo: x.tipo,
        valor_centavos: x.valor,
        data: x.data,
        descricao: x.descricao,
        conta_id: x.conta_id,
        origem: 'banco',
        externo_id: x.externo,
        pendente: x.pendente,
        duplicata_de: manual?.id ?? null,
      })
    }
  }

  await emLotes(linhas, 200, async (lote) => {
    const { error } = await admin.from('fin_transacoes').insert(lote)
    if (error) throw error
    resumo.importados += lote.length
  })

  // Pendentes que o banco não devolveu mais (viraram outro lançamento ou foram estornados).
  const devolvidos = new Set(ids)
  for (const conta of contasLidas) {
    const { data: pendentes } = await admin
      .from('fin_transacoes')
      .select('id, externo_id')
      .eq('user_id', userId)
      .eq('conta_id', conta.id)
      .eq('origem', 'banco')
      .eq('pendente', true)
      .gte('data', conta.desde)
    const sumidos = (pendentes ?? []).filter((t) => t.externo_id && !devolvidos.has(t.externo_id)).map((t) => t.id)
    if (sumidos.length) await admin.from('fin_transacoes').delete().in('id', sumidos)
  }
}

// O saldo inicial é recalculado para que o saldo do Financeiro bata com o do banco hoje.
// A soma do movimento é feita no banco (fin_movimento_conta), sem limite de linhas.
async function ajustarSaldos(_userId: string, contas: { id: string; saldoBanco: number; saldoInicialEm: string }[]) {
  for (const conta of contas) {
    const { data: movimento, error } = await admin.rpc('fin_movimento_conta', { p_conta: conta.id, p_desde: conta.saldoInicialEm })
    if (error) throw error
    const { error: erroConta } = await admin
      .from('fin_contas')
      .update({ saldo_inicial_centavos: conta.saldoBanco - Number(movimento ?? 0) })
      .eq('id', conta.id)
    if (erroConta) throw erroConta
  }
}

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
    const segredo = req.headers.get('x-cron-secret') ?? ''
    if (!segredo) return resposta({ erro: 'nao_autorizado' }, 401)
    const { data: valido } = await admin.rpc('segredo_cron_valido', { p_segredo: segredo })
    if (!valido) return resposta({ erro: 'nao_autorizado' }, 401)
    const { data: conexoes } = await admin.from('fin_conexoes').select('user_id, item_id')
    const porUsuario = new Map<string, string[]>()
    const configurados = itensConfigurados()
    for (const c of (conexoes ?? []).filter((x) => configurados.includes(x.item_id))) {
      porUsuario.set(c.user_id, [...(porUsuario.get(c.user_id) ?? []), c.item_id])
    }
    const resultados = []
    for (const [userId, itens] of porUsuario) {
      try {
        resultados.push(await sincronizar(userId, itens))
      } catch (erro) {
        console.error('sincronizar-banco cron', erro)
      }
    }
    return resposta({ resultados })
  }

  // Pedido do app: só o administrador verificado, com a função Financeiro.
  const autorizacao = req.headers.get('Authorization') ?? ''
  if (!/^Bearer\s+\S+/i.test(autorizacao)) return resposta({ erro: 'nao_autorizado' }, 401)
  const doUsuario = createClient(URL_SUPABASE, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: autorizacao } },
    auth: { persistSession: false },
  })
  const { data: adminId, error: erroAdmin } = await doUsuario.rpc('admin_verificado')
  const { data: comFinanceiro } = await doUsuario.rpc('tem_funcao', { p_funcao: 'financeiro' })
  if (erroAdmin || typeof adminId !== 'string' || !comFinanceiro) return resposta({ erro: 'sem_acesso' }, 403)

  if (corpo.modo !== 'sincronizar' && corpo.modo !== 'conectar') return resposta({ erro: 'modo' }, 400)
  const configurados = itensConfigurados()
  if (!configurados.length) return resposta({ erro: 'sem_itens' }, 400)

  // Botão "Atualizar agora": no máximo uma leitura a cada 5 minutos.
  const { data: recentes } = await admin
    .from('fin_conexoes')
    .select('ultima_tentativa')
    .eq('user_id', adminId)
    .gte('ultima_tentativa', new Date(Date.now() - ESPERA_BOTAO_MS).toISOString())
    .limit(1)
  if (recentes?.length) return resposta({ erro: 'muitas_tentativas' }, 429)

  if (corpo.modo === 'conectar') {
    // Item já ligado a outra conta continua com ela (unique item_id): nada é copiado para cá.
    await admin.from('fin_conexoes').upsert(
      configurados.map((item_id) => ({ user_id: adminId, item_id })),
      { onConflict: 'item_id', ignoreDuplicates: true },
    )
  }
  // Só as conexões ativas que continuam nos segredos.
  const { data: ativas } = await admin.from('fin_conexoes').select('item_id').eq('user_id', adminId)
  const itens = (ativas ?? []).map((c) => c.item_id).filter((id) => configurados.includes(id))
  if (!itens.length) return resposta({ erro: 'sem_conexoes' }, 400)

  try {
    return resposta(await sincronizar(adminId, itens))
  } catch (erro) {
    console.error('sincronizar-banco', erro)
    return resposta({ erro: 'falha' }, 500)
  }
})
