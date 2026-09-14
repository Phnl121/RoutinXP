import { useId, useRef, useState } from 'react'
import { Dialogo } from './Dialogo'
import { Aviso } from './AuthParts'
import { CampoValor, Segmentos } from './FinanceiroParts'
import { mensagemErroDados } from '../lib/dadosErros'
import { formatarReais, lerCentavos } from '../lib/dinheiro'
import { t } from '../i18n/pt-BR'

const o = t.controle.orcamento
const m = t.controle.meta

// Orçamento do mês (fase 6): uma barra por categoria com limite. Âmbar a partir de 80%, coral
// quando passa do limite; o estado também vem escrito, não só na cor.
export function OrcamentoMes({ linhas, onDefinir }) {
  const fora = linhas.filter((x) => x.estado === 'estourou').length
  const perto = linhas.filter((x) => x.estado === 'perto').length
  return (
    <section className="panel fin-resumo orc" id="orcamento" aria-labelledby="orc-titulo">
      <div className="fin-resumo__cabeca">
        <h2 id="orc-titulo" className="label">
          {o.titulo}
        </h2>
        <button type="button" className="link-btn" onClick={onDefinir}>
          {linhas.length ? o.editar : o.definir}
        </button>
      </div>
      {linhas.length === 0 ? (
        <p className="hint">{o.vazio}</p>
      ) : (
        <>
          <p className="fin-resumo__destaque">{o.resumo(linhas.length, perto, fora)}</p>
          <ul className="orc__lista">
            {linhas.map((x) => {
              const pct = Math.round(x.fatia * 100)
              return (
                <li key={x.categoria.id} className="orc__linha" data-estado={x.estado} style={{ '--c': x.categoria.cor }}>
                  <span className="fin-gastos__nome">
                    <span className="fin-linha__ponto" />
                    <span className="fin-gastos__texto">{x.categoria.nome}</span>
                  </span>
                  <span className="orc__pct">{pct}%</span>
                  <span className="orc__valores">{o.valores(formatarReais(x.gasto), formatarReais(x.limite))}</span>
                  <span
                    className="orc__trilho"
                    role="meter"
                    aria-valuemin={0}
                    aria-valuemax={x.limite}
                    aria-valuenow={Math.min(x.gasto, x.limite)}
                    aria-label={o.rotulo(x.categoria.nome, pct)}
                  >
                    <span className="orc__barra" style={{ width: `${Math.min(Math.max(x.fatia * 100, 1.5), 100)}%` }} />
                  </span>
                  {x.estado !== 'ok' && (
                    <span className="orc__estado">
                      {x.estado === 'estourou' ? o.passou(formatarReais(x.gasto - x.limite)) : o.perto(formatarReais(x.limite - x.gasto))}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </section>
  )
}

// Meta de poupança do mês: quanto sobrou (entradas − saídas) contra o alvo.
export function MetaPoupanca({ meta, onDefinir }) {
  return (
    <section className="panel fin-resumo meta" data-batida={Boolean(meta?.batida)} aria-labelledby="meta-titulo">
      <div className="fin-resumo__cabeca">
        <h2 id="meta-titulo" className="label">
          {m.titulo}
        </h2>
        <button type="button" className="link-btn" onClick={onDefinir}>
          {meta ? m.editar : m.definir}
        </button>
      </div>
      {!meta ? (
        <p className="hint">{m.vazio}</p>
      ) : (
        <>
          <p className="meta__numeros">
            <span className="meta__guardado" data-negativo={meta.guardado < 0}>
              {formatarReais(meta.guardado)}
            </span>
            <span className="meta__alvo">{m.de(formatarReais(meta.alvo))}</span>
          </p>
          <span
            className="meta__trilho"
            role="meter"
            aria-valuemin={0}
            aria-valuemax={Math.max(meta.alvo, 1)}
            aria-valuenow={Math.min(Math.max(meta.guardado, 0), Math.max(meta.alvo, 1))}
            aria-label={m.rotulo(Math.round(meta.fatia * 100))}
          >
            <span className="meta__barra" style={{ width: `${Math.min(meta.fatia * 100, 100)}%` }} />
          </span>
          <p className="hint meta__texto">
            {meta.tipo === 'pct' ? `${m.regraPct(meta.valor)} · ` : ''}
            {meta.alvo === 0
              ? m.semEntradas
              : meta.batida
                ? m.batida(meta.guardado > meta.alvo ? formatarReais(meta.guardado - meta.alvo) : null)
                : meta.guardado < 0
                  ? m.vermelho
                  : m.faltam(formatarReais(meta.alvo - meta.guardado))}
          </p>
        </>
      )}
    </section>
  )
}

// Definir limites: todas as categorias de despesa, com a média dos últimos meses como referência.
// Valor zerado = sem limite.
export function OrcamentoDialog({ categorias, orcamentos, medias, onSalvar, onFechar }) {
  const id = useId()
  const ref = useRef(null)
  const atual = Object.fromEntries(orcamentos.map((x) => [x.categoria_id, x.limite_centavos]))
  const lista = categorias.filter((c) => c.tipo === 'despesa' && (!c.arquivada || atual[c.id]))
  const [limites, setLimites] = useState(atual)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)
  const fechar = () => ref.current?.close()

  async function enviar(e) {
    e.preventDefault()
    setSalvando(true)
    setErro(null)
    try {
      await onSalvar(lista.filter((c) => limites[c.id] > 0).map((c) => ({ categoria_id: c.id, limite_centavos: limites[c.id] })))
      fechar()
    } catch (falha) {
      setErro(mensagemErroDados(falha))
      setSalvando(false)
    }
  }

  return (
    <Dialogo tituloId={`${id}-titulo`} dialogoRef={ref} onFechar={onFechar}>
      <h2 id={`${id}-titulo`} className="dialogo__titulo">
        {o.dialogo.titulo}
      </h2>
      <form className="form" onSubmit={enviar}>
        <p className="hint">{o.dialogo.texto}</p>
        <ul className="orc-form">
          {lista.map((c) => (
            <li key={c.id} className="orc-form__linha" style={{ '--c': c.cor }}>
              <label htmlFor={`${id}-${c.id}`} className="orc-form__nome">
                <span className="fin-linha__ponto" />
                <span>
                  {c.nome}
                  <span className="orc-form__media">
                    {medias[c.id] ? o.dialogo.media(formatarReais(medias[c.id])) : o.dialogo.semMedia}
                  </span>
                </span>
              </label>
              <input
                id={`${id}-${c.id}`}
                className="input fin-valor orc-form__valor"
                inputMode="numeric"
                autoComplete="off"
                placeholder={o.dialogo.semLimite}
                value={limites[c.id] ? formatarReais(limites[c.id]) : ''}
                onChange={(e) => setLimites((l) => ({ ...l, [c.id]: lerCentavos(e.target.value) }))}
                onFocus={(e) => requestAnimationFrame(() => e.target.setSelectionRange(e.target.value.length, e.target.value.length))}
              />
            </li>
          ))}
        </ul>
        {erro && <Aviso>{erro}</Aviso>}
        <div className="dialogo__acoes">
          <button type="button" className="link-btn" onClick={fechar}>
            {o.dialogo.cancelar}
          </button>
          <button className="btn" type="submit" disabled={salvando}>
            {salvando ? o.dialogo.salvando : o.dialogo.salvar}
          </button>
        </div>
      </form>
    </Dialogo>
  )
}

// Meta de poupança: sem meta, uma parte das entradas do mês ou um valor fixo.
export function MetaDialog({ preferencias, onSalvar, onFechar }) {
  const id = useId()
  const ref = useRef(null)
  const [tipo, setTipo] = useState(preferencias?.meta_tipo ?? 'pct')
  const [pct, setPct] = useState(preferencias?.meta_tipo === 'pct' ? preferencias.meta_valor : 20)
  const [valor, setValor] = useState(preferencias?.meta_tipo === 'valor' ? preferencias.meta_valor : 0)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)
  const fechar = () => ref.current?.close()

  async function gravar(meta) {
    setSalvando(true)
    setErro(null)
    try {
      await onSalvar(meta)
      fechar()
    } catch (falha) {
      setErro(mensagemErroDados(falha))
      setSalvando(false)
    }
  }

  function enviar(e) {
    e.preventDefault()
    if (tipo === 'valor' && valor <= 0) {
      setErro(m.dialogo.valorVazio)
      return
    }
    gravar({ meta_tipo: tipo, meta_valor: tipo === 'pct' ? Number(pct) : valor })
  }

  return (
    <Dialogo tituloId={`${id}-titulo`} dialogoRef={ref} onFechar={onFechar}>
      <h2 id={`${id}-titulo`} className="dialogo__titulo">
        {m.dialogo.titulo}
      </h2>
      <form className="form" onSubmit={enviar}>
        <p className="hint">{m.dialogo.texto}</p>
        <Segmentos
          rotulo={m.dialogo.tipo}
          valor={tipo}
          onMudar={setTipo}
          opcoes={[
            { valor: 'pct', rotulo: m.dialogo.pct },
            { valor: 'valor', rotulo: m.dialogo.valor },
          ]}
        />
        {tipo === 'pct' ? (
          <div className="field">
            <label className="label" htmlFor={`${id}-p`}>
              {m.dialogo.pctRotulo}
            </label>
            <div className="meta-form__pct">
              <input
                id={`${id}-p`}
                className="input"
                type="number"
                min={1}
                max={90}
                step={1}
                required
                value={pct}
                onChange={(e) => setPct(e.target.value)}
                aria-describedby={`${id}-p-dica`}
              />
              <span aria-hidden="true">%</span>
            </div>
            <span className="hint" id={`${id}-p-dica`}>
              {m.dialogo.pctDica}
            </span>
          </div>
        ) : (
          <CampoValor id={`${id}-v`} rotulo={m.dialogo.valorRotulo} dica={m.dialogo.valorDica} centavos={valor} onMudar={setValor} />
        )}
        {erro && <Aviso>{erro}</Aviso>}
        <div className="dialogo__acoes">
          {preferencias?.meta_tipo && (
            <button
              type="button"
              className="dialogo__excluir"
              disabled={salvando}
              onClick={() => gravar({ meta_tipo: null, meta_valor: null })}
            >
              {m.dialogo.remover}
            </button>
          )}
          <button type="button" className="link-btn" onClick={fechar}>
            {m.dialogo.cancelar}
          </button>
          <button className="btn" type="submit" disabled={salvando}>
            {salvando ? m.dialogo.salvando : m.dialogo.salvar}
          </button>
        </div>
      </form>
    </Dialogo>
  )
}
