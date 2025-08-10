insert into fragrance_families (id, slug, name) values
  ('floral','floral','Floral') on conflict (id) do nothing;
insert into fragrance_families (id, slug, name) values
  ('citrus','citrus','Citrus') on conflict (id) do nothing;
insert into fragrance_families (id, slug, name) values
  ('woody','woody','Woody') on conflict (id) do nothing;

insert into product_categories (id, slug, name) values
  ('shampoo','shampoo','Shampoo') on conflict (id) do nothing;
insert into product_categories (id, slug, name) values
  ('bodywash','bodywash','Body Wash') on conflict (id) do nothing;
insert into product_categories (id, slug, name) values
  ('lotion','lotion','Lotion') on conflict (id) do nothing;
insert into product_categories (id, slug, name) values
  ('detergent','detergent','Detergent') on conflict (id) do nothing;

insert into brands (name, slug, is_active) values ('Harmonia Perfume','harmonia', true) on conflict (slug) do nothing;
insert into brands (name, slug, is_active) values ('Bloom Labs','bloom', true) on conflict (slug) do nothing;
insert into brands (name, slug, is_active) values ('Noir Essence','noir', false) on conflict (slug) do nothing;