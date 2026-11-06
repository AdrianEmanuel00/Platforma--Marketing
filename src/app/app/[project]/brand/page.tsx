"use client";
import { useState } from "react";
import { RefreshCw, WandSparkles } from "lucide-react";
import { BrandEditor } from "@/components/brand-editor";
import { PageHeader } from "@/components/page-header";
import { ProjectMissing, useCurrentProject } from "@/components/current-project";
import { useLogRun, useStore } from "@/lib/store";
import { useAgentsLive } from "@/lib/use-agents-live";
import type { BrandKit } from "@/lib/types";

export default function BrandPage() {
  const { project, hydrated } = useCurrentProject();
  const { dispatch } = useStore();
  const logRun = useLogRun();
  const status = useAgentsLive();
  const [edits, setBrand] = useState<BrandKit | null>(null);
  const [savedAt, setSavedAt] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  if (!project) return <ProjectMissing hydrated={hydrated} />;
  // Modificările nesalvate stau separat; până la prima modificare arătăm brandul salvat.
  const brand = edits ?? project.brand;

  const dirty = JSON.stringify(brand) !== JSON.stringify(project.brand);

  async function reanalyze() {
    if (!project) return;
    setRunning(true);
    setError("");
    try {
      const res = await fetch("/api/agents/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: project.name, industry: project.industry, website: project.website, notes: "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Agentul Brand a eșuat.");
      const kit = data as BrandKit;
      setBrand({
        colors: kit.colors.length ? kit.colors : brand.colors,
        fonts: kit.fonts,
        logoText: kit.logoText || brand.logoText,
        voice: kit.voice,
        audience: kit.audience,
        doWords: kit.doWords,
        dontWords: kit.dontWords,
        visualStyle: kit.visualStyle,
      });
      logRun({ projectId: project.id, agent: "brand", status: "succeeded", summary: `A reanalizat ${project.website}`, costUsd: 0.12 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ceva n-a mers.");
    } finally {
      setRunning(false);
    }
  }

  function save() {
    if (!project) return;
    dispatch({ type: "updateProject", id: project.id, patch: { brand } });
    setBrand(null);
    setSavedAt(true);
    setTimeout(() => setSavedAt(false), 2500);
  }

  return (
    <>
      <PageHeader
        title="Identitate de brand"
        description={`Toți agenții folosesc aceste reguli când scriu și creează pentru ${project.name}.`}
        actions={
          <>
            <button
              onClick={reanalyze}
              disabled={running || !project.website || !status?.anthropic}
              title={status?.anthropic ? "" : "Agentul Brand pornește după ce adaugi cheia Anthropic"}
              className="btn-ghost"
            >
              {running ? <RefreshCw size={16} className="animate-spin" /> : <WandSparkles size={16} />}
              {running ? "Citește site-ul..." : "Reanalizează site-ul"}
            </button>
            <button onClick={save} disabled={!dirty} className="btn-primary">
              {savedAt ? "Salvat ✓" : "Salvează"}
            </button>
          </>
        }
      />
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}
      {dirty && <p className="mb-4 text-sm text-amber-700 dark:text-amber-400">Ai modificări nesalvate.</p>}
      <BrandEditor value={brand} onChange={setBrand} />
    </>
  );
}
