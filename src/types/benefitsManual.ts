// Benefits Administrator Manual Types - Enterprise-grade documentation structure
// Follows the same pattern as workforceManual.ts and adminManual.ts

import { ManualSection } from './adminManual';

// Re-export common types from adminManual
export type {
  ManualSection,
  IndustryContext,
  ManualArtifact,
  ManualContent,
  ManualStep,
  ManualDiagram,
  ManualScreenshot,
  ManualTable,
  ManualCallout,
  TroubleshootingItem
} from './adminManual';

// Benefits Manual Structure - 8 Parts
export const BENEFITS_MANUAL_STRUCTURE: ManualSection[] = [
  // Part 1: Module Overview & Conceptual Foundation
  {
    id: 'ben-part-1',
    sectionNumber: '1',
    title: 'Module Overview & Conceptual Foundation',
    description: 'Introduction to the Benefits module, core concepts, and system architecture',
    contentLevel: 'overview',
    estimatedReadTime: 35,
    targetRoles: ['All'],
    subsections: [
      {
        id: 'ben-sec-1-1',
        sectionNumber: '1.1',
        title: 'Introduction to Benefits in HRplus',
        description: 'Executive summary, business value, and key differentiators',
        contentLevel: 'overview',
        estimatedReadTime: 8,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Initial onboarding',
          benchmark: 'Enterprise HRMS standards (Workday, SAP SuccessFactors)'
        }
      },
      {
        id: 'ben-sec-1-2',
        sectionNumber: '1.2',
        title: 'Core Concepts & Terminology',
        description: 'Plans, enrollments, coverage levels, contributions, and claims workflow',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin', 'Benefits Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Initial onboarding',
          benchmark: 'Industry standard benefits terminology'
        }
      },
      {
        id: 'ben-sec-1-3',
        sectionNumber: '1.3',
        title: 'System Architecture',
        description: 'Data model from categories to enrollments, integration points with Payroll',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Implementation phase',
          benchmark: 'Multi-tenant enterprise architecture'
        }
      },
      {
        id: 'ben-sec-1-4',
        sectionNumber: '1.4',
        title: 'User Personas & Journeys',
        description: 'Benefits Admin, HR Admin, Manager (MSS), Employee (ESS) workflows',
        contentLevel: 'overview',
        estimatedReadTime: 6,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Training sessions',
          benchmark: 'Role-based progressive disclosure'
        }
      },
      {
        id: 'ben-sec-1-5',
        sectionNumber: '1.5',
        title: 'Benefits Management Calendar',
        description: 'Open enrollment cycles, renewal periods, life event windows',
        contentLevel: 'overview',
        estimatedReadTime: 6,
        targetRoles: ['HR Admin', 'Benefits Admin'],
        industryContext: {
          frequency: 'Annual planning',
          timing: 'Fiscal year alignment, benefits renewal',
          benchmark: 'Industry-standard benefits calendar'
        }
      }
    ]
  },
  // Part 2: Foundation Setup
  {
    id: 'ben-part-2',
    sectionNumber: '2',
    title: 'Foundation Setup',
    description: 'Benefit categories, providers, and foundational configuration',
    contentLevel: 'procedure',
    estimatedReadTime: 40,
    targetRoles: ['Super Admin', 'HR Admin', 'Benefits Admin'],
    subsections: [
      {
        id: 'ben-sec-2-1',
        sectionNumber: '2.1',
        title: 'Prerequisites Checklist',
        description: 'Dependencies, data requirements, provider contracts, regulatory info',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time during implementation',
          timing: '4-6 weeks before go-live',
          benchmark: 'Implementation methodology'
        }
      },
      {
        id: 'ben-sec-2-2',
        sectionNumber: '2.2',
        title: 'Benefit Categories Configuration',
        description: 'Medical, Dental, Vision, Life, Retirement, HSA, FSA, Wellness categories',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Benefits Admin'],
        industryContext: {
          frequency: 'One-time setup, annual review',
          timing: 'Initial implementation',
          benchmark: 'Standard benefit category taxonomy'
        }
      },
      {
        id: 'ben-sec-2-3',
        sectionNumber: '2.3',
        title: 'Benefit Providers Setup',
        description: 'Insurance carriers, retirement plan administrators, wellness vendors',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Benefits Admin'],
        industryContext: {
          frequency: 'One-time setup, contract renewals',
          timing: 'Post category setup',
          benchmark: 'Provider master data management'
        }
      },
      {
        id: 'ben-sec-2-4',
        sectionNumber: '2.4',
        title: 'Provider Contact & Contract Management',
        description: 'Account managers, escalation contacts, contract terms tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Benefits Admin'],
        industryContext: {
          frequency: 'Ongoing maintenance',
          timing: 'Post provider setup',
          benchmark: 'Vendor relationship management'
        }
      }
    ]
  },
  // Part 3: Benefit Plans Configuration
  {
    id: 'ben-part-3',
    sectionNumber: '3',
    title: 'Benefit Plans Configuration',
    description: 'Plan types, contribution models, eligibility rules, and plan lifecycle',
    contentLevel: 'procedure',
    estimatedReadTime: 65,
    targetRoles: ['Benefits Admin', 'HR Admin'],
    subsections: [
      {
        id: 'ben-sec-3-1',
        sectionNumber: '3.1',
        title: 'Understanding Plan Types',
        description: 'Medical, Dental, Vision, Life, 401k, Pension, FSA, HSA, Wellness plans',
        contentLevel: 'concept',
        estimatedReadTime: 12,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Pre-configuration',
          benchmark: 'Standard benefit plan types'
        }
      },
      {
        id: 'ben-sec-3-2',
        sectionNumber: '3.2',
        title: 'Creating Benefit Plans',
        description: 'Plan setup wizard, plan details, effective dates, plan status',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Benefits Admin'],
        industryContext: {
          frequency: 'Annual renewal, new plan additions',
          timing: 'Pre-enrollment period',
          benchmark: 'Plan configuration best practices'
        }
      },
      {
        id: 'ben-sec-3-3',
        sectionNumber: '3.3',
        title: 'Contribution Configuration',
        description: 'Employee/Employer contributions, fixed/percentage, tiered structures',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Benefits Admin', 'Finance'],
        industryContext: {
          frequency: 'Annual review, plan changes',
          timing: 'Budget planning cycle',
          benchmark: 'Total compensation strategy'
        }
      },
      {
        id: 'ben-sec-3-4',
        sectionNumber: '3.4',
        title: 'Waiting Periods & Eligibility Rules',
        description: 'New hire waiting periods, eligibility criteria, employment type rules',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Benefits Admin'],
        industryContext: {
          frequency: 'Policy setup, regulatory updates',
          timing: 'Post plan creation',
          benchmark: 'ERISA, ACA compliance'
        }
      },
      {
        id: 'ben-sec-3-5',
        sectionNumber: '3.5',
        title: 'Plan Documents & Communications',
        description: 'Summary Plan Descriptions (SPD), plan amendments, employee notices',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Benefits Admin'],
        industryContext: {
          frequency: 'Annual updates, plan changes',
          timing: 'Pre-enrollment',
          benchmark: 'ERISA disclosure requirements'
        }
      },
      {
        id: 'ben-sec-3-6',
        sectionNumber: '3.6',
        title: 'Plan Activation & Versioning',
        description: 'Activating plans, version control, plan year transitions',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Benefits Admin'],
        industryContext: {
          frequency: 'Annual cycle',
          timing: 'Pre-open enrollment',
          benchmark: 'Plan lifecycle management'
        }
      }
    ]
  },
  // Part 4: Enrollment Management
  {
    id: 'ben-part-4',
    sectionNumber: '4',
    title: 'Enrollment Management',
    description: 'Open enrollment, employee enrollments, coverage management, and auto-enrollment',
    contentLevel: 'procedure',
    estimatedReadTime: 75,
    targetRoles: ['Benefits Admin', 'HR Ops'],
    subsections: [
      {
        id: 'ben-sec-4-1',
        sectionNumber: '4.1',
        title: 'Enrollment Lifecycle Overview',
        description: 'From eligibility to confirmation, enrollment statuses and transitions',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Training',
          benchmark: 'Standard enrollment workflow'
        }
      },
      {
        id: 'ben-sec-4-2',
        sectionNumber: '4.2',
        title: 'Open Enrollment Configuration',
        description: 'Setting up enrollment periods, communications, reminders',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Benefits Admin'],
        industryContext: {
          frequency: 'Annual',
          timing: '6-8 weeks before open enrollment',
          benchmark: 'Industry open enrollment practices'
        }
      },
      {
        id: 'ben-sec-4-3',
        sectionNumber: '4.3',
        title: 'Processing Employee Enrollments',
        description: 'New hire enrollments, plan changes, election confirmations',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Benefits Admin', 'HR Ops'],
        industryContext: {
          frequency: 'Daily during enrollment periods',
          timing: 'Open enrollment, new hires',
          benchmark: 'Enrollment processing SLAs'
        }
      },
      {
        id: 'ben-sec-4-4',
        sectionNumber: '4.4',
        title: 'Coverage Level Management',
        description: 'Employee Only, Employee + Spouse, Employee + Family configurations',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Benefits Admin'],
        industryContext: {
          frequency: 'Plan setup, enrollment processing',
          timing: 'Ongoing',
          benchmark: 'Dependent eligibility rules'
        }
      },
      {
        id: 'ben-sec-4-5',
        sectionNumber: '4.5',
        title: 'Dependent Management',
        description: 'Adding dependents, verification requirements, dependent eligibility',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Benefits Admin', 'HR Ops'],
        industryContext: {
          frequency: 'Enrollment events',
          timing: 'Open enrollment, life events',
          benchmark: 'Dependent verification audit'
        }
      },
      {
        id: 'ben-sec-4-6',
        sectionNumber: '4.6',
        title: 'Auto-Enrollment Rules Configuration',
        description: 'Default enrollment rules, passive enrollment, opt-out policies',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Benefits Admin'],
        industryContext: {
          frequency: 'Policy setup, annual review',
          timing: 'Pre-open enrollment',
          benchmark: 'Auto-enrollment best practices'
        }
      },
      {
        id: 'ben-sec-4-7',
        sectionNumber: '4.7',
        title: 'Enrollment Approval Workflows',
        description: 'Manager approvals, HR review, exception handling',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Benefits Admin'],
        industryContext: {
          frequency: 'Policy configuration',
          timing: 'Pre-implementation',
          benchmark: 'Governance requirements'
        }
      },
      {
        id: 'ben-sec-4-8',
        sectionNumber: '4.8',
        title: 'Waiting Period Tracking',
        description: 'Monitoring employees in waiting periods, eligibility notifications',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Benefits Admin', 'HR Ops'],
        industryContext: {
          frequency: 'Daily monitoring',
          timing: 'Ongoing',
          benchmark: 'Eligibility date tracking'
        }
      }
    ]
  },
  // Part 5: Life Events & Special Enrollment
  {
    id: 'ben-part-5',
    sectionNumber: '5',
    title: 'Life Events & Special Enrollment',
    description: 'Qualifying life events, special enrollment periods, and mid-year changes',
    contentLevel: 'procedure',
    estimatedReadTime: 45,
    targetRoles: ['Benefits Admin', 'HR Ops'],
    subsections: [
      {
        id: 'ben-sec-5-1',
        sectionNumber: '5.1',
        title: 'Qualifying Life Event Types',
        description: 'Marriage, birth, adoption, divorce, loss of coverage, job change events',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Training',
          benchmark: 'IRS qualifying life events'
        }
      },
      {
        id: 'ben-sec-5-2',
        sectionNumber: '5.2',
        title: 'Recording Life Events',
        description: 'Employee self-service submission, HR entry, documentation requirements',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Benefits Admin', 'HR Ops', 'Employee'],
        industryContext: {
          frequency: 'As events occur',
          timing: 'Within 30-60 days of event',
          benchmark: 'Timely event processing'
        }
      },
      {
        id: 'ben-sec-5-3',
        sectionNumber: '5.3',
        title: 'Special Enrollment Window Management',
        description: 'Window duration, deadline tracking, extension handling',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Benefits Admin'],
        industryContext: {
          frequency: 'Per life event',
          timing: 'Event-driven',
          benchmark: 'HIPAA special enrollment rules'
        }
      },
      {
        id: 'ben-sec-5-4',
        sectionNumber: '5.4',
        title: 'Life Event Approval Workflow',
        description: 'Documentation review, approval process, enrollment activation',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Benefits Admin'],
        industryContext: {
          frequency: 'Per life event',
          timing: 'Within window period',
          benchmark: 'Event processing SLA'
        }
      },
      {
        id: 'ben-sec-5-5',
        sectionNumber: '5.5',
        title: 'Mid-Year Plan Changes',
        description: 'Permitted changes, effective dates, payroll synchronization',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Benefits Admin'],
        industryContext: {
          frequency: 'Per approved life event',
          timing: 'Event-driven',
          benchmark: 'IRS Section 125 rules'
        }
      }
    ]
  },
  // Part 6: Claims Processing
  {
    id: 'ben-part-6',
    sectionNumber: '6',
    title: 'Claims Processing',
    description: 'Claims submission, review, approval, and payment workflows',
    contentLevel: 'procedure',
    estimatedReadTime: 50,
    targetRoles: ['Benefits Admin', 'HR Ops'],
    subsections: [
      {
        id: 'ben-sec-6-1',
        sectionNumber: '6.1',
        title: 'Claims Workflow Overview',
        description: 'End-to-end claims process, statuses, and touchpoints',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Training',
          benchmark: 'Standard claims workflow'
        }
      },
      {
        id: 'ben-sec-6-2',
        sectionNumber: '6.2',
        title: 'Submitting Claims',
        description: 'Employee self-service claims, supporting documentation, submission channels',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Employee', 'Benefits Admin'],
        industryContext: {
          frequency: 'As claims arise',
          timing: 'Ongoing',
          benchmark: 'Digital claims submission'
        }
      },
      {
        id: 'ben-sec-6-3',
        sectionNumber: '6.3',
        title: 'Claims Review & Validation',
        description: 'Documentation verification, eligibility check, coverage confirmation',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Benefits Admin'],
        industryContext: {
          frequency: 'Per claim',
          timing: 'Within SLA',
          benchmark: 'Claims adjudication standards'
        }
      },
      {
        id: 'ben-sec-6-4',
        sectionNumber: '6.4',
        title: 'Claims Approval & Payment',
        description: 'Approval workflow, payment processing, reimbursement methods',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Benefits Admin', 'Finance'],
        industryContext: {
          frequency: 'Per approved claim',
          timing: 'Payment cycle',
          benchmark: 'Payment SLA compliance'
        }
      },
      {
        id: 'ben-sec-6-5',
        sectionNumber: '6.5',
        title: 'Claims Status Tracking',
        description: 'Tracking claims through lifecycle, employee visibility, status updates',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Benefits Admin', 'Employee'],
        industryContext: {
          frequency: 'Ongoing',
          timing: 'Real-time',
          benchmark: 'Transparency standards'
        }
      },
      {
        id: 'ben-sec-6-6',
        sectionNumber: '6.6',
        title: 'Claims Reporting',
        description: 'Claims analytics, trend analysis, provider performance',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Benefits Admin'],
        industryContext: {
          frequency: 'Monthly/Quarterly',
          timing: 'Reporting cycles',
          benchmark: 'Claims analytics'
        }
      }
    ]
  },
  // Part 7: Analytics & Compliance
  {
    id: 'ben-part-7',
    sectionNumber: '7',
    title: 'Analytics & Compliance',
    description: 'Benefits analytics, cost projections, compliance monitoring, and reporting',
    contentLevel: 'procedure',
    estimatedReadTime: 55,
    targetRoles: ['Benefits Admin', 'HR Admin', 'Finance'],
    subsections: [
      {
        id: 'ben-sec-7-1',
        sectionNumber: '7.1',
        title: 'Benefits Analytics Dashboard',
        description: 'Key metrics, enrollment trends, utilization rates, cost analysis',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Benefits Admin', 'HR Admin'],
        industryContext: {
          frequency: 'Daily/Weekly review',
          timing: 'Ongoing',
          benchmark: 'Benefits intelligence'
        }
      },
      {
        id: 'ben-sec-7-2',
        sectionNumber: '7.2',
        title: 'Cost Projections & Forecasting',
        description: 'Budget planning, renewal projections, cost modeling scenarios',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Benefits Admin', 'Finance'],
        industryContext: {
          frequency: 'Quarterly, annual planning',
          timing: 'Budget cycle',
          benchmark: 'Actuarial standards'
        }
      },
      {
        id: 'ben-sec-7-3',
        sectionNumber: '7.3',
        title: 'Plan Comparison Analytics',
        description: 'Comparing plan performance, cost-effectiveness, employee satisfaction',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Benefits Admin'],
        industryContext: {
          frequency: 'Annual review',
          timing: 'Pre-renewal',
          benchmark: 'Plan optimization'
        }
      },
      {
        id: 'ben-sec-7-4',
        sectionNumber: '7.4',
        title: 'Compliance Monitoring',
        description: 'ACA, ERISA, HIPAA compliance tracking, regulatory updates',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Benefits Admin', 'Compliance'],
        industryContext: {
          frequency: 'Ongoing monitoring',
          timing: 'Continuous',
          benchmark: 'Regulatory compliance'
        }
      },
      {
        id: 'ben-sec-7-5',
        sectionNumber: '7.5',
        title: 'Coverage Reports',
        description: 'Enrollment reports, coverage summaries, dependent coverage',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Benefits Admin'],
        industryContext: {
          frequency: 'Monthly, as needed',
          timing: 'Reporting cycles',
          benchmark: 'Standard benefit reports'
        }
      },
      {
        id: 'ben-sec-7-6',
        sectionNumber: '7.6',
        title: 'Eligibility Audit Trail',
        description: 'Audit logs, eligibility history, compliance documentation',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Benefits Admin', 'Audit'],
        industryContext: {
          frequency: 'Audit preparation',
          timing: 'As required',
          benchmark: 'Audit readiness'
        }
      }
    ]
  },
  // Part 8: Employee & Manager Self-Service
  {
    id: 'ben-part-8',
    sectionNumber: '8',
    title: 'Employee & Manager Self-Service',
    description: 'ESS benefits features, plan comparison tools, and manager visibility',
    contentLevel: 'procedure',
    estimatedReadTime: 40,
    targetRoles: ['Employee', 'Manager', 'Benefits Admin'],
    subsections: [
      {
        id: 'ben-sec-8-1',
        sectionNumber: '8.1',
        title: 'ESS: Viewing My Benefits',
        description: 'Current enrollments, coverage details, beneficiary information',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Employee'],
        industryContext: {
          frequency: 'Anytime access',
          timing: 'Self-service',
          benchmark: 'Mobile-first benefits access'
        }
      },
      {
        id: 'ben-sec-8-2',
        sectionNumber: '8.2',
        title: 'ESS: Enrolling in Benefits',
        description: 'Open enrollment experience, plan selection, confirmation workflow',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Employee'],
        industryContext: {
          frequency: 'Annual, life events',
          timing: 'Enrollment periods',
          benchmark: 'Guided enrollment experience'
        }
      },
      {
        id: 'ben-sec-8-3',
        sectionNumber: '8.3',
        title: 'ESS: Submitting Claims',
        description: 'Claims submission portal, document upload, status tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Employee'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Self-service',
          benchmark: 'Digital claims experience'
        }
      },
      {
        id: 'ben-sec-8-4',
        sectionNumber: '8.4',
        title: 'Plan Comparison Tool',
        description: 'Side-by-side plan comparison, cost calculator, decision support',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Employee'],
        industryContext: {
          frequency: 'Enrollment periods',
          timing: 'Decision-making',
          benchmark: 'Benefits decision tools'
        }
      },
      {
        id: 'ben-sec-8-5',
        sectionNumber: '8.5',
        title: 'Benefit Calculator',
        description: 'Cost estimator, contribution calculator, tax savings projections',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Employee'],
        industryContext: {
          frequency: 'Enrollment, planning',
          timing: 'Self-service',
          benchmark: 'Financial planning tools'
        }
      },
      {
        id: 'ben-sec-8-6',
        sectionNumber: '8.6',
        title: 'MSS: Team Benefits Overview',
        description: 'Manager visibility, enrollment tracking, team benefits reports',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Manager'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Enrollment periods',
          benchmark: 'Manager visibility'
        }
      }
    ]
  }
];

// Helper function to count total sections
export function getBenefitsManualStats() {
  let totalSections = 0;
  let totalReadTime = 0;
  
  BENEFITS_MANUAL_STRUCTURE.forEach(part => {
    if (part.subsections) {
      totalSections += part.subsections.length;
      part.subsections.forEach(sub => {
        totalReadTime += sub.estimatedReadTime || 0;
      });
    }
  });
  
  return {
    partsCount: BENEFITS_MANUAL_STRUCTURE.length,
    sectionsCount: totalSections,
    estimatedReadTimeMinutes: totalReadTime,
    estimatedReadTimeHours: Math.round(totalReadTime / 60 * 10) / 10
  };
}

// Navigation paths for Benefits Manual cross-references
export const BENEFITS_NAVIGATION_PATHS: Record<string, string[]> = {
  'ben-part-1': ['Benefits Manual', 'Overview'],
  'ben-part-2': ['Benefits Manual', 'Foundation Setup'],
  'ben-part-3': ['Benefits Manual', 'Plan Configuration'],
  'ben-part-4': ['Benefits Manual', 'Enrollment Management'],
  'ben-part-5': ['Benefits Manual', 'Life Events'],
  'ben-part-6': ['Benefits Manual', 'Claims Processing'],
  'ben-part-7': ['Benefits Manual', 'Analytics & Compliance'],
  'ben-part-8': ['Benefits Manual', 'Self-Service'],
};

// Related topics for cross-module navigation
export const BENEFITS_RELATED_TOPICS: Record<string, { sectionId: string; title: string; module?: string; manualPath?: string }[]> = {
  'ben-sec-3-3': [
    { sectionId: 'comp-sec-2-1', title: 'Pay Structures', module: 'Compensation', manualPath: '/enablement/manuals/compensation' },
    { sectionId: 'pay-sec-1-1', title: 'Payroll Integration', module: 'Payroll', manualPath: '/enablement/manuals/payroll' }
  ],
  'ben-sec-4-1': [
    { sectionId: 'wf-sec-4-1', title: 'Employee Records', module: 'Workforce', manualPath: '/enablement/manuals/workforce' }
  ],
  'ben-sec-7-4': [
    { sectionId: 'admin-sec-3-1', title: 'Compliance Settings', module: 'Admin & Security', manualPath: '/enablement/manuals/admin-security' }
  ]
};
