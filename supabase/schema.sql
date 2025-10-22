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
  if not exists (select 1 from pg_policies where policyname = 'products_public_select' and tablename = 'products') then
    create policy products_public_select on products for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'products_insert' and tablename = 'products') then
    create policy products_insert on products for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'products_update' and tablename = 'products') then
    create policy products_update on products for update using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'products_delete' and tablename = 'products') then
    create policy products_delete on products for delete using (true);
  end if;
end $$;

create table if not exists retail_margins (
  product_id text primary key references products(id) on delete cascade,
  margem numeric not null
);
alter table retail_margins enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'retail_public_select' and tablename = 'retail_margins') then
    create policy retail_public_select on retail_margins for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'retail_insert' and tablename = 'retail_margins') then
    create policy retail_insert on retail_margins for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'retail_update' and tablename = 'retail_margins') then
    create policy retail_update on retail_margins for update using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'retail_delete' and tablename = 'retail_margins') then
    create policy retail_delete on retail_margins for delete using (true);
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
  if not exists (select 1 from pg_policies where policyname = 'wholesale_public_select' and tablename = 'wholesale_margins') then
    create policy wholesale_public_select on wholesale_margins for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'wholesale_insert' and tablename = 'wholesale_margins') then
    create policy wholesale_insert on wholesale_margins for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'wholesale_update' and tablename = 'wholesale_margins') then
    create policy wholesale_update on wholesale_margins for update using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'wholesale_delete' and tablename = 'wholesale_margins') then
    create policy wholesale_delete on wholesale_margins for delete using (true);
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
  if not exists (select 1 from pg_policies where policyname = 'expenses_public_select' and tablename = 'expenses') then
    create policy expenses_public_select on expenses for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'expenses_insert' and tablename = 'expenses') then
    create policy expenses_insert on expenses for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'expenses_update' and tablename = 'expenses') then
    create policy expenses_update on expenses for update using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'expenses_delete' and tablename = 'expenses') then
    create policy expenses_delete on expenses for delete using (true);
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
  if not exists (select 1 from pg_policies where policyname = 'customers_public_select' and tablename = 'customers') then
    create policy customers_public_select on customers for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'customers_insert_update' and tablename = 'customers') then
    -- keep combined name for backwards compat if present
    null;
  end if;
  if not exists (select 1 from pg_policies where policyname = 'customers_insert' and tablename = 'customers') then
    create policy customers_insert on customers for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'customers_update' and tablename = 'customers') then
    create policy customers_update on customers for update using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'customers_delete' and tablename = 'customers') then
    create policy customers_delete on customers for delete using (true);
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
  if not exists (select 1 from pg_policies where policyname = 'sales_public_select' and tablename = 'sales') then
    create policy sales_public_select on sales for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'sales_insert' and tablename = 'sales') then
    create policy sales_insert on sales for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'sales_update' and tablename = 'sales') then
    create policy sales_update on sales for update using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'sales_delete' and tablename = 'sales') then
    create policy sales_delete on sales for delete using (true);
  end if;
end $$;
