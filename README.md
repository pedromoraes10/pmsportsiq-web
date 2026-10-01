# PM Sports IQ — Web

Next.js rebuild of the PM Sports IQ scouting platform's frontend. Talks
directly to the same Supabase project as the original app (no new project,
no data migration) — only the presentation layer is being rebuilt here,
screen by screen.

See the companion repo [`pmsportsiq`](https://github.com/pedromoraes10/pmsportsiq)
for the production app (Railway) and the scraper backend, which this project
does not touch.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the two Supabase values
npm run dev
```

## Environment variables

| Variable | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Same Supabase project as the existing app |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same anon key — public, scoped by Row Level Security |

## Status

Screen-by-screen rebuild, each validated against the production app before
moving to the next. Currently: Dashboard.
