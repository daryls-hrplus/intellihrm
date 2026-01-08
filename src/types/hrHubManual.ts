// HR Hub Administrator Manual Types - Enterprise-grade documentation structure
// Integrates with Workforce Manual through cross-module references

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

// Cross-module reference types - defined early for use in manual structure
export interface CrossModuleReference {
  moduleCode: 'workforce' | 'appraisals' | 'recruitment' | 'learning' | 'payroll' | 'time_attendance';
  sectionId: string;
  referenceType: 'prerequisite' | 'dependency' | 'see_also' | 'integration';
  description: string;
}

// Extended section type with cross-module references
export interface HRHubManualSection extends ManualSection {
  crossModuleReferences?: CrossModuleReference[];
}

// HR Hub Manual Structure - 8 Parts
export const HR_HUB_MANUAL_STRUCTURE: HRHubManualSection[] = [
  // Part 1: Module Overview
  {
    id: 'hh-part-1',
    sectionNumber: '1',
    title: 'Module Overview',
    description: 'Introduction to HR Hub, core concepts, and system architecture',
    contentLevel: 'overview',
    estimatedReadTime: 30,
    targetRoles: ['All'],
    subsections: [
      {
        id: 'hh-sec-1-1',
        sectionNumber: '1.1',
        title: 'Introduction to HR Hub',
        description: 'Executive summary, business value, and key differentiators',
        contentLevel: 'overview',
        estimatedReadTime: 8,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Initial onboarding',
          benchmark: 'Enterprise employee experience platforms'
        }
      },
      {
        id: 'hh-sec-1-2',
        sectionNumber: '1.2',
        title: 'Core Concepts & Terminology',
        description: 'Knowledge base, SOPs, workflows, compliance tracking fundamentals',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin', 'Admin'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Initial onboarding',
          benchmark: 'Industry standard HR service delivery'
        }
      },
      {
        id: 'hh-sec-1-3',
        sectionNumber: '1.3',
        title: 'System Architecture',
        description: 'Integration with Workforce, data flows, module dependencies',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Implementation phase',
          benchmark: 'Cross-module orchestration patterns'
        }
      },
      {
        id: 'hh-sec-1-4',
        sectionNumber: '1.4',
        title: 'User Personas & Journeys',
        description: 'HR Admin, Employee, Manager workflows within HR Hub',
        contentLevel: 'overview',
        estimatedReadTime: 6,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Training sessions',
          benchmark: 'Role-based HR service access'
        }
      }
    ]
  },
  // Part 2: Communication & Support Setup
  {
    id: 'hh-part-2',
    sectionNumber: '2',
    title: 'Communication & Support Setup',
    description: 'Help desk, announcements, knowledge base, and intranet configuration',
    contentLevel: 'procedure',
    estimatedReadTime: 45,
    targetRoles: ['HR Admin', 'Consultant'],
    subsections: [
      {
        id: 'hh-sec-2-1',
        sectionNumber: '2.1',
        title: 'Help Desk Configuration',
        description: 'Ticket categories, SLAs, routing rules, escalation paths',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup, periodic review',
          timing: 'Pre-launch',
          benchmark: 'HR service desk best practices'
        }
      },
      {
        id: 'hh-sec-2-2',
        sectionNumber: '2.2',
        title: 'Company Communications',
        description: 'Announcements, photo gallery, blog posts, and intranet content',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['HR Admin', 'Communications'],
        industryContext: {
          frequency: 'Ongoing',
          timing: 'As needed',
          benchmark: 'Internal communications strategy'
        }
      },
      {
        id: 'hh-sec-2-3',
        sectionNumber: '2.3',
        title: 'Knowledge Base Setup',
        description: 'Article categories, search optimization, content governance',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup, ongoing maintenance',
          timing: 'Pre-launch',
          benchmark: 'Self-service HR knowledge management'
        }
      },
      {
        id: 'hh-sec-2-4',
        sectionNumber: '2.4',
        title: 'Notifications & Reminders',
        description: 'AI-powered automation rules, email templates, delivery tracking, in-app alerts',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup, periodic review',
          timing: 'Pre-launch and ongoing',
          benchmark: 'Proactive HR communication automation'
        }
      }
    ]
  },
  // Part 3: Documents & Templates
  {
    id: 'hh-part-3',
    sectionNumber: '3',
    title: 'Documents & Templates',
    description: 'Letter templates, policy documents, forms library, and SOP management',
    contentLevel: 'procedure',
    estimatedReadTime: 60,
    targetRoles: ['HR Admin', 'HR Ops'],
    subsections: [
      {
        id: 'hh-sec-3-1',
        sectionNumber: '3.1',
        title: 'Letter Templates',
        description: 'Employment letters, offer templates, termination notices',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup, legal updates',
          timing: 'Pre-launch',
          benchmark: 'Compliant HR correspondence'
        }
      },
      {
        id: 'hh-sec-3-2',
        sectionNumber: '3.2',
        title: 'Policy Documents',
        description: 'Policy versioning, acknowledgment tracking, distribution',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR Admin', 'Compliance'],
        industryContext: {
          frequency: 'Annual review, regulatory updates',
          timing: 'Ongoing',
          benchmark: 'Policy lifecycle management'
        }
      },
      {
        id: 'hh-sec-3-3',
        sectionNumber: '3.3',
        title: 'Forms Library',
        description: 'Digital forms, approval workflows, submission tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup, updates as needed',
          timing: 'Pre-launch',
          benchmark: 'Paperless HR processes'
        }
      },
      {
        id: 'hh-sec-3-4',
        sectionNumber: '3.4',
        title: 'SOP Management',
        description: 'Standard operating procedures, version control, role-based access',
        contentLevel: 'procedure',
        estimatedReadTime: 18,
        targetRoles: ['HR Admin', 'Operations'],
        industryContext: {
          frequency: 'Initial setup, periodic updates',
          timing: 'Pre-launch and ongoing',
          benchmark: 'ISO 9001 process documentation'
        }
      }
    ]
  },
  // Part 4: Tasks & Events Management
  {
    id: 'hh-part-4',
    sectionNumber: '4',
    title: 'Tasks & Events Management',
    description: 'Calendar setup, task management, milestones, and reminders',
    contentLevel: 'procedure',
    estimatedReadTime: 40,
    targetRoles: ['HR Admin', 'Manager'],
    subsections: [
      {
        id: 'hh-sec-4-1',
        sectionNumber: '4.1',
        title: 'Calendar Setup',
        description: 'Company calendar, holidays, location-specific events',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Annual setup',
          timing: 'Pre-fiscal year',
          benchmark: 'Multi-location calendar management'
        }
      },
      {
        id: 'hh-sec-4-2',
        sectionNumber: '4.2',
        title: 'Task Management',
        description: 'Task templates, assignments, due dates, notifications',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['HR Admin', 'Manager'],
        industryContext: {
          frequency: 'Ongoing',
          timing: 'As needed',
          benchmark: 'HR workflow automation'
        }
      },
      {
        id: 'hh-sec-4-3',
        sectionNumber: '4.3',
        title: 'Milestones Configuration',
        description: 'Employee lifecycle milestones, anniversary tracking, alerts',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup',
          timing: 'Pre-launch',
          benchmark: 'Employee experience touchpoints'
        }
      },
      {
        id: 'hh-sec-4-4',
        sectionNumber: '4.4',
        title: 'Reminders Configuration',
        description: 'Automated reminders, escalation rules, notification channels',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup, periodic review',
          timing: 'Pre-launch',
          benchmark: 'Proactive HR communication'
        }
      }
    ]
  },
  // Part 5: Compliance & Workflows
  {
    id: 'hh-part-5',
    sectionNumber: '5',
    title: 'Compliance & Workflows',
    description: 'Compliance tracker, transaction workflows, and approval delegations',
    contentLevel: 'procedure',
    estimatedReadTime: 75,
    targetRoles: ['HR Admin', 'Compliance Officer', 'Consultant'],
    subsections: [
      {
        id: 'hh-sec-5-1',
        sectionNumber: '5.1',
        title: 'Compliance Tracker Setup',
        description: 'Regulatory requirements, deadline tracking, audit preparation',
        contentLevel: 'procedure',
        estimatedReadTime: 20,
        targetRoles: ['HR Admin', 'Compliance'],
        industryContext: {
          frequency: 'Initial setup, regulatory updates',
          timing: 'Pre-launch',
          benchmark: 'Labor law compliance across jurisdictions'
        }
      },
      {
        id: 'hh-sec-5-2',
        sectionNumber: '5.2',
        title: 'Transaction Workflow Settings',
        description: 'Approval chains, parallel/sequential flows, escalation rules',
        contentLevel: 'procedure',
        estimatedReadTime: 25,
        targetRoles: ['HR Admin', 'Consultant'],
        industryContext: {
          frequency: 'Initial setup, org changes',
          timing: 'Pre-launch',
          benchmark: 'Enterprise workflow automation'
        }
      },
      {
        id: 'hh-sec-5-3',
        sectionNumber: '5.3',
        title: 'Approval Delegations',
        description: 'Delegation rules, temporary assignments, out-of-office handling',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Ongoing',
          timing: 'As needed',
          benchmark: 'Business continuity in approvals'
        }
      },
      {
        id: 'hh-sec-5-4',
        sectionNumber: '5.4',
        title: 'Audit Trail & Reporting',
        description: 'Compliance reports, audit logs, regulatory submissions',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR Admin', 'Compliance', 'Auditor'],
        industryContext: {
          frequency: 'Quarterly, annually',
          timing: 'Audit cycles',
          benchmark: 'SOC 2, ISO 27001 compliance'
        }
      }
    ]
  },
  // Part 6: Organization Configuration
  {
    id: 'hh-part-6',
    sectionNumber: '6',
    title: 'Organization Configuration',
    description: 'Lookup values, government ID types, data import, and integrations',
    contentLevel: 'procedure',
    estimatedReadTime: 50,
    targetRoles: ['Super Admin', 'HR Admin', 'Consultant'],
    subsections: [
      {
        id: 'hh-sec-6-1',
        sectionNumber: '6.1',
        title: 'Lookup Values Management',
        description: 'Custom dropdowns, status values, category management',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Super Admin', 'HR Admin'],
        industryContext: {
          frequency: 'Initial setup, periodic updates',
          timing: 'Pre-launch',
          benchmark: 'Configurable without code'
        }
      },
      {
        id: 'hh-sec-6-2',
        sectionNumber: '6.2',
        title: 'Government ID Types',
        description: 'Country-specific ID configurations, validation rules',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Super Admin'],
        industryContext: {
          frequency: 'Per country, regulatory updates',
          timing: 'Pre-launch per country',
          benchmark: 'Regional compliance (SSN, TRN, NIS)'
        }
      },
      {
        id: 'hh-sec-6-3',
        sectionNumber: '6.3',
        title: 'Data Import Tools',
        description: 'Bulk imports, data validation, error handling',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR Admin', 'Consultant'],
        industryContext: {
          frequency: 'Initial migration, periodic updates',
          timing: 'Implementation, acquisitions',
          benchmark: 'Data migration best practices'
        }
      },
      {
        id: 'hh-sec-6-4',
        sectionNumber: '6.4',
        title: 'Integration Settings',
        description: 'External system connections, API configurations, webhooks',
        contentLevel: 'procedure',
        estimatedReadTime: 11,
        targetRoles: ['Super Admin', 'IT'],
        industryContext: {
          frequency: 'Per integration',
          timing: 'Post initial setup',
          benchmark: 'Enterprise integration patterns'
        }
      }
    ]
  },
  // Part 7: Analytics & Insights
  {
    id: 'hh-part-7',
    sectionNumber: '7',
    title: 'Analytics & Insights',
    description: 'Sentiment monitoring, recognition analytics, and dashboard configuration',
    contentLevel: 'procedure',
    estimatedReadTime: 35,
    targetRoles: ['HR Admin', 'HR Leader'],
    subsections: [
      {
        id: 'hh-sec-7-1',
        sectionNumber: '7.1',
        title: 'Sentiment Monitoring',
        description: 'Pulse surveys, sentiment analysis, trend tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['HR Admin', 'HR Leader'],
        industryContext: {
          frequency: 'Continuous monitoring',
          timing: 'Post-launch',
          benchmark: 'Employee experience measurement'
        }
      },
      {
        id: 'hh-sec-7-2',
        sectionNumber: '7.2',
        title: 'Recognition Analytics',
        description: 'Recognition patterns, engagement metrics, department comparisons',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Monthly review',
          timing: 'Ongoing',
          benchmark: 'Recognition program effectiveness'
        }
      },
      {
        id: 'hh-sec-7-3',
        sectionNumber: '7.3',
        title: 'Dashboard Configuration',
        description: 'Custom dashboards, widget setup, role-based views',
        contentLevel: 'procedure',
        estimatedReadTime: 13,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup, periodic updates',
          timing: 'Post-launch',
          benchmark: 'Executive HR reporting'
        }
      }
    ]
  },
  // Part 8: Troubleshooting & Best Practices
  {
    id: 'hh-part-8',
    sectionNumber: '8',
    title: 'Troubleshooting & Best Practices',
    description: 'Common issues, performance tips, and security considerations',
    contentLevel: 'reference',
    estimatedReadTime: 30,
    targetRoles: ['HR Admin', 'Consultant', 'Support'],
    subsections: [
      {
        id: 'hh-sec-8-1',
        sectionNumber: '8.1',
        title: 'Common Issues & Solutions',
        description: 'Frequently encountered problems and resolution steps',
        contentLevel: 'reference',
        estimatedReadTime: 12,
        targetRoles: ['HR Admin', 'Support'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Troubleshooting',
          benchmark: 'Self-service support'
        }
      },
      {
        id: 'hh-sec-8-2',
        sectionNumber: '8.2',
        title: 'Performance Optimization',
        description: 'System performance tips, data cleanup, archiving',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin', 'IT'],
        industryContext: {
          frequency: 'Quarterly review',
          timing: 'Maintenance windows',
          benchmark: 'System health management'
        }
      },
      {
        id: 'hh-sec-8-3',
        sectionNumber: '8.3',
        title: 'Security Considerations',
        description: 'Data access, audit controls, PII handling',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin', 'IT', 'Compliance'],
        industryContext: {
          frequency: 'Annual review',
          timing: 'Security audits',
          benchmark: 'GDPR, data protection compliance'
        }
      }
    ]
  }
];

// Cross-module reference types
export interface CrossModuleReference {
  moduleCode: 'workforce' | 'appraisals' | 'recruitment' | 'learning' | 'payroll' | 'time_attendance';
  sectionId: string;
  referenceType: 'prerequisite' | 'dependency' | 'see_also' | 'integration';
  description: string;
}

// Section-level cross-module references map
// Key: HR Hub section ID, Value: array of cross-module references
export const HR_HUB_CROSS_REFERENCES: Record<string, CrossModuleReference[]> = {
  'hh-sec-3-4': [
    {
      moduleCode: 'workforce',
      sectionId: 'wf-sec-2-1',
      referenceType: 'dependency',
      description: 'SOPs reference organization structure defined in Workforce'
    }
  ],
  'hh-sec-4-1': [
    {
      moduleCode: 'workforce',
      sectionId: 'wf-sec-2-8',
      referenceType: 'dependency',
      description: 'Calendar events linked to branch locations in Workforce'
    }
  ],
  'hh-sec-5-1': [
    {
      moduleCode: 'workforce',
      sectionId: 'wf-sec-2-4',
      referenceType: 'prerequisite',
      description: 'Compliance rules are company-specific, requires company setup first'
    },
    {
      moduleCode: 'workforce',
      sectionId: 'wf-sec-3-5',
      referenceType: 'integration',
      description: 'Certification expiry feeds into compliance tracking'
    }
  ],
  'hh-sec-5-2': [
    {
      moduleCode: 'workforce',
      sectionId: 'wf-sec-2-6',
      referenceType: 'dependency',
      description: 'Workflows route based on department hierarchy'
    }
  ]
};

// Module integration map for visual diagrams
export const HR_HUB_MODULE_INTEGRATIONS = {
  workforce: {
    moduleName: 'Workforce',
    integrationPoints: [
      { hrHubSection: 'hh-sec-3-4', workforceSection: 'wf-sec-2-1', type: 'dependency' as const, label: 'Org structure for SOPs' },
      { hrHubSection: 'hh-sec-4-1', workforceSection: 'wf-sec-2-8', type: 'dependency' as const, label: 'Branch locations for calendar' },
      { hrHubSection: 'hh-sec-5-1', workforceSection: 'wf-sec-2-4', type: 'prerequisite' as const, label: 'Company setup for compliance' },
      { hrHubSection: 'hh-sec-5-1', workforceSection: 'wf-sec-3-5', type: 'integration' as const, label: 'Certification expiry alerts' },
      { hrHubSection: 'hh-sec-5-2', workforceSection: 'wf-sec-2-6', type: 'dependency' as const, label: 'Department hierarchy for workflows' }
    ]
  }
};
