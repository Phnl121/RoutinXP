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
  tarefa('t23', 'Enviar comprovante de matrícula', 'c1', dia(-2)),
  tarefa('t7', 'Academia às 19h', 'c4', dia(0), 30, 15),
  tarefa('t8', 'Ler artigo sobre UX', 'c2', null, 90, 10),
  tarefa('t9', 'Resumo de Direito Civil', 'c1', dia(0), 150, 15),
  tarefa('t10', 'Atualizar README do portfólio', 'c2', null, 400, 10),
  // Histórico dos últimos dias, para o Painel ter semana e linha do tempo.
  tarefa('t11', 'Lista de exercícios de Física', 'c1', dia(-1), 1440 + 120, 15),
  tarefa('t12', 'Correr 5 km', 'c4', null, 1440 + 300, 10),
  tarefa('t13', 'Deploy da landing page', 'c2', dia(-1), 1440 + 500, 15),
  tarefa('t14', 'Fichamento de Sociologia', 'c1', dia(-1), 2880 + 200, 15),
  tarefa('t15', 'Reunião de alinhamento', 'c3', null, 2880 + 400, 10),
  tarefa('t16', 'Organizar a mesa', 'c4', null, 4320 + 60, 0),
  tarefa('t17', 'Prova de Cálculo II', 'c1', dia(-3), 4320 + 240, 15),
  tarefa('t18', 'Relatório semanal', 'c3', dia(-4), 5760 + 180, 15),
  tarefa('t19', 'Revisar pull request', 'c2', null, 5760 + 400, 10),
  tarefa('t20', 'Resumo de Anatomia', 'c1', dia(-5), 7200 + 100, 15),
  tarefa('t21', 'Planejar a semana', 'c4', null, 8640 + 200, 10),
  tarefa('t22', 'Mapa mental de História', 'c1', dia(-6), 8640 + 300, 15),
]

let tags = [
  { id: 'g1', nome: 'Urgente', cor: '#e27d8f' },
  { id: 'g2', nome: 'Leitura', cor: '#6c9be8' },
  { id: 'g3', nome: 'Em grupo', cor: '#e0a050' },
]

// Tags e descrições de algumas tarefas do exemplo.
const TAGS_EXEMPLO = { t1: ['g1'], t2: ['g1', 'g3'], t4: ['g3'], t8: ['g2'], t3: ['g2'] }
const DESCRICOES = {
  t2: 'Questões 1 a 8 da lista 3, com os gráficos. Entregar em PDF no Moodle.',
  t4: 'Conferir os números do trimestre antes de sexta.',
}
tarefas = tarefas.map((x) => ({ ...x, descricao: DESCRICOES[x.id] ?? null, tag_ids: TAGS_EXEMPLO[x.id] ?? [] }))

// Kanban: Pendentes (vermelha, como no pedido do usuário), uma coluna do meio e Concluídas.
let colunas = [
  { id: 'k1', tipo: 'pendente', nome: 'Pendentes', cor: '#e27d8f', posicao: 0 },
  { id: 'k2', tipo: 'custom', nome: 'Em andamento', cor: '#6c9be8', posicao: 10 },
  { id: 'k3', tipo: 'concluida', nome: 'Concluídas', cor: null, posicao: 1000 },
]
tarefas = tarefas.map((x) => (['t2', 't4'].includes(x.id) ? { ...x, column_id: 'k2' } : { ...x, column_id: null }))

// Calendários conectados (Integrações): um em dia, um com o link quebrado.
let fontes = [
  {
    id: 'f1',
    nome: 'Desenvolvimento Web Front-end',
    dominio: 'faponline.fapce.edu.br',
    category_id: 'c1',
    tag_id: 'g2',
    importar_passadas: false,
    ultima_sync: instante(95),
    ultima_tentativa: instante(95),
    ultimo_erro: null,
    total_importadas: 7,
    created_at: instante(5000),
  },
  {
    id: 'f2',
    nome: 'Modelagem de Banco de Dados e SQL',
    dominio: 'faponline.fapce.edu.br',
    category_id: 'c1',
    tag_id: 'g1',
    importar_passadas: false,
    ultima_sync: instante(1500),
    ultima_tentativa: instante(40),
    ultimo_erro: 'link_inacessivel',
    total_importadas: 4,
    created_at: instante(4900),
  },
]

// Blocos de foco (página Foco e Painel): dois hoje e alguns nos últimos dias.
const blocoFoco = (id, minutosAtras, minutos = 25) => ({ id, minutos, concluida_em: instante(minutosAtras) })
let focos = [
  blocoFoco('b1', 5760 + 200, 50),
  blocoFoco('b2', 4320 + 120),
  blocoFoco('b3', 4320 + 90),
  blocoFoco('b4', 2880 + 60),
  blocoFoco('b5', 1440 + 180, 50),
  blocoFoco('b6', 1440 + 150),
  blocoFoco('b7', 1440 + 120),
  blocoFoco('b8', 95),
  blocoFoco('b9', 60),
]

let perfil = { primeiro_nome: 'Ana', sobrenome: 'Souza', data_nascimento: '2003-05-14', ocupacao: 'estudante' }

// 690 XP = nível 4 com 240/250: uma conclusão já mostra a subida de nível.
// Última conclusão ontem: a pré-visualização mostra o lembrete de streak em risco.
let stats = { xp_total: 690, streak_atual: 6, streak_recorde: 14, ultima_data_conclusao: dia(-1) }

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
  listarColunas: () => espera([...colunas].sort((a, b) => a.posicao - b.posicao)),
  criarColuna: ({ nome, cor, posicao }) => {
    const c = { id: novoId(), tipo: 'custom', nome: nome.trim(), cor: cor || null, posicao }
    colunas = [...colunas, c]
    return espera(c)
  },
  atualizarColuna: (id, campos) => {
    colunas = colunas.map((c) =>
      c.id === id
        ? {
            ...c,
            ...(campos.nome !== undefined ? { nome: campos.nome.trim() } : {}),
            ...(campos.cor !== undefined ? { cor: campos.cor || null } : {}),
            ...(campos.posicao !== undefined ? { posicao: campos.posicao } : {}),
          }
        : c,
    )
    return espera(colunas.find((c) => c.id === id))
  },
  excluirColuna: (id) => {
    colunas = colunas.filter((c) => c.id !== id)
    tarefas = tarefas.map((x) => (x.column_id === id ? { ...x, column_id: null } : x))
    return espera(null)
  },
  moverTarefaColuna: (id, colunaId) => {
    tarefas = tarefas.map((x) => (x.id === id ? { ...x, column_id: colunaId } : x))
    return espera(null)
  },
  listarFontes: () => espera(fontes),
  criarFonte: ({ nome, url, categoriaId, tagId, importarPassadas }) => {
    const f = {
      id: novoId(),
      nome: nome.trim(),
      dominio: new URL(url.replace(/^webcal:/i, 'https:')).hostname,
      category_id: categoriaId,
      tag_id: tagId || null,
      importar_passadas: importarPassadas,
      ultima_sync: null,
      ultimo_erro: null,
      total_importadas: 0,
      created_at: new Date().toISOString(),
    }
    fontes = [...fontes, f]
    return espera(f)
  },
  atualizarFonte: (id, { nome, categoriaId, tagId, importarPassadas }) => {
    fontes = fontes.map((f) =>
      f.id === id ? { ...f, nome: nome.trim(), category_id: categoriaId, tag_id: tagId || null, importar_passadas: importarPassadas } : f,
    )
    return espera(fontes.find((f) => f.id === id))
  },
  excluirFonte: (id) => {
    fontes = fontes.filter((f) => f.id !== id)
    return espera(null)
  },
  previaFonte: () =>
    espera({
      total: 9,
      futuras: 3,
      proximas: [
        { titulo: 'TDE 2', data: dia(4) },
        { titulo: 'ATIVIDADE 4 - Leitura e escrita acadêmica', data: dia(9) },
        { titulo: 'Entrega parcial do projeto', data: dia(16) },
      ],
    }),
  sincronizarFontes: (fonteId) => {
    fontes = fontes.map((f) => (!fonteId || f.id === fonteId ? { ...f, ultima_sync: new Date().toISOString(), ultimo_erro: null } : f))
    return espera({ resultados: fontes.filter((f) => !fonteId || f.id === fonteId).map((f) => ({ id: f.id, novas: 0, atualizadas: 0 })) })
  },
  listarTags: () => espera([...tags].sort((a, b) => a.nome.localeCompare(b.nome))),
  criarTag: ({ nome, cor }) => {
    if (tags.some((g) => g.nome.toLowerCase() === nome.trim().toLowerCase())) return Promise.reject({ code: '23505' })
    const g = { id: novoId(), nome: nome.trim(), cor }
    tags = [...tags, g]
    return espera(g)
  },
  atualizarTag: (id, { nome, cor }) => {
    tags = tags.map((g) => (g.id === id ? { ...g, nome: nome.trim(), cor } : g))
    return espera(tags.find((g) => g.id === id))
  },
  excluirTag: (id) => {
    tags = tags.filter((g) => g.id !== id)
    tarefas = tarefas.map((x) => ({ ...x, tag_ids: x.tag_ids.filter((g) => g !== id) }))
    return espera(null)
  },
  listarTarefas: () => espera(tarefas),
  criarTarefa: ({ titulo, descricao, categoriaId, dataPrevista, tagIds = [] }) => {
    const x = {
      id: novoId(),
      titulo: titulo.trim(),
      descricao: descricao?.trim() || null,
      category_id: categoriaId,
      data_prevista: dataPrevista || null,
      status: 'pendente',
      completed_at: null,
      xp_value: 10,
      created_at: new Date().toISOString(),
      tag_ids: tagIds,
    }
    tarefas = [...tarefas, x]
    return espera(x)
  },
  atualizarTarefa: (id, { titulo, descricao, categoriaId, dataPrevista, tagIds = [] }) => {
    tarefas = tarefas.map((x) =>
      x.id === id
        ? {
            ...x,
            titulo: titulo.trim(),
            descricao: descricao?.trim() || null,
            category_id: categoriaId,
            data_prevista: dataPrevista || null,
            tag_ids: tagIds,
          }
        : x,
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
    stats = {
      ...stats,
      xp_total: stats.xp_total + xp,
      ...(recente ? {} : { ultima_data_conclusao: hoje, streak_atual: stats.ultima_data_conclusao === hoje ? stats.streak_atual : stats.streak_atual + 1 }),
    }
    return espera({
      tarefa: tarefas.find((x) => x.id === id),
      xp_ganho: xp,
      motivo,
      estatisticas: { ...stats, xp_hoje: xpHoje + xp, teto_diario: 150 },
    })
  },
  // Avisos por push não existem na pré-visualização (sem service worker nem servidor).
  registrarPush: () => espera(null),
  agendarAvisoFoco: () => espera(null),
  cancelarAvisoFoco: () => espera(null),
  listarFocos: () => espera(focos),
  registrarFoco: ({ id, minutos }) => {
    if (!focos.some((f) => f.id === id)) focos = [...focos, { id, minutos, concluida_em: new Date().toISOString() }]
    return espera(null)
  },
  lerEstatisticas: () => espera({ ...stats, xp_hoje: 0, teto_diario: 150 }),
  lerPerfil: () => espera(perfil),
  salvarPerfil: (campos) => {
    perfil = { ...campos, primeiro_nome: campos.primeiro_nome.trim(), sobrenome: campos.sobrenome.trim() }
    return espera(perfil)
  },
}
