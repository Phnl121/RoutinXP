import { supabase } from './supabase'
import { limitesDoMes } from './dinheiro'

// Acesso aos dados do Financeiro. O banco só responde para contas com a função Financeiro
// liberada e sessão verificada; user_id vem do próprio banco (default auth.uid()).

function ok({ data, error }) {
  if (error) throw error
  return data
}

const CAMPOS_CONTA = 'id, nome, tipo, cor, saldo_inicial_centavos, saldo_inicial_em, dia_fechamento, dia_vencimento, arquivada, posicao, created_at'
const CAMPOS_CATEGORIA = 'id, nome, cor, tipo, grupo, arquivada, posicao, created_at'
const CAMPOS_TRANSACAO =
  'id, tipo, valor_centavos, data, descricao, conta_id, conta_destino_id, categoria_id, origem, recorrencia_id, referencia, parcela, created_at'
const CAMPOS_RECORRENCIA =
  'id, nome, tipo, valor_centavos, valor_variavel, frequencia, inicio, fim, parcelas, conta_id, categoria_id, ativa, created_at'

// Primeira visita: cria as categorias iniciais (não faz nada se já existirem).
export async function prepararFinanceiro() {
  ok(await supabase.rpc('fin_preparar'))
}

export async function listarContasFin() {
  return ok(await supabase.from('fin_contas').select(CAMPOS_CONTA).order('posicao').order('created_at'))
}

export async function listarCategoriasFin() {
  return ok(await supabase.from('fin_categorias').select(CAMPOS_CATEGORIA).order('posicao').order('nome'))
}

// [{ conta_id, saldo_centavos }]
export async function listarSaldosFin() {
  return ok(await supabase.rpc('fin_saldos'))
}

// Lançamentos de vários meses seguidos: o mês na tela e os anteriores do resumo.
export async function listarTransacoesDosMeses(primeiroMes, ultimoMes) {
  const inicio = limitesDoMes(primeiroMes).inicio
  const fim = limitesDoMes(ultimoMes).fim
  return ok(
    await supabase
      .from('fin_transacoes')
      .select(CAMPOS_TRANSACAO)
      .gte('data', inicio)
      .lte('data', fim)
      .order('data', { ascending: false })
      .order('created_at', { ascending: false }),
  )
}

const camposConta = (c) => ({
  nome: c.nome.trim(),
  tipo: c.tipo,
  saldo_inicial_centavos: c.saldo_inicial_centavos,
  dia_fechamento: c.tipo === 'cartao' ? c.dia_fechamento || null : null,
  dia_vencimento: c.tipo === 'cartao' ? c.dia_vencimento || null : null,
  arquivada: Boolean(c.arquivada),
})

export async function salvarContaFin(conta) {
  const consulta = conta.id
    ? supabase.from('fin_contas').update(camposConta(conta)).eq('id', conta.id)
    : supabase.from('fin_contas').insert(camposConta(conta))
  return ok(await consulta.select(CAMPOS_CONTA).single())
}

// Falha com 23503 se a conta tiver lançamentos (a tela sugere arquivar).
export async function excluirContaFin(id) {
  ok(await supabase.from('fin_contas').delete().eq('id', id))
}

const camposCategoria = (c) => ({
  nome: c.nome.trim(),
  cor: c.cor,
  tipo: c.tipo,
  grupo: c.tipo === 'despesa' ? c.grupo : null,
})

export async function salvarCategoriaFin(categoria) {
  const campos = camposCategoria(categoria)
  const consulta = categoria.id
    ? // O tipo não muda depois de criada (o banco recusa): só nome, cor e grupo.
      supabase.from('fin_categorias').update({ nome: campos.nome, cor: campos.cor, grupo: campos.grupo }).eq('id', categoria.id)
    : supabase.from('fin_categorias').insert(campos)
  return ok(await consulta.select(CAMPOS_CATEGORIA).single())
}

// Os lançamentos da categoria ficam sem categoria ("a revisar"), nada é apagado.
export async function excluirCategoriaFin(id) {
  ok(await supabase.from('fin_categorias').delete().eq('id', id))
}

const camposTransacao = (x) => ({
  tipo: x.tipo,
  valor_centavos: x.valor_centavos,
  data: x.data,
  descricao: x.descricao.trim(),
  conta_id: x.conta_id,
  conta_destino_id: x.tipo === 'transferencia' ? x.conta_destino_id : null,
  categoria_id: x.tipo === 'transferencia' ? null : x.categoria_id || null,
})

export async function salvarTransacaoFin(transacao) {
  const consulta = transacao.id
    ? supabase.from('fin_transacoes').update(camposTransacao(transacao)).eq('id', transacao.id)
    : supabase.from('fin_transacoes').insert(camposTransacao(transacao))
  return ok(await consulta.select(CAMPOS_TRANSACAO).single())
}

export async function excluirTransacaoFin(id) {
  ok(await supabase.from('fin_transacoes').delete().eq('id', id))
}

// ---------- Gastos fixos (fase 3) ----------

export async function listarRecorrencias() {
  return ok(await supabase.from('fin_recorrencias').select(CAMPOS_RECORRENCIA).order('created_at'))
}

const camposRecorrencia = (x) => ({
  nome: x.nome.trim(),
  tipo: x.tipo,
  valor_centavos: x.valor_centavos,
  valor_variavel: x.tipo === 'parcelada' ? false : Boolean(x.valor_variavel),
  frequencia: x.tipo === 'parcelada' ? 'mensal' : x.frequencia,
  inicio: x.inicio,
  fim: x.tipo === 'parcelada' ? null : x.fim || null,
  parcelas: x.tipo === 'parcelada' ? x.parcelas : null,
  conta_id: x.conta_id,
  categoria_id: x.categoria_id || null,
  ativa: x.tipo === 'parcelada' ? true : x.ativa !== false,
})

// Salva o gasto fixo; numa compra parcelada, cria ou refaz as parcelas logo em seguida.
export async function salvarRecorrencia(rec, anterior) {
  const consulta = rec.id
    ? supabase.from('fin_recorrencias').update(camposRecorrencia(rec)).eq('id', rec.id)
    : supabase.from('fin_recorrencias').insert(camposRecorrencia(rec))
  const salva = ok(await consulta.select(CAMPOS_RECORRENCIA).single())
  if (salva.tipo === 'parcelada') {
    const { error } = await supabase.rpc('fin_gerar_parcelas', { p_recorrencia: salva.id })
    // Compra nova sem parcelas não fica pela metade.
    if (error) {
      if (!rec.id) await supabase.from('fin_recorrencias').delete().eq('id', salva.id)
      // Edição: o plano volta ao anterior, para bater com as parcelas que continuam lá.
      else if (anterior) await supabase.from('fin_recorrencias').update(camposRecorrencia(anterior)).eq('id', rec.id)
      throw error
    }
  }
  return salva
}

// Excluir: as parcelas ou cobranças com data futura saem junto; as já passadas continuam nos
// lançamentos (sem o vínculo).
export async function excluirRecorrencia(id, hoje) {
  ok(await supabase.from('fin_transacoes').delete().eq('recorrencia_id', id).gt('data', hoje))
  ok(await supabase.from('fin_recorrencias').delete().eq('id', id))
}

// Lançamentos ligados a gastos fixos com cobrança entre dois dias (o que já foi pago).
export async function listarPagamentos(inicio, fim) {
  return ok(
    await supabase
      .from('fin_transacoes')
      .select(CAMPOS_TRANSACAO)
      .not('recorrencia_id', 'is', null)
      .gte('referencia', inicio)
      .lte('referencia', fim),
  )
}

// Marcar a cobrança como paga: vira uma saída ligada ao gasto fixo e ao dia da cobrança.
export async function pagarCobranca({ rec, referencia, valor_centavos, data, conta_id }) {
  return ok(
    await supabase
      .from('fin_transacoes')
      .insert({
        tipo: 'saida',
        valor_centavos,
        data,
        descricao: rec.nome,
        conta_id,
        categoria_id: rec.categoria_id,
        recorrencia_id: rec.id,
        referencia,
      })
      .select(CAMPOS_TRANSACAO)
      .single(),
  )
}
