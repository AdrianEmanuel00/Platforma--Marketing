"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Check, Plus, RefreshCw, WandSparkles, X } from "lucide-react";
import { BrandEditor, emptyBrand } from "@/components/brand-editor";
import { PlatformIcon } from "@/components/badges";
import { PageHeader } from "@/components/page-header";
import { platformLabels } from "@/lib/format";
import { newId, slugify, useStore } from "@/lib/store";
import { useAgentsLive } from "@/lib/use-agents-live";
import type { BrandKit, Platform, Project } from "@/lib/types";

const PLATFORMS: Platform[] = ["instagram", "facebook", "tiktok", "linkedin", "youtube", "x"];

export default function NewClientPage() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const status = useAgentsLive();

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [goals, setGoals] = useState("");
  const [brand, setBrand] = useState<BrandKit>(emptyBrand);
  const [connected, setConnected] = useState<Platform[]>(["instagram", "facebook"]);
  const [competitors, setCompetitors] = useState<Project["competitors"]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch("/api/agents/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, industry, website, notes: goals }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Agentul Brand a eșuat.");
      setBrand({
        colors: data.colors.length ? data.colors : brand.colors,
        fonts: data.fonts,
        logoText: data.logoText || name,
        voice: data.voice,
        audience: data.audience,
        doWords: data.doWords,
        dontWords: data.dontWords,
        visualStyle: data.visualStyle,
      });
      if (!goals.trim() && data.goals?.length) setGoals(data.goals.join("\n"));
      setAnalyzed(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ceva n-a mers.");
    } finally {
      setAnalyzing(false);
    }
  }

  function create() {
    let slug = slugify(name);
    const taken = new Set(state.projects.map((p) => p.slug).concat(["new", "settings"]));
    for (let i = 2; taken.has(slug); i++) slug = `${slugify(name)}-${i}`;
    const project: Project = {
      id: newId("prj"),
      createdAt: new Date().toISOString(),
      slug,
      name: name.trim(),
      industry: industry.trim(),
      website: website.trim(),
      goals: goals
        .split("\n")
        .map((g) => g.trim())
        .filter(Boolean),
      autopilot: false,
      brand: { ...brand, logoText: brand.logoText || name.trim() },
      connected,
      competitors: competitors.filter((c) => c.name.trim() || c.handle.trim()),
    };
    dispatch({ type: "addProject", project });
    if (analyzed) {
      dispatch({
        type: "addRun",
        run: {
          id: newId("run"),
          projectId: project.id,
          agent: "brand",
          status: "succeeded",
          summary: `A extras identitatea din ${project.website}`,
          startedAt: new Date().toISOString(),
          costUsd: 0.12,
        },
      });
    }
    router.push(`/app/${slug}`);
  }

  const canAnalyze = name.trim() && website.trim().length > 3 && status?.anthropic;

  return (
    <>
      <PageHeader title="Client nou" description="Completezi o dată, iar toți agenții lucrează apoi în identitatea lui." />

      <div className="space-y-6">
        <section className="card p-5">
          <Step n={1} title="Despre afacere" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Numele afacerii" htmlFor="name">
              <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Cafeneaua Boabe" />
            </Field>
            <Field label="Domeniul" htmlFor="industry">
              <input id="industry" className="input" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Ex.: Cafenea de specialitate" />
            </Field>
            <Field label="Site-ul" htmlFor="website">
              <input id="website" className="input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="exemplu.ro" />
            </Field>
            <Field label="Obiective (câte unul pe rând)" htmlFor="goals">
              <textarea id="goals" rows={3} className="input resize-none" value={goals} onChange={(e) => setGoals(e.target.value)} placeholder={"Mai mulți clienți în weekend\nComenzi online"} />
            </Field>
          </div>
        </section>

        <section className="card p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <Step n={2} title="Identitatea de brand" />
            <button onClick={analyze} disabled={!canAnalyze || analyzing} className="btn-primary" title={status?.anthropic ? "" : "Agentul Brand pornește după ce adaugi cheia Anthropic"}>
              {analyzing ? <RefreshCw size={16} className="animate-spin" /> : <WandSparkles size={16} />}
              {analyzing ? "Agentul citește site-ul (până la 2 minute)..." : "Generează din site"}
            </button>
          </div>
          <p className="mb-4 text-sm text-muted">
            {status?.anthropic
              ? "Agentul Brand citește site-ul și propune culorile, fonturile și tonul. Apoi le poți ajusta."
              : "Completează identitatea de mână. După ce adaugi cheia Anthropic, agentul Brand o poate extrage singur din site."}
          </p>
          {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}
          {analyzed && <p className="mb-4 text-sm text-emerald-700 dark:text-emerald-400">Gata. Verifică propunerea și ajusteaz-o dacă e nevoie.</p>}
          <BrandEditor value={brand} onChange={setBrand} />
        </section>

        <section className="card p-5">
          <Step n={3} title="Unde postează" />
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const on = connected.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => setConnected(on ? connected.filter((x) => x !== p) : [...connected, p])}
                  className={clsx(
                    "flex items-center gap-2 rounded-lg border py-1.5 pl-1.5 pr-3 text-sm",
                    on ? "border-accent bg-accent-soft" : "border-border opacity-60",
                  )}
                >
                  <PlatformIcon platform={p} size="sm" />
                  {platformLabels[p]}
                  {on && <Check size={14} className="text-accent" />}
                </button>
              );
            })}
          </div>

          <h3 className="mb-2 mt-6 text-sm font-medium">Competitori de urmărit (opțional)</h3>
          <div className="space-y-2">
            {competitors.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2">
                <input aria-label="Nume competitor" className="input" placeholder="Nume" value={c.name} onChange={(e) => setCompetitors(competitors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                <input aria-label="Cont competitor" className="input" placeholder="@cont" value={c.handle} onChange={(e) => setCompetitors(competitors.map((x, j) => (j === i ? { ...x, handle: e.target.value } : x)))} />
                <select aria-label="Platformă competitor" className="input w-auto" value={c.platform} onChange={(e) => setCompetitors(competitors.map((x, j) => (j === i ? { ...x, platform: e.target.value as Platform } : x)))}>
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {platformLabels[p]}
                    </option>
                  ))}
                </select>
                <button aria-label="Șterge competitorul" onClick={() => setCompetitors(competitors.filter((_, j) => j !== i))} className="text-muted hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
            ))}
            {competitors.length < 10 && (
              <button onClick={() => setCompetitors([...competitors, { name: "", handle: "", platform: "instagram" }])} className="btn-ghost px-2.5 py-1 text-xs">
                <Plus size={14} /> Adaugă competitor
              </button>
            )}
          </div>
        </section>

        <div className="flex justify-end gap-2">
          <button onClick={() => router.back()} className="btn-ghost">
            Renunță
          </button>
          <button onClick={create} disabled={!name.trim()} className="btn-primary">
            Creează clientul
          </button>
        </div>
      </div>
    </>
  );
}

function Step({ n, title }: { n: number; title: string }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 font-semibold">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs text-white">{n}</span>
      {title}
    </h2>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
