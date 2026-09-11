// Envia por Web Push o aviso de fim de fase da página Foco ("o tempo de foco acabou",
// "a pausa acabou"), para o celular ou o computador avisar mesmo com o app fechado.
//
// Chamada só pelo agendamento do banco (a cada 15 s, quando há aviso vencido), com o
// cabeçalho x-cron-secret. Tira os avisos vencidos, manda o push para cada aparelho do usuário
// e apaga as inscrições que o serviço de push diz não existirem mais (404/410).
//
// Segredos (supabase secrets): VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY.

import { createClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
})

webpush.setVapidDetails('https://routinxp.vercel.app', Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!)

const TEXTOS: Record<string, { titulo: string; corpo: string }> = {
  fim_foco: { titulo: 'Tempo de foco acabou', corpo: 'Hora da pausa. Abra o RoutinXP para iniciar a pausa.' },
  fim_pausa: { titulo: 'Pausa encerrada', corpo: 'Hora de voltar. Abra o RoutinXP e inicie o próximo foco.' },
}

type Aviso = { user_id: string; tipo: string }
type Inscricao = { id: string; user_id: string; endpoint: string; p256dh: string; auth: string }

function resposta(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { 'Content-Type': 'application/json' } })
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return resposta({ erro: 'metodo' }, 405)

  const { data: valido } = await admin.rpc('segredo_cron_valido', { p_segredo: req.headers.get('x-cron-secret') ?? '' })
  if (!valido) return resposta({ erro: 'nao_autorizado' }, 401)

  const { data: avisos, error } = await admin.rpc('retirar_avisos_foco_vencidos')
  if (error) return resposta({ erro: 'falha' }, 500)
  if (!avisos?.length) return resposta({ enviados: 0 })

  const tipoPorUsuario = new Map((avisos as Aviso[]).map((a) => [a.user_id, a.tipo]))
  const { data: inscricoes } = await admin
    .from('push_subscriptions')
    .select('id, user_id, endpoint, p256dh, auth')
    .in('user_id', [...tipoPorUsuario.keys()])

  const vencidas: string[] = []
  let enviados = 0
  await Promise.allSettled(
    ((inscricoes ?? []) as Inscricao[]).map(async (s) => {
      const texto = TEXTOS[tipoPorUsuario.get(s.user_id) ?? 'fim_foco']
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ ...texto, url: '/foco' }),
          { TTL: 600, urgency: 'high' },
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
