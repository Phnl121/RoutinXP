import { useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { IconeFechar, IconeRelogio } from './icones'
import { hojeBrasilia } from '../lib/datas'
import { streakEmRisco } from '../lib/lembrete'
import { t } from '../i18n/pt-BR'

// Lembrete neutro quando a sequência está por um fio: streak acima de zero e
// nenhuma conclusão hoje (Brasília). Sem cor de alarme. Pode ser dispensado até amanhã.
export function LembreteStreak({ stats }) {
  const hoje = hojeBrasilia()
  const chave = `routinxp:lembrete:${hoje}`
  const location = useLocation()
  const [dispensado, setDispensado] = useState(() => {
    try {
      return localStorage.getItem(chave) === '1'
    } catch {
      return false
    }
  })

  if (!streakEmRisco(stats, hoje) || dispensado) return null

  function dispensar() {
    setDispensado(true)
    try {
      localStorage.setItem(chave, '1')
    } catch {
      /* sem armazenamento: some só nesta sessão */
    }
  }

  return (
    <div className="lembrete" role="status">
      <IconeRelogio />
      <p>{t.lembrete.texto(stats.streak_atual)}</p>
      {location.pathname !== '/' && (
        <NavLink to="/" className="link-btn">
          {t.lembrete.acao}
        </NavLink>
      )}
      <button type="button" className="lembrete__fechar" onClick={dispensar} aria-label={t.lembrete.dispensar}>
        <IconeFechar />
      </button>
    </div>
  )
}
