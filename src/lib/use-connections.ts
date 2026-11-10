"use client";
import { useCallback, useEffect, useState } from "react";
import type { Platform, PublishLogEntry } from "./types";

export interface ConnectionsStatus {
  metaConfigured: boolean;
  storage: "supabase" | "local" | "none";
  redirectUri: string;
  connections: {
    meta?: {
      connectedAt: string;
      pages: { id: string; name: string; instagram?: { id: string; username: string } }[];
      selectedPageId?: string;
    };
  };
  error?: string;
}

/** Conexiunile reale ale unui proiect (Facebook/Instagram), citite de pe server. */
export function useConnections(projectId: string | undefined) {
  const [status, setStatus] = useState<ConnectionsStatus | null>(null);
  const reload = useCallback(async () => {
    if (!projectId) return;
    try {
      const r = await fetch(`/api/connect/status?project=${encodeURIComponent(projectId)}`, { cache: "no-store" });
      setStatus(await r.json());
    } catch {
      setStatus(null);
    }
  }, [projectId]);
  useEffect(() => {
    // Citim starea de pe server după montare; e un efect de sincronizare cu exteriorul.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);
  return { status, reload };
}

/** Platformele pe care proiectul poate publica pe bune acum. */
export function realPlatforms(status: ConnectionsStatus | null): Platform[] {
  const meta = status?.connections.meta;
  const page = meta?.pages.find((p) => p.id === meta.selectedPageId);
  if (!page) return [];
  return page.instagram ? ["facebook", "instagram"] : ["facebook"];
}

/** Publică textul și imaginea pe o platformă conectată. */
export async function publishTo(
  projectId: string,
  platform: "facebook" | "instagram",
  caption: string,
  imageUrl?: string,
): Promise<PublishLogEntry> {
  const at = new Date().toISOString();
  try {
    const res = await fetch("/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, platform, caption, imageUrl }),
    });
    const data = await res.json();
    if (!res.ok) return { platform, ok: false, at, error: data.error ?? "Publicarea a eșuat." };
    return { platform, ok: true, at, url: data.url };
  } catch {
    return { platform, ok: false, at, error: "Fără conexiune la server." };
  }
}
