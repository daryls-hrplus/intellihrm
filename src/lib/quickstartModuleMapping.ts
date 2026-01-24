// Maps Quick Start module codes to feature registry and manual references
export const QUICKSTART_MODULE_MAP: Record<string, {
  featureCode: string;
  manualCode: string | null;
  moduleName: string;
  description: string;
}> = {
  LND: {
    featureCode: "training",
    manualCode: null,
    moduleName: "Learning & Development",
    description: "Training programs, course management, and employee development"
  },
  PERF: {
    featureCode: "performance",
    manualCode: "appraisals",
    moduleName: "Performance Management",
    description: "Performance reviews, appraisals, and continuous feedback"
  },
  GOALS: {
    featureCode: "goals",
    manualCode: "goals",
    moduleName: "Goals & OKRs",
    description: "Goal setting, OKRs, and strategic alignment"
  },
  WFM: {
    featureCode: "workforce",
    manualCode: "workforce",
    moduleName: "Workforce Management",
    description: "Workforce planning, scheduling, and capacity management"
  },
  TIME: {
    featureCode: "time_attendance",
    manualCode: "time-attendance",
    moduleName: "Time & Attendance",
    description: "Time tracking, attendance management, and overtime"
  },
  BEN: {
    featureCode: "benefits",
    manualCode: "ben_ad",
    moduleName: "Benefits Administration",
    description: "Employee benefits enrollment and management"
  },
  COMP: {
    featureCode: "compensation",
    manualCode: null,
    moduleName: "Compensation Management",
    description: "Salary planning, merit increases, and compensation cycles"
  },
  SEC: {
    featureCode: "admin",
    manualCode: "admin-security",
    moduleName: "Security & Access",
    description: "Role-based access control and security settings"
  }
};

export function getModuleInfo(moduleCode: string) {
  return QUICKSTART_MODULE_MAP[moduleCode] || null;
}
