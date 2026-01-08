// Workforce Administrator Manual Types - Enterprise-grade documentation structure
// Follows the same pattern as adminManual.ts and integrates with existing ManualSection types

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

// Workforce Manual Structure - 10 Parts
export const WORKFORCE_MANUAL_STRUCTURE: ManualSection[] = [
  // Part 1: Module Overview & Conceptual Foundation
  {
    id: 'wf-part-1',
    sectionNumber: '1',
    title: 'Module Overview & Conceptual Foundation',
    description: 'Introduction to the Workforce module, core concepts, and system architecture',
    contentLevel: 'overview',
    estimatedReadTime: 40,
    targetRoles: ['All'],
    subsections: [
      {
        id: 'wf-sec-1-1',
        sectionNumber: '1.1',
        title: 'Introduction to Workforce in Intelli HRM',
        description: 'Executive summary, business value, and key differentiators',
        contentLevel: 'overview',
        estimatedReadTime: 10,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Initial onboarding',
          benchmark: 'Enterprise HRMS standards (Workday, SAP SuccessFactors)'
        }
      },
      {
        id: 'wf-sec-1-2',
        sectionNumber: '1.2',
        title: 'Core Concepts & Terminology',
        description: 'Organization hierarchy, job architecture, position vs job vs employee',
        contentLevel: 'concept',
        estimatedReadTime: 12,
        targetRoles: ['HR Admin', 'Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Initial onboarding',
          benchmark: 'Industry standard org design principles'
        }
      },
      {
        id: 'wf-sec-1-3',
        sectionNumber: '1.3',
        title: 'System Architecture',
        description: 'Data model from territories to employees, integration points',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Implementation phase',
          benchmark: 'Multi-tenant enterprise architecture'
        }
      },
      {
        id: 'wf-sec-1-4',
        sectionNumber: '1.4',
        title: 'User Personas & Journeys',
        description: 'Super Admin, HR Admin, HR Ops, Manager (MSS), Employee (ESS) workflows',
        contentLevel: 'overview',
        estimatedReadTime: 8,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Training sessions',
          benchmark: 'Role-based progressive disclosure'
        }
      },
      {
        id: 'wf-sec-1-5',
        sectionNumber: '1.5',
        title: 'Workforce Management Calendar',
        description: 'Annual org review cycles, headcount planning, budget alignment',
        contentLevel: 'overview',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin', 'Workforce Planner'],
        industryContext: {
          frequency: 'Annual planning',
          timing: 'Fiscal year alignment, Q4 planning cycles',
          benchmark: 'Industry-standard workforce calendar'
        }
      }
    ]
  },
  // Part 2: Foundation Setup - Organization Hierarchy
  {
    id: 'wf-part-2',
    sectionNumber: '2',
    title: 'Foundation Setup - Organization Hierarchy',
    description: 'Complete organization hierarchy configuration from territories to sections',
    contentLevel: 'procedure',
    estimatedReadTime: 75,
    targetRoles: ['Super Admin', 'HR Admin', 'Consultant'],
    subsections: [
      {
        id: 'wf-sec-2-1',
        sectionNumber: '2.1',
        title: 'Prerequisites Checklist',
        description: 'Dependencies, data requirements, legal entity information',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time during implementation',
          timing: '4-6 weeks before go-live',
          benchmark: 'SAP Activate, Workday Deploy methodology'
        }
      },
      {
        id: 'wf-sec-2-2',
        sectionNumber: '2.2',
        title: 'Territories Configuration',
        description: 'Geographic regions for grouping companies and compliance boundaries',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Super Admin'],
        industryContext: {
          frequency: 'One-time setup, rare updates',
          timing: 'Initial implementation',
          benchmark: 'Multi-country enterprise structures'
        }
      },
      {
        id: 'wf-sec-2-3',
        sectionNumber: '2.3',
        title: 'Company Groups Setup',
        description: 'Holding company structures and group-level inheritance',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Super Admin'],
        industryContext: {
          frequency: 'One-time setup, M&A updates',
          timing: 'Initial implementation',
          benchmark: 'Consolidated reporting, M&A support'
        }
      },
      {
        id: 'wf-sec-2-4',
        sectionNumber: '2.4',
        title: 'Companies Configuration',
        description: 'Individual legal entity setup with country-specific requirements',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Super Admin', 'HR Admin'],
        industryContext: {
          frequency: 'One-time per entity, updates on legal changes',
          timing: 'Initial implementation or acquisition',
          benchmark: 'Tax registration, labor board compliance'
        }
      },
      {
        id: 'wf-sec-2-5',
        sectionNumber: '2.5',
        title: 'Divisions Configuration',
        description: 'Optional organizational layer for large enterprises',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'As needed for large orgs',
          timing: 'Post company setup',
          benchmark: 'For 500+ employee companies'
        }
      },
      {
        id: 'wf-sec-2-6',
        sectionNumber: '2.6',
        title: 'Departments Configuration',
        description: 'Mandatory business unit setup with cost center linking',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup, org restructuring',
          timing: 'Post company/division setup',
          benchmark: 'GL cost center alignment'
        }
      },
      {
        id: 'wf-sec-2-7',
        sectionNumber: '2.7',
        title: 'Sections Configuration',
        description: 'Sub-department groupings and team-level organization',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'As needed for large departments',
          timing: 'Post department setup',
          benchmark: 'Optional sub-unit structure'
        }
      },
      {
        id: 'wf-sec-2-8',
        sectionNumber: '2.8',
        title: 'Branch Locations Setup',
        description: 'Physical office setup with geofencing and time zones',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup, office changes',
          timing: 'Post company setup',
          benchmark: 'GPS for mobile attendance'
        }
      },
      {
        id: 'wf-sec-2-9',
        sectionNumber: '2.9',
        title: 'Org Chart Configuration',
        description: 'Visualization settings, hierarchy levels, display options',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'One-time setup, periodic review',
          timing: 'Post hierarchy setup',
          benchmark: 'Interactive org browsing'
        }
      },
      {
        id: 'wf-sec-2-10',
        sectionNumber: '2.10',
        title: 'Governance & Board Setup',
        description: 'Company boards, management teams, board meeting management',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Super Admin'],
        industryContext: {
          frequency: 'Initial setup, board changes',
          timing: 'Post company setup',
          benchmark: 'Corporate governance compliance'
        }
      }
    ]
  },
  // Part 3: Job Architecture Setup
  {
    id: 'wf-part-3',
    sectionNumber: '3',
    title: 'Job Architecture Setup',
    description: 'Job families, jobs, positions, and competency framework configuration',
    contentLevel: 'procedure',
    estimatedReadTime: 90,
    targetRoles: ['HR Admin', 'Consultant'],
    subsections: [
      {
        id: 'wf-sec-3-1',
        sectionNumber: '3.1',
        title: 'Job Architecture Overview',
        description: 'Job families, jobs, positions hierarchy explained',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Pre-implementation',
          benchmark: 'Job architecture best practices'
        }
      },
      {
        id: 'wf-sec-3-2',
        sectionNumber: '3.2',
        title: 'Job Families Configuration',
        description: 'Creating career streams and progression paths',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup, annual review',
          timing: 'Pre-job definition',
          benchmark: 'Career lattice design'
        }
      },
      {
        id: 'wf-sec-3-3',
        sectionNumber: '3.3',
        title: 'Jobs Setup',
        description: 'Defining job codes, titles, grades, and descriptions',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup, ongoing maintenance',
          timing: 'Post job family setup',
          benchmark: 'Standard job libraries, O*NET alignment'
        }
      },
      {
        id: 'wf-sec-3-4',
        sectionNumber: '3.4',
        title: 'Skills & Competencies Library',
        description: 'Building the organizational competency framework',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR Admin', 'L&D Admin'],
        industryContext: {
          frequency: 'Initial setup, quarterly updates',
          timing: 'Pre-performance setup',
          benchmark: 'Competency-based talent management'
        }
      },
      {
        id: 'wf-sec-3-5',
        sectionNumber: '3.5',
        title: 'Qualifications Management',
        description: 'Academic qualifications, certifications, licenses',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup, regulatory updates',
          timing: 'Post job setup',
          benchmark: 'Credential tracking, expiry alerts'
        }
      },
      {
        id: 'wf-sec-3-6',
        sectionNumber: '3.6',
        title: 'Responsibilities Templates',
        description: 'Standard responsibility sets for positions',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Per job type, periodic review',
          timing: 'Post job setup',
          benchmark: 'Role clarity, accountability mapping'
        }
      },
      {
        id: 'wf-sec-3-7',
        sectionNumber: '3.7',
        title: 'Position Creation & Management',
        description: 'Creating positions linked to jobs and departments',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Ongoing, per headcount need',
          timing: 'Post job and org setup',
          benchmark: 'Position control methodology'
        }
      },
      {
        id: 'wf-sec-3-8',
        sectionNumber: '3.8',
        title: 'Position Budgeting',
        description: 'Headcount budget allocation per position',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin', 'Finance'],
        industryContext: {
          frequency: 'Annual budget cycle',
          timing: 'Fiscal year planning',
          benchmark: 'FTE planning, budget accountability'
        }
      },
      {
        id: 'wf-sec-3-9',
        sectionNumber: '3.9',
        title: 'Job-to-Position Mapping',
        description: 'Connecting job definitions to active positions',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Per position creation',
          timing: 'Post job and position setup',
          benchmark: 'One job to many positions'
        }
      }
    ]
  },
  // Part 4: Employee Management
  {
    id: 'wf-part-4',
    sectionNumber: '4',
    title: 'Employee Management',
    description: 'Complete employee record management, professional details, assignments, and documentation',
    contentLevel: 'procedure',
    estimatedReadTime: 180,
    targetRoles: ['HR Admin', 'HR Ops'],
    subsections: [
      {
        id: 'wf-sec-4-1',
        sectionNumber: '4.1',
        title: 'Employee Record Creation',
        description: 'Creating new employee profiles, required fields, employee identifiers',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Ops'],
        industryContext: {
          frequency: 'Per new hire',
          timing: 'Pre-hire or day one',
          benchmark: 'Data quality standards'
        }
      },
      {
        id: 'wf-sec-4-2',
        sectionNumber: '4.2',
        title: 'Personal Information Management',
        description: 'Contact details, emergency contacts, addresses, personal demographics',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Ops', 'Employee'],
        industryContext: {
          frequency: 'Employee-driven updates',
          timing: 'Ongoing',
          benchmark: 'PII handling, GDPR compliance'
        }
      },
      {
        id: 'wf-sec-4-3',
        sectionNumber: '4.3',
        title: 'Professional Details & Work History',
        description: 'Prior employment, education history, professional experience, career progression',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['HR Ops', 'Employee'],
        industryContext: {
          frequency: 'Onboarding, periodic updates',
          timing: 'Hire, career reviews',
          benchmark: 'Background verification integration'
        }
      },
      {
        id: 'wf-sec-4-4',
        sectionNumber: '4.4',
        title: 'Employment Assignments',
        description: 'Assigning employees to positions (primary, secondary, acting)',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Per assignment change',
          timing: 'Hire, promotion, transfer',
          benchmark: 'Multi-position support'
        }
      },
      {
        id: 'wf-sec-4-5',
        sectionNumber: '4.5',
        title: 'Assignment Types',
        description: 'Permanent, contract, temporary, secondment configurations',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup, policy updates',
          timing: 'Pre-employee assignment',
          benchmark: 'Employment type compliance'
        }
      },
      {
        id: 'wf-sec-4-6',
        sectionNumber: '4.6',
        title: 'Multi-Position Employees',
        description: 'Managing employees with concurrent positions, FTE split allocation',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'As needed for dual roles',
          timing: 'Complex org structures',
          benchmark: 'Weighted allocation (FTE split)'
        }
      },
      {
        id: 'wf-sec-4-7',
        sectionNumber: '4.7',
        title: 'Employee Transactions',
        description: 'Promotions, transfers, demotions, grade changes, transaction workflow',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Per transaction',
          timing: 'As needed',
          benchmark: 'Transaction audit trail'
        }
      },
      {
        id: 'wf-sec-4-8',
        sectionNumber: '4.8',
        title: 'Government IDs Management',
        description: 'ID documents, passport, permits, country-specific IDs, expiry tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Ops'],
        industryContext: {
          frequency: 'Per document, expiry alerts',
          timing: 'Onboarding, renewals',
          benchmark: 'Compliance alerts'
        }
      },
      {
        id: 'wf-sec-4-9',
        sectionNumber: '4.9',
        title: 'Immigration & Work Permits',
        description: 'Visa types, permit expiry, travel documents, work authorization',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Ops'],
        industryContext: {
          frequency: 'Expiry tracking',
          timing: 'Foreign workers',
          benchmark: 'Work authorization compliance'
        }
      },
      {
        id: 'wf-sec-4-10',
        sectionNumber: '4.10',
        title: 'Background Checks',
        description: 'Pre-employment screening, ongoing checks, verification status',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Ops'],
        industryContext: {
          frequency: 'Hire, periodic rescreening',
          timing: 'Pre-employment, compliance checks',
          benchmark: 'Background verification compliance'
        }
      },
      {
        id: 'wf-sec-4-11',
        sectionNumber: '4.11',
        title: 'References & Verifications',
        description: 'Reference check management, employment verification tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['HR Ops'],
        industryContext: {
          frequency: 'Per hire',
          timing: 'Pre-employment',
          benchmark: 'Due diligence standards'
        }
      },
      {
        id: 'wf-sec-4-12',
        sectionNumber: '4.12',
        title: 'Banking & Payment Setup',
        description: 'Bank account details, payment methods, pay group assignment',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Ops', 'Payroll'],
        industryContext: {
          frequency: 'Per employee, updates as needed',
          timing: 'Pre-first payroll',
          benchmark: 'Payroll integration'
        }
      },
      {
        id: 'wf-sec-4-13',
        sectionNumber: '4.13',
        title: 'Dependents & Beneficiaries',
        description: 'Family member records for benefits enrollment, relationship types',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Ops', 'Employee'],
        industryContext: {
          frequency: 'Life events',
          timing: 'Open enrollment, life changes',
          benchmark: 'Benefits integration'
        }
      },
      {
        id: 'wf-sec-4-14',
        sectionNumber: '4.14',
        title: 'Employee Benefits Enrollment',
        description: 'Benefits plan assignment, enrollment periods, coverage details',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Ops', 'Benefits Admin'],
        industryContext: {
          frequency: 'Open enrollment, life events',
          timing: 'Annual enrollment, qualifying events',
          benchmark: 'Benefits administration'
        }
      },
      {
        id: 'wf-sec-4-15',
        sectionNumber: '4.15',
        title: 'Medical Information',
        description: 'Emergency medical data, blood type, allergies, health conditions',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['HR Ops', 'H&S'],
        industryContext: {
          frequency: 'Initial capture, updates',
          timing: 'Onboarding',
          benchmark: 'H&S compliance'
        }
      },
      {
        id: 'wf-sec-4-16',
        sectionNumber: '4.16',
        title: 'Employee Languages',
        description: 'Language proficiency tracking, reading/writing/speaking levels',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['HR Ops', 'Employee'],
        industryContext: {
          frequency: 'Initial setup, updates',
          timing: 'Onboarding, skill reviews',
          benchmark: 'Multi-language workforce support'
        }
      },
      {
        id: 'wf-sec-4-17',
        sectionNumber: '4.17',
        title: 'Employee Skills & Competencies',
        description: 'Skill inventory, competency assessments, proficiency levels',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin', 'Manager'],
        industryContext: {
          frequency: 'Quarterly/annual review',
          timing: 'Performance cycles',
          benchmark: 'Competency-based talent management'
        }
      },
      {
        id: 'wf-sec-4-18',
        sectionNumber: '4.18',
        title: 'Skill Gap Analysis',
        description: 'Identifying skill gaps, development needs, learning recommendations',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin', 'L&D'],
        industryContext: {
          frequency: 'Periodic analysis',
          timing: 'Career planning, succession',
          benchmark: 'Skills-based workforce planning'
        }
      },
      {
        id: 'wf-sec-4-19',
        sectionNumber: '4.19',
        title: 'Credentials & Memberships',
        description: 'Professional memberships, industry credentials, association affiliations',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['HR Ops', 'Employee'],
        industryContext: {
          frequency: 'Periodic updates',
          timing: 'Renewals, new certifications',
          benchmark: 'Professional development tracking'
        }
      },
      {
        id: 'wf-sec-4-20',
        sectionNumber: '4.20',
        title: 'Employee Documents',
        description: 'Document management, document types, expiry tracking, compliance documents',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Ops'],
        industryContext: {
          frequency: 'Ongoing',
          timing: 'Hire, renewals, policy changes',
          benchmark: 'Document retention policies'
        }
      },
      {
        id: 'wf-sec-4-21',
        sectionNumber: '4.21',
        title: 'Agreements & Signatures',
        description: 'Employment agreements, policy acknowledgments, e-signature tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Ops'],
        industryContext: {
          frequency: 'Per agreement',
          timing: 'Hire, policy updates',
          benchmark: 'Legal compliance, e-signature'
        }
      },
      {
        id: 'wf-sec-4-22',
        sectionNumber: '4.22',
        title: 'Evidence Portfolio',
        description: 'Capability evidence, skill demonstrations, validation workflows',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin', 'Manager'],
        industryContext: {
          frequency: 'Ongoing collection',
          timing: 'Capability assessments',
          benchmark: 'Evidence-based competency validation'
        }
      },
      {
        id: 'wf-sec-4-23',
        sectionNumber: '4.23',
        title: 'Compliance & Legal',
        description: 'Legal compliance tracking, regulatory requirements, audit-ready records',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin', 'Compliance'],
        industryContext: {
          frequency: 'Ongoing monitoring',
          timing: 'Audit cycles',
          benchmark: 'Regulatory compliance'
        }
      },
      {
        id: 'wf-sec-4-24',
        sectionNumber: '4.24',
        title: 'Employee Interests & Preferences',
        description: 'Personal interests, hobbies, team building insights',
        contentLevel: 'procedure',
        estimatedReadTime: 4,
        targetRoles: ['Employee'],
        industryContext: {
          frequency: 'Employee-driven',
          timing: 'Optional, ongoing',
          benchmark: 'Employee engagement'
        }
      },
      {
        id: 'wf-sec-4-25',
        sectionNumber: '4.25',
        title: 'Country-Specific Data Extensions',
        description: 'Regional data requirements (Mexico payroll, Caribbean compliance, etc.)',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Ops', 'Payroll'],
        industryContext: {
          frequency: 'Per country',
          timing: 'Country-specific onboarding',
          benchmark: 'Regional compliance'
        }
      },
      {
        id: 'wf-sec-4-26',
        sectionNumber: '4.26',
        title: 'Employee Directory',
        description: 'Searchable directory with PII visibility controls, contact lookup',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Configuration once',
          timing: 'Post setup',
          benchmark: 'Privacy-aware search'
        }
      }
    ]
  },
  // Part 5: Employee Lifecycle Workflows
  {
    id: 'wf-part-5',
    sectionNumber: '5',
    title: 'Employee Lifecycle Workflows',
    description: 'Onboarding, offboarding, and lifecycle process management',
    contentLevel: 'procedure',
    estimatedReadTime: 80,
    targetRoles: ['HR Admin', 'HR Ops', 'Manager'],
    subsections: [
      {
        id: 'wf-sec-5-1',
        sectionNumber: '5.1',
        title: 'Lifecycle Overview',
        description: 'Hire-to-retire journey stages',
        contentLevel: 'overview',
        estimatedReadTime: 8,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Training',
          benchmark: 'Employee lifecycle management'
        }
      },
      {
        id: 'wf-sec-5-2',
        sectionNumber: '5.2',
        title: 'Onboarding Workflow Design',
        description: 'Creating onboarding templates with tasks and checklists',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup, periodic updates',
          timing: 'Pre-hiring',
          benchmark: '30-60-90 day onboarding plans'
        }
      },
      {
        id: 'wf-sec-5-3',
        sectionNumber: '5.3',
        title: 'Onboarding Task Management',
        description: 'HR, Manager, and Employee task assignments',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Ops'],
        industryContext: {
          frequency: 'Per new hire',
          timing: 'Pre-start to 90 days',
          benchmark: 'Multi-stakeholder coordination'
        }
      },
      {
        id: 'wf-sec-5-4',
        sectionNumber: '5.4',
        title: 'New Hire Portal (ESS)',
        description: 'Employee onboarding self-service experience',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Employee'],
        industryContext: {
          frequency: 'Per new hire',
          timing: 'Day one onwards',
          benchmark: 'Day-1 readiness'
        }
      },
      {
        id: 'wf-sec-5-5',
        sectionNumber: '5.5',
        title: 'Manager Onboarding View (MSS)',
        description: 'Manager oversight of new hire progress',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Manager'],
        industryContext: {
          frequency: 'Per new hire',
          timing: 'Pre-start to 90 days',
          benchmark: 'Team integration support'
        }
      },
      {
        id: 'wf-sec-5-6',
        sectionNumber: '5.6',
        title: 'Offboarding Workflow Design',
        description: 'Exit process templates, clearance checklists',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup, policy updates',
          timing: 'Pre-separations',
          benchmark: 'Knowledge transfer, asset recovery'
        }
      },
      {
        id: 'wf-sec-5-7',
        sectionNumber: '5.7',
        title: 'Exit Interview Integration',
        description: 'Automated exit interview scheduling',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Ops'],
        industryContext: {
          frequency: 'Per separation',
          timing: 'Notice period',
          benchmark: 'Turnover analysis'
        }
      },
      {
        id: 'wf-sec-5-8',
        sectionNumber: '5.8',
        title: 'Rehire Handling',
        description: 'Managing returning employees, historical data',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Rehire situations',
          benchmark: 'Seniority calculation'
        }
      },
      {
        id: 'wf-sec-5-9',
        sectionNumber: '5.9',
        title: 'Lifecycle Analytics',
        description: 'Onboarding completion rates, time-to-productivity',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Monthly/quarterly review',
          timing: 'Ongoing',
          benchmark: 'Lifecycle KPIs'
        }
      }
    ]
  },
  // Part 6: Position Control & Headcount Management
  {
    id: 'wf-part-6',
    sectionNumber: '6',
    title: 'Position Control & Headcount Management',
    description: 'Position-based planning, vacancy management, and workforce forecasting',
    contentLevel: 'procedure',
    estimatedReadTime: 70,
    targetRoles: ['HR Admin', 'Finance', 'Workforce Planner'],
    subsections: [
      {
        id: 'wf-sec-6-1',
        sectionNumber: '6.1',
        title: 'Position Control Overview',
        description: 'Position-based vs headcount-based planning',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Pre-implementation',
          benchmark: 'Enterprise position control'
        }
      },
      {
        id: 'wf-sec-6-2',
        sectionNumber: '6.2',
        title: 'Vacancy Management',
        description: 'Tracking open positions, time-to-fill',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Ongoing',
          timing: 'Recruitment cycle',
          benchmark: 'Recruitment pipeline integration'
        }
      },
      {
        id: 'wf-sec-6-3',
        sectionNumber: '6.3',
        title: 'Headcount Requests',
        description: 'Request workflow for new positions or backfills',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Manager', 'HR Admin'],
        industryContext: {
          frequency: 'Per request',
          timing: 'Budget cycle',
          benchmark: 'Approval routing, budget check'
        }
      },
      {
        id: 'wf-sec-6-4',
        sectionNumber: '6.4',
        title: 'Headcount Analytics Dashboard',
        description: 'Current vs budgeted headcount, variance analysis',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin', 'Executive'],
        industryContext: {
          frequency: 'Weekly/monthly review',
          timing: 'Ongoing',
          benchmark: 'Real-time workforce metrics'
        }
      },
      {
        id: 'wf-sec-6-5',
        sectionNumber: '6.5',
        title: 'AI-Powered Headcount Forecast',
        description: 'Predictive headcount modeling with scenarios',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Workforce Planner'],
        industryContext: {
          frequency: 'Quarterly/annual',
          timing: 'Planning cycles',
          benchmark: 'ML-based workforce prediction'
        }
      },
      {
        id: 'wf-sec-6-6',
        sectionNumber: '6.6',
        title: 'Scenario Planning',
        description: 'What-if analysis for restructuring',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin', 'Executive'],
        industryContext: {
          frequency: 'Strategic planning',
          timing: 'Org changes',
          benchmark: 'Cost impact simulation'
        }
      },
      {
        id: 'wf-sec-6-7',
        sectionNumber: '6.7',
        title: 'Budget Integration',
        description: 'Linking headcount to financial budgets',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Finance', 'HR Admin'],
        industryContext: {
          frequency: 'Budget cycle',
          timing: 'Fiscal year planning',
          benchmark: 'Finance system alignment'
        }
      },
      {
        id: 'wf-sec-6-8',
        sectionNumber: '6.8',
        title: 'Freeze & Thaw Controls',
        description: 'Implementing hiring freezes with exceptions',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['HR Admin', 'Executive'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Economic conditions',
          benchmark: 'Org-wide controls'
        }
      }
    ]
  },
  // Part 7: Workforce Analytics & Reporting
  {
    id: 'wf-part-7',
    sectionNumber: '7',
    title: 'Workforce Analytics & Reporting',
    description: 'Dashboards, forecasting, and custom reporting capabilities',
    contentLevel: 'reference',
    estimatedReadTime: 50,
    targetRoles: ['HR Admin', 'HRBP', 'Executive'],
    subsections: [
      {
        id: 'wf-sec-7-1',
        sectionNumber: '7.1',
        title: 'Workforce Analytics Dashboard',
        description: 'Key metrics: headcount, turnover, diversity',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Daily/weekly',
          timing: 'Ongoing',
          benchmark: 'Executive-level insights'
        }
      },
      {
        id: 'wf-sec-7-2',
        sectionNumber: '7.2',
        title: 'Org Changes Reporting',
        description: 'Historical org structure changes, audit trail',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Audits, reviews',
          benchmark: 'Change tracking for compliance'
        }
      },
      {
        id: 'wf-sec-7-3',
        sectionNumber: '7.3',
        title: 'Workforce Forecasting',
        description: 'Attrition prediction, growth modeling',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Workforce Planner'],
        industryContext: {
          frequency: 'Quarterly',
          timing: 'Planning cycles',
          benchmark: 'AI-powered predictions'
        }
      },
      {
        id: 'wf-sec-7-4',
        sectionNumber: '7.4',
        title: 'Scheduled Reports Configuration',
        description: 'Setting up automated report delivery',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup',
          timing: 'Post go-live',
          benchmark: 'Stakeholder communication'
        }
      },
      {
        id: 'wf-sec-7-5',
        sectionNumber: '7.5',
        title: 'Custom Report Builder',
        description: 'Building ad-hoc workforce reports',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Ad-hoc requests',
          benchmark: 'Self-service reporting'
        }
      },
      {
        id: 'wf-sec-7-6',
        sectionNumber: '7.6',
        title: 'BI Integration',
        description: 'Connecting to external BI tools',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'IT'],
        industryContext: {
          frequency: 'One-time setup',
          timing: 'Post go-live',
          benchmark: 'Power BI, Tableau connectors'
        }
      }
    ]
  },
  // Part 8: ESS & MSS Workforce Features
  {
    id: 'wf-part-8',
    sectionNumber: '8',
    title: 'ESS & MSS Workforce Features',
    description: 'Employee and Manager self-service workforce capabilities',
    contentLevel: 'procedure',
    estimatedReadTime: 45,
    targetRoles: ['Employee', 'Manager', 'HR Admin'],
    subsections: [
      {
        id: 'wf-sec-8-1',
        sectionNumber: '8.1',
        title: 'Employee Self-Service Overview',
        description: 'ESS modules for workforce data',
        contentLevel: 'overview',
        estimatedReadTime: 5,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Training',
          benchmark: 'Employee empowerment'
        }
      },
      {
        id: 'wf-sec-8-2',
        sectionNumber: '8.2',
        title: 'My Profile & Personal Info (ESS)',
        description: 'Updating personal details, addresses, contacts',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Employee'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Life events',
          benchmark: 'Employee-owned data'
        }
      },
      {
        id: 'wf-sec-8-3',
        sectionNumber: '8.3',
        title: 'My Qualifications (ESS)',
        description: 'Adding certifications, education, licenses',
        contentLevel: 'procedure',
        estimatedReadTime: 5,
        targetRoles: ['Employee'],
        industryContext: {
          frequency: 'Career progression',
          timing: 'Skill updates',
          benchmark: 'Skill inventory self-update'
        }
      },
      {
        id: 'wf-sec-8-4',
        sectionNumber: '8.4',
        title: 'My Transactions History (ESS)',
        description: 'Viewing employment history, role changes',
        contentLevel: 'procedure',
        estimatedReadTime: 4,
        targetRoles: ['Employee'],
        industryContext: {
          frequency: 'Reference',
          timing: 'As needed',
          benchmark: 'Transparency'
        }
      },
      {
        id: 'wf-sec-8-5',
        sectionNumber: '8.5',
        title: 'My Career Paths (ESS)',
        description: 'Exploring progression opportunities',
        contentLevel: 'procedure',
        estimatedReadTime: 5,
        targetRoles: ['Employee'],
        industryContext: {
          frequency: 'Career planning',
          timing: 'Development cycles',
          benchmark: 'Career planning'
        }
      },
      {
        id: 'wf-sec-8-6',
        sectionNumber: '8.6',
        title: 'Manager Team View (MSS)',
        description: 'Viewing and managing direct reports',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Manager'],
        industryContext: {
          frequency: 'Daily',
          timing: 'Ongoing',
          benchmark: 'Team management hub'
        }
      },
      {
        id: 'wf-sec-8-7',
        sectionNumber: '8.7',
        title: 'Team Onboarding Oversight (MSS)',
        description: 'Manager tasks for new hires',
        contentLevel: 'procedure',
        estimatedReadTime: 5,
        targetRoles: ['Manager'],
        industryContext: {
          frequency: 'Per new hire',
          timing: 'Onboarding period',
          benchmark: 'Manager accountability'
        }
      },
      {
        id: 'wf-sec-8-8',
        sectionNumber: '8.8',
        title: 'Team Offboarding Oversight (MSS)',
        description: 'Managing departing team members',
        contentLevel: 'procedure',
        estimatedReadTime: 5,
        targetRoles: ['Manager'],
        industryContext: {
          frequency: 'Per separation',
          timing: 'Notice period',
          benchmark: 'Exit process management'
        }
      },
      {
        id: 'wf-sec-8-9',
        sectionNumber: '8.9',
        title: 'Recruitment Integration (MSS)',
        description: 'Participating in hiring for team',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Manager'],
        industryContext: {
          frequency: 'Per vacancy',
          timing: 'Recruitment cycle',
          benchmark: 'Manager involvement'
        }
      }
    ]
  },
  // Part 9: Integration & Cross-Module Impacts
  {
    id: 'wf-part-9',
    sectionNumber: '9',
    title: 'Integration & Cross-Module Impacts',
    description: 'How workforce data flows to and from other HR modules',
    contentLevel: 'reference',
    estimatedReadTime: 55,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      {
        id: 'wf-sec-9-1',
        sectionNumber: '9.1',
        title: 'Integration Overview',
        description: 'How workforce data flows to other modules',
        contentLevel: 'overview',
        estimatedReadTime: 6,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Implementation',
          benchmark: 'Enterprise data ecosystem'
        }
      },
      {
        id: 'wf-sec-9-2',
        sectionNumber: '9.2',
        title: 'Recruitment Integration',
        description: 'Position requisitions, new hire data flow',
        contentLevel: 'reference',
        estimatedReadTime: 6,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Per hire',
          timing: 'Recruitment to onboarding',
          benchmark: 'Talent acquisition pipeline'
        }
      },
      {
        id: 'wf-sec-9-3',
        sectionNumber: '9.3',
        title: 'Payroll Integration',
        description: 'Employee master data for payroll processing',
        contentLevel: 'reference',
        estimatedReadTime: 6,
        targetRoles: ['HR Admin', 'Payroll'],
        industryContext: {
          frequency: 'Payroll cycles',
          timing: 'Ongoing',
          benchmark: 'Pay calculation dependencies'
        }
      },
      {
        id: 'wf-sec-9-4',
        sectionNumber: '9.4',
        title: 'Benefits Integration',
        description: 'Eligibility based on position and employment type',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Life events, enrollment',
          timing: 'Open enrollment',
          benchmark: 'Benefits enrollment triggers'
        }
      },
      {
        id: 'wf-sec-9-5',
        sectionNumber: '9.5',
        title: 'Leave & Time Integration',
        description: 'Position-based leave policies, shift assignments',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Policy setup',
          timing: 'Implementation',
          benchmark: 'Absence management alignment'
        }
      },
      {
        id: 'wf-sec-9-6',
        sectionNumber: '9.6',
        title: 'Performance Integration',
        description: 'Position-based appraisal forms, job competencies',
        contentLevel: 'reference',
        estimatedReadTime: 6,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Appraisal cycles',
          timing: 'Review periods',
          benchmark: 'Performance review setup'
        }
      },
      {
        id: 'wf-sec-9-7',
        sectionNumber: '9.7',
        title: 'Learning & Development',
        description: 'Job-role training requirements, competency gaps',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['HR Admin', 'L&D'],
        industryContext: {
          frequency: 'Skill updates',
          timing: 'Learning cycles',
          benchmark: 'LMS course assignments'
        }
      },
      {
        id: 'wf-sec-9-8',
        sectionNumber: '9.8',
        title: 'Compensation Integration',
        description: 'Position grades, salary bands, compa-ratio',
        contentLevel: 'reference',
        estimatedReadTime: 6,
        targetRoles: ['HR Admin', 'Compensation'],
        industryContext: {
          frequency: 'Merit cycles',
          timing: 'Compensation reviews',
          benchmark: 'Merit and equity processing'
        }
      },
      {
        id: 'wf-sec-9-9',
        sectionNumber: '9.9',
        title: 'Succession Planning',
        description: 'Position criticality, successor identification',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Annual review',
          timing: 'Talent reviews',
          benchmark: 'Talent pipeline'
        }
      },
      {
        id: 'wf-sec-9-10',
        sectionNumber: '9.10',
        title: 'Notification Orchestration',
        description: 'Automated alerts for org changes, approvals',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Configuration',
          timing: 'Implementation',
          benchmark: 'Event-driven notifications'
        }
      }
    ]
  },
  // Part 10: Troubleshooting & Best Practices
  {
    id: 'wf-part-10',
    sectionNumber: '10',
    title: 'Troubleshooting & Best Practices',
    description: 'Common issues, resolution guides, and industry best practices',
    contentLevel: 'troubleshooting',
    estimatedReadTime: 60,
    targetRoles: ['All'],
    subsections: [
      {
        id: 'wf-sec-10-1',
        sectionNumber: '10.1',
        title: 'Common Configuration Issues',
        description: 'Org hierarchy, position assignment, data sync problems',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Issue resolution',
          benchmark: 'Root cause analysis'
        }
      },
      {
        id: 'wf-sec-10-2',
        sectionNumber: '10.2',
        title: 'Employee Data Problems',
        description: 'Duplicate records, missing assignments, sync failures',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 10,
        targetRoles: ['HR Ops'],
        industryContext: {
          frequency: 'Data quality issues',
          timing: 'Issue resolution',
          benchmark: 'Data quality remediation'
        }
      },
      {
        id: 'wf-sec-10-3',
        sectionNumber: '10.3',
        title: 'Lifecycle Workflow Issues',
        description: 'Stalled onboarding, incomplete offboarding',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 8,
        targetRoles: ['HR Ops'],
        industryContext: {
          frequency: 'Process problems',
          timing: 'Issue resolution',
          benchmark: 'Process troubleshooting'
        }
      },
      {
        id: 'wf-sec-10-4',
        sectionNumber: '10.4',
        title: 'Best Practices Guide',
        description: 'Industry-validated org design and data governance',
        contentLevel: 'reference',
        estimatedReadTime: 12,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Continuous improvement',
          benchmark: 'Workday/SAP benchmarks'
        }
      },
      {
        id: 'wf-sec-10-5',
        sectionNumber: '10.5',
        title: 'Security & Access Control',
        description: 'Permission configuration, RLS policies, PII protection',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Configuration',
          timing: 'Implementation',
          benchmark: 'RBAC, data privacy'
        }
      },
      {
        id: 'wf-sec-10-6',
        sectionNumber: '10.6',
        title: 'Compliance & Audit Checklist',
        description: 'Regional labor law, data residency, audit documentation',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Compliance'],
        industryContext: {
          frequency: 'Audits',
          timing: 'Compliance reviews',
          benchmark: 'Caribbean, Africa, Global compliance'
        }
      },
      {
        id: 'wf-sec-10-7',
        sectionNumber: '10.7',
        title: 'Performance Optimization',
        description: 'Large org handling, bulk operations',
        contentLevel: 'reference',
        estimatedReadTime: 6,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Scale issues',
          timing: 'Growth phases',
          benchmark: 'Sub-3s page load targets'
        }
      },
      {
        id: 'wf-sec-10-8',
        sectionNumber: '10.8',
        title: 'Escalation Procedures',
        description: 'Support tiers, SLA expectations',
        contentLevel: 'reference',
        estimatedReadTime: 6,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Support needs',
          benchmark: 'Enterprise support model'
        }
      }
    ]
  }
];

// Quick Reference Cards for Workforce Manual
export const WORKFORCE_QUICK_REFERENCE_CARDS = [
  {
    id: 'wf-qr-org-levels',
    title: 'Organization Hierarchy Levels',
    category: 'Structure',
    summary: 'Territory → Company Group → Company → Division → Department → Section',
    items: [
      { term: 'Territory', definition: 'Geographic region (e.g., Caribbean, Africa)' },
      { term: 'Company Group', definition: 'Holding company for consolidated reporting' },
      { term: 'Company', definition: 'Legal entity with tax/labor registration' },
      { term: 'Division', definition: 'Optional layer for large enterprises (500+)' },
      { term: 'Department', definition: 'Business unit with cost center' },
      { term: 'Section', definition: 'Sub-department team grouping' }
    ]
  },
  {
    id: 'wf-qr-job-vs-position',
    title: 'Position vs Job vs Employee',
    category: 'Concepts',
    summary: 'Understanding the core workforce entities',
    items: [
      { term: 'Job', definition: 'Generic role definition (e.g., Software Engineer)' },
      { term: 'Position', definition: 'Specific seat in org (e.g., SE in Finance Dept)' },
      { term: 'Employee', definition: 'Person assigned to position(s)' },
      { term: 'Assignment', definition: 'Link between employee and position' },
      { term: 'FTE', definition: 'Full-Time Equivalent (100% = 1.0 FTE)' }
    ]
  },
  {
    id: 'wf-qr-transaction-types',
    title: 'Employee Transaction Types',
    category: 'Transactions',
    summary: 'Common employment changes and their triggers',
    items: [
      { term: 'Hire', definition: 'New employee creation with initial assignment' },
      { term: 'Promotion', definition: 'Grade/level increase, may include job change' },
      { term: 'Transfer', definition: 'Department or location change' },
      { term: 'Demotion', definition: 'Grade/level decrease' },
      { term: 'Separation', definition: 'Employment end (voluntary/involuntary)' },
      { term: 'Rehire', definition: 'Former employee returning' }
    ]
  },
  {
    id: 'wf-qr-ess-mss-actions',
    title: 'ESS/MSS Quick Actions',
    category: 'Self-Service',
    summary: 'Common self-service actions for employees and managers',
    items: [
      { term: 'ESS: Update Profile', definition: 'Personal info, contacts, addresses' },
      { term: 'ESS: Add Qualification', definition: 'Certifications, degrees, licenses' },
      { term: 'ESS: View History', definition: 'Employment transactions timeline' },
      { term: 'MSS: View Team', definition: 'Direct reports and org chart' },
      { term: 'MSS: Onboarding', definition: 'New hire task completion' },
      { term: 'MSS: Offboarding', definition: 'Exit process management' }
    ]
  }
];
