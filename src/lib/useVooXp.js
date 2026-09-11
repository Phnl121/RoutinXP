import { useState } from 'react'
import { calcularNivel } from './nivel'

// Conclui e faz o "+XP" voar da tarefa até o contador da barra superior (Tarefas e Foco).
// As estatísticas novas só entram quando o voo chega (o número conta e a barra enche);
// se o nível subir, o aviso aparece depois que a barra enche e vira.
export function useConcluirComVoo(d) {
  const [voos, setVoos] = useState([]) // "+XP" em voo até a barra superior

  async function concluirComVoo(id, origem) {
    const nivelAntes = calcularNivel(d.stats?.xp_total ?? 0).nivel
    const r = await d.concluir(id)
    if (!r) return
    const aplicar = () => {
      d.aplicarEstatisticas(r.estatisticas)
      const nivelDepois = calcularNivel(r.estatisticas?.xp_total ?? 0).nivel
      if (nivelDepois > nivelAntes) setTimeout(() => d.avisar({ tipo: 'nivel', nivel: nivelDepois }), 1500)
    }
    const alvo = document.querySelector('.topo .xp__valor')?.getBoundingClientRect()
    if (r.xp > 0 && origem && alvo) {
      const x = origem.left + origem.width / 2
      const y = origem.top + origem.height / 2 - 10
      let chegou = false
      const voo = { seq: `${id}-${Date.now()}`, x, y, dx: alvo.left - x, dy: alvo.top - y, xp: r.xp }
      voo.chegar = () => {
        if (chegou) return
        chegou = true
        setVoos((v) => v.filter((outro) => outro.seq !== voo.seq))
        aplicar()
      }
      setVoos((v) => [...v, voo])
      // Garantia caso a animação não termine (aba em segundo plano).
      setTimeout(voo.chegar, 850)
    } else {
      aplicar()
    }
  }

  return { concluirComVoo, voos }
}
