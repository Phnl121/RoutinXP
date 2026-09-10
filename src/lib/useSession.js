import { useEffect, useState } from 'react'
import { supabase } from './supabase'

// Sessão atual do Supabase Auth.
// session: undefined enquanto carrega, null sem login, objeto com login.
// recovery: true quando o usuário chegou pelo link de "esqueci minha senha".
export function useSession() {
  const [session, setSession] = useState(undefined)
  const [recovery, setRecovery] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      if (event === 'SIGNED_OUT') setRecovery(false)
      setSession(next)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  return { session, recovery, clearRecovery: () => setRecovery(false) }
}
