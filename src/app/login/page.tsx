import Link from "next/link";
import { redirect } from "next/navigation";
import { authEnabled } from "@/lib/supabase/config";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  // Până conectăm Supabase, nu există conturi: intri direct în aplicație.
  if (!authEnabled) redirect("/app");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm p-6">
        <Link href="/" className="mb-6 flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">P</span>
          Platforma Marketing
        </Link>
        <h1 className="text-xl font-semibold">Intră în cont</h1>
        <p className="mt-1 text-sm text-muted">Îți trimitem un link pe email, fără parolă.</p>
        <LoginForm />
      </div>
    </main>
  );
}
