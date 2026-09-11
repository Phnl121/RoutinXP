import { useState } from 'react'
import { useDadosApp } from '../lib/dadosContexto'
import { CategoriaDialog } from '../components/CategoriaDialog'
import { GerenciarTags } from '../components/GerenciarTags'
import { IconeMais } from '../components/icones'
import { t } from '../i18n/pt-BR'

const c = t.categoriasPagina

// Categorias e tags: a organização das tarefas fica aqui, fora da tela de Tarefas.
export default function Categorias() {
  const d = useDadosApp()
  const [dlg, setDlg] = useState(null) // { categoria: objeto | null }
  const pendentes = (id) => d.tarefas.filter((x) => x.category_id === id && x.status === 'pendente').length

  return (
    <main className="pagina">
      <h1 className="main__titulo">{c.titulo}</h1>

      <section className="panel pagina__painel" aria-labelledby="cat-categorias">
        <h2 id="cat-categorias" className="label">
          {c.categorias}
        </h2>
        <p className="pagina__texto">{c.texto}</p>
        {d.estado === 'carregando' ? (
          <p className="label">{t.app.carregando}</p>
        ) : d.categorias.length === 0 ? (
          <p className="hint">{c.vazio}</p>
        ) : (
          <ul className="tags-lista">
            {d.categorias.map((categoria) => (
              <li key={categoria.id} className="tags-lista__item">
                <span className="dot" style={{ background: categoria.cor }} />
                <span className="tags-lista__nome">{categoria.nome}</span>
                <span className="hint">{c.pendentes(pendentes(categoria.id))}</span>
                <button type="button" className="link-btn" onClick={() => setDlg({ categoria })} aria-label={c.editar(categoria.nome)}>
                  {t.tagsPerfil.editarCurto}
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="acao-nova tags-lista__nova" onClick={() => setDlg({ categoria: null })}>
          <IconeMais />
          {c.nova}
        </button>
      </section>

      <section className="panel pagina__painel" aria-labelledby="cat-tags">
        <h2 id="cat-tags" className="label">
          {t.tagsPerfil.titulo}
        </h2>
        <GerenciarTags tags={d.tags} tarefas={d.tarefas} onSalvar={d.salvarTag} onExcluir={d.excluirTag} />
      </section>

      {dlg && (
        <CategoriaDialog
          categoria={dlg.categoria}
          totalTarefas={dlg.categoria ? d.tarefas.filter((x) => x.category_id === dlg.categoria.id).length : 0}
          onFechar={() => setDlg(null)}
          onSalvar={d.salvarCategoria}
          onExcluir={d.excluirCategoria}
        />
      )}
    </main>
  )
}
