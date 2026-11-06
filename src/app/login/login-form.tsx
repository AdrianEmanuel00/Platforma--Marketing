"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const next = new URLSearchParams(window.location.search).get("next") ?? "/app";
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setError(error.message);
      setState("error");
    } else {
      setState("sent");
    }
  }

  if (state === "sent") {
    return <p className="mt-6 text-sm">Verifică-ți emailul: ți-am trimis linkul de intrare la {email}.</p>;
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-3">
      <input
        type="email"
        required
        placeholder="nume@firma.ro"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input"
      />
      <button type="submit" disabled={state === "sending"} className="btn-primary w-full">
        {state === "sending" ? "Se trimite..." : "Trimite linkul"}
      </button>
      {state === "error" && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
