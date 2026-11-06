"use client";
import { useState } from "react";
import Link from "next/link";
import { WandSparkles } from "lucide-react";
import { AssetPreview } from "@/components/asset-preview";
import { PageHeader } from "@/components/page-header";
import { PostDialog } from "@/components/post-dialog";
import { ProjectMissing, useCurrentProject } from "@/components/current-project";
import { useProjectData } from "@/lib/store";

export default function MediaPage() {
  const { project, hydrated } = useCurrentProject();
  const { posts } = useProjectData(project?.id);
  const [openId, setOpenId] = useState<string | null>(null);
  if (!project) return <ProjectMissing hydrated={hydrated} />;
  const generated = posts.filter((p) => p.imageUrl).length;
  const open = posts.find((p) => p.id === openId);

  return (
    <>
      <PageHeader
        title="Bibliotecă media"
        description={
          generated
            ? `${generated} imagini generate de agentul Creative. Celelalte sunt previzualizări în culorile brandului.`
            : "Vizualurile postărilor. Cele generate de agentul Creative apar aici automat."
        }
        actions={
          <Link href={`/app/${project.slug}/studio`} className="btn-primary">
            <WandSparkles size={16} /> Generează
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[...posts].reverse().map((p) => (
          <figure key={p.id}>
            <button onClick={() => setOpenId(p.id)} className="block w-full text-left">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt={p.title} className="aspect-square w-full rounded-lg object-cover" />
              ) : (
                <AssetPreview brand={project.brand} kind={p.assetKind} title={p.title} />
              )}
            </button>
            <figcaption className="mt-1.5 truncate text-xs text-muted">{p.title}</figcaption>
          </figure>
        ))}
      </div>
      {posts.length === 0 && <p className="card p-6 text-sm text-muted">Încă nu ai vizualuri.</p>}
      {open && <PostDialog key={open.id} post={open} project={project} onClose={() => setOpenId(null)} />}
    </>
  );
}
