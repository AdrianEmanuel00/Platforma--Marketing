import { Sidebar } from "@/components/sidebar";
import { StoreProvider } from "@/lib/store";

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <StoreProvider>
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">{children}</main>
        </div>
      </div>
    </StoreProvider>
  );
}
