# Platforma Marketing

Platformă de social media marketing bazată pe agenți AI, pentru afaceri mici și agenții (câte un proiect pentru fiecare client).

Planul complet (agenți, modele, arhitectură, roadmap) e în documentul de schelet din proiect.

## Pornire locală (pas cu pas)

Ai nevoie doar de [Node.js 22](https://nodejs.org/) (varianta LTS, minim 22.13) și de Git.

```bash
git clone https://github.com/AdrianEmanuel00/Platforma--Marketing.git
cd Platforma--Marketing
npm install
npm run dev
```

Deschide http://localhost:3000, alege unul din cele două conturi (agenție sau afacere) și gata.

- **Datele se salvează local**, în baza SQLite `.data/platforma.db`, creată automat la prima pornire. Nu trebuie instalat nimic în plus. Ca să o iei de la zero, oprește aplicația și șterge folderul `.data`, sau folosește „Resetează datele” din Setări.
- **Fără chei AI**, agenții de cuvinte cheie și de competitori dau rezultate exemplu (marcate ca atare), iar Studio scrie texte exemplu. Așa poți încerca toate ecranele gratuit.
- **Cu chei AI**, agenții lucrează pe bune. Copiază `.env.example` în `.env.local`, completează cheile de mai jos și repornește `npm run dev`.

### Ce poți testa

| Ecran | Ce face |
| --- | --- |
| Identitate de brand → Segmente de public | Publicuri diferite, fiecare cu stilul lui vizual (ex.: 45+ preferă imagini brute, sub 33 imagini editate) |
| Studio de conținut | Alegi pentru ce segment e postarea și dai indicații libere pentru imagine sau video |
| Cuvinte cheie | Interesul de acum comparat cu aceeași perioadă de anul trecut și ce urmează să crească, ca să postezi înainte de vârf |
| Competitori | Fișă per competitor: ce vinde pe site, unde e activ, ce reclame plătite are și unde îl poți depăși |
| Research, Serii, Calendar | Trenduri și idei zilnice, serii care învață din istoric, programare |

## Structura

| Cale | Ce conține |
| --- | --- |
| `src/app/app` | Aplicația: toți clienții, setări |
| `src/app/app/[project]` | Ecranele unui client: dashboard, studio, calendar, research, brand, media, statistici, conturi |
| `src/lib/agents/registry.ts` | Agenții și modelele AI alese pentru fiecare |
| `src/lib/store.tsx` | Starea aplicației; se salvează prin `/api/state` |
| `src/lib/server/db.ts` | Baza locală SQLite (aici se schimbă când trecem pe Supabase) |
| `src/lib/supabase` | Clienții Supabase (browser și server) |
| `src/proxy.ts` | Reîmprospătează sesiunea și protejează `/app` |
| `supabase/migrations` | Schema bazei de date, cu Row Level Security |

## Agenții reali

Fără chei, agenții răspund cu rezultate exemplu. Cu chei, în Studio și Research lucrează modelele reale:

| Variabilă | Ce pornește | De unde o iei |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | Copywriter, Research, Cuvinte cheie și Competitori (Claude Opus 5.5, cu căutare pe web) | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| `FAL_KEY` | Creative: imaginea postării (Nano Banana Pro) | [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys) |

Local le pui în `.env.local`; pe Vercel, în Settings → Environment Variables, apoi Redeploy.

## Conectarea Supabase

1. Creează un proiect gratuit pe [supabase.com](https://supabase.com).
2. Rulează `supabase/migrations/0001_init.sql` în SQL Editor.
3. Copiază `.env.example` în `.env.local` și completează cheile.

## Publicare pe Vercel

Importă repo-ul pe [vercel.com/new](https://vercel.com/new) și adaugă aceleași variabile de mediu.
