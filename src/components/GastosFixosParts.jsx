import { useId, useRef, useState } from 'react'
import { Dialogo } from './Dialogo'
import { Aviso } from './AuthParts'
import { CampoValor, Segmentos } from './FinanceiroParts'
import { mensagemErroDados } from '../lib/dadosErros'
import { formatarReais } from '../lib/dinheiro'
import { hojeBrasilia } from '../lib/datas'
import { t } from '../i18n/pt-BR'

const g = t.gastosFixos
const f = g.form
const TIPOS = ['assinatura', 'parcelada', 'conta', 'outro']
const PARCELAS = Array.from({ length: 71 }, (_, i) => i + 2)

// Categoria sugerida para um tipo novo: Assinaturas para assinatura, a primeira fixa para conta.
function categoriaSugerida(categorias, tipo) {
  const despesas = categorias.filter((c) => c.tipo === 'despesa' && !c.arquivada)
  if (tipo === 'parcelada') {
    const compras = despesas.find((c) => c.nome.trim().toLowerCase() === 'compras')
    if (compras) return compras.id
  }
  const grupo = tipo === 'assinatura' ? 'assinatura' : tipo === 'conta' ? 'fixa' : 'variavel'
  return (despesas.find((c) => c.grupo === grupo) ?? despesas[0])?.id ?? ''
}

// Cadastro de assinatura, compra parcelada, conta fixa ou outro gasto que se repete.
export function GastoFixoDialog({ recorrencia, contas, categorias, onSalvar, onExcluir, onFechar }) {
  const id = useId()
  const ref = useRef(null)
  const [tipo, setTipo] = useState(recorrencia?.tipo ?? 'assinatura')
  const [nome, setNome] = useState(recorrencia?.nome ?? '')
  const [valor, setValor] = useState(recorrencia?.valor_centavos ?? 0)
  const [parcelas, setParcelas] = useState(recorrencia?.parcelas ?? 12)
  const [frequencia, setFrequencia] = useState(recorrencia?.frequencia ?? 'mensal')
  const [inicio, setInicio] = useState(recorrencia?.inicio ?? hojeBrasilia())
  const [fim, setFim] = useState(recorrencia?.fim ?? '')
  const [variavel, setVariavel] = useState(Boolean(recorrencia?.valor_variavel))
  const contasAtivas = contas.filter((c) => !c.arquivada || c.id === recorrencia?.conta_id)
  const [contaId, setContaId] = useState(recorrencia?.conta_id ?? (contasAtivas.find((c) => c.tipo === 'cartao') ?? contasAtivas[0])?.id ?? '')
  const [categoriaId, setCategoriaId] = useState(recorrencia ? (recorrencia.categoria_id ?? '') : categoriaSugerida(categorias, 'assinatura'))
  const [categoriaTocada, setCategoriaTocada] = useState(Boolean(recorrencia))
  const [pausada, setPausada] = useState(recorrencia ? !recorrencia.ativa : false)
  const [salvando, setSalvando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [erro, setErro] = useState(null)
  const fechar = () => ref.current?.close()
  const parcelada = tipo === 'parcelada'
  const despesas = categorias.filter((c) => c.tipo === 'despesa' && (!c.arquivada || c.id === categoriaId))

  function mudarTipo(novo) {
    setTipo(novo)
    // Enquanto a pessoa não escolheu a categoria, ela acompanha o tipo.
    if (!categoriaTocada) setCategoriaId(categoriaSugerida(categorias, novo))
  }

  async function enviar(evento) {
    evento.preventDefault()
    if (valor <= 0) return setErro(f.semValor)
    setSalvando(true)
    setErro(null)
    try {
      await onSalvar({
        id: recorrencia?.id,
        tipo,
        nome,
        valor_centavos: valor,
        valor_variavel: variavel,
        frequencia,
        inicio,
        fim,
        parcelas: Number(parcelas),
        conta_id: contaId,
        categoria_id: categoriaId,
        ativa: !pausada,
      })
      fechar()
    } catch (e) {
      setErro(mensagemErroDados(e))
      setSalvando(false)
    }
  }

  async function excluir() {
    if (!confirmando) {
      setConfirmando(true)
      setErro(parcelada ? f.excluirAviso.parcelada : f.excluirAviso.outros)
      return
    }
    try {
      await onExcluir(recorrencia.id)
      fechar()
    } catch (e) {
      setErro(mensagemErroDados(e))
    }
  }

  return (
    <Dialogo tituloId={`${id}-titulo`} dialogoRef={ref} onFechar={onFechar}>
      <h2 id={`${id}-titulo`} className="dialogo__titulo">
        {recorrencia ? f.editarTitulo : f.novoTitulo}
      </h2>
      <form className="form" onSubmit={enviar}>
        {/* O tipo de uma compra parcelada não muda depois de criada: as parcelas já existem. */}
        {!recorrencia || recorrencia.tipo !== 'parcelada' ? (
          <Segmentos
            rotulo={f.tipo}
            valor={tipo}
            onMudar={mudarTipo}
            opcoes={TIPOS.filter((v) => !recorrencia || v !== 'parcelada').map((v) => ({ valor: v, rotulo: g.tipo[v] }))}
          />
        ) : null}

        <div className="field">
          <label className="label" htmlFor={`${id}-n`}>
            {f.nome}
          </label>
          <input
            id={`${id}-n`}
            className="input"
            required
            maxLength={60}
            autoFocus={!recorrencia}
            placeholder={f.nomeExemplo[tipo]}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <div className="dialogo__campos">
          <CampoValor id={`${id}-v`} rotulo={parcelada ? f.valorParcela : f.valor} centavos={valor} onMudar={setValor} />
          {parcelada ? (
            <div className="field">
              <label className="label" htmlFor={`${id}-p`}>
                {f.parcelas}
              </label>
              <span className="select">
                <select id={`${id}-p`} className="input" value={parcelas} onChange={(e) => setParcelas(e.target.value)}>
                  {PARCELAS.map((n) => (
                    <option key={n} value={n}>
                      {n}x
                    </option>
                  ))}
                </select>
              </span>
            </div>
          ) : (
            <div className="field">
              <label className="label" htmlFor={`${id}-fr`}>
                {f.frequencia}
              </label>
              <span className="select">
                <select id={`${id}-fr`} className="input" value={frequencia} onChange={(e) => setFrequencia(e.target.value)}>
                  {['mensal', 'anual', 'semanal'].map((v) => (
                    <option key={v} value={v}>
                      {f.frequencias[v]}
                    </option>
                  ))}
                </select>
              </span>
            </div>
          )}
        </div>
        {parcelada && valor > 0 && (
          <p className="hint gf-total">{f.totalParcelas(Number(parcelas), formatarReais(valor), formatarReais(valor * Number(parcelas)))}</p>
        )}

        <div className="dialogo__campos">
          <div className="field">
            <label className="label" htmlFor={`${id}-i`}>
              {parcelada ? f.inicioParcela : f.inicio}
            </label>
            <input id={`${id}-i`} className="input" type="date" required value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </div>
          {!parcelada && (
            <div className="field">
              <label className="label" htmlFor={`${id}-fim`}>
                {f.fim}
              </label>
              <input id={`${id}-fim`} className="input" type="date" min={inicio} value={fim} onChange={(e) => setFim(e.target.value)} />
            </div>
          )}
        </div>
        <p className="hint gf-dica">{parcelada ? f.inicioParcelaDica : f.inicioDica}</p>

        <div className="dialogo__campos">
          <div className="field">
            <label className="label" htmlFor={`${id}-c`}>
              {f.categoria}
            </label>
            <span className="select">
              <select
                id={`${id}-c`}
                className="input"
                value={categoriaId}
                onChange={(e) => {
                  setCategoriaId(e.target.value)
                  setCategoriaTocada(true)
                }}
              >
                <option value="">{t.financeiro.formLancamento.aRevisar}</option>
                {despesas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </span>
          </div>
          <div className="field">
            <label className="label" htmlFor={`${id}-co`}>
              {f.conta}
            </label>
            <span className="select">
              <select id={`${id}-co`} className="input" required value={contaId} onChange={(e) => setContaId(e.target.value)}>
                {contasAtivas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </span>
          </div>
        </div>

        {!parcelada && (
          <label className="fin-marcar">
            <input type="checkbox" className="seletor__caixa" checked={variavel} onChange={(e) => setVariavel(e.target.checked)} />
            <span>{f.variavel}</span>
          </label>
        )}
        {recorrencia && !parcelada && (
          <label className="fin-marcar">
            <input type="checkbox" className="seletor__caixa" checked={pausada} onChange={(e) => setPausada(e.target.checked)} />
            <span>{f.ativa}</span>
          </label>
        )}

        {erro && <Aviso>{erro}</Aviso>}

        <div className="dialogo__acoes">
          {recorrencia && (
            <button type="button" className="dialogo__excluir" onClick={excluir}>
              {confirmando ? f.excluirConfirmar : f.excluir}
            </button>
          )}
          <button type="button" className="link-btn" onClick={fechar}>
            {f.cancelar}
          </button>
          <button className="btn" type="submit" disabled={salvando}>
            {salvando ? f.salvando : recorrencia ? f.salvar : f.criar}
          </button>
        </div>
      </form>
    </Dialogo>
  )
}

// Confirmar o pagamento de uma cobrança com valor que varia (conta de luz): valor, data e conta.
export function PagarDialog({ recorrencia, referencia, rotuloDia, contas, onPagar, onFechar }) {
  const id = useId()
  const ref = useRef(null)
  const p = g.pagar
  const [valor, setValor] = useState(recorrencia.valor_centavos)
  const hoje = hojeBrasilia()
  const [data, setData] = useState(hoje)
  const [contaId, setContaId] = useState(recorrencia.conta_id)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)
  const fechar = () => ref.current?.close()

  async function enviar(evento) {
    evento.preventDefault()
    if (valor <= 0) return setErro(f.semValor)
    setSalvando(true)
    setErro(null)
    try {
      await onPagar({ rec: recorrencia, referencia, valor_centavos: valor, data, conta_id: contaId })
      fechar()
    } catch (e) {
      setErro(mensagemErroDados(e))
      setSalvando(false)
    }
  }

  return (
    <Dialogo tituloId={`${id}-titulo`} dialogoRef={ref} onFechar={onFechar}>
      <h2 id={`${id}-titulo`} className="dialogo__titulo">
        {p.titulo(recorrencia.nome)}
      </h2>
      <p className="dialogo__texto">{p.texto(rotuloDia)}</p>
      <form className="form" onSubmit={enviar}>
        <div className="dialogo__campos">
          <CampoValor id={`${id}-v`} rotulo={p.valor} centavos={valor} onMudar={setValor} autoFocus />
          <div className="field">
            <label className="label" htmlFor={`${id}-d`}>
              {p.data}
            </label>
            <input id={`${id}-d`} className="input" type="date" required value={data} onChange={(e) => setData(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor={`${id}-c`}>
            {p.conta}
          </label>
          <span className="select">
            <select id={`${id}-c`} className="input" value={contaId} onChange={(e) => setContaId(e.target.value)}>
              {contas
                .filter((c) => !c.arquivada || c.id === contaId)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
            </select>
          </span>
        </div>
        {erro && <Aviso>{erro}</Aviso>}
        <div className="dialogo__acoes">
          <button type="button" className="link-btn" onClick={fechar}>
            {f.cancelar}
          </button>
          <button className="btn" type="submit" disabled={salvando}>
            {salvando ? f.salvando : p.confirmar}
          </button>
        </div>
      </form>
    </Dialogo>
  )
}
