import { rotuloDiaMes, rotuloDiaSemana } from '../lib/painel'
import { t } from '../i18n/pt-BR'

const p = t.painel

// XP por dia: barras verdes (magnitude, um só tom), linha tracejada do teto diário,
// rótulo direto só na maior barra, dica no hover/foco e tabela para leitor de tela.
export function GraficoBarras({ dados, teto, titulo }) {
  const escala = Math.max(teto, ...dados.map((d) => d.xp), 1)
  const maior = dados.reduce((m, d) => (d.xp > m.xp ? d : m), dados[0])
  const longo = dados.length > 7
  const rotulo = (d) => (longo ? rotuloDiaMes(d.dia) : rotuloDiaSemana(d.dia))
  const mostrarEixo = (i) => !longo || (dados.length - 1 - i) % 5 === 0

  return (
    <figure className="barras">
      <div className="barras__area" data-longo={longo}>
        <div className="barras__teto" style={{ bottom: `${(teto / escala) * 100}%` }} aria-hidden="true">
          <span>{p.teto(teto)}</span>
        </div>
        {dados.map((d, i) => (
          <div
            key={d.dia}
            className="barras__coluna"
            // Dica alinhada para dentro nas pontas, para não vazar do cartão.
            data-lado={i < dados.length / 3 ? 'inicio' : i >= (dados.length * 2) / 3 ? 'fim' : undefined}
            tabIndex={0}
            aria-label={p.barra(rotuloDiaSemana(d.dia), rotuloDiaMes(d.dia), d.xp, d.concluidas)}
          >
            {d === maior && d.xp > 0 && (
              <span className="barras__valor" style={{ bottom: `calc(${(d.xp / escala) * 100}% + 0.25rem)` }} aria-hidden="true">
                {d.xp}
              </span>
            )}
            <span className="barras__barra" style={{ height: `${(d.xp / escala) * 100}%` }} aria-hidden="true" />
            <span className="barras__dica" aria-hidden="true">
              {rotuloDiaSemana(d.dia)} {rotuloDiaMes(d.dia)} · {d.xp} XP · {d.concluidas}
            </span>
          </div>
        ))}
      </div>
      <div className="barras__eixo" aria-hidden="true">
        {dados.map((d, i) => (
          <span key={d.dia}>{mostrarEixo(i) ? rotulo(d) : ''}</span>
        ))}
      </div>
      <table className="visually-hidden">
        <caption>{titulo}</caption>
        <thead>
          <tr>
            <th scope="col">{p.tabela.dia}</th>
            <th scope="col">{p.tabela.xp}</th>
            <th scope="col">{p.tabela.tarefas}</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((d) => (
            <tr key={d.dia}>
              <th scope="row">
                {rotuloDiaSemana(d.dia)} {rotuloDiaMes(d.dia)}
              </th>
              <td>{d.xp}</td>
              <td>{d.concluidas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
