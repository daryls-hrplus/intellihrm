import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AppraisalReadinessCheck {
  id: string;
  category: 'core-framework' | 'appraisals-setup' | 'workforce-data';
  name: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  passed: boolean;
  actualValue: number;
  threshold: number;
  remediation: string;
  remediationLabel: string;
}

export interface ReportingRelationshipsSummary {
  total: number;
  configured: number;
  missing: number;
  readinessPercent: number;
  missingPositions: {
    id: string;
    code: string;
    title: string;
    departmentName: string;
  }[];
}

export interface AppraisalReadinessResult {
  checks: AppraisalReadinessCheck[];
  overallScore: number;
  isReady: boolean;
  categorySummary: {
    category: string;
    label: string;
    passed: number;
    total: number;
    percent: number;
  }[];
  reportingRelationships: ReportingRelationshipsSummary;
}

export function useAppraisalReadiness(companyId: string | null) {
  const [result, setResult] = useState<AppraisalReadinessResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runChecks = useCallback(async () => {
    if (!companyId) {
      setResult(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Run all queries in parallel - use type assertions to avoid deep instantiation errors
      const [
        componentScalesResult,
        overallScalesResult,
        competenciesResult,
        formTemplatesResult,
        jobAssessmentResult,
        positionsResult,
        employeePositionsResult
      ] = await Promise.all([
        // Component Rating Scales (company-specific + global)
        supabase
          .from('performance_rating_scales')
          .select('id', { count: 'exact', head: true })
          .or(`company_id.eq.${companyId},company_id.is.null`)
          .eq('is_active', true)
          .then(res => res),
        
        // Overall Rating Scales (company-specific + global)
        supabase
          .from('overall_rating_scales')
          .select('id', { count: 'exact', head: true })
          .or(`company_id.eq.${companyId},company_id.is.null`)
          .eq('is_active', true)
          .then(res => res),
        
        // Competencies
        supabase
          .from('competencies')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('is_active', true)
          .then(res => res),
        
        // Form Templates
        supabase
          .from('appraisal_form_templates')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('is_active', true)
          .then(res => res),
        
        // Job Assessment Config - use 'as any' to avoid type issues
        supabase
          .from('job_competency_mappings' as any)
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .then(res => res),
        
        // Positions - for reporting relationships (use any to avoid deep type issues)
        (supabase
          .from('positions' as any)
          .select('id, code, title, reports_to_position_id, department_id')
          .eq('company_id', companyId)
          .eq('is_active', true) as any),
        
        // Employee Position Assignments
        (supabase
          .from('employee_positions' as any)
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('is_active', true) as any)
          .then(res => res)
      ]);

      // Get department names separately to avoid join issues
      const rawDeptIds = (positionsResult.data || []).map((p: any) => String(p.department_id)).filter(Boolean);
      const departmentIds = Array.from(new Set<string>(rawDeptIds));
      let departmentMap: Record<string, string> = {};
      
      if (departmentIds.length > 0) {
        const { data: departments } = await supabase
          .from('departments')
          .select('id, name')
          .in('id', departmentIds);
        
        departmentMap = (departments || []).reduce((acc, d) => {
          acc[d.id] = d.name;
          return acc;
        }, {} as Record<string, string>);
      }

      // Process positions for reporting relationships
      const positions = (positionsResult.data || []) as any[];
      const totalPositions = positions.length;
      const configuredPositions = positions.filter(p => p.reports_to_position_id !== null).length;
      const missingPositions = positions.filter(p => p.reports_to_position_id === null);
      const reportingPercent = totalPositions > 0 ? Math.round((configuredPositions / totalPositions) * 100) : 100;

      // Build checks array
      const checks: AppraisalReadinessCheck[] = [
        // Core Framework
        {
          id: 'component-rating-scales',
          category: 'core-framework',
          name: 'Component Rating Scales',
          description: 'At least one active rating scale for scoring performance components',
          severity: 'warning',
          passed: (componentScalesResult.count || 0) >= 1,
          actualValue: componentScalesResult.count || 0,
          threshold: 1,
          remediation: '/performance/setup?tab=foundation&sub=rating-scales',
          remediationLabel: 'Configure Rating Scales'
        },
        {
          id: 'overall-rating-scales',
          category: 'core-framework',
          name: 'Overall Rating Scales',
          description: 'At least one overall rating scale for final appraisal ratings',
          severity: 'warning',
          passed: (overallScalesResult.count || 0) >= 1,
          actualValue: overallScalesResult.count || 0,
          threshold: 1,
          remediation: '/performance/setup?tab=foundation&sub=overall-scales',
          remediationLabel: 'Configure Overall Scales'
        },
        {
          id: 'competencies',
          category: 'core-framework',
          name: 'Competencies',
          description: 'At least one competency defined for performance evaluation',
          severity: 'warning',
          passed: (competenciesResult.count || 0) >= 1,
          actualValue: competenciesResult.count || 0,
          threshold: 1,
          remediation: '/performance/setup?tab=foundation&sub=competencies',
          remediationLabel: 'Configure Competencies'
        },
        
        // Appraisals Setup
        {
          id: 'form-templates',
          category: 'appraisals-setup',
          name: 'Appraisal Form Templates',
          description: 'At least one active form template to structure appraisals',
          severity: 'critical',
          passed: (formTemplatesResult.count || 0) >= 1,
          actualValue: formTemplatesResult.count || 0,
          threshold: 1,
          remediation: '/performance/setup?tab=appraisals&sub=form-templates',
          remediationLabel: 'Create Form Template'
        },
        {
          id: 'job-assessment-config',
          category: 'appraisals-setup',
          name: 'Job Assessment Configuration',
          description: 'Job-competency mappings for role-specific assessments',
          severity: 'info',
          passed: (jobAssessmentResult.count || 0) >= 1,
          actualValue: jobAssessmentResult.count || 0,
          threshold: 1,
          remediation: '/performance/setup?tab=appraisals&sub=job-assessment-config',
          remediationLabel: 'Configure Job Assessments'
        },
        
        // Workforce Data
        {
          id: 'reporting-relationships',
          category: 'workforce-data',
          name: 'Reporting Relationships',
          description: 'Positions should have supervisors assigned for appraisal routing',
          severity: 'critical',
          passed: reportingPercent >= 90,
          actualValue: reportingPercent,
          threshold: 90,
          remediation: '/admin/positions',
          remediationLabel: 'View Positions'
        },
        {
          id: 'employee-assignments',
          category: 'workforce-data',
          name: 'Employee Position Assignments',
          description: 'Employees must be assigned to positions for appraisals',
          severity: 'warning',
          passed: (employeePositionsResult.count || 0) >= 1,
          actualValue: employeePositionsResult.count || 0,
          threshold: 1,
          remediation: '/admin/positions',
          remediationLabel: 'Manage Assignments'
        }
      ];

      // Calculate category summaries
      const categories = ['core-framework', 'appraisals-setup', 'workforce-data'];
      const categoryLabels: Record<string, string> = {
        'core-framework': 'Core Framework',
        'appraisals-setup': 'Appraisals Setup',
        'workforce-data': 'Workforce Data'
      };

      const categorySummary = categories.map(cat => {
        const catChecks = checks.filter(c => c.category === cat);
        const passed = catChecks.filter(c => c.passed).length;
        return {
          category: cat,
          label: categoryLabels[cat],
          passed,
          total: catChecks.length,
          percent: catChecks.length > 0 ? Math.round((passed / catChecks.length) * 100) : 100
        };
      });

      // Calculate overall score (critical checks weighted 2x)
      const criticalChecks = checks.filter(c => c.severity === 'critical');
      const warningChecks = checks.filter(c => c.severity === 'warning');
      const infoChecks = checks.filter(c => c.severity === 'info');
      
      const maxScore = (criticalChecks.length * 2) + warningChecks.length + infoChecks.length;
      const actualScore = 
        (criticalChecks.filter(c => c.passed).length * 2) +
        warningChecks.filter(c => c.passed).length +
        infoChecks.filter(c => c.passed).length;
      
      const overallScore = maxScore > 0 ? Math.round((actualScore / maxScore) * 100) : 100;
      const isReady = criticalChecks.every(c => c.passed);

      setResult({
        checks,
        overallScore,
        isReady,
        categorySummary,
        reportingRelationships: {
          total: totalPositions,
          configured: configuredPositions,
          missing: missingPositions.length,
          readinessPercent: reportingPercent,
          missingPositions: missingPositions.map((p: any) => ({
            id: p.id,
            code: p.code || '',
            title: p.title,
            departmentName: departmentMap[p.department_id] || 'Unknown'
          }))
        }
      });
    } catch (err) {
      console.error('Error running appraisal readiness checks:', err);
      setError(err instanceof Error ? err.message : 'Failed to run checks');
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

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
