import Link from "next/link";
import { authEnabled } from "@/lib/supabase/config";
import { DemoAccounts } from "./demo-accounts";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  // Până pornim conturile reale, intri dintr-un click într-unul din cele două conturi demo.
  if (!authEnabled) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">P</span>
              Platforma Marketing
            </div>
            <h1 className="text-2xl font-semibold">Alege contul cu care intri</h1>
            <p className="mt-1 text-sm text-muted">
              Fără email și fără parolă. Fiecare cont are datele lui, salvate în browser.
            </p>
          </div>
          <DemoAccounts />
        </div>
      </main>
    );
  }

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
