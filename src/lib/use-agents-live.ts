"use client";
import { useEffect, useState } from "react";

export interface AgentsStatus {
  anthropic: boolean;
  fal: boolean;
  tier?: "economic" | "echilibrat" | "maxim";
  textModel?: string;
  imageProvider?: string;
  imageModel?: string;
  imageReady?: boolean;
}

/** Dacă serverul are cheile AI și ce modele folosește (null cât timp verificăm). */
export function useAgentsLive() {
  const [status, setStatus] = useState<AgentsStatus | null>(null);
  useEffect(() => {
    fetch("/api/agents/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ anthropic: false, fal: false }));
  }, []);
  return status;
}
