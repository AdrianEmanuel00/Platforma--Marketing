import { PageHeader } from "@/components/page-header";
import { latestReport } from "@/lib/demo-data";
import { loadProject } from "@/lib/project-page";
import { StudioEditor } from "./studio-editor";

export default async function StudioPage({ params, searchParams }: PageProps<"/app/[project]/studio">) {
  const project = await loadProject(params);
  const { idea: ideaId } = await searchParams;
  const idea = latestReport(project.id)?.ideas.find((i) => i.id === ideaId);

  return (
    <>
      <PageHeader
        title="Studio de conținut"
        description="Scrii ideea, agenții fac textul și vizualul în identitatea brandului, tu alegi unde publici."
      />
      <StudioEditor project={project} initialIdea={idea} />
    </>
  );
}
