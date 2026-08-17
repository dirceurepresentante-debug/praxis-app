// Dados de demonstração — usados quando Supabase não está configurado
export const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL

const hoje = (() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
})()

export const demoData = {
  profissionais: [
    { id: '1', nome: 'Bruna Barbosa', especialidade: 'Psicologia Clínica', registro: 'CRP 06/12345', duracao_minutos: 50, ativo: true },
  ],
  convenios: [
    { id: '1', nome: 'Particular', ativo: true },
    { id: '2', nome: 'ProVida - Aracruz', ativo: true },
  ],
  tipos_atendimento: [
    { id: '1', nome: 'Consulta Inicial', cor: '#3a9175', ativo: true },
    { id: '2', nome: 'Sessão de Terapia', cor: '#5dae92', ativo: true },
    { id: '3', nome: 'Retorno', cor: '#8ecbb3', ativo: true },
    { id: '4', nome: 'Avaliação', cor: '#245d4c', ativo: true },
  ],
  pacientes: [
    { id: '1', nome: 'Ana Beatriz Santos', telefone: '(27) 98765-4321', email: 'ana@email.com', convenio_id: '2', data_nascimento: '1990-05-15', ativo: true, origem: 'Instagram', plano_sessoes: 8, estado_civil: 'Casado(a)', conjuge_nome: 'Rafael Santos', conjuge_idade: '34', filhos: [{nome:'Lucas',idade:'8'},{nome:'Sofia',idade:'5'}], profissao: 'Professora', trabalhando: true, cidade: 'Aracruz', estado: 'ES' },
    { id: '2', nome: 'Carlos Eduardo Lima', telefone: '(27) 91234-5678', email: 'carlos@email.com', convenio_id: '1', data_nascimento: '1985-08-22', ativo: true, origem: 'Indicação', plano_sessoes: 4, estado_civil: 'Solteiro(a)', filhos: [], profissao: 'Engenheiro', trabalhando: true, cidade: 'Aracruz', estado: 'ES' },
    { id: '3', nome: 'Mariana Costa', telefone: '(27) 99876-5432', email: 'mariana@email.com', convenio_id: '1', data_nascimento: '1995-03-10', ativo: true, origem: 'Google', plano_sessoes: 0, estado_civil: 'Divorciado(a)', filhos: [{nome:'Pedro',idade:'3'}], profissao: 'Designer', trabalhando: false, cidade: 'Vitória', estado: 'ES' },
    { id: '4', nome: 'Roberto Alves', telefone: '(27) 98123-4567', email: 'roberto@email.com', convenio_id: '2', data_nascimento: '1978-11-30', ativo: true, origem: 'Tráfego Pago', plano_sessoes: 12, estado_civil: 'Casado(a)', conjuge_nome: 'Fernanda Alves', conjuge_idade: '42', filhos: [{nome:'Thiago',idade:'15'},{nome:'Camila',idade:'12'},{nome:'Bruno',idade:'9'}], profissao: 'Contador', trabalhando: true, cidade: 'Aracruz', estado: 'ES' },
    { id: '5', nome: 'Juliana Ferreira', telefone: '(27) 97654-3210', email: 'juliana@email.com', convenio_id: '1', data_nascimento: '1992-07-18', ativo: true, origem: 'Indicação', plano_sessoes: 4, estado_civil: 'Solteiro(a)', filhos: [], profissao: 'Enfermeira', trabalhando: true, cidade: 'Fundão', estado: 'ES' },
  ],
  agendamentos: [
    { id: '1', paciente_id: '1', profissional_id: '1', tipo_id: '2', data: hoje, hora: '09:00', status: 'confirmado', valor: 180, pago: false },
    { id: '2', paciente_id: '2', profissional_id: '1', tipo_id: '2', data: hoje, hora: '10:00', status: 'aguardando', valor: 180, pago: false },
    { id: '3', paciente_id: '3', profissional_id: '1', tipo_id: '1', data: hoje, hora: '11:00', status: 'realizado', valor: 200, pago: true },
    { id: '4', paciente_id: '4', profissional_id: '1', tipo_id: '3', data: hoje, hora: '14:00', status: 'faltou', valor: 180, pago: false },
    { id: '5', paciente_id: '5', profissional_id: '1', tipo_id: '2', data: hoje, hora: '15:00', status: 'cancelado', valor: 180, pago: false },
  ],
  prontuarios: [
    { id: '1', paciente_id: '1', agendamento_id: null, data: '2026-07-01', humor: 4, anotacoes: 'Paciente relatou melhora na qualidade do sono. Continuar técnicas de respiração.', plano: 'Próxima sessão: revisar TCC exercícios.' },
    { id: '2', paciente_id: '1', agendamento_id: null, data: '2026-07-08', humor: 3, anotacoes: 'Semana difícil no trabalho. Ansiedade elevada. Trabalhamos gatilhos.', plano: 'Diário de pensamentos automáticos.' },
  ],
  pre_cadastros: [
    { id: 'pc1', nome: 'Fernanda Oliveira', telefone: '(27) 99123-4567', email: 'fernanda@email.com', data_nascimento: '1988-03-22', convenio: 'Particular', estado_civil: 'Casado(a)', conjuge_nome: 'Ricardo Oliveira', conjuge_idade: '35', filhos: [{nome:'Beatriz',idade:'7'}], profissao: 'Enfermeira', trabalhando: true, cidade: 'Aracruz', estado: 'ES', origem: 'Instagram', obs: 'Ansiedade e síndrome do pânico. Busca tratamento após episódio recente.', status: 'pendente' },
    { id: 'pc2', nome: 'Thiago Mendes', telefone: '(27) 98765-1234', email: 'thiago@email.com', data_nascimento: '1995-07-10', convenio: 'ProVida - Aracruz', estado_civil: 'Solteiro(a)', filhos: [], profissao: 'Estudante', trabalhando: false, cidade: 'Aracruz', estado: 'ES', origem: 'Indicação', obs: 'Dificuldades de relacionamento e autoestima.', status: 'pendente' },
    { id: 'pc3', nome: 'Carla Souza', telefone: '(27) 97654-3210', email: 'carla@email.com', data_nascimento: '1980-11-05', convenio: 'Particular', estado_civil: 'Divorciado(a)', filhos: [{nome:'Gabriel',idade:'12'},{nome:'Laura',idade:'9'}], profissao: 'Advogada', trabalhando: true, cidade: 'Vitória', estado: 'ES', origem: 'Google', obs: 'Depressão pós-divórcio. Já fez terapia anteriormente.', status: 'aprovado' },
  ],
  tcles: [
    { id: 'tcle1', paciente_id: '1', assinado: true, assinatura: 'Ana Beatriz Santos', data_assinatura: '2026-06-01' },
    { id: 'tcle2', paciente_id: '2', assinado: true, assinatura: 'Carlos Eduardo Lima', data_assinatura: '2026-05-15' },
  ],
  escalas: [
    { id: 'e1', paciente_id: '1', tipo: 'PHQ9', score: 8, classificacao: 'Leve', data: '2026-06-01', respostas: [1,1,1,1,1,1,1,0,1] },
    { id: 'e2', paciente_id: '1', tipo: 'PHQ9', score: 5, classificacao: 'Leve', data: '2026-07-01', respostas: [1,1,1,0,0,1,1,0,0] },
    { id: 'e3', paciente_id: '1', tipo: 'GAD7', score: 10, classificacao: 'Moderado', data: '2026-06-01', respostas: [2,2,1,2,1,1,1] },
    { id: 'e4', paciente_id: '1', tipo: 'GAD7', score: 6, classificacao: 'Leve', data: '2026-07-01', respostas: [1,1,1,1,1,0,1] },
    { id: 'e5', paciente_id: '2', tipo: 'PHQ9', score: 12, classificacao: 'Moderado', data: '2026-05-20', respostas: [1,2,2,2,1,1,2,0,1] },
  ],
  metas: [
    { id: 'mt1', paciente_id: '1', lista: [
      { id: '1', titulo: 'Melhorar qualidade do sono', descricao: 'Técnicas de higiene do sono e relaxamento', status: 'alcancada', data_inicio: '2026-06-01', data_conclusao: '2026-07-15' },
      { id: '2', titulo: 'Reduzir ansiedade no trabalho', descricao: 'Identificar gatilhos e desenvolver estratégias de enfrentamento', status: 'em_andamento', data_inicio: '2026-06-01' },
      { id: '3', titulo: 'Melhorar comunicação conjugal', descricao: 'Praticar comunicação não-violenta', status: 'em_andamento', data_inicio: '2026-07-01' },
    ]},
    { id: 'mt2', paciente_id: '2', lista: [
      { id: '1', titulo: 'Autoestima e autoconfiança', status: 'em_andamento', data_inicio: '2026-05-15' },
      { id: '2', titulo: 'Estabelecer limites saudáveis', status: 'em_andamento', data_inicio: '2026-06-01' },
    ]},
  ],
  altas: [],
  lista_espera: [
    { id: 'le1', nome: 'Patrícia Rocha', telefone: '(27) 99234-5678', email: 'patricia@email.com', queixa: 'Ansiedade e crises de pânico', prioridade: 'urgente', dias_preferencia: ['Terça','Quinta'], turno_preferencia: 'Manhã (8h–12h)', data_entrada: '2026-07-28', status: 'aguardando' },
    { id: 'le2', nome: 'Marcos Vinícius', telefone: '(27) 98876-5432', email: 'marcos@email.com', queixa: 'Depressão pós-separação', prioridade: 'normal', dias_preferencia: ['Segunda','Quarta'], turno_preferencia: 'Tarde (12h–18h)', data_entrada: '2026-08-01', status: 'aguardando' },
    { id: 'le3', nome: 'Renata Campos', telefone: '(27) 97654-8765', email: 'renata@email.com', queixa: 'Burnout — encaminhamento médico', prioridade: 'encaminhamento', dias_preferencia: ['Sexta'], turno_preferencia: 'Manhã (8h–12h)', data_entrada: '2026-07-30', status: 'contatado' },
  ],
  mapeamentos: [
    { id: 'm1', paciente_id: '1', status: 'preenchido',
      apresentacao: 'Eu sou a Ana, tenho 35 anos, sou mãe de dois filhos, professora e esposa do Rafael.',
      cor_favorita: 'Verde — me traz calma e esperança.',
      musica_favorita: 'Evidências — Chitãozinho e Xororó. Me lembra momentos felizes na infância.',
      frase_vida: 'A vida é aquilo que acontece enquanto você faz outros planos.',
      nome_pai: 'José — forte',
      nome_mae: 'Maria — amorosa',
      filhos_desc: 'Lucas (8 anos) e Sofia (5 anos)',
      conjuge: 'Rafael — companheiro',
      melhor_amigo_infancia: 'Carla, minha vizinha. Brincávamos até anoitecer. Era corajosa e alegre.',
      sonho_infancia: 'Ser veterinária. Amava animais.',
      algo_para_gritar: 'Que às vezes me sinto sobrecarregada e invisível.',
      alimentos_ama: 'Brigadeiro, macarrão ao molho, pão de queijo',
      alimentos_detesta: 'Quiabo, jiló, fígado',
      dia_mais_feliz: 'O nascimento dos meus filhos, especialmente o Lucas.',
      dia_esquecer: 'O dia que perdi minha avó. Não consegui estar com ela no hospital.',
      faria_sem_dinheiro: 'Viajaria pelo mundo lendo livros e conhecendo culturas.',
      sonho_compravel: 'Uma casa na praia em Guarapari.',
      sonho_nao_compravel: 'Voltar no tempo e abraçar minha avó uma última vez.',
      pontos_melhorar: 'Paciência, organização, colocar limites.',
      qualidades_outros: 'Dedicada, generosa, criativa.',
      qualidades_proprias: 'Persistente, empática, resiliente.',
      pessoas_admiradas: 'Minha mãe pela garra. Nelson Mandela pela paz. Brené Brown pela coragem.',
      temperamento_primario: 'MELANCÓLICO',
      temperamento_secundario: 'FLEUMÁTICO',
      sinto_amado: 'quando alguém me ouve de verdade e lembra dos detalhes que contei.',
      linguagem_amor: 'Palavras de afirmação',
      perfil_inteligencia: 'Interpessoal, Linguística',
      disc: 'ESTÁVEL',
      momento_profissional: 'Professora da rede pública há 10 anos. Amo o que faço mas sinto que preciso de novos desafios.',
      como_ser_lembrado: 'Como alguém que tocou a vida dos alunos de forma positiva e que foi uma mãe presente e amorosa.',
    }
  ],
  despesas: [
    { id: 'd1', descricao: 'Aluguel sala clínica', valor: 800, data: '2026-05-05', categoria: 'Aluguel de sala' },
    { id: 'd2', descricao: 'Supervisão clínica mensal', valor: 350, data: '2026-05-12', categoria: 'Supervisão clínica' },
    { id: 'd3', descricao: 'Curso TCC avançado', valor: 490, data: '2026-05-20', categoria: 'Cursos e capacitação' },
    { id: 'd4', descricao: 'Aluguel sala clínica', valor: 800, data: '2026-06-05', categoria: 'Aluguel de sala' },
    { id: 'd5', descricao: 'Supervisão clínica mensal', valor: 350, data: '2026-06-10', categoria: 'Supervisão clínica' },
    { id: 'd6', descricao: 'Contador mensal', valor: 220, data: '2026-06-15', categoria: 'Contador' },
    { id: 'd7', descricao: 'Aluguel sala clínica', valor: 800, data: '2026-07-05', categoria: 'Aluguel de sala' },
    { id: 'd8', descricao: 'Supervisão clínica mensal', valor: 350, data: '2026-07-10', categoria: 'Supervisão clínica' },
    { id: 'd9', descricao: 'Contador mensal', valor: 220, data: '2026-07-15', categoria: 'Contador' },
    { id: 'd10', descricao: 'Plano de saúde PJ', valor: 380, data: '2026-07-20', categoria: 'Plano de saúde' },
    { id: 'd11', descricao: 'Aluguel sala clínica', valor: 800, data: '2026-08-05', categoria: 'Aluguel de sala' },
    { id: 'd12', descricao: 'Supervisão clínica mensal', valor: 350, data: '2026-08-10', categoria: 'Supervisão clínica' },
  ],
  anamneses: [
    { id: '1', paciente_id: '1', queixa_principal: 'Ansiedade e insônia', historico: 'Tratamento anterior há 3 anos. Sem medicação atual.', medicamentos: 'Nenhum', objetivos: 'Reduzir ansiedade e melhorar qualidade do sono', data: '2026-06-01' },
  ],
}
