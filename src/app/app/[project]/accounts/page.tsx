import { PlatformIcon } from "@/components/badges";
import { PageHeader } from "@/components/page-header";
import { platformLabels } from "@/lib/format";
import { loadProject } from "@/lib/project-page";
import type { Platform } from "@/lib/types";

const all: { platform: Platform; note: string }[] = [
  { platform: "instagram", note: "Cont Business sau Creator, legat de o pagină Facebook" },
  { platform: "facebook", note: "Pagini Facebook" },
  { platform: "tiktok", note: "Necesită aprobarea aplicației de către TikTok" },
  { platform: "linkedin", note: "Profil personal sau pagină de companie" },
  { platform: "youtube", note: "Shorts și video, necesită verificarea Google" },
  { platform: "x", note: "API cu plată" },
];

export default async function AccountsPage({ params }: PageProps<"/app/[project]/accounts">) {
  const project = await loadProject(params);

  return (
    <>
      <PageHeader
        title="Conturi conectate"
        description={`Conturile sociale ale lui ${project.name}. Agentul Postare publică doar pe cele conectate.`}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {all.map(({ platform, note }) => {
          const connected = project.connected.includes(platform);
          return (
            <div key={platform} className="card flex items-center gap-4 p-4">
              <PlatformIcon platform={platform} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{platformLabels[platform]}</p>
                <p className="text-xs text-muted">{connected ? `Conectat ca @${project.slug}` : note}</p>
              </div>
              <button className={connected ? "btn-ghost" : "btn-primary"}>{connected ? "Deconectează" : "Conectează"}</button>
            </div>
          );
        })}
      </div>
    </>
  );
}
