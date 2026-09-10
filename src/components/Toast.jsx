import { useEffect } from 'react'
import { t } from '../i18n/pt-BR'

// Aviso flutuante: "Tarefa excluída · Desfazer" (com barra de tempo) ou erro de rede/salvamento.
export function Toast({ aviso, onDesfazer, onFechar }) {
  useEffect(() => {
    if (aviso?.tipo !== 'erro') return
    const timer = setTimeout(onFechar, 6000)
    return () => clearTimeout(timer)
  }, [aviso, onFechar])

  return (
    <div className="toast-area" aria-live="polite">
      {aviso && (
        <div className="toast" key={aviso.tarefa?.id ?? aviso.texto} role={aviso.tipo === 'erro' ? 'alert' : 'status'}>
          {aviso.tipo === 'erro' && <span className="notice__tag">{t.auth.erroTag}</span>}
          <span>{aviso.tipo === 'erro' ? aviso.texto : t.tarefas.excluida}</span>
          {aviso.tipo === 'desfazer' && (
            <>
              <button type="button" className="link-btn" onClick={onDesfazer}>
                {t.tarefas.desfazer}
              </button>
              <span className="toast__tempo" aria-hidden="true" />
            </>
          )}
        </div>
      )}
    </div>
  )
}
