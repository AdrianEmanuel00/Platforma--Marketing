import { Upload } from "lucide-react";
import { AssetPreview } from "@/components/asset-preview";
import { PageHeader } from "@/components/page-header";
import { postsFor } from "@/lib/demo-data";
import { loadProject } from "@/lib/project-page";

export default async function MediaPage({ params }: PageProps<"/app/[project]/media">) {
  const project = await loadProject(params);
  const posts = postsFor(project.id);

  return (
    <>
      <PageHeader
        title="Bibliotecă media"
        description="Imaginile și video-urile generate de agentul Creative sau încărcate de tine."
        actions={
          <button className="btn-ghost">
            <Upload size={16} /> Încarcă
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {posts.map((p) => (
          <figure key={p.id}>
            <AssetPreview brand={project.brand} kind={p.assetKind} title={p.title} />
            <figcaption className="mt-1.5 truncate text-xs text-muted">{p.title}</figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
