import { useRef } from 'react'
import { Dialogo } from './Dialogo'
import { IconeCompartilhar } from './icones'
import { dispensarConvite } from '../lib/instalacao'
import { t } from '../i18n/pt-BR'

const i = t.instalar.ios

// iPhone e iPad não têm botão de instalar: o Safari instala pelo menu Compartilhar.
export function DialogoInstalarIos({ onFechar }) {
  const ref = useRef(null)
  return (
    <Dialogo tituloId="instalar-ios-titulo" onFechar={onFechar} dialogoRef={ref}>
      <h2 id="instalar-ios-titulo" className="dialogo__titulo">
        {i.titulo}
      </h2>
      <p className="dialogo__texto">{i.texto}</p>
      <ol className="passos-ios">
        <li>
          <span className="passos-ios__icone" aria-hidden="true">
            <IconeCompartilhar />
          </span>
          {i.passo1}
        </li>
        <li>{i.passo2}</li>
        <li>{i.passo3}</li>
      </ol>
      <div className="dialogo__acoes">
        <button
          type="button"
          className="btn"
          onClick={() => {
            // No iPhone o navegador não avisa quando o app é instalado: "Entendi" encerra o convite.
            dispensarConvite()
            ref.current?.close()
          }}
        >
          {i.ok}
        </button>
      </div>
    </Dialogo>
  )
}
