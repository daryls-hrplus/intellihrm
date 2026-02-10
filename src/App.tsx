import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TranslationsProvider } from "@/components/TranslationsProvider";
import { ThemeProvider } from "next-themes";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { EnablementAccessGuard } from "@/components/auth/EnablementAccessGuard";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";

// Initialize i18n
import "@/i18n";

import { LazyPage } from "@/routes/LazyPage";
import { PublicRoutes } from "@/routes/groups/publicRoutes";
import { EssRoutes } from "@/routes/groups/essRoutes";
import { MssRoutes } from "@/routes/groups/mssRoutes";
import { AdminRoutes } from "@/routes/groups/adminRoutes";
import { WorkforceRoutes } from "@/routes/groups/workforceRoutes";
import { TimeAttendanceRoutes } from "@/routes/groups/timeAttendanceRoutes";
import { PerformanceRoutes } from "@/routes/groups/performanceRoutes";
import { LeaveRoutes } from "@/routes/groups/leaveRoutes";
import { CompensationRoutes } from "@/routes/groups/compensationRoutes";
import { BenefitsRoutes } from "@/routes/groups/benefitsRoutes";
import { TrainingRoutes } from "@/routes/groups/trainingRoutes";
import { SuccessionRoutes } from "@/routes/groups/successionRoutes";
import { RecruitmentRoutes } from "@/routes/groups/recruitmentRoutes";
import { HseRoutes } from "@/routes/groups/hseRoutes";
import { EmployeeRelationsRoutes } from "@/routes/groups/employeeRelationsRoutes";
import { PropertyRoutes } from "@/routes/groups/propertyRoutes";
import { PayrollRoutes } from "@/routes/groups/payrollRoutes";
import { HrHubRoutes } from "@/routes/groups/hrHubRoutes";
import { EnablementAppRoutes } from "@/routes/groups/enablementAppRoutes";
import { MiscProtectedRoutes } from "@/routes/groups/miscProtectedRoutes";

// Core pages (synchronous for fast initial load)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

const queryClient = new QueryClient();

// Note: Suspense boundaries are centralized in src/routes/LazyPage.tsx

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TranslationsProvider>
            <AuthProvider>
            <Routes>
              {/* Root route - Login page */}
              <Route path="/" element={<AuthPage />} />

              {PublicRoutes()}

              {/* Protected Routes with Layout */}
              <Route element={<ProtectedLayout />}>
                {/* Main Dashboard */}
                <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />

                {EssRoutes()}
                {MssRoutes()}
                {AdminRoutes()}
                {WorkforceRoutes()}
                {TimeAttendanceRoutes()}
                {PerformanceRoutes()}
                {LeaveRoutes()}
                {CompensationRoutes()}
                {BenefitsRoutes()}
                {TrainingRoutes()}
                {SuccessionRoutes()}
                {RecruitmentRoutes()}
                {HseRoutes()}
                {EmployeeRelationsRoutes()}
                {PropertyRoutes()}
                {PayrollRoutes()}
                {HrHubRoutes()}
                {(import.meta.env.DEV || import.meta.env.VITE_INCLUDE_ENABLEMENT === "true") && EnablementAppRoutes()}
                {MiscProtectedRoutes()}
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </AuthProvider>
          </TranslationsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
