import { LogoMark } from "@/components/logo";

export default async function UnlockPage({ searchParams }: { searchParams: Promise<{ wrong?: string; next?: string }> }) {
  const sp = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <form method="post" action="/api/unlock" className="card w-full max-w-sm space-y-4 p-6">
        <div className="flex items-center gap-2">
          <LogoMark />
          <h1 className="font-semibold">Parola aplicației</h1>
        </div>
        <p className="text-sm text-muted">O ceri o singură dată pe acest dispozitiv.</p>
        <input type="hidden" name="next" value={sp.next ?? "/app"} />
        <input name="password" type="password" autoFocus required className="input" aria-label="Parola" />
        {sp.wrong && <p className="text-sm text-red-600">Parola nu e corectă.</p>}
        <button type="submit" className="btn-primary w-full">
          Intră
        </button>
      </form>
    </main>
  );
}
