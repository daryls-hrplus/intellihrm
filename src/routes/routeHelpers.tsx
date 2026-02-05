import type { ComponentType, LazyExoticComponent } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LazyPage } from "@/routes/LazyPage";

export type AppRole = "admin" | "hr_manager" | "employee";

export type ProtectedLazyRouteDef = {
  path: string;
  Component: LazyExoticComponent<ComponentType<any>>;
  moduleCode?: string;
  requiredRoles?: AppRole[];
};

export function renderProtectedLazyRoutes(defs: ProtectedLazyRouteDef[]) {
  return defs.map(({ path, Component, moduleCode, requiredRoles }) => (
    <Route
      key={path}
      path={path}
      element={
        <ProtectedRoute moduleCode={moduleCode} requiredRoles={requiredRoles}>
          <LazyPage>
            <Component />
          </LazyPage>
        </ProtectedRoute>
      }
    />
  ));
}
