// Time and Attendance Administrator Manual Types - Enterprise-grade documentation structure
// Follows the same pattern as workforceManual.ts

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

// Time and Attendance Manual Structure - 10 Parts
export const TIME_ATTENDANCE_MANUAL_STRUCTURE: ManualSection[] = [
  // Part 1: Module Overview & Conceptual Foundation
  {
    id: 'ta-part-1',
    sectionNumber: '1',
    title: 'Module Overview & Conceptual Foundation',
    description: 'Introduction to Time and Attendance, core concepts, and system architecture',
    contentLevel: 'overview',
    estimatedReadTime: 35,
    targetRoles: ['All'],
    subsections: [
      {
        id: 'ta-sec-1-1',
        sectionNumber: '1.1',
        title: 'Introduction to Time and Attendance',
        description: 'Executive summary, business value, and key differentiators',
        contentLevel: 'overview',
        estimatedReadTime: 8,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Initial onboarding',
          benchmark: 'Enterprise time management standards (Kronos, ADP)'
        }
      },
      {
        id: 'ta-sec-1-2',
        sectionNumber: '1.2',
        title: 'Core Concepts & Terminology',
        description: 'Clock entries, shifts, schedules, timesheets, attendance policies',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin', 'Time Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Initial onboarding',
          benchmark: 'Industry standard time tracking principles'
        }
      },
      {
        id: 'ta-sec-1-3',
        sectionNumber: '1.3',
        title: 'System Architecture',
        description: 'Data model, integration points with Payroll and Workforce',
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
        id: 'ta-sec-1-4',
        sectionNumber: '1.4',
        title: 'User Personas & Journeys',
        description: 'HR Admin, Time Admin, Manager (MSS), Employee (ESS) workflows',
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
        id: 'ta-sec-1-5',
        sectionNumber: '1.5',
        title: 'Time Management Calendar',
        description: 'Pay periods, submission deadlines, audit cycles, compliance dates',
        contentLevel: 'overview',
        estimatedReadTime: 6,
        targetRoles: ['HR Admin', 'Time Admin'],
        industryContext: {
          frequency: 'Annual planning',
          timing: 'Fiscal year alignment',
          benchmark: 'Industry-standard payroll calendar'
        }
      },
      {
        id: 'ta-sec-1-6',
        sectionNumber: '1.6',
        title: 'Legacy Migration Guide',
        description: 'Data migration strategies, entity mapping, validation checklists',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time implementation',
          timing: 'Go-live preparation',
          benchmark: 'Enterprise data migration standards'
        }
      },
      {
        id: 'ta-sec-1-7',
        sectionNumber: '1.7',
        title: 'Terminology Index (A-Z)',
        description: 'Alphabetical quick reference to all T&A terms with database table mappings',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Ongoing',
          benchmark: 'UKG/Workday style term index'
        }
      },
      {
        id: 'ta-sec-1-8',
        sectionNumber: '1.8',
        title: 'Security & Authorization Model',
        description: 'Role-based access control, sensitive operations, audit trail coverage',
        contentLevel: 'reference',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'Compliance Officer', 'Consultant'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Implementation and audits',
          benchmark: 'Enterprise security documentation standards'
        }
      }
    ]
  },
  // Part 2: Foundation Setup
  {
    id: 'ta-part-2',
    sectionNumber: '2',
    title: 'Foundation Setup',
    description: 'Time policies, devices, geofencing, governance, and advanced configuration',
    contentLevel: 'procedure',
    estimatedReadTime: 120,
    targetRoles: ['Super Admin', 'Time Admin', 'Consultant'],
    subsections: [
      // A. Prerequisites
      {
        id: 'ta-sec-2-1',
        sectionNumber: '2.1',
        title: 'Prerequisites Checklist',
        description: 'Dependencies, data requirements, Workforce module integration',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time during implementation',
          timing: '2-4 weeks before go-live',
          benchmark: 'Implementation readiness checklist'
        }
      },
      // B. Core Policies
      {
        id: 'ta-sec-2-2',
        sectionNumber: '2.2',
        title: 'Attendance Policies Configuration',
        description: 'Rounding rules, grace periods, overtime thresholds, break policies',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Time Admin'],
        industryContext: {
          frequency: 'Initial setup, policy updates',
          timing: 'Pre-deployment',
          benchmark: 'Labor law compliance'
        }
      },
      {
        id: 'ta-sec-2-3',
        sectionNumber: '2.3',
        title: 'Policy Assignments',
        description: 'Assigning policies to employees, departments, locations, and jobs',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Time Admin'],
        industryContext: {
          frequency: 'Initial setup, org changes',
          timing: 'Post-policy creation',
          benchmark: 'Hierarchical policy assignment'
        }
      },
      {
        id: 'ta-sec-2-4',
        sectionNumber: '2.4',
        title: 'Overtime Rate Tiers',
        description: 'Tiered overtime multipliers, daily/weekly thresholds, holiday premiums',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Time Admin', 'Payroll Admin'],
        industryContext: {
          frequency: 'Initial setup, policy updates',
          timing: 'Pre-payroll integration',
          benchmark: 'Multi-tier OT calculation'
        }
      },
      // C. Time Collection
      {
        id: 'ta-sec-2-5',
        sectionNumber: '2.5',
        title: 'Timeclock Devices Setup',
        description: 'Biometric readers, card readers, mobile app, web clock configuration',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['IT Admin', 'Time Admin'],
        industryContext: {
          frequency: 'Initial setup, device additions',
          timing: 'Pre-deployment',
          benchmark: 'Multi-device attendance capture'
        }
      },
      {
        id: 'ta-sec-2-6',
        sectionNumber: '2.6',
        title: 'Biometric Templates',
        description: 'Fingerprint, card, PIN, and mobile token enrollment',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['IT Admin', 'Time Admin'],
        industryContext: {
          frequency: 'Per employee enrollment',
          timing: 'Post-device setup',
          benchmark: 'Multi-factor authentication'
        }
      },
      {
        id: 'ta-sec-2-7',
        sectionNumber: '2.7',
        title: 'Face Verification Setup',
        description: 'AI face recognition enrollment, matching thresholds, liveness detection',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Time Admin', 'IT Admin'],
        industryContext: {
          frequency: 'Initial setup',
          timing: 'Pre-deployment',
          benchmark: 'Biometric attendance verification'
        }
      },
      {
        id: 'ta-sec-2-8',
        sectionNumber: '2.8',
        title: 'Punch Import Configuration',
        description: 'External system imports, legacy data migration, batch processing',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['IT Admin', 'Time Admin'],
        industryContext: {
          frequency: 'Implementation, ongoing imports',
          timing: 'Data migration phase',
          benchmark: 'Third-party device integration'
        }
      },
      // D. Location Validation
      {
        id: 'ta-sec-2-9',
        sectionNumber: '2.9',
        title: 'Geofencing Configuration',
        description: 'GPS-based clock-in validation, location boundaries, remote work zones',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Time Admin'],
        industryContext: {
          frequency: 'Per location setup',
          timing: 'Post-branch setup',
          benchmark: 'Location-verified attendance'
        }
      },
      {
        id: 'ta-sec-2-10',
        sectionNumber: '2.10',
        title: 'Employee Geofence Assignments',
        description: 'Linking employees to work locations, home offices, and client sites',
        contentLevel: 'procedure',
        estimatedReadTime: 7,
        targetRoles: ['Time Admin'],
        industryContext: {
          frequency: 'Per employee assignment',
          timing: 'Post-geofence creation',
          benchmark: 'Multi-location workforce'
        }
      },
      // E. Time Banking
      {
        id: 'ta-sec-2-11',
        sectionNumber: '2.11',
        title: 'Comp Time Policies',
        description: 'Compensatory time accrual, balances, expiration, and usage rules',
        contentLevel: 'procedure',
        estimatedReadTime: 9,
        targetRoles: ['Time Admin', 'HR Admin'],
        industryContext: {
          frequency: 'Initial setup, policy updates',
          timing: 'Pre-deployment',
          benchmark: 'Time-off-in-lieu programs'
        }
      },
      {
        id: 'ta-sec-2-12',
        sectionNumber: '2.12',
        title: 'Flex Time Configuration',
        description: 'Flexible working hours, core time, flex bands, and balance tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 9,
        targetRoles: ['Time Admin', 'HR Admin'],
        industryContext: {
          frequency: 'Initial setup, policy updates',
          timing: 'Pre-deployment',
          benchmark: 'Flexible work arrangements'
        }
      },
      // F. Governance
      {
        id: 'ta-sec-2-13',
        sectionNumber: '2.13',
        title: 'Timekeeper Delegation',
        description: 'Assigning time administrators, delegation scope, and approval authority',
        contentLevel: 'procedure',
        estimatedReadTime: 7,
        targetRoles: ['HR Admin', 'Time Admin'],
        industryContext: {
          frequency: 'Initial setup, org changes',
          timing: 'Pre-deployment',
          benchmark: 'Decentralized time management'
        }
      },
      {
        id: 'ta-sec-2-14',
        sectionNumber: '2.14',
        title: 'Audit Trail Configuration',
        description: 'Logging time-sensitive operations, retention policies, compliance reporting',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Compliance Officer'],
        industryContext: {
          frequency: 'Initial setup',
          timing: 'Pre-deployment',
          benchmark: 'SOX/labor law compliance'
        }
      },
      // G. Advanced
      {
        id: 'ta-sec-2-15',
        sectionNumber: '2.15',
        title: 'CBA/Union Time Rules',
        description: 'Collective bargaining agreement overtime, scheduling, and seniority rules',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin', 'Time Admin'],
        industryContext: {
          frequency: 'Per CBA agreement',
          timing: 'Contract negotiation',
          benchmark: 'Union compliance'
        }
      }
    ]
  },
  // Part 3: Shift Management
  {
    id: 'ta-part-3',
    sectionNumber: '3',
    title: 'Shift Management',
    description: 'Shift templates, schedules, rotation patterns, differentials, and payment rules',
    contentLevel: 'procedure',
    estimatedReadTime: 70,
    targetRoles: ['Time Admin', 'HR Admin'],
    subsections: [
      {
        id: 'ta-sec-3-1',
        sectionNumber: '3.1',
        title: 'Shift Architecture Overview',
        description: 'Shift types, templates, schedules hierarchy explained',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Pre-implementation',
          benchmark: 'Shift scheduling best practices'
        }
      },
      {
        id: 'ta-sec-3-2',
        sectionNumber: '3.2',
        title: 'Shift Templates Configuration',
        description: 'Creating reusable shift patterns with start/end times, breaks',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Time Admin'],
        industryContext: {
          frequency: 'Initial setup, periodic updates',
          timing: 'Pre-scheduling',
          benchmark: 'Template-driven scheduling'
        }
      },
      {
        id: 'ta-sec-3-3',
        sectionNumber: '3.3',
        title: 'Shift Schedules Creation',
        description: 'Building weekly/monthly schedules from templates',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Time Admin', 'Manager'],
        industryContext: {
          frequency: 'Weekly/monthly',
          timing: 'Scheduling cycle',
          benchmark: 'Operational scheduling'
        }
      },
      {
        id: 'ta-sec-3-4',
        sectionNumber: '3.4',
        title: 'Rotation Patterns Setup',
        description: 'Configuring 4x4, 5x2, Panama, and custom rotation patterns',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Time Admin'],
        industryContext: {
          frequency: 'Per rotation type',
          timing: 'Initial setup',
          benchmark: 'Industry rotation patterns'
        }
      },
      {
        id: 'ta-sec-3-5',
        sectionNumber: '3.5',
        title: 'Shift Assignments',
        description: 'Assigning employees to shifts, bulk assignments, eligibility rules',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Time Admin', 'Manager'],
        industryContext: {
          frequency: 'Per schedule period',
          timing: 'Scheduling cycle',
          benchmark: 'Skill-based assignment'
        }
      },
      {
        id: 'ta-sec-3-6',
        sectionNumber: '3.6',
        title: 'Shift Differentials',
        description: 'Night, weekend, holiday premium pay configuration',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Time Admin', 'Payroll Admin'],
        industryContext: {
          frequency: 'Initial setup, policy updates',
          timing: 'Pre-payroll integration',
          benchmark: 'Premium pay compliance'
        }
      },
      {
        id: 'ta-sec-3-7',
        sectionNumber: '3.7',
        title: 'Rounding Rules Configuration',
        description: 'Clock punch rounding, nearest increment, grace period settings',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Time Admin'],
        industryContext: {
          frequency: 'Initial setup',
          timing: 'Pre-deployment',
          benchmark: 'Labor law rounding compliance'
        }
      },
      {
        id: 'ta-sec-3-8',
        sectionNumber: '3.8',
        title: 'Payment Rules Setup',
        description: 'Regular, overtime, double-time calculation rules per policy',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Time Admin', 'Payroll Admin'],
        industryContext: {
          frequency: 'Initial setup, policy updates',
          timing: 'Pre-payroll integration',
          benchmark: 'Pay calculation accuracy'
        }
      }
    ]
  },
  // Part 4: Daily Operations
  {
    id: 'ta-part-4',
    sectionNumber: '4',
    title: 'Daily Operations',
    description: 'Time tracking, clock in/out, attendance records, exceptions, and flex time',
    contentLevel: 'procedure',
    estimatedReadTime: 60,
    targetRoles: ['Time Admin', 'HR Ops', 'Manager'],
    subsections: [
      {
        id: 'ta-sec-4-1',
        sectionNumber: '4.1',
        title: 'Time Tracking Overview',
        description: 'Understanding the daily attendance capture workflow',
        contentLevel: 'concept',
        estimatedReadTime: 6,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Training',
          benchmark: 'Time tracking fundamentals'
        }
      },
      {
        id: 'ta-sec-4-2',
        sectionNumber: '4.2',
        title: 'Clock In/Out Procedures',
        description: 'Multi-method clock-in (device, mobile, web), validation rules',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Employee', 'Manager'],
        industryContext: {
          frequency: 'Daily',
          timing: 'Shift start/end',
          benchmark: 'Accurate time capture'
        }
      },
      {
        id: 'ta-sec-4-3',
        sectionNumber: '4.3',
        title: 'Attendance Records Management',
        description: 'Viewing, editing, and auditing attendance records',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Time Admin', 'HR Ops'],
        industryContext: {
          frequency: 'Daily review',
          timing: 'Post-shift',
          benchmark: 'Record accuracy'
        }
      },
      {
        id: 'ta-sec-4-4',
        sectionNumber: '4.4',
        title: 'Live Attendance Dashboard',
        description: 'Real-time attendance monitoring, who\'s in/out, late arrivals',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Time Admin', 'Manager'],
        industryContext: {
          frequency: 'Real-time',
          timing: 'Throughout day',
          benchmark: 'Operational visibility'
        }
      },
      {
        id: 'ta-sec-4-5',
        sectionNumber: '4.5',
        title: 'Attendance Exceptions Handling',
        description: 'Missed punches, early departures, unauthorized overtime alerts',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Time Admin', 'Manager'],
        industryContext: {
          frequency: 'Daily',
          timing: 'Exception resolution',
          benchmark: 'Exception management'
        }
      },
      {
        id: 'ta-sec-4-6',
        sectionNumber: '4.6',
        title: 'Regularization Requests',
        description: 'Employee-initiated attendance corrections, approval workflow',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Employee', 'Manager'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Post-exception',
          benchmark: 'Correction audit trail'
        }
      },
      {
        id: 'ta-sec-4-7',
        sectionNumber: '4.7',
        title: 'Flex Time Management',
        description: 'Flexible work hours, core hours, flex balance tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Time Admin', 'Employee'],
        industryContext: {
          frequency: 'Policy-driven',
          timing: 'Flex time policies',
          benchmark: 'Flexible work arrangements'
        }
      }
    ]
  },
  // Part 5: Advanced Scheduling
  {
    id: 'ta-part-5',
    sectionNumber: '5',
    title: 'Advanced Scheduling',
    description: 'AI scheduler, open shifts, shift bidding, coverage, and fatigue management',
    contentLevel: 'procedure',
    estimatedReadTime: 65,
    targetRoles: ['Time Admin', 'Manager'],
    subsections: [
      {
        id: 'ta-sec-5-1',
        sectionNumber: '5.1',
        title: 'AI-Powered Scheduler',
        description: 'Automated schedule optimization using AI, constraint configuration',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Time Admin'],
        industryContext: {
          frequency: 'Per schedule cycle',
          timing: 'Schedule generation',
          benchmark: 'AI-driven optimization'
        }
      },
      {
        id: 'ta-sec-5-2',
        sectionNumber: '5.2',
        title: 'Open Shift Board',
        description: 'Publishing unfilled shifts, employee visibility, self-assignment',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Time Admin', 'Employee'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Coverage gaps',
          benchmark: 'Shift marketplace'
        }
      },
      {
        id: 'ta-sec-5-3',
        sectionNumber: '5.3',
        title: 'Shift Bidding and Swaps',
        description: 'Employee shift preferences, swap requests, approval workflow',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Employee', 'Manager'],
        industryContext: {
          frequency: 'Per schedule cycle',
          timing: 'Pre-schedule finalization',
          benchmark: 'Employee preference management'
        }
      },
      {
        id: 'ta-sec-5-4',
        sectionNumber: '5.4',
        title: 'Shift Coverage Management',
        description: 'Minimum staffing requirements, coverage gap alerts, callouts',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Time Admin', 'Manager'],
        industryContext: {
          frequency: 'Daily monitoring',
          timing: 'Operational coverage',
          benchmark: 'Staffing optimization'
        }
      },
      {
        id: 'ta-sec-5-5',
        sectionNumber: '5.5',
        title: 'Multi-Location Scheduling',
        description: 'Cross-location assignments, travel time, location eligibility',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Time Admin'],
        industryContext: {
          frequency: 'Multi-site operations',
          timing: 'Cross-location needs',
          benchmark: 'Multi-site workforce'
        }
      },
      {
        id: 'ta-sec-5-6',
        sectionNumber: '5.6',
        title: 'Fatigue Management',
        description: 'Rest period enforcement, maximum hours, consecutive day limits',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Time Admin', 'Compliance'],
        industryContext: {
          frequency: 'Compliance monitoring',
          timing: 'Scheduling validation',
          benchmark: 'Fatigue risk management'
        }
      },
      {
        id: 'ta-sec-5-7',
        sectionNumber: '5.7',
        title: 'Shift Calendar Views',
        description: 'Team calendar, department view, individual schedule view',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Daily reference',
          timing: 'Schedule viewing',
          benchmark: 'Visual schedule management'
        }
      }
    ]
  },
  // Part 6: Project Time Tracking
  {
    id: 'ta-part-6',
    sectionNumber: '6',
    title: 'Project Time Tracking',
    description: 'Project setup, time entry, cost allocation, and timesheet approvals',
    contentLevel: 'procedure',
    estimatedReadTime: 55,
    targetRoles: ['Time Admin', 'Project Manager', 'Finance'],
    subsections: [
      {
        id: 'ta-sec-6-1',
        sectionNumber: '6.1',
        title: 'Project Time Overview',
        description: 'Understanding project-based time tracking and billing',
        contentLevel: 'concept',
        estimatedReadTime: 6,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Training',
          benchmark: 'Professional services time tracking'
        }
      },
      {
        id: 'ta-sec-6-2',
        sectionNumber: '6.2',
        title: 'Project Setup and Allocation',
        description: 'Creating projects, phases, tasks, and employee assignments',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Project Manager', 'Time Admin'],
        industryContext: {
          frequency: 'Per project',
          timing: 'Project initiation',
          benchmark: 'WBS integration'
        }
      },
      {
        id: 'ta-sec-6-3',
        sectionNumber: '6.3',
        title: 'Time Entry to Projects',
        description: 'Logging time against projects, tasks, and activities',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Employee'],
        industryContext: {
          frequency: 'Daily/weekly',
          timing: 'Time entry cycle',
          benchmark: 'Accurate project costing'
        }
      },
      {
        id: 'ta-sec-6-4',
        sectionNumber: '6.4',
        title: 'Cost Configuration',
        description: 'Hourly rates, cost rates, billing rates, rate effective dates',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Finance', 'Project Manager'],
        industryContext: {
          frequency: 'Initial setup, rate changes',
          timing: 'Pre-billing',
          benchmark: 'Rate card management'
        }
      },
      {
        id: 'ta-sec-6-5',
        sectionNumber: '6.5',
        title: 'Cost Allocation',
        description: 'Split time entries across cost centers, projects, departments',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Finance', 'Time Admin'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Cost allocation',
          benchmark: 'GL integration'
        }
      },
      {
        id: 'ta-sec-6-6',
        sectionNumber: '6.6',
        title: 'Timesheet Approvals Workflow',
        description: 'Manager approval, project manager approval, multi-level workflow',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Manager', 'Project Manager'],
        industryContext: {
          frequency: 'Weekly/bi-weekly',
          timing: 'Timesheet submission',
          benchmark: 'Approval hierarchy'
        }
      },
      {
        id: 'ta-sec-6-7',
        sectionNumber: '6.7',
        title: 'Project Cost Analytics',
        description: 'Budget vs actual, utilization reports, project profitability',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Project Manager', 'Finance'],
        industryContext: {
          frequency: 'Weekly/monthly',
          timing: 'Project reviews',
          benchmark: 'Project financial health'
        }
      }
    ]
  },
  // Part 7: Overtime and Compliance
  {
    id: 'ta-part-7',
    sectionNumber: '7',
    title: 'Overtime and Compliance',
    description: 'Overtime rules, alerts, labor compliance, and CBA configurations',
    contentLevel: 'procedure',
    estimatedReadTime: 50,
    targetRoles: ['Time Admin', 'HR Admin', 'Compliance'],
    subsections: [
      {
        id: 'ta-sec-7-1',
        sectionNumber: '7.1',
        title: 'Overtime Management Overview',
        description: 'Understanding overtime policies and calculations',
        contentLevel: 'concept',
        estimatedReadTime: 6,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Training',
          benchmark: 'Overtime compliance'
        }
      },
      {
        id: 'ta-sec-7-2',
        sectionNumber: '7.2',
        title: 'Overtime Rules Configuration',
        description: 'Daily/weekly overtime thresholds, calculation methods',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Time Admin'],
        industryContext: {
          frequency: 'Initial setup, policy updates',
          timing: 'Pre-deployment',
          benchmark: 'Labor law compliance'
        }
      },
      {
        id: 'ta-sec-7-3',
        sectionNumber: '7.3',
        title: 'Overtime Alerts Setup',
        description: 'Approaching overtime warnings, threshold notifications',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Time Admin', 'Manager'],
        industryContext: {
          frequency: 'Real-time monitoring',
          timing: 'Proactive management',
          benchmark: 'Cost control'
        }
      },
      {
        id: 'ta-sec-7-4',
        sectionNumber: '7.4',
        title: 'Labor Compliance',
        description: 'Multi-country labor law rules (Caribbean, Africa focus)',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Compliance', 'HR Admin'],
        industryContext: {
          frequency: 'Regulatory updates',
          timing: 'Compliance reviews',
          benchmark: 'Regional labor law'
        }
      },
      {
        id: 'ta-sec-7-5',
        sectionNumber: '7.5',
        title: 'CBA Time Rules',
        description: 'Collective bargaining agreement time policies',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin', 'Time Admin'],
        industryContext: {
          frequency: 'Per CBA',
          timing: 'Union agreement setup',
          benchmark: 'CBA compliance'
        }
      },
      {
        id: 'ta-sec-7-6',
        sectionNumber: '7.6',
        title: 'CBA Extensions Configuration',
        description: 'Special provisions, premium calculations, union-specific rules',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin', 'Time Admin'],
        industryContext: {
          frequency: 'Per CBA extension',
          timing: 'CBA updates',
          benchmark: 'Complex CBA support'
        }
      }
    ]
  },
  // Part 8: Analytics and Insights
  {
    id: 'ta-part-8',
    sectionNumber: '8',
    title: 'Analytics and Insights',
    description: 'Attendance dashboards, absenteeism analysis, wellness monitoring, and reports',
    contentLevel: 'procedure',
    estimatedReadTime: 50,
    targetRoles: ['Time Admin', 'HR Admin', 'Manager'],
    subsections: [
      {
        id: 'ta-sec-8-1',
        sectionNumber: '8.1',
        title: 'Attendance Analytics Dashboard',
        description: 'Overview of attendance KPIs, trends, and patterns',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Daily/weekly review',
          timing: 'Operational monitoring',
          benchmark: 'Attendance visibility'
        }
      },
      {
        id: 'ta-sec-8-2',
        sectionNumber: '8.2',
        title: 'Absenteeism Cost Analysis',
        description: 'Bradford Factor calculation, absenteeism cost modeling',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin', 'Manager'],
        industryContext: {
          frequency: 'Monthly/quarterly',
          timing: 'Absence management',
          benchmark: 'Bradford Factor thresholds'
        }
      },
      {
        id: 'ta-sec-8-3',
        sectionNumber: '8.3',
        title: 'Wellness Monitoring',
        description: 'AI-powered burnout prediction, fatigue indicators, wellness alerts',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin', 'Manager'],
        industryContext: {
          frequency: 'Continuous monitoring',
          timing: 'Proactive wellness',
          benchmark: 'Employee wellbeing'
        }
      },
      {
        id: 'ta-sec-8-4',
        sectionNumber: '8.4',
        title: 'Overtime Trend Analysis',
        description: 'Overtime patterns, cost trends, department comparisons',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Time Admin', 'Finance'],
        industryContext: {
          frequency: 'Weekly/monthly',
          timing: 'Cost management',
          benchmark: 'Overtime cost control'
        }
      },
      {
        id: 'ta-sec-8-5',
        sectionNumber: '8.5',
        title: 'Productivity Metrics',
        description: 'Hours worked analysis, efficiency metrics, utilization rates',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Manager', 'HR Admin'],
        industryContext: {
          frequency: 'Weekly/monthly',
          timing: 'Performance reviews',
          benchmark: 'Workforce productivity'
        }
      },
      {
        id: 'ta-sec-8-6',
        sectionNumber: '8.6',
        title: 'Custom Report Building',
        description: 'Report designer, scheduling, distribution, export formats',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Time Admin', 'HR Admin'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Reporting requirements',
          benchmark: 'Flexible reporting'
        }
      }
    ]
  },
  // Part 9: ESS/MSS Self-Service
  {
    id: 'ta-part-9',
    sectionNumber: '9',
    title: 'ESS/MSS Self-Service',
    description: 'Employee and manager self-service for time and attendance',
    contentLevel: 'procedure',
    estimatedReadTime: 55,
    targetRoles: ['Employee', 'Manager', 'HR Admin'],
    subsections: [
      {
        id: 'ta-sec-9-1',
        sectionNumber: '9.1',
        title: 'Employee Self-Service Overview',
        description: 'ESS features for time and attendance management',
        contentLevel: 'overview',
        estimatedReadTime: 6,
        targetRoles: ['Employee'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Employee onboarding',
          benchmark: 'Self-service adoption'
        }
      },
      {
        id: 'ta-sec-9-2',
        sectionNumber: '9.2',
        title: 'Mobile Clock-In/Out',
        description: 'Mobile app clock-in with face/GPS verification',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Employee'],
        industryContext: {
          frequency: 'Daily',
          timing: 'Shift start/end',
          benchmark: 'Mobile workforce'
        }
      },
      {
        id: 'ta-sec-9-3',
        sectionNumber: '9.3',
        title: 'My Timesheet View',
        description: 'Viewing and submitting personal timesheets',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Employee'],
        industryContext: {
          frequency: 'Weekly',
          timing: 'Timesheet submission',
          benchmark: 'Timesheet accuracy'
        }
      },
      {
        id: 'ta-sec-9-4',
        sectionNumber: '9.4',
        title: 'Shift Swap Requests (ESS)',
        description: 'Requesting shift swaps with colleagues',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Employee'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Schedule changes',
          benchmark: 'Employee flexibility'
        }
      },
      {
        id: 'ta-sec-9-5',
        sectionNumber: '9.5',
        title: 'Manager Self-Service Overview',
        description: 'MSS features for team time and attendance management',
        contentLevel: 'overview',
        estimatedReadTime: 6,
        targetRoles: ['Manager'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Manager training',
          benchmark: 'Manager empowerment'
        }
      },
      {
        id: 'ta-sec-9-6',
        sectionNumber: '9.6',
        title: 'Team Attendance Dashboard (MSS)',
        description: 'Real-time team attendance, who\'s in/out, coverage status',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Manager'],
        industryContext: {
          frequency: 'Daily',
          timing: 'Team monitoring',
          benchmark: 'Team visibility'
        }
      },
      {
        id: 'ta-sec-9-7',
        sectionNumber: '9.7',
        title: 'Timesheet Approvals (MSS)',
        description: 'Approving team timesheets, bulk approval, exception handling',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Manager'],
        industryContext: {
          frequency: 'Weekly/bi-weekly',
          timing: 'Approval cycle',
          benchmark: 'Timely approvals'
        }
      },
      {
        id: 'ta-sec-9-8',
        sectionNumber: '9.8',
        title: 'Overtime Approval Workflow (MSS)',
        description: 'Pre-approval and post-approval of overtime hours',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Manager'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Overtime control',
          benchmark: 'Overtime governance'
        }
      }
    ]
  },
  // Part 10: Troubleshooting and Best Practices
  {
    id: 'ta-part-10',
    sectionNumber: '10',
    title: 'Troubleshooting and Best Practices',
    description: 'Common issues, data quality, integration problems, and escalation',
    contentLevel: 'reference',
    estimatedReadTime: 55,
    targetRoles: ['Time Admin', 'HR Admin', 'IT Support'],
    subsections: [
      {
        id: 'ta-sec-10-1',
        sectionNumber: '10.1',
        title: 'Common Configuration Issues',
        description: 'Troubleshooting policy, shift, and device configuration problems',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Time Admin'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Issue resolution',
          benchmark: 'First-line support'
        }
      },
      {
        id: 'ta-sec-10-2',
        sectionNumber: '10.2',
        title: 'Data Quality Problems',
        description: 'Missing punches, duplicate entries, data validation errors',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Time Admin', 'HR Ops'],
        industryContext: {
          frequency: 'Daily monitoring',
          timing: 'Data cleanup',
          benchmark: 'Data integrity'
        }
      },
      {
        id: 'ta-sec-10-3',
        sectionNumber: '10.3',
        title: 'Integration Issues',
        description: 'Payroll sync failures, Workforce module conflicts, API errors',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['IT Admin', 'Time Admin'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Integration troubleshooting',
          benchmark: 'System reliability'
        }
      },
      {
        id: 'ta-sec-10-4',
        sectionNumber: '10.4',
        title: 'Security and Access Control',
        description: 'Clock device security, role permissions, audit requirements',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['IT Admin', 'Time Admin'],
        industryContext: {
          frequency: 'Security reviews',
          timing: 'Access audits',
          benchmark: 'Security compliance'
        }
      },
      {
        id: 'ta-sec-10-5',
        sectionNumber: '10.5',
        title: 'Performance Optimization',
        description: 'System performance tuning, large dataset handling',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['IT Admin'],
        industryContext: {
          frequency: 'Performance reviews',
          timing: 'Optimization cycles',
          benchmark: 'System performance'
        }
      },
      {
        id: 'ta-sec-10-6',
        sectionNumber: '10.6',
        title: 'Audit Trail and Compliance',
        description: 'Audit log review, compliance reporting, retention policies',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Compliance', 'HR Admin'],
        industryContext: {
          frequency: 'Audit cycles',
          timing: 'Compliance reviews',
          benchmark: 'Regulatory compliance'
        }
      },
      {
        id: 'ta-sec-10-7',
        sectionNumber: '10.7',
        title: 'Escalation Procedures',
        description: 'Support tiers, escalation paths, vendor contact procedures',
        contentLevel: 'reference',
        estimatedReadTime: 6,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Issue escalation',
          benchmark: 'Support process'
        }
      }
    ]
  }
];

// Helper function to get manual statistics
export function getTimeAttendanceManualStats() {
  const totalSections = TIME_ATTENDANCE_MANUAL_STRUCTURE.reduce(
    (acc, section) => acc + 1 + (section.subsections?.length || 0),
    0
  );
  
  const totalReadTime = TIME_ATTENDANCE_MANUAL_STRUCTURE.reduce(
    (acc, section) => acc + section.estimatedReadTime,
    0
  );

  return {
    totalSections,
    totalReadTime,
    totalParts: TIME_ATTENDANCE_MANUAL_STRUCTURE.length
  };
}

// Time and Attendance Glossary
export const TIME_ATTENDANCE_GLOSSARY: Record<string, { term: string; definition: string; related?: string[] }> = {
  'clock-entry': {
    term: 'Clock Entry',
    definition: 'A single time punch recording an employee\'s check-in or check-out from work.',
    related: ['punch', 'time-record']
  },
  'shift': {
    term: 'Shift',
    definition: 'A defined work period with specific start and end times, including any scheduled breaks.',
    related: ['shift-template', 'rotation-pattern']
  },
  'shift-template': {
    term: 'Shift Template',
    definition: 'A reusable shift definition that can be applied to schedules and assigned to employees.',
    related: ['shift', 'schedule']
  },
  'rotation-pattern': {
    term: 'Rotation Pattern',
    definition: 'A recurring schedule pattern (e.g., 4x4, 5x2, Panama) that automatically assigns shifts over a cycle.',
    related: ['shift', 'schedule']
  },
  'timesheet': {
    term: 'Timesheet',
    definition: 'A summary of an employee\'s worked hours over a pay period, including regular, overtime, and project time.',
    related: ['pay-period', 'approval-workflow']
  },
  'geofencing': {
    term: 'Geofencing',
    definition: 'GPS-based boundary validation that verifies employees are at an approved location when clocking in/out.',
    related: ['mobile-clock', 'location-verification']
  },
  'bradford-factor': {
    term: 'Bradford Factor',
    definition: 'A formula used to measure employee absenteeism patterns: S² × D, where S is the number of absence instances and D is total days absent.',
    related: ['absenteeism', 'attendance-score']
  },
  'rounding-rule': {
    term: 'Rounding Rule',
    definition: 'Policy that adjusts clock punch times to the nearest specified increment (e.g., nearest 15 minutes).',
    related: ['grace-period', 'punch-adjustment']
  },
  'grace-period': {
    term: 'Grace Period',
    definition: 'A tolerance window before/after scheduled shift times where an employee is not marked late or leaving early.',
    related: ['rounding-rule', 'tardiness']
  },
  'overtime': {
    term: 'Overtime',
    definition: 'Hours worked beyond the standard work period that qualify for additional pay rates (typically 1.5x or 2x).',
    related: ['overtime-threshold', 'premium-pay']
  },
  'shift-differential': {
    term: 'Shift Differential',
    definition: 'Additional pay for working specific shifts (night, weekend, holiday) beyond the base hourly rate.',
    related: ['premium-pay', 'shift']
  },
  'regularization': {
    term: 'Regularization',
    definition: 'The process of correcting or adjusting attendance records, typically requiring manager approval.',
    related: ['exception', 'attendance-correction']
  },
  'fatigue-management': {
    term: 'Fatigue Management',
    definition: 'Policies and alerts that prevent over-scheduling by enforcing rest periods and maximum consecutive work hours.',
    related: ['compliance', 'rest-period']
  },
  'cba': {
    term: 'CBA (Collective Bargaining Agreement)',
    definition: 'A contract between an employer and a union that may include specific time and attendance rules.',
    related: ['union', 'labor-compliance']
  },
  'project-time': {
    term: 'Project Time',
    definition: 'Hours tracked against specific projects, tasks, or cost centers for billing and cost allocation.',
    related: ['timesheet', 'cost-allocation']
  }
};

// Quick Reference Cards Data
export const TIME_ATTENDANCE_QUICK_REFERENCE = {
  clockInMethods: {
    title: 'Clock-In Methods',
    items: [
      { method: 'Biometric Device', description: 'Fingerprint or palm scan at physical device' },
      { method: 'Face Recognition', description: 'AI-powered face verification via mobile or kiosk' },
      { method: 'Mobile App', description: 'GPS + face verification on employee smartphone' },
      { method: 'Web Clock', description: 'Browser-based clock-in from approved IP/location' },
      { method: 'Card Reader', description: 'Proximity or smart card at physical device' }
    ]
  },
  overtimeTypes: {
    title: 'Overtime Calculation Types',
    items: [
      { type: 'Daily OT', description: 'Hours over 8/day = 1.5x (configurable threshold)' },
      { type: 'Weekly OT', description: 'Hours over 40/week = 1.5x (configurable threshold)' },
      { type: 'Double Time', description: 'Hours over 12/day or 7th consecutive day = 2x' },
      { type: 'Holiday OT', description: 'Any hours on designated holiday = 2x or higher' }
    ]
  },
  commonExceptions: {
    title: 'Common Attendance Exceptions',
    items: [
      { exception: 'Missed Punch', action: 'Employee submits regularization request' },
      { exception: 'Early Departure', action: 'Manager reviews and approves/rejects' },
      { exception: 'Late Arrival', action: 'System applies grace period or tardiness flag' },
      { exception: 'Unauthorized OT', action: 'Alert sent to manager for review' },
      { exception: 'Geofence Violation', action: 'Clock-in blocked, employee notified' }
    ]
  },
  payrollIntegration: {
    title: 'Payroll Integration Points',
    items: [
      { dataPoint: 'Regular Hours', timing: 'End of pay period' },
      { dataPoint: 'Overtime Hours', timing: 'End of pay period with OT type' },
      { dataPoint: 'Shift Differentials', timing: 'With applicable shift codes' },
      { dataPoint: 'Leave Hours', timing: 'From Leave module integration' },
      { dataPoint: 'Project Hours', timing: 'With cost center allocation' }
    ]
  }
};
