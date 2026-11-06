// Contul demo „Afacere”: o firmă care își face singură social media (un singur brand).
import type { AgentRun, ContentSeries, Member, Post, Project, ResearchReport, Workspace } from "./types";

export const businessWorkspace: Workspace = {
  id: "ws_iris",
  name: "Florăria Iris",
  kind: "business",
  plan: "pro",
};

export const businessMembers: Member[] = [
  { id: "bm1", name: "Adrian", email: "adrian@example.com", role: "owner", projectIds: [] },
  { id: "bm2", name: "Elena Marin", email: "elena@example.com", role: "editor", projectIds: [] },
];

export const businessProjects: Project[] = [
  {
    id: "p_iris",
    slug: "iris",
    name: "Florăria Iris",
    industry: "Florărie cu livrare în Cluj",
    website: "florariairis.ro",
    goals: ["Comenzi online pentru Crăciun", "+30% urmăritori pe Instagram", "Abonamente lunare de flori pentru birouri"],
    autopilot: false,
    connected: ["instagram", "facebook", "tiktok"],
    competitors: [
      { name: "Floria", handle: "@floria.ro", platform: "instagram" },
      { name: "Flori de Cluj", handle: "@floridecluj", platform: "instagram" },
      { name: "Bloom Atelier", handle: "@bloomatelier", platform: "tiktok" },
    ],
    brand: {
      colors: [
        { name: "Iris", hex: "#5B3E96" },
        { name: "Crem", hex: "#FBF7F2" },
        { name: "Salvie", hex: "#8FA98B" },
        { name: "Piersică", hex: "#F2B8A2" },
      ],
      fonts: { heading: "Fraunces", body: "Manrope" },
      logoText: "Iris",
      voice: "Poetic dar simplu, cald, vorbim cu „tu”, fără diminutive siropoase.",
      audience: "Femei și bărbați 25-45 de ani din Cluj care fac cadouri, plus birouri care vor flori proaspete săptămânal.",
      doWords: ["proaspăt tăiate", "aranjat de mână", "livrare azi", "de sezon"],
      dontWords: ["ieftin", "reducere masivă", "superb"],
      visualStyle: "Lumină naturală de dimineață, fundal crem, flori de aproape cu texturi, mâini care lucrează.",
    },
  },
];

export const businessPosts: Post[] = [
  {
    id: "bpost1",
    projectId: "p_iris",
    seriesId: "bs_buchet",
    title: "Buchetul săptămânii: dalii de toamnă",
    status: "published",
    assetKind: "image",
    scheduledAt: "2026-11-03T10:00:00+02:00",
    source: "calendar",
    variants: [
      { platform: "instagram", caption: "Daliile sunt pe ultima sută de metri. Le-am pus într-un buchet care miroase a noiembrie. 🍂", hashtags: ["#florariairis", "#cluj", "#dalii"] },
      { platform: "facebook", caption: "Buchetul săptămânii: dalii de sezon, aranjate de mână. Livrare azi în tot Clujul.", hashtags: [] },
    ],
    metrics: { reach: 6840, likes: 512, comments: 38, shares: 21 },
  },
  {
    id: "bpost2",
    projectId: "p_iris",
    seriesId: "bs_culise",
    title: "Reel: cum legăm un buchet în 30 de secunde",
    status: "published",
    assetKind: "video",
    scheduledAt: "2026-11-04T18:00:00+02:00",
    source: "research",
    variants: [
      { platform: "tiktok", caption: "30 de secunde, 21 de fire, o singură panglică. 🌸", hashtags: ["#florist", "#asmr", "#cluj"] },
      { platform: "instagram", caption: "Așa se leagă un buchet ca la carte. Salvează pentru data viitoare când faci unul acasă.", hashtags: ["#florariairis"] },
    ],
    metrics: { reach: 21300, likes: 1870, comments: 96, shares: 240 },
  },
  {
    id: "bpost3",
    projectId: "p_iris",
    seriesId: "bs_birou",
    title: "Flori pentru birou, în fiecare luni",
    status: "scheduled",
    assetKind: "carousel",
    scheduledAt: "2026-11-06T12:30:00+02:00",
    source: "manual",
    variants: [
      { platform: "facebook", caption: "Biroul tău merită flori proaspete în fiecare luni. Abonamentul Iris pornește de la 149 lei pe lună.", hashtags: [] },
      { platform: "instagram", caption: "Luni = flori noi pe birou. Cum funcționează abonamentul, în 4 slide-uri. 👉", hashtags: ["#florariairis", "#office"] },
    ],
  },
  {
    id: "bpost4",
    projectId: "p_iris",
    title: "Coronițe de Advent: atelier pe 22 noiembrie",
    status: "pending_approval",
    assetKind: "image",
    scheduledAt: "2026-11-08T11:00:00+02:00",
    source: "research",
    variants: [
      { platform: "instagram", caption: "Îți faci singur coronița de Advent, cu noi alături. 12 locuri, 22 noiembrie. Link în bio.", hashtags: ["#advent", "#atelier", "#cluj"] },
      { platform: "facebook", caption: "Atelier de coronițe de Advent, sâmbătă 22 noiembrie. Materialele și ceaiul cald sunt incluse.", hashtags: [] },
    ],
  },
  {
    id: "bpost5",
    projectId: "p_iris",
    seriesId: "bs_culise",
    title: "Din culise: florile ajung la 5 dimineața",
    status: "scheduled",
    assetKind: "video",
    scheduledAt: "2026-11-10T08:00:00+02:00",
    source: "research",
    variants: [{ platform: "tiktok", caption: "5:00. Vin florile. Asta e partea pe care n-o vede nimeni. 🌙", hashtags: ["#florist", "#behindthescenes"] }],
  },
  {
    id: "bpost6",
    projectId: "p_iris",
    seriesId: "bs_ingrijire",
    title: "Ghid: cum ții trandafirii proaspeți o săptămână",
    status: "draft",
    assetKind: "carousel",
    source: "manual",
    variants: [{ platform: "instagram", caption: "3 lucruri care țin trandafirii proaspeți o săptămână întreagă. Al doilea te va surprinde.", hashtags: ["#florariairis"] }],
  },
  {
    id: "bpost7",
    projectId: "p_iris",
    title: "Comenzile de Crăciun s-au deschis",
    status: "approved",
    assetKind: "image",
    scheduledAt: "2026-11-15T10:00:00+02:00",
    source: "calendar",
    variants: [
      { platform: "instagram", caption: "Am deschis comenzile de Crăciun: aranjamente, coronițe și brăduți în ghiveci. Livrăm din 1 decembrie.", hashtags: ["#craciun", "#cluj"] },
      { platform: "facebook", caption: "Comenzile de Crăciun sunt deschise. Rezervă-ți aranjamentul din timp, locurile pentru livrare se ocupă repede.", hashtags: [] },
    ],
  },
];

// Istoric mai vechi al seriei „Buchetul săptămânii”.
businessPosts.push(
  {
    id: "bpost8",
    projectId: "p_iris",
    seriesId: "bs_buchet",
    title: "Buchetul săptămânii: crizanteme și eucalipt",
    status: "published",
    assetKind: "image",
    scheduledAt: "2026-10-27T10:00:00+02:00",
    source: "calendar",
    visualPrompt: "Autumn bouquet of bronze chrysanthemums and eucalyptus on a cream linen table, soft morning window light, top-down, palette #5B3E96 #FBF7F2 #8FA98B",
    variants: [
      { platform: "instagram", caption: "Crizanteme bronz și eucalipt. Toamna, într-un singur buchet. 🍂", hashtags: ["#florariairis", "#cluj"] },
      { platform: "facebook", caption: "Buchetul săptămânii: crizanteme și eucalipt, aranjate de mână. Livrare azi.", hashtags: [] },
    ],
    metrics: { reach: 5120, likes: 388, comments: 22, shares: 9 },
  },
  {
    id: "bpost9",
    projectId: "p_iris",
    seriesId: "bs_buchet",
    title: "Buchetul săptămânii: ultimii trandafiri de grădină",
    status: "published",
    assetKind: "image",
    scheduledAt: "2026-10-20T10:00:00+02:00",
    source: "calendar",
    visualPrompt: "Loose garden roses in blush and peach tones in a ceramic vase, cream background, natural side light, close-up texture, palette #F2B8A2 #FBF7F2",
    variants: [
      { platform: "instagram", caption: "Ultimii trandafiri din grădina furnizorului nostru. Până săptămâna viitoare nu mai sunt. 🌹", hashtags: ["#florariairis", "#trandafiri"] },
      { platform: "facebook", caption: "Ultimii trandafiri de grădină ai sezonului, în buchetul săptămânii.", hashtags: [] },
    ],
    metrics: { reach: 7930, likes: 640, comments: 51, shares: 33 },
  },
);

export const businessSeries: ContentSeries[] = [
  {
    id: "bs_buchet",
    projectId: "p_iris",
    name: "Buchetul săptămânii",
    description: "În fiecare luni, buchetul cu florile de sezon ale săptămânii. Arată ce e proaspăt și creează obiceiul de a comanda.",
    cadence: "în fiecare luni",
    format: "image",
    platforms: ["instagram", "facebook"],
    visualGuide: "Buchetul pe fundal crem, lumină naturală de la fereastră, încadrare de sus sau la 45°, o singură floare dominantă.",
    learnings: [
      "Raritatea vinde: „ultimii trandafiri” a avut cel mai mare reach din serie (7.930).",
      "Numele florii în titlu aduce mai multe comentarii decât descrierile generale.",
      "Pe Facebook, „livrare azi” la final crește click-urile spre comandă.",
    ],
    nextIdeas: ["Buchetul săptămânii: amaryllis de iarnă", "Buchetul săptămânii: anemone și ramuri de brad"],
    learnedAt: "2026-11-04T09:00:00+02:00",
    createdAt: "2026-10-01T10:00:00+02:00",
  },
  {
    id: "bs_culise",
    projectId: "p_iris",
    name: "Din culise",
    description: "Ce nu vede clientul: livrarea de la 5 dimineața, legatul buchetelor, atelierul.",
    cadence: "săptămânal",
    format: "video",
    platforms: ["tiktok", "instagram"],
    visualGuide: "Vertical, fără muzică puternică, sunetul real al atelierului (foarfecă, hârtie), mâini în prim-plan.",
    learnings: ["Sunetul real (ASMR) ține oamenii până la final: reel-ul cu legatul buchetului a avut 21.300 de oameni atinși."],
    nextIdeas: ["Ambalăm o comandă de Crăciun, doar cu sunetul hârtiei"],
    learnedAt: "2026-11-05T10:00:00+02:00",
    createdAt: "2026-10-10T10:00:00+02:00",
  },
  {
    id: "bs_birou",
    projectId: "p_iris",
    name: "Flori pentru birouri",
    description: "Promovăm abonamentul de flori pentru birouri, cu clienți reali.",
    cadence: "la 2 săptămâni",
    format: "carousel",
    platforms: ["facebook", "instagram", "linkedin"],
    visualGuide: "Birouri luminoase, aranjamentul pe recepție sau pe masa de ședințe, oameni la lucru în fundal, neclari.",
    learnings: [],
    nextIdeas: [],
    createdAt: "2026-11-01T10:00:00+02:00",
  },
  {
    id: "bs_ingrijire",
    projectId: "p_iris",
    name: "Sfaturi de îngrijire",
    description: "Cum ții florile proaspete mai mult. Util, scurt, de salvat.",
    cadence: "la 2 săptămâni",
    format: "carousel",
    platforms: ["instagram"],
    visualGuide: "Slide-uri crem cu titlu mare în Fraunces, o fotografie de aproape pe fiecare slide.",
    learnings: [],
    nextIdeas: [],
    createdAt: "2026-11-02T10:00:00+02:00",
  },
];

export const businessReports: ResearchReport[] = [
  {
    id: "br1",
    projectId: "p_iris",
    date: "2026-11-06",
    trends: [
      { title: "Flori uscate și „everlasting”", detail: "Aranjamentele care țin luni de zile sunt tot mai căutate pentru cadouri de iarnă.", momentum: "rising" },
      { title: "Video-uri ASMR cu ambalarea buchetelor", detail: "Sunetul hârtiei și al foarfecii aduce vizionări complete pe TikTok.", momentum: "peak" },
      { title: "Buchete „ghicește prețul”", detail: "Formatul a obosit publicul după o lună de vârf.", momentum: "fading" },
    ],
    competitorMoves: [
      { competitor: "Floria", what: "Concurs cu coronițe de Advent", result: "1.200 de comentarii în 3 zile" },
      { competitor: "Bloom Atelier", what: "TikTok cu o zi din viața unui florist", result: "90.000 de vizualizări" },
    ],
    ideas: [
      { id: "bi1", title: "Ambalăm un buchet, doar cu sunetul hârtiei", why: "Trendul ASMR e la vârf, iar reel-ul vostru cu legatul buchetului a avut cel mai mare reach.", format: "video", platforms: ["tiktok", "instagram"] },
      { id: "bi2", title: "Colecția de flori uscate pentru cadouri de iarnă", why: "Căutările cresc și nu aveți încă o postare despre asta.", format: "carousel", platforms: ["instagram", "facebook"] },
      { id: "bi3", title: "Cine primește florile de luni? Biroul lunii", why: "Susține obiectivul de abonamente pentru birouri și aduce conținut de la clienți.", format: "image", platforms: ["instagram", "facebook"] },
      { id: "bi4", title: "Ce se întâmplă cu florile nevândute", why: "Transparența funcționează la Bloom Atelier și se potrivește tonului vostru.", format: "video", platforms: ["tiktok"] },
    ],
  },
];

export const businessRuns: AgentRun[] = [
  { id: "brun1", projectId: "p_iris", agent: "research", status: "succeeded", summary: "Raport zilnic: 3 trenduri, 2 mișcări ale competitorilor, 4 idei", startedAt: "2026-11-06T05:00:00+02:00", costUsd: 0.38 },
  { id: "brun2", projectId: "p_iris", agent: "copywriter", status: "succeeded", summary: "Texte pentru atelierul de coronițe, pe 2 platforme", startedAt: "2026-11-05T20:40:00+02:00", costUsd: 0.06 },
  { id: "brun3", projectId: "p_iris", agent: "creative", status: "succeeded", summary: "Carusel de 4 imagini pentru abonamentul de birou", startedAt: "2026-11-05T20:45:00+02:00", costUsd: 0.6 },
  { id: "brun4", projectId: "p_iris", agent: "brand", status: "succeeded", summary: "A extras identitatea din florariairis.ro", startedAt: "2026-11-01T10:00:00+02:00", costUsd: 0.12 },
];
