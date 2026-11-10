"use client";
import { useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { StageBadge } from "@/components/badges";
import { PageHeader } from "@/components/page-header";
import { agents } from "@/lib/agents/registry";
import { useStore } from "@/lib/store";
import { useAgentsLive } from "@/lib/use-agents-live";
import type { Project } from "@/lib/types";

const roleLabels = { owner: "Owner", admin: "Admin", editor: "Editor", viewer: "Viewer" };

const TIER_LABEL = { economic: "economic", echilibrat: "echilibrat", maxim: "calitate maximă" } as const;

export default function SettingsPage() {
  const { state, dispatch, account, storage } = useStore();
  const isBusiness = account === "business";
  const { workspace, members, projects } = state;
  const status = useAgentsLive();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <>
      <PageHeader title="Setări" description="Spațiul de lucru, clienții, echipa și agenții." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card space-y-4 p-5">
          <h2 className="font-semibold">Spațiul de lucru</h2>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Nume</span>
            <input
              className="input"
              value={workspace.name}
              onChange={(e) => dispatch({ type: "updateWorkspace", patch: { name: e.target.value } })}
            />
          </label>
          <p className="text-sm text-muted">
            {isBusiness
              ? "Cont de afacere: un singur brand, pe care îl gestionezi tu."
              : "Cont de agenție: fiecare client are proiectul lui."}
          </p>
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-semibold">Agenții și modelele lor</h2>
          <p className="mb-3 text-xs">
            <span className={status?.anthropic ? "text-emerald-600" : "text-amber-600"}>
              ● Text (Anthropic): {status === null ? "verific..." : status.anthropic ? "activ" : "lipsește ANTHROPIC_API_KEY"}
            </span>
            <br />
            <span className={status?.imageReady ? "text-emerald-600" : "text-amber-600"}>
              ● Imagini ({status?.imageProvider ?? "..."}): {status === null ? "verific..." : status.imageReady ? "activ" : "lipsește cheia furnizorului"}
            </span>
            {status?.tier && (
              <>
                <br />
                <span className="text-muted">
                  Nivel text: <b>{TIER_LABEL[status.tier]}</b> ({status.textModel}). Se schimbă din variabila AI_TIER pe Vercel.
                </span>
              </>
            )}
          </p>
          <ul className="divide-y divide-border">
            {agents.map((a) => (
              <li key={a.id} className="py-3 text-sm">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{a.name}</p>
                  <StageBadge stage={a.stage} />
                  <span className="ml-auto truncate font-mono text-xs text-muted">
                    {a.primary.provider === "anthropic"
                      ? (status?.textModel ?? a.primary.model)
                      : (status?.imageModel ?? a.primary.model)}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">{a.tagline}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5 lg:col-span-2">
          <h2 className="mb-3 font-semibold">{isBusiness ? "Afacerea ta" : "Clienți"}</h2>
          <div className="space-y-3">
            {projects.map((p) => (
              <ProjectRow key={p.id} project={p} canDelete={!isBusiness} />
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-semibold">Echipa</h2>
          <ul className="divide-y divide-border">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent">
                  {m.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{m.name}</p>
                  <p className="truncate text-xs text-muted">
                    {m.projectIds.length === 0
                      ? "Toți clienții"
                      : m.projectIds.map((id) => projects.find((p) => p.id === id)?.name).filter(Boolean).join(", ")}
                  </p>
                </div>
                <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs">{roleLabels[m.role]}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Invitațiile în echipă pornesc odată cu conturile de utilizator.</p>
        </section>

        <section className="card p-5">
          <h2 className="mb-1 font-semibold">Datele aplicației</h2>
          <p className="mb-4 text-sm text-muted">
            {storage === "db"
              ? "Totul se salvează în baza de date locală (fișierul .data/platforma.db din proiect)."
              : "Totul se salvează în acest browser."}{" "}
            Poți reveni oricând la datele de exemplu ale contului.
          </p>
          {confirmReset ? (
            <div className="flex items-center gap-2 text-sm">
              Ștergi tot ce ai adăugat?
              <button
                onClick={() => {
                  dispatch({ type: "reset", account });
                  setConfirmReset(false);
                }}
                className="btn-ghost px-2.5 py-1 text-red-600"
              >
                Da, resetează
              </button>
              <button onClick={() => setConfirmReset(false)} className="btn-ghost px-2.5 py-1">
                Nu
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmReset(true)} className="btn-ghost">
              <RotateCcw size={16} /> Resetează datele
            </button>
          )}
        </section>
      </div>
    </>
  );
}

function ProjectRow({ project, canDelete }: { project: Project; canDelete: boolean }) {
  const { dispatch } = useStore();
  const [confirm, setConfirm] = useState(false);
  const update = (patch: Partial<Project>) => dispatch({ type: "updateProject", id: project.id, patch });

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <input aria-label="Nume client" className="input" value={project.name} onChange={(e) => update({ name: e.target.value })} />
        <input aria-label="Domeniu" className="input" value={project.industry} onChange={(e) => update({ industry: e.target.value })} />
        <input aria-label="Site" className="input" value={project.website} onChange={(e) => update({ website: e.target.value })} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={project.autopilot} onChange={(e) => update({ autopilot: e.target.checked })} />
          Pilot automat (agenții programează fără aprobare)
        </label>
        <div className="ml-auto">
          {!canDelete ? null : confirm ? (
            <span className="flex items-center gap-2">
              Ștergi clientul și postările lui?
              <button onClick={() => dispatch({ type: "deleteProject", id: project.id })} className="btn-ghost px-2.5 py-1 text-red-600">
                Da
              </button>
              <button onClick={() => setConfirm(false)} className="btn-ghost px-2.5 py-1">
                Nu
              </button>
            </span>
          ) : (
            <button onClick={() => setConfirm(true)} className="btn-ghost px-2.5 py-1 text-red-600">
              <Trash2 size={14} /> Șterge
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
