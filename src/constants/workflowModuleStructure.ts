import { 
  Users, 
  Calendar, 
  GraduationCap, 
  UserSearch, 
  Target, 
  Receipt, 
  FileText, 
  Settings,
  UserPlus,
  ArrowRightLeft,
  FileCheck,
  DollarSign,
  UserMinus,
  Clock,
  Briefcase,
  Award,
  MessageSquare,
  TrendingUp
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface WorkflowDefinition {
  code: string;
  name: string;
  description?: string;
  transactionTypeCode: string | null;
}

export interface WorkflowCategory {
  id: string;
  name: string;
  color: string;
  icon: LucideIcon;
  workflows: WorkflowDefinition[];
}

export interface WorkflowModule {
  id: string;
  name: string;
  icon: LucideIcon;
  categories: WorkflowCategory[];
}

export const WORKFLOW_MODULES: WorkflowModule[] = [
  {
    id: "workforce",
    name: "Workforce",
    icon: Users,
    categories: [
      {
        id: "hire_onboarding",
        name: "Hire / Onboarding",
        color: "emerald",
        icon: UserPlus,
        workflows: [
          { code: "hire", name: "New Hire", transactionTypeCode: "HIRE" },
          { code: "rehire", name: "Rehire", transactionTypeCode: "REHIRE" },
          { code: "confirmation", name: "Confirmation", transactionTypeCode: "CONFIRMATION" }
        ]
      },
      {
        id: "movement",
        name: "Movement",
        color: "blue",
        icon: ArrowRightLeft,
        workflows: [
          { code: "promotion", name: "Promotion", transactionTypeCode: "PROMOTION" },
          { code: "transfer", name: "Transfer", transactionTypeCode: "TRANSFER" },
          { code: "secondment", name: "Secondment", transactionTypeCode: "SECONDMENT" },
          { code: "acting", name: "Acting Assignment", transactionTypeCode: "ACTING" }
        ]
      },
      {
        id: "contract_management",
        name: "Contract Management",
        color: "purple",
        icon: FileCheck,
        workflows: [
          { code: "probation_extension", name: "Probation Extension", transactionTypeCode: "PROBATION_EXT" },
          { code: "contract_extension", name: "Contract Extension", transactionTypeCode: "CONTRACT_EXTENSION" },
          { code: "contract_conversion", name: "Contract Conversion", transactionTypeCode: "CONTRACT_CONVERSION" },
          { code: "status_change", name: "Status Change", transactionTypeCode: "STATUS_CHANGE" }
        ]
      },
      {
        id: "compensation",
        name: "Compensation",
        color: "amber",
        icon: DollarSign,
        workflows: [
          { code: "salary_change", name: "Salary Change", transactionTypeCode: "SALARY_CHANGE" },
          { code: "rate_change", name: "Hourly/Daily Rate Change", transactionTypeCode: "RATE_CHANGE" }
        ]
      },
      {
        id: "separation",
        name: "Separation",
        color: "red",
        icon: UserMinus,
        workflows: [
          { code: "termination", name: "Termination", transactionTypeCode: "TERMINATION" },
          { code: "resignation", name: "Resignation", transactionTypeCode: "RESIGNATION" },
          { code: "retirement", name: "Retirement", transactionTypeCode: "RETIREMENT" }
        ]
      }
    ]
  },
  {
    id: "leave",
    name: "Leave Management",
    icon: Calendar,
    categories: [
      {
        id: "leave_requests",
        name: "Leave Requests",
        color: "teal",
        icon: Clock,
        workflows: [
          { code: "leave_request", name: "Leave Request", transactionTypeCode: null },
          { code: "leave_cancellation", name: "Leave Cancellation", transactionTypeCode: null }
        ]
      }
    ]
  },
  {
    id: "training",
    name: "Training & Learning",
    icon: GraduationCap,
    categories: [
      {
        id: "training_requests",
        name: "Training Requests",
        color: "indigo",
        icon: Award,
        workflows: [
          { code: "training_request", name: "Training Request", transactionTypeCode: null },
          { code: "certification_request", name: "Certification Request", transactionTypeCode: null }
        ]
      }
    ]
  },
  {
    id: "recruitment",
    name: "Recruitment",
    icon: UserSearch,
    categories: [
      {
        id: "headcount",
        name: "Headcount & Requisitions",
        color: "cyan",
        icon: Briefcase,
        workflows: [
          { code: "headcount_request", name: "Headcount Request", transactionTypeCode: null },
          { code: "requisition_approval", name: "Requisition Approval", transactionTypeCode: null }
        ]
      },
      {
        id: "offer_management",
        name: "Offer Management",
        color: "sky",
        icon: FileText,
        workflows: [
          { code: "offer_approval", name: "Offer Approval", transactionTypeCode: null },
          { code: "offer_extension", name: "Offer Extension", transactionTypeCode: null }
        ]
      }
    ]
  },
  {
    id: "performance",
    name: "Performance",
    icon: Target,
    categories: [
      {
        id: "appraisals",
        name: "Appraisals & PIPs",
        color: "orange",
        icon: Target,
        workflows: [
          { code: "rating_approval", name: "Appraisal Rating Approval", description: "Skip-level review and HR sign-off for performance ratings", transactionTypeCode: null },
          { code: "pip_acknowledgment", name: "PIP Acknowledgment", description: "Employee acknowledgment of performance improvement plans", transactionTypeCode: null },
          { code: "rating_release_approval", name: "Rating Release Approval", description: "HR approval before releasing ratings to employees", transactionTypeCode: null }
        ]
      },
      {
        id: "goals",
        name: "Goals",
        color: "lime",
        icon: Target,
        workflows: [
          { code: "goal_approval", name: "Individual Goal Approval", description: "Manager approval for individual performance goals", transactionTypeCode: null },
          { code: "goal_approval", name: "Team Goal Approval", description: "Multi-level approval for team-wide goals", transactionTypeCode: null },
          { code: "goal_approval", name: "Department Goal Approval", description: "Executive approval for department objectives", transactionTypeCode: null }
        ]
      },
      {
        id: "feedback",
        name: "360° Feedback",
        color: "cyan",
        icon: MessageSquare,
        workflows: [
          { code: "feedback_360_approval", name: "360 Results Release", description: "HR quality review before releasing feedback to employees", transactionTypeCode: null }
        ]
      },
      {
        id: "succession",
        name: "Succession Planning",
        color: "purple",
        icon: TrendingUp,
        workflows: [
          { code: "succession_approval", name: "Succession Plan Approval", description: "HRBP and department head approval for succession nominations", transactionTypeCode: null }
        ]
      }
    ]
  },
  {
    id: "expenses",
    name: "Expenses",
    icon: Receipt,
    categories: [
      {
        id: "claims",
        name: "Expense Claims",
        color: "rose",
        icon: Receipt,
        workflows: [
          { code: "expense_claim", name: "Expense Claim", transactionTypeCode: null }
        ]
      }
    ]
  },
  {
    id: "employee_relations",
    name: "Employee Relations",
    icon: Users,
    categories: [
      {
        id: "disciplinary",
        name: "Disciplinary",
        color: "red",
        icon: FileText,
        workflows: [
          { code: "disciplinary_acknowledgement", name: "Disciplinary Acknowledgement", transactionTypeCode: null }
        ]
      },
      {
        id: "grievances",
        name: "Grievances",
        color: "orange",
        icon: FileText,
        workflows: [
          { code: "grievance_submission", name: "Grievance Submission", transactionTypeCode: null }
        ]
      }
    ]
  },
  {
    id: "documents",
    name: "Documents & Compliance",
    icon: FileText,
    categories: [
      {
        id: "submissions",
        name: "Document Submissions",
        color: "slate",
        icon: FileCheck,
        workflows: [
          { code: "qualification", name: "Qualification Submission", transactionTypeCode: null },
          { code: "letter_request", name: "Letter Request", transactionTypeCode: null },
          { code: "immigration", name: "Immigration Documents", transactionTypeCode: null }
        ]
      }
    ]
  },
  {
    id: "general",
    name: "General",
    icon: Settings,
    categories: [
      {
        id: "general",
        name: "General Workflows",
        color: "gray",
        icon: Settings,
        workflows: [
          { code: "general", name: "General", transactionTypeCode: null }
        ]
      }
    ]
  }
];

// Helper to get category color classes
export const getCategoryColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800" },
    blue: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
    purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
    amber: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
    red: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", border: "border-red-200 dark:border-red-800" },
    teal: { bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-700 dark:text-teal-300", border: "border-teal-200 dark:border-teal-800" },
    indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300", border: "border-indigo-200 dark:border-indigo-800" },
    cyan: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-200 dark:border-cyan-800" },
    sky: { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-700 dark:text-sky-300", border: "border-sky-200 dark:border-sky-800" },
    orange: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800" },
    lime: { bg: "bg-lime-100 dark:bg-lime-900/30", text: "text-lime-700 dark:text-lime-300", border: "border-lime-200 dark:border-lime-800" },
    rose: { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800" },
    slate: { bg: "bg-slate-100 dark:bg-slate-900/30", text: "text-slate-700 dark:text-slate-300", border: "border-slate-200 dark:border-slate-800" },
    gray: { bg: "bg-gray-100 dark:bg-gray-900/30", text: "text-gray-700 dark:text-gray-300", border: "border-gray-200 dark:border-gray-800" },
  };
  return colorMap[color] || colorMap.gray;
};

// Map workflow codes to their categories for filtering templates
export const getWorkflowCategory = (workflowCode: string): string => {
  for (const module of WORKFLOW_MODULES) {
    for (const category of module.categories) {
      const workflow = category.workflows.find(w => w.code === workflowCode);
      if (workflow) return workflowCode;
    }
  }
  return "general";
};

// Get all workflow codes for a module
export const getWorkflowCodesForModule = (moduleId: string): string[] => {
  const module = WORKFLOW_MODULES.find(m => m.id === moduleId);
  if (!module) return [];
  return module.categories.flatMap(c => c.workflows.map(w => w.code));
};
