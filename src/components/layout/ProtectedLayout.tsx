import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMenuPermissions } from "@/hooks/useMenuPermissions";
import { Loader2 } from "lucide-react";
import { DraggableSidebar } from "./DraggableSidebar";
import { AppHeader } from "./AppHeader";
import { WorkspaceTabSidebar } from "./WorkspaceTabSidebar";
import { RealtimeNotifications } from "./RealtimeNotifications";
import { SessionRecoveryManager } from "./SessionRecoveryManager";
import { TabProvider } from "@/contexts/TabContext";
import { useTabKeyboardShortcuts } from "@/hooks/useTabKeyboardShortcuts";
import { useTabDatabaseSync } from "@/hooks/useTabDatabaseSync";
import { useRouteToTabSync } from "@/hooks/useRouteToTabSync";
import { TabCloseConfirmDialog } from "@/components/dialogs/TabCloseConfirmDialog";
import {
  TourProvider,
  TourEngine,
  FloatingHelpButton,
  HelpPanel,
  FirstTimeUserDetector,
} from "@/components/tours";
import { HelpButton } from "@/components/help";

function TabDatabaseSyncHandler() {
  useTabDatabaseSync();
  return null;
}

function RouteToTabSyncHandler() {
  useRouteToTabSync();
  return null;
}

function TabKeyboardHandler({ children }: { children: React.ReactNode }) {
  const { pendingCloseTab, confirmClose, cancelClose } = useTabKeyboardShortcuts();
  
  return (
    <>
      {children}
      {/* Dialog for keyboard shortcut (Ctrl+W) close with unsaved changes */}
      <TabCloseConfirmDialog
        open={pendingCloseTab !== null}
        tab={pendingCloseTab}
        onConfirm={confirmClose}
        onCancel={cancelClose}
      />
    </>
  );
}

export function ProtectedLayout() {
  const { user, isLoading } = useAuth();
  // Do not gate the entire layout on permissions fetch.
  // Route-level guards (ProtectedRoute) still enforce access, and the sidebar
  // fails-safe to hiding modules while permissions are loading.
  useMenuPermissions();
  const location = useLocation();

  if (isLoading) {
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
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return (
    <TabProvider>
      <TourProvider>
        <TabKeyboardHandler>
          <RouteToTabSyncHandler />
          <SessionRecoveryManager />
          <div className="min-h-screen bg-background">
            <RealtimeNotifications />
            <DraggableSidebar />
            <main className="lg:pl-64 lg:pr-14 transition-all duration-300">
              <div className="min-h-screen p-4 lg:p-8">
                <AppHeader />
                <Outlet />
              </div>
            </main>
            <WorkspaceTabSidebar />
            
            {/* Tour System Components */}
            <TourEngine />
            <FloatingHelpButton />
            <HelpPanel />
            <FirstTimeUserDetector />
            
            {/* Video Help System */}
            <HelpButton />
          </div>
        </TabKeyboardHandler>
      </TourProvider>
    </TabProvider>
  );
}

