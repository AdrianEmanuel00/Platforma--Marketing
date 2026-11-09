import Link from "next/link";
import { PlatformIcon } from "@/components/badges";
import type { ResearchIdea } from "@/lib/types";

const formatLabel = { image: "Imagine", carousel: "Carusel", video: "Video" };

/** O idee de postare, cu buton spre Studio. */
export function IdeaCard({ idea, slug }: { idea: ResearchIdea; slug: string }) {
  return (
    <div className="flex flex-col rounded-lg border border-border p-4">
      <span className="mb-2 self-start rounded-full bg-surface-2 px-2 py-0.5 text-[11px]">{formatLabel[idea.format]}</span>
      <p className="text-sm font-medium">{idea.title}</p>
      <p className="mt-1 flex-1 text-xs text-muted">{idea.why}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1">
          {idea.platforms.map((p) => (
            <PlatformIcon key={p} platform={p} size="sm" />
          ))}
        </div>
        <Link href={`/app/${slug}/studio?idea=${idea.id}`} className="btn-ghost px-2.5 py-1 text-xs">
          Fă postarea
        </Link>
      </div>
    </div>
  );
}

export function Sources({ sources }: { sources?: { title: string; url: string }[] }) {
  if (!sources?.length) return null;
  return (
    <ul className="space-y-1 text-sm">
      {sources.map((s) => (
        <li key={s.url}>
          <a href={s.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
            {s.title || s.url}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Nota care apare când rezultatul e un exemplu, fără AI. */
export function SampleNote() {
  return (
    <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
      Rezultat exemplu, făcut fără AI. Adaugă ANTHROPIC_API_KEY în .env.local ca agentul să caute pe web date reale.
    </p>
  );
}
