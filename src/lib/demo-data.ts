// Date demo folosite până conectăm Supabase. Tot ce e aici va veni din baza de date.
import type {
  AgentRun,
  Member,
  Post,
  Project,
  ResearchReport,
  Workspace,
} from "./types";

export const workspace: Workspace = {
  id: "ws_demo",
  name: "Agenția Demo",
  kind: "agency",
  plan: "agency",
};

export const members: Member[] = [
  { id: "m1", name: "Adrian", email: "adrian@example.com", role: "owner", projectIds: [] },
  { id: "m2", name: "Ioana Pop", email: "ioana@example.com", role: "editor", projectIds: ["p_boabe", "p_fitzone"] },
  { id: "m3", name: "Mihai Ene", email: "mihai@example.com", role: "viewer", projectIds: ["p_lemn"] },
];

export const projects: Project[] = [
  {
    id: "p_boabe",
    slug: "boabe",
    name: "Cafeneaua Boabe",
    industry: "Cafenea de specialitate",
    website: "boabe.ro",
    goals: ["+20% clienți în weekend", "Lansarea abonamentului de cafea"],
    autopilot: false,
    connected: ["instagram", "facebook", "tiktok"],
    competitors: [
      { name: "Origo", handle: "@origocoffee", platform: "instagram" },
      { name: "Beans & Dots", handle: "@beansanddots", platform: "instagram" },
      { name: "Coffee Break", handle: "@coffeebreak.ro", platform: "tiktok" },
    ],
    brand: {
      colors: [
        { name: "Espresso", hex: "#3B2A20" },
        { name: "Cremă", hex: "#F3E9DC" },
        { name: "Caramel", hex: "#C8823D" },
        { name: "Mentă", hex: "#7FB7A4" },
      ],
      fonts: { heading: "Fraunces", body: "Inter" },
      logoText: "boabe.",
      voice: "Cald, prietenos, puțin poetic. Vorbim cu „tu”, fără jargon de barista.",
      audience: "25-40 de ani, lucrează remote sau în birouri din centru, caută un loc liniștit.",
      doWords: ["proaspăt prăjit", "ritual", "colțul tău"],
      dontWords: ["ieftin", "promoție agresivă", "cel mai bun din oraș"],
      visualStyle: "Lumină naturală caldă, mult spațiu gol, cești pe lemn, oameni din spate sau mâini.",
    },
  },
  {
    id: "p_fitzone",
    slug: "fitzone",
    name: "FitZone Studio",
    industry: "Sală de fitness",
    website: "fitzone.ro",
    goals: ["50 de abonamente noi în noiembrie"],
    autopilot: true,
    connected: ["instagram", "tiktok", "youtube"],
    competitors: [
      { name: "World Class", handle: "@worldclassro", platform: "instagram" },
      { name: "18GYM", handle: "@18gym", platform: "tiktok" },
    ],
    brand: {
      colors: [
        { name: "Negru", hex: "#111111" },
        { name: "Lime", hex: "#C6F432" },
        { name: "Gri", hex: "#8A8A8A" },
      ],
      fonts: { heading: "Space Grotesk", body: "Inter" },
      logoText: "FITZONE",
      voice: "Energic, direct, motivant, fără să rușineze pe nimeni.",
      audience: "20-35 de ani, începători și intermediari.",
      doWords: ["progres", "comunitate", "azi începi"],
      dontWords: ["corp perfect", "fără durere nu e câștig"],
      visualStyle: "Contrast mare, mișcare, lumină de sală, accent lime.",
    },
  },
  {
    id: "p_lemn",
    slug: "atelier-lemn",
    name: "Atelier Lemn",
    industry: "Mobilă la comandă",
    website: "atelierlemn.ro",
    goals: ["Cereri de ofertă pentru bucătării"],
    autopilot: false,
    connected: ["instagram", "facebook", "linkedin"],
    competitors: [{ name: "Mobexpert", handle: "@mobexpert", platform: "instagram" }],
    brand: {
      colors: [
        { name: "Stejar", hex: "#A47148" },
        { name: "Ivoriu", hex: "#FAF6EF" },
        { name: "Grafit", hex: "#2E2E2E" },
      ],
      fonts: { heading: "DM Serif Display", body: "DM Sans" },
      logoText: "Atelier Lemn",
      voice: "Calm, meșteșugăresc, sigur pe calitate.",
      audience: "Proprietari de case și apartamente noi, 30-55 de ani.",
      doWords: ["lucrat de mână", "pe măsură", "durează o viață"],
      dontWords: ["ieftin", "rapid"],
      visualStyle: "Detalii de textură, lumină laterală, înainte și după.",
    },
  },
];

export const posts: Post[] = [
  {
    id: "post1",
    projectId: "p_boabe",
    title: "Ritualul de dimineață",
    status: "scheduled",
    assetKind: "carousel",
    scheduledAt: "2026-11-06T08:30:00+02:00",
    source: "research",
    variants: [
      {
        platform: "instagram",
        caption: "Primul fir de lumină, prima ceașcă. Care e ritualul tău de dimineață? ☕",
        hashtags: ["#cafeneaboabe", "#ritualdedimineata", "#specialtycoffee"],
      },
      {
        platform: "facebook",
        caption: "Dimineața începe cu o ceașcă proaspăt prăjită. Te așteptăm de la 7:30.",
        hashtags: [],
      },
    ],
  },
  {
    id: "post2",
    projectId: "p_boabe",
    title: "Reel: cum prăjim boabele",
    status: "pending_approval",
    assetKind: "video",
    scheduledAt: "2026-11-07T18:00:00+02:00",
    source: "manual",
    variants: [
      {
        platform: "tiktok",
        caption: "De la boabă verde la ceașca ta, în 30 de secunde 🔥",
        hashtags: ["#coffeetok", "#roasting"],
      },
      {
        platform: "instagram",
        caption: "Proaspăt prăjit, în fiecare joi. Uite cum arată procesul.",
        hashtags: ["#cafeneaboabe"],
      },
    ],
  },
  {
    id: "post3",
    projectId: "p_boabe",
    title: "Abonamentul de cafea",
    status: "draft",
    assetKind: "image",
    scheduledAt: "2026-11-10T12:00:00+02:00",
    source: "calendar",
    variants: [
      {
        platform: "instagram",
        caption: "Cafeaua ta preferată, livrată lunar. Primul abonament vine cu o cană cadou.",
        hashtags: ["#abonamentcafea"],
      },
    ],
  },
  {
    id: "post4",
    projectId: "p_boabe",
    title: "Colțul tău de lucru",
    status: "published",
    assetKind: "image",
    scheduledAt: "2026-11-03T09:00:00+02:00",
    source: "research",
    variants: [
      {
        platform: "instagram",
        caption: "Wi-Fi rapid, prize la fiecare masă și liniștea de care ai nevoie.",
        hashtags: ["#remotework", "#cafeneaboabe"],
      },
    ],
    metrics: { reach: 4820, likes: 312, comments: 27, shares: 18 },
  },
  {
    id: "post5",
    projectId: "p_boabe",
    title: "Flat white vs latte",
    status: "published",
    assetKind: "video",
    scheduledAt: "2026-11-01T17:00:00+02:00",
    source: "research",
    variants: [
      { platform: "tiktok", caption: "Știi diferența? Îți arătăm în 15 secunde.", hashtags: ["#coffeetok"] },
    ],
    metrics: { reach: 12650, likes: 1430, comments: 96, shares: 211 },
  },
  {
    id: "post6",
    projectId: "p_boabe",
    title: "Weekend: brunch cu prietenii",
    status: "scheduled",
    assetKind: "image",
    scheduledAt: "2026-11-08T10:00:00+02:00",
    source: "calendar",
    variants: [
      { platform: "instagram", caption: "Sâmbătă e pentru brunch lung și povești.", hashtags: ["#brunch"] },
      { platform: "facebook", caption: "Brunch în fiecare weekend, 10:00-15:00.", hashtags: [] },
    ],
  },
  {
    id: "post7",
    projectId: "p_fitzone",
    title: "Provocarea de 30 de zile",
    status: "scheduled",
    assetKind: "video",
    scheduledAt: "2026-11-06T19:00:00+02:00",
    source: "research",
    variants: [
      { platform: "tiktok", caption: "30 de zile. 15 minute pe zi. Intri?", hashtags: ["#fitzone30"] },
    ],
  },
  {
    id: "post8",
    projectId: "p_lemn",
    title: "Bucătărie din stejar: înainte și după",
    status: "pending_approval",
    assetKind: "carousel",
    scheduledAt: "2026-11-09T11:00:00+02:00",
    source: "manual",
    variants: [
      { platform: "instagram", caption: "Trei săptămâni de lucru, o viață de folosit.", hashtags: ["#mobilalacomanda"] },
      { platform: "linkedin", caption: "Proiect finalizat: bucătărie din stejar masiv, 4,2 m.", hashtags: [] },
    ],
  },
];

export const researchReports: ResearchReport[] = [
  {
    id: "r1",
    projectId: "p_boabe",
    date: "2026-11-06",
    trends: [
      {
        title: "„Slow mornings”",
        detail: "Video-urile lente cu rutina de dimineață cresc pe TikTok și Reels, mai ales cu sunet ASMR.",
        momentum: "rising",
      },
      {
        title: "Băuturi de toamnă cu condimente",
        detail: "Căutările pentru chai și cafea cu scorțișoară sunt aproape de vârf.",
        momentum: "peak",
      },
      {
        title: "Latte art competitiv",
        detail: "Formatul „barista vs barista” scade după 3 săptămâni de vârf.",
        momentum: "fading",
      },
    ],
    competitorMoves: [
      {
        competitor: "Origo",
        what: "Carusel cu povestea fermierului din Etiopia",
        result: "3× mai multe salvări decât media lor",
      },
      {
        competitor: "Coffee Break",
        what: "TikTok cu clienți care ghicesc originea cafelei",
        result: "48.000 de vizualizări în 2 zile",
      },
    ],
    ideas: [
      {
        id: "i1",
        title: "Rutina de deschidere a cafenelei, la 7:00, fără vorbe",
        why: "Se potrivește trendului „slow mornings” și tonului vostru cald.",
        format: "video",
        platforms: ["tiktok", "instagram"],
      },
      {
        id: "i2",
        title: "De unde vine cafeaua de luna asta",
        why: "Caruselele cu poveste merg la Origo; voi nu ați făcut încă unul.",
        format: "carousel",
        platforms: ["instagram", "facebook"],
      },
      {
        id: "i3",
        title: "Ghicește originea: provocare cu clienții",
        why: "Formatul Coffee Break merge, iar voi aveți 6 origini în meniu.",
        format: "video",
        platforms: ["tiktok"],
      },
      {
        id: "i4",
        title: "Rețeta de latte cu scorțișoară acasă",
        why: "Băuturile de toamnă sunt la vârf acum, fereastra se închide în ~2 săptămâni.",
        format: "video",
        platforms: ["instagram", "tiktok", "youtube"],
      },
      {
        id: "i5",
        title: "Abonamentul explicat în 3 slide-uri",
        why: "Susține obiectivul de lansare a abonamentului.",
        format: "carousel",
        platforms: ["instagram"],
      },
    ],
  },
];

export const agentRuns: AgentRun[] = [
  {
    id: "run1",
    projectId: "p_boabe",
    agent: "research",
    status: "succeeded",
    summary: "Raport zilnic: 3 trenduri, 2 mișcări ale competitorilor, 5 idei",
    startedAt: "2026-11-06T05:00:00+02:00",
    costUsd: 0.42,
  },
  {
    id: "run2",
    projectId: "p_boabe",
    agent: "creative",
    status: "succeeded",
    summary: "Carusel de 4 imagini pentru „Ritualul de dimineață”",
    startedAt: "2026-11-05T21:14:00+02:00",
    costUsd: 0.36,
  },
  {
    id: "run3",
    projectId: "p_boabe",
    agent: "creative",
    status: "running",
    summary: "Reel de 8 s: „Cum prăjim boabele”",
    startedAt: "2026-11-06T09:02:00+02:00",
    costUsd: 0,
  },
  {
    id: "run4",
    projectId: "p_boabe",
    agent: "copywriter",
    status: "succeeded",
    summary: "Texte pentru 3 postări, pe 3 platforme",
    startedAt: "2026-11-05T21:10:00+02:00",
    costUsd: 0.08,
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function postsFor(projectId: string) {
  return posts.filter((p) => p.projectId === projectId);
}

export function latestReport(projectId: string) {
  return researchReports.find((r) => r.projectId === projectId);
}

export function runsFor(projectId: string) {
  return agentRuns.filter((r) => r.projectId === projectId);
}

/** „Azi” în demo, ca ecranele să arate la fel indiferent când sunt deschise. */
export const DEMO_TODAY = "2026-11-06";
