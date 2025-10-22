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
alter table products enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname = 'products_public_select') then
    create policy products_public_select on products for select using (true);
  end if;
end $$;

create table if not exists retail_margins (
  product_id text primary key references products(id) on delete cascade,
  margem numeric not null
);
alter table retail_margins enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname = 'retail_public_select') then
    create policy retail_public_select on retail_margins for select using (true);
  end if;
end $$;

create table if not exists wholesale_margins (
  product_id text primary key references products(id) on delete cascade,
  margem_3kg numeric not null,
  margem_5kg numeric not null,
  margem_10kg numeric not null
);
alter table wholesale_margins enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname = 'wholesale_public_select') then
    create policy wholesale_public_select on wholesale_margins for select using (true);
  end if;
end $$;

create table if not exists expenses (
  id text primary key,
  nome text not null,
  valor numeric not null,
  categoria text not null,
  data timestamp with time zone not null,
  observacoes text
);
alter table expenses enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname = 'expenses_public_select') then
    create policy expenses_public_select on expenses for select using (true);
  end if;
end $$;

create table if not exists customers (
  id text primary key,
  nome text not null,
  endereco text,
  telefone text,
  ativo boolean not null default true,
  created_at timestamp with time zone not null default now()
);
alter table customers enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname = 'customers_public_select') then
    create policy customers_public_select on customers for select using (true);
  end if;
  if not exists (select 1 from pg_policies where polname = 'customers_insert_update') then
    create policy customers_insert_update on customers for insert with check (true);
    create policy customers_update on customers for update using (true) with check (true);
  end if;
end $$;

create table if not exists sales (
  id text primary key,
  date timestamp with time zone not null,
  customer_id text references customers(id) on delete set null,
  valor numeric not null,
  origem text not null,
  observacoes text
);
alter table sales enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where polname = 'sales_public_select') then
    create policy sales_public_select on sales for select using (true);
  end if;
  if not exists (select 1 from pg_policies where polname = 'sales_insert_update') then
    create policy sales_insert on sales for insert with check (true);
    create policy sales_update on sales for update using (true) with check (true);
  end if;
end $$;
