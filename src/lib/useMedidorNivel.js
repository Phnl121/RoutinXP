import { useEffect, useState } from 'react'
import { calcularNivel } from './nivel'

// Tempo da barra enchendo (igual à transição de .xp__fill) + a pausa cheia antes de virar o nível.
const ENCHER_E_SEGURAR = 700 + 750

// Medidor de nível que sobe em dois tempos: ao passar de nível, a barra enche no nível
// antigo, segura, e só então vira para o novo (sem transição) com o selo pulsando.
// `ativo` falso (estatísticas ainda carregando) sincroniza sem animar.
export function useMedidorNivel(xpTotal, ativo) {
  const [anterior, setAnterior] = useState({ xp: xpTotal, ativo })
  const [cheio, setCheio] = useState(null)
  const [instantaneo, setInstantaneo] = useState(false)
  const [subiu, setSubiu] = useState(false)

  if (anterior.xp !== xpTotal || anterior.ativo !== ativo) {
    const antes = calcularNivel(anterior.xp)
    const depois = calcularNivel(xpTotal)
    setAnterior({ xp: xpTotal, ativo })
    if (anterior.ativo && ativo && depois.nivel > antes.nivel) setCheio({ nivel: antes.nivel, meta: antes.meta })
  }

  useEffect(() => {
    if (!cheio) return undefined
    const timer = setTimeout(() => {
      setInstantaneo(true)
      setCheio(null)
      setSubiu(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setInstantaneo(false)))
    }, ENCHER_E_SEGURAR)
    return () => clearTimeout(timer)
  }, [cheio])

  const info = calcularNivel(xpTotal)
  const barra = cheio ? { nivel: cheio.nivel, xpNoNivel: cheio.meta, meta: cheio.meta } : info
  return { nivel: barra.nivel, xpNoNivel: barra.xpNoNivel, meta: barra.meta, instantaneo, animar: subiu }
}
