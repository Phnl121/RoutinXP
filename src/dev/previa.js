// Pré-visualização só de desenvolvimento: `npm run dev` e abra /?previa.
// Troca o Supabase por dados fictícios em memória, para capturas de tela e revisão visual
// sem precisar de login. Em produção `emPrevia` é sempre false e este módulo não entra no build.

export const emPrevia =
  import.meta.env.DEV && typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('previa')

export const sessaoPrevia = { user: { id: 'previa', email: 'ana.souza@exemplo.com' } }

const hoje = new Date()
const dia = (n) => {
  const d = new Date(hoje)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
const instante = (minutosAtras) => new Date(hoje.getTime() - minutosAtras * 60000).toISOString()
let seq = 100
const novoId = () => `previa-${seq++}`

let categorias = [
  { id: 'c1', nome: 'Faculdade', cor: '#6c9be8', created_at: instante(900) },
  { id: 'c2', nome: 'Projetos Pessoais', cor: '#5fc4c0', created_at: instante(880) },
  { id: 'c3', nome: 'Trabalho', cor: '#e0a050', created_at: instante(870) },
  { id: 'c4', nome: 'Vida Pessoal', cor: '#e27d8f', created_at: instante(860) },
]

const tarefa = (id, titulo, category_id, data_prevista, concluidaHaMin = null, xp = 10) => ({
  id,
  titulo,
  category_id,
  data_prevista,
  status: concluidaHaMin === null ? 'pendente' : 'concluida',
  completed_at: concluidaHaMin === null ? null : instante(concluidaHaMin),
  xp_value: xp,
  created_at: instante(800 - Number(id.slice(1))),
})

let tarefas = [
  tarefa('t1', 'Responder e-mail do orientador', 'c1', dia(1)),
  tarefa('t2', 'Entregar relatório de Cálculo II', 'c1', dia(2)),
  tarefa('t3', 'Estudar capítulo 4 de Estatística', 'c1', dia(6)),
  tarefa('t4', 'Revisar slides da reunião de sexta', 'c3', dia(3)),
  tarefa('t5', 'Enviar planilha de horas', 'c3', null),
  tarefa('t6', 'Pagar conta de luz', 'c4', dia(5)),
  tarefa('t7', 'Academia às 19h', 'c4', dia(0), 30, 15),
  tarefa('t8', 'Ler artigo sobre UX', 'c2', null, 90, 10),
  tarefa('t9', 'Resumo de Direito Civil', 'c1', dia(0), 150, 15),
  tarefa('t10', 'Atualizar README do portfólio', 'c2', null, 400, 10),
]

// 690 XP = nível 4 com 240/250: uma conclusão já mostra a subida de nível.
let stats = { xp_total: 690, streak_atual: 6, streak_recorde: 14, ultima_data_conclusao: dia(0) }

// Sem timer: capturas headless (tempo virtual, iframes) resolvem na hora.
const espera = (valor) => Promise.resolve(structuredClone(valor))

// Mesma interface de src/lib/dados.js.
export const previaApi = {
  listarCategorias: () => espera([...categorias].sort((a, b) => a.nome.localeCompare(b.nome))),
  criarCategoria: ({ nome, cor }) => {
    const c = { id: novoId(), nome: nome.trim(), cor, created_at: new Date().toISOString() }
    categorias = [...categorias, c]
    return espera(c)
  },
  atualizarCategoria: (id, { nome, cor }) => {
    categorias = categorias.map((c) => (c.id === id ? { ...c, nome: nome.trim(), cor } : c))
    return espera(categorias.find((c) => c.id === id))
  },
  excluirCategoria: (id) => {
    if (tarefas.some((x) => x.category_id === id)) return Promise.reject({ code: '23503' })
    categorias = categorias.filter((c) => c.id !== id)
    return espera(null)
  },
  listarTarefas: () => espera(tarefas),
  criarTarefa: ({ titulo, categoriaId, dataPrevista }) => {
    const x = {
      id: novoId(),
      titulo: titulo.trim(),
      category_id: categoriaId,
      data_prevista: dataPrevista || null,
      status: 'pendente',
      completed_at: null,
      xp_value: 10,
      created_at: new Date().toISOString(),
    }
    tarefas = [...tarefas, x]
    return espera(x)
  },
  atualizarTarefa: (id, { titulo, categoriaId, dataPrevista }) => {
    tarefas = tarefas.map((x) =>
      x.id === id ? { ...x, titulo: titulo.trim(), category_id: categoriaId, data_prevista: dataPrevista || null } : x,
    )
    return espera(tarefas.find((x) => x.id === id))
  },
  excluirTarefa: (id) => {
    tarefas = tarefas.filter((x) => x.id !== id)
    return espera(null)
  },
  // Simula a regra do servidor (10 / +5 no prazo / 0 se recém-criada / teto 150 por dia).
  concluirTarefa: (id) => {
    const hoje = dia(0)
    const alvo = tarefas.find((x) => x.id === id)
    const recente = Date.now() - new Date(alvo.created_at).getTime() < 5 * 60000
    const xpHoje = tarefas
      .filter((x) => x.status === 'concluida' && x.completed_at?.slice(0, 10) === hoje)
      .reduce((soma, x) => soma + x.xp_value, 0)
    let xp = recente ? 0 : alvo.data_prevista && hoje <= alvo.data_prevista ? 15 : 10
    let motivo = recente ? 'recem_criada' : xp === 15 ? 'no_prazo' : 'base'
    if (!recente && xpHoje + xp > 150) {
      xp = Math.max(150 - xpHoje, 0)
      motivo = xp === 0 ? 'teto' : 'teto_parcial'
    }
    tarefas = tarefas.map((x) =>
      x.id === id ? { ...x, status: 'concluida', completed_at: new Date().toISOString(), xp_value: xp } : x,
    )
    stats = { ...stats, xp_total: stats.xp_total + xp }
    return espera({
      tarefa: tarefas.find((x) => x.id === id),
      xp_ganho: xp,
      motivo,
      estatisticas: { ...stats, xp_hoje: xpHoje + xp, teto_diario: 150 },
    })
  },
  lerEstatisticas: () => espera({ ...stats, xp_hoje: 0, teto_diario: 150 }),
}
