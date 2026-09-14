import { useId, useRef, useState } from 'react'
import { chamarAdmin, FUNCOES } from '../lib/conta'
import { DEPENDEM_DE_TAREFAS, mensagemAdmin, nomeDaConta } from '../lib/admin'
import { Dialogo } from './Dialogo'
import { t } from '../i18n/pt-BR'

const ad = t.admin

// Selos de situação (neutros: nada aqui é progresso, e nada é alarme).
export function SelosConta({ conta }) {
  const selos = [
    conta.papel === 'admin' && ad.situacoes.admin,
    conta.suspenso && ad.situacoes.suspensa,
    conta.senha_provisoria && ad.situacoes.senhaProvisoria,
    !conta.autenticador && ad.situacoes.semAutenticador,
  ].filter(Boolean)
  // Sempre renderiza o contêiner, mesmo vazio, para a linha da lista manter as colunas.
  return (
    <span className="admin-selos">
      {selos.map((s) => (
        <span key={s} className="admin-selo" data-forte={s === ad.situacoes.suspensa}>
          {s}
        </span>
      ))}
    </span>
  )
}

// Interruptor neutro (ligado = trilho em Ink).
export function Interruptor({ ligado, rotulo, descricao, disabled, onMudar }) {
  return (
    <button
      type="button"
      role="switch"
      className="interruptor"
      aria-checked={ligado}
      aria-label={rotulo}
      aria-description={descricao}
      disabled={disabled}
      onClick={() => onMudar(!ligado)}
    >
      <span className="interruptor__botao" aria-hidden="true" />
    </button>
  )
}

// A senha provisória aparece uma vez, grande, com Copiar. Só fecha pelo botão (Esc e clique no
// fundo não descartam a senha sem querer).
export function SenhaProvisoriaDialogo({ email, senha, onFechar }) {
  const id = useId()
  const ref = useRef(null)
  const [copiada, setCopiada] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(senha)
      setCopiada(true)
    } catch {
      /* sem acesso à área de transferência: a senha está visível para copiar à mão */
    }
  }

  return (
    <Dialogo tituloId={`${id}-titulo`} dialogoRef={ref} onFechar={onFechar} fixo>
      <h2 id={`${id}-titulo`} className="dialogo__titulo">
        {ad.senha.titulo}
      </h2>
      <p className="dialogo__texto">{ad.senha.texto(email)}</p>
      <div className="admin-senha">
        {/* Em grupos de 4 para ler e ditar; o Copiar leva a senha sem espaços. */}
        <output className="admin-senha__valor" aria-label={ad.senha.titulo}>
          {senha.match(/.{1,4}/g).map((grupo, i) => (
            <span key={i} className="admin-senha__grupo">
              {grupo}
            </span>
          ))}
        </output>
        <button type="button" className="link-btn" onClick={copiar}>
          {copiada ? ad.senha.copiada : ad.senha.copiar}
        </button>
      </div>
      <p className="hint">{ad.senha.aviso}</p>
      <div className="dialogo__acoes">
        <button type="button" className="btn" onClick={() => ref.current?.close()}>
          {ad.senha.fechar}
        </button>
      </div>
    </Dialogo>
  )
}

// Confirmação das ações da conta. Excluir pede o e-mail digitado.
export function ConfirmarAcaoDialogo({ acao, conta, onConfirmar, onFechar }) {
  const id = useId()
  const ref = useRef(null)
  const [digitado, setDigitado] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const textos = ad.confirmar[acao]
  const quem = nomeDaConta(conta)
  const excluir = acao === 'excluir'
  const liberado = !excluir || digitado.trim().toLowerCase() === (conta.email ?? '').toLowerCase()

  async function confirmar(evento) {
    evento.preventDefault()
    if (!liberado) return
    setEnviando(true)
    setErro(null)
    try {
      await onConfirmar(excluir ? digitado.trim() : undefined)
      ref.current?.close()
    } catch (e) {
      setErro(mensagemAdmin(e))
      setEnviando(false)
    }
  }

  return (
    <Dialogo tituloId={`${id}-titulo`} dialogoRef={ref} onFechar={onFechar}>
      <h2 id={`${id}-titulo`} className="dialogo__titulo">
        {textos.titulo}
      </h2>
      <p className="dialogo__texto">{textos.texto(quem)}</p>
      <form className="form" onSubmit={confirmar}>
        {excluir && (
          <div className="field">
            <label className="label" htmlFor={`${id}-email`}>
              {textos.campo(<span className="admin-email">{conta.email}</span>)}
            </label>
            <input
              id={`${id}-email`}
              className="input"
              type="email"
              autoComplete="off"
              value={digitado}
              onChange={(e) => setDigitado(e.target.value)}
            />
          </div>
        )}
        {erro && (
          <p className="notice" role="alert">
            <span className="notice__tag">{t.auth.erroTag}</span>
            {erro}
          </p>
        )}
        {/* Destruição nunca é um botão roxo: excluir confirma pela ação de texto, como nas outras janelas. */}
        <div className="dialogo__acoes">
          {excluir && (
            <button type="submit" className="dialogo__excluir" disabled={!liberado || enviando}>
              {textos.acao}
            </button>
          )}
          <button type="button" className="link-btn" onClick={() => ref.current?.close()}>
            {ad.confirmar.cancelar}
          </button>
          {!excluir && (
            <button type="submit" className="btn" disabled={enviando}>
              {textos.acao}
            </button>
          )}
        </div>
      </form>
    </Dialogo>
  )
}

const FUNCOES_PADRAO = ['tarefas', 'agenda', 'kanban', 'calendario', 'foco', 'painel']

// Nova conta: e-mail, nome para identificar e funções. Devolve { id, email, senha }.
export function NovaContaDialogo({ onCriada, onFechar }) {
  const id = useId()
  const ref = useRef(null)
  const [email, setEmail] = useState('')
  const [nome, setNome] = useState('')
  const [funcoes, setFuncoes] = useState(FUNCOES_PADRAO)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  // Kanban e Calendário dependem de Tarefas: desligar Tarefas desliga os dois.
  const alternar = (f) =>
    setFuncoes((atual) => {
      if (!atual.includes(f)) return [...atual, f]
      const sem = atual.filter((x) => x !== f)
      return f === 'tarefas' ? sem.filter((x) => !DEPENDEM_DE_TAREFAS.includes(x)) : sem
    })

  async function criar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setErro(null)
    try {
      const r = await chamarAdmin('criar', { email: email.trim(), nome: nome.trim(), funcoes })
      onCriada(r)
      ref.current?.close()
    } catch (e) {
      setErro(mensagemAdmin(e))
      setEnviando(false)
    }
  }

  return (
    <Dialogo tituloId={`${id}-titulo`} dialogoRef={ref} onFechar={onFechar}>
      <h2 id={`${id}-titulo`} className="dialogo__titulo">
        {ad.nova.titulo}
      </h2>
      <form className="form" onSubmit={criar}>
        <div className="field">
          <label className="label" htmlFor={`${id}-email`}>
            {ad.nova.email}
          </label>
          <input
            id={`${id}-email`}
            className="input"
            type="email"
            autoComplete="off"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="label" htmlFor={`${id}-nome`}>
            {ad.nova.nome}
          </label>
          <input
            id={`${id}-nome`}
            className="input"
            autoComplete="off"
            maxLength={80}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            aria-describedby={`${id}-nome-dica`}
          />
          <p id={`${id}-nome-dica`} className="hint">
            {ad.nova.nomeDica}
          </p>
        </div>
        <fieldset className="admin-nova__funcoes">
          <legend className="label">{ad.nova.funcoes}</legend>
          {FUNCOES.map((f) => {
            const bloqueada = DEPENDEM_DE_TAREFAS.includes(f) && !funcoes.includes('tarefas')
            return (
              <label key={f} className="admin-nova__funcao" data-bloqueada={bloqueada}>
                <input
                  type="checkbox"
                  className="seletor__caixa"
                  checked={funcoes.includes(f)}
                  disabled={bloqueada}
                  onChange={() => alternar(f)}
                />
                <span>{ad.funcoes.nomes[f]}</span>
              </label>
            )
          })}
        </fieldset>
        {erro && (
          <p className="notice" role="alert">
            <span className="notice__tag">{t.auth.erroTag}</span>
            {erro}
          </p>
        )}
        <div className="dialogo__acoes">
          <button type="button" className="link-btn" onClick={() => ref.current?.close()}>
            {ad.nova.cancelar}
          </button>
          <button type="submit" className="btn" disabled={enviando}>
            {enviando ? ad.nova.criando : ad.nova.criar}
          </button>
        </div>
      </form>
    </Dialogo>
  )
}
