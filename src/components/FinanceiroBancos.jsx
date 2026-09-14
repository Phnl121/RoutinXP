import { useId, useRef, useState } from 'react'
import { Dialogo } from './Dialogo'
import { Aviso } from './AuthParts'
import { mensagemErroDados } from '../lib/dadosErros'
import { diaBrasilia, hojeBrasilia, horaBrasilia } from '../lib/datas'
import { rotuloDia } from '../lib/dinheiro'
import { t } from '../i18n/pt-BR'

const b = t.financeiro.bancos

function quando(iso) {
  if (!iso) return b.nuncaLido
  const dia = diaBrasilia(iso)
  return b.lido(dia === hojeBrasilia() ? b.hojeAs(horaBrasilia(iso)) : b.diaAs(rotuloDia(dia), horaBrasilia(iso)))
}

// Bancos conectados pelo Open Finance (MeuPluggy): situação de cada um, ler agora e desconectar.
// Só o administrador conecta (a integração é de uso pessoal).
export function BancosConectados({ conexoes, onLer, onDesconectar }) {
  const [lendo, setLendo] = useState(false)
  const [mensagem, setMensagem] = useState(null) // { tipo: 'ok' | 'erro', texto }
  const [desconectando, setDesconectando] = useState(null)
  const conectado = conexoes.length > 0

  // modo: 'conectar' também liga os bancos novos da configuração (outro banco no MeuPluggy).
  async function ler(modo = conectado ? 'sincronizar' : 'conectar') {
    setLendo(true)
    setMensagem(null)
    try {
      const resumo = await onLer(modo)
      setMensagem({ tipo: resumo.erros?.length ? 'erro' : 'ok', texto: resumo.erros?.length ? b.erroItem : b.resultado(resumo.importados, resumo.duplicatas, resumo.categorizados) })
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: b.erros[e?.codigoBanco] ?? b.erros.falha })
    } finally {
      setLendo(false)
    }
  }

  return (
    <section className="panel fin-resumo fin-bancos" aria-labelledby="fin-bancos">
      <h2 id="fin-bancos" className="label">
        {b.titulo}
      </h2>
      {conectado ? (
        <ul className="fin-bancos__lista">
          {conexoes.map((c) => (
            <li key={c.id} className="fin-bancos__item">
              <span className="fin-bancos__quem">
                <span className="fin-bancos__nome">{c.banco ?? c.item_id.slice(0, 8)}</span>
                <span className="hint" data-erro={Boolean(c.ultimo_erro)}>
                  {c.ultimo_erro ? b.erroItem : quando(c.ultima_sync)}
                  {!c.ultimo_erro && c.consentimento_expira ? ` · ${b.consentimento(rotuloDia(diaBrasilia(c.consentimento_expira)))}` : ''}
                </span>
              </span>
              <button type="button" className="link-btn" onClick={() => setDesconectando(c)}>
                {b.desconectar}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="hint fin-bancos__convite">{b.convite}</p>
      )}
      <div className="fin-bancos__pe">
        <button type="button" className={conectado ? 'botao-contorno fin-bancos__botao' : 'btn fin-bancos__botao'} onClick={() => ler()} disabled={lendo}>
          {lendo ? (conectado ? b.atualizando : b.conectando) : conectado ? b.atualizar : b.conectar}
        </button>
        {conectado && (
          <button type="button" className="link-btn" onClick={() => ler('conectar')} disabled={lendo}>
            {b.conectarOutro}
          </button>
        )}
        <p className="hint fin-bancos__mensagem" role="status" data-erro={mensagem?.tipo === 'erro'}>
          {mensagem?.texto ?? ''}
        </p>
      </div>
      {desconectando && (
        <DesconectarDialog conexao={desconectando} onConfirmar={onDesconectar} onFechar={() => setDesconectando(null)} />
      )}
    </section>
  )
}

function DesconectarDialog({ conexao, onConfirmar, onFechar }) {
  const id = useId()
  const ref = useRef(null)
  const [apagar, setApagar] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const fechar = () => ref.current?.close()

  async function confirmar(evento) {
    evento.preventDefault()
    setEnviando(true)
    setErro(null)
    try {
      await onConfirmar(conexao, apagar)
      fechar()
    } catch (e) {
      setErro(mensagemErroDados(e))
      setEnviando(false)
    }
  }

  return (
    <Dialogo tituloId={`${id}-titulo`} dialogoRef={ref} onFechar={onFechar}>
      <h2 id={`${id}-titulo`} className="dialogo__titulo">
        {b.desconectarTitulo(conexao.banco ?? conexao.item_id.slice(0, 8))}
      </h2>
      <p className="dialogo__texto">{b.desconectarTexto}</p>
      <form className="form" onSubmit={confirmar}>
        <fieldset className="opcoes-remover">
          <label className="opcao">
            <input type="radio" name={`${id}-o`} checked={!apagar} onChange={() => setApagar(false)} />
            {b.manter}
          </label>
          <label className="opcao">
            <input type="radio" name={`${id}-o`} checked={apagar} onChange={() => setApagar(true)} />
            {b.apagar}
          </label>
        </fieldset>
        {erro && <Aviso>{erro}</Aviso>}
        {/* Desconectar não é um botão roxo: é destrutivo, fica na ação de texto. */}
        <div className="dialogo__acoes">
          <button type="submit" className="dialogo__excluir" disabled={enviando}>
            {b.confirmarDesconectar}
          </button>
          <button type="button" className="link-btn" onClick={fechar}>
            {b.cancelar}
          </button>
        </div>
      </form>
    </Dialogo>
  )
}
