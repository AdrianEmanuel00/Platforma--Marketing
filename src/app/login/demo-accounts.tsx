"use client";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Store } from "lucide-react";
import { chooseAccount, type AccountId } from "@/lib/store";

const accounts: {
  id: AccountId;
  icon: typeof Building2;
  title: string;
  who: string;
  text: string;
  points: string[];
  href: string;
}[] = [
  {
    id: "agency",
    icon: Building2,
    title: "Agenție de marketing",
    who: "Agenția Nord Social",
    text: "Gestionezi mai mulți clienți, fiecare cu brandul, conturile și calendarul lui.",
    points: ["3 clienți: cafenea, sală de fitness, atelier de mobilă", "Echipă cu roluri și acces pe clienți", "Aprobări înainte de publicare"],
    href: "/app",
  },
  {
    id: "business",
    icon: Store,
    title: "Afacere",
    who: "Florăria Iris",
    text: "Îți faci singur social media pentru un singur brand, cu agenții lângă tine.",
    points: ["Un brand, direct în dashboard", "Postări programate și statistici", "Research zilnic despre concurență"],
    href: "/app/iris",
  },
];

export function DemoAccounts() {
  const router = useRouter();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {accounts.map((a) => (
        <button
          key={a.id}
          onClick={() => {
            chooseAccount(a.id);
            router.push(a.href);
          }}
          className="card group flex flex-col p-5 text-left transition-shadow hover:shadow-md"
        >
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <a.icon size={20} />
          </div>
          <p className="font-semibold">{a.title}</p>
          <p className="text-xs text-muted">{a.who}</p>
          <p className="mt-3 text-sm">{a.text}</p>
          <ul className="mt-3 flex-1 space-y-1 text-xs text-muted">
            {a.points.map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
          <span className="btn-primary mt-5 w-full">
            Intră ca {a.id === "agency" ? "agenție" : "afacere"} <ArrowRight size={16} />
          </span>
        </button>
      ))}
    </div>
  );
}
