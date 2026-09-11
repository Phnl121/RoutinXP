import { useState } from 'react'
import { TagDialog } from './CategoriaDialog'
import { IconeMais } from './icones'
import { t } from '../i18n/pt-BR'

const g = t.tagsPerfil

// Lista das tags do usuário (no Perfil): criar, renomear, trocar a cor e excluir.
export function GerenciarTags({ tags, tarefas, onSalvar, onExcluir }) {
  const [dlg, setDlg] = useState(null) // { tag: objeto | null }
  const uso = (tagId) => tarefas.filter((x) => x.tag_ids?.includes(tagId)).length

  return (
    <>
      <p className="pagina__texto">{g.texto}</p>
      {tags.length === 0 ? (
        <p className="hint">{g.vazio}</p>
      ) : (
        <ul className="tags-lista">
          {tags.map((tag) => (
            <li key={tag.id} className="tags-lista__item">
              <span className="tag-marca" style={{ '--c': tag.cor }} />
              <span className="tags-lista__nome">{tag.nome}</span>
              <span className="hint">{g.uso(uso(tag.id))}</span>
              <button type="button" className="link-btn" onClick={() => setDlg({ tag })} aria-label={g.editar(tag.nome)}>
                {g.editarCurto}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="trilho__nova tags-lista__nova" onClick={() => setDlg({ tag: null })}>
        <IconeMais />
        {g.nova}
      </button>
      {dlg && (
        <TagDialog
          tag={dlg.tag}
          totalTarefas={dlg.tag ? uso(dlg.tag.id) : 0}
          onFechar={() => setDlg(null)}
          onSalvar={onSalvar}
          onExcluir={onExcluir}
        />
      )}
    </>
  )
}
