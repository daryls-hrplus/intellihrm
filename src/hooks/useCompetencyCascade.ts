import { supabase } from "@/integrations/supabase/client";

export interface CascadedCompetency {
  competency_id: string;
  name: string;
  code?: string;
  category?: string;
  weighting: number;
  competency_level_id?: string | null;
  required_level?: number;
  proficiency_indicators?: Record<string, string[]>;
  source: 'job' | 'employee';
  job_id?: string;
}

export interface CompetencyCascadeResult {
  competencies: CascadedCompetency[];
  fromJob: CascadedCompetency[];
  fromEmployee: CascadedCompetency[];
  hasJobCompetencies: boolean;
}

/**
 * Fetches competencies using cascade logic:
 * 1. PRIMARY: Fetch from job_competencies based on employee's position -> job
 * 2. SECONDARY: Fetch from employee_competencies as overrides/additions
 * 3. MERGE: Employee entries override job entries for same competency
 */
export async function fetchCompetencyCascade(
  employeeId: string
): Promise<CompetencyCascadeResult> {
  const result: CompetencyCascadeResult = {
    competencies: [],
    fromJob: [],
    fromEmployee: [],
    hasJobCompetencies: false,
  };

  try {
    // Step 1: Get employee's active positions and their jobs
    const { data: positions } = await supabase
      .from("employee_positions")
      .select("position_id, positions!inner(job_id, title)")
      .eq("employee_id", employeeId)
      .eq("is_active", true);

    const jobIds = (positions || [])
      .map((p: any) => p.positions?.job_id)
      .filter(Boolean);

    // Step 2: PRIMARY SOURCE - Fetch competencies from job_capability_requirements
    if (jobIds.length > 0) {
      const { data: jobComps } = await supabase
        .from("job_capability_requirements")
        .select(`
          id,
          capability_id,
          required_proficiency_level,
          weighting,
          is_required,
          job_id,
          skills_competencies!job_capability_requirements_capability_id_fkey(id, name, code, category, type, proficiency_indicators)
        `)
        .in("job_id", jobIds)
        .is("end_date", null);

      if (jobComps && jobComps.length > 0) {
        // Filter only COMPETENCY type
        for (const jc of jobComps) {
          const sc = (jc as any).skills_competencies;
          if (sc && sc.type === 'COMPETENCY') {
            result.hasJobCompetencies = true;
            result.fromJob.push({
              competency_id: jc.capability_id,
              name: sc.name,
              code: sc.code,
              category: sc.category,
              weighting: jc.weighting || 0,
              required_level: jc.required_proficiency_level,
              proficiency_indicators: sc.proficiency_indicators,
              source: 'job',
              job_id: jc.job_id,
            });
          }
        }
      }
    }

    // Step 3: SECONDARY SOURCE - Fetch from employee_competencies
    const { data: empComps } = await supabase
      .from("employee_competencies")
      .select(`
        competency_id, 
        weighting, 
        competency_level_id,
        skills_competencies(id, name, code, category, proficiency_indicators)
      `)
      .eq("employee_id", employeeId)
      .is("end_date", null);

    if (empComps && empComps.length > 0) {
      for (const ec of empComps) {
        const sc = (ec as any).skills_competencies;
        if (sc) {
          result.fromEmployee.push({
            competency_id: sc.id || ec.competency_id,
            name: sc.name,
            code: sc.code,
            category: sc.category,
            weighting: ec.weighting || 0,
            competency_level_id: ec.competency_level_id,
            proficiency_indicators: sc.proficiency_indicators,
            source: 'employee',
          });
        }
      }
    }

    // Step 4: MERGE - Employee overrides job for same competency
    const mergedMap = new Map<string, CascadedCompetency>();
    
    // Add all job competencies first
    for (const jc of result.fromJob) {
      mergedMap.set(jc.competency_id, jc);
    }
    
    // Override with employee competencies
    for (const ec of result.fromEmployee) {
      mergedMap.set(ec.competency_id, ec);
    }
    
    result.competencies = Array.from(mergedMap.values());
    
    return result;
  } catch (error) {
    console.error("Error fetching competency cascade:", error);
    return result;
  }
}

/**
 * Syncs job competencies to employee_competencies table.
 * Uses job_capability_requirements as the source of truth.
 */
export async function syncJobCompetenciesToEmployee(
  employeeId: string,
  jobId: string
): Promise<{ synced: number; errors: string[] }> {
  const result = { synced: 0, errors: [] as string[] };
  
  try {
    // Get job capability requirements (competencies only)
    const { data: jobComps } = await supabase
      .from("job_capability_requirements")
      .select(`
        capability_id,
        weighting,
        required_proficiency_level,
        skills_competencies!job_capability_requirements_capability_id_fkey(type)
      `)
      .eq("job_id", jobId)
      .is("end_date", null);
    
    if (!jobComps || jobComps.length === 0) {
      return result;
    }
    
    // Filter to only COMPETENCY type
    const competencyRequirements = jobComps.filter(
      (jc: any) => jc.skills_competencies?.type === 'COMPETENCY'
    );
    
    if (competencyRequirements.length === 0) {
      return result;
    }
    
    // Get existing employee competencies
    const { data: existingEmpComps } = await supabase
      .from("employee_competencies")
      .select("competency_id")
      .eq("employee_id", employeeId)
      .is("end_date", null);
    
    const existingIds = new Set((existingEmpComps || []).map((ec: any) => ec.competency_id));
    
    // Insert only non-existing ones
    const toInsert = competencyRequirements
      .filter((jc: any) => !existingIds.has(jc.capability_id))
      .map((jc: any) => ({
        employee_id: employeeId,
        competency_id: jc.capability_id,
        weighting: jc.weighting || 0,
        start_date: new Date().toISOString().split('T')[0],
      }));
    
    if (toInsert.length > 0) {
      const { error } = await supabase
        .from("employee_competencies")
        .insert(toInsert);
      
      if (error) {
        result.errors.push(error.message);
      } else {
        result.synced = toInsert.length;
      }
    }
    
    return result;
  } catch (error: any) {
    result.errors.push(error.message || "Unknown error");
    return result;
  }
}
