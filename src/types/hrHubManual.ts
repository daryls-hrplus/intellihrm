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

// HR Hub Manual Structure - 8 Parts (Implementation-First Order)
// Order: Overview → Foundation Setup → Compliance/Workflows → Content → Communication → Daily Operations → Analytics → Troubleshooting
export const HR_HUB_MANUAL_STRUCTURE: HRHubManualSection[] = [
  // Part 1: Module Overview (unchanged)
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
  // Part 2: Organization Configuration (moved from Part 6 - FOUNDATIONAL SETUP)
  {
    id: 'hh-part-2',
    sectionNumber: '2',
    title: 'Organization Configuration',
    description: 'Lookup values, government ID types, data import, and integrations - foundational setup required before all other modules',
    contentLevel: 'procedure',
    estimatedReadTime: 50,
    targetRoles: ['Super Admin', 'HR Admin', 'Consultant'],
    subsections: [
      {
        id: 'hh-sec-2-1',
        sectionNumber: '2.1',
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
        id: 'hh-sec-2-2',
        sectionNumber: '2.2',
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
        id: 'hh-sec-2-3',
        sectionNumber: '2.3',
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
        id: 'hh-sec-2-4',
        sectionNumber: '2.4',
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
  // Part 3: Compliance & Workflows (moved from Part 5 - MUST be configured before daily operations)
  {
    id: 'hh-part-3',
    sectionNumber: '3',
    title: 'Compliance & Workflows',
    description: 'ESS approval policies, SOP management, workflow templates, and approval delegations - configure before referencing in daily operations',
    contentLevel: 'procedure',
    estimatedReadTime: 75,
    targetRoles: ['HR Admin', 'Compliance Officer', 'Consultant'],
    subsections: [
      {
        id: 'hh-sec-3-1',
        sectionNumber: '3.1',
        title: 'Workflow Templates',
        description: 'Reusable approval workflow patterns, sequential and parallel routing',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR Admin', 'Consultant'],
        industryContext: {
          frequency: 'Initial setup, org changes',
          timing: 'Pre-launch',
          benchmark: 'Enterprise workflow automation'
        }
      },
      {
        id: 'hh-sec-3-2',
        sectionNumber: '3.2',
        title: 'Transaction Workflow Settings',
        description: 'Map workflow templates to transaction types, escalation rules',
        contentLevel: 'procedure',
        estimatedReadTime: 20,
        targetRoles: ['HR Admin', 'Consultant'],
        industryContext: {
          frequency: 'Initial setup, org changes',
          timing: 'Pre-launch',
          benchmark: 'Enterprise workflow automation'
        }
      },
      {
        id: 'hh-sec-3-3',
        sectionNumber: '3.3',
        title: 'Approval Delegations',
        description: 'Delegation rules, temporary assignments, out-of-office handling',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Ongoing',
          timing: 'As needed',
          benchmark: 'Business continuity in approvals'
        }
      },
      {
        id: 'hh-sec-3-4',
        sectionNumber: '3.4',
        title: 'SOP Management',
        description: 'Standard operating procedures, version control, role-based access, AI generation',
        contentLevel: 'procedure',
        estimatedReadTime: 18,
        targetRoles: ['HR Admin', 'Operations'],
        industryContext: {
          frequency: 'Initial setup, periodic updates',
          timing: 'Pre-launch and ongoing',
          benchmark: 'ISO 9001 process documentation'
        }
      },
      {
        id: 'hh-sec-3-5',
        sectionNumber: '3.5',
        title: 'ESS Approval Policies',
        description: 'Employee self-service approval modes, auto-approve rules, escalation paths',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR Admin', 'Consultant'],
        industryContext: {
          frequency: 'Initial setup, policy updates',
          timing: 'Pre-launch',
          benchmark: 'Employee self-service governance'
        }
      },
      {
        id: 'hh-sec-3-6',
        sectionNumber: '3.6',
        title: 'Compliance Tracker',
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
        id: 'hh-sec-3-7',
        sectionNumber: '3.7',
        title: 'Integration Hub',
        description: 'Cross-module integration monitoring, approval activity tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR Admin', 'Consultant'],
        industryContext: {
          frequency: 'Ongoing monitoring',
          timing: 'Post-launch',
          benchmark: 'Cross-module orchestration visibility'
        }
      }
    ]
  },
  // Part 4: Document Center (moved from Part 3)
  {
    id: 'hh-part-4',
    sectionNumber: '4',
    title: 'Document Center',
    description: 'Company documents, policy documents, letter templates, and forms library - uses workflows configured in Chapter 3',
    contentLevel: 'procedure',
    estimatedReadTime: 45,
    targetRoles: ['HR Admin', 'HR Ops'],
    subsections: [
      {
        id: 'hh-sec-4-1',
        sectionNumber: '4.1',
        title: 'Company Documents',
        description: 'Centralized company document repository, version control, access management',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup, ongoing updates',
          timing: 'Pre-launch',
          benchmark: 'Enterprise document management'
        }
      },
      {
        id: 'hh-sec-4-2',
        sectionNumber: '4.2',
        title: 'Policy Documents',
        description: 'Policy versioning, acknowledgment tracking, AI-powered processing',
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
        id: 'hh-sec-4-3',
        sectionNumber: '4.3',
        title: 'Letter Templates',
        description: 'Employment letters, offer templates, variable substitution',
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
        id: 'hh-sec-4-4',
        sectionNumber: '4.4',
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
      }
    ]
  },
  // Part 5: Communication & Support Center (moved from Part 2)
  {
    id: 'hh-part-5',
    sectionNumber: '5',
    title: 'Communication & Support Center',
    description: 'Employee directory, notifications, company communications, and knowledge base for self-service access',
    contentLevel: 'procedure',
    estimatedReadTime: 45,
    targetRoles: ['HR Admin', 'Consultant'],
    subsections: [
      {
        id: 'hh-sec-5-1',
        sectionNumber: '5.1',
        title: 'Employee Directory',
        description: 'Find and connect with colleagues, search and filtering, privacy controls',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup, ongoing maintenance',
          timing: 'Pre-launch',
          benchmark: 'Employee self-service directory'
        }
      },
      {
        id: 'hh-sec-5-2',
        sectionNumber: '5.2',
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
      },
      {
        id: 'hh-sec-5-3',
        sectionNumber: '5.3',
        title: 'Company Communications',
        description: 'Announcements, photo gallery, blog posts, and intranet content',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['HR Admin', 'Communications'],
        industryContext: {
          frequency: 'Ongoing',
          timing: 'As needed',
          benchmark: 'Internal communications strategy'
        },
        subsections: [
          {
            id: 'hh-sec-5-3-1',
            sectionNumber: '5.3.1',
            title: 'Announcements',
            description: 'Company-wide and targeted announcements with pinning',
            contentLevel: 'procedure',
            estimatedReadTime: 4,
            targetRoles: ['HR Admin', 'Communications']
          },
          {
            id: 'hh-sec-5-3-2',
            sectionNumber: '5.3.2',
            title: 'Photo Gallery',
            description: 'Event albums and company photo management',
            contentLevel: 'procedure',
            estimatedReadTime: 4,
            targetRoles: ['HR Admin', 'Communications']
          },
          {
            id: 'hh-sec-5-3-3',
            sectionNumber: '5.3.3',
            title: 'Blog Posts',
            description: 'Long-form content with SEO-friendly slugs',
            contentLevel: 'procedure',
            estimatedReadTime: 4,
            targetRoles: ['HR Admin', 'Communications']
          }
        ]
      },
      {
        id: 'hh-sec-5-4',
        sectionNumber: '5.4',
        title: 'Knowledge Base',
        description: 'Article categories, search optimization, content governance, SOP links',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Initial setup, ongoing maintenance',
          timing: 'Pre-launch',
          benchmark: 'Self-service HR knowledge management'
        },
        subsections: [
          {
            id: 'hh-sec-5-4-1',
            sectionNumber: '5.4.1',
            title: 'Categories',
            description: 'Knowledge base category organization',
            contentLevel: 'procedure',
            estimatedReadTime: 6,
            targetRoles: ['HR Admin']
          },
          {
            id: 'hh-sec-5-4-2',
            sectionNumber: '5.4.2',
            title: 'Articles',
            description: 'Article creation, publishing, and governance',
            contentLevel: 'procedure',
            estimatedReadTime: 6,
            targetRoles: ['HR Admin']
          }
        ]
      }
    ]
  },
  // Part 6: Daily Operations (matches app interface)
  {
    id: 'hh-part-6',
    sectionNumber: '6',
    title: 'Daily Operations',
    description: 'Help desk, employee change requests, task management, calendar, and milestones',
    contentLevel: 'procedure',
    estimatedReadTime: 55,
    targetRoles: ['HR Admin', 'Manager'],
    subsections: [
      {
        id: 'hh-sec-6-1',
        sectionNumber: '6.1',
        title: 'Help Desk',
        description: 'Ticket management, SLA tracking, canned responses, analytics',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Daily operations',
          timing: 'Ongoing',
          benchmark: 'HR service delivery'
        },
        subsections: [
          {
            id: 'hh-sec-6-1-1',
            sectionNumber: '6.1.1',
            title: 'Operations',
            description: 'Ticket queue management, comments, canned responses',
            contentLevel: 'procedure',
            estimatedReadTime: 5,
            targetRoles: ['HR Admin']
          },
          {
            id: 'hh-sec-6-1-2',
            sectionNumber: '6.1.2',
            title: 'Monitoring',
            description: 'SLA metrics, satisfaction analytics, breach tracking',
            contentLevel: 'procedure',
            estimatedReadTime: 4,
            targetRoles: ['HR Admin']
          },
          {
            id: 'hh-sec-6-1-3',
            sectionNumber: '6.1.3',
            title: 'Configuration',
            description: 'Categories, SLA settings, canned responses, escalation',
            contentLevel: 'procedure',
            estimatedReadTime: 5,
            targetRoles: ['HR Admin']
          }
        ]
      },
      {
        id: 'hh-sec-6-2',
        sectionNumber: '6.2',
        title: 'ESS Change Requests',
        description: 'Employee self-service data changes with approval workflows',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Daily operations',
          timing: 'Ongoing',
          benchmark: 'Employee self-service governance'
        }
      },
      {
        id: 'hh-sec-6-3',
        sectionNumber: '6.3',
        title: 'HR Tasks',
        description: 'Task assignment, recurring tasks, priority management',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin', 'Manager'],
        industryContext: {
          frequency: 'Daily operations',
          timing: 'Ongoing',
          benchmark: 'HR workflow automation'
        }
      },
      {
        id: 'hh-sec-6-4',
        sectionNumber: '6.4',
        title: 'HR Calendar',
        description: 'Company events, holidays, meetings, training sessions',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR Admin'],
        industryContext: {
          frequency: 'Annual setup, ongoing',
          timing: 'Pre-fiscal year',
          benchmark: 'Multi-location calendar management'
        }
      },
      {
        id: 'hh-sec-6-5',
        sectionNumber: '6.5',
        title: 'Milestones Dashboard',
        description: 'Birthdays, anniversaries, probation endings tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR Admin', 'Manager'],
        industryContext: {
          frequency: 'Daily review',
          timing: 'Ongoing',
          benchmark: 'Employee experience touchpoints'
        },
        subsections: [
          {
            id: 'hh-sec-6-5-1',
            sectionNumber: '6.5.1',
            title: 'Dashboard Views',
            description: 'Upcoming, today, and monthly milestone views',
            contentLevel: 'procedure',
            estimatedReadTime: 3,
            targetRoles: ['HR Admin', 'Manager']
          },
          {
            id: 'hh-sec-6-5-2',
            sectionNumber: '6.5.2',
            title: 'Milestone Types',
            description: 'Birthdays, anniversaries, probation configuration',
            contentLevel: 'procedure',
            estimatedReadTime: 3,
            targetRoles: ['HR Admin']
          },
          {
            id: 'hh-sec-6-5-3',
            sectionNumber: '6.5.3',
            title: 'Configuration',
            description: 'Privacy controls and recognition integration',
            contentLevel: 'procedure',
            estimatedReadTime: 2,
            targetRoles: ['HR Admin']
          }
        ]
      }
    ]
  },
  // Part 7: Analytics & Insights (unchanged position)
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
  // Part 8: Troubleshooting & Best Practices (unchanged position)
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

// Section-level cross-module references map (updated for new section IDs)
// Key: HR Hub section ID, Value: array of cross-module references
export const HR_HUB_CROSS_REFERENCES: Record<string, CrossModuleReference[]> = {
  'hh-sec-3-2': [
    {
      moduleCode: 'workforce',
      sectionId: 'wf-sec-2-1',
      referenceType: 'dependency',
      description: 'SOPs reference organization structure defined in Workforce'
    }
  ],
  'hh-sec-6-1': [
    {
      moduleCode: 'workforce',
      sectionId: 'wf-sec-2-8',
      referenceType: 'dependency',
      description: 'Calendar events linked to branch locations in Workforce'
    }
  ],
  'hh-sec-3-5': [
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
  'hh-sec-3-3': [
    {
      moduleCode: 'workforce',
      sectionId: 'wf-sec-2-6',
      referenceType: 'dependency',
      description: 'Workflows route based on department hierarchy'
    }
  ]
};

// Module integration map for visual diagrams (updated for new section IDs)
export const HR_HUB_MODULE_INTEGRATIONS = {
  workforce: {
    moduleName: 'Workforce',
    integrationPoints: [
      { hrHubSection: 'hh-sec-3-2', workforceSection: 'wf-sec-2-1', type: 'dependency' as const, label: 'Org structure for SOPs' },
      { hrHubSection: 'hh-sec-6-1', workforceSection: 'wf-sec-2-8', type: 'dependency' as const, label: 'Branch locations for calendar' },
      { hrHubSection: 'hh-sec-3-5', workforceSection: 'wf-sec-2-4', type: 'prerequisite' as const, label: 'Company setup for compliance' },
      { hrHubSection: 'hh-sec-3-5', workforceSection: 'wf-sec-3-5', type: 'integration' as const, label: 'Certification expiry alerts' },
      { hrHubSection: 'hh-sec-3-3', workforceSection: 'wf-sec-2-6', type: 'dependency' as const, label: 'Department hierarchy for workflows' }
    ]
  }
};
