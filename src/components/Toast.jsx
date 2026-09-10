import { useEffect } from 'react'
import { t } from '../i18n/pt-BR'

// Aviso flutuante:
// - desfazer: "Tarefa excluída · Desfazer" (com barra de tempo)
// - info: regra de XP que se aplicou (ex.: tarefa recém-criada, teto diário)
// - nivel: subiu de nível
// - erro: falha de rede/salvamento
const DURACAO = { erro: 6000, info: 6000, nivel: 5000 }

export function Toast({ aviso, onDesfazer, onFechar }) {
  useEffect(() => {
    const duracao = DURACAO[aviso?.tipo]
    if (!duracao) return undefined
    const timer = setTimeout(onFechar, duracao)
    return () => clearTimeout(timer)
  }, [aviso, onFechar])

  if (!aviso) return <div className="toast-area" aria-live="polite" />

  const texto =
    aviso.tipo === 'desfazer' ? t.tarefas.excluida : aviso.tipo === 'nivel' ? t.tarefas.nivelAlcancado : aviso.texto
  const chave = aviso.tarefa?.id ?? (aviso.tipo === 'nivel' ? `nivel-${aviso.nivel}` : aviso.texto)

  return (
    <div className="toast-area" aria-live="polite">
      <div className="toast" key={chave} data-tipo={aviso.tipo} role={aviso.tipo === 'erro' ? 'alert' : 'status'}>
        {aviso.tipo === 'erro' && <span className="notice__tag">{t.auth.erroTag}</span>}
        {aviso.tipo === 'nivel' && <span className="nivel-badge">{t.nivel.rotulo(aviso.nivel)}</span>}
        <span>{texto}</span>
        {aviso.tipo === 'desfazer' && (
          <>
            <button type="button" className="link-btn" onClick={onDesfazer}>
              {t.tarefas.desfazer}
            </button>
            <span className="toast__tempo" aria-hidden="true" />
          </>
        )}
      </div>
    </div>
  )
}
