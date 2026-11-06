import Link from "next/link";
import { redirect } from "next/navigation";
import { authEnabled } from "@/lib/supabase/config";
import { Palette, Radar, Send, WandSparkles } from "lucide-react";

const features = [
  { icon: Palette, title: "Identitate de brand", text: "Agentul Brand îți citește site-ul și logo-ul și construiește tonul și stilul vizual." },
  { icon: WandSparkles, title: "Imagini și video", text: "Agentul Creative generează postări care arată mereu ca brandul tău." },
  { icon: Send, title: "Publicare", text: "Alegi platformele, apeși Postează sau Programează. Gata." },
  { icon: Radar, title: "Research zilnic", text: "În fiecare dimineață: trenduri, ce fac competitorii și idei noi." },
];

export default function Home() {
  // Fără conturi încă, pagina principală deschide direct aplicația.
  if (!authEnabled) redirect("/app");

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10 sm:px-6">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">P</span>
          Platforma Marketing
        </div>
        <Link href="/login" className="btn-ghost">
          Intră în cont
        </Link>
      </nav>

      <section className="py-20 text-center">
        <p className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
          Pentru afaceri și agenții
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          O echipă de agenți AI care îți face social media
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-muted">
          Creează conținut în identitatea brandului, publică pe toate rețelele și află în fiecare dimineață ce merge
          în piața ta.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/app" className="btn-primary">
            Intră în aplicație
          </Link>
          <Link href="/login" className="btn-ghost">
            Creează cont
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="card p-5">
            <f.icon className="mb-3 text-accent" size={20} />
            <h2 className="font-semibold">{f.title}</h2>
            <p className="mt-1 text-sm text-muted">{f.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
