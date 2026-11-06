"use client";
import { PlatformIcon } from "@/components/badges";
import { PageHeader } from "@/components/page-header";
import { ProjectMissing, useCurrentProject } from "@/components/current-project";
import { useStore } from "@/lib/store";
import { platformLabels } from "@/lib/format";
import type { Platform } from "@/lib/types";

const all: { platform: Platform; note: string }[] = [
  { platform: "instagram", note: "Cont Business sau Creator, legat de o pagină Facebook" },
  { platform: "facebook", note: "Pagini Facebook" },
  { platform: "tiktok", note: "Necesită aprobarea aplicației de către TikTok" },
  { platform: "linkedin", note: "Profil personal sau pagină de companie" },
  { platform: "youtube", note: "Shorts și video, necesită verificarea Google" },
  { platform: "x", note: "API cu plată" },
];

export default function AccountsPage() {
  const { project, hydrated } = useCurrentProject();
  const { dispatch } = useStore();
  if (!project) return <ProjectMissing hydrated={hydrated} />;

  return (
    <>
      <PageHeader
        title="Conturi conectate"
        description={`Alege platformele lui ${project.name}. Studio-ul îți propune doar platformele bifate aici. Conectarea reală (login cu Meta, TikTok etc.) e următorul pas.`}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {all.map(({ platform, note }) => {
          const connected = project.connected.includes(platform);
          return (
            <div key={platform} className="card flex items-center gap-4 p-4">
              <PlatformIcon platform={platform} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{platformLabels[platform]}</p>
                <p className="text-xs text-muted">{connected ? "Activ în Studio și calendar" : note}</p>
              </div>
              <button
                onClick={() => dispatch({ type: "toggleConnection", projectId: project.id, platform })}
                className={connected ? "btn-ghost" : "btn-primary"}
              >
                {connected ? "Dezactivează" : "Activează"}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
