// Regra de nível (calculada a partir do xp_total, sem coluna no banco):
// cada nível pede 50 XP a mais que o anterior. 1→2 = 100 XP, 2→3 = 150, 3→4 = 200…
export function xpParaSubir(nivel) {
  return 100 + 50 * (nivel - 1)
}

export function calcularNivel(xpTotal) {
  let nivel = 1
  let base = 0
  while (xpTotal >= base + xpParaSubir(nivel)) {
    base += xpParaSubir(nivel)
    nivel++
  }
  const meta = xpParaSubir(nivel)
  const xpNoNivel = xpTotal - base
  return { nivel, xpNoNivel, meta, falta: meta - xpNoNivel }
}
