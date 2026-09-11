import { t } from '../i18n/pt-BR'

// Os "+XP" em voo (useConcluirComVoo), por cima de tudo.
export function VoosXp({ voos }) {
  return voos.map((voo) => (
    <span
      key={voo.seq}
      className="xp-voo-app"
      aria-hidden="true"
      style={{ left: voo.x, top: voo.y, '--dx': `${voo.dx}px`, '--dy': `${voo.dy}px` }}
      onAnimationEnd={voo.chegar}
    >
      {t.tarefas.xp(voo.xp)}
    </span>
  ))
}
