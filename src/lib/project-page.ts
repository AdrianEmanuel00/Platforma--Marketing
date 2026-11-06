import { notFound } from "next/navigation";
import { getProject } from "./demo-data";

/** Citește proiectul din URL (/app/[project]/...) sau dă 404. */
export async function loadProject(params: Promise<{ project: string }>) {
  const { project: slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return project;
}
