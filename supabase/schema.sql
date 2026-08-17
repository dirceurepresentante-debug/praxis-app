-- ============================================================
-- PRAXIS — Schema Supabase (multi-tenant)
-- Execute no SQL Editor do projeto Supabase
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── PROFISSIONAIS (1 por usuário autenticado) ──────────────
create table profissionais (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade unique,
  nome            text not null,
  especialidade   text,
  registro        text,
  duracao_minutos int default 50,
  ativo           boolean default true,
  created_at      timestamptz default now()
);

-- ── CONVÊNIOS (por profissional) ──────────────────────────
create table convenios (
  id              uuid primary key default uuid_generate_v4(),
  profissional_id uuid references profissionais(id) on delete cascade,
  nome            text not null,
  ativo           boolean default true,
  created_at      timestamptz default now()
);

-- ── TIPOS DE ATENDIMENTO (por profissional) ───────────────
create table tipos_atendimento (
  id              uuid primary key default uuid_generate_v4(),
  profissional_id uuid references profissionais(id) on delete cascade,
  nome            text not null,
  cor             text default '#3a9175',
  ativo           boolean default true,
  created_at      timestamptz default now()
);

-- ── PACIENTES ─────────────────────────────────────────────
create table pacientes (
  id               uuid primary key default uuid_generate_v4(),
  profissional_id  uuid references profissionais(id) on delete cascade,
  nome             text not null,
  telefone         text,
  email            text,
  data_nascimento  date,
  convenio_id      uuid references convenios(id),
  estado_civil     text,
  conjuge_nome     text,
  conjuge_idade    text,
  filhos           jsonb default '[]',
  profissao        text,
  trabalhando      boolean,
  cidade           text,
  estado           text,
  origem           text,
  plano_sessoes    int default 0,
  obs              text,
  ativo            boolean default true,
  created_at       timestamptz default now()
);

-- ── PRÉ-CADASTROS ─────────────────────────────────────────
create table pre_cadastros (
  id               uuid primary key default uuid_generate_v4(),
  profissional_id  uuid references profissionais(id) on delete cascade,
  nome             text not null,
  telefone         text not null,
  email            text,
  data_nascimento  date,
  convenio         text,
  estado_civil     text,
  conjuge_nome     text,
  conjuge_idade    text,
  filhos           jsonb default '[]',
  profissao        text,
  trabalhando      boolean,
  cidade           text,
  estado           text,
  origem           text,
  obs              text,
  status           text default 'pendente',
  paciente_id      uuid references pacientes(id),
  created_at       timestamptz default now()
);

-- ── AGENDAMENTOS ──────────────────────────────────────────
create table agendamentos (
  id                uuid primary key default uuid_generate_v4(),
  profissional_id   uuid references profissionais(id) on delete cascade,
  paciente_id       uuid references pacientes(id) on delete cascade,
  tipo_id           uuid references tipos_atendimento(id),
  data              date not null,
  hora              time not null,
  status            text default 'aguardando',
  valor             numeric(10,2) default 0,
  pago              boolean default false,
  lembrete          boolean default false,
  recorrencia_grupo text,
  created_at        timestamptz default now()
);

-- ── PRONTUÁRIOS ───────────────────────────────────────────
create table prontuarios (
  id              uuid primary key default uuid_generate_v4(),
  paciente_id     uuid references pacientes(id) on delete cascade,
  agendamento_id  uuid references agendamentos(id),
  data            date not null,
  humor           int check (humor between 1 and 5),
  anotacoes       text,
  plano           text,
  created_at      timestamptz default now()
);

-- ── ANAMNESES ─────────────────────────────────────────────
create table anamneses (
  id                 uuid primary key default uuid_generate_v4(),
  paciente_id        uuid references pacientes(id) on delete cascade unique,
  queixa_principal   text,
  historico          text,
  medicamentos       text,
  alergias           text,
  historico_familiar text,
  objetivos          text,
  observacoes        text,
  data               date,
  created_at         timestamptz default now()
);

-- ── MAPEAMENTOS PESSOAIS ──────────────────────────────────
create table mapeamentos (
  id                      uuid primary key default uuid_generate_v4(),
  paciente_id             uuid references pacientes(id) on delete cascade unique,
  status                  text default 'pendente',
  apresentacao            text,
  cor_favorita            text,
  musica_favorita         text,
  frase_vida              text,
  nome_pai                text,
  nome_mae                text,
  filhos_desc             text,
  conjuge                 text,
  melhor_amigo_infancia   text,
  sonho_infancia          text,
  algo_para_gritar        text,
  alimentos_ama           text,
  alimentos_detesta       text,
  dia_mais_feliz          text,
  dia_esquecer            text,
  faria_sem_dinheiro      text,
  sonho_compravel         text,
  sonho_nao_compravel     text,
  pontos_melhorar         text,
  qualidades_outros       text,
  qualidades_proprias     text,
  pessoas_admiradas       text,
  temperamento_primario   text,
  temperamento_secundario text,
  sinto_amado             text,
  linguagem_amor          text,
  perfil_inteligencia     text,
  disc                    text,
  talentos_clifton        text,
  momento_profissional    text,
  como_ser_lembrado       text,
  created_at              timestamptz default now()
);

-- ── TCLE ──────────────────────────────────────────────────
create table tcles (
  id               uuid primary key default uuid_generate_v4(),
  paciente_id      uuid references pacientes(id) on delete cascade unique,
  assinado         boolean default false,
  assinatura       text,
  data_assinatura  date,
  created_at       timestamptz default now()
);

-- ── ESCALAS CLÍNICAS ──────────────────────────────────────
create table escalas (
  id             uuid primary key default uuid_generate_v4(),
  paciente_id    uuid references pacientes(id) on delete cascade,
  tipo           text not null,
  score          int,
  classificacao  text,
  respostas      jsonb default '[]',
  data           date not null,
  created_at     timestamptz default now()
);

-- ── OBJETIVOS DO PROCESSO ─────────────────────────────────
create table metas (
  id          uuid primary key default uuid_generate_v4(),
  paciente_id uuid references pacientes(id) on delete cascade unique,
  lista       jsonb default '[]',
  created_at  timestamptz default now()
);

-- ── RELATÓRIO DE ALTA ─────────────────────────────────────
create table altas (
  id                   uuid primary key default uuid_generate_v4(),
  paciente_id          uuid references pacientes(id) on delete cascade unique,
  data_inicio          date,
  data_alta            date,
  total_sessoes        int,
  motivo_alta          text,
  objetivos_alcancados text,
  evolucao_clinica     text,
  recomendacoes        text,
  retorno_previsto     text,
  observacoes          text,
  created_at           timestamptz default now()
);

-- ── LISTA DE ESPERA ───────────────────────────────────────
create table lista_espera (
  id                uuid primary key default uuid_generate_v4(),
  profissional_id   uuid references profissionais(id) on delete cascade,
  nome              text not null,
  telefone          text,
  email             text,
  queixa            text,
  prioridade        text default 'normal',
  dias_preferencia  jsonb default '[]',
  turno_preferencia text,
  data_entrada      date default current_date,
  status            text default 'aguardando',
  created_at        timestamptz default now()
);

-- ── DESPESAS ──────────────────────────────────────────────
create table despesas (
  id              uuid primary key default uuid_generate_v4(),
  profissional_id uuid references profissionais(id) on delete cascade,
  descricao       text not null,
  valor           numeric(10,2) not null,
  data            date not null,
  categoria       text,
  created_at      timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profissionais     enable row level security;
alter table convenios         enable row level security;
alter table tipos_atendimento enable row level security;
alter table pacientes         enable row level security;
alter table pre_cadastros     enable row level security;
alter table agendamentos      enable row level security;
alter table prontuarios       enable row level security;
alter table anamneses         enable row level security;
alter table mapeamentos       enable row level security;
alter table tcles             enable row level security;
alter table escalas           enable row level security;
alter table metas             enable row level security;
alter table altas             enable row level security;
alter table lista_espera      enable row level security;
alter table despesas          enable row level security;

-- Helper: id do profissional do usuário logado
create or replace function meu_profissional_id()
returns uuid language sql stable security definer as $$
  select id from profissionais where user_id = auth.uid() limit 1;
$$;

-- Profissionais: cada um vê/edita só o seu
create policy "own" on profissionais for all using (user_id = auth.uid());

-- Convênios e tipos: filtra por profissional
create policy "own" on convenios         for all using (profissional_id = meu_profissional_id());
create policy "own" on tipos_atendimento for all using (profissional_id = meu_profissional_id());
create policy "own" on lista_espera      for all using (profissional_id = meu_profissional_id());
create policy "own" on despesas          for all using (profissional_id = meu_profissional_id());
create policy "own" on agendamentos      for all using (profissional_id = meu_profissional_id());

-- Pacientes: filtra por profissional
create policy "own" on pacientes         for all using (profissional_id = meu_profissional_id());

-- Pré-cadastros: público insere, profissional gerencia
create policy "public_insert" on pre_cadastros for insert with check (true);
create policy "own"           on pre_cadastros for select using (profissional_id = meu_profissional_id());
create policy "own_update"    on pre_cadastros for update using (profissional_id = meu_profissional_id());
create policy "own_delete"    on pre_cadastros for delete using (profissional_id = meu_profissional_id());

-- Tabelas vinculadas ao paciente: acesso via ownership do paciente
create policy "own" on prontuarios for all using (
  paciente_id in (select id from pacientes where profissional_id = meu_profissional_id())
);
create policy "own" on anamneses for all using (
  paciente_id in (select id from pacientes where profissional_id = meu_profissional_id())
);
create policy "own" on tcles for all using (
  paciente_id in (select id from pacientes where profissional_id = meu_profissional_id())
);
create policy "own" on escalas for all using (
  paciente_id in (select id from pacientes where profissional_id = meu_profissional_id())
);
create policy "own" on metas for all using (
  paciente_id in (select id from pacientes where profissional_id = meu_profissional_id())
);
create policy "own" on altas for all using (
  paciente_id in (select id from pacientes where profissional_id = meu_profissional_id())
);

-- Mapeamentos: público insere (formulário externo), profissional gerencia
create policy "public_insert" on mapeamentos for insert with check (true);
create policy "own"           on mapeamentos for select using (
  paciente_id in (select id from pacientes where profissional_id = meu_profissional_id())
);
create policy "own_update" on mapeamentos for update using (
  paciente_id in (select id from pacientes where profissional_id = meu_profissional_id())
);
