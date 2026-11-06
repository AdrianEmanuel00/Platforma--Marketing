import { PageHeader } from "@/components/page-header";
import { latestReport } from "@/lib/demo-data";
import { loadProject } from "@/lib/project-page";
import type { AssetKind, Platform, ResearchIdea } from "@/lib/types";
import { StudioEditor } from "./studio-editor";

const formats: AssetKind[] = ["image", "carousel", "video"];
const platforms: Platform[] = ["instagram", "facebook", "tiktok", "linkedin", "youtube", "x"];

export default async function StudioPage({ params, searchParams }: PageProps<"/app/[project]/studio">) {
  const project = await loadProject(params);
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  // Ideea vine fie din raportul demo (?idea=id), fie dintr-un raport generat live (?text=...).
  let idea: ResearchIdea | undefined = latestReport(project.id)?.ideas.find((i) => i.id === one(sp.idea));
  const text = one(sp.text);
  if (!idea && text) {
    const format = one(sp.format) as AssetKind;
    idea = {
      id: "from-research",
      title: text.slice(0, 500),
      why: one(sp.why)?.slice(0, 500) ?? "",
      format: formats.includes(format) ? format : "image",
      platforms: (one(sp.platforms) ?? "").split(",").filter((p): p is Platform => platforms.includes(p as Platform)),
    };
  }

  return (
    <>
      <PageHeader
        title="Studio de conținut"
        description="Scrii ideea, agenții fac textul și vizualul în identitatea brandului, tu alegi unde publici."
      />
      <StudioEditor key={idea?.title ?? "new"} project={project} initialIdea={idea} />
    </>
  );
}
