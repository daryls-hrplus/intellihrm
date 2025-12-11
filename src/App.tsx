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

// Workforce pages
import WorkforceDashboardPage from "./pages/workforce/WorkforceDashboardPage";
import EmployeesPage from "./pages/workforce/EmployeesPage";

// Performance pages
import PerformanceDashboardPage from "./pages/performance/PerformanceDashboardPage";

// Other pages
import ProfilePage from "./pages/profile/ProfilePage";
import LeavePage from "./pages/leave/LeavePage";
import RecruitmentPage from "./pages/recruitment/RecruitmentPage";

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

            {/* Performance Routes */}
            <Route
              path="/performance"
              element={
                <ProtectedRoute>
                  <PerformanceDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Other Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave"
              element={
                <ProtectedRoute>
                  <LeavePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruitment"
              element={
                <ProtectedRoute requiredRoles={["admin", "hr_manager"]}>
                  <RecruitmentPage />
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
