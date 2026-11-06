import { Sidebar } from "@/components/sidebar";
import { projects, workspace } from "@/lib/demo-data";
import { isDemoMode } from "@/lib/supabase/config";

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar workspace={workspace} projects={projects} />
      <div className="flex min-w-0 flex-1 flex-col">
        {isDemoMode && (
          <div className="border-b border-border bg-accent-soft px-4 py-2 text-center text-xs text-accent">
            Mod demo: datele sunt de test, iar agenții nu sunt încă conectați la modelele AI.
          </div>
        )}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
