import { useEffect, useState } from 'react'
import { chegouPorConvite, supabase } from './supabase'

// Sessão atual do Supabase Auth.
// session: undefined enquanto carrega, null sem login, objeto com login.
// recovery: true quando a pessoa precisa definir uma senha antes de usar o app: chegou pelo
// link de "esqueci minha senha" ou pelo link de convite.
// convite: true no caso do convite (a tela diz "Crie sua senha").
export function useSession() {
  const [session, setSession] = useState(undefined)
  const [recovery, setRecovery] = useState(chegouPorConvite)
  const [convite, setConvite] = useState(chegouPorConvite)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecovery(true)
        setConvite(false)
      }
      if (event === 'SIGNED_OUT') {
        setRecovery(false)
        setConvite(false)
      }
      setSession(next)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const clearRecovery = () => {
    setRecovery(false)
    setConvite(false)
  }

  return { session, recovery, convite, clearRecovery }
}
