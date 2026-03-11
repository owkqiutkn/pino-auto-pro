---
name: supabase-migrations
description: Guides the agent to design, write, and apply Supabase SQL migrations in this project using the local Supabase CLI and the existing migrations folder.
---

# Supabase Migrations Skill

Use this skill whenever the user asks to change the database schema or seed data for the Supabase project in this repo.

## When to use

- Adding/removing columns, tables, indexes, or constraints.
- Introducing translated fields (e.g. `name_en`, `name_fr`) or new enums.
- Seeding or backfilling data that should be versioned alongside schema changes.

## Workflow

1. **Inspect existing migrations**
   - List files under `supabase/migrations/` to understand prior patterns and naming.
   - Prefer reusing existing conventions for timestamps and naming.

2. **Design the migration**
   - Keep changes idempotent and safe:
     - Use `ADD COLUMN IF NOT EXISTS` when adding columns.
     - For new non‑nullable columns on existing tables:
       1. Add them as nullable.
       2. Backfill from existing data.
       3. Set `NOT NULL` once data is consistent.
   - Avoid dropping columns/tables without explicit user approval.

3. **Create the migration file**
   - Choose a filename like `YYYYMMDDHHMMSS_short_description.sql`.
   - Place it under `supabase/migrations/`.
   - Write plain SQL only (no psql meta‑commands).

4. **Apply the migration using the local CLI**
   - From the `supabase/` directory, run:

     ```bash
     & "c:\\Users\\Playd\\Documents\\projects\\pino-auto-pro\\node_modules\\supabase\\bin\\supabase.exe" db push
     ```

   - Read CLI output:
     - If it confirms “Finished supabase db push.”, consider the migration applied.
     - If it prompts for confirmation, rely on the user’s environment to accept; do not fabricate answers.

5. **Update TypeScript types**

   - After schema changes, update `nextjs/src/lib/types.ts` so `Database` matches the new Supabase schema.
   - Update any helper methods in `nextjs/src/lib/supabase/unified.ts` and related files to select/insert/update the new fields.

6. **Wire up application code**

   - Adjust API routes, React components, and helpers to read/write the new fields.
   - Use feature‑flag‑like fallbacks (e.g. fall back to legacy columns) when migrating in multiple steps.

## Example: bilingual columns for exterior_colors

- Migration:

```sql
ALTER TABLE public.exterior_colors
ADD COLUMN IF NOT EXISTS name_en text,
ADD COLUMN IF NOT EXISTS name_fr text;

UPDATE public.exterior_colors
SET
  name_en = COALESCE(name_en, name),
  name_fr = COALESCE(name_fr, name);

ALTER TABLE public.exterior_colors
ALTER COLUMN name_en SET NOT NULL,
ALTER COLUMN name_fr SET NOT NULL;
```

- Types and helpers:
  - Extend `Database["public"]["Tables"]["exterior_colors"]["Row"]` with `name_en` and `name_fr`.
  - Update Supabase helpers to select and update these fields, falling back to `name` only when necessary.

