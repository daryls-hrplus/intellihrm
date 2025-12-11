import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

// Admin pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCompaniesPage from "./pages/admin/AdminCompaniesPage";
import AdminCompanyGroupsPage from "./pages/admin/AdminCompanyGroupsPage";
import AdminAuditLogsPage from "./pages/admin/AdminAuditLogsPage";
import AdminRolesPage from "./pages/admin/AdminRolesPage";
import AdminPiiAccessPage from "./pages/admin/AdminPiiAccessPage";

// Workforce pages
import WorkforceDashboardPage from "./pages/workforce/WorkforceDashboardPage";
import EmployeesPage from "./pages/workforce/EmployeesPage";

// Performance pages
import PerformanceDashboardPage from "./pages/performance/PerformanceDashboardPage";

// Leave pages
import LeaveDashboardPage from "./pages/leave/LeaveDashboardPage";

// Compensation pages
import CompensationDashboardPage from "./pages/compensation/CompensationDashboardPage";

// Benefits pages
import BenefitsDashboardPage from "./pages/benefits/BenefitsDashboardPage";

// Training pages
import TrainingDashboardPage from "./pages/training/TrainingDashboardPage";

// Succession pages
import SuccessionDashboardPage from "./pages/succession/SuccessionDashboardPage";

// Recruitment pages
import RecruitmentDashboardPage from "./pages/recruitment/RecruitmentDashboardPage";

// HSE pages
import HSEDashboardPage from "./pages/hse/HSEDashboardPage";

// Employee Relations pages
import EmployeeRelationsDashboardPage from "./pages/employee-relations/EmployeeRelationsDashboardPage";

// Property pages
import PropertyDashboardPage from "./pages/property/PropertyDashboardPage";

// Other pages
import ProfilePage from "./pages/profile/ProfilePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Main Dashboard */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/companies"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminCompaniesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/company-groups"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminCompanyGroupsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminAuditLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminRolesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pii-access"
              element={
                <ProtectedRoute requiredRoles={["admin"]}>
                  <AdminPiiAccessPage />
                </ProtectedRoute>
              }
            />

            {/* Workforce Routes */}
            <Route
              path="/workforce"
              element={
                <ProtectedRoute>
                  <WorkforceDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workforce/employees"
              element={
                <ProtectedRoute>
                  <EmployeesPage />
                </ProtectedRoute>
              }
            />

            {/* Leave Routes */}
            <Route
              path="/leave"
              element={
                <ProtectedRoute>
                  <LeaveDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Compensation Routes */}
            <Route
              path="/compensation"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <CompensationDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Benefits Routes */}
            <Route
              path="/benefits"
              element={
                <ProtectedRoute>
                  <BenefitsDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Performance Routes */}
            <Route
              path="/performance"
              element={
                <ProtectedRoute>
                  <PerformanceDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Training Routes */}
            <Route
              path="/training"
              element={
                <ProtectedRoute>
                  <TrainingDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Succession Routes */}
            <Route
              path="/succession"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <SuccessionDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Recruitment Routes */}
            <Route
              path="/recruitment"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <RecruitmentDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* HSE Routes */}
            <Route
              path="/hse"
              element={
                <ProtectedRoute>
                  <HSEDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Employee Relations Routes */}
            <Route
              path="/employee-relations"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <EmployeeRelationsDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Property Routes */}
            <Route
              path="/property"
              element={
                <ProtectedRoute>
                  <PropertyDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
