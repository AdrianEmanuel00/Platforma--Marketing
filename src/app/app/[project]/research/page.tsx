import { latestReport } from "@/lib/demo-data";
import { loadProject } from "@/lib/project-page";
import { ResearchView } from "./research-view";

export default async function ResearchPage({ params }: PageProps<"/app/[project]/research">) {
  const project = await loadProject(params);
  return <ResearchView project={project} initial={latestReport(project.id)} />;
}
