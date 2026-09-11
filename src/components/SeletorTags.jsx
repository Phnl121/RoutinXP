import { useId, useState } from 'react'
import { Aviso } from './AuthParts'
import { IconeFechar, IconeMais } from './icones'
import { mensagemErroDados } from '../lib/dadosErros'
import { t } from '../i18n/pt-BR'

const f = t.formTarefa
const CORES = t.formCategoria.cores

// Tags da tarefa: cada tag é um botão que liga/desliga (seleção neutra, nunca roxa).
// "Nova tag" abre uma linha simples aqui mesmo (sem caixa, sem segundo botão roxo);
// a tag criada já entra marcada.
export function SeletorTags({ tags, selecionadas, onAlternar, onCriar }) {
  const id = useId()
  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState('')
  const [cor, setCor] = useState(CORES[0].valor)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)

  function cancelar() {
    setCriando(false)
    setNome('')
    setErro(null)
  }

  async function criar() {
    if (!nome.trim() || salvando) return
    setSalvando(true)
    setErro(null)
    try {
      const tag = await onCriar({ nome, cor })
      onAlternar(tag.id, true)
      cancelar()
    } catch (e) {
      setErro(mensagemErroDados(e))
    }
    setSalvando(false)
  }

  return (
    <fieldset className="tags-campo">
      <legend className="label">{f.tags}</legend>
      {tags.length === 0 && !criando && <p className="hint">{f.semTags}</p>}
      <div className="tags-opcoes">
        {tags.map((tag) => {
          const marcada = selecionadas.includes(tag.id)
          return (
            <button key={tag.id} type="button" className="tag-chip" aria-pressed={marcada} onClick={() => onAlternar(tag.id, !marcada)}>
              <span className="tag-marca" style={{ '--c': tag.cor }} />
              {tag.nome}
            </button>
          )
        })}
        {!criando && (
          <button type="button" className="tag-chip tag-chip--nova" onClick={() => setCriando(true)}>
            <IconeMais />
            {f.novaTag}
          </button>
        )}
      </div>

      {criando && (
        <div className="tag-nova">
          <div className="tag-nova__linha">
            <input
              className="input"
              aria-label={f.nomeTag}
              placeholder={f.nomeTag}
              maxLength={40}
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => {
                // Enter cria a tag, sem enviar o formulário da tarefa; Esc fecha só esta linha.
                if (e.key === 'Enter') {
                  e.preventDefault()
                  criar()
                }
                if (e.key === 'Escape') {
                  e.preventDefault()
                  e.stopPropagation()
                  cancelar()
                }
              }}
            />
            <button type="button" className="link-btn" onClick={criar} disabled={salvando || !nome.trim()}>
              {f.criarTag}
            </button>
            <button type="button" className="lembrete__fechar" onClick={cancelar} aria-label={f.cancelarTag}>
              <IconeFechar />
            </button>
          </div>
          <div className="cores__opcoes" role="radiogroup" aria-label={f.corTag}>
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
          {erro && <Aviso>{erro}</Aviso>}
        </div>
      )}
    </fieldset>
  )
}
