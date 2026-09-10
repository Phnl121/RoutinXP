import { ScanBlock } from './ScanBlock'
import { hashTexto } from '../lib/hash'
import { t } from '../i18n/pt-BR'
import './BoardingPass.css'

function hojeCurto() {
  const partes = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).formatToParts(new Date())
  const dia = partes.find((p) => p.type === 'day')?.value ?? ''
  const mes = (partes.find((p) => p.type === 'month')?.value ?? '').replace('.', '')
  return `${dia} ${mes}`.toUpperCase()
}

// Cartão de embarque: segmento principal (conteúdo) + canhoto escuro separado por picote.
export function BoardingPass({ tag, email = '', children }) {
  const semente = email.trim().toLowerCase()
  const passageiro = semente.split('@')[0] || t.pass.semNome
  const numero = String(hashTexto(semente || 'rotina') % 10000).padStart(4, '0')

  return (
    <div className="pass">
      <section className="pass__main">{children}</section>
      <aside className="pass__stub" aria-hidden="true">
        <span className="tag">{tag}</span>
        <dl className="stub__fields">
          <div>
            <dt className="label">{t.pass.passageiro}</dt>
            <dd className="stub__value stub__value--name">{passageiro}</dd>
          </div>
          <div>
            <dt className="label">{t.pass.data}</dt>
            <dd className="stub__value">{hojeCurto()}</dd>
          </div>
        </dl>
        <ScanBlock seed={semente} />
        <p className="stub__foot">
          {t.app.nome} · Nº {numero}
        </p>
      </aside>
    </div>
  )
}
