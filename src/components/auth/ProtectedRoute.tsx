import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMenuPermissions } from "@/hooks/useMenuPermissions";

type AppRole = "admin" | "hr_manager" | "employee";

// Map routes to module codes for permission checking
const ROUTE_MODULE_MAP: Record<string, string> = {
  "/": "dashboard",
  "/ess": "ess",
  "/mss": "mss",
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
  moduleCode?: string;
}

export function ProtectedRoute({ children, requiredRoles, moduleCode }: ProtectedRouteProps) {
  const { roles } = useAuth();
  const { hasMenuAccess } = useMenuPermissions();
  const location = useLocation();

  // Check role-based access (legacy system roles)
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) => roles.includes(role));
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check menu permissions from roles table
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
  if (ROUTE_MODULE_MAP[pathname]) {
    return ROUTE_MODULE_MAP[pathname];
  }
  
  for (const [route, code] of Object.entries(ROUTE_MODULE_MAP)) {
    if (route !== "/" && pathname.startsWith(route)) {
      return code;
    }
  }
  
  return null;
}
