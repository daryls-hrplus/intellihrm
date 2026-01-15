import { useState, useCallback, useMemo } from "react";
import { useCodeRegistryScanner } from "./useCodeRegistryScanner";
import { useHandbookTasks } from "./useHandbookTasks";
import { CAPABILITIES_DATA } from "@/components/enablement/product-capabilities/data/capabilitiesData";
import { ADMIN_SECURITY_NAVIGATION_PATHS } from "@/components/enablement/admin-manual/navigationPaths";
import {
  ContentCurrencyReport,
  ContentCurrencyIssue,
  ContentCurrencySummary,
} from "@/types/contentCurrency";

/**
 * Hook for Content Currency Validation
 * 
 * Detects implemented features (in code) that are missing from documentation.
 * Direction: Code → Document validation
 */
export function useContentCurrencyValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [lastReport, setLastReport] = useState<ContentCurrencyReport | null>(null);

  const { codeRoutes } = useCodeRegistryScanner();
  const { tasks: handbookTasks } = useHandbookTasks();

  /**
   * Get all module IDs from Product Capabilities document
   */
  const capabilitiesModuleIds = useMemo(() => {
    const moduleIds = new Set<string>();
    const moduleRoutePatterns = new Map<string, string>();
    
    for (const act of CAPABILITIES_DATA) {
      for (const module of act.modules) {
        moduleIds.add(module.id);
        // Also add common variations
        moduleIds.add(module.id.replace(/-/g, '_'));
        moduleIds.add(module.id.toLowerCase());
        
        // Map module ID to a route pattern
        moduleRoutePatterns.set(module.id, `/${module.id.replace(/-/g, '/')}`);
      }
    }
    
    return { moduleIds, moduleRoutePatterns };
  }, []);

  /**
   * Get all routes/feature codes covered by Implementation Handbook
   */
  const handbookCoverage = useMemo(() => {
    const coveredFeatureCodes = new Set<string>();
    const coveredRoutes = new Set<string>();
    
    for (const task of handbookTasks) {
      if (task.feature_code) {
        coveredFeatureCodes.add(task.feature_code);
      }
      if (task.admin_route) {
        coveredRoutes.add(task.admin_route);
      }
    }
    
    return { coveredFeatureCodes, coveredRoutes };
  }, [handbookTasks]);

  /**
   * Get all section IDs from Admin Manual navigation paths
   */
  const adminManualSections = useMemo(() => {
    const sections = new Set<string>();
    const pathPatterns: string[] = [];
    
    // Extract patterns from navigation paths
    for (const [sectionId, pathParts] of Object.entries(ADMIN_SECURITY_NAVIGATION_PATHS)) {
      sections.add(sectionId);
      // Build pattern from path parts
      const pattern = pathParts.join(' > ').toLowerCase();
      pathPatterns.push(pattern);
    }
    
    return { sections, pathPatterns };
  }, []);

  /**
   * Check if a route is covered in Product Capabilities
   */
  const isInCapabilities = useCallback((moduleCode: string, routePath: string): boolean => {
    const { moduleIds } = capabilitiesModuleIds;
    
    // Direct match
    if (moduleIds.has(moduleCode)) return true;
    
    // Check variations
    const variations = [
      moduleCode,
      moduleCode.replace(/_/g, '-'),
      moduleCode.replace(/-/g, '_'),
      moduleCode.toLowerCase(),
    ];
    
    for (const variation of variations) {
      if (moduleIds.has(variation)) return true;
    }
    
    // Check if route path contains a documented module
    for (const modId of moduleIds) {
      if (routePath.includes(`/${modId}`) || routePath.includes(`/${modId.replace(/-/g, '/')}`)) {
        return true;
      }
    }
    
    return false;
  }, [capabilitiesModuleIds]);

  /**
   * Check if a route is covered in Implementation Handbook
   */
  const isInHandbook = useCallback((featureCode: string, routePath: string): boolean => {
    const { coveredFeatureCodes, coveredRoutes } = handbookCoverage;
    
    if (coveredFeatureCodes.has(featureCode)) return true;
    if (coveredRoutes.has(routePath)) return true;
    
    // Partial match for parent routes
    for (const route of coveredRoutes) {
      if (routePath.startsWith(route) || route.startsWith(routePath)) {
        return true;
      }
    }
    
    return false;
  }, [handbookCoverage]);

  /**
   * Check if a route is covered in Admin Manual
   * Only applies to admin-related routes
   */
  const isInAdminManual = useCallback((moduleCode: string, routePath: string): boolean => {
    // Only check admin-related routes
    const isAdminRoute = routePath.startsWith('/admin') || 
                        moduleCode === 'admin' ||
                        routePath.includes('security') ||
                        routePath.includes('governance');
    
    if (!isAdminRoute) return true; // Non-admin routes don't need admin manual coverage
    
    const { pathPatterns } = adminManualSections;
    const routeLower = routePath.toLowerCase();
    const moduleLower = moduleCode.toLowerCase();
    
    // Check if any path pattern matches this route
    for (const pattern of pathPatterns) {
      if (pattern.includes(moduleLower) || 
          pattern.includes(routeLower.replace(/\//g, ' ').trim())) {
        return true;
      }
    }
    
    // Check specific known mappings
    const adminMappings: Record<string, boolean> = {
      '/admin': true,
      '/admin/users': true,
      '/admin/companies': true,
      '/admin/roles': true,
      '/admin/settings': true,
      '/admin/audit-logs': true,
      '/admin/ai-governance': true,
    };
    
    return adminMappings[routePath] || false;
  }, [adminManualSections]);

  /**
   * Get suggested section for a missing feature
   */
  const getSuggestedSection = useCallback((
    moduleCode: string, 
    documentType: 'product_capabilities' | 'implementation_handbook' | 'admin_manual'
  ): string => {
    if (documentType === 'product_capabilities') {
      // Map module to act
      const moduleToAct: Record<string, string> = {
        'admin': 'Prologue',
        'auth': 'Prologue',
        'workforce': 'Act 1: Foundation',
        'performance': 'Act 2: Performance',
        'compensation': 'Act 3: Rewards',
        'payroll': 'Act 3: Rewards',
        'benefits': 'Act 3: Rewards',
        'training': 'Act 4: Growth',
        'succession': 'Act 4: Growth',
        'recruitment': 'Act 5: Talent',
        'time_attendance': 'Act 6: Operations',
        'leave': 'Act 6: Operations',
        'hse': 'Act 6: Operations',
        'reports': 'Epilogue',
        'ai': 'Epilogue',
        'enablement': 'Epilogue',
      };
      return moduleToAct[moduleCode] || 'New Module Section';
    }
    
    if (documentType === 'implementation_handbook') {
      // Map to phase
      const moduleToPhase: Record<string, string> = {
        'admin': 'Phase 1: Foundation',
        'workforce': 'Phase 2: Core HR',
        'performance': 'Phase 5: Performance',
        'compensation': 'Phase 6: Compensation',
        'payroll': 'Phase 8: Payroll',
        'training': 'Phase 9: Learning',
        'recruitment': 'Phase 10: Recruitment',
        'time_attendance': 'Phase 11: Time',
        'reports': 'Phase 12: Reporting',
      };
      return moduleToPhase[moduleCode] || 'New Phase';
    }
    
    if (documentType === 'admin_manual') {
      const moduleToSection: Record<string, string> = {
        'admin': 'Part 2: Foundation Setup',
        'auth': 'Part 4: Security',
        'ai': 'Part 6: AI Governance',
      };
      return moduleToSection[moduleCode] || 'Part 8: New Section';
    }
    
    return 'Unknown Section';
  }, []);

  /**
   * Run Content Currency Validation
   */
  const runValidation = useCallback(async (): Promise<ContentCurrencyReport> => {
    setIsValidating(true);
    const runId = crypto.randomUUID();
    const issues: ContentCurrencyIssue[] = [];

    try {
      let documentedInCapabilities = 0;
      let documentedInHandbook = 0;
      let documentedInManual = 0;

      // Check each code route
      for (const route of codeRoutes) {
        const featureCode = route.featureCode;
        const routePath = route.routePath;
        const moduleCode = route.moduleCode;
        const pageName = route.pageName;

        // Check Product Capabilities coverage
        if (isInCapabilities(moduleCode, routePath)) {
          documentedInCapabilities++;
        } else {
          issues.push({
            id: `cap_${featureCode}`,
            type: 'undocumented_in_capabilities',
            severity: 'warning',
            featureCode,
            featureName: pageName,
            routePath,
            moduleCode,
            documentType: 'product_capabilities',
            recommendation: `Add "${pageName}" to Product Capabilities document`,
            suggestedSection: getSuggestedSection(moduleCode, 'product_capabilities'),
          });
        }

        // Check Implementation Handbook coverage
        if (isInHandbook(featureCode, routePath)) {
          documentedInHandbook++;
        } else {
          issues.push({
            id: `hb_${featureCode}`,
            type: 'missing_from_handbook',
            severity: 'info',
            featureCode,
            featureName: pageName,
            routePath,
            moduleCode,
            documentType: 'implementation_handbook',
            recommendation: `Add implementation task for "${pageName}"`,
            suggestedSection: getSuggestedSection(moduleCode, 'implementation_handbook'),
          });
        }

        // Check Admin Manual coverage (only for admin routes)
        const isAdminRoute = routePath.startsWith('/admin') || moduleCode === 'admin';
        if (isAdminRoute) {
          if (isInAdminManual(moduleCode, routePath)) {
            documentedInManual++;
          } else {
            issues.push({
              id: `man_${featureCode}`,
              type: 'missing_from_manual',
              severity: 'info',
              featureCode,
              featureName: pageName,
              routePath,
              moduleCode,
              documentType: 'admin_manual',
              recommendation: `Document "${pageName}" in Admin & Security Manual`,
              suggestedSection: getSuggestedSection(moduleCode, 'admin_manual'),
            });
          }
        } else {
          // Non-admin routes count as "covered" for admin manual
          documentedInManual++;
        }
      }

      // Calculate currency score
      const totalRoutes = codeRoutes.length;
      const capScore = totalRoutes > 0 ? (documentedInCapabilities / totalRoutes) * 100 : 0;
      const hbScore = totalRoutes > 0 ? (documentedInHandbook / totalRoutes) * 100 : 0;
      const manScore = totalRoutes > 0 ? (documentedInManual / totalRoutes) * 100 : 0;
      
      // Weighted average: Capabilities 40%, Handbook 40%, Manual 20%
      const currencyScore = Math.round((capScore * 0.4) + (hbScore * 0.4) + (manScore * 0.2));

      const summary: ContentCurrencySummary = {
        totalCodeRoutes: totalRoutes,
        documentedInCapabilities,
        documentedInHandbook,
        documentedInManual,
        undocumentedCount: issues.length,
        currencyScore,
      };

      // Group issues by document type
      const byDocument = {
        product_capabilities: issues.filter(i => i.documentType === 'product_capabilities'),
        implementation_handbook: issues.filter(i => i.documentType === 'implementation_handbook'),
        admin_manual: issues.filter(i => i.documentType === 'admin_manual'),
      };

      const report: ContentCurrencyReport = {
        timestamp: new Date(),
        runId,
        summary,
        issues: issues.sort((a, b) => {
          const severityOrder = { error: 0, warning: 1, info: 2 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        }),
        byDocument,
      };

      setLastReport(report);
      return report;
    } finally {
      setIsValidating(false);
    }
  }, [
    codeRoutes, 
    isInCapabilities, 
    isInHandbook, 
    isInAdminManual,
    getSuggestedSection
  ]);

  /**
   * Get quick summary without full validation
   */
  const getQuickSummary = useCallback(() => {
    const totalRoutes = codeRoutes.length;
    const adminRoutes = codeRoutes.filter(r => 
      r.routePath.startsWith('/admin') || r.moduleCode === 'admin'
    ).length;
    
    return {
      totalCodeRoutes: totalRoutes,
      adminRoutes,
      capabilitiesModules: capabilitiesModuleIds.moduleIds.size,
      handbookTasks: handbookTasks.length,
      adminManualSections: Object.keys(ADMIN_SECURITY_NAVIGATION_PATHS).length,
    };
  }, [codeRoutes, capabilitiesModuleIds, handbookTasks]);

  return {
    runValidation,
    getQuickSummary,
    isValidating,
    lastReport,
    
    // Utilities
    isInCapabilities,
    isInHandbook,
    isInAdminManual,
  };
}
