import { Sidebar } from "./sidebar";
import { Footer } from "./footer";
import { UserMenu } from "./user-menu";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden flex-col">
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 bg-background">
          <div className="flex items-center justify-end p-4 border-b flex-shrink-0">
            <UserMenu />
          </div>
          <div className="flex-1 overflow-y-auto container mx-auto p-6 min-h-0">{children}</div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
