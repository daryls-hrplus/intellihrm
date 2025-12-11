import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMenuPermissions } from "@/hooks/useMenuPermissions";
import { Loader2 } from "lucide-react";

type AppRole = "admin" | "hr_manager" | "employee";

// Map routes to module codes for permission checking
const ROUTE_MODULE_MAP: Record<string, string> = {
  "/": "dashboard",
  "/workforce": "workforce",
  "/leave": "leave",
  "/compensation": "compensation",
  "/benefits": "benefits",
  "/performance": "performance",
  "/training": "training",
  "/succession": "succession",
  "/recruitment": "recruitment",
  "/hse": "hse",
  "/employee-relations": "employee_relations",
  "/property": "property",
  "/admin": "admin",
  "/profile": "profile",
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: AppRole[];
  moduleCode?: string; // Optional explicit module code
}

export function ProtectedRoute({ children, requiredRoles, moduleCode }: ProtectedRouteProps) {
  const { user, roles, isLoading } = useAuth();
  const { hasMenuAccess, isLoading: isPermissionsLoading } = useMenuPermissions();
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
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role-based access (legacy system roles)
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => roles.includes(role));
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check menu permissions from roles table
  // Determine module code from explicit prop or from route path
  const effectiveModuleCode = moduleCode || getModuleCodeFromPath(location.pathname);
  
  if (effectiveModuleCode) {
    // Admins always have access
    if (!roles.includes("admin") && !hasMenuAccess(effectiveModuleCode)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}

// Helper to extract module code from path
function getModuleCodeFromPath(pathname: string): string | null {
  // Check exact match first
  if (ROUTE_MODULE_MAP[pathname]) {
    return ROUTE_MODULE_MAP[pathname];
  }
  
  // Check if path starts with any known module path
  for (const [route, code] of Object.entries(ROUTE_MODULE_MAP)) {
    if (route !== "/" && pathname.startsWith(route)) {
      return code;
    }
  }
  
  return null;
}
