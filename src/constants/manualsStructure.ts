import {
  Shield,
  Users,
  HelpCircle,
  Target,
  BookOpen,
  Clock,
  Radar,
  Grid3X3,
  TrendingUp,
  Heart,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export type FunctionalArea = 
  | "core-hr" 
  | "talent" 
  | "compensation" 
  | "time-leave" 
  | "platform";

export const FUNCTIONAL_AREAS: Record<FunctionalArea, {
  label: string;
  color: string;
  badgeClass: string;
  iconBg: string;
}> = {
  "core-hr": {
    label: "Core HR",
    color: "blue",
    badgeClass: "bg-blue-500/10 text-blue-700 border-blue-500/30 dark:text-blue-400",
    iconBg: "bg-blue-500/10",
  },
  "talent": {
    label: "Talent",
    color: "purple",
    badgeClass: "bg-purple-500/10 text-purple-700 border-purple-500/30 dark:text-purple-400",
    iconBg: "bg-purple-500/10",
  },
  "compensation": {
    label: "Compensation",
    color: "amber",
    badgeClass: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400",
    iconBg: "bg-amber-500/10",
  },
  "time-leave": {
    label: "Time & Leave",
    color: "emerald",
    badgeClass: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10",
  },
  "platform": {
    label: "Platform",
    color: "slate",
    badgeClass: "bg-slate-500/10 text-slate-700 border-slate-500/30 dark:text-slate-400",
    iconBg: "bg-slate-500/10",
  },
};

export interface ManualDefinition {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  sections: number;
  chapters: number;
  href: string;
  version: string;
  functionalAreas: FunctionalArea[];
  color: string;
  badgeColor: string;
}

export interface ActTheme {
  title: string;
  description: string;
}

export interface ActDefinition {
  id: string;
  actType: "prologue" | "act1" | "act2" | "act3" | "act4" | "epilogue";
  actLabel: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  bgGradient: string;
  narrative: string;
  themes: ActTheme[];
  outcomes: string[];
  manuals: ManualDefinition[];
}

export const MANUALS_BY_ACT: ActDefinition[] = [
  {
    id: "prologue",
    actType: "prologue",
    actLabel: "Prologue",
    title: "Setting the Stage",
    subtitle: "Foundation & Governance",
    icon: Shield,
    color: "slate",
    bgGradient: "from-slate-500/10 to-slate-500/5",
    narrative: "Before employees can be managed, the foundation must be set. Security configurations, access controls, and governance policies form the bedrock upon which all other modules operate.",
    themes: [
      { title: "Security First", description: "Zero-trust architecture and access controls" },
      { title: "Governance", description: "Policies, audits, and compliance" },
      { title: "Operational Control", description: "Central command for HR operations" },
      { title: "AI Infrastructure", description: "Intelligent foundation for automation" },
    ],
    outcomes: [
      "Enterprise-grade security without complexity",
      "Complete audit trails for compliance",
      "Central command for HR operations",
    ],
    manuals: [
      {
        id: "admin-security",
        title: "Admin & Security Guide",
        description: "Complete guide to administration, security configuration, user management, and system settings",
        icon: Shield,
        sections: 55,
        chapters: 8,
        href: "/enablement/manuals/admin-security",
        version: "2.4",
        functionalAreas: ["platform", "core-hr"],
        color: "bg-red-500/10 text-red-600 border-red-500/20",
        badgeColor: "bg-red-500/10 text-red-700 border-red-500/30",
      },
      {
        id: "hr-hub",
        title: "HR Hub Guide",
        description: "HR Hub configuration including policies, documents, knowledge base, and employee communications",
        icon: HelpCircle,
        sections: 32,
        chapters: 8,
        href: "/enablement/manuals/hr-hub",
        version: "2.4",
        functionalAreas: ["core-hr", "platform"],
        color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
        badgeColor: "bg-purple-500/10 text-purple-700 border-purple-500/30",
      },
    ],
  },
  {
    id: "act1",
    actType: "act1",
    actLabel: "Act 1",
    title: "Attract, Onboard & Transition",
    subtitle: "Talent Lifecycle",
    icon: Users,
    color: "blue",
    bgGradient: "from-blue-500/10 to-blue-500/5",
    narrative: "Every great organization starts with great people. From the first job posting to the final onboarding checklist, this act covers the complete talent acquisition and integration journey.",
    themes: [
      { title: "Organizational Design", description: "Structure that enables growth" },
      { title: "Position Management", description: "Jobs, positions, and hierarchy" },
      { title: "Employee Lifecycle", description: "Hire to retire workflows" },
      { title: "Data Integrity", description: "Single source of truth for people data" },
    ],
    outcomes: [
      "Streamlined organizational design",
      "Automated position management",
      "Seamless employee lifecycle transitions",
    ],
    manuals: [
      {
        id: "workforce",
        title: "Workforce Guide",
        description: "Comprehensive workforce management including org structure, positions, departments, and employee lifecycle",
        icon: Users,
        sections: 80,
        chapters: 8,
        href: "/enablement/manuals/workforce",
        version: "2.4",
        functionalAreas: ["core-hr"],
        color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        badgeColor: "bg-blue-500/10 text-blue-700 border-blue-500/30",
      },
    ],
  },
  {
    id: "act2",
    actType: "act2",
    actLabel: "Act 2",
    title: "Enable & Engage",
    subtitle: "Daily Operations",
    icon: Clock,
    color: "emerald",
    bgGradient: "from-emerald-500/10 to-emerald-500/5",
    narrative: "Empowered employees drive organizational success. Time tracking, scheduling, and attendance management ensure operational efficiency while respecting work-life balance.",
    themes: [
      { title: "Time Tracking", description: "Accurate capture of work hours" },
      { title: "Scheduling", description: "Shift and roster management" },
      { title: "Attendance", description: "Presence and absence tracking" },
      { title: "Compliance", description: "Labor law adherence" },
    ],
    outcomes: [
      "Accurate time and attendance data",
      "Optimized scheduling for productivity",
      "Labor compliance assurance",
    ],
    manuals: [
      {
        id: "time-attendance",
        title: "Time & Attendance Guide",
        description: "Complete guide to time tracking, shifts, schedules, overtime, and attendance management",
        icon: Clock,
        sections: 65,
        chapters: 8,
        href: "/enablement/manuals/time-attendance",
        version: "2.4",
        functionalAreas: ["time-leave"],
        color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
        badgeColor: "bg-indigo-500/10 text-indigo-700 border-indigo-500/30",
      },
    ],
  },
  {
    id: "act3",
    actType: "act3",
    actLabel: "Act 3",
    title: "Pay & Reward",
    subtitle: "Total Compensation",
    icon: Heart,
    color: "amber",
    bgGradient: "from-amber-500/10 to-amber-500/5",
    narrative: "Fair compensation builds trust and retention. Benefits administration ensures employees understand and maximize their total rewards package.",
    themes: [
      { title: "Benefits Plans", description: "Health, retirement, and wellness" },
      { title: "Enrollment", description: "Open enrollment and life events" },
      { title: "Claims Management", description: "Processing and tracking" },
      { title: "Analytics", description: "Cost and utilization insights" },
    ],
    outcomes: [
      "Simplified benefits enrollment",
      "Transparent total rewards communication",
      "Cost-effective benefits management",
    ],
    manuals: [
      {
        id: "benefits",
        title: "Benefits Administrator Guide",
        description: "Complete benefits management including plans, enrollment, claims, life events, and analytics",
        icon: Heart,
        sections: 45,
        chapters: 8,
        href: "/enablement/manuals/benefits",
        version: "2.4",
        functionalAreas: ["compensation"],
        color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
        badgeColor: "bg-pink-500/10 text-pink-700 border-pink-500/30",
      },
    ],
  },
  {
    id: "act4",
    actType: "act4",
    actLabel: "Act 4",
    title: "Develop & Grow",
    subtitle: "Talent Development",
    icon: TrendingUp,
    color: "purple",
    bgGradient: "from-purple-500/10 to-purple-500/5",
    narrative: "Growth is not optional—it's the engine of retention. Performance management, goals, feedback, succession planning, and career development create a culture of continuous improvement.",
    themes: [
      { title: "Performance", description: "Continuous feedback and appraisals" },
      { title: "Goals", description: "OKRs and cascading objectives" },
      { title: "Feedback", description: "360-degree multi-rater insights" },
      { title: "Succession", description: "Pipeline and readiness planning" },
      { title: "Career", description: "Paths and development plans" },
    ],
    outcomes: [
      "Culture of continuous feedback",
      "Aligned goals across the organization",
      "Strong leadership pipeline",
      "Clear career progression paths",
    ],
    manuals: [
      {
        id: "appraisals",
        title: "Performance Appraisal Guide",
        description: "Performance appraisal configuration including cycles, templates, workflows, and calibration",
        icon: BookOpen,
        sections: 48,
        chapters: 8,
        href: "/enablement/manuals/appraisals",
        version: "2.4",
        functionalAreas: ["talent"],
        color: "bg-primary/10 text-primary border-primary/20",
        badgeColor: "bg-primary/10 text-primary border-primary/30",
      },
      {
        id: "goals",
        title: "Goals Manual",
        description: "Goals management configuration including goal frameworks, cascading, tracking, and alignment",
        icon: Target,
        sections: 24,
        chapters: 6,
        href: "/enablement/manuals/goals",
        version: "2.4",
        functionalAreas: ["talent"],
        color: "bg-green-500/10 text-green-600 border-green-500/20",
        badgeColor: "bg-green-500/10 text-green-700 border-green-500/30",
      },
      {
        id: "feedback-360",
        title: "360 Feedback Guide",
        description: "Multi-rater feedback system including cycles, anonymity, rater management, AI insights, and development themes",
        icon: Radar,
        sections: 59,
        chapters: 8,
        href: "/enablement/manuals/feedback-360",
        version: "2.5",
        functionalAreas: ["talent"],
        color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
        badgeColor: "bg-cyan-500/10 text-cyan-700 border-cyan-500/30",
      },
      {
        id: "succession",
        title: "Succession Planning Guide",
        description: "Comprehensive succession planning including 9-box assessments, talent pools, readiness frameworks, and career paths",
        icon: Grid3X3,
        sections: 55,
        chapters: 11,
        href: "/enablement/manuals/succession",
        version: "1.0",
        functionalAreas: ["talent"],
        color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        badgeColor: "bg-amber-500/10 text-amber-700 border-amber-500/30",
      },
      {
        id: "career-development",
        title: "Career Development Guide",
        description: "Career paths, individual development plans (IDPs), mentorship programs, and AI-driven development recommendations",
        icon: TrendingUp,
        sections: 52,
        chapters: 10,
        href: "/enablement/manuals/career-development",
        version: "1.0",
        functionalAreas: ["talent"],
        color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        badgeColor: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
      },
    ],
  },
];

// Helper functions
export function getAllManuals(): ManualDefinition[] {
  return MANUALS_BY_ACT.flatMap(act => act.manuals);
}

export function getTotalSections(): number {
  return getAllManuals().reduce((acc, m) => acc + m.sections, 0);
}

export function getTotalChapters(): number {
  return getAllManuals().reduce((acc, m) => acc + m.chapters, 0);
}

export function getActSectionCount(act: ActDefinition): number {
  return act.manuals.reduce((acc, m) => acc + m.sections, 0);
}

export function getActChapterCount(act: ActDefinition): number {
  return act.manuals.reduce((acc, m) => acc + m.chapters, 0);
}

export function filterManualsByFunctionalArea(area: FunctionalArea | "all"): ManualDefinition[] {
  if (area === "all") return getAllManuals();
  return getAllManuals().filter(m => m.functionalAreas.includes(area));
}

export function getFilteredActsWithManuals(area: FunctionalArea | "all"): ActDefinition[] {
  if (area === "all") return MANUALS_BY_ACT;
  
  return MANUALS_BY_ACT.map(act => ({
    ...act,
    manuals: act.manuals.filter(m => m.functionalAreas.includes(area)),
  })).filter(act => act.manuals.length > 0);
}

export function getFilteredSectionCount(area: FunctionalArea | "all"): number {
  return filterManualsByFunctionalArea(area).reduce((acc, m) => acc + m.sections, 0);
}

export function getFilteredChapterCount(area: FunctionalArea | "all"): number {
  return filterManualsByFunctionalArea(area).reduce((acc, m) => acc + m.chapters, 0);
}

export function getFilteredManualCount(area: FunctionalArea | "all"): number {
  return filterManualsByFunctionalArea(area).length;
}
