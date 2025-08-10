# SPC Fragrance MVP

Frontend: React + Vite + TypeScript + Tailwind. State: React Hooks. Auth/DB: Supabase (Auth + Postgres + RLS). Two modes supported: Local Demo and Online (Supabase).

## Local Demo (no Supabase)

1. Install deps
   - pnpm: `pnpm i`
2. Create empty env to force demo: `cp .env.example .env`
3. Run: `pnpm dev`
4. Demo login (top-right): `rd1234` (R&D) or `admin1234` (Admin). `logout` to go back to Sales.

## Online Mode (Supabase)

1. Create a Supabase project.
2. In SQL editor, run in order:
   - `supabase/schema.sql`
   - `supabase/rls.sql`
   - `supabase/seed.sql` (optional master data)
3. Create roles mapping for users: insert into `user_roles (user_id, role)` after the user signs up.
4. Put env values in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Start app: `pnpm dev`

### Migrations

- Versioned SQLs live at `supabase/migrations/*.sql`. Apply in order.
- Create a backward-compatible view if schema changes: `fragrances_view` that joins refs/suppliers/tiers/fits to support older frontends.

Example view (start point; adjust as schema evolves):

```sql
create or replace view fragrances_view as
select f.*,
  coalesce(json_agg(distinct rm.reference_id) filter (where rm.reference_id is not null), '[]') as reference_ids,
  coalesce(json_agg(distinct s.id) filter (where s.id is not null), '[]') as supplier_ids
from fragrances f
left join fragrance_references_map rm on rm.fragrance_id = f.id
left join suppliers s on s.fragrance_id = f.id
group by f.id;
```

## Deploy (Vercel/Netlify)

- Build: `pnpm build`
- Output: `dist/`
- Provide env `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in project settings.

## Backup

- Use Supabase PITR for point-in-time. Additionally schedule a daily export to Storage/S3 (SQL or JSON) for redundancy.

## Scripts

- Export JSON (all tables): `pnpm export:json`
- Import JSON: `pnpm import:json path/to/file.json`

## Tests

- Unit tests (Vitest): `pnpm test`

## Acceptance Criteria mapping

- Sales sees only active with recommended suppliers verified ≤ 6 months: filtering handled in UI logic; RLS allows read-only.
- Create/Edit formulas with suppliers/tiers and correct price calc: modal form validates and uses utility `calcPrice`.
- Search by name/code/brand/ref/family/fit supported.
- Light/Dark theme toggle with CSS variables and persistence.
- Schema + RLS included; Online Mode uses Supabase client. Demo Mode works without `.env`.
- Deployable on Vercel/Netlify; JSON export/import scripts included.