import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Faltam VITE_SUPABASE_URL e/ou VITE_SUPABASE_PUBLISHABLE_KEY no .env (veja .env.example).',
  )
}

// Link do e-mail de convite do Supabase (…#access_token=…&type=invite): lido antes de o
// cliente abrir a sessão e limpar o endereço, para o app pedir que a pessoa crie a senha.
export const chegouPorConvite = typeof window !== 'undefined' && /[#&]type=invite(&|$)/.test(window.location.hash)

export const supabase = createClient(supabaseUrl, supabaseKey)
