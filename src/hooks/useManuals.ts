// Unified hook for accessing manuals from database as single source of truth

import { useMemo } from "react";
import { useManualDefinitions, type ManualDefinition as DbManual } from "./useManualGeneration";
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
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import type { FunctionalArea } from "@/constants/manualsStructure";

// Icon mapping from database icon_name to Lucide component
const ICON_MAP: Record<string, LucideIcon> = {
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
  GraduationCap,
};

// Act metadata (static - defines the journey structure)
export const ACT_METADATA = [
  {
    id: "prologue",
    actType: "prologue" as const,
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
    manualCodes: ["admin-security", "hr-hub"],
  },
  {
    id: "act1",
    actType: "act1" as const,
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
    manualCodes: ["workforce"],
  },
  {
    id: "act2",
    actType: "act2" as const,
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
    manualCodes: ["time-attendance"],
  },
  {
    id: "act3",
    actType: "act3" as const,
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
    manualCodes: ["benefits"],
  },
  {
    id: "act4",
    actType: "act4" as const,
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
      { title: "Learning", description: "LMS, courses, and compliance training" },
    ],
    outcomes: [
      "Culture of continuous feedback",
      "Aligned goals across the organization",
      "Strong leadership pipeline",
      "Clear career progression paths",
      "Comprehensive learning management",
    ],
    manualCodes: ["appraisals", "goals", "feedback-360", "succession", "career-development", "learning-development"],
  },
];

// Transform database manual to UI-compatible format
export interface TransformedManual {
  id: string;
  manualCode: string;
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

export interface TransformedAct {
  id: string;
  actType: "prologue" | "act1" | "act2" | "act3" | "act4" | "epilogue";
  actLabel: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  bgGradient: string;
  narrative: string;
  themes: Array<{ title: string; description: string }>;
  outcomes: string[];
  manuals: TransformedManual[];
}

function transformDbManual(dbManual: DbManual): TransformedManual {
  return {
    id: dbManual.manual_code,
    manualCode: dbManual.manual_code,
    title: dbManual.manual_name,
    description: dbManual.description || "",
    icon: ICON_MAP[dbManual.icon_name || "BookOpen"] || BookOpen,
    sections: dbManual.sections_count || 0,
    chapters: dbManual.chapters_count || 0,
    href: dbManual.href || `/enablement/manuals/${dbManual.manual_code}`,
    version: dbManual.current_version || "1.0.0",
    functionalAreas: (dbManual.functional_areas || []) as FunctionalArea[],
    color: dbManual.color_class || "bg-primary/10 text-primary border-primary/20",
    badgeColor: dbManual.badge_color || "bg-primary/10 text-primary border-primary/30",
  };
}

export function useManuals() {
  const { data: dbManuals = [], isLoading, error, refetch } = useManualDefinitions();

  // Transform all database manuals
  const manuals = useMemo(() => {
    return dbManuals.map(transformDbManual);
  }, [dbManuals]);

  // Organize manuals by act
  const manualsByAct = useMemo((): TransformedAct[] => {
    return ACT_METADATA.map(actMeta => ({
      ...actMeta,
      manuals: dbManuals
        .filter(m => actMeta.manualCodes.includes(m.manual_code))
        .map(transformDbManual),
    }));
  }, [dbManuals]);

  // Find manual by code
  const getManualByCode = (code: string): TransformedManual | undefined => {
    const dbManual = dbManuals.find(m => m.manual_code === code);
    return dbManual ? transformDbManual(dbManual) : undefined;
  };

  // Get raw database manual by code
  const getDbManualByCode = (code: string): DbManual | undefined => {
    return dbManuals.find(m => m.manual_code === code);
  };

  // Get total counts
  const totalSections = useMemo(() => {
    return manuals.reduce((acc, m) => acc + m.sections, 0);
  }, [manuals]);

  const totalChapters = useMemo(() => {
    return manuals.reduce((acc, m) => acc + m.chapters, 0);
  }, [manuals]);

  // Filter by functional area
  const filterByFunctionalArea = (area: FunctionalArea | "all"): TransformedManual[] => {
    if (area === "all") return manuals;
    return manuals.filter(m => m.functionalAreas.includes(area));
  };

  // Get acts filtered by functional area
  const getActsFiltered = (area: FunctionalArea | "all"): TransformedAct[] => {
    if (area === "all") return manualsByAct;

    return manualsByAct
      .map(act => ({
        ...act,
        manuals: act.manuals.filter(m => m.functionalAreas.includes(area)),
      }))
      .filter(act => act.manuals.length > 0);
  };

  // Get filtered counts
  const getFilteredCounts = (area: FunctionalArea | "all") => {
    const filtered = filterByFunctionalArea(area);
    return {
      manuals: filtered.length,
      sections: filtered.reduce((acc, m) => acc + m.sections, 0),
      chapters: filtered.reduce((acc, m) => acc + m.chapters, 0),
    };
  };

  return {
    // Raw database data
    dbManuals,
    
    // Transformed data
    manuals,
    manualsByAct,
    
    // Lookups
    getManualByCode,
    getDbManualByCode,
    
    // Aggregations
    totalSections,
    totalChapters,
    totalManuals: manuals.length,
    
    // Filtering
    filterByFunctionalArea,
    getActsFiltered,
    getFilteredCounts,
    
    // Query state
    isLoading,
    error,
    refetch,
  };
}
