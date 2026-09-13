import { useMemo, useState } from 'react'
import { useDadosApp } from '../lib/dadosContexto'
import { temFuncao, useConta } from '../lib/conta'
import { calcularNivel } from '../lib/nivel'
import { resumoFoco, resumoPainel } from '../lib/painel'
import { GraficoFoco } from '../components/GraficoFoco'
import { BadgeNivel, BarraXp } from '../components/Progresso'
import { GraficoBarras } from '../components/GraficoBarras'
import { GraficoCategorias } from '../components/GraficoCategorias'
import { LinhaDoTempo } from '../components/LinhaDoTempo'
import { Aviso } from '../components/AuthParts'
import { t } from '../i18n/pt-BR'
import './painel.css'

const p = t.painel

export default function Painel() {
  const d = useDadosApp()
  const conta = useConta()
  const [periodo, setPeriodo] = useState(7)

  const resumo = useMemo(() => resumoPainel(d.tarefas, d.categorias, periodo), [d.tarefas, d.categorias, periodo])
  const foco = useMemo(() => resumoFoco(d.focos, periodo), [d.focos, periodo])
  const categoriasPorId = useMemo(() => Object.fromEntries(d.categorias.map((c) => [c.id, c])), [d.categorias])

  if (d.estado === 'carregando') {
    return (
      <main className="painel">
        <p className="label">{t.app.carregando}</p>
      </main>
    )
  }
  if (d.estado === 'erro') {
    return (
      <main className="painel">
        <Aviso>{t.tarefas.erroCarregar}</Aviso>
      </main>
    )
  }

  const xpTotal = d.stats?.xp_total ?? 0
  const nivel = calcularNivel(xpTotal)
  const tituloGrafico = periodo === 7 ? p.semana : p.mes

  return (
    <main className="painel">
      <h1 className="main__titulo">{p.titulo}</h1>

      <div className="painel__grade">
        <div className="painel__coluna">
          <section className="panel painel__nivel" aria-label={t.topo.progresso}>
            <BadgeNivel nivel={nivel.nivel} />
            <BarraXp xpNoNivel={nivel.xpNoNivel} meta={nivel.meta} />
            <span className="painel__total">{p.total(xpTotal)}</span>
          </section>

          <section className="panel painel__cartao" aria-labelledby="painel-grafico">
            <header className="painel__cabeca">
              <h2 id="painel-grafico" className="label">
                {tituloGrafico}
              </h2>
              <div className="segmentos" role="group" aria-label={p.periodo.rotulo}>
                <button type="button" aria-pressed={periodo === 7} onClick={() => setPeriodo(7)}>
                  {p.periodo.sete}
                </button>
                <button type="button" aria-pressed={periodo === 30} onClick={() => setPeriodo(30)}>
                  {p.periodo.trinta}
                </button>
              </div>
            </header>
            <p className="painel__resumo">{p.resumo(resumo.concluidasNoPeriodo, resumo.xpNoPeriodo)}</p>
            <GraficoBarras dados={resumo.porDia} teto={d.stats?.teto_diario ?? 150} titulo={tituloGrafico} />
          </section>

          <section className="panel painel__cartao" aria-labelledby="painel-categorias">
            <header className="painel__cabeca">
              <div className="painel__titulos">
                <h2 id="painel-categorias" className="label">
                  {p.categorias}
                </h2>
                <span className="painel__resumo">{p.categoriasPeriodo(periodo)}</span>
              </div>
              {resumo.maisConcluida && <span className="painel__destaque">{p.maisConcluida(resumo.maisConcluida.nome)}</span>}
            </header>
            {d.categorias.length === 0 ? (
              <p className="painel__vazio">{p.semCategorias}</p>
            ) : resumo.concluidasNoPeriodo === 0 ? (
              <p className="painel__vazio">{p.semConclusoes}</p>
            ) : (
              <GraficoCategorias linhas={resumo.porCategoria} />
            )}
          </section>

          {/* Minutos de foco só para quem tem a função Foco. */}
          {temFuncao(conta, 'foco') && (
          <section className="panel painel__cartao" aria-labelledby="painel-foco">
            <header className="painel__cabeca">
              <div className="painel__titulos">
                <h2 id="painel-foco" className="label">
                  {p.foco.titulo}
                </h2>
                <span className="painel__resumo">{p.categoriasPeriodo(periodo)}</span>
              </div>
            </header>
            {foco.focos === 0 ? (
              <p className="painel__vazio">{p.foco.vazio}</p>
            ) : (
              <>
                <p className="painel__resumo">{p.foco.resumo(foco.focos, foco.minutos)}</p>
                <GraficoFoco dados={foco.porDia} titulo={p.foco.titulo} />
              </>
            )}
          </section>
          )}
        </div>

        <section className="panel painel__tempo" aria-labelledby="painel-tempo">
          <header className="painel__tempo-cabeca">
            <h2 id="painel-tempo" className="label">
              {p.linhaTempo}
            </h2>
            <dl className="painel__streaks">
              <div>
                <dt className="label">{p.streakAtual}</dt>
                <dd>{t.topo.dias(d.stats?.streak_atual ?? 0)}</dd>
              </div>
              <div>
                <dt className="label">{p.recorde}</dt>
                <dd>{t.topo.dias(d.stats?.streak_recorde ?? 0)}</dd>
              </div>
            </dl>
          </header>
          <LinhaDoTempo tarefas={d.tarefas} categoriasPorId={categoriasPorId} />
        </section>
      </div>
    </main>
  )
}
