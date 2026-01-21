// Types for the enhanced Skills Quick Start Wizard

export type WizardStep = 
  | "welcome" 
  | "company"  // NEW: Company selection step
  | "industry" 
  | "occupations"
  | "skills-preview" 
  | "competencies-preview" 
  | "review" 
  | "importing" 
  | "complete";

export interface MasterSkill {
  id: string;
  skill_name: string;
  skill_type: string | null;
  category: string | null;
  description: string | null;
  source: string | null;
  reuse_level: string | null;
  proficiency_level?: string;
  occupationId?: string;
  occupationName?: string;
  alreadyExists?: boolean;
}

export interface MasterCompetency {
  id: string;
  competency_name: string;
  competency_type: string | null;
  category: string | null;
  description: string | null;
  source: string | null;
  behavioral_indicators_count?: number;
  proficiency_level?: string;
  occupationId?: string;
  occupationName?: string;
  alreadyExists?: boolean;
}

export interface MasterOccupation {
  id: string;
  occupation_name: string;
  description: string | null;
  job_family: string | null;
  job_level: string | null;
  is_cross_cutting: boolean | null;
  skills_count: number | null;
  competencies_count: number | null;
}

export interface OperatorAttributes {
  seasonal?: boolean;
  high_risk?: boolean;
  regulated?: boolean;
  multi_site?: boolean;
}

export interface MasterIndustry {
  id: string;
  code: string;
  name: string;
  name_en: string | null;
  description: string | null;
  icon_name: string | null;
  display_order: number;
  is_active: boolean;
  parent_industry_id: string | null;
  operator_attributes: OperatorAttributes | null;
}

export interface WizardState {
  selectedCompanies: string[];  // NEW: Selected company IDs
  isGlobal: boolean;  // NEW: Whether capabilities are global
  selectedIndustries: string[];
  selectedSubIndustries: string[];
  selectedOccupations: string[];
  occupationLabels: Record<string, string>;
  selectedSkills: Set<string>;
  selectedCompetencies: Set<string>;
  proficiencyLevels: Record<string, string>;
  categoryMappings: Record<string, string>;
}

export interface ImportProgress {
  current: number;
  total: number;
  currentItem: string;
  importedSkills: number;
  importedCompetencies: number;
  skipped: number;
  errors: string[];
}

export const WIZARD_STEPS: { step: WizardStep; title: string; description: string }[] = [
  { step: "welcome", title: "Welcome", description: "Get started" },
  { step: "company", title: "Companies", description: "Select companies" },
  { step: "industry", title: "Industry", description: "Select your sector" },
  { step: "occupations", title: "Occupations", description: "Choose roles" },
  { step: "skills-preview", title: "Skills", description: "Preview & select" },
  { step: "competencies-preview", title: "Competencies", description: "Preview & select" },
  { step: "review", title: "Review", description: "Confirm import" },
  { step: "importing", title: "Import", description: "Processing" },
  { step: "complete", title: "Complete", description: "Done" },
];

export const JOB_LEVELS = [
  { value: "entry", label: "Entry Level" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
  { value: "manager", label: "Manager" },
  { value: "director", label: "Director" },
  { value: "executive", label: "Executive" },
];

// Re-export from single source of truth for wizard compatibility
export { DEFAULT_PROFICIENCY_LEVELS } from "@/components/capabilities/ProficiencyLevelPicker";

// Legacy format for dropdown selects in wizard (derived from canonical source)
import { DEFAULT_PROFICIENCY_LEVELS as _LEVELS } from "@/components/capabilities/ProficiencyLevelPicker";

// Map level names to value strings for wizard dropdowns
const levelValueMap: Record<number, string> = {
  1: "novice",
  2: "beginner", 
  3: "competent",
  4: "proficient",
  5: "expert",
};

export const PROFICIENCY_LEVELS = _LEVELS.map(l => ({
  value: levelValueMap[l.level] || String(l.level),
  label: l.name,
  color: l.bgColor,
}));
