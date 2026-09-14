// Painel de administração do RoutinXP: listar contas, criar conta com senha provisória, liberar
// funções, suspender/reativar, gerar senha nova, remover o autenticador e excluir conta.
//
// Só atende administradores com a sessão verificada pelo autenticador: a checagem é a função
// admin_verificado() no banco, chamada com o token de quem pediu. As operações usam a chave de
// administração do Supabase, que nunca sai deste servidor.
//
// POST { acao: 'listar' | 'criar' | 'funcoes' | 'suspender' | 'reativar' | 'nova_senha' |
//        'remover_autenticador' | 'excluir', ... }

import { createClient } from 'jsr:@supabase/supabase-js@2'

const URL_SUPABASE = Deno.env.get('SUPABASE_URL')!
const admin = createClient(URL_SUPABASE, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
})

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const FUNCOES = ['tarefas', 'agenda', 'kanban', 'calendario', 'foco', 'painel', 'integracoes', 'financeiro']
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SUSPENSO_PARA_SEMPRE = '876000h' // 100 anos

function resposta(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

// Senha provisória: 16 caracteres sem os ambíguos (0/O, 1/l/I), com letras e números.
function gerarSenha() {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  for (;;) {
    const bytes = crypto.getRandomValues(new Uint8Array(64))
    let senha = ''
    for (const b of bytes) {
      // Descarta valores que enviesariam a escolha (256 não é múltiplo do tamanho do alfabeto).
      if (b >= 256 - (256 % alfabeto.length)) continue
      senha += alfabeto[b % alfabeto.length]
      if (senha.length === 16) break
    }
    if (senha.length === 16 && /[A-Za-z]/.test(senha) && /[0-9]/.test(senha)) return senha
  }
}

const funcoesValidas = (valor: unknown) =>
  Array.isArray(valor) && valor.every((f) => typeof f === 'string' && FUNCOES.includes(f)) ? [...new Set(valor as string[])] : null

async function registrar(adminId: string, acao: string, alvoId: string | null, alvoEmail: string | null, detalhes = {}) {
  await admin.from('registro_admin').insert({ admin_id: adminId, alvo_id: alvoId, alvo_email: alvoEmail, acao, detalhes })
}

// Encerra todas as sessões da conta: o token já emitido deixa de valer nas políticas do banco.
async function encerrarSessoes(id: string) {
  const { error } = await admin.rpc('encerrar_sessoes', { p_user: id })
  if (error) throw error
}

async function listarTodos() {
  const usuarios = []
  for (let pagina = 1; ; pagina++) {
    const { data, error } = await admin.auth.admin.listUsers({ page: pagina, perPage: 1000 })
    if (error) throw error
    usuarios.push(...data.users)
    if (data.users.length < 1000) break
  }
  return usuarios
}

async function buscarAlvo(id: unknown) {
  if (typeof id !== 'string' || !UUID.test(id)) return null
  const { data } = await admin.auth.admin.getUserById(id)
  return data?.user ?? null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return resposta({ erro: 'metodo' }, 405)

  // Quem chamou precisa ser administrador com a sessão verificada (confere no banco, com o token dele).
  const autorizacao = req.headers.get('Authorization') ?? ''
  if (!/^Bearer\s+\S+/i.test(autorizacao)) return resposta({ erro: 'nao_autorizado' }, 401)
  const doUsuario = createClient(URL_SUPABASE, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: autorizacao } },
    auth: { persistSession: false },
  })
  const { data: adminId, error: erroAdmin } = await doUsuario.rpc('admin_verificado')
  if (erroAdmin || typeof adminId !== 'string') return resposta({ erro: 'sem_acesso' }, 403)

  let corpo: Record<string, unknown> = {}
  try {
    corpo = await req.json()
  } catch {
    /* corpo vazio */
  }

  try {
    if (corpo.acao === 'listar') {
      const [usuarios, contas, perfis, registro] = await Promise.all([
        listarTodos(),
        admin.from('contas_app').select('user_id, papel, funcoes, nome_exibicao, senha_provisoria_hash'),
        admin.from('profiles').select('user_id, primeiro_nome, sobrenome'),
        admin
          .from('registro_admin')
          .select('id, acao, alvo_email, detalhes, created_at')
          .order('created_at', { ascending: false })
          .limit(50),
      ])
      const contaDe = new Map((contas.data ?? []).map((c) => [c.user_id, c]))
      const perfilDe = new Map((perfis.data ?? []).map((p) => [p.user_id, p]))
      const agora = Date.now()
      return resposta({
        usuarios: usuarios.map((u) => {
          const conta = contaDe.get(u.id)
          const perfil = perfilDe.get(u.id)
          return {
            id: u.id,
            email: u.email ?? null,
            nome: perfil ? `${perfil.primeiro_nome} ${perfil.sobrenome}` : (conta?.nome_exibicao ?? null),
            criado_em: u.created_at,
            ultimo_acesso: u.last_sign_in_at ?? null,
            suspenso: Boolean(u.banned_until && new Date(u.banned_until).getTime() > agora),
            autenticador: (u.factors ?? []).some((f) => f.status === 'verified'),
            papel: conta?.papel ?? 'usuario',
            funcoes: conta?.funcoes ?? [],
            senha_provisoria: Boolean(conta?.senha_provisoria_hash),
            eu: u.id === adminId,
          }
        }),
        registro: registro.data ?? [],
      })
    }

    if (corpo.acao === 'criar') {
      const email = typeof corpo.email === 'string' ? corpo.email.trim().toLowerCase() : ''
      const nome = typeof corpo.nome === 'string' && corpo.nome.trim() ? corpo.nome.trim().slice(0, 80) : null
      const funcoes = funcoesValidas(corpo.funcoes)
      if (!EMAIL.test(email) || email.length > 254) return resposta({ erro: 'email_invalido' }, 400)
      if (!funcoes) return resposta({ erro: 'funcoes_invalidas' }, 400)

      const senha = gerarSenha()
      const { data, error } = await admin.auth.admin.createUser({ email, password: senha, email_confirm: true })
      if (error) {
        const codigo = (error as { code?: string }).code
        if (codigo === 'email_exists' || codigo === 'user_already_exists') return resposta({ erro: 'email_existe' }, 409)
        throw error
      }
      const id = data.user.id
      // O gatilho de novas contas já criou a linha em contas_app; aqui entram as funções e o nome.
      // Se algo falhar, a conta é apagada: nunca fica uma conta sem senha provisória marcada.
      try {
        const { error: erroConta } = await admin
          .from('contas_app')
          .update({ funcoes, nome_exibicao: nome, criada_por: adminId, updated_at: new Date().toISOString() })
          .eq('user_id', id)
        if (erroConta) throw erroConta
        const { error: erroSenha } = await admin.rpc('marcar_senha_provisoria', { p_user: id })
        if (erroSenha) throw erroSenha
      } catch (erro) {
        await admin.auth.admin.deleteUser(id)
        throw erro
      }
      await registrar(adminId, 'criar', id, email, { funcoes })
      return resposta({ id, email, senha })
    }

    // Daqui para baixo, as ações são sobre uma conta existente.
    const alvo = await buscarAlvo(corpo.id)
    if (!alvo) return resposta({ erro: 'conta_nao_encontrada' }, 404)
    const email = alvo.email ?? null

    if (corpo.acao === 'funcoes') {
      const funcoes = funcoesValidas(corpo.funcoes)
      if (!funcoes) return resposta({ erro: 'funcoes_invalidas' }, 400)
      const { error } = await admin
        .from('contas_app')
        .update({ funcoes, updated_at: new Date().toISOString() })
        .eq('user_id', alvo.id)
      if (error) throw error
      await registrar(adminId, 'funcoes', alvo.id, email, { funcoes })
      return resposta({ ok: true })
    }

    // Suspender, senha nova, remover autenticador e excluir nunca valem para a própria conta.
    if (alvo.id === adminId) return resposta({ erro: 'propria_conta' }, 400)

    if (corpo.acao === 'suspender' || corpo.acao === 'reativar') {
      const suspender = corpo.acao === 'suspender'
      const { error } = await admin.auth.admin.updateUserById(alvo.id, {
        ban_duration: suspender ? SUSPENSO_PARA_SEMPRE : 'none',
      })
      if (error) throw error
      if (suspender) await encerrarSessoes(alvo.id)
      await registrar(adminId, corpo.acao, alvo.id, email)
      return resposta({ ok: true })
    }

    if (corpo.acao === 'nova_senha') {
      const senha = gerarSenha()
      const { error } = await admin.auth.admin.updateUserById(alvo.id, { password: senha })
      if (error) throw error
      const { error: erroSenha } = await admin.rpc('marcar_senha_provisoria', { p_user: alvo.id })
      if (erroSenha) throw erroSenha
      await encerrarSessoes(alvo.id)
      await registrar(adminId, 'nova_senha', alvo.id, email)
      return resposta({ senha })
    }

    if (corpo.acao === 'remover_autenticador') {
      const { data, error } = await admin.auth.admin.mfa.listFactors({ userId: alvo.id })
      if (error) throw error
      for (const fator of data.factors ?? []) {
        const { error: erroFator } = await admin.auth.admin.mfa.deleteFactor({ id: fator.id, userId: alvo.id })
        if (erroFator) throw erroFator
      }
      await encerrarSessoes(alvo.id)
      await registrar(adminId, 'remover_autenticador', alvo.id, email)
      return resposta({ ok: true })
    }

    if (corpo.acao === 'excluir') {
      // Confirmação: o painel manda o e-mail digitado; tem que ser o da conta.
      if (typeof corpo.confirmacao !== 'string' || corpo.confirmacao.trim().toLowerCase() !== (email ?? '').toLowerCase()) {
        return resposta({ erro: 'confirmacao' }, 400)
      }
      const { error } = await admin.auth.admin.deleteUser(alvo.id)
      if (error) throw error
      await registrar(adminId, 'excluir', alvo.id, email)
      return resposta({ ok: true })
    }

    return resposta({ erro: 'acao' }, 400)
  } catch (erro) {
    console.error('admin-usuarios', corpo.acao, erro)
    return resposta({ erro: 'falha' }, 500)
  }
})
