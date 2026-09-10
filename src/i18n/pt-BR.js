// Todos os textos da interface ficam aqui, para facilitar a tradução no futuro.
export const t = {
  app: {
    nome: 'Routin',
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
    },
  },

  conta: {
    menu: 'Conta',
    sair: 'Sair',
  },

  topo: {
    progresso: 'Seu progresso',
    streak: 'Streak',
    dias: (n) => `${n} ${n === 1 ? 'dia' : 'dias'}`,
    novaTarefa: 'Nova tarefa',
  },

  trilho: {
    titulo: 'Categorias',
    todas: 'Todas',
    pendentes: 'pendentes',
    nova: 'Nova categoria',
    editar: (nome) => `Editar categoria ${nome}`,
  },

  tarefas: {
    tituloTodas: 'Todas as tarefas',
    visoes: { rotulo: 'Visualização', lista: 'Lista', quadro: 'Quadro' },
    filtro: { rotulo: 'Mostrar', pendentes: 'Pendentes', concluidas: 'Concluídas' },
    soltar: 'Solte para concluir',
    semData: 'sem data',
    hoje: 'hoje',
    amanha: 'amanhã',
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
    validacao: 'Confira os campos: o título vai até 200 caracteres e o nome da categoria até 60.',
    generico: 'Não deu para salvar agora. Tente de novo em instantes.',
  },
}
