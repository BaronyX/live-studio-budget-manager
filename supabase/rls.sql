alter table brands enable row level security;
alter table fragrances enable row level security;
alter table references_master enable row level security;
alter table fragrance_references_map enable row level security;
alter table suppliers enable row level security;
alter table supplier_tiers enable row level security;
alter table fragrance_subfamilies_map enable row level security;
alter table fragrance_fit_products enable row level security;
alter table user_roles enable row level security;

create or replace function public.current_role() returns text
language sql stable as $$
  select coalesce((select role from user_roles where user_id = auth.uid()), 'sales');
$$;

create policy sales_read_fragrances on fragrances
for select using (public.current_role() in ('sales','rd','admin'));

create policy staff_read_all on brands for select using (true);
create policy staff_read_fragrances on fragrances for select using (true);
create policy staff_read_refs on references_master for select using (true);
create policy staff_read_maps on fragrance_references_map for select using (true);
create policy staff_read_sup on suppliers for select using (true);
create policy staff_read_tiers on supplier_tiers for select using (true);
create policy staff_read_subfam on fragrance_subfamilies_map for select using (true);
create policy staff_read_fit on fragrance_fit_products for select using (true);

create policy rd_write on fragrances
  for all using (public.current_role() in ('rd','admin')) with check (public.current_role() in ('rd','admin'));
create policy rd_write_sup on suppliers
  for all using (public.current_role() in ('rd','admin')) with check (public.current_role() in ('rd','admin'));
create policy rd_write_tier on supplier_tiers
  for all using (public.current_role() in ('rd','admin')) with check (public.current_role() in ('rd','admin'));
create policy rd_write_refs on references_master
  for all using (public.current_role() in ('rd','admin')) with check (public.current_role() in ('rd','admin'));
create policy rd_write_maps on fragrance_references_map
  for all using (public.current_role() in ('rd','admin')) with check (public.current_role() in ('rd','admin'));
create policy rd_write_subfam on fragrance_subfamilies_map
  for all using (public.current_role() in ('rd','admin')) with check (public.current_role() in ('rd','admin'));
create policy rd_write_fit on fragrance_fit_products
  for all using (public.current_role() in ('rd','admin')) with check (public.current_role() in ('rd','admin'));