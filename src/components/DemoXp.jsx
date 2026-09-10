import { useRef, useState } from 'react'
import { calcularNivel } from '../lib/nivel'
import { BadgeNivel, BarraXp } from './Progresso'
import { t } from '../i18n/pt-BR'
import './demo.css'

// 220 XP = nível 2 com 120/150. Três tarefas (+30) levam ao nível 3.
const XP_INICIAL = 220
const NIVEL_INICIAL = calcularNivel(XP_INICIAL).nivel
// Tempo que a barra fica cheia antes de virar para o próximo nível.
const PAUSA_NIVEL_CHEIO = 750
// Mesma duração da animação .xp-voo em demo.css.
const DURACAO_VOO = 600
const d = t.demo

// Espera dois quadros para religar a transição depois de um salto instantâneo.
function depoisDoProximoQuadro(fn) {
  requestAnimationFrame(() => requestAnimationFrame(fn))
}

// Demonstração do loop na tela de login: dados de exemplo, nada é salvo.
export function DemoXp({ className = '' }) {
  const [feitas, setFeitas] = useState([])
  const [xp, setXp] = useState(XP_INICIAL)
  const [cheio, setCheio] = useState(null)
  const [instantaneo, setInstantaneo] = useState(false)
  const [voos, setVoos] = useState([])
  const [anuncio, setAnuncio] = useState('')
  const xpRef = useRef(XP_INICIAL)
  const aplicados = useRef(new Set())
  const secaoRef = useRef(null)
  const alvoRef = useRef(null)

  const info = calcularNivel(xp)
  // Na subida de nível, a barra primeiro enche no nível antigo e só depois reinicia.
  const barra = cheio ? { nivel: cheio.nivel, xpNoNivel: cheio.meta, meta: cheio.meta } : info
  const subiu = !cheio && info.nivel > NIVEL_INICIAL

  function concluir(tarefa, evento) {
    if (feitas.includes(tarefa.id)) return
    setFeitas((f) => [...f, tarefa.id])

    // O "+XP" sai do rótulo da tarefa e voa até o contador de XP.
    const secao = secaoRef.current.getBoundingClientRect()
    const origem = evento.currentTarget.querySelector('.tarefa__xp').getBoundingClientRect()
    const alvo = alvoRef.current.getBoundingClientRect()
    setVoos((v) => [
      ...v,
      {
        id: tarefa.id,
        x: origem.left - secao.left,
        y: origem.top - secao.top,
        dx: alvo.left - origem.left,
        dy: alvo.top - origem.top,
        xp: tarefa.xp,
      },
    ])
    // Garantia: se a animação não terminar (aba em segundo plano, por exemplo), o XP entra mesmo assim.
    setTimeout(() => chegou(tarefa.id, tarefa.xp), DURACAO_VOO + 150)
  }

  function chegou(id, ganho) {
    if (aplicados.current.has(id)) return
    aplicados.current.add(id)
    setVoos((v) => v.filter((voo) => voo.id !== id))
    const antes = calcularNivel(xpRef.current)
    xpRef.current += ganho
    const depois = calcularNivel(xpRef.current)

    if (depois.nivel > antes.nivel) {
      setCheio({ nivel: antes.nivel, meta: antes.meta })
      setAnuncio(d.subiu(depois.nivel))
      setTimeout(() => {
        setInstantaneo(true)
        setCheio(null)
        setXp(xpRef.current)
        depoisDoProximoQuadro(() => setInstantaneo(false))
      }, PAUSA_NIVEL_CHEIO)
    } else {
      setXp(xpRef.current)
      setAnuncio(d.anuncio(ganho, depois.xpNoNivel, depois.meta))
    }
  }

  function recomecar() {
    xpRef.current = XP_INICIAL
    aplicados.current.clear()
    setInstantaneo(true)
    setFeitas([])
    setXp(XP_INICIAL)
    setAnuncio('')
    depoisDoProximoQuadro(() => setInstantaneo(false))
  }

  return (
    <section ref={secaoRef} className={`demo panel ${className}`} aria-labelledby="demo-titulo">
      <header className="demo__nivel">
        <BadgeNivel nivel={barra.nivel} animar={barra.nivel > NIVEL_INICIAL} />
        <BarraXp xpNoNivel={barra.xpNoNivel} meta={barra.meta} instantaneo={instantaneo} valorRef={alvoRef} />
      </header>

      <h2 id="demo-titulo" className="demo__titulo">
        {d.titulo}
      </h2>

      <ul className="demo__lista">
        {d.tarefas.map((tarefa) => {
          const feita = feitas.includes(tarefa.id)
          return (
            <li key={tarefa.id}>
              <button
                type="button"
                className="tarefa"
                aria-pressed={feita}
                aria-label={`${tarefa.titulo}, ${tarefa.categoria}, ${d.ganho(tarefa.xp)}`}
                disabled={feita}
                onClick={(evento) => concluir(tarefa, evento)}
              >
                <span className="tarefa__check" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none">
                    <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="tarefa__texto">
                  <span className="tarefa__titulo">{tarefa.titulo}</span>
                  <span className="tarefa__cat">
                    <span className="tarefa__dot" style={{ background: tarefa.cor }} />
                    {tarefa.categoria}
                  </span>
                </span>
                <span className="tarefa__xp">{d.ganho(tarefa.xp)}</span>
              </button>
            </li>
          )
        })}
      </ul>

      {subiu && (
        <div className="demo__subiu">
          <p>{d.subiu(info.nivel)}</p>
          <button type="button" className="link-btn" onClick={recomecar}>
            {d.recomecar}
          </button>
        </div>
      )}

      {voos.map((voo) => (
        <span
          key={voo.id}
          className="xp-voo"
          aria-hidden="true"
          style={{ left: voo.x, top: voo.y, '--dx': `${voo.dx}px`, '--dy': `${voo.dy}px` }}
          onAnimationEnd={() => chegou(voo.id, voo.xp)}
        >
          {d.ganho(voo.xp)}
        </span>
      ))}

      <p className="visually-hidden" aria-live="polite">
        {anuncio}
      </p>
    </section>
  )
}
