import { Navigate, useLocation } from "react-router-dom";
import { useTenantContext } from "@/hooks/useTenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface EnablementAccessGuardProps {
  children: React.ReactNode;
}

/**
 * Guard component that restricts access to the Enablement Center.
 * Only users in HRplus internal tenants can access enablement authoring features.
 * Client tenants are redirected to the Help Center for read-only content access.
 */
export function EnablementAccessGuard({ children }: EnablementAccessGuardProps) {
  const { isHRPlusInternal, isLoading: isTenantLoading } = useTenantContext();
  const { isLoading: isAuthLoading } = useAuth();
  const location = useLocation();

  // Show loading while determining tenant type
  if (isAuthLoading || isTenantLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Client tenants cannot access Enablement Center - redirect to Help Center
  if (!isHRPlusInternal) {
    return <Navigate to="/help" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
