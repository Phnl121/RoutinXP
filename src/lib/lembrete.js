// Pendentes com prazo hoje e com prazo vencido (dia de Brasília, "AAAA-MM-DD").
export function contarPrazos(tarefas, hoje) {
  let paraHoje = 0
  let atrasadas = 0
  for (const x of tarefas) {
    if (x.status !== 'pendente' || !x.data_prevista) continue
    if (x.data_prevista === hoje) paraHoje++
    else if (x.data_prevista < hoje) atrasadas++
  }
  return { paraHoje, atrasadas }
}

// Streak em risco: há sequência e nada foi concluído hoje (dia de Brasília, "AAAA-MM-DD").
export function streakEmRisco(stats, hoje) {
  return Boolean(stats && stats.streak_atual > 0 && stats.ultima_data_conclusao && stats.ultima_data_conclusao < hoje)
}
