import { Suspense, ComponentType } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { EnablementAccessGuard } from '@/components/auth/EnablementAccessGuard';
import { Loader2 } from 'lucide-react';

type AppRole = "admin" | "hr_manager" | "employee";

// Loading fallback
export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// Wrapper for lazy components
export function withSuspense<T extends ComponentType<any>>(
  Component: React.LazyExoticComponent<T>
) {
  return function SuspenseWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Route configuration type
export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  moduleCode?: string;
  requiredRoles?: AppRole[];
  enablementGuard?: boolean;
  children?: RouteConfig[];
}

// Helper to create protected route elements
export function createProtectedElement(
  Component: React.LazyExoticComponent<ComponentType<any>>,
  options?: {
    moduleCode?: string;
    requiredRoles?: AppRole[];
    enablementGuard?: boolean;
  }
) {
  const SuspenseComponent = withSuspense(Component);
  
  let element = <SuspenseComponent />;
  
  if (options?.enablementGuard) {
    element = <EnablementAccessGuard>{element}</EnablementAccessGuard>;
  }
  
  return (
    <ProtectedRoute 
      moduleCode={options?.moduleCode}
      requiredRoles={options?.requiredRoles}
    >
      {element}
    </ProtectedRoute>
  );
}

// Helper to render routes from config
export function renderRoutes(routes: RouteConfig[]) {
  return routes.map((route) => (
    <Route key={route.path} path={route.path} element={route.element}>
      {route.children && renderRoutes(route.children)}
    </Route>
  ));
}
