"use client";
import { ProjectMissing, useCurrentProject } from "@/components/current-project";
import { useProjectData } from "@/lib/store";
import { ResearchView } from "./research-view";

export default function ResearchPage() {
  const { project, hydrated } = useCurrentProject();
  const { report } = useProjectData(project?.id);
  if (!project) return <ProjectMissing hydrated={hydrated} />;
  return <ResearchView project={project} report={report} />;
}
