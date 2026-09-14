import { CategoriasFinDialog, ContaFinDialog, LancamentoDialog } from './FinanceiroParts'
import { RegrasDialog } from './FinanceiroRegras'
import { Toast } from './Toast'

// Janelas do Financeiro (lançamento, conta, regras, categorias) e o aviso flutuante, iguais nas
// páginas Lançamentos e Controle. `acoes` vem de useAcoesFinanceiro.
export function FinanceiroDialogos({ d, acoes, avisoNoCanto = false }) {
  const { dlg, setDlg, aviso, fecharAviso, excluir, sugerirRegra } = acoes
  const fechar = () => setDlg(null)
  const porCategoria = d.transacoes.reduce(
    (mapa, x) => (x.categoria_id ? { ...mapa, [x.categoria_id]: (mapa[x.categoria_id] ?? 0) + 1 } : mapa),
    {},
  )

  return (
    <>
      {dlg?.tipo === 'lancamento' && (
        <LancamentoDialog
          transacao={dlg.item}
          contas={d.contas}
          categorias={d.categorias}
          manualParecido={dlg.item?.duplicata_de ? d.historico.find((x) => x.id === dlg.item.duplicata_de) : null}
          onResolverDuplicata={d.resolverDuplicata}
          onSalvar={async (transacao) => {
            await d.salvarTransacao(transacao)
            if (dlg.item?.origem === 'banco' && transacao.categoria_id && transacao.categoria_id !== dlg.item.categoria_id) {
              sugerirRegra(dlg.item, transacao.categoria_id)
            }
          }}
          onExcluir={excluir}
          onFechar={fechar}
        />
      )}
      {dlg?.tipo === 'conta' && (
        <ContaFinDialog
          conta={dlg.item}
          saldoAtual={dlg.item ? d.saldos[dlg.item.id] : undefined}
          contas={d.contas}
          onJuntar={d.juntarContas}
          onSalvar={d.salvarConta}
          onExcluir={d.excluirConta}
          onFechar={fechar}
        />
      )}
      {dlg?.tipo === 'regras' && (
        <RegrasDialog
          regras={d.regras}
          categorias={d.categorias}
          sugestao={dlg.sugestao}
          onSalvar={d.salvarRegra}
          onExcluir={d.excluirRegra}
          onAplicar={d.aplicarRegras}
          onFechar={fechar}
        />
      )}
      {dlg?.tipo === 'categorias' && (
        <CategoriasFinDialog
          categorias={d.categorias}
          transacoesPorCategoria={porCategoria}
          onSalvar={d.salvarCategoria}
          onExcluir={d.excluirCategoria}
          onFechar={fechar}
        />
      )}
      {/* Na fila "A revisar", o aviso vai para o canto e não cobre o seletor da próxima linha. */}
      <div className="fin-toast" data-fila={avisoNoCanto}>
        <Toast aviso={aviso} onFechar={fecharAviso} />
      </div>
    </>
  )
}
