import { useMemo } from 'react'
import { hashTexto } from '../lib/hash'

const N = 23
const C = (N - 1) / 2

function prng(semente) {
  let a = semente
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let x = Math.imul(a ^ (a >>> 15), 1 | a)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

// Padrão no estilo Aztec (o código dos cartões de embarque): alvo concêntrico
// no centro e módulos de dados derivados do texto. É decorativo, não é lido por leitor.
function modulos(texto) {
  const rnd = prng(hashTexto(texto || 'rotina'))
  const on = new Array(N * N)
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const d = Math.max(Math.abs(x - C), Math.abs(y - C))
      let v
      if (d <= 4) v = d % 2 === 0
      else if (d === 5) v = (x === C - 5 && y <= C - 4) || (y === C - 5 && x <= C - 4) || (x === C + 5 && y === C - 5)
      else v = rnd() < 0.5
      on[y * N + x] = v
    }
  }
  return on
}

const posicoes = Array.from({ length: N * N }, (_, i) => ({ x: i % N, y: Math.floor(i / N) }))

export function ScanBlock({ seed }) {
  const on = useMemo(() => modulos(seed), [seed])
  return (
    <svg className="scan" viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges" data-empty={!seed} aria-hidden="true">
      {posicoes.map(({ x, y }, i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width="1"
          height="1"
          className={on[i] ? 'on' : undefined}
          style={{ transitionDelay: `${(x + y) * 7}ms` }}
        />
      ))}
    </svg>
  )
}
