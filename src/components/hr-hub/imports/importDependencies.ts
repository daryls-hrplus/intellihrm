// Centralized configuration of import dependencies
export interface ImportDependency {
  key: string;
  label: string;
  table: string;
  description: string;
}

export interface ImportConfig {
  prerequisites: ImportDependency[];
  optionalPrerequisites?: ImportDependency[];
  description: string;
}

export const PREREQUISITE_ENTITIES = {
  companies: {
    key: "companies",
    label: "Companies",
    table: "companies",
    description: "Company records",
  },
  departments: {
    key: "departments",
    label: "Departments",
    table: "departments",
    description: "Department records",
  },
  divisions: {
    key: "divisions",
    label: "Divisions",
    table: "company_divisions",
    description: "Division records",
  },
  jobs: {
    key: "jobs",
    label: "Jobs",
    table: "jobs",
    description: "Job definitions",
  },
  job_families: {
    key: "job_families",
    label: "Job Families",
    table: "job_families",
    description: "Job family categories",
  },
  positions: {
    key: "positions",
    label: "Positions",
    table: "positions",
    description: "Position records",
  },
  salary_grades: {
    key: "salary_grades",
    label: "Salary Grades",
    table: "salary_grades",
    description: "Salary grade definitions",
  },
  pay_spines: {
    key: "pay_spines",
    label: "Pay Spines",
    table: "pay_spines",
    description: "Pay spine structures",
  },
  spinal_points: {
    key: "spinal_points",
    label: "Spinal Points",
    table: "spinal_points",
    description: "Points on pay spines",
  },
} as const;

export const IMPORT_DEPENDENCIES: Record<string, ImportConfig> = {
  companies: {
    prerequisites: [],
    description: "Import companies first - they are the foundation of your organizational structure",
  },
  divisions: {
    prerequisites: [PREREQUISITE_ENTITIES.companies],
    description: "Divisions belong to companies",
  },
  departments: {
    prerequisites: [PREREQUISITE_ENTITIES.companies],
    optionalPrerequisites: [PREREQUISITE_ENTITIES.divisions],
    description: "Departments belong to companies and optionally divisions",
  },
  sections: {
    prerequisites: [PREREQUISITE_ENTITIES.companies, PREREQUISITE_ENTITIES.departments],
    description: "Sections are sub-units of departments",
  },
  job_families: {
    prerequisites: [PREREQUISITE_ENTITIES.companies],
    description: "Job families organize jobs by function",
  },
  jobs: {
    prerequisites: [PREREQUISITE_ENTITIES.companies, PREREQUISITE_ENTITIES.job_families],
    description: "Jobs belong to job families within companies",
  },
  salary_grades: {
    prerequisites: [PREREQUISITE_ENTITIES.companies],
    description: "Salary grades define compensation ranges for positions",
  },
  pay_spines: {
    prerequisites: [PREREQUISITE_ENTITIES.companies],
    description: "Pay spines define incremental pay scales",
  },
  spinal_points: {
    prerequisites: [PREREQUISITE_ENTITIES.companies, PREREQUISITE_ENTITIES.pay_spines],
    description: "Spinal points are salary levels on pay spines",
  },
  positions: {
    prerequisites: [
      PREREQUISITE_ENTITIES.companies,
      PREREQUISITE_ENTITIES.departments,
      PREREQUISITE_ENTITIES.jobs,
    ],
    optionalPrerequisites: [PREREQUISITE_ENTITIES.salary_grades, PREREQUISITE_ENTITIES.pay_spines],
    description: "Positions link jobs to departments and define the org hierarchy",
  },
  employees: {
    prerequisites: [],
    description: "Basic employee information import - no prerequisites required",
  },
  new_hires: {
    prerequisites: [
      PREREQUISITE_ENTITIES.companies,
      PREREQUISITE_ENTITIES.departments,
      PREREQUISITE_ENTITIES.positions,
    ],
    description: "New hires need existing positions in departments",
  },
};

// Helper to get dependencies for a given import type
export function getImportDependencies(importType: string): ImportConfig | null {
  // Handle company_structure_ prefixed types
  if (importType.startsWith("company_structure_")) {
    const subType = importType.replace("company_structure_", "");
    return IMPORT_DEPENDENCIES[subType] || null;
  }
  return IMPORT_DEPENDENCIES[importType] || null;
}
