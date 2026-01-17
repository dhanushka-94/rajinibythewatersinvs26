import { Sidebar } from "./sidebar";
import { Footer } from "./footer";
import { UserMenu } from "./user-menu";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background flex flex-col">
          <div className="flex items-center justify-end p-4 border-b">
            <UserMenu />
          </div>
          <div className="flex-1 container mx-auto p-6">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
