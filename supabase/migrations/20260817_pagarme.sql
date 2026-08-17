-- Campos de cobrança na tabela profissionais
alter table profissionais
  add column if not exists status                 text default 'pendente',
  add column if not exists pagarme_customer_id     text,
  add column if not exists pagarme_subscription_id text;

-- Índice para o webhook encontrar rapidamente pelo subscription_id
create index if not exists idx_prof_subscription
  on profissionais (pagarme_subscription_id);
