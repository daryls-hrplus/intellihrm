import { lazy } from "react";
import { renderProtectedLazyRoutes } from "@/routes/routeHelpers";

const EmployeeRelationsDashboardPage = lazy(() => import("@/pages/employee-relations/EmployeeRelationsDashboardPage"));
const ERAnalyticsPage = lazy(() => import("@/pages/employee-relations/ERAnalyticsPage"));
const ERCasesPage = lazy(() => import("@/pages/employee-relations/ERCasesPage"));
const ERDisciplinaryPage = lazy(() => import("@/pages/employee-relations/ERDisciplinaryPage"));
const ERRecognitionPage = lazy(() => import("@/pages/employee-relations/ERRecognitionPage"));
const ERExitInterviewsPage = lazy(() => import("@/pages/employee-relations/ERExitInterviewsPage"));
const ERSurveysPage = lazy(() => import("@/pages/employee-relations/ERSurveysPage"));
const ERWellnessPage = lazy(() => import("@/pages/employee-relations/ERWellnessPage"));
const ERUnionsPage = lazy(() => import("@/pages/employee-relations/ERUnionsPage"));
const CBADetailPage = lazy(() => import("@/pages/employee-relations/CBADetailPage"));
const ERGrievancesPage = lazy(() => import("@/pages/employee-relations/ERGrievancesPage"));
const ERCourtJudgementsPage = lazy(() => import("@/pages/employee-relations/ERCourtJudgementsPage"));

export function EmployeeRelationsRoutes() {
  return (
    <>
      {renderProtectedLazyRoutes([
        { path: "/employee-relations", moduleCode: "employee_relations", Component: EmployeeRelationsDashboardPage },
        { path: "/employee-relations/analytics", moduleCode: "employee_relations", Component: ERAnalyticsPage },
        { path: "/employee-relations/cases", moduleCode: "employee_relations", Component: ERCasesPage },
        { path: "/employee-relations/disciplinary", moduleCode: "employee_relations", Component: ERDisciplinaryPage },
        { path: "/employee-relations/recognition", moduleCode: "employee_relations", Component: ERRecognitionPage },
        { path: "/employee-relations/exit-interviews", moduleCode: "employee_relations", Component: ERExitInterviewsPage },
        { path: "/employee-relations/surveys", moduleCode: "employee_relations", Component: ERSurveysPage },
        { path: "/employee-relations/wellness", moduleCode: "employee_relations", Component: ERWellnessPage },
        { path: "/employee-relations/unions", moduleCode: "employee_relations", Component: ERUnionsPage },
        { path: "/employee-relations/unions/:id", moduleCode: "employee_relations", Component: CBADetailPage },
        { path: "/employee-relations/grievances", moduleCode: "employee_relations", Component: ERGrievancesPage },
        { path: "/employee-relations/court-judgements", moduleCode: "employee_relations", Component: ERCourtJudgementsPage },
      ])}
    </>
  );
}
