insert into categories (name) values
  ('beauty'),
  ('fragrances'),
  ('furniture'),
  ('groceries'),
  ('home-decoration'),
  ('electronics')
on conflict do nothing;

insert into products (title, description, price, rating, stock, thumbnail, images, category_id)
select
  'Wireless Headset',
  'Noise cancelling, 24hr battery',
  129.00,
  4.6,
  42,
  'https://placehold.co/600x400?text=Headset',
  array['https://placehold.co/800x600?text=Headset'],
  (select id from categories where name = 'electronics' limit 1)
where not exists (select 1 from products where title = 'Wireless Headset');
