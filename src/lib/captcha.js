// Cloudflare Turnstile: chave pública do widget. Sem chave o CAPTCHA fica desligado
// e os formulários de login funcionam como antes.
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

export const captchaAtivo = Boolean(TURNSTILE_SITE_KEY)
