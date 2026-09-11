import { useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import { IconeFechar, IconeRelogio } from './icones'
import { contarPrazos } from '../lib/lembrete'
import { hojeBrasilia } from '../lib/datas'
import { t } from '../i18n/pt-BR'

const p = t.prazosAviso

// Aviso no topo quando há tarefas para hoje ou atrasadas. Some até amanhã ao dispensar.
export function LembretePrazos({ tarefas }) {
  const hoje = hojeBrasilia()
  const chave = `routinxp:prazos:${hoje}`
  const location = useLocation()
  const [dispensado, setDispensado] = useState(() => {
    try {
      return localStorage.getItem(chave) === '1'
    } catch {
      return false
    }
  })

  const { paraHoje, atrasadas } = contarPrazos(tarefas, hoje)
  if ((!paraHoje && !atrasadas) || dispensado) return null

  function dispensar() {
    setDispensado(true)
    try {
      localStorage.setItem(chave, '1')
    } catch {
      /* sem armazenamento: some só nesta sessão */
    }
  }

  return (
    <div className="lembrete lembrete--prazos" role="status">
      <IconeRelogio />
      <p>{p.texto(paraHoje, atrasadas)}</p>
      {location.pathname !== '/' && (
        <NavLink to="/" className="link-btn">
          {p.acao}
        </NavLink>
      )}
      <button type="button" className="lembrete__fechar" onClick={dispensar} aria-label={p.dispensar}>
        <IconeFechar />
      </button>
    </div>
  )
}
