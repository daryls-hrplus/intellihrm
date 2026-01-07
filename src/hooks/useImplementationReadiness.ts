import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ReadinessCheck {
  id: string;
  phase: string;
  table: string;
  check: 'exists' | 'count_min';
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  remediation: string;
  passed: boolean;
  actualValue: number;
}

export interface ReadinessResult {
  checks: ReadinessCheck[];
  score: number;
  criticalPassed: number;
  criticalTotal: number;
  warningPassed: number;
  warningTotal: number;
  isReady: boolean;
}

// Define validation rules
const READINESS_CHECKS: Omit<ReadinessCheck, 'passed' | 'actualValue'>[] = [
  // Foundation
  { id: 'companies_exist', phase: 'foundation', table: 'companies', check: 'count_min', threshold: 1, severity: 'critical', message: 'At least 1 company must be configured', remediation: '/admin/companies' },
  { id: 'departments_exist', phase: 'foundation', table: 'departments', check: 'count_min', threshold: 1, severity: 'critical', message: 'At least 1 department must be configured', remediation: '/admin/departments' },
  { id: 'roles_exist', phase: 'foundation', table: 'roles', check: 'count_min', threshold: 2, severity: 'warning', message: 'At least 2 roles should be configured (admin + user)', remediation: '/admin/roles' },
  
  // Workforce
  { id: 'jobs_exist', phase: 'workforce', table: 'jobs', check: 'count_min', threshold: 1, severity: 'critical', message: 'At least 1 job must be configured', remediation: '/admin/jobs' },
  { id: 'positions_exist', phase: 'workforce', table: 'positions', check: 'count_min', threshold: 1, severity: 'critical', message: 'At least 1 position must be configured', remediation: '/admin/positions' },
  { id: 'employees_exist', phase: 'workforce', table: 'profiles', check: 'count_min', threshold: 1, severity: 'critical', message: 'At least 1 employee must be imported', remediation: '/admin/employees' },
  
  // Compensation
  { id: 'pay_elements_exist', phase: 'compensation', table: 'pay_elements', check: 'count_min', threshold: 1, severity: 'warning', message: 'Pay elements should be configured for payroll', remediation: '/admin/pay-elements' },
  { id: 'pay_groups_exist', phase: 'compensation', table: 'pay_groups', check: 'count_min', threshold: 1, severity: 'warning', message: 'Pay groups should be configured', remediation: '/admin/pay-groups' },
  
  // Time & Leave
  { id: 'leave_types_exist', phase: 'time-leave', table: 'leave_types', check: 'count_min', threshold: 1, severity: 'warning', message: 'Leave types should be configured', remediation: '/admin/leave-types' },
  
  // HR Hub
  { id: 'workflow_templates_exist', phase: 'hr-hub', table: 'workflow_templates', check: 'count_min', threshold: 1, severity: 'info', message: 'Workflow templates enable approval routing', remediation: '/admin/workflow-templates' },
];

export function useImplementationReadiness() {
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();

  const companyId = profile?.company_id;

  const runChecks = useCallback(async () => {
    if (!user) {
      setResult(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const checkedRules: ReadinessCheck[] = [];

      // Run each check
      for (const rule of READINESS_CHECKS) {
        let count = 0;
        
        try {
          // Build query based on table - use type assertion to avoid deep instantiation
          const { count: resultCount } = await supabase
            .from(rule.table as any)
            .select('id', { count: 'exact', head: true })
            .then(res => res);
          count = resultCount || 0;
        } catch {
          // Table might not exist or access denied - treat as 0
          count = 0;
        }

        checkedRules.push({
          ...rule,
          passed: count >= rule.threshold,
          actualValue: count
        });
      }

      // Calculate scores
      const criticalChecks = checkedRules.filter(c => c.severity === 'critical');
      const warningChecks = checkedRules.filter(c => c.severity === 'warning');
      
      const criticalPassed = criticalChecks.filter(c => c.passed).length;
      const warningPassed = warningChecks.filter(c => c.passed).length;
      
      const totalChecks = checkedRules.length;
      const passedChecks = checkedRules.filter(c => c.passed).length;
      
      // Score: critical checks worth 2x, warnings 1x
      const maxScore = (criticalChecks.length * 2) + warningChecks.length + (checkedRules.length - criticalChecks.length - warningChecks.length);
      const actualScore = (criticalPassed * 2) + warningPassed + checkedRules.filter(c => c.severity === 'info' && c.passed).length;
      
      const score = maxScore > 0 ? Math.round((actualScore / maxScore) * 100) : 0;
      const isReady = criticalPassed === criticalChecks.length;

      setResult({
        checks: checkedRules,
        score,
        criticalPassed,
        criticalTotal: criticalChecks.length,
        warningPassed,
        warningTotal: warningChecks.length,
        isReady
      });
    } catch (err) {
      console.error('Error running readiness checks:', err);
      setError(err instanceof Error ? err.message : 'Failed to run checks');
    } finally {
      setIsLoading(false);
    }
  }, [user, companyId]);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  return {
    result,
    isLoading,
    error,
    refetch: runChecks
  };
}
