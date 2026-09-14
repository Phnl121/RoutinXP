import { useCallback, useEffect, useState } from 'react'
import { combina, termoSugerido } from './regras'
import { mensagemErroDados } from './dadosErros'
import { t } from '../i18n/pt-BR'

// Janelas e avisos comuns às páginas Lançamentos e Controle: qual janela está aberta, o aviso
// flutuante, excluir com Desfazer e a sugestão de regra depois de categorizar.
export function useAcoesFinanceiro(d) {
  const [dlg, setDlg] = useState(null) // { tipo: 'lancamento' | 'conta' | 'categorias' | 'regras', item?, sugestao? }
  const [aviso, setAviso] = useState(null)
  const fecharAviso = useCallback(() => setAviso(null), [])

  // A sugestão de regra some sozinha junto com a barra de tempo do aviso (5 s).
  useEffect(() => {
    if (!aviso?.chave?.startsWith('regra-')) return undefined
    const timer = setTimeout(() => setAviso((a) => (a?.chave === aviso.chave ? null : a)), 5000)
    return () => clearTimeout(timer)
  }, [aviso])

  const { excluirTransacao, desfazerExclusao, regras } = d

  const excluir = useCallback(
    (id) => {
      excluirTransacao(id, (erro) => setAviso({ tipo: 'erro', texto: mensagemErroDados(erro) }))
      setAviso({
        tipo: 'desfazer',
        chave: `fin-${id}`,
        texto: t.financeiro.lancamentos.excluido,
        onDesfazer: () => {
          desfazerExclusao(id)
          setAviso(null)
        },
      })
    },
    [excluirTransacao, desfazerExclusao],
  )

  // Depois de escolher a categoria de um lançamento do banco: "Criar uma regra para ...?".
  const sugerirRegra = useCallback(
    (transacao, categoriaId) => {
      const termo = termoSugerido(transacao.descricao)
      if (!termo || !categoriaId) return
      // Já existe regra que pega esta descrição: não sugere outra.
      if (regras.some((regra) => combina(transacao.descricao, regra.termo))) return
      setAviso({
        tipo: 'desfazer',
        chave: `regra-${transacao.id}-${categoriaId}`,
        texto: t.financeiro.regras.categoriaSalva(termo.toUpperCase()),
        acaoTexto: t.financeiro.regras.criarRegra,
        onDesfazer: () => {
          setAviso(null)
          setDlg({ tipo: 'regras', sugestao: { termo, categoria_id: categoriaId, tipo: transacao.tipo } })
        },
      })
    },
    [regras],
  )

  return { dlg, setDlg, aviso, setAviso, fecharAviso, excluir, sugerirRegra }
}
