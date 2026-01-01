import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMenuPermissions } from "@/hooks/useMenuPermissions";
import { Loader2 } from "lucide-react";
import { DraggableSidebar } from "./DraggableSidebar";
import { AppHeader } from "./AppHeader";
import { RealtimeNotifications } from "./RealtimeNotifications";
import {
  TourProvider,
  TourEngine,
  FloatingHelpButton,
  HelpPanel,
  FirstTimeUserDetector,
} from "@/components/tours";

export function ProtectedLayout() {
  const { user, isLoading } = useAuth();
  const { isLoading: isPermissionsLoading } = useMenuPermissions();
  const location = useLocation();

  if (isLoading || isPermissionsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/landing" state={{ from: location }} replace />;
  }

  return (
    <TourProvider>
      <div className="min-h-screen bg-background">
        <RealtimeNotifications />
        <DraggableSidebar />
        <main className="lg:pl-64 transition-all duration-300">
          <div className="min-h-screen p-4 lg:p-8">
            <AppHeader />
            <Outlet />
          </div>
        </main>
        
        {/* Tour System Components */}
        <TourEngine />
        <FloatingHelpButton />
        <HelpPanel />
        <FirstTimeUserDetector />
      </div>
    </TourProvider>
  );
}
