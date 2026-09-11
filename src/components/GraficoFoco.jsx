import { rotuloDiaMes, rotuloDiaSemana } from '../lib/painel'
import { t } from '../i18n/pt-BR'

const pf = t.painel.foco

// Minutos de foco por dia: a mesma gramática do gráfico de XP (barras de um tom, rótulo direto
// só na maior, dica no hover e tabela para leitor de tela), sem a linha de teto.
export function GraficoFoco({ dados, titulo }) {
  const escala = Math.max(...dados.map((d) => d.minutos), 1)
  const maior = dados.reduce((m, d) => (d.minutos > m.minutos ? d : m), dados[0])
  const longo = dados.length > 7
  const rotulo = (d) => (longo ? rotuloDiaMes(d.dia) : rotuloDiaSemana(d.dia))
  const mostrarEixo = (i) => !longo || (dados.length - 1 - i) % 5 === 0

  return (
    <figure className="barras barras--foco">
      <div className="barras__area" data-longo={longo}>
        {dados.map((d, i) => (
          <div
            key={d.dia}
            className="barras__coluna"
            data-lado={i < dados.length / 3 ? 'inicio' : i >= (dados.length * 2) / 3 ? 'fim' : undefined}
            aria-hidden="true"
          >
            {d === maior && d.minutos > 0 && (
              <span className="barras__valor" style={{ bottom: `calc(${(d.minutos / escala) * 100}% + 0.25rem)` }}>
                {pf.valor(d.minutos)}
              </span>
            )}
            <span className="barras__barra" style={{ height: `${(d.minutos / escala) * 100}%` }} />
            <span className="barras__dica">{pf.barra(rotuloDiaSemana(d.dia), rotuloDiaMes(d.dia), d.minutos, d.focos)}</span>
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
            <th scope="col">{pf.tabela.dia}</th>
            <th scope="col">{pf.tabela.minutos}</th>
            <th scope="col">{pf.tabela.focos}</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((d) => (
            <tr key={d.dia}>
              <th scope="row">
                {rotuloDiaSemana(d.dia)} {rotuloDiaMes(d.dia)}
              </th>
              <td>{d.minutos}</td>
              <td>{d.focos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
