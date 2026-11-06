"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { ProjectMissing, useCurrentProject } from "@/components/current-project";
import { useProjectData } from "@/lib/store";
import type { AssetKind, Platform, ResearchIdea } from "@/lib/types";
import { StudioEditor } from "./studio-editor";

const formats: AssetKind[] = ["image", "carousel", "video"];
const platforms: Platform[] = ["instagram", "facebook", "tiktok", "linkedin", "youtube", "x"];

export default function StudioPage() {
  return (
    <>
      <PageHeader
        title="Studio de conținut"
        description="Scrii ideea, agenții fac textul și vizualul în identitatea brandului, tu alegi unde publici."
      />
      <Suspense fallback={<div className="h-72 animate-pulse rounded-xl bg-surface-2" />}>
        <Studio />
      </Suspense>
    </>
  );
}

function Studio() {
  const { project, hydrated } = useCurrentProject();
  const { report, series } = useProjectData(project?.id);
  const sp = useSearchParams();
  if (!project) return <ProjectMissing hydrated={hydrated} />;

  // Ideea vine din raportul salvat (?idea=id) sau ca text (?text=...).
  let idea: ResearchIdea | undefined = report?.ideas.find((i) => i.id === sp.get("idea"));
  const text = sp.get("text");
  if (!idea && text) {
    const format = sp.get("format") as AssetKind;
    idea = {
      id: "from-research",
      title: text.slice(0, 500),
      why: sp.get("why")?.slice(0, 500) ?? "",
      format: formats.includes(format) ? format : "image",
      platforms: (sp.get("platforms") ?? "").split(",").filter((p): p is Platform => platforms.includes(p as Platform)),
    };
  }
  const date = sp.get("date");
  const seriesId = sp.get("series");
  const fromSeries = series.find((x) => x.id === seriesId);

  return (
    <StudioEditor
      key={`${project.id}-${idea?.title ?? "new"}-${date ?? ""}-${fromSeries?.id ?? ""}`}
      project={project}
      initialIdea={idea}
      initialDate={date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined}
      initialSeriesId={fromSeries?.id}
    />
  );
}
