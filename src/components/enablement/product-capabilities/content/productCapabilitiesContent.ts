/**
 * CANONICAL CONTENT MODEL FOR PRODUCT CAPABILITIES
 * 
 * This is the SINGLE SOURCE OF TRUTH for all Product Capabilities content.
 * Both the UI components and PDF generator MUST use this data.
 * 
 * DO NOT duplicate this content elsewhere. Any changes here will automatically
 * reflect in both the web view and exported PDF.
 */

import { 
  Shield, 
  Users, 
  Building2, 
  Clock, 
  Calendar,
  DollarSign,
  Award,
  GraduationCap,
  Target,
  MessageSquare,
  TrendingUp,
  Heart,
  Scale,
  Package,
  HelpCircle,
  Settings,
  FileText,
  Briefcase,
  UserMinus,
  UserPlus,
  Gift,
  AlertTriangle,
  Layers,
  Globe,
  Brain,
  BarChart3,
  Zap,
  type LucideIcon,
} from "lucide-react";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface ModuleDefinition {
  key: string;
  name: string;
  icon: LucideIcon;
  capabilities: number;
  act: string;
}

export interface ActDefinition {
  id: string;
  act: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  textColorRgb: [number, number, number];
  capabilities: number;
  modules: { name: string; count: number; icon: LucideIcon }[];
  keyOutcomes: string[];
}

export interface IntegrationPipeline {
  name: string;
  flow: string[];
  description: string;
  dataTypes: string;
}

export interface DataFlow {
  source: string;
  target: string;
  dataType: string;
  direction: "one-way" | "bidirectional";
}

export interface CrossCuttingSection {
  title: string;
  capabilities: number;
  modules: { name: string; count: number; icon: LucideIcon }[];
}

// =============================================================================
// MODULES REGISTRY - All 25 modules with their canonical definitions
// =============================================================================

export const MODULES_REGISTRY: Record<string, ModuleDefinition> = {
  // Prologue
  admin_security: { key: "admin_security", name: "Admin & Security", icon: Shield, capabilities: 80, act: "prologue" },
  hr_hub: { key: "hr_hub", name: "HR Hub", icon: FileText, capabilities: 70, act: "prologue" },
  
  // Act 1
  recruitment: { key: "recruitment", name: "Recruitment", icon: Briefcase, capabilities: 75, act: "act1" },
  onboarding: { key: "onboarding", name: "Onboarding", icon: UserPlus, capabilities: 55, act: "act1" },
  workforce: { key: "workforce", name: "Workforce Admin", icon: Building2, capabilities: 60, act: "act1" },
  offboarding: { key: "offboarding", name: "Offboarding", icon: UserMinus, capabilities: 55, act: "act1" },
  
  // Act 2
  ess: { key: "ess", name: "Employee Self-Service", icon: Users, capabilities: 45, act: "act2" },
  mss: { key: "mss", name: "Manager Self-Service", icon: TrendingUp, capabilities: 50, act: "act2" },
  time: { key: "time", name: "Time & Attendance", icon: Clock, capabilities: 45, act: "act2" },
  leave: { key: "leave", name: "Leave Management", icon: Calendar, capabilities: 40, act: "act2" },
  
  // Act 3
  payroll: { key: "payroll", name: "Payroll", icon: DollarSign, capabilities: 60, act: "act3" },
  compensation: { key: "compensation", name: "Compensation", icon: TrendingUp, capabilities: 50, act: "act3" },
  benefits: { key: "benefits", name: "Benefits", icon: Gift, capabilities: 40, act: "act3" },
  
  // Act 4
  learning: { key: "learning", name: "Learning & Development", icon: GraduationCap, capabilities: 130, act: "act4" },
  goals: { key: "goals", name: "Goals & OKRs", icon: Target, capabilities: 45, act: "act4" },
  appraisals: { key: "appraisals", name: "Appraisals", icon: BarChart3, capabilities: 50, act: "act4" },
  feedback_360: { key: "feedback_360", name: "360 Feedback", icon: MessageSquare, capabilities: 35, act: "act4" },
  continuous_perf: { key: "continuous_perf", name: "Continuous Performance", icon: Zap, capabilities: 55, act: "act4" },
  succession: { key: "succession", name: "Succession Planning", icon: TrendingUp, capabilities: 95, act: "act4" },
  
  // Act 5
  health_safety: { key: "health_safety", name: "Health & Safety", icon: Heart, capabilities: 135, act: "act5" },
  employee_relations: { key: "employee_relations", name: "Employee Relations", icon: Scale, capabilities: 130, act: "act5" },
  company_property: { key: "company_property", name: "Company Property", icon: Package, capabilities: 65, act: "act5" },
  
  // Epilogue
  help_center: { key: "help_center", name: "Help Center", icon: HelpCircle, capabilities: 85, act: "epilogue" },
  
  // Cross-cutting
  platform_features: { key: "platform_features", name: "Platform Features", icon: Settings, capabilities: 70, act: "cross" },
  regional_compliance: { key: "regional_compliance", name: "Regional Compliance", icon: Shield, capabilities: 50, act: "cross" },
};

// =============================================================================
// ACTS - The 7 Employee Lifecycle Acts (canonical definition)
// =============================================================================

export const ACTS: ActDefinition[] = [
  {
    id: "prologue",
    act: "Prologue",
    title: "Setting the Stage",
    subtitle: "Foundation & Governance",
    icon: Shield,
    color: "text-slate-600",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30",
    textColorRgb: [100, 116, 139],
    capabilities: 150,
    modules: [
      { name: "Admin & Security", count: 80, icon: Shield },
      { name: "HR Hub", count: 70, icon: Building2 },
    ],
    keyOutcomes: [
      "Enterprise-grade security",
      "Complete audit trails",
      "Zero-trust architecture",
    ],
  },
  {
    id: "act1",
    act: "Act 1",
    title: "Attract, Onboard & Transition",
    subtitle: "Talent Lifecycle",
    icon: UserPlus,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    textColorRgb: [59, 130, 246],
    capabilities: 245,
    modules: [
      { name: "Recruitment", count: 75, icon: Briefcase },
      { name: "Onboarding", count: 55, icon: UserPlus },
      { name: "Offboarding", count: 55, icon: UserMinus },
      { name: "Workforce", count: 60, icon: Users },
    ],
    keyOutcomes: [
      "50% faster time-to-hire",
      "Day-one readiness",
      "98%+ asset recovery",
    ],
  },
  {
    id: "act2",
    act: "Act 2",
    title: "Enable & Engage",
    subtitle: "Self-Service & Time",
    icon: Users,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    textColorRgb: [16, 185, 129],
    capabilities: 180,
    modules: [
      { name: "ESS", count: 45, icon: Users },
      { name: "MSS", count: 50, icon: Users },
      { name: "Time & Attendance", count: 45, icon: Clock },
      { name: "Leave", count: 40, icon: Calendar },
    ],
    keyOutcomes: [
      "80% fewer HR inquiries",
      "99.9% time accuracy",
      "Zero compliance violations",
    ],
  },
  {
    id: "act3",
    act: "Act 3",
    title: "Pay & Reward",
    subtitle: "Compensation & Benefits",
    icon: DollarSign,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    textColorRgb: [245, 158, 11],
    capabilities: 150,
    modules: [
      { name: "Payroll", count: 60, icon: DollarSign },
      { name: "Compensation", count: 50, icon: TrendingUp },
      { name: "Benefits", count: 40, icon: Gift },
    ],
    keyOutcomes: [
      "99.99% payroll accuracy",
      "Pay equity analysis",
      "Real-time GL integration",
    ],
  },
  {
    id: "act4",
    act: "Act 4",
    title: "Develop & Grow",
    subtitle: "Performance & Talent",
    icon: GraduationCap,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    textColorRgb: [168, 85, 247],
    capabilities: 410,
    modules: [
      { name: "Learning & Development", count: 130, icon: GraduationCap },
      { name: "Goals", count: 45, icon: Target },
      { name: "Appraisals", count: 50, icon: BarChart3 },
      { name: "360 Feedback", count: 35, icon: MessageSquare },
      { name: "Continuous Performance", count: 55, icon: Zap },
      { name: "Succession", count: 95, icon: TrendingUp },
    ],
    keyOutcomes: [
      "85%+ training completion",
      "90%+ successor coverage",
      "Flight risk detection",
    ],
  },
  {
    id: "act5",
    act: "Act 5",
    title: "Protect & Support",
    subtitle: "Safety & Relations",
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    textColorRgb: [239, 68, 68],
    capabilities: 280,
    modules: [
      { name: "Health & Safety", count: 120, icon: Heart },
      { name: "Employee Relations", count: 130, icon: Scale },
      { name: "Company Property", count: 65, icon: Package },
    ],
    keyOutcomes: [
      "60%+ incident reduction",
      "70%+ grievance resolution",
      "Complete asset tracking",
    ],
  },
  {
    id: "epilogue",
    act: "Epilogue",
    title: "Continuous Excellence",
    subtitle: "Support & Knowledge",
    icon: HelpCircle,
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    textColorRgb: [99, 102, 241],
    capabilities: 85,
    modules: [
      { name: "Help Center", count: 85, icon: HelpCircle },
    ],
    keyOutcomes: [
      "70%+ ticket deflection",
      "24/7 AI assistance",
      "Version-controlled KB",
    ],
  },
];

// =============================================================================
// CROSS-CUTTING CAPABILITIES
// =============================================================================

export const CROSS_CUTTING: CrossCuttingSection = {
  title: "Cross-Cutting Capabilities",
  capabilities: 175,
  modules: [
    { name: "Platform Features", count: 70, icon: Layers },
    { name: "Regional Compliance", count: 50, icon: Globe },
    { name: "AI Intelligence", count: 55, icon: Brain },
  ],
};

// =============================================================================
// INTEGRATION PIPELINES - Key data flows between modules
// =============================================================================

export const INTEGRATION_PIPELINES: IntegrationPipeline[] = [
  {
    name: "Hire-to-Pay",
    flow: ["recruitment", "onboarding", "workforce", "payroll"],
    description: "Zero re-entry from offer acceptance to first paycheck",
    dataTypes: "Candidate data → Employee record → Bank details → Pay calculation"
  },
  {
    name: "Performance-to-Pay",
    flow: ["goals", "appraisals", "compensation", "payroll"],
    description: "Ratings automatically inform merit increases and bonuses",
    dataTypes: "Objectives → Scores → Merit % → Salary update"
  },
  {
    name: "Time-to-Pay",
    flow: ["time", "leave", "payroll"],
    description: "Hours worked and absences flow directly to pay",
    dataTypes: "Clock events → Leave balances → Gross pay"
  },
  {
    name: "Learning-to-Succession",
    flow: ["learning", "goals", "appraisals", "succession"],
    description: "Development drives leadership pipeline",
    dataTypes: "Courses → Competencies → Ratings → Readiness"
  },
  {
    name: "Safety-to-Compliance",
    flow: ["health_safety", "learning", "workforce"],
    description: "Incidents trigger training and record updates",
    dataTypes: "Incident → Required training → Completion → Employee file"
  },
  {
    name: "Self-Service Hub",
    flow: ["ess", "time", "leave", "benefits", "learning"],
    description: "Single portal for complete work life management",
    dataTypes: "Requests → Approvals → Updates → Notifications"
  },
  {
    name: "Manager Intelligence",
    flow: ["mss", "goals", "appraisals", "compensation"],
    description: "Real-time team insights and actions",
    dataTypes: "Team data → Analytics → Recommendations → Actions"
  },
  {
    name: "Exit-to-Settlement",
    flow: ["offboarding", "company_property", "payroll"],
    description: "Complete offboarding with final settlement",
    dataTypes: "Exit request → Asset returns → Final pay"
  },
];

// =============================================================================
// DATA FLOW MATRIX - Detailed module-to-module data flows
// =============================================================================

export const DATA_FLOW_MATRIX: DataFlow[] = [
  { source: "recruitment", target: "onboarding", dataType: "Hired candidates", direction: "one-way" },
  { source: "onboarding", target: "workforce", dataType: "New employee records", direction: "one-way" },
  { source: "workforce", target: "payroll", dataType: "Employee & job data", direction: "bidirectional" },
  { source: "workforce", target: "time", dataType: "Schedule assignments", direction: "one-way" },
  { source: "time", target: "payroll", dataType: "Hours & overtime", direction: "bidirectional" },
  { source: "leave", target: "payroll", dataType: "Leave pay", direction: "one-way" },
  { source: "goals", target: "appraisals", dataType: "Goal achievement", direction: "bidirectional" },
  { source: "appraisals", target: "compensation", dataType: "Performance ratings", direction: "bidirectional" },
  { source: "compensation", target: "payroll", dataType: "Salary changes", direction: "one-way" },
  { source: "learning", target: "appraisals", dataType: "Competency data", direction: "bidirectional" },
  { source: "appraisals", target: "succession", dataType: "High potentials", direction: "one-way" },
  { source: "health_safety", target: "learning", dataType: "Compliance training", direction: "one-way" },
  { source: "employee_relations", target: "payroll", dataType: "Final settlement", direction: "one-way" },
  { source: "offboarding", target: "company_property", dataType: "Asset returns", direction: "bidirectional" },
  { source: "benefits", target: "payroll", dataType: "Deductions", direction: "one-way" },
  { source: "ess", target: "time", dataType: "Clock in/out", direction: "one-way" },
  { source: "ess", target: "leave", dataType: "Leave requests", direction: "one-way" },
  { source: "mss", target: "appraisals", dataType: "Reviews & calibration", direction: "one-way" },
  { source: "feedback_360", target: "appraisals", dataType: "Multi-rater feedback", direction: "one-way" },
  { source: "continuous_perf", target: "appraisals", dataType: "Check-in data", direction: "one-way" },
];

// =============================================================================
// ACT STYLING FOR PRINT/PDF - RGB colors for each act
// =============================================================================

export const ACT_STYLING = {
  prologue: { 
    name: "Prologue: Foundation", 
    bgColor: "bg-slate-500/15", 
    textColor: "text-slate-700 dark:text-slate-300", 
    borderColor: "border-slate-400/40", 
    moduleColor: "bg-slate-500/20 border-slate-400/50",
    rgb: [100, 116, 139] as [number, number, number],
  },
  act1: { 
    name: "Act 1: Attract, Onboard & Transition", 
    bgColor: "bg-blue-500/15", 
    textColor: "text-blue-700 dark:text-blue-300", 
    borderColor: "border-blue-400/40", 
    moduleColor: "bg-blue-500/20 border-blue-400/50",
    rgb: [59, 130, 246] as [number, number, number],
  },
  act2: { 
    name: "Act 2: Enable & Engage", 
    bgColor: "bg-emerald-500/15", 
    textColor: "text-emerald-700 dark:text-emerald-300", 
    borderColor: "border-emerald-400/40", 
    moduleColor: "bg-emerald-500/20 border-emerald-400/50",
    rgb: [16, 185, 129] as [number, number, number],
  },
  act3: { 
    name: "Act 3: Pay & Reward", 
    bgColor: "bg-amber-500/15", 
    textColor: "text-amber-700 dark:text-amber-300", 
    borderColor: "border-amber-400/40", 
    moduleColor: "bg-amber-500/20 border-amber-400/50",
    rgb: [245, 158, 11] as [number, number, number],
  },
  act4: { 
    name: "Act 4: Develop & Grow", 
    bgColor: "bg-purple-500/15", 
    textColor: "text-purple-700 dark:text-purple-300", 
    borderColor: "border-purple-400/40", 
    moduleColor: "bg-purple-500/20 border-purple-400/50",
    rgb: [168, 85, 247] as [number, number, number],
  },
  act5: { 
    name: "Act 5: Protect & Support", 
    bgColor: "bg-red-500/15", 
    textColor: "text-red-700 dark:text-red-300", 
    borderColor: "border-red-400/40", 
    moduleColor: "bg-red-500/20 border-red-400/50",
    rgb: [239, 68, 68] as [number, number, number],
  },
  epilogue: { 
    name: "Epilogue: Continuous Excellence", 
    bgColor: "bg-indigo-500/15", 
    textColor: "text-indigo-700 dark:text-indigo-300", 
    borderColor: "border-indigo-400/40", 
    moduleColor: "bg-indigo-500/20 border-indigo-400/50",
    rgb: [99, 102, 241] as [number, number, number],
  },
  cross: { 
    name: "Cross-Cutting Intelligence", 
    bgColor: "bg-slate-700", 
    textColor: "text-white", 
    borderColor: "border-slate-500", 
    moduleColor: "bg-slate-600 border-slate-400",
    rgb: [71, 85, 105] as [number, number, number],
  },
};

// =============================================================================
// EXECUTIVE OVERVIEW CONTENT
// =============================================================================

export const EXECUTIVE_OVERVIEW_CONTENT = {
  title: "Intelli HRM",
  subtitle: "AI-First Human Resource Management System",
  description: "Purpose-built for the Caribbean, Latin America, Africa, and global expansion. Deep regional compliance meets embedded intelligence for enterprise-grade workforce management.",
  
  stats: [
    { value: "25", label: "Core Modules" },
    { value: "1,675+", label: "Capabilities" },
    { value: "20+", label: "Countries" },
    { value: "100%", label: "AI-Enhanced" },
  ],
  
  challenge: {
    title: "The Challenge",
    text: "Global HR platforms fail locally. Caribbean tax rules don't fit North American templates. African labor laws are missing. Latin American statutory requirements become manual spreadsheets. You're left patching gaps, building workarounds, and risking compliance.",
    bullets: [
      "Jamaica NIS/NHT/PAYE missing from US-centric platforms",
      "Ghana SSNIT calculations require manual intervention",
      "Dominican Republic AFP/TSS compliance as spreadsheet workarounds",
    ],
  },
  
  transformation: {
    title: "The Transformation",
    text: "Intelli HRM was built from the ground up for regional complexity—not adapted from US templates. Every statutory deduction, every labor law nuance, every public holiday is native to the platform. Compliance is a first-class citizen, not an afterthought.",
    bullets: [
      "Caribbean payroll with NIS, NHT, PAYE, HEART built-in",
      "African compliance (Ghana, Nigeria) as first-class features",
      "Latin America (Dominican Republic, Mexico) fully supported",
    ],
  },
  
  valueProps: [
    {
      icon: "Globe",
      title: "Regional Expertise",
      description: "Deep compliance for Caribbean islands (Jamaica NIS/NHT/PAYE, Trinidad, Barbados), Latin America (Dominican Republic AFP/TSS, Mexico IMSS), and African markets (Ghana SSNIT, Nigeria PFA). Built-in labor law intelligence."
    },
    {
      icon: "Sparkles",
      title: "AI at the Core",
      description: "Every module features predictive insights, prescriptive recommendations, and automated actions. AI reduces thinking load, not just clicks."
    },
    {
      icon: "TrendingUp",
      title: "Cross-Module Intelligence",
      description: "No module exists in isolation. Appraisals feed Succession, Compensation, and Learning. Time data flows to Payroll, Wellness, and Compliance."
    }
  ],
  
  journeyActs: [
    { act: "Prologue", title: "Setting the Stage", narrative: "Where governance begins", outcome: "Zero-trust security" },
    { act: "Act 1", title: "Attract & Onboard", narrative: "Where talent meets strategy", outcome: "50% faster hiring" },
    { act: "Act 2", title: "Enable & Engage", narrative: "Where work flows freely", outcome: "80% fewer inquiries" },
    { act: "Act 3", title: "Pay & Reward", narrative: "Where trust is built", outcome: "99.99% accuracy" },
    { act: "Act 4", title: "Develop & Grow", narrative: "Where potential becomes performance", outcome: "90%+ succession" },
    { act: "Act 5", title: "Protect & Support", narrative: "Where care becomes culture", outcome: "60%+ safer workplace" },
    { act: "Epilogue", title: "Excellence", narrative: "Where support never stops", outcome: "70%+ self-service" },
  ],
  
  personas: [
    { 
      persona: "Employee", 
      quote: "One portal for everything—from day one to retirement. I can see my pay, request leave, access learning, and manage my career all in one place.",
      colorClass: "bg-blue-500/5 border-blue-500/20",
    },
    { 
      persona: "Manager", 
      quote: "AI tells me what I didn't know to ask about my team. I see attrition risks, skill gaps, and performance trends before they become problems.",
      colorClass: "bg-emerald-500/5 border-emerald-500/20",
    },
    { 
      persona: "HR Partner", 
      quote: "Compliance is built-in, not bolted on. Every country's rules are native, every action is auditable, and every report is ready.",
      colorClass: "bg-purple-500/5 border-purple-500/20",
    },
    { 
      persona: "Executive", 
      quote: "Strategic workforce insights, not operational noise. I see the pipeline, the costs, the risks—and what to do about them.",
      colorClass: "bg-amber-500/5 border-amber-500/20",
    },
  ],
  
  aiFeatures: [
    { title: "Embedded Intelligence", description: "AI in every module, not just a chat window" },
    { title: "Predictive Insights", description: "See problems before they happen" },
    { title: "Prescriptive Actions", description: "Know what to do, not just what happened" },
    { title: "Explainable AI", description: "Full audit trails, human oversight, bias detection" },
  ],
  
  differentiators: [
    "AI embedded in every module, not bolted on",
    "Native Caribbean, Latin American & African compliance",
    "Full audit trails with explainable AI",
    "Role-based simplicity with progressive depth",
  ],
};

// =============================================================================
// COMPUTED VALUES - Derived from canonical data
// =============================================================================

export function getTotalCapabilities(): number {
  return ACTS.reduce((sum, act) => sum + act.capabilities, 0) + CROSS_CUTTING.capabilities;
}

export function getTotalModules(): number {
  return ACTS.reduce((sum, act) => sum + act.modules.length, 0) + CROSS_CUTTING.modules.length;
}

export function getModulesByAct(actId: string): ModuleDefinition[] {
  return Object.values(MODULES_REGISTRY).filter(m => m.act === actId);
}

export function getBidirectionalFlowCount(): number {
  return DATA_FLOW_MATRIX.filter(d => d.direction === "bidirectional").length;
}

export function getModuleName(key: string): string {
  return MODULES_REGISTRY[key]?.name || key;
}

// =============================================================================
// INTEGRATION DIAGRAM STATS - For header display
// =============================================================================

export const INTEGRATION_STATS = {
  moduleCount: Object.keys(MODULES_REGISTRY).length,
  capabilitiesCount: getTotalCapabilities(),
  integrationsCount: DATA_FLOW_MATRIX.length * 5, // Approximate total integration points
  bidirectionalCount: getBidirectionalFlowCount(),
  manualReEntryCount: 0, // Zero manual re-entry is the promise
};
