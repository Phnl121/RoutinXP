import { IconeBaixar, IconeFechar } from './icones'
import { dispensarConvite, useConviteDispensado } from '../lib/instalacao'
import { t } from '../i18n/pt-BR'

// Convite discreto para instalar o app, só no celular (o CSS esconde no computador,
// onde o item "Instalar app" do menu basta). Dispensado uma vez, não volta.
export function ConviteInstalar({ onInstalar }) {
  const dispensado = useConviteDispensado()
  if (dispensado) return null

  return (
    <div className="lembrete convite-instalar">
      <IconeBaixar />
      <p>{t.instalar.convite}</p>
      <button type="button" className="link-btn" onClick={onInstalar}>
        {t.instalar.acao}
      </button>
      <button type="button" className="lembrete__fechar" onClick={dispensarConvite} aria-label={t.instalar.dispensar}>
        <IconeFechar />
      </button>
    </div>
  )
}
