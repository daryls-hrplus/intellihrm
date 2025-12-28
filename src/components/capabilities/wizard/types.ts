// Types for the enhanced Skills Quick Start Wizard

export type WizardStep = 
  | "welcome" 
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

export interface MasterIndustry {
  id: string;
  code: string;
  name: string;
  name_en: string | null;
  description: string | null;
  icon_name: string | null;
  display_order: number;
  is_active: boolean;
}

export interface WizardState {
  selectedIndustries: string[];
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
  { step: "industry", title: "Industry", description: "Select your sector" },
  { step: "occupations", title: "Occupations", description: "Choose roles" },
  { step: "skills-preview", title: "Skills", description: "Preview & select" },
  { step: "competencies-preview", title: "Competencies", description: "Preview & select" },
  { step: "review", title: "Review", description: "Confirm import" },
  { step: "importing", title: "Import", description: "Processing" },
  { step: "complete", title: "Complete", description: "Done" },
];

export const JOB_LEVELS = [
  { value: "Entry", label: "Entry Level" },
  { value: "Junior", label: "Junior" },
  { value: "Mid", label: "Mid-Level" },
  { value: "Senior", label: "Senior" },
  { value: "Lead", label: "Lead" },
  { value: "Manager", label: "Manager" },
  { value: "Director", label: "Director" },
  { value: "Executive", label: "Executive" },
];

export const PROFICIENCY_LEVELS = [
  { value: "foundation", label: "Foundation", color: "bg-slate-500" },
  { value: "developing", label: "Developing", color: "bg-blue-500" },
  { value: "proficient", label: "Proficient", color: "bg-green-500" },
  { value: "advanced", label: "Advanced", color: "bg-purple-500" },
  { value: "expert", label: "Expert", color: "bg-amber-500" },
];
