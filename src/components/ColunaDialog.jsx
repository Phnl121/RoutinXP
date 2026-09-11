import { useId, useRef, useState } from 'react'
import { Dialogo } from './Dialogo'
import { Aviso } from './AuthParts'
import { IconeSetaDireita, IconeSetaEsquerda } from './icones'
import { mensagemErroDados } from '../lib/dadosErros'
import { t } from '../i18n/pt-BR'

const k = t.tarefas.kanban
const CORES = t.formCategoria.cores

// Criar ou editar uma coluna do Kanban: nome, cor (ou sem cor), posição e exclusão.
// Pendentes e Concluídas podem mudar de nome e cor, mas não saem do lugar nem são excluídas.
export function ColunaDialog({ coluna, vizinhas, onFechar, onSalvar, onMover, onExcluir }) {
  const ref = useRef(null)
  const id = useId()
  const [nome, setNome] = useState(coluna?.nome ?? '')
  const [cor, setCor] = useState(coluna?.cor ?? '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)
  const doMeio = !coluna || coluna.tipo === 'custom'
  const fechar = () => ref.current?.close()

  async function executar(acao) {
    setSalvando(true)
    setErro(null)
    try {
      await acao()
      fechar()
    } catch (e) {
      setErro(mensagemErroDados(e))
      setSalvando(false)
    }
  }

  return (
    <Dialogo tituloId={`${id}-titulo`} onFechar={onFechar} dialogoRef={ref}>
      <h2 id={`${id}-titulo`} className="dialogo__titulo">
        {coluna ? k.editarTitulo : k.novaTitulo}
      </h2>
      <form
        className="form"
        onSubmit={(evento) => {
          evento.preventDefault()
          executar(() => onSalvar({ id: coluna?.id, nome, cor }))
        }}
      >
        <div className="field">
          <label className="label" htmlFor={`${id}-n`}>
            {k.nome}
          </label>
          <input
            id={`${id}-n`}
            className="input"
            required
            maxLength={40}
            autoFocus
            placeholder={k.nomeExemplo}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>

        <fieldset className="cores">
          <legend className="label">{k.cor}</legend>
          <div className="cores__opcoes">
            <label className="cor cor--nenhuma" title={k.semCor}>
              <input type="radio" name={`${id}-cor`} className="visually-hidden" checked={!cor} onChange={() => setCor('')} />
              <span className="cor__amostra" />
              <span className="visually-hidden">{k.semCor}</span>
            </label>
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

        {coluna && doMeio && (vizinhas.anterior || vizinhas.proxima) && (
          <div className="coluna-mover">
            <span className="label">{k.posicao}</span>
            <button
              type="button"
              className="cal__seta"
              disabled={!vizinhas.anterior || salvando}
              onClick={() => executar(() => onMover(coluna, vizinhas.anterior))}
              aria-label={k.moverEsquerda}
            >
              <IconeSetaEsquerda />
            </button>
            <button
              type="button"
              className="cal__seta"
              disabled={!vizinhas.proxima || salvando}
              onClick={() => executar(() => onMover(coluna, vizinhas.proxima))}
              aria-label={k.moverDireita}
            >
              <IconeSetaDireita />
            </button>
          </div>
        )}

        {!doMeio && <p className="hint">{k.fixa}</p>}
        {erro && <Aviso>{erro}</Aviso>}

        <div className="dialogo__acoes">
          {coluna && doMeio && (
            <button type="button" className="dialogo__excluir" onClick={() => executar(() => onExcluir(coluna.id))}>
              {k.excluir}
            </button>
          )}
          <button type="button" className="link-btn" onClick={fechar}>
            {k.cancelar}
          </button>
          <button className="btn" type="submit" disabled={salvando}>
            {salvando ? k.salvando : coluna ? k.salvar : k.criar}
          </button>
        </div>
      </form>
    </Dialogo>
  )
}
