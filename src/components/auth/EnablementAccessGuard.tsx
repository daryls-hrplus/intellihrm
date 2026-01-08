import { Navigate, useLocation } from "react-router-dom";
import { useTenantContext } from "@/hooks/useTenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface EnablementAccessGuardProps {
  children: React.ReactNode;
}

/**
 * Guard component that restricts access to the Enablement Center.
 * Only users in Intelli HRM internal tenants can access enablement authoring features.
 * Client tenants are redirected to the Help Center for read-only content access.
 */
export function EnablementAccessGuard({ children }: EnablementAccessGuardProps) {
  const { isHRPlusInternal, isLoading: isTenantLoading } = useTenantContext();
  const { isLoading: isAuthLoading, hasRole } = useAuth();
  const location = useLocation();

  // Show loading while determining tenant type
  if (isAuthLoading || isTenantLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Access rules:
  // - Intelli HRM internal tenants: always allowed
  // - Explicit roles: enablement_admin and system_admin can access from any tenant
  const canAccess =
    isHRPlusInternal || hasRole("enablement_admin") || hasRole("system_admin");

  // Client tenants without explicit role cannot access Enablement Center - redirect to Help Center
  if (!canAccess) {
    return <Navigate to="/help" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
