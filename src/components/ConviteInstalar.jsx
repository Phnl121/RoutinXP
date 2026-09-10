import { useState } from 'react'
import { IconeBaixar, IconeFechar } from './icones'
import { t } from '../i18n/pt-BR'

const CHAVE = 'routinxp:instalar:dispensado'

function lerDispensado() {
  try {
    return localStorage.getItem(CHAVE) === '1'
  } catch {
    return false
  }
}

// Convite discreto para instalar o app, só no celular (o CSS esconde no computador,
// onde o item "Instalar app" do menu basta). Dispensado uma vez, não volta.
export function ConviteInstalar({ onInstalar }) {
  const [dispensado, setDispensado] = useState(lerDispensado)
  if (dispensado) return null

  function dispensar() {
    setDispensado(true)
    try {
      localStorage.setItem(CHAVE, '1')
    } catch {
      /* sem armazenamento: some só nesta sessão */
    }
  }

  return (
    <div className="lembrete convite-instalar">
      <IconeBaixar />
      <p>{t.instalar.convite}</p>
      <button type="button" className="btn btn--compacto" onClick={onInstalar}>
        {t.instalar.acao}
      </button>
      <button type="button" className="lembrete__fechar" onClick={dispensar} aria-label={t.instalar.dispensar}>
        <IconeFechar />
      </button>
    </div>
  )
}
