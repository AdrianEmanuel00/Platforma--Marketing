"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import {
  CalendarDays,
  ChartColumn,
  Images,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Palette,
  Plug,
  Radar,
  Repeat,
  Settings,
  Swords,
  WandSparkles,
} from "lucide-react";
import { LogoMark } from "@/components/logo";
import { chooseAccount, useStore } from "@/lib/store";

const projectNav = [
  { href: "", label: "Dashboard", icon: LayoutDashboard },
  { href: "/studio", label: "Studio de conținut", icon: WandSparkles },
  { href: "/series", label: "Serii de conținut", icon: Repeat },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/research", label: "Research", icon: Radar },
  { href: "/keywords", label: "Cuvinte cheie", icon: KeyRound },
  { href: "/competitors", label: "Competitori", icon: Swords },
  { href: "/brand", label: "Identitate de brand", icon: Palette },
  { href: "/media", label: "Bibliotecă media", icon: Images },
  { href: "/analytics", label: "Statistici", icon: ChartColumn },
  { href: "/accounts", label: "Conturi conectate", icon: Plug },
];

export function Sidebar() {
  const { state, account } = useStore();
  const { workspace, projects } = state;
  const pathname = usePathname();
  const router = useRouter();
  const slug = pathname.split("/")[2];
  const isBusiness = account === "business";
  // O afacere are un singur brand, deci meniul lui e mereu vizibil.
  const current =
    projects.find((p) => p.slug === slug) ??
    (isBusiness ? projects[0] : undefined);

  const link = (
    href: string,
    label: string,
    Icon: typeof LayoutGrid,
    exact = false,
  ) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        className={clsx(
          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
          active
            ? "bg-white/10 text-white"
            : "text-sidebar-fg hover:bg-white/5 hover:text-white",
        )}
      >
        <Icon size={16} />
        {label}
      </Link>
    );
  };

  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 bg-sidebar p-4 md:sticky md:top-0 md:h-screen md:w-64">
      <div className="flex items-center gap-2 px-1">
        <LogoMark />
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">{workspace.name}</p>
          <p className="text-xs text-sidebar-fg">
            {isBusiness ? "Cont de afacere" : "Cont de agenție"}
          </p>
        </div>
      </div>

      {isBusiness ? (
        current && (
          <nav className="flex flex-col gap-1">
            {projectNav.map((n) =>
              link(
                `/app/${current.slug}${n.href}`,
                n.label,
                n.icon,
                n.href === "",
              ),
            )}
          </nav>
        )
      ) : (
        <>
          <nav className="flex flex-col gap-1">
            {link("/app", "Toți clienții", LayoutGrid, true)}
          </nav>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="project"
              className="px-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-fg/70"
            >
              Proiect
            </label>
            <select
              id="project"
              value={current?.slug ?? ""}
              onChange={(e) =>
                e.target.value &&
                router.push(
                  e.target.value === "__new"
                    ? "/app/new"
                    : `/app/${e.target.value}`,
                )
              }
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-sm text-white outline-none"
            >
              <option value="" disabled>
                Alege un client
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.slug} className="text-black">
                  {p.name}
                </option>
              ))}
              <option value="__new" className="text-black">
                + Client nou
              </option>
            </select>
            {current && (
              <nav className="flex flex-col gap-1">
                {projectNav.map((n) =>
                  link(
                    `/app/${current.slug}${n.href}`,
                    n.label,
                    n.icon,
                    n.href === "",
                  ),
                )}
              </nav>
            )}
          </div>
        </>
      )}

      <nav className="mt-auto flex flex-col gap-1">
        {link("/app/settings", "Setări", Settings)}
        <button
          onClick={() => {
            chooseAccount(null);
            router.push("/login");
          }}
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-sidebar-fg transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut size={16} />
          Schimbă contul
        </button>
      </nav>
    </aside>
  );
}
