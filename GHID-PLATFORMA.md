# Ghidul platformei de marketing

Tot ce am stabilit până acum despre platformă și tot ce îți trebuie ca s-o pui pe Vercel.
Actualizat pe 18 noiembrie 2026.

Repo: https://github.com/AdrianEmanuel00/Platforma--Marketing

---

## 1. Pe scurt

O platformă de social media marketing făcută din mai mulți agenți AI. Fiecare agent are o treabă clară: construiește identitatea brandului, scrie și generează postările, face research de trenduri, urmărește cuvinte cheie și competitori, publică pe rețele.

- **Pentru cine:** afaceri mici care își fac singure marketingul și agenții care lucrează pentru clienți. O agenție deschide câte un proiect pentru fiecare client și gestionează totul acolo.
- **Pentru orice domeniu.** Agricultura a fost doar un exemplu. Platforma trebuie să meargă pentru orice tip de afacere.
- **Cine o construiește:** Adrian și Claude, împreună.
- **Când e gata v1:** când Adrian o folosește pentru 2 proiecte personale, găzduită gratuit pe Vercel.
- **Nume propus:** „Roi” (în cod, `APP_NAME` din `src/lib/brand.ts`). Încă neconfirmat.

## 2. Principii și preferințe

- **Calitatea pe primul loc.** Modelele AI cele mai bune, chiar dacă sunt scumpe (Claude Opus 5.5 pentru text, Nano Banana Pro pentru imagini). Pentru testare există o variantă ieftină, care se schimbă dintr-o singură variabilă.
- **Fără login și fără email.** Aplicația se deschide direct. Login-ul există în cod, dar e oprit (`AUTH_ENABLED` gol).
- **Fără bannere sau etichete de „demo”.** Rezultatele exemplu (când lipsesc cheile AI) sunt marcate discret, nu cu bannere.
- **Un schelet complet de la început**, apoi fiecare parte se face în profunzime, pas cu pas.
- **Fiecare pas mare se aprobă** de Adrian înainte să înceapă.
- Comunicarea e în română.

## 3. Agenții

| Agent | Ce face | Stare |
| --- | --- | --- |
| **Brand** | Construiește identitatea fiecărui business (ton, culori, stil vizual, reguli) din site, logo și postări vechi, și o păstrează pentru tot ce se generează după | Funcțional |
| **Segmente de public** (în Brand) | Publicuri diferite, fiecare cu direcția lui vizuală. Exemplu: 45+ reacționează mai bine la imagini brute, sub 33 la imagini editate, „mai AI” | Funcțional |
| **Copywriter** (Studio) | Textul postării, hashtag-uri, varianta pentru fiecare platformă, pe segmentul ales și cu indicații libere | Funcțional |
| **Creative** (Studio) | Imaginea postării, în identitatea brandului și în stilul segmentului. Video urmează | Imagini: funcțional. Video: lipsește |
| **Research** | Trenduri, ce fac alte pagini cu același tip de conținut, idei de postări care se trimit în Studio | Funcțional la cerere. Rularea zilnică automată lipsește |
| **Serii de conținut** | Serii pe brand; agentul învață din istoricul seriei ce a mers și propune următoarele postări | Funcțional |
| **Cuvinte cheie** | Interesul de acum comparat cu aceeași perioadă de anul trecut, ca să postezi înainte de vârf, nu după | Funcțional (estimat de Claude cu căutare pe web) |
| **Competitori** | Fișă per competitor: site, rețele, ce postează, reclame plătite, unde îl poți depăși | Funcțional |
| **Postare** | Publică pe rețelele conectate | Facebook și Instagram în PR #9. Programare automată lipsește |
| **Reclame Meta / Google** | Administrare reclame, buget sub control, „vizibilitatea ta față de competitori” ca argument de vânzare | Doar idee. Adrian nu are încă conturi de reclame |

### Ce s-a schimbat pe parcurs

- **6 nov:** Adrian a renunțat la „social-auto-upload” (automatizare prin browser, risc de blocare a conturilor). S-a discutat atunci restrângerea produsului pe research de trenduri plus analiză de profiluri (vezi `analize/pivot-research-trenduri.md`). Concluzia acelei analize: datele există la toți competitorii (Metricool, Sprout etc.), ce lipsește e interpretarea, adică un „strateg” care îți spune concret ce să postezi.
- **8 nov (mesaj vocal):** Adrian a revenit și vrea administrare de pagini (Facebook, Instagram, LinkedIn, TikTok, YouTube), generare de imagini și video pe baza research-ului și pe segmente de public, urmărirea competitorilor (site, rețele, reclame), agent de cuvinte cheie cu comparație față de anul trecut și administrare de reclame Meta și Google. Grupul de Facebook și comunitatea de WhatsApp sunt semne de întrebare (Meta permite puțin acolo).
- **9 nov:** platforma trebuie să fie generală, nu pentru agricultură. Adrian nu are conturi de reclame și nici bază de date, așa că s-a făcut un MVP care merge local fără nimic configurat.
- **10 nov:** variantă ieftină pentru testare (PR #8), apoi date în cloud și publicare reală pe Facebook și Instagram (PR #9).

### Ordinea propusă pentru ce urmează

1. Date persistente în cloud (făcut în PR #9, prin Supabase Storage)
2. Segmente de public și direcții vizuale (făcut)
3. Agent de cuvinte cheie (făcut)
4. Dosar de competitori (făcut)
5. Video
6. Conectări reale de conturi și publicare (Facebook și Instagram făcute în PR #9; urmează LinkedIn, TikTok, YouTube)
7. Reclame: întâi citire și recomandări, modificări doar cu aprobare
8. Raport „tu față de competitori”

## 4. Ecranele aplicației

Pentru fiecare client (proiect): Dashboard, Studio de conținut, Calendar, Research, Serii, Cuvinte cheie, Competitori, Identitate de brand, Media, Statistici, Conturi conectate. La nivel de cont: lista de clienți, client nou, Setări.

La prima deschidere alegi unul din cele două conturi pregătite: **agenția „Nord Social”** (3 clienți) sau **afacerea „Florăria Iris”** (un singur brand). Contul se ține minte în browser.

## 5. Tehnologie

| Parte | Ce folosim |
| --- | --- |
| Aplicație | Next.js 16 (App Router), React 19, Tailwind 4, TypeScript |
| Găzduire | Vercel (planul gratuit Hobby) |
| Date local | SQLite în `.data/platforma.db`, pornit automat când rulezi pe calculator |
| Date pe Vercel | Supabase Storage, un bucket privat `platforma-data` creat automat (PR #9). Fără chei Supabase, datele stau doar în browser |
| Bază de date „adevărată” | Supabase Postgres, schema e gata în `supabase/migrations/0001_init.sql` (cu Row Level Security), dar aplicația nu o folosește încă |
| Text AI | Claude, prin `@anthropic-ai/sdk`, cu căutare și citire pe web |
| Imagini AI | fal.ai (Nano Banana Pro) sau Pollinations (gratuit) |
| Rețele sociale | Meta Graph API (Facebook Pages + Instagram Business) |
| Node.js | minim 22.13 |

### Modelele AI

| Rol | Calitate maximă | Variantă ieftină (testare) |
| --- | --- | --- |
| Text (toți agenții) | Claude Opus 5.5 (`AI_TIER=maxim`) | Claude Haiku 5.5 (`AI_TIER=economic`, implicit) |
| Mijloc | Claude Sonnet 5.5 (`AI_TIER=echilibrat`) | |
| Imagini | Nano Banana Pro prin fal (`FAL_KEY`) | Pollinations, gratuit, fără cheie |
| Imagini + video, mai târziu | Higgsfield (`IMAGE_PROVIDER=higgsfield`), pregătit în cod dar neconectat | |

Atenție: varianta ieftină (`AI_TIER`) există doar după ce se face merge la PR #8 (sau #9, care îl include). Pe `main` acum, agenții folosesc direct Opus.

## 6. Unde suntem acum

**Pe `main` (ce vede Vercel acum):** toate ecranele, agenții de text și imagine, segmente de public, cuvinte cheie, competitori, serii, SQLite local, intrare fără login.

**Deschise, fără merge:**
- **PR #8**, variantă ieftină: Haiku implicit plus imagini gratuite. https://github.com/AdrianEmanuel00/Platforma--Marketing/pull/8
- **PR #9**, conține și #8: date în cloud prin Supabase, publicare reală pe Facebook și Instagram, parolă opțională pentru toată aplicația. https://github.com/AdrianEmanuel00/Platforma--Marketing/pull/9

Recomandare: fă merge la **PR #9** (îl include pe #8). Altfel Vercel nu are nici varianta ieftină, nici datele în cloud.

**Ce lipsește:**
- Rularea automată zilnică a agenților (Research, Cuvinte cheie, Competitori au programul trecut în cod, dar nimic nu le pornește singur)
- Programarea postărilor (calendarul salvează data, dar nu publică singur la ora aceea)
- Video
- LinkedIn, TikTok, YouTube
- Statistici reale din Meta (acum sunt exemple)
- Date reale de căutare pentru cuvinte cheie (acum sunt estimări ale lui Claude din web, nu Google Trends sau Keyword Planner)
- Reclame Meta și Google
- Mutarea datelor din Storage în tabele Postgres, când crește volumul
- Domeniul de producție de pe Vercel neverificat (vezi pasul 6 de mai jos)

---

## 7. Cum o pui pe Vercel, pas cu pas

### Pasul 1. Fă merge la PR #9

Deschide https://github.com/AdrianEmanuel00/Platforma--Marketing/pull/9 și apasă **Merge pull request**. Apoi închide PR #8 (e deja inclus). Vercel publică singur ce ajunge pe `main`.

### Pasul 2. Importă proiectul (doar dacă nu e deja importat)

Proiectul există deja în contul tău de Vercel (adresele `platforma-marketing-…-adrianemanuel007-6011s-projects.vercel.app`). Dacă îl faci de la zero:

1. Intră pe https://vercel.com/new și conectează-te cu GitHub.
2. La „Import Git Repository” alege `AdrianEmanuel00/Platforma--Marketing`. Dacă nu apare, apasă „Adjust GitHub App Permissions” și dă acces la repo.
3. Project Name: `platforma-marketing`.
4. Framework Preset: **Next.js** (îl detectează singur).
5. Root Directory: `./` (rădăcina).
6. Build and Output Settings: lasă-le pe cele implicite (Install `npm install`, Build `npm run build`, Output automat).
7. Adaugă variabilele de mediu de la pasul 3 (sau după, din Settings).
8. Apasă **Deploy**.

### Pasul 3. Variabilele de mediu

În Vercel: proiectul → **Settings → Environment Variables**. Pune-le pentru Production și Preview. După orice schimbare: **Deployments → ultimul deploy → ⋯ → Redeploy**, altfel nu se aplică.

**Pentru agenți (recomandat):**

| Variabilă | Valoare | De unde |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | `sk-ant-…` | https://console.anthropic.com/settings/keys (trebuie și credit în Billing) |
| `AI_TIER` | `economic` pentru testare, `maxim` pentru calitate | Tu alegi: `economic` (Haiku 5.5), `echilibrat` (Sonnet 5.5), `maxim` (Opus 5.5) |
| `FAL_KEY` | cheia fal | https://fal.ai/dashboard/keys (cu credit). Fără ea, imaginile vin gratuit de la Pollinations |
| `IMAGE_PROVIDER` | gol, `pollinations` sau `fal` | Opțional. Gol = `fal` dacă ai `FAL_KEY`, altfel `pollinations` |

Fără `ANTHROPIC_API_KEY` aplicația merge, dar agenții dau rezultate exemplu.

**Pentru date în cloud (recomandat, altfel datele stau doar în browserul în care lucrezi):**

| Variabilă | De unde |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | https://supabase.com → proiect nou (gratuit) → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Același loc, cheia **service_role** (secretă, nu o pune nicăieri public) |
| `SUPABASE_STATE_BUCKET` | Opțional, implicit `platforma-data`. Bucket-ul se creează singur |

Nu trebuie rulat niciun SQL pentru asta.

**Pentru Facebook și Instagram (când vrei publicare reală):**

| Variabilă | De unde |
| --- | --- |
| `META_APP_ID` | https://developers.facebook.com/apps → Create App → tip Business → App settings → Basic → App ID |
| `META_APP_SECRET` | Același loc, App Secret |
| `META_CONFIG_ID` | Opțional, doar dacă folosești „Facebook Login for Business” cu o configurație |
| `APP_URL` | Opțional. Adresa publică fixă, ex. `https://platforma-marketing.vercel.app`, ca linkul de întoarcere de la Facebook să fie mereu același |
| `TOKEN_ENCRYPTION_KEY` | Opțional dar recomandat. 32 de octeți în base64; o generezi cu `openssl rand -base64 32`. Fără ea, cheia se derivă din `META_APP_SECRET` |
| `META_GRAPH_VERSION` | Opțional, implicit `v23.0` |

Pașii în aplicația Meta:
1. Adaugă produsul **Facebook Login**.
2. La „Valid OAuth Redirect URIs” pune `https://<adresa-ta>/api/connect/meta/callback`. Adresa exactă apare și în aplicație, la Conturi conectate.
3. Permisiunile cerute: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `business_management`, `instagram_basic`, `instagram_content_publish`.
4. Cât timp aplicația Meta e în modul Development, merge doar pentru conturile cu rol în ea (tu). Pentru proiectele tale e suficient.
5. În platformă: Conturi conectate → Conectează cu Facebook → alegi pagina. Instagram-ul Business legat de pagină vine automat. Instagram cere întotdeauna o imagine.

**Protecție:**

| Variabilă | Ce face |
| --- | --- |
| `APP_PASSWORD` | Opțional. O parolă cerută o singură dată pe fiecare dispozitiv. Pune-o după ce conectezi conturi reale, ca nimeni cu linkul să nu poată publica pe pagina ta |

**Nu pune pe Vercel:**

| Variabilă | De ce |
| --- | --- |
| `AUTH_ENABLED` | Lasă gol. Cu `true` (și cheile Supabase anon) pornește login-ul cu email, pe care nu îl vrei |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Folosită doar de login. Nu strică dacă e pusă, dar nu e necesară |
| `LOCAL_DB`, `LOCAL_DB_PATH` | Doar pentru rularea pe calculator. Pe Vercel SQLite e oprit automat |
| `HIGGSFIELD_API_KEY` | Integrarea Higgsfield nu e încă scrisă |
| `META_GRAPH_URL` | Doar pentru teste locale |

### Pasul 4. Oprește protecția Vercel (Deployment Protection)

Altfel Vercel cere login în contul Vercel înainte să vezi aplicația.

Proiectul → **Settings → Deployment Protection → Vercel Authentication** → pune pe **Disabled** → Save. (După ultimele note, la tine e deja oprită; verifică totuși.)

### Pasul 5. Durata funcțiilor

Agenții de research, cuvinte cheie și competitori pot lucra până la 5 minute (`maxDuration = 300` în cod). Pe Hobby asta merge cu **Fluid Compute** pornit (e implicit la proiectele noi). Verifică în Settings → Functions că Fluid Compute e activ. Dacă un agent se oprește brusc după 60 de secunde, de aici e problema.

### Pasul 6. Verifică domeniul de producție

Pe 6 noiembrie, `https://platforma-marketing.vercel.app` a dat „page not found”, în timp ce adresa de branch mergea:
https://platforma-marketing-git-main-adrianemanuel007-6011s-projects.vercel.app/app

Ce verifici:
1. Proiectul → **Settings → Domains**. Uită-te ce domeniu `.vercel.app` e trecut ca Production. Numele poate fi diferit (de ex. `platforma-marketing-xyz.vercel.app`), pentru că `platforma-marketing.vercel.app` poate fi ocupat de alt cont. Folosește ce scrie acolo.
2. Dacă lista e goală: **Add Domain** → scrie un nume liber, de ex. `platforma-roi.vercel.app`.
3. **Settings → Git → Production Branch** trebuie să fie `main`.
4. **Deployments**: ultimul deploy de pe `main` trebuie să fie „Ready” și marcat **Production**. Dacă nu, ⋯ → **Promote to Production**.
5. Deschide domeniul cu `/app` la final. Pagina principală trimite oricum acolo.
6. După ce ai domeniul final, pune-l în `APP_URL` și în redirect-ul din aplicația Meta.

### Pasul 7. Test rapid după deploy

1. Deschide `<domeniu>/app` și alege un cont.
2. Setări arată ce chei sunt active (Claude, nivelul AI, furnizorul de imagini).
3. Studio → generează o postare. Ar trebui să vină text real și o imagine.
4. Deschide aplicația pe telefon: dacă vezi aceleași date, stocarea în Supabase merge.

## 8. Rulare pe calculator

Ai nevoie de Node.js 22 (minim 22.13) și Git.

```bash
git clone https://github.com/AdrianEmanuel00/Platforma--Marketing.git
cd Platforma--Marketing
npm install
cp .env.example .env.local   # completezi cheile pe care le ai
npm run dev
```

Deschizi http://localhost:3000. Datele se salvează în `.data/platforma.db`. Ca s-o iei de la zero, oprești aplicația și ștergi folderul `.data`, sau folosești „Resetează datele” din Setări.

## 9. Unde sunt lucrurile în cod

| Cale | Ce e acolo |
| --- | --- |
| `src/app/app/[project]/` | Ecranele unui client |
| `src/app/api/agents/` | Agenții: brand, studio, research, series, keywords, competitor, status |
| `src/app/api/connect/meta/`, `src/app/api/publish/` | Conectarea și publicarea pe Facebook și Instagram (PR #9) |
| `src/lib/agents/` | Logica fiecărui agent și registrul lor (`registry.ts`) |
| `src/lib/ai/clients.ts` | Alegerea modelului Claude (`AI_TIER`) |
| `src/lib/ai/images.ts` | Furnizorii de imagini (`IMAGE_PROVIDER`) |
| `src/lib/store.tsx` | Starea aplicației, salvată prin `/api/state` |
| `src/lib/server/db.ts`, `src/lib/server/kv.ts` | Stocarea: SQLite local sau Supabase Storage |
| `src/proxy.ts` | Parola opțională și login-ul (oprit) |
| `supabase/migrations/0001_init.sql` | Schema Postgres pentru mai târziu |
| `.env.example` | Toate variabilele, cu explicații |

## 10. Documente și fișiere legate

- Analiza pivotului spre research de trenduri: `analize/pivot-research-trenduri.md`
- Transcrierea mesajului vocal din 8 nov: `analize/transcriere-mesaj-vocal-2026-11-08.txt`
- Capturi de ecran: `screenshots/` (dashboard, studio, calendar, research, brand, clienți)
- Documentul de schelet: https://claude.ai/artifact/XSJZhwfZ3UU16N6ozSKasa
- Propuneri de îmbunătățiri: https://claude.ai/artifact/UcKDRAuSqRyExAgZutTjw9
- Planul după mesajul vocal: https://claude.ai/artifact/7GbEYNnodZbVt3dN5XP9ex
