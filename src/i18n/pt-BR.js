// Todos os textos da interface ficam aqui, para facilitar a tradução no futuro.
export const t = {
  app: {
    nome: 'RoutinXP',
    carregando: 'Carregando…',
    sair: 'Sair',
  },

  nivel: {
    rotulo: (n) => `Nível ${n}`,
    xp: (atual, meta) => `XP ${atual} / ${meta}`,
    falta: (n) => `faltam ${n} XP`,
    barra: 'Progresso até o próximo nível',
  },

  entrar: {
    titulo: ['Conclua tarefas.', 'Ganhe XP.', 'Suba de nível.'],
    texto:
      'Faculdade, trabalho, vida pessoal e projetos numa lista só. Cada tarefa concluída rende XP, e o seu nível mostra o quanto você já avançou.',
  },

  demo: {
    titulo: 'Experimente: conclua uma tarefa',
    ganho: (xp) => `+${xp} XP`,
    anuncio: (xp, atual, meta) => `Mais ${xp} XP. ${atual} de ${meta} no nível.`,
    subiu: (n) => `Nível ${n} alcançado. No app, cada tarefa concluída funciona assim.`,
    recomecar: 'Recomeçar exemplo',
    tarefas: [
      // Valores de exemplo: o XP por tarefa ainda não foi definido e pode variar.
      { id: 1, titulo: 'Entregar relatório de Cálculo II', categoria: 'Faculdade', cor: '#6c9be8', xp: 15 },
      { id: 2, titulo: 'Revisar slides da reunião de sexta', categoria: 'Trabalho', cor: '#e0a050', xp: 5 },
      { id: 3, titulo: 'Pagar conta de luz', categoria: 'Vida Pessoal', cor: '#e27d8f', xp: 10 },
    ],
  },

  auth: {
    abas: { rotulo: 'Entrar ou criar conta', entrar: 'Entrar', cadastrar: 'Criar conta' },
    campos: {
      email: 'E-mail',
      emailExemplo: 'voce@email.com',
      senha: 'Senha',
      novaSenha: 'Nova senha',
      repetirSenha: 'Repita a senha',
      mostrar: 'Mostrar',
      ocultar: 'Ocultar',
    },
    dicaSenha: 'Pelo menos 6 caracteres.',
    botoes: {
      entrar: 'Entrar',
      entrando: 'Entrando…',
      cadastrar: 'Criar conta',
      cadastrando: 'Criando conta…',
      enviarLink: 'Enviar link',
      enviando: 'Enviando…',
      salvarSenha: 'Salvar nova senha',
      salvando: 'Salvando…',
    },
    links: {
      esqueci: 'Esqueci minha senha',
      voltar: 'Voltar para o login',
    },
    esqueci: {
      titulo: 'Redefinir senha',
      texto: 'Informe o e-mail da sua conta. Enviamos um link para você criar uma senha nova.',
    },
    confira: {
      titulo: 'Confira seu e-mail',
      cadastro: (email) =>
        `Enviamos um link de confirmação para ${email}. Abra o link para ativar a conta e depois entre por aqui.`,
      reset: (email) =>
        `Se existir uma conta com ${email}, o link para criar uma senha nova já está a caminho. Ele vale por uma hora.`,
      semEmail: 'Não chegou? Olhe a caixa de spam ou tente de novo em alguns minutos.',
    },
    redefinir: {
      titulo: 'Nova senha',
      texto: 'Escolha uma senha nova para a sua conta.',
      expiradoTitulo: 'Link expirado',
      expirado: 'Este link expirou ou já foi usado. Peça um novo na tela de login.',
      naoConfere: 'As duas senhas não são iguais.',
    },
    erroTag: 'Erro',
    captcha: {
      aguarde: 'A verificação de segurança ainda não terminou. Aguarde um instante e tente de novo.',
      falhou: 'A verificação de segurança não carregou. Recarregue a página ou desative bloqueadores de conteúdo.',
    },
    erros: {
      credenciais: 'E-mail ou senha incorretos.',
      naoConfirmado: 'Confirme seu e-mail antes de entrar. O link foi enviado quando você criou a conta.',
      jaExiste: 'Já existe uma conta com esse e-mail. Entre ou use "Esqueci minha senha".',
      limite: 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.',
      senhaFraca: 'A senha precisa ter pelo menos 6 caracteres.',
      mesmaSenha: 'A senha nova precisa ser diferente da atual.',
      emailInvalido: 'Esse e-mail não parece válido. Confira se digitou certo.',
      rede: 'Sem conexão com o servidor. Confira sua internet e tente de novo.',
      generico: 'Algo deu errado. Tente de novo em instantes.',
      captcha: 'A verificação de segurança não foi aceita. Tente de novo.',
      cadastroDados: 'Não foi possível criar a conta com esses dados. Confira os campos e a data de nascimento (13 anos ou mais).',
    },
  },

  conta: {
    menu: 'Conta',
    sair: 'Sair',
  },

  menu: {
    rotulo: 'Navegação',
    tarefas: 'Tarefas',
    painel: 'Painel',
    perfil: 'Perfil',
    recolher: 'Recolher menu',
    expandir: 'Expandir menu',
    abrir: 'Abrir menu',
    fechar: 'Fechar menu',
    completarPerfil: 'Complete seu perfil',
  },

  painel: {
    titulo: 'Painel',
    total: (n) => `${n} XP no total`,
    semana: 'Sua semana',
    mes: 'Seus últimos 30 dias',
    periodo: { rotulo: 'Período', sete: '7 dias', trinta: '30 dias' },
    resumo: (n, xp) => `${n} ${n === 1 ? 'tarefa concluída' : 'tarefas concluídas'} · ${xp} XP`,
    teto: (n) => `teto diário · ${n} XP`,
    xp: (n) => `${n} XP`,
    barra: (dia, data, xp, n) => `${dia} ${data} · ${xp} XP · ${n} ${n === 1 ? 'tarefa' : 'tarefas'}`,
    tabela: { dia: 'Dia', xp: 'XP', tarefas: 'Tarefas' },
    categorias: 'Conclusões por categoria',
    categoriasPeriodo: (n) => `Últimos ${n} dias`,
    maisConcluida: (nome) => `Mais concluída: ${nome}`,
    semCategorias: 'Crie categorias para ver este gráfico.',
    semConclusoes: 'Nenhuma tarefa concluída neste período.',
    linhaTempo: 'Linha do tempo',
    hoje: 'Hoje',
    ontem: 'Ontem',
    vazioTempo: 'Nenhuma conclusão ainda. Conclua uma tarefa e ela aparece aqui.',
    streakAtual: 'Streak atual',
    recorde: 'Recorde',
  },

  instalar: {
    menu: 'Instalar app',
    convite: 'Instale o RoutinXP na tela inicial e abra direto, como um app.',
    acao: 'Instalar',
    dispensar: 'Dispensar convite para instalar',
    ios: {
      titulo: 'Instalar na tela de início',
      texto: 'No iPhone e no iPad, a instalação é feita pelo navegador:',
      passo1: 'Toque em Compartilhar. Ele fica na barra do navegador ou dentro do botão de mais opções (•••).',
      passo2: 'Escolha "Adicionar à Tela de Início".',
      passo3: 'Toque em "Adicionar". O RoutinXP aparece junto dos seus apps.',
      ok: 'Entendi',
    },
  },

  conexao: {
    offline: 'Sem conexão. O que você mudar agora só será salvo quando a internet voltar.',
  },

  lembrete: {
    texto: (n) =>
      `Você ainda não concluiu nenhuma tarefa hoje. Conclua uma para manter sua sequência de ${n} ${n === 1 ? 'dia' : 'dias'}.`,
    acao: 'Ver tarefas',
    dispensar: 'Dispensar lembrete',
  },

  perfil: {
    titulo: 'Perfil',
    tituloCompletar: 'Complete seu perfil',
    textoCompletar: 'Seu nome aparece no menu e no painel. Leva menos de um minuto.',
    campos: {
      primeiroNome: 'Primeiro nome',
      sobrenome: 'Sobrenome',
      nascimento: 'Data de nascimento',
      ocupacao: 'Ocupação',
      escolha: 'Selecione',
    },
    ocupacoes: [
      { valor: 'estudante', rotulo: 'Estudante' },
      { valor: 'trabalho', rotulo: 'Trabalho' },
      { valor: 'ambos', rotulo: 'Estudo e trabalho' },
    ],
    salvar: 'Salvar perfil',
    salvando: 'Salvando…',
    salvo: 'Perfil salvo.',
    conta: 'Conta',
    email: 'E-mail',
    sair: 'Sair da conta',
    erros: {
      obrigatorio: 'Preencha nome, sobrenome, data de nascimento e ocupação.',
      data: 'Informe uma data de nascimento válida.',
      idade: 'É preciso ter 13 anos ou mais para usar o RoutinXP.',
    },
  },

  topo: {
    progresso: 'Seu progresso',
    streak: 'Streak',
    dias: (n) => `${n} ${n === 1 ? 'dia' : 'dias'}`,
    novaTarefa: 'Nova tarefa',
  },

  tarefas: {
    tituloTodas: 'Todas as tarefas',
    visoes: { rotulo: 'Visualização', lista: 'Lista', quadro: 'Kanban', calendario: 'Calendário' },
    kanban: {
      pendentes: 'Pendentes',
      concluidas: 'Concluídas',
      contagem: (n) => `${n} ${n === 1 ? 'tarefa' : 'tarefas'}`,
      editarColuna: (nome) => `Editar coluna ${nome}`,
      soltarAqui: 'Solte para mover para esta coluna',
      vazia: 'Arraste tarefas para cá.',
      novaColuna: 'Nova coluna',
      novaTitulo: 'Nova coluna',
      editarTitulo: 'Editar coluna',
      nome: 'Nome',
      nomeExemplo: 'Ex.: Em andamento',
      cor: 'Cor da coluna',
      semCor: 'Sem cor',
      posicao: 'Posição',
      moverEsquerda: 'Mover para a esquerda',
      moverDireita: 'Mover para a direita',
      fixa: 'Esta coluna é fixa: você pode mudar o nome e a cor, mas ela não sai do lugar.',
      excluir: 'Excluir coluna',
      excluirConfirmar: 'Excluir mesmo assim',
      confirmarExcluir: (n) =>
        `${n === 1 ? 'A tarefa desta coluna volta' : `As ${n} tarefas desta coluna voltam`} para Pendentes. Toque de novo para excluir.`,
      cancelar: 'Cancelar',
      salvar: 'Salvar',
      salvando: 'Salvando…',
      criar: 'Criar coluna',
      campo: 'Coluna no Kanban',
    },
    filtro: { rotulo: 'Mostrar', pendentes: 'Pendentes', concluidas: 'Concluídas' },
    filtros: {
      botao: 'Filtrar',
      rotulo: (n) => (n ? `Filtrar, ${n} ${n === 1 ? 'filtro ativo' : 'filtros ativos'}` : 'Filtrar'),
      busca: 'Buscar pelo nome',
      categorias: 'Categorias',
      tags: 'Tags',
      prazo: 'Prazo',
      prazos: { qualquer: 'Qualquer', atrasadas: 'Atrasadas', hoje: 'Hoje', semana: 'Próximos 7 dias', 'sem-data': 'Sem data' },
      limpar: 'Limpar filtros',
      resultado: (n) => `${n} ${n === 1 ? 'tarefa' : 'tarefas'}`,
      resultadoLista: (n, pendentes) =>
        `${n} ${pendentes ? (n === 1 ? 'pendente' : 'pendentes') : n === 1 ? 'concluída' : 'concluídas'}`,
      nenhuma: 'Nenhuma tarefa com esses filtros.',
      tituloFiltrado: 'Tarefas filtradas',
    },
    calendario: {
      modos: { rotulo: 'Modo do calendário', mes: 'Mês', semana: 'Semana', dia: 'Dia', linha: 'Linha do tempo' },
      anterior: { mes: 'Mês anterior', semana: 'Semana anterior', dia: 'Dia anterior' },
      proximo: { mes: 'Próximo mês', semana: 'Próxima semana', dia: 'Próximo dia' },
      hojeBotao: 'Hoje',
      hoje: 'Hoje',
      amanha: 'Amanhã',
      atrasadas: 'Atrasadas',
      semDataTitulo: 'Sem data',
      abrirDia: (dia, n = 0, feitas = 0) =>
        n
          ? `Abrir ${dia}, ${n} ${n === 1 ? 'tarefa' : 'tarefas'}${feitas ? `, ${feitas} ${feitas === 1 ? 'concluída' : 'concluídas'}` : ''}`
          : `Abrir ${dia}`,
      concluida: 'concluída',
      verAnteriores: (n) => `Mostrar ${n} ${n === 1 ? 'tarefa concluída' : 'tarefas concluídas'} de dias anteriores`,
      esconderAnteriores: 'Esconder dias anteriores',
      mais: (n) => `+${n} ${n === 1 ? 'tarefa' : 'tarefas'}`,
      maisRotulo: (n, dia) => `Ver mais ${n} ${n === 1 ? 'tarefa' : 'tarefas'} de ${dia}`,
      diaVazio: 'Nada marcado para este dia.',
      linhaVazia: 'Nenhuma tarefa daqui pra frente.',
      semData: (n) => `${n} ${n === 1 ? 'tarefa sem data não aparece' : 'tarefas sem data não aparecem'} no calendário.`,
      verLinha: 'Ver na Linha do tempo',
    },
    soltar: 'Solte para concluir',
    semData: 'sem data',
    hoje: 'hoje',
    amanha: 'amanhã',
    atrasadaEm: (data) => `atrasada · ${data}`,
    prazoRotulo: (texto) => `prazo: ${texto}`,
    concluir: (titulo) => `Concluir: ${titulo}`,
    editar: (titulo) => `Editar: ${titulo}`,
    excluir: 'Excluir',
    excluirRotulo: (titulo) => `Excluir: ${titulo}`,
    xp: (n) => `+${n} XP`,
    carregando: 'Carregando tarefas…',
    erroCarregar: 'Não foi possível carregar suas tarefas. Confira sua internet.',
    tentarDeNovo: 'Tentar de novo',
    vazio: {
      semCategoriaTitulo: 'Comece criando uma categoria',
      semCategoriaTexto:
        'Categorias separam as áreas da sua rotina, como Faculdade ou Trabalho. Toda tarefa pertence a uma.',
      semCategoriaAcao: 'Criar categoria',
      semTarefaTitulo: 'Nenhuma tarefa ainda',
      semTarefaTexto: 'Crie a primeira tarefa e comece a juntar XP.',
      pendentes: 'Nada pendente por aqui.',
      concluidas: 'Nenhuma tarefa concluída ainda.',
    },
    excluida: 'Tarefa excluída',
    desfazer: 'Desfazer',
    nivelAlcancado: 'Você subiu de nível!',
    motivoXp: {
      recemCriada: 'Concluída! Tarefas criadas há menos de 5 minutos não rendem XP nem contam para o streak.',
      teto: 'Concluída! Você já ganhou os 150 XP de hoje. O streak continua valendo.',
      tetoParcial: (xp) => `Concluída! +${xp} XP: o restante passaria do teto de 150 XP por dia.`,
    },
  },

  formTarefa: {
    novaTitulo: 'Nova tarefa',
    editarTitulo: 'Editar tarefa',
    titulo: 'Título',
    tituloExemplo: 'Ex.: Entregar relatório de Cálculo II',
    categoria: 'Categoria',
    data: 'Data prevista',
    dataDica: 'Opcional.',
    criar: 'Criar tarefa',
    salvar: 'Salvar',
    salvando: 'Salvando…',
    cancelar: 'Cancelar',
    excluir: 'Excluir tarefa',
    semCategoria: 'Toda tarefa pertence a uma categoria. Crie a primeira antes de adicionar tarefas.',
    criarCategoria: 'Criar categoria',
    descricao: 'Descrição',
    descricaoExemplo: 'O que precisa ser feito, links, detalhes…',
    descricaoDica: 'Opcional.',
    tags: 'Tags',
    semTags: 'Nenhuma tag ainda. Crie uma para marcar tarefas parecidas.',
    novaTag: 'Nova tag',
    nomeTag: 'Nome da tag',
    corTag: 'Cor da tag',
    criarTag: 'Criar tag',
    cancelarTag: 'Cancelar nova tag',
    tagsDaTarefa: (nomes) => `Tags: ${nomes}`,
  },

  formTag: {
    novaTitulo: 'Nova tag',
    editarTitulo: 'Editar tag',
    nome: 'Nome',
    nomeExemplo: 'Ex.: Urgente',
    maxNome: 40,
    cor: 'Cor',
    criar: 'Criar tag',
    salvar: 'Salvar',
    salvando: 'Salvando…',
    cancelar: 'Cancelar',
    excluir: 'Excluir tag',
    excluirConfirmar: 'Excluir mesmo assim',
    confirmar: (n) =>
      `Esta tag está em ${n} ${n === 1 ? 'tarefa' : 'tarefas'} e vai sair ${n === 1 ? 'dela' : 'delas'}. Toque de novo para excluir.`,
  },

  integracoes: {
    titulo: 'Integrações',
    conectar: 'Conectar calendário',
    secao: 'Calendários da faculdade',
    texto:
      'Conecte o calendário de cada disciplina. As atividades novas viram tarefas sozinhas, com o prazo e a tag da matéria.',
    automatico: 'Atualização automática a cada 3 horas.',
    vazio: 'Nenhum calendário conectado ainda.',
    atualizar: 'Atualizar',
    atualizando: 'Atualizando…',
    atualizarRotulo: (nome) => `Atualizar ${nome}`,
    editar: 'Editar',
    editarRotulo: (nome) => `Editar ${nome}`,
    nunca: 'ainda não atualizado',
    atualizado: (quando) => `atualizado ${quando}`,
    falhou: (quando) => `falhou ${quando}`,
    agora: 'agora mesmo',
    tarefas: (n) => `${n} ${n === 1 ? 'tarefa' : 'tarefas'}`,
    resultado: (novas, atualizadas) => {
      if (!novas && !atualizadas) return 'Nada novo.'
      const partes = []
      if (novas) partes.push(`${novas} ${novas === 1 ? 'tarefa nova' : 'tarefas novas'}`)
      if (atualizadas) partes.push(`${atualizadas} ${atualizadas === 1 ? 'prazo atualizado' : 'prazos atualizados'}`)
      return `${partes.join(' e ')}.`
    },
    pulada: 'Atualizado há menos de um minuto.',
    comoTitulo: 'Como pegar o link no Blackboard',
    como: [
      'No Blackboard, abra o Calendário e toque em Configurações do calendário.',
      'Toque em Limpar tudo e marque só a disciplina que você quer conectar.',
      'No menu de três pontinhos, toque em Compartilhar calendário e copie o link.',
      'Aqui, toque em Conectar calendário e cole o link. Repita para cada disciplina.',
    ],
    comoNota:
      'Depois, marque de novo as outras disciplinas no Blackboard. Funciona também com qualquer link de calendário iCal (Moodle, Canvas, Google Agenda).',
    form: {
      novaTitulo: 'Conectar calendário',
      editarTitulo: 'Editar calendário',
      nome: 'Nome da disciplina',
      nomeExemplo: 'Ex.: Desenvolvimento Web Front-end',
      link: 'Link do calendário',
      linkExemplo: 'https://… ou webcal://…',
      linkDica: 'O link fica guardado só no servidor; esta tela mostra apenas o endereço do site.',
      linkSalvo: (dominio) => `Link salvo (${dominio})`,
      trocarLink: 'Trocar link',
      categoria: 'Categoria das tarefas',
      tag: 'Tag da matéria',
      semTag: 'Nenhuma',
      novaTag: (nome) => `Nova tag: ${nome}`,
      passadas: 'Trazer também atividades com prazo já vencido',
      testar: 'Testar link',
      testando: 'Lendo o calendário…',
      previa: (total, futuras) =>
        `${total} ${total === 1 ? 'atividade' : 'atividades'} no calendário, ${futuras} com prazo de hoje em diante.`,
      previaVazia: 'Nenhuma atividade com prazo de hoje em diante.',
      conectar: 'Conectar',
      salvar: 'Salvar',
      salvando: 'Salvando…',
      cancelar: 'Cancelar',
      remover: 'Remover calendário',
      removerNome: (nome) => `Remover ${nome}`,
      removerTitulo: 'O que fazer com as tarefas pendentes que vieram deste calendário?',
      manter: 'Manter as tarefas',
      apagar: 'Apagar as tarefas pendentes',
      confirmarRemover: 'Remover calendário',
      removendo: 'Removendo…',
      semCategoria: 'As tarefas precisam de uma categoria. Crie uma em Tarefas antes de conectar um calendário.',
    },
    erros: {
      link_invalido: 'Esse link não parece um link de calendário. Ele precisa começar com https:// ou webcal://.',
      link_inacessivel: 'Não foi possível abrir o link. Confira se ele está completo e se ainda vale no Blackboard.',
      nao_e_calendario: 'O link abriu, mas não é um calendário.',
      muito_grande: 'O calendário é grande demais para importar.',
      sem_categoria: 'Este calendário está sem categoria. Edite e escolha uma.',
      muitas_tentativas: 'Muitos testes seguidos. Espere alguns minutos e tente de novo.',
      nao_autorizado: 'Sua sessão expirou. Entre de novo.',
      falha: 'Não deu para ler o calendário agora. Tente de novo em instantes.',
    },
  },

  etiquetas: {
    mostrarNomes: 'mostrar os nomes das tags',
    soCores: 'mostrar só as cores das tags',
  },

  categoriasPagina: {
    titulo: 'Categorias e tags',
    categorias: 'Categorias',
    texto: 'Categorias separam as áreas da sua rotina, como Faculdade ou Trabalho. Toda tarefa pertence a uma.',
    vazio: 'Nenhuma categoria ainda.',
    pendentes: (n) => (n === 0 ? 'sem pendentes' : `${n} ${n === 1 ? 'pendente' : 'pendentes'}`),
    editar: (nome) => `Editar categoria ${nome}`,
    nova: 'Nova categoria',
  },

  prazosAviso: {
    texto: (hoje, atrasadas) => {
      const partes = []
      if (hoje) partes.push(`${hoje} ${hoje === 1 ? 'tarefa para hoje' : 'tarefas para hoje'}`)
      // "1 tarefa atrasada" sozinho; "2 tarefas para hoje e 1 atrasada" junto.
      if (atrasadas) {
        const nome = hoje ? '' : atrasadas === 1 ? 'tarefa ' : 'tarefas '
        partes.push(`${atrasadas} ${nome}${atrasadas === 1 ? 'atrasada' : 'atrasadas'}`)
      }
      return `Você tem ${partes.join(' e ')}.`
    },
    acao: 'Ver tarefas',
    dispensar: 'Dispensar aviso de prazos',
  },

  tagsPerfil: {
    titulo: 'Tags',
    texto: 'Marque tarefas com tags. Elas aparecem como etiquetas nas tarefas; clique numa etiqueta para mostrar só as cores.',
    vazio: 'Você ainda não criou tags.',
    uso: (n) => (n === 0 ? 'sem tarefas' : `${n} ${n === 1 ? 'tarefa' : 'tarefas'}`),
    editar: (nome) => `Editar tag ${nome}`,
    editarCurto: 'Editar',
    nova: 'Nova tag',
  },

  formCategoria: {
    novaTitulo: 'Nova categoria',
    editarTitulo: 'Editar categoria',
    nome: 'Nome',
    nomeExemplo: 'Ex.: Faculdade',
    cor: 'Cor',
    criar: 'Criar categoria',
    salvar: 'Salvar',
    salvando: 'Salvando…',
    cancelar: 'Cancelar',
    excluir: 'Excluir categoria',
    emUso: (n) =>
      `Esta categoria tem ${n} ${n === 1 ? 'tarefa' : 'tarefas'}. Mova ou exclua ${n === 1 ? 'essa tarefa' : 'essas tarefas'} antes de excluir a categoria.`,
    // Tons suaves para aparecer como ponto no fundo escuro; sem verde e roxo saturados (reservados a XP e ações).
    cores: [
      { valor: '#6c9be8', nome: 'Azul' },
      { valor: '#5fc4c0', nome: 'Turquesa' },
      { valor: '#e0a050', nome: 'Âmbar' },
      { valor: '#e27d8f', nome: 'Rosa' },
      { valor: '#d98a6a', nome: 'Terracota' },
      { valor: '#c9b37e', nome: 'Areia' },
      { valor: '#8f9bb3', nome: 'Cinza-azulado' },
      { valor: '#b39ddb', nome: 'Lavanda' },
    ],
  },

  dadosErros: {
    rede: 'Sem conexão com o servidor. Confira sua internet e tente de novo.',
    emUso: 'Esta categoria ainda tem tarefas. Mova ou exclua as tarefas antes.',
    validacao:
      'Confira os campos: o título vai até 200 caracteres, a descrição até 1000, o nome da categoria até 60 e o da tag até 40.',
    tagDuplicada: 'Você já tem uma tag com esse nome.',
    generico: 'Não deu para salvar agora. Tente de novo em instantes.',
  },
}
