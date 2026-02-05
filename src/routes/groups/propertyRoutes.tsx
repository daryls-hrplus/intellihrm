import { lazy } from "react";
import { renderProtectedLazyRoutes } from "@/routes/routeHelpers";

const PropertyDashboardPage = lazy(() => import("@/pages/property/PropertyDashboardPage"));
const PropertyAnalyticsPage = lazy(() => import("@/pages/property/PropertyAnalyticsPage"));
const PropertyAssetsPage = lazy(() => import("@/pages/property/PropertyAssetsPage"));
const PropertyAssignmentsPage = lazy(() => import("@/pages/property/PropertyAssignmentsPage"));
const PropertyRequestsPage = lazy(() => import("@/pages/property/PropertyRequestsPage"));
const PropertyMaintenancePage = lazy(() => import("@/pages/property/PropertyMaintenancePage"));
const PropertyCategoriesPage = lazy(() => import("@/pages/property/PropertyCategoriesPage"));

export function PropertyRoutes() {
  return (
    <>
      {renderProtectedLazyRoutes([
        { path: "/property", moduleCode: "property", Component: PropertyDashboardPage },
        { path: "/property/analytics", moduleCode: "property", Component: PropertyAnalyticsPage },
        { path: "/property/assets", moduleCode: "property", Component: PropertyAssetsPage },
        { path: "/property/assignments", moduleCode: "property", Component: PropertyAssignmentsPage },
        { path: "/property/requests", moduleCode: "property", Component: PropertyRequestsPage },
        { path: "/property/maintenance", moduleCode: "property", Component: PropertyMaintenancePage },
        { path: "/property/categories", moduleCode: "property", Component: PropertyCategoriesPage },
      ])}
    </>
  );
}
