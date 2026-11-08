// Rezultate exemplu, folosite când nu e setată cheia ANTHROPIC_API_KEY,
// ca aplicația să poată fi încercată cap-coadă și fără cont la Anthropic.
import type { Competitor, CompetitorDossier, KeywordReport, Project } from "../types";

const MONTHS = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];

/** Număr stabil din text, ca exemplele să nu se schimbe la fiecare rulare. */
function hash(s: string) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function sampleKeywords(project: Project, today: string): KeywordReport {
  const base = project.industry.toLowerCase() || "servicii";
  const words = project.keywords?.length
    ? project.keywords
    : [`${base} ${project.website ? "online" : "local"}`, `oferte ${base}`, `${base} pret`, `cel mai bun ${base}`];
  const month = new Date(`${today}T12:00:00Z`).getUTCMonth();
  const next = (n: number) => MONTHS[(month + n) % 12];
  return {
    id: `kw_${Date.now()}`,
    projectId: project.id,
    date: today,
    sample: true,
    keywords: words.map((k) => {
      const h = hash(k);
      const now = 30 + (h % 60);
      const last = Math.max(5, Math.min(100, now + ((h >>> 3) % 41) - 20));
      return {
        keyword: k,
        interestNow: now,
        interestLastYear: last,
        trend: now > last + 5 ? "up" : now < last - 5 ? "down" : "flat",
        peakMonths: [MONTHS[h % 12], MONTHS[(h >>> 4) % 12]].filter((m, i, a) => a.indexOf(m) === i),
        note: "Valoare exemplu. Cu cheia Anthropic, agentul o estimează din Google Trends și surse publice.",
      };
    }),
    upcoming: [
      {
        when: `începutul lui ${next(1)}`,
        topic: `Sezonul de ${next(1)} pentru ${base}`,
        why: "Anul trecut căutările au crescut în aceeași perioadă. Postează cu 2-3 săptămâni înainte.",
        keywords: words.slice(0, 2),
      },
      {
        when: `mijlocul lui ${next(2)}`,
        topic: "Comparații și prețuri",
        why: "Oamenii compară oferte înainte să cumpere. Un ghid de alegere prinde bine aici.",
        keywords: words.slice(2, 4),
      },
    ],
    suggested: [`${base} recenzii`, `${base} lângă mine`, `ghid ${base}`],
    ideas: [
      { id: `kws_1`, title: `Ghid rapid: cum alegi ${base} potrivit`, why: "Răspunde la căutările de comparație care cresc.", format: "carousel", platforms: ["instagram", "facebook"] },
      { id: `kws_2`, title: `Întrebarea pe care o primim cel mai des despre ${base}`, why: "Cuvintele cu „cum” și „cât costă” au interes constant.", format: "video", platforms: ["tiktok", "instagram"] },
      { id: `kws_3`, title: `Ce se schimbă în ${next(1)}`, why: "Prinzi interesul sezonier înainte de vârf.", format: "image", platforms: ["facebook", "linkedin"] },
      { id: `kws_4`, title: "Mituri și adevăruri din domeniul nostru", why: "Format care aduce salvări și distribuiri.", format: "carousel", platforms: ["instagram", "linkedin"] },
    ],
    sources: [],
  };
}

export function sampleDossier(project: Project, c: Competitor, today: string): CompetitorDossier {
  return {
    id: `cd_${Date.now()}`,
    projectId: project.id,
    competitor: c.name,
    date: today,
    sample: true,
    summary: `${c.name} e un competitor din ${project.industry.toLowerCase() || "același domeniu"}. Aceasta e o fișă exemplu; cu cheia Anthropic, agentul citește site-ul, rețelele și Biblioteca de reclame Meta.`,
    offers: ["Oferta principală de pe site (exemplu)", "Reducere de sezon (exemplu)"],
    channels: [
      { platform: "Instagram", activity: "3-4 postări pe săptămână, mai ales Reels (exemplu)" },
      { platform: "Facebook", activity: "1-2 postări pe săptămână, concursuri (exemplu)" },
    ],
    recentActions: ["A lansat o campanie de sezon (exemplu)"],
    ads: [{ platform: "Meta", what: "Reclamă cu ofertă și buton „Comandă acum” (exemplu)" }],
    strengths: ["Postează constant", "Recenzii bune"],
    weaknesses: ["Nu răspunde la comentarii", "Imagini de stoc, fără oameni reali"],
    opportunities: ["Arată oamenii din spatele brandului", "Răspunde rapid la comentarii", "Postează înaintea lor la vârful sezonului"],
    sources: [],
  };
}
