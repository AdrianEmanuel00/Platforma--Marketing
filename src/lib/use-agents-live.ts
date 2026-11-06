"use client";
import { useEffect, useState } from "react";

/** Dacă serverul are cheile AI (null cât timp verificăm). */
export function useAgentsLive() {
  const [status, setStatus] = useState<{ anthropic: boolean; fal: boolean } | null>(null);
  useEffect(() => {
    fetch("/api/agents/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ anthropic: false, fal: false }));
  }, []);
  return status;
}
