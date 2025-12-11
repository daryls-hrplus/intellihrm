import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { RealtimeNotifications } from "./RealtimeNotifications";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <RealtimeNotifications />
      <AppSidebar />
      <main className="lg:pl-64 transition-all duration-300">
        <div className="min-h-screen p-4 lg:p-8">
          <AppHeader />
          {children}
        </div>
      </main>
    </div>
  );
}
