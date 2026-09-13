import { useId, useRef, useState } from 'react'
import { Dialogo } from './Dialogo'
import { Aviso } from './AuthParts'
import { IconeMais } from './icones'
import { mensagemErroDados } from '../lib/dadosErros'
import { formatarReais, lerCentavos } from '../lib/dinheiro'
import { hojeBrasilia } from '../lib/datas'
import { t } from '../i18n/pt-BR'

const fin = t.financeiro
const CORES = t.formCategoria.cores

// Valor em reais digitado como numa maquininha: cada dígito entra pela direita ("4590" → R$ 45,90).
export function CampoValor({ id, rotulo, centavos, onMudar, dica, autoFocus }) {
  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {rotulo}
      </label>
      <input
        id={id}
        className="input fin-valor"
        inputMode="numeric"
        autoComplete="off"
        autoFocus={autoFocus}
        value={formatarReais(centavos)}
        aria-describedby={dica ? `${id}-dica` : undefined}
        onChange={(e) => onMudar(lerCentavos(e.target.value))}
        // O cursor fica sempre no fim: os dígitos entram pela direita.
        onFocus={(e) => requestAnimationFrame(() => e.target.setSelectionRange(e.target.value.length, e.target.value.length))}
      />
      {dica && (
        <span className="hint" id={`${id}-dica`}>
          {dica}
        </span>
      )}
    </div>
  )
}

// Seletor segmentado dentro de formulários (em fluxo, sem posição absoluta).
export function Segmentos({ rotulo, opcoes, valor, onMudar }) {
  return (
    <div className="fin-segmentos" role="group" aria-label={rotulo}>
      {opcoes.map((o) => (
        <button key={o.valor} type="button" aria-pressed={valor === o.valor} onClick={() => onMudar(o.valor)}>
          {o.rotulo}
        </button>
      ))}
    </div>
  )
}

const ativas = (lista, atualId) => lista.filter((x) => !x.arquivada || x.id === atualId)

// Novo lançamento ou edição: saída, entrada ou transferência entre contas próprias.
export function LancamentoDialog({ transacao, contas, categorias, onSalvar, onExcluir, onFechar }) {
  const f = fin.formLancamento
  const id = useId()
  const ref = useRef(null)
  const [tipo, setTipo] = useState(transacao?.tipo ?? 'saida')
  const [valor, setValor] = useState(transacao?.valor_centavos ?? 0)
  const [data, setData] = useState(transacao?.data ?? hojeBrasilia())
  const [descricao, setDescricao] = useState(transacao?.descricao ?? '')
  const contasAtivas = ativas(contas, transacao?.conta_id)
  const [contaId, setContaId] = useState(transacao?.conta_id ?? contasAtivas[0]?.id ?? '')
  const [destinoId, setDestinoId] = useState(transacao?.conta_destino_id ?? contasAtivas.find((c) => c.id !== contaId)?.id ?? '')
  const [categoriaId, setCategoriaId] = useState(transacao?.categoria_id ?? '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)
  const fechar = () => ref.current?.close()

  const tipoCategoria = tipo === 'entrada' ? 'receita' : 'despesa'
  const opcoesCategoria = ativas(categorias, transacao?.categoria_id).filter((c) => c.tipo === tipoCategoria)
  // Categoria que não combina com o tipo escolhido (trocou de Saída para Entrada) não vai junto.
  const categoriaValida = opcoesCategoria.some((c) => c.id === categoriaId) ? categoriaId : ''
  // Um lançamento que já estava sem categoria pode continuar assim; um novo precisa de uma.
  const podeSemCategoria = Boolean(transacao) && !transacao.categoria_id

  async function enviar(evento) {
    evento.preventDefault()
    if (valor <= 0) return setErro(f.semValor)
    if (tipo === 'transferencia' && contaId === destinoId) return setErro(f.mesmaConta)
    if (tipo !== 'transferencia' && !categoriaValida && !podeSemCategoria) return setErro(f.semCategoria)
    setSalvando(true)
    setErro(null)
    try {
      await onSalvar({
        id: transacao?.id,
        tipo,
        valor_centavos: valor,
        data,
        descricao,
        conta_id: contaId,
        conta_destino_id: destinoId,
        categoria_id: categoriaValida,
      })
      fechar()
    } catch (e) {
      setErro(mensagemErroDados(e))
      setSalvando(false)
    }
  }

  return (
    <Dialogo tituloId={`${id}-titulo`} dialogoRef={ref} onFechar={onFechar}>
      <h2 id={`${id}-titulo`} className="dialogo__titulo">
        {transacao ? f.editarTitulo : f.novoTitulo}
      </h2>
      <form className="form" onSubmit={enviar}>
        <Segmentos
          rotulo={f.tipo}
          valor={tipo}
          onMudar={setTipo}
          opcoes={['saida', 'entrada', 'transferencia'].map((v) => ({ valor: v, rotulo: f.tipos[v] }))}
        />

        <div className="dialogo__campos">
          <CampoValor id={`${id}-v`} rotulo={f.valor} centavos={valor} onMudar={setValor} autoFocus={!transacao} />
          <div className="field">
            <label className="label" htmlFor={`${id}-d`}>
              {f.data}
            </label>
            <input id={`${id}-d`} className="input" type="date" required value={data} onChange={(e) => setData(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor={`${id}-desc`}>
            {f.descricao}
          </label>
          <input
            id={`${id}-desc`}
            className="input"
            required
            maxLength={200}
            placeholder={f.descricaoExemplo[tipo]}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        {tipo !== 'transferencia' && (
          <div className="field">
            <label className="label" htmlFor={`${id}-c`}>
              {f.categoria}
            </label>
            <span className="select">
              <select id={`${id}-c`} className="input" value={categoriaValida} onChange={(e) => setCategoriaId(e.target.value)}>
                <option value="" disabled={!podeSemCategoria}>
                  {podeSemCategoria ? f.aRevisar : f.escolha}
                </option>
                {opcoesCategoria.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </span>
          </div>
        )}

        <div className="dialogo__campos">
          <div className="field">
            <label className="label" htmlFor={`${id}-co`}>
              {f.conta[tipo]}
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
          {tipo === 'transferencia' && (
            <div className="field">
              <label className="label" htmlFor={`${id}-cd`}>
                {f.contaDestino}
              </label>
              <span className="select">
                <select id={`${id}-cd`} className="input" required value={destinoId} onChange={(e) => setDestinoId(e.target.value)}>
                  {contasAtivas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </span>
            </div>
          )}
        </div>

        {tipo === 'transferencia' && contas.find((c) => c.id === destinoId)?.tipo === 'cartao' && <p className="hint">{f.dicaFatura}</p>}
        {tipo === 'saida' && contas.find((c) => c.id === contaId)?.tipo !== 'cartao' && /fatura/i.test(descricao) && (
          <p className="hint">{f.dicaFaturaSaida}</p>
        )}

        {erro && <Aviso>{erro}</Aviso>}

        <div className="dialogo__acoes">
          {transacao && (
            <button
              type="button"
              className="dialogo__excluir"
              onClick={() => {
                onExcluir(transacao.id)
                fechar()
              }}
            >
              {f.excluir}
            </button>
          )}
          <button type="button" className="link-btn" onClick={fechar}>
            {f.cancelar}
          </button>
          <button className="btn" type="submit" disabled={salvando}>
            {salvando ? f.salvando : transacao ? f.salvar : f.criar}
          </button>
        </div>
      </form>
    </Dialogo>
  )
}

const TIPOS_CONTA = ['corrente', 'poupanca', 'cartao', 'dinheiro']
const DIAS = Array.from({ length: 31 }, (_, i) => i + 1)

// Conta ou cartão. No cartão, o saldo inicial é a fatura em aberto (guardada como negativa).
// Na edição, o campo mostra o saldo de hoje; o saldo inicial é recalculado a partir dele.
export function ContaFinDialog({ conta, saldoAtual, onSalvar, onExcluir, onFechar }) {
  const f = fin.formConta
  const id = useId()
  const ref = useRef(null)
  const [nome, setNome] = useState(conta?.nome ?? '')
  const [tipo, setTipo] = useState(conta?.tipo ?? 'corrente')
  const atual = conta ? (saldoAtual ?? conta.saldo_inicial_centavos) : 0
  const [saldo, setSaldo] = useState(Math.abs(atual))
  // Conta com saldo negativo (cheque especial). No cartão, a fatura já é o valor devido.
  const [negativo, setNegativo] = useState(conta?.tipo !== 'cartao' && atual < 0)
  const [fechamento, setFechamento] = useState(conta?.dia_fechamento ?? '')
  const [vencimento, setVencimento] = useState(conta?.dia_vencimento ?? '')
  const [arquivada, setArquivada] = useState(Boolean(conta?.arquivada))
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)
  const fechar = () => ref.current?.close()
  const cartao = tipo === 'cartao'

  async function enviar(evento) {
    evento.preventDefault()
    setSalvando(true)
    setErro(null)
    try {
      await onSalvar({
        id: conta?.id,
        nome,
        tipo,
        // O movimento desde o saldo inicial fica igual; muda só o ponto de partida.
        saldo_inicial_centavos: (cartao || negativo ? -saldo : saldo) - (atual - (conta?.saldo_inicial_centavos ?? 0)),
        dia_fechamento: Number(fechamento) || null,
        dia_vencimento: Number(vencimento) || null,
        arquivada,
      })
      fechar()
    } catch (e) {
      setErro(mensagemErroDados(e))
      setSalvando(false)
    }
  }

  async function excluir() {
    try {
      await onExcluir(conta.id)
      fechar()
    } catch (e) {
      setErro(e?.code === '23503' ? f.emUso : mensagemErroDados(e))
    }
  }

  const seletorDia = (sufixo, rotulo, valor, mudar) => (
    <div className="field">
      <label className="label" htmlFor={`${id}-${sufixo}`}>
        {rotulo}
      </label>
      <span className="select">
        <select id={`${id}-${sufixo}`} className="input" value={valor} onChange={(e) => mudar(e.target.value)}>
          <option value="">—</option>
          {DIAS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </span>
    </div>
  )

  return (
    <Dialogo tituloId={`${id}-titulo`} dialogoRef={ref} onFechar={onFechar}>
      <h2 id={`${id}-titulo`} className="dialogo__titulo">
        {conta ? f.editarTitulo : f.novaTitulo}
      </h2>
      <form className="form" onSubmit={enviar}>
        <div className="dialogo__campos">
          <div className="field">
            <label className="label" htmlFor={`${id}-n`}>
              {f.nome}
            </label>
            <input
              id={`${id}-n`}
              className="input"
              required
              maxLength={60}
              autoFocus
              placeholder={f.nomeExemplo}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="label" htmlFor={`${id}-t`}>
              {f.tipo}
            </label>
            <span className="select">
              <select id={`${id}-t`} className="input" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {TIPOS_CONTA.map((v) => (
                  <option key={v} value={v}>
                    {fin.contas.tipos[v]}
                  </option>
                ))}
              </select>
            </span>
          </div>
        </div>

        <CampoValor
          id={`${id}-s`}
          rotulo={cartao ? f.fatura : f.saldo}
          dica={cartao ? f.faturaDica : f.saldoDica}
          centavos={saldo}
          onMudar={setSaldo}
        />

        {!cartao && (
          <label className="fin-marcar">
            <input type="checkbox" className="seletor__caixa" checked={negativo} onChange={(e) => setNegativo(e.target.checked)} />
            <span>{f.negativo}</span>
          </label>
        )}

        {cartao && (
          <div className="dialogo__campos">
            {seletorDia('fe', f.fechamento, fechamento, setFechamento)}
            {seletorDia('ve', f.vencimento, vencimento, setVencimento)}
          </div>
        )}

        {conta && (
          <label className="fin-marcar">
            <input type="checkbox" className="seletor__caixa" checked={arquivada} onChange={(e) => setArquivada(e.target.checked)} />
            <span>{f.arquivada}</span>
          </label>
        )}

        {erro && <Aviso>{erro}</Aviso>}

        <div className="dialogo__acoes">
          {conta && (
            <button type="button" className="dialogo__excluir" onClick={excluir}>
              {f.excluir}
            </button>
          )}
          <button type="button" className="link-btn" onClick={fechar}>
            {f.cancelar}
          </button>
          <button className="btn" type="submit" disabled={salvando}>
            {salvando ? f.salvando : conta ? f.salvar : f.criar}
          </button>
        </div>
      </form>
    </Dialogo>
  )
}

const GRUPOS = ['fixa', 'variavel', 'assinatura']

// Categorias financeiras numa janela só: a lista (despesas e receitas) e, ao tocar, a edição.
export function CategoriasFinDialog({ categorias, transacoesPorCategoria, onSalvar, onExcluir, onFechar }) {
  const f = fin.formCategorias
  const id = useId()
  const ref = useRef(null)
  const [editando, setEditando] = useState(null) // { categoria } | { tipo } (nova)
  const fechar = () => ref.current?.close()

  const lista = (tipo) => (
    <section className="fin-cats__grupo" aria-labelledby={`${id}-${tipo}`}>
      <h3 id={`${id}-${tipo}`} className="label">
        {tipo === 'despesa' ? f.despesas : f.receitas}
      </h3>
      <ul className="tags-lista">
        {categorias
          .filter((c) => c.tipo === tipo)
          .map((c) => (
            <li key={c.id} className="tags-lista__item">
              <span className="dot" style={{ background: c.cor }} />
              <span className="tags-lista__nome">{c.nome}</span>
              {/* Sempre presente, mesmo vazio: o Editar fica alinhado nas duas listas. */}
              <span className="hint">{c.grupo ? f.grupos[c.grupo] : ''}</span>
              <button type="button" className="link-btn" onClick={() => setEditando({ categoria: c })} aria-label={f.editar(c.nome)}>
                {t.tagsPerfil.editarCurto}
              </button>
            </li>
          ))}
      </ul>
      <button type="button" className="acao-nova tags-lista__nova" onClick={() => setEditando({ tipo })}>
        <IconeMais />
        {tipo === 'despesa' ? f.novaDespesa : f.novaReceita}
      </button>
    </section>
  )

  return (
    <Dialogo tituloId={`${id}-titulo`} dialogoRef={ref} onFechar={onFechar}>
      {editando ? (
        <EditarCategoria
          key={editando.categoria?.id ?? editando.tipo}
          tituloId={`${id}-titulo`}
          categoria={editando.categoria}
          tipo={editando.categoria?.tipo ?? editando.tipo}
          emUso={editando.categoria ? (transacoesPorCategoria[editando.categoria.id] ?? 0) : 0}
          onSalvar={onSalvar}
          onExcluir={onExcluir}
          onVoltar={() => setEditando(null)}
        />
      ) : (
        <>
          <h2 id={`${id}-titulo`} className="dialogo__titulo">
            {f.titulo}
          </h2>
          <p className="dialogo__texto">{f.texto}</p>
          <div className="fin-cats">
            {lista('despesa')}
            {lista('receita')}
          </div>
          <div className="dialogo__acoes">
            <button type="button" className="btn" onClick={fechar}>
              {f.fechar}
            </button>
          </div>
        </>
      )}
    </Dialogo>
  )
}

function EditarCategoria({ tituloId, categoria, tipo, emUso, onSalvar, onExcluir, onVoltar }) {
  const f = fin.formCategorias
  const id = useId()
  const [nome, setNome] = useState(categoria?.nome ?? '')
  const [cor, setCor] = useState(categoria?.cor ?? CORES[0].valor)
  const [grupo, setGrupo] = useState(categoria?.grupo ?? 'variavel')
  const [salvando, setSalvando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [erro, setErro] = useState(null)

  async function enviar(evento) {
    evento.preventDefault()
    setSalvando(true)
    setErro(null)
    try {
      await onSalvar({ id: categoria?.id, nome, cor, tipo, grupo })
      onVoltar()
    } catch (e) {
      setErro(e?.code === '23505' ? f.duplicada : mensagemErroDados(e))
      setSalvando(false)
    }
  }

  async function excluir() {
    // Com lançamentos, um segundo toque confirma: eles ficam sem categoria, a revisar.
    if (emUso > 0 && !confirmando) {
      setConfirmando(true)
      setErro(f.emUso(emUso))
      return
    }
    try {
      await onExcluir(categoria.id)
      onVoltar()
    } catch (e) {
      setErro(mensagemErroDados(e))
    }
  }

  return (
    <>
      <h2 id={tituloId} className="dialogo__titulo">
        {categoria ? f.editarTitulo : f.novaTitulo[tipo]}
      </h2>
      <form className="form" onSubmit={enviar}>
        <div className="field">
          <label className="label" htmlFor={`${id}-n`}>
            {f.nome}
          </label>
          <input id={`${id}-n`} className="input" required maxLength={40} autoFocus value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>

        {tipo === 'despesa' && (
          <div className="field">
            <span className="label" id={`${id}-g`}>
              {f.grupo}
            </span>
            <Segmentos rotulo={f.grupo} valor={grupo} onMudar={setGrupo} opcoes={GRUPOS.map((g) => ({ valor: g, rotulo: f.grupos[g] }))} />
          </div>
        )}

        <fieldset className="cores">
          <legend className="label">{f.cor}</legend>
          <div className="cores__opcoes">
            {CORES.map((opcao) => (
              <label key={opcao.valor} className="cor" title={opcao.nome}>
                <input
                  type="radio"
                  name={`${id}-cor`}
                  className="visually-hidden"
                  value={opcao.valor}
                  checked={cor === opcao.valor}
                  onChange={() => setCor(opcao.valor)}
                />
                <span className="cor__amostra" style={{ '--c': opcao.valor }} />
                <span className="visually-hidden">{opcao.nome}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {erro && <Aviso>{erro}</Aviso>}

        <div className="dialogo__acoes">
          {categoria && (
            <button type="button" className="dialogo__excluir" onClick={excluir}>
              {confirmando ? f.excluirConfirmar : f.excluir}
            </button>
          )}
          <button type="button" className="link-btn" onClick={onVoltar}>
            {f.voltar}
          </button>
          <button className="btn" type="submit" disabled={salvando}>
            {salvando ? f.salvando : categoria ? f.salvar : f.criar}
          </button>
        </div>
      </form>
    </>
  )
}
