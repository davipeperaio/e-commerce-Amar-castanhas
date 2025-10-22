-- Supabase schema for Amar Castanhas app
create table if not exists products (
  id text primary key,
  sku text not null,
  nome text not null,
  categoria text not null,
  descricao text,
  preco_compra numeric not null,
  prices jsonb not null,
  imagem_url text,
  unidade text not null default 'kg',
  ativo boolean not null default true,
  em_estoque boolean not null default true,
  available_weights text[] not null default array['200g','500g','1kg']
);

create table if not exists retail_margins (
  product_id text primary key references products(id) on delete cascade,
  margem numeric not null
);

create table if not exists wholesale_margins (
  product_id text primary key references products(id) on delete cascade,
  margem_3kg numeric not null,
  margem_5kg numeric not null,
  margem_10kg numeric not null
);

create table if not exists expenses (
  id text primary key,
  nome text not null,
  valor numeric not null,
  categoria text not null,
  data timestamp with time zone not null,
  observacoes text
);

create table if not exists customers (
  id text primary key,
  nome text not null,
  endereco text,
  telefone text,
  ativo boolean not null default true,
  created_at timestamp with time zone not null default now()
);

create table if not exists sales (
  id text primary key,
  date timestamp with time zone not null,
  customer_id text references customers(id) on delete set null,
  valor numeric not null,
  origem text not null,
  observacoes text
);

