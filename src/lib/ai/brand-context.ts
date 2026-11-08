import type { AudienceSegment, Project } from "../types";

export function segmentLine(s: AudienceSegment) {
  return `„${s.name}”: ${s.who}. Stil vizual pentru ei: ${s.visualStyle || "ca stilul brandului"}. Ton: ${s.tone || "ca tonul brandului"}.`;
}

/** Identitatea brandului, ca text pe care îl primesc toți agenții. */
export function brandContext(project: Project) {
  const b = project.brand;
  return [
    `Brand: ${project.name} (${project.industry}), site: ${project.website}`,
    `Obiective: ${project.goals.join("; ")}`,
    `Tonul vocii: ${b.voice}`,
    `Public țintă: ${b.audience}`,
    `Cuvinte și expresii de folosit: ${b.doWords.join(", ")}`,
    `Cuvinte interzise (nu le folosi niciodată): ${b.dontWords.join(", ")}`,
    `Culori: ${b.colors.map((c) => `${c.name} ${c.hex}`).join(", ")}`,
    `Fonturi: titluri ${b.fonts.heading}, text ${b.fonts.body}`,
    `Logo (text): ${b.logoText}`,
    `Stil vizual: ${b.visualStyle}`,
    b.segments?.length ? `Segmente de public (fiecare reacționează diferit):\n${b.segments.map((s) => `- ${segmentLine(s)}`).join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
