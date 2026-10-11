-- LeadDesk: таблиця лідів за полями materials/leads.json
create table public.leads (
  id         text primary key,
  full_name  text not null,
  company    text not null,
  email      text not null,
  source     text not null,
  status     text not null default 'new'
             constraint leads_status_check
             check (status in ('new', 'contacted', 'qualified', 'won', 'lost')),
  budget     integer check (budget >= 0),
  message    text not null,
  created_at timestamptz not null default now()
);

-- Без політик доступ через anon/authenticated закритий; сервісна роль RLS обходить.
alter table public.leads enable row level security;
