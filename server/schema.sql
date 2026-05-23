create table if not exists users (
  id serial primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz default now()
);

create table if not exists categories (
  id serial primary key,
  name text not null unique,
  created_at timestamptz default now()
);

create table if not exists products (
  id serial primary key,
  title text not null,
  description text default '',
  price numeric(10, 2) not null,
  rating numeric(3, 2) default 0,
  stock integer default 0,
  thumbnail text default '',
  images text[] default '{}',
  category_id integer references categories(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists stock_orders (
  id serial primary key,
  order_code text not null,
  vendor text not null,
  eta text,
  items integer default 0,
  total numeric(12, 2) default 0,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists warehouse_docks (
  id serial primary key,
  dock_name text not null,
  status text default 'idle',
  carrier text default '',
  eta text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_category_id on products(category_id);
create index if not exists idx_products_title on products(title);
