import { useEffect, useRef } from 'react'

// <dialog> modal nativo: foco preso, Esc fecha, clique no fundo fecha.
// O componente abre ao montar; o pai o desmonta em onFechar.
export function Dialogo({ tituloId, onFechar, children, dialogoRef }) {
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
      onClick={(evento) => {
        if (evento.target === ref.current) ref.current.close()
      }}
    >
      <div className="dialogo__conteudo">{children}</div>
    </dialog>
  )
}
