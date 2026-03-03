create table if not exists public.shop_products (
  id text primary key,
  name text not null,
  brand text not null default 'Sirdavid',
  condition text not null default 'Used - Good',
  category text not null default 'Accessories',
  base_price_usd numeric not null default 0,
  stock integer not null default 0,
  image text,
  details text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shop_settings (
  id smallint primary key check (id = 1),
  shipping_mode text not null default 'hybrid',
  flat_usd numeric not null default 15,
  percent_rate numeric not null default 0.03,
  min_usd numeric not null default 15,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shop_products_sort_idx on public.shop_products (sort_order asc, created_at desc);
create index if not exists shop_products_active_idx on public.shop_products (is_active);

insert into public.shop_settings (id, shipping_mode, flat_usd, percent_rate, min_usd)
values (1, 'hybrid', 15, 0.03, 15)
on conflict (id) do nothing;

insert into public.shop_products (
  id,
  name,
  brand,
  condition,
  category,
  base_price_usd,
  stock,
  image,
  details,
  is_active,
  sort_order
)
values
  (
    'iphone-13-used',
    'iPhone 13',
    'Apple',
    'Used - Excellent',
    'Phones',
    520,
    4,
    'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&w=900&q=80',
    '128GB, battery health 89%, unlocked and fully tested.',
    true,
    10
  ),
  (
    's24-new',
    'Samsung Galaxy S24',
    'Samsung',
    'New',
    'Phones',
    760,
    6,
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80',
    'Factory sealed, dual SIM, one-year manufacturer warranty.',
    true,
    20
  ),
  (
    'xps13-used',
    'Dell XPS 13',
    'Dell',
    'Used - Very Good',
    'Laptops',
    680,
    3,
    'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=900&q=80',
    'Core i7, 16GB RAM, 512GB SSD, fresh OS install included.',
    true,
    30
  ),
  (
    'airpods-pro-new',
    'AirPods Pro (2nd Gen)',
    'Apple',
    'New',
    'Accessories',
    210,
    10,
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f37?auto=format&fit=crop&w=900&q=80',
    'Original package with active noise cancellation support.',
    true,
    40
  ),
  (
    'ps5-used',
    'PlayStation 5',
    'Sony',
    'Used - Excellent',
    'Gaming',
    440,
    5,
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=80',
    'Includes one controller, HDMI cable, and power cable.',
    true,
    50
  ),
  (
    'watch-9-new',
    'Apple Watch Series 9',
    'Apple',
    'New',
    'Wearables',
    350,
    7,
    'https://images.unsplash.com/photo-1579586337278-3f436f25d4d6?auto=format&fit=crop&w=900&q=80',
    '45mm GPS model with original charger and strap.',
    true,
    60
  )
on conflict (id) do nothing;
