import { useState } from 'react'
import { useDadosApp } from '../lib/dadosContexto'
import { FonteDialog } from '../components/FonteDialog'
import { mensagemIntegracao } from '../lib/integracoes'
import { IconeCalendario, IconeMais } from '../components/icones'
import { Aviso } from '../components/AuthParts'
import { t } from '../i18n/pt-BR'
import './integracoes.css'

const i = t.integracoes
const relativo = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

// "há 2 horas", "ontem", "agora mesmo"
function quando(iso) {
  const minutos = Math.round((new Date(iso).getTime() - Date.now()) / 60000)
  if (minutos > -1) return i.agora
  if (minutos > -60) return relativo.format(minutos, 'minute')
  if (minutos > -60 * 24) return relativo.format(Math.round(minutos / 60), 'hour')
  return relativo.format(Math.round(minutos / (60 * 24)), 'day')
}

function textoResultado(r) {
  if (!r) return null
  if (r.pulada) return i.pulada
  if (r.erro) return i.erros[r.erro] ?? i.erros.falha
  return i.resultado(r.novas, r.atualizadas)
}

export default function Integracoes() {
  const d = useDadosApp()
  const [dlg, setDlg] = useState(null) // { fonte: objeto | null }
  const [atualizando, setAtualizando] = useState(null) // id
  const [resultados, setResultados] = useState({}) // id → texto
  const [erroGeral, setErroGeral] = useState(null)
  const categoriasPorId = Object.fromEntries(d.categorias.map((c) => [c.id, c]))
  const tagsPorId = Object.fromEntries(d.tags.map((g) => [g.id, g]))

  async function atualizar(fonteId) {
    setAtualizando(fonteId)
    setErroGeral(null)
    try {
      const r = await d.sincronizarFontes(fonteId)
      const doCalendario = r?.resultados?.find((x) => x.id === fonteId)
      setResultados((atual) => ({ ...atual, [fonteId]: textoResultado(doCalendario) }))
    } catch (e) {
      setErroGeral(mensagemIntegracao(e))
    }
    setAtualizando(null)
  }

  async function salvar(campos) {
    const salva = await d.salvarFonte(campos)
    // Ao conectar (ou trocar o link), já traz as atividades.
    if (!campos.id || campos.url) atualizar(salva.id)
    return salva
  }

  if (d.estado === 'carregando') {
    return (
      <main className="pagina">
        <p className="label">{t.app.carregando}</p>
      </main>
    )
  }

  return (
    <main className="pagina">
      <div className="main__titulo-linha">
        <h1 className="main__titulo">{i.titulo}</h1>
        {d.fontes.length > 0 && (
          <button type="button" className="btn btn--compacto" onClick={() => setDlg({ fonte: null })}>
            <IconeMais />
            {i.conectar}
          </button>
        )}
      </div>

      <section className="panel pagina__painel" aria-labelledby="int-calendarios">
        <h2 id="int-calendarios" className="label">
          {i.secao}
        </h2>
        <p className="pagina__texto">{i.texto}</p>

        {erroGeral && <Aviso>{erroGeral}</Aviso>}

        {d.fontes.length === 0 ? (
          <div className="fontes__vazio">
            <p className="hint">{i.vazio}</p>
            <button type="button" className="btn" onClick={() => setDlg({ fonte: null })}>
              <IconeMais />
              {i.conectar}
            </button>
          </div>
        ) : (
          <>
            <ul className="fontes">
              {d.fontes.map((fonte) => {
                const categoria = categoriasPorId[fonte.category_id]
                const tag = tagsPorId[fonte.tag_id]
                const ocupado = atualizando === fonte.id
                return (
                  <li key={fonte.id} className="fontes__item">
                    <span className="fontes__icone" aria-hidden="true">
                      <IconeCalendario />
                    </span>
                    <div className="fontes__texto">
                      <span className="fontes__nome">{fonte.nome}</span>
                      <span className="fontes__meta">
                        {tag && (
                          <span className="etiqueta etiqueta--estatica" style={{ '--c': tag.cor }}>
                            {tag.nome}
                          </span>
                        )}
                        {categoria && (
                          <span className="linha__cat">
                            <span className="dot" style={{ background: categoria.cor }} />
                            {categoria.nome}
                          </span>
                        )}
                        <span>{fonte.ultima_sync ? i.atualizado(quando(fonte.ultima_sync)) : i.nunca}</span>
                        <span>{i.tarefas(fonte.total_importadas)}</span>
                      </span>
                      {fonte.ultimo_erro && !resultados[fonte.id] && (
                        <span className="fontes__erro">{i.erros[fonte.ultimo_erro] ?? i.erros.falha}</span>
                      )}
                      {resultados[fonte.id] && (
                        <span className="fontes__resultado" role="status">
                          {resultados[fonte.id]}
                        </span>
                      )}
                    </div>
                    <div className="fontes__acoes">
                      <button
                        type="button"
                        className="link-btn"
                        onClick={() => atualizar(fonte.id)}
                        disabled={ocupado}
                        aria-label={i.atualizarRotulo(fonte.nome)}
                      >
                        {ocupado ? i.atualizando : i.atualizar}
                      </button>
                      <button type="button" className="link-btn" onClick={() => setDlg({ fonte })} aria-label={i.editarRotulo(fonte.nome)}>
                        {i.editar}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
            <p className="hint">{i.automatico}</p>
          </>
        )}
      </section>

      <section className="panel pagina__painel" aria-labelledby="int-como">
        <h2 id="int-como" className="label">
          {i.comoTitulo}
        </h2>
        <ol className="passos-ios">
          {i.como.map((passo) => (
            <li key={passo}>{passo}</li>
          ))}
        </ol>
        <p className="hint">{i.comoNota}</p>
      </section>

      {dlg && (
        <FonteDialog
          fonte={dlg.fonte}
          categorias={d.categorias}
          tags={d.tags}
          onFechar={() => setDlg(null)}
          onSalvar={salvar}
          onExcluir={d.excluirFonte}
          onCriarTag={d.salvarTag}
          onPrevia={d.previaFonte}
        />
      )}
    </main>
  )
}
