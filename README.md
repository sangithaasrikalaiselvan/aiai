## GlobeTrotter (Vite + React + TS)

### Setup

1. Install deps: `npm install`
2. Configure Supabase env vars in `.env.local`:
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Create the database tables in your Supabase project:
   - Run the SQL in `supabase/migrations/20260103031657_create_globetrotter_schema.sql` in Supabase Dashboard → SQL Editor
4. Run dev server: `npm run dev`

If the app shows a "Configuration required" screen, your Supabase env vars are missing.
