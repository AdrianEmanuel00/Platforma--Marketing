import { Sidebar } from "@/components/sidebar";
import { projects, workspace } from "@/lib/demo-data";

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar workspace={workspace} projects={projects} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
