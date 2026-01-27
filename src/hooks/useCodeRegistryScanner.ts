import { useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  CodeRegistry, 
  CodeRegistryEntry, 
  CodeRegistrySyncStatus 
} from "@/types/codeRegistry";

/**
 * Static route registry extracted from App.tsx
 * This is the source of truth for what routes exist in code
 */
const CODE_ROUTES: Omit<CodeRegistryEntry, 'featureCode'>[] = [
  // Core routes
  { pageName: "Index", routePath: "/", moduleCode: "dashboard", hasProtection: true, requiredRoles: [], protectedModuleCode: null, sourceFile: "App.tsx" },
  { pageName: "AuthPage", routePath: "/auth", moduleCode: "auth", hasProtection: false, requiredRoles: [], protectedModuleCode: null, sourceFile: "App.tsx" },
  { pageName: "MFAChallengePage", routePath: "/auth/mfa", moduleCode: "auth", hasProtection: false, requiredRoles: [], protectedModuleCode: null, sourceFile: "App.tsx" },
  
  // Admin routes
  { pageName: "AdminDashboardPage", routePath: "/admin", moduleCode: "admin", hasProtection: true, requiredRoles: ["admin"], protectedModuleCode: null, sourceFile: "App.tsx" },
  { pageName: "AdminUsersPage", routePath: "/admin/users", moduleCode: "admin", hasProtection: true, requiredRoles: ["admin"], protectedModuleCode: null, sourceFile: "App.tsx" },
  { pageName: "AdminCompaniesPage", routePath: "/admin/companies", moduleCode: "admin", hasProtection: true, requiredRoles: ["admin"], protectedModuleCode: null, sourceFile: "App.tsx" },
  { pageName: "AdminRolesPage", routePath: "/admin/roles", moduleCode: "admin", hasProtection: true, requiredRoles: ["admin"], protectedModuleCode: null, sourceFile: "App.tsx" },
  { pageName: "AdminSettingsPage", routePath: "/admin/settings", moduleCode: "admin", hasProtection: true, requiredRoles: ["admin"], protectedModuleCode: null, sourceFile: "App.tsx" },
  { pageName: "AdminAuditLogsPage", routePath: "/admin/audit-logs", moduleCode: "admin", hasProtection: true, requiredRoles: ["admin"], protectedModuleCode: null, sourceFile: "App.tsx" },
  { pageName: "AIGovernancePage", routePath: "/admin/ai-governance", moduleCode: "admin", hasProtection: true, requiredRoles: ["admin"], protectedModuleCode: null, sourceFile: "App.tsx" },
  { pageName: "ImplementationHandbookPage", routePath: "/admin/implementation-handbook", moduleCode: "admin", hasProtection: true, requiredRoles: ["admin", "hr_manager"], protectedModuleCode: null, sourceFile: "App.tsx" },
  
  // ESS routes
  { pageName: "EmployeeSelfServicePage", routePath: "/ess", moduleCode: "ess", hasProtection: true, requiredRoles: [], protectedModuleCode: "ess", sourceFile: "App.tsx" },
  { pageName: "MyLeavePage", routePath: "/ess/leave", moduleCode: "ess", hasProtection: true, requiredRoles: [], protectedModuleCode: "ess", sourceFile: "App.tsx" },
  { pageName: "MyGoalsPage", routePath: "/ess/goals", moduleCode: "ess", hasProtection: true, requiredRoles: [], protectedModuleCode: "ess", sourceFile: "App.tsx" },
  { pageName: "MyAppraisalsPage", routePath: "/ess/appraisals", moduleCode: "ess", hasProtection: true, requiredRoles: [], protectedModuleCode: "ess", sourceFile: "App.tsx" },
  
  // MSS routes
  { pageName: "ManagerSelfServicePage", routePath: "/mss", moduleCode: "mss", hasProtection: true, requiredRoles: ["admin", "hr_manager"], protectedModuleCode: "mss", sourceFile: "App.tsx" },
  { pageName: "MssTeamPage", routePath: "/mss/team", moduleCode: "mss", hasProtection: true, requiredRoles: [], protectedModuleCode: "mss", sourceFile: "App.tsx" },
  { pageName: "MssAppraisalsPage", routePath: "/mss/appraisals", moduleCode: "mss", hasProtection: true, requiredRoles: [], protectedModuleCode: "mss", sourceFile: "App.tsx" },
  
  // Workforce routes
  { pageName: "WorkforceDashboardPage", routePath: "/workforce", moduleCode: "workforce", hasProtection: true, requiredRoles: [], protectedModuleCode: null, sourceFile: "App.tsx" },
  { pageName: "EmployeesPage", routePath: "/workforce/employees", moduleCode: "workforce", hasProtection: true, requiredRoles: [], protectedModuleCode: null, sourceFile: "App.tsx" },
  { pageName: "PositionsPage", routePath: "/workforce/positions", moduleCode: "workforce", hasProtection: true, requiredRoles: [], protectedModuleCode: null, sourceFile: "App.tsx" },
  { pageName: "DepartmentsPage", routePath: "/workforce/departments", moduleCode: "workforce", hasProtection: true, requiredRoles: [], protectedModuleCode: null, sourceFile: "App.tsx" },
  { pageName: "OrgStructurePage", routePath: "/workforce/org-chart", moduleCode: "workforce", hasProtection: true, requiredRoles: [], protectedModuleCode: null, sourceFile: "App.tsx" },
  { pageName: "JobsPage", routePath: "/workforce/jobs", moduleCode: "workforce", hasProtection: true, requiredRoles: ["admin", "hr_manager"], protectedModuleCode: null, sourceFile: "App.tsx" },
  { pageName: "CompetenciesPage", routePath: "/workforce/competencies", moduleCode: "workforce", hasProtection: true, requiredRoles: ["admin", "hr_manager"], protectedModuleCode: null, sourceFile: "App.tsx" },
  
  // Performance routes
  { pageName: "PerformanceDashboardPage", routePath: "/performance", moduleCode: "performance", hasProtection: true, requiredRoles: [], protectedModuleCode: "performance", sourceFile: "App.tsx" },
  { pageName: "GoalsPage", routePath: "/performance/goals", moduleCode: "performance", hasProtection: true, requiredRoles: [], protectedModuleCode: "performance", sourceFile: "App.tsx" },
  { pageName: "AppraisalsPage", routePath: "/performance/appraisals", moduleCode: "performance", hasProtection: true, requiredRoles: [], protectedModuleCode: "performance", sourceFile: "App.tsx" },
  { pageName: "Review360Page", routePath: "/performance/360", moduleCode: "performance", hasProtection: true, requiredRoles: [], protectedModuleCode: "performance", sourceFile: "App.tsx" },
  { pageName: "CalibrationSessionsPage", routePath: "/performance/calibration", moduleCode: "performance", hasProtection: true, requiredRoles: [], protectedModuleCode: "performance", sourceFile: "App.tsx" },
  
  // Leave routes
  { pageName: "LeaveDashboardPage", routePath: "/leave", moduleCode: "leave", hasProtection: true, requiredRoles: [], protectedModuleCode: "leave", sourceFile: "App.tsx" },
  { pageName: "LeaveTypesPage", routePath: "/leave/types", moduleCode: "leave", hasProtection: true, requiredRoles: [], protectedModuleCode: "leave", sourceFile: "App.tsx" },
  { pageName: "LeaveApprovalsPage", routePath: "/leave/approvals", moduleCode: "leave", hasProtection: true, requiredRoles: [], protectedModuleCode: "leave", sourceFile: "App.tsx" },
  
  // Compensation routes
  { pageName: "CompensationDashboardPage", routePath: "/compensation", moduleCode: "compensation", hasProtection: true, requiredRoles: [], protectedModuleCode: "compensation", sourceFile: "App.tsx" },
  { pageName: "PayElementsPage", routePath: "/compensation/pay-elements", moduleCode: "compensation", hasProtection: true, requiredRoles: [], protectedModuleCode: "compensation", sourceFile: "App.tsx" },
  { pageName: "SalaryGradesPage", routePath: "/compensation/salary-grades", moduleCode: "compensation", hasProtection: true, requiredRoles: [], protectedModuleCode: "compensation", sourceFile: "App.tsx" },
  
  // Benefits routes
  { pageName: "BenefitsDashboardPage", routePath: "/benefits", moduleCode: "benefits", hasProtection: true, requiredRoles: [], protectedModuleCode: "benefits", sourceFile: "App.tsx" },
  { pageName: "BenefitPlansPage", routePath: "/benefits/plans", moduleCode: "benefits", hasProtection: true, requiredRoles: [], protectedModuleCode: "benefits", sourceFile: "App.tsx" },
  
  // Training routes
  { pageName: "TrainingDashboardPage", routePath: "/training", moduleCode: "training", hasProtection: true, requiredRoles: [], protectedModuleCode: "training", sourceFile: "App.tsx" },
  { pageName: "CourseCatalogPage", routePath: "/training/courses", moduleCode: "training", hasProtection: true, requiredRoles: [], protectedModuleCode: "training", sourceFile: "App.tsx" },
  
  // Succession routes
  { pageName: "SuccessionDashboardPage", routePath: "/succession", moduleCode: "succession", hasProtection: true, requiredRoles: [], protectedModuleCode: "succession", sourceFile: "App.tsx" },
  { pageName: "TalentPoolsPage", routePath: "/succession/talent-pools", moduleCode: "succession", hasProtection: true, requiredRoles: [], protectedModuleCode: "succession", sourceFile: "App.tsx" },
  { pageName: "NineBoxPage", routePath: "/succession/nine-box", moduleCode: "succession", hasProtection: true, requiredRoles: [], protectedModuleCode: "succession", sourceFile: "App.tsx" },
  
  // Recruitment routes
  { pageName: "RecruitmentDashboardPage", routePath: "/recruitment", moduleCode: "recruitment", hasProtection: true, requiredRoles: [], protectedModuleCode: "recruitment", sourceFile: "App.tsx" },
  { pageName: "RequisitionsPage", routePath: "/recruitment/requisitions", moduleCode: "recruitment", hasProtection: true, requiredRoles: [], protectedModuleCode: "recruitment", sourceFile: "App.tsx" },
  { pageName: "CandidatesPage", routePath: "/recruitment/candidates", moduleCode: "recruitment", hasProtection: true, requiredRoles: [], protectedModuleCode: "recruitment", sourceFile: "App.tsx" },
  
  // Payroll routes
  { pageName: "PayrollDashboardPage", routePath: "/payroll", moduleCode: "payroll", hasProtection: true, requiredRoles: [], protectedModuleCode: "payroll", sourceFile: "App.tsx" },
  { pageName: "PayrollProcessingPage", routePath: "/payroll/processing", moduleCode: "payroll", hasProtection: true, requiredRoles: [], protectedModuleCode: "payroll", sourceFile: "App.tsx" },
  { pageName: "PayslipsPage", routePath: "/payroll/payslips", moduleCode: "payroll", hasProtection: true, requiredRoles: [], protectedModuleCode: "payroll", sourceFile: "App.tsx" },
  
  // Time & Attendance routes
  { pageName: "TimeAttendanceDashboardPage", routePath: "/time-attendance", moduleCode: "time_attendance", hasProtection: true, requiredRoles: [], protectedModuleCode: "time_attendance", sourceFile: "App.tsx" },
  { pageName: "ShiftManagementPage", routePath: "/time-attendance/shifts", moduleCode: "time_attendance", hasProtection: true, requiredRoles: [], protectedModuleCode: "time_attendance", sourceFile: "App.tsx" },
  
  // HSE routes
  { pageName: "HSEDashboardPage", routePath: "/hse", moduleCode: "hse", hasProtection: true, requiredRoles: [], protectedModuleCode: "hse", sourceFile: "App.tsx" },
  { pageName: "HSEIncidentsPage", routePath: "/hse/incidents", moduleCode: "hse", hasProtection: true, requiredRoles: [], protectedModuleCode: "hse", sourceFile: "App.tsx" },
  
  // Employee Relations routes
  { pageName: "EmployeeRelationsDashboardPage", routePath: "/employee-relations", moduleCode: "employee_relations", hasProtection: true, requiredRoles: [], protectedModuleCode: "employee_relations", sourceFile: "App.tsx" },
  
  // Property routes
  { pageName: "PropertyDashboardPage", routePath: "/property", moduleCode: "property", hasProtection: true, requiredRoles: [], protectedModuleCode: "property", sourceFile: "App.tsx" },
  
  // Reports routes
  { pageName: "ReportsHubPage", routePath: "/reports", moduleCode: "reports", hasProtection: true, requiredRoles: ["admin", "hr_manager"], protectedModuleCode: null, sourceFile: "App.tsx" },
  
  // Enablement routes
  { pageName: "EnablementHubPage", routePath: "/enablement", moduleCode: "enablement", hasProtection: true, requiredRoles: [], protectedModuleCode: null, sourceFile: "App.tsx" },
  { pageName: "RouteRegistryPage", routePath: "/enablement/route-registry", moduleCode: "enablement", hasProtection: true, requiredRoles: [], protectedModuleCode: null, sourceFile: "App.tsx" },
  { pageName: "ProductCapabilitiesPage", routePath: "/enablement/product-capabilities", moduleCode: "enablement", hasProtection: true, requiredRoles: [], protectedModuleCode: null, sourceFile: "App.tsx" },
  // Deprecated: FeatureCatalogPage - now redirects to /enablement/audit
  
  // AI routes
  { pageName: "AIHubPage", routePath: "/ai", moduleCode: "ai", hasProtection: true, requiredRoles: [], protectedModuleCode: null, sourceFile: "App.tsx" },
  { pageName: "AIAssistantPage", routePath: "/ai/assistant", moduleCode: "ai", hasProtection: true, requiredRoles: [], protectedModuleCode: null, sourceFile: "App.tsx" },
  
  // Help routes
  { pageName: "HelpCenterPage", routePath: "/help", moduleCode: "help", hasProtection: true, requiredRoles: [], protectedModuleCode: null, sourceFile: "App.tsx" },
];

/**
 * Generate feature code from route path
 */
function generateFeatureCode(routePath: string): string {
  if (routePath === "/") return "dashboard";
  return routePath
    .replace(/^\//, '')
    .replace(/\//g, '_')
    .replace(/-/g, '_')
    .toLowerCase();
}

/**
 * Hook for scanning and managing the code registry
 */
export function useCodeRegistryScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<CodeRegistry | null>(null);
  const [syncStatus, setSyncStatus] = useState<CodeRegistrySyncStatus | null>(null);

  /**
   * Get all routes from code with feature codes
   */
  const codeRoutes = useMemo((): CodeRegistryEntry[] => {
    return CODE_ROUTES.map(route => ({
      ...route,
      featureCode: generateFeatureCode(route.routePath)
    }));
  }, []);

  /**
   * Scan code registry and compare with database
   */
  const scanRegistry = useCallback(async (): Promise<CodeRegistry> => {
    setIsScanning(true);
    const startTime = Date.now();

    try {
      const registry: CodeRegistry = {
        entries: codeRoutes,
        totalPages: new Set(codeRoutes.map(r => r.pageName)).size,
        totalRoutes: codeRoutes.length,
        lastScanned: new Date(),
        scanDuration: 0
      };

      registry.scanDuration = Date.now() - startTime;
      setLastScan(registry);
      return registry;
    } finally {
      setIsScanning(false);
    }
  }, [codeRoutes]);

  /**
   * Compare code registry with database to find sync status
   */
  const checkSyncStatus = useCallback(async (): Promise<CodeRegistrySyncStatus> => {
    setIsScanning(true);

    try {
      // Get all features from database
      const { data: dbFeatures } = await supabase
        .from("application_features")
        .select("feature_code, route_path, feature_name");

      const dbFeatureSet = new Set((dbFeatures || []).map(f => f.feature_code));
      const codeFeatureSet = new Set(codeRoutes.map(r => r.featureCode));

      // Find synced entries
      const synced = codeRoutes.filter(route => dbFeatureSet.has(route.featureCode));

      // Find unregistered (in code but not in DB)
      const unregistered = codeRoutes.filter(route => !dbFeatureSet.has(route.featureCode));

      // Find orphaned (in DB but not in code)
      const orphaned = (dbFeatures || [])
        .filter(f => !codeFeatureSet.has(f.feature_code))
        .map(f => ({
          featureCode: f.feature_code,
          routePath: f.route_path || '',
          featureName: f.feature_name
        }));

      const status: CodeRegistrySyncStatus = {
        synced,
        unregistered,
        orphaned
      };

      setSyncStatus(status);
      return status;
    } finally {
      setIsScanning(false);
    }
  }, [codeRoutes]);

  /**
   * Check if a specific route exists in code
   */
  const routeExistsInCode = useCallback((routePath: string): boolean => {
    return codeRoutes.some(r => r.routePath === routePath);
  }, [codeRoutes]);

  /**
   * Check if a specific feature code exists in code
   */
  const featureExistsInCode = useCallback((featureCode: string): boolean => {
    return codeRoutes.some(r => r.featureCode === featureCode);
  }, [codeRoutes]);

  /**
   * Get code entry by feature code
   */
  const getCodeEntry = useCallback((featureCode: string): CodeRegistryEntry | undefined => {
    return codeRoutes.find(r => r.featureCode === featureCode);
  }, [codeRoutes]);

  /**
   * Get code entry by route path
   */
  const getCodeEntryByRoute = useCallback((routePath: string): CodeRegistryEntry | undefined => {
    return codeRoutes.find(r => r.routePath === routePath);
  }, [codeRoutes]);

  return {
    // State
    isScanning,
    lastScan,
    syncStatus,
    codeRoutes,
    
    // Actions
    scanRegistry,
    checkSyncStatus,
    
    // Utilities
    routeExistsInCode,
    featureExistsInCode,
    getCodeEntry,
    getCodeEntryByRoute,
    
    // Stats
    totalCodeRoutes: codeRoutes.length,
    totalModules: new Set(codeRoutes.map(r => r.moduleCode)).size
  };
}
