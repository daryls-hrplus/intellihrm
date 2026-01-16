import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AssessmentMode } from '@/types/appraisalKRASnapshot';

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: 'job' | 'responsibility' | 'kra' | 'competency' | 'goal';
  message: string;
  details?: string;
  actionable?: boolean;
}

export interface ResponsibilityValidation {
  responsibilityId: string;
  responsibilityName: string;
  weight: number;
  assessmentMode: AssessmentMode;
  kraCount: number;
  kraWeightTotal: number;
  isValid: boolean;
  issues: ValidationIssue[];
}

export interface AppraisalReadinessResult {
  isReady: boolean;
  hasErrors: boolean;
  hasWarnings: boolean;
  jobAssigned: boolean;
  responsibilityWeightTotal: number;
  responsibilityValidations: ResponsibilityValidation[];
  issues: ValidationIssue[];
}

export function useAppraisalReadinessValidation() {
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Validate that an employee is ready for appraisal
   * Checks: job assignment, responsibility weights, KRA weights, assessment mode configuration
   */
  const validateEmployeeReadiness = useCallback(async (
    employeeId: string,
    cycleId?: string
  ): Promise<AppraisalReadinessResult> => {
    setIsValidating(true);

    const result: AppraisalReadinessResult = {
      isReady: true,
      hasErrors: false,
      hasWarnings: false,
      jobAssigned: false,
      responsibilityWeightTotal: 0,
      responsibilityValidations: [],
      issues: [],
    };

    try {
      // 1. Check job assignment
      const { data: positions } = await supabase
        .from('employee_positions')
        .select(`
          id,
          position_id,
          positions (
            id,
            title,
            job_id,
            jobs (id, name)
          )
        `)
        .eq('employee_id', employeeId)
        .eq('is_active', true)
        .is('end_date', null)
        .limit(1);

      if (!positions || positions.length === 0) {
        result.issues.push({
          type: 'error',
          category: 'job',
          message: 'Employee has no active position assigned',
          details: 'An active position with a linked job is required for appraisal',
          actionable: true,
        });
        result.hasErrors = true;
        result.isReady = false;
        setIsValidating(false);
        return result;
      }

      const position = positions[0] as any;
      const jobId = position.positions?.job_id;

      if (!jobId) {
        result.issues.push({
          type: 'error',
          category: 'job',
          message: 'Position has no job linked',
          details: `Position "${position.positions?.title}" needs a job assignment`,
          actionable: true,
        });
        result.hasErrors = true;
        result.isReady = false;
        setIsValidating(false);
        return result;
      }

      result.jobAssigned = true;

      // 2. Fetch job responsibilities with assessment modes and KRAs
      const { data: jobResps } = await supabase
        .from('job_responsibilities')
        .select(`
          id,
          responsibility_id,
          weighting,
          assessment_mode,
          kra_weights_validated,
          responsibilities (id, name),
          job_responsibility_kras (id, weight)
        `)
        .eq('job_id', jobId)
        .is('end_date', null);

      const responsibilities = jobResps || [];

      // 3. Calculate total responsibility weight
      result.responsibilityWeightTotal = responsibilities.reduce(
        (sum, r) => sum + (r.weighting || 0), 
        0
      );

      if (result.responsibilityWeightTotal === 0) {
        result.issues.push({
          type: 'error',
          category: 'responsibility',
          message: 'No responsibilities assigned to job',
          details: 'At least one responsibility must be assigned with a weight',
          actionable: true,
        });
        result.hasErrors = true;
        result.isReady = false;
      } else if (result.responsibilityWeightTotal !== 100) {
        result.issues.push({
          type: 'warning',
          category: 'responsibility',
          message: `Responsibility weights total ${result.responsibilityWeightTotal}% (should be 100%)`,
          details: 'Consider adjusting weights for accurate score calculation',
          actionable: true,
        });
        result.hasWarnings = true;
      }

      // 4. Validate each responsibility's KRA configuration
      for (const resp of responsibilities) {
        const respData = resp as any;
        const assessmentMode: AssessmentMode = respData.assessment_mode || 'auto';
        const kras = respData.job_responsibility_kras || [];
        const kraWeightTotal = kras.reduce((sum: number, k: any) => sum + (k.weight || 0), 0);

        const validation: ResponsibilityValidation = {
          responsibilityId: resp.responsibility_id,
          responsibilityName: respData.responsibilities?.name || 'Unknown',
          weight: resp.weighting || 0,
          assessmentMode,
          kraCount: kras.length,
          kraWeightTotal,
          isValid: true,
          issues: [],
        };

        // Determine effective mode
        const effectiveMode = assessmentMode === 'auto' 
          ? (kras.length > 0 ? 'kra_based' : 'responsibility_only')
          : assessmentMode;

        // Check KRA weight validity for kra_based and hybrid modes
        if (effectiveMode === 'kra_based' || effectiveMode === 'hybrid') {
          if (kras.length === 0) {
            validation.issues.push({
              type: 'warning',
              category: 'kra',
              message: `No KRAs defined for "${validation.responsibilityName}"`,
              details: 'Assessment mode requires KRAs but none are configured',
              actionable: true,
            });
            validation.isValid = false;
            result.hasWarnings = true;
          } else if (kraWeightTotal !== 100) {
            validation.issues.push({
              type: 'warning',
              category: 'kra',
              message: `KRA weights for "${validation.responsibilityName}" total ${kraWeightTotal}%`,
              details: 'KRA weights should total 100% for accurate scoring',
              actionable: true,
            });
            validation.isValid = false;
            result.hasWarnings = true;
          }
        }

        result.responsibilityValidations.push(validation);
      }

      // Final readiness check
      result.isReady = !result.hasErrors;
    } catch (err) {
      console.error('Error validating appraisal readiness:', err);
      result.issues.push({
        type: 'error',
        category: 'job',
        message: 'Failed to validate appraisal readiness',
        details: (err as any).message,
      });
      result.hasErrors = true;
      result.isReady = false;
    } finally {
      setIsValidating(false);
    }

    return result;
  }, []);

  /**
   * Validate a specific job's configuration
   */
  const validateJobConfiguration = useCallback(async (
    jobId: string
  ): Promise<{ isValid: boolean; issues: ValidationIssue[] }> => {
    const issues: ValidationIssue[] = [];

    try {
      // Fetch job responsibilities with KRAs
      const { data: jobResps } = await supabase
        .from('job_responsibilities')
        .select(`
          id,
          responsibility_id,
          weighting,
          assessment_mode,
          responsibilities (id, name),
          job_responsibility_kras (id, weight)
        `)
        .eq('job_id', jobId)
        .is('end_date', null);

      const responsibilities = jobResps || [];

      // Check total weight
      const totalWeight = responsibilities.reduce((sum, r) => sum + (r.weighting || 0), 0);
      if (totalWeight !== 100) {
        issues.push({
          type: totalWeight === 0 ? 'error' : 'warning',
          category: 'responsibility',
          message: `Responsibility weights total ${totalWeight}%`,
          details: 'Should total 100%',
          actionable: true,
        });
      }

      // Check each responsibility
      for (const resp of responsibilities) {
        const respData = resp as any;
        const mode: AssessmentMode = respData.assessment_mode || 'auto';
        const kras = respData.job_responsibility_kras || [];
        const kraWeight = kras.reduce((sum: number, k: any) => sum + (k.weight || 0), 0);

        const needsKRAs = mode === 'kra_based' || mode === 'hybrid' || 
          (mode === 'auto' && kras.length > 0);

        if (needsKRAs && kras.length > 0 && kraWeight !== 100) {
          issues.push({
            type: 'warning',
            category: 'kra',
            message: `${respData.responsibilities?.name}: KRA weights total ${kraWeight}%`,
            actionable: true,
          });
        }
      }

      return {
        isValid: !issues.some(i => i.type === 'error'),
        issues,
      };
    } catch (err) {
      return {
        isValid: false,
        issues: [{
          type: 'error',
          category: 'job',
          message: 'Failed to validate job configuration',
        }],
      };
    }
  }, []);

  return {
    isValidating,
    validateEmployeeReadiness,
    validateJobConfiguration,
  };
}
