"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProject } from "@/lib/store";

/** Proiectul (clientul) din URL: /app/[project]/... */
export function useCurrentProject() {
  const params = useParams<{ project: string }>();
  return useProject(params.project);
}

export function ProjectMissing({ hydrated }: { hydrated: boolean }) {
  if (!hydrated) return <div className="h-40 animate-pulse rounded-xl bg-surface-2" />;
  return (
    <div className="card p-8 text-center">
      <p className="font-medium">Clientul nu există.</p>
      <Link href="/app" className="mt-3 inline-block text-sm text-accent">
        Înapoi la toți clienții
      </Link>
    </div>
  );
}
