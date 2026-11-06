# Platforma Marketing

Platformă de social media marketing bazată pe agenți AI, pentru afaceri mici și agenții (câte un proiect pentru fiecare client).

Planul complet (agenți, modele, arhitectură, roadmap) e în documentul de schelet din proiect.

## Pornire locală

```bash
npm install
npm run dev
```

Deschide http://localhost:3000. Fără chei Supabase, aplicația rulează în **modul demo**, pe datele din `src/lib/demo-data.ts`.

## Structura

| Cale | Ce conține |
| --- | --- |
| `src/app/app` | Aplicația: toți clienții, setări |
| `src/app/app/[project]` | Ecranele unui client: dashboard, studio, calendar, research, brand, media, statistici, conturi |
| `src/lib/agents/registry.ts` | Agenții și modelele AI alese pentru fiecare |
| `src/lib/supabase` | Clienții Supabase (browser și server) |
| `src/proxy.ts` | Reîmprospătează sesiunea și protejează `/app` |
| `supabase/migrations` | Schema bazei de date, cu Row Level Security |

## Agenții reali

Fără chei, agenții răspund cu date demo. Cu chei, în Studio și Research lucrează modelele reale:

| Variabilă | Ce pornește | De unde o iei |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Copywriter și Research (Claude Opus 5.5, cu căutare pe web) | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| `FAL_KEY` | Creative: imaginea postării (Nano Banana Pro) | [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys) |

Local le pui în `.env.local`; pe Vercel, în Settings → Environment Variables, apoi Redeploy.

## Conectarea Supabase

1. Creează un proiect gratuit pe [supabase.com](https://supabase.com).
2. Rulează `supabase/migrations/0001_init.sql` în SQL Editor.
3. Copiază `.env.example` în `.env.local` și completează cheile.

## Publicare pe Vercel

Importă repo-ul pe [vercel.com/new](https://vercel.com/new) și adaugă aceleași variabile de mediu.
