import { useId, useRef, useState } from 'react'
import { Dialogo } from './Dialogo'
import { Aviso } from './AuthParts'
import { mensagemErroDados } from '../lib/dadosErros'
import { deMinutos, diaDe, horaDe, paraMinutos } from '../lib/agenda'
import { pedirPermissao } from '../lib/foco'
import { garantirInscricao, iosSemInstalar, permissaoAtual } from '../lib/push'
import { t } from '../i18n/pt-BR'

const e = t.agenda.evento
const REPETICOES = ['nao', 'diaria', 'semanal', 'mensal', 'anual']
const LEMBRETES = ['sem', 0, 10, 30, 60, 1440]

// Aviso sobre o lembrete: só aparece quando há lembrete e este aparelho ainda não recebe push.
function AvisoLembrete({ registrarPush }) {
  const [permissao, setPermissao] = useState(permissaoAtual)
  if (permissao === 'granted' || permissao === 'indisponivel') return null
  if (iosSemInstalar()) return <span className="hint">{e.lembreteIphone}</span>
  if (permissao === 'denied') return <span className="hint">{e.lembreteBloqueado}</span>
  return (
    <span className="hint ev-lembrete">
      {e.lembreteAtivar}{' '}
      <button
        type="button"
        className="link-btn"
        onClick={async () => {
          const nova = await pedirPermissao()
          setPermissao(nova)
          if (nova === 'granted') garantirInscricao(registrarPush).catch(() => {})
        }}
      >
        {e.ativar}
      </button>
    </span>
  )
}

// Novo evento ou edição. `inicial` traz o início sugerido (o horário tocado na grade) ou o evento.
// `ocorrencia` é o dia da repetição aberta, para "Excluir só este dia".
export function EventoDialog({
  evento,
  inicial,
  ocorrencia,
  categorias,
  registrarPush,
  onSalvar,
  onExcluir,
  onExcluirOcorrencia,
  onFechar,
}) {
  const ref = useRef(null)
  const id = useId()
  const base = evento ?? inicial
  const [titulo, setTitulo] = useState(evento?.titulo ?? '')
  const [diaTodo, setDiaTodo] = useState(Boolean(base?.dia_todo))
  const [diaInicio, setDiaInicio] = useState(diaDe(base.inicio))
  const [horaInicio, setHoraInicio] = useState(base.dia_todo ? '09:00' : horaDe(base.inicio))
  const [diaFim, setDiaFim] = useState(diaDe(base.fim))
  const [horaFim, setHoraFim] = useState(base.dia_todo ? '10:00' : horaDe(base.fim))
  const [local, setLocal] = useState(evento?.local ?? '')
  const [categoriaId, setCategoriaId] = useState(evento?.categoria_id ?? inicial?.categoria_id ?? '')
  const [repeticao, setRepeticao] = useState(evento?.repeticao ?? 'nao')
  const [repetirAte, setRepetirAte] = useState(evento?.repetir_ate ?? '')
  const [lembrete, setLembrete] = useState(evento ? (evento.lembrete_min ?? 'sem') : 'sem')
  const [descricao, setDescricao] = useState(evento?.descricao ?? '')
  const [confirmando, setConfirmando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)
  const fechar = () => ref.current?.close()
  const repete = evento && evento.repeticao !== 'nao'

  // Mudar o início leva o término junto, mantendo a duração.
  function mudarInicio(novoDia, novaHora) {
    const antes = paraMinutos(`${diaInicio}T${diaTodo ? '00:00' : horaInicio}`)
    const depois = paraMinutos(`${novoDia}T${diaTodo ? '00:00' : novaHora}`)
    const fim = deMinutos(paraMinutos(`${diaFim}T${diaTodo ? '00:00' : horaFim}`) + depois - antes)
    setDiaInicio(novoDia)
    setHoraInicio(novaHora)
    setDiaFim(diaDe(fim))
    if (!diaTodo) setHoraFim(horaDe(fim))
  }

  async function enviar(evt) {
    evt.preventDefault()
    const inicio = diaTodo ? `${diaInicio}T00:00:00` : `${diaInicio}T${horaInicio}:00`
    const fim = diaTodo ? `${diaFim}T00:00:00` : `${diaFim}T${horaFim}:00`
    if (diaTodo ? diaFim < diaInicio : paraMinutos(fim) <= paraMinutos(inicio)) return setErro(e.fimAntes)
    if (paraMinutos(fim) - paraMinutos(inicio) > 366 * 1440) return setErro(e.longoDemais)
    if (repeticao !== 'nao' && repetirAte && repetirAte < diaInicio) return setErro(e.ateAntes)
    setSalvando(true)
    setErro(null)
    try {
      await onSalvar({
        id: evento?.id,
        titulo,
        descricao,
        local,
        dia_todo: diaTodo,
        inicio,
        fim,
        categoria_id: categoriaId,
        repeticao,
        repetir_ate: repetirAte,
        lembrete_min: lembrete === 'sem' ? null : Number(lembrete),
      })
      fechar()
    } catch (falha) {
      setErro(mensagemErroDados(falha))
      setSalvando(false)
    }
  }

  async function excluir(soEste) {
    setSalvando(true)
    try {
      if (soEste) await onExcluirOcorrencia(evento, ocorrencia)
      else await onExcluir(evento)
      fechar()
    } catch (falha) {
      setErro(mensagemErroDados(falha))
      setSalvando(false)
    }
  }

  return (
    <Dialogo tituloId={`${id}-titulo`} dialogoRef={ref} onFechar={onFechar}>
      <h2 id={`${id}-titulo`} className="dialogo__titulo">
        {evento ? e.editarTitulo : e.novoTitulo}
      </h2>

      {confirmando ? (
        <div className="form">
          <p className="dialogo__texto">{e.excluirPergunta}</p>
          {erro && <Aviso>{erro}</Aviso>}
          <div className="ev-excluir">
            <button type="button" className="botao-contorno" disabled={salvando} onClick={() => excluir(true)}>
              {e.excluirSoEste}
            </button>
            <button type="button" className="dialogo__excluir" disabled={salvando} onClick={() => excluir(false)}>
              {e.excluirTodos}
            </button>
            <button type="button" className="link-btn" onClick={() => setConfirmando(false)}>
              {e.voltar}
            </button>
          </div>
        </div>
      ) : (
        <form className="form" onSubmit={enviar}>
          <div className="field">
            <label className="label" htmlFor={`${id}-t`}>
              {e.titulo}
            </label>
            <input
              id={`${id}-t`}
              className="input"
              required
              maxLength={200}
              autoFocus
              placeholder={e.tituloExemplo}
              value={titulo}
              onChange={(x) => setTitulo(x.target.value)}
            />
          </div>

          <label className="fin-marcar ev-dia-todo">
            <input
              type="checkbox"
              className="seletor__caixa"
              checked={diaTodo}
              onChange={(x) => {
                setDiaTodo(x.target.checked)
                if (!x.target.checked && diaFim === diaInicio && horaFim <= horaInicio)
                  setHoraFim(horaDe(deMinutos(paraMinutos(`${diaInicio}T${horaInicio}`) + 60)))
              }}
            />
            <span>{e.diaTodo}</span>
          </label>

          <fieldset className="ev-periodo">
            <legend className="visually-hidden">{`${e.inicio} e ${e.fim}`}</legend>
            <div className="ev-periodo__linha">
              <span className="label ev-periodo__nome" id={`${id}-ini`}>
                {e.inicio}
              </span>
              <input
                className="input"
                type="date"
                required
                aria-label={`${e.inicio}: ${e.data}`}
                value={diaInicio}
                onChange={(x) => x.target.value && mudarInicio(x.target.value, horaInicio)}
              />
              {!diaTodo && (
                <input
                  className="input"
                  type="time"
                  required
                  step={300}
                  aria-label={`${e.inicio}: ${e.hora}`}
                  value={horaInicio}
                  onChange={(x) => x.target.value && mudarInicio(diaInicio, x.target.value)}
                />
              )}
            </div>
            <div className="ev-periodo__linha">
              <span className="label ev-periodo__nome" id={`${id}-fim`}>
                {e.fim}
              </span>
              <input
                className="input"
                type="date"
                required
                min={diaInicio}
                aria-label={`${e.fim}: ${e.data}`}
                value={diaFim}
                onChange={(x) => x.target.value && setDiaFim(x.target.value)}
              />
              {!diaTodo && (
                <input
                  className="input"
                  type="time"
                  required
                  step={300}
                  aria-label={`${e.fim}: ${e.hora}`}
                  value={horaFim}
                  onChange={(x) => x.target.value && setHoraFim(x.target.value)}
                />
              )}
            </div>
          </fieldset>

          <div className="field">
            <label className="label" htmlFor={`${id}-l`}>
              {e.local}
            </label>
            <input
              id={`${id}-l`}
              className="input"
              maxLength={300}
              placeholder={e.localExemplo}
              value={local}
              onChange={(x) => setLocal(x.target.value)}
            />
          </div>

          <div className="dialogo__campos">
            <div className="field">
              <label className="label" htmlFor={`${id}-c`}>
                {e.categoria}
              </label>
              <span className="select">
                <select id={`${id}-c`} className="input" value={categoriaId} onChange={(x) => setCategoriaId(x.target.value)}>
                  <option value="">{e.semCategoria}</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </span>
            </div>
            <div className="field">
              <label className="label" htmlFor={`${id}-lb`}>
                {e.lembrete}
              </label>
              <span className="select">
                <select id={`${id}-lb`} className="input" value={lembrete} onChange={(x) => setLembrete(x.target.value)}>
                  {LEMBRETES.map((v) => (
                    <option key={v} value={v}>
                      {e.lembretes[v]}
                    </option>
                  ))}
                </select>
              </span>
            </div>
          </div>
          {lembrete !== 'sem' && (
            <div className="ev-notas">
              {diaTodo && <span className="hint">{e.lembreteDiaTodo}</span>}
              <AvisoLembrete registrarPush={registrarPush} />
            </div>
          )}

          <div className="dialogo__campos">
            <div className="field">
              <label className="label" htmlFor={`${id}-r`}>
                {e.repeticao}
              </label>
              <span className="select">
                <select id={`${id}-r`} className="input" value={repeticao} onChange={(x) => setRepeticao(x.target.value)}>
                  {REPETICOES.map((v) => (
                    <option key={v} value={v}>
                      {e.repeticoes[v]}
                    </option>
                  ))}
                </select>
              </span>
            </div>
            {repeticao !== 'nao' && (
              <div className="field">
                <label className="label" htmlFor={`${id}-ra`}>
                  {e.repetirAte}
                </label>
                <input
                  id={`${id}-ra`}
                  className="input"
                  type="date"
                  min={diaInicio}
                  aria-describedby={`${id}-rad`}
                  value={repetirAte}
                  onChange={(x) => setRepetirAte(x.target.value)}
                />
                <span className="hint" id={`${id}-rad`}>
                  {e.repetirAteDica}
                </span>
              </div>
            )}
          </div>
          {repete && <p className="hint ev-notas">{e.repeticaoAviso}</p>}

          <div className="field">
            <label className="label" htmlFor={`${id}-d`}>
              {e.descricao}
            </label>
            <textarea
              id={`${id}-d`}
              className="input textarea"
              rows={3}
              maxLength={2000}
              placeholder={e.descricaoExemplo}
              value={descricao}
              onChange={(x) => setDescricao(x.target.value)}
            />
          </div>

          {erro && <Aviso>{erro}</Aviso>}

          <div className="dialogo__acoes">
            {evento && (
              <button
                type="button"
                className="dialogo__excluir"
                disabled={salvando}
                onClick={() => (repete && ocorrencia ? setConfirmando(true) : excluir(false))}
              >
                {e.excluir}
              </button>
            )}
            <button type="button" className="link-btn" onClick={fechar}>
              {e.cancelar}
            </button>
            <button className="btn" type="submit" disabled={salvando}>
              {salvando ? e.salvando : evento ? e.salvar : e.criar}
            </button>
          </div>
        </form>
      )}
    </Dialogo>
  )
}
