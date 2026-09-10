// Streak em risco: há sequência e nada foi concluído hoje (dia de Brasília, "AAAA-MM-DD").
export function streakEmRisco(stats, hoje) {
  return Boolean(stats && stats.streak_atual > 0 && stats.ultima_data_conclusao && stats.ultima_data_conclusao < hoje)
}
