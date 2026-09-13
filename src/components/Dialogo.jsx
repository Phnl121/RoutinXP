import { useEffect, useRef } from 'react'

// <dialog> modal nativo: foco preso, Esc fecha, clique no fundo fecha.
// O componente abre ao montar; o pai o desmonta em onFechar.
// fixo: só fecha pelo botão (nem Esc nem clique no fundo), para o que não pode se perder.
export function Dialogo({ tituloId, onFechar, children, dialogoRef, fixo = false }) {
  const interno = useRef(null)
  const ref = dialogoRef ?? interno

  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
  }, [ref])

  return (
    <dialog
      ref={ref}
      className="dialogo"
      aria-labelledby={tituloId}
      onClose={onFechar}
      onCancel={(evento) => {
        if (fixo) evento.preventDefault()
      }}
      onClick={(evento) => {
        if (!fixo && evento.target === ref.current) ref.current.close()
      }}
    >
      <div className="dialogo__conteudo">{children}</div>
    </dialog>
  )
}
