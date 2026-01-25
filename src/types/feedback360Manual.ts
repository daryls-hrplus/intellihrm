// 360 Feedback Administrator Manual Types

import { ManualSection, IndustryContext, ManualCallout, TroubleshootingItem } from './adminManual';

// 360 Feedback Manual Structure - 8 major parts with comprehensive subsections
export const FEEDBACK_360_MANUAL_STRUCTURE: ManualSection[] = [
  {
    id: 'part-1',
    sectionNumber: '1',
    title: 'Module Overview & Conceptual Foundation',
    description: 'Introduction to 360 Feedback, core concepts, multi-rater model, and system architecture',
    contentLevel: 'overview',
    estimatedReadTime: 35,
    targetRoles: ['All'],
    subsections: [
      {
        id: 'sec-1-1',
        sectionNumber: '1.1',
        title: 'Introduction to 360 Feedback in Intelli HRM',
        description: 'Purpose, multi-rater philosophy, and key differentiators',
        contentLevel: 'overview',
        estimatedReadTime: 8,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Initial onboarding',
          benchmark: 'Enterprise 360 feedback standards'
        }
      },
      {
        id: 'sec-1-2',
        sectionNumber: '1.2',
        title: 'Core Concepts & Terminology',
        description: 'Rater categories, anonymity thresholds, signal processing, and key definitions',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['HR User', 'Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Initial onboarding',
          benchmark: 'Multi-rater assessment model with 3-5 rater anonymity threshold'
        }
      },
      {
        id: 'sec-1-3',
        sectionNumber: '1.3',
        title: 'User Personas & Journeys',
        description: 'Employee, Rater, Manager, and HR Administrator journey maps',
        contentLevel: 'overview',
        estimatedReadTime: 7,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Training sessions',
          benchmark: 'Role-based experience design'
        }
      },
      {
        id: 'sec-1-4',
        sectionNumber: '1.4',
        title: 'System Architecture',
        description: 'Data model overview covering 25+ tables, relationships, and integration points',
        contentLevel: 'reference',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Implementation phase',
          benchmark: 'Enterprise HRMS data architecture standards'
        }
      },
      {
        id: 'sec-1-5',
        sectionNumber: '1.5',
        title: '360 Feedback Cycle Calendar',
        description: 'Annual cycle planning, optimal timing, and milestone recommendations',
        contentLevel: 'overview',
        estimatedReadTime: 8,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'Annual planning',
          timing: 'Q1 planning, Q3/Q4 execution',
          benchmark: 'Annual or semi-annual 360 cycles'
        }
      }
    ]
  },
  {
    id: 'part-2',
    sectionNumber: '2',
    title: 'Setup & Configuration Guide',
    description: 'Complete setup instructions for 360 feedback system components',
    contentLevel: 'procedure',
    estimatedReadTime: 95,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      {
        id: 'sec-2-1',
        sectionNumber: '2.1',
        title: 'Pre-requisites Checklist',
        description: 'Dependencies, workforce data requirements, and readiness validation',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time during implementation',
          timing: '4-6 weeks before go-live',
          benchmark: 'Enterprise implementation methodology'
        }
      },
      {
        id: 'sec-2-2',
        sectionNumber: '2.2',
        title: 'Rater Categories Configuration',
        description: 'Setting up Manager, Peer, Direct Report, Self, and External rater types',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time setup',
          timing: 'Pre-implementation',
          benchmark: '5 standard rater categories with optional External/Customer'
        }
      },
      {
        id: 'sec-2-3',
        sectionNumber: '2.3',
        title: 'Question Bank Setup',
        description: 'Creating questions, linking to competencies, assigning to rater categories',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Initial setup, quarterly updates',
          timing: 'Post competency library population',
          benchmark: '15-40 questions per cycle, 5-7 minutes completion time'
        }
      },
      {
        id: 'sec-2-4',
        sectionNumber: '2.4',
        title: 'Behavioral Anchors & BARS',
        description: 'Configuring behavioral anchors for objective rating criteria',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Initial setup, annual review',
          timing: 'Post question bank creation',
          benchmark: 'BARS (Behaviorally Anchored Rating Scales) methodology'
        }
      },
      {
        id: 'sec-2-5',
        sectionNumber: '2.5',
        title: 'Rating Scales Configuration',
        description: 'Setting up 360-specific rating scales with labels and score mappings',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time setup, annual review',
          timing: 'Pre-implementation',
          benchmark: '5-point scale (1-5) industry standard for 360 feedback'
        }
      },
      {
        id: 'sec-2-6',
        sectionNumber: '2.6',
        title: 'Report Templates Setup',
        description: 'Configuring audience-specific report templates (Executive, Manager, IC, HR)',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time, annual review',
          timing: 'Pre-implementation',
          benchmark: 'Audience-specific content visibility and depth'
        }
      },
      {
        id: 'sec-2-7',
        sectionNumber: '2.7',
        title: 'Anonymity & Visibility Rules',
        description: 'Configuring employee, manager, and HR access levels with release timing',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time, policy review annually',
          timing: 'Pre-implementation',
          benchmark: 'Minimum 3 raters per category for anonymity threshold'
        }
      },
      {
        id: 'sec-2-8',
        sectionNumber: '2.8',
        title: 'Framework Library Configuration',
        description: 'Managing competency frameworks, versioning, and cycle assignments',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Initial setup, version updates',
          timing: 'Post competency configuration',
          benchmark: 'Framework versioning for historical accuracy'
        }
      },
      {
        id: 'sec-2-9',
        sectionNumber: '2.9',
        title: 'Signal Definitions Setup',
        description: 'Configuring talent signal extraction from 360 feedback data',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Initial setup, quarterly optimization',
          timing: 'Post question bank creation',
          benchmark: 'Signal-to-competency mappings for talent analytics'
        }
      },
      {
        id: 'sec-2-10',
        sectionNumber: '2.10',
        title: 'External Rater Configuration',
        description: 'Setting up customer/vendor rater invitations and consent workflows',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'As needed per cycle',
          timing: 'Before cycle launch',
          benchmark: 'External stakeholder feedback for customer-facing roles'
        }
      },
      {
        id: 'sec-2-11',
        sectionNumber: '2.11',
        title: 'Cycle Templates & Cloning',
        description: 'Creating reusable cycle templates and cloning workflows',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Annual template creation',
          timing: 'Post first cycle completion',
          benchmark: 'Template reuse for operational efficiency'
        }
      }
    ]
  },
  {
    id: 'part-3',
    sectionNumber: '3',
    title: 'Operational Workflows',
    description: 'Day-to-day procedures for running 360 feedback cycles',
    contentLevel: 'procedure',
    estimatedReadTime: 75,
    targetRoles: ['HR User', 'Manager', 'Employee'],
    subsections: [
      {
        id: 'sec-3-1',
        sectionNumber: '3.1',
        title: 'Cycle Lifecycle Management',
        description: 'Managing cycle status progression from Draft to Closed',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'Per cycle execution',
          timing: 'Throughout the cycle',
          benchmark: 'Draft → Active → In Progress → Completed → Closed'
        }
      },
      {
        id: 'sec-3-2',
        sectionNumber: '3.2',
        title: 'Participant Enrollment',
        description: 'Adding employees to cycles with eligibility filtering and bulk operations',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR User'],
        industryContext: {
          frequency: 'At cycle launch',
          timing: '1-2 weeks before evaluation window',
          benchmark: 'Bulk enrollment with department/job-based filtering'
        }
      },
      {
        id: 'sec-3-3',
        sectionNumber: '3.3',
        title: 'Peer Nomination Process',
        description: 'Employee-driven peer selection with manager approval workflow',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Employee', 'Manager', 'HR User'],
        industryContext: {
          frequency: 'Per cycle',
          timing: 'First 1-2 weeks of cycle',
          benchmark: 'Minimum 3-5 peer nominations per participant'
        }
      },
      {
        id: 'sec-3-4',
        sectionNumber: '3.4',
        title: 'Rater Assignment & Requests',
        description: 'Creating feedback requests and managing rater relationships',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR User', 'Manager'],
        industryContext: {
          frequency: 'Per participant enrollment',
          timing: 'Post nomination approval',
          benchmark: 'Automated request generation based on org structure'
        }
      },
      {
        id: 'sec-3-5',
        sectionNumber: '3.5',
        title: 'Response Collection & Monitoring',
        description: 'Tracking completion rates, response status, and quality indicators',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR User'],
        industryContext: {
          frequency: 'Daily during active cycle',
          timing: 'Throughout feedback collection window',
          benchmark: '80%+ completion rate target'
        }
      },
      {
        id: 'sec-3-6',
        sectionNumber: '3.6',
        title: 'Reminder Management',
        description: 'Automated and manual reminder scheduling and tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR User'],
        industryContext: {
          frequency: 'Weekly during active cycle',
          timing: 'Throughout collection window',
          benchmark: '3-4 reminders per cycle at strategic intervals'
        }
      },
      {
        id: 'sec-3-7',
        sectionNumber: '3.7',
        title: 'External Rater Invitations',
        description: 'Managing external stakeholder invitations, access tokens, and responses',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR User'],
        industryContext: {
          frequency: 'As needed per cycle',
          timing: 'During rater assignment phase',
          benchmark: 'Secure token-based access for external raters'
        }
      },
      {
        id: 'sec-3-8',
        sectionNumber: '3.8',
        title: 'Results Processing & Release',
        description: 'Processing responses, HR approval workflow, and results release',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'End of each cycle',
          timing: 'After collection deadline',
          benchmark: 'HR approval before employee visibility'
        }
      }
    ]
  },
  {
    id: 'part-4',
    sectionNumber: '4',
    title: 'Governance & Compliance',
    description: 'Data protection, consent management, investigation mode, and audit trails',
    contentLevel: 'procedure',
    estimatedReadTime: 65,
    targetRoles: ['Admin', 'HR User', 'Compliance'],
    subsections: [
      {
        id: 'sec-4-1',
        sectionNumber: '4.1',
        title: 'Anonymity Architecture',
        description: 'Understanding anonymity thresholds, bypass conditions, and protection mechanisms',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR User'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Implementation and policy design',
          benchmark: 'Minimum 3 raters per category for anonymity'
        }
      },
      {
        id: 'sec-4-2',
        sectionNumber: '4.2',
        title: 'Consent Management',
        description: 'Managing rater consent, versioning, and withdrawal workflows',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR User'],
        industryContext: {
          frequency: 'Per cycle, policy updates',
          timing: 'Before rater participation',
          benchmark: 'GDPR-compliant consent collection',
          compliance: ['GDPR', 'Data Protection Act']
        }
      },
      {
        id: 'sec-4-3',
        sectionNumber: '4.3',
        title: 'Data Policies Configuration',
        description: 'Setting up data retention, access, and processing policies',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Initial setup, annual review',
          timing: 'Pre-implementation',
          benchmark: 'Policy versioning with effective dates'
        }
      },
      {
        id: 'sec-4-4',
        sectionNumber: '4.4',
        title: 'Investigation Mode & Access',
        description: 'Managing investigation requests, approval workflows, and access logging',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR User', 'Legal'],
        industryContext: {
          frequency: 'As needed for investigations',
          timing: 'During compliance investigations',
          benchmark: 'Documented justification and multi-level approval'
        }
      },
      {
        id: 'sec-4-5',
        sectionNumber: '4.5',
        title: 'Exception Handling',
        description: 'Managing rater exceptions, anonymity overrides, and approval workflows',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR User'],
        industryContext: {
          frequency: 'As needed',
          timing: 'During cycle execution',
          benchmark: 'Documented exception justification'
        }
      },
      {
        id: 'sec-4-6',
        sectionNumber: '4.6',
        title: 'Audit Log & Compliance Reporting',
        description: 'AI action logs, data access logs, and compliance report generation',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Compliance'],
        industryContext: {
          frequency: 'Ongoing, quarterly review',
          timing: 'Throughout cycle and post-cycle',
          benchmark: 'Complete audit trail for regulatory compliance'
        }
      },
      {
        id: 'sec-4-7',
        sectionNumber: '4.7',
        title: 'Data Retention Policies',
        description: 'Configuring retention periods and anonymization schedules',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Initial setup, annual review',
          timing: 'Pre-implementation',
          benchmark: '3-7 year retention per regulatory requirements'
        }
      }
    ]
  },
  {
    id: 'part-5',
    sectionNumber: '5',
    title: 'AI & Intelligence Features',
    description: 'AI-powered analysis, signal processing, development themes, and explainability',
    contentLevel: 'concept',
    estimatedReadTime: 55,
    targetRoles: ['Admin', 'HR User'],
    subsections: [
      {
        id: 'sec-5-1',
        sectionNumber: '5.1',
        title: 'Signal Processing Engine',
        description: 'Understanding how feedback responses are transformed into talent signals',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR User'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Post-cycle analysis',
          benchmark: 'Confidence-weighted signal aggregation'
        }
      },
      {
        id: 'sec-5-2',
        sectionNumber: '5.2',
        title: 'Development Theme Generation',
        description: 'AI-powered development theme extraction and confirmation workflows',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR User', 'Manager'],
        industryContext: {
          frequency: 'Post-cycle',
          timing: 'After results release',
          benchmark: 'Actionable development recommendations'
        }
      },
      {
        id: 'sec-5-3',
        sectionNumber: '5.3',
        title: 'Writing Quality Analysis',
        description: 'AI analysis of feedback clarity, specificity, and actionability',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR User'],
        industryContext: {
          frequency: 'Real-time during feedback entry',
          timing: 'Throughout collection window',
          benchmark: 'Constructive feedback quality metrics'
        }
      },
      {
        id: 'sec-5-4',
        sectionNumber: '5.4',
        title: 'Bias Detection & Warnings',
        description: 'AI-powered bias detection, inline warnings, and mitigation strategies',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR User'],
        industryContext: {
          frequency: 'Real-time during feedback entry',
          timing: 'Throughout collection window',
          benchmark: 'Bias-free feedback environment'
        }
      },
      {
        id: 'sec-5-5',
        sectionNumber: '5.5',
        title: 'Coaching Prompts Generation',
        description: 'AI-generated coaching conversation starters based on feedback themes',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Manager', 'HR User'],
        industryContext: {
          frequency: 'Post-results release',
          timing: 'During coaching conversations',
          benchmark: 'Actionable coaching guidance'
        }
      },
      {
        id: 'sec-5-6',
        sectionNumber: '5.6',
        title: 'AI Explainability & Audit',
        description: 'Understanding AI decisions, model tracking, and human override documentation',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Compliance'],
        industryContext: {
          frequency: 'Ongoing, quarterly review',
          timing: 'Post-cycle and audits',
          benchmark: 'ISO-compliant AI governance'
        }
      }
    ]
  },
  {
    id: 'part-6',
    sectionNumber: '6',
    title: 'Reports & Analytics',
    description: 'Report generation, audience-specific templates, and workforce analytics',
    contentLevel: 'procedure',
    estimatedReadTime: 50,
    targetRoles: ['HR User', 'Manager', 'Executive'],
    subsections: [
      {
        id: 'sec-6-1',
        sectionNumber: '6.1',
        title: 'Report Template System',
        description: 'Understanding the report template architecture and customization options',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR User'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Setup and customization',
          benchmark: 'Flexible template-based reporting'
        }
      },
      {
        id: 'sec-6-2',
        sectionNumber: '6.2',
        title: 'Audience-Specific Reports',
        description: 'Executive, Manager, Individual Contributor, and HR report configurations',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR User'],
        industryContext: {
          frequency: 'One-time setup, per cycle customization',
          timing: 'Pre-results release',
          benchmark: 'Role-appropriate content depth and visibility'
        }
      },
      {
        id: 'sec-6-3',
        sectionNumber: '6.3',
        title: 'Visualizations & Charts',
        description: 'Radar charts, bar charts, benchmarks, and trend analysis',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Report review',
          benchmark: 'Industry-standard 360 visualizations'
        }
      },
      {
        id: 'sec-6-4',
        sectionNumber: '6.4',
        title: 'Workforce Analytics Dashboard',
        description: 'Organization-wide 360 feedback insights and trend analysis',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR User', 'Executive'],
        industryContext: {
          frequency: 'Post-cycle, quarterly review',
          timing: 'After results release',
          benchmark: 'Aggregate workforce capability insights'
        }
      },
      {
        id: 'sec-6-5',
        sectionNumber: '6.5',
        title: 'Response Monitoring Dashboard',
        description: 'Real-time completion tracking and response quality monitoring',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR User'],
        industryContext: {
          frequency: 'Daily during active cycle',
          timing: 'Throughout collection window',
          benchmark: '80%+ completion rate monitoring'
        }
      },
      {
        id: 'sec-6-6',
        sectionNumber: '6.6',
        title: 'Results Release Audit',
        description: 'Tracking report generation, distribution, and acknowledgment',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'End of each cycle',
          timing: 'Post-results release',
          benchmark: 'Complete release audit trail'
        }
      }
    ]
  },
  {
    id: 'part-7',
    sectionNumber: '7',
    title: 'Integration & Cross-Module Features',
    description: 'Integration with Appraisals, Talent Profile, Succession, IDP, and Learning',
    contentLevel: 'procedure',
    estimatedReadTime: 45,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      {
        id: 'sec-7-1',
        sectionNumber: '7.1',
        title: 'Appraisal Integration',
        description: 'Feeding 360 feedback into performance appraisal cycles',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per appraisal cycle',
          timing: 'Pre-appraisal phase',
          benchmark: '360 as input to CRGV+360 appraisal model'
        }
      },
      {
        id: 'sec-7-2',
        sectionNumber: '7.2',
        title: 'Talent Profile Integration',
        description: 'Updating talent profiles with 360 signal snapshots',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR User'],
        industryContext: {
          frequency: 'Post-cycle',
          timing: 'After results processing',
          benchmark: 'Continuous talent profile enrichment'
        }
      },
      {
        id: 'sec-7-3',
        sectionNumber: '7.3',
        title: 'Nine-Box & Succession Feed',
        description: 'Mapping 360 signals to Nine-Box placement and succession pools',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR User'],
        industryContext: {
          frequency: 'Post-cycle',
          timing: 'During succession planning',
          benchmark: 'Leadership capability assessment'
        }
      },
      {
        id: 'sec-7-4',
        sectionNumber: '7.4',
        title: 'IDP & Development Planning',
        description: 'Linking 360 development themes to Individual Development Plans',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR User', 'Manager'],
        industryContext: {
          frequency: 'Post-results release',
          timing: 'During development planning',
          benchmark: 'Feedback-driven development goals'
        }
      },
      {
        id: 'sec-7-5',
        sectionNumber: '7.5',
        title: 'Training Recommendations',
        description: 'AI-powered skill gap to training course matching',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR User', 'L&D'],
        industryContext: {
          frequency: 'Post-results release',
          timing: 'During learning path assignment',
          benchmark: 'Competency gap closure through learning'
        }
      },
      {
        id: 'sec-7-6',
        sectionNumber: '7.6',
        title: 'Continuous Feedback Connection',
        description: 'Linking formal 360 cycles with ongoing continuous feedback',
        contentLevel: 'concept',
        estimatedReadTime: 6,
        targetRoles: ['HR User'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Continuous performance management',
          benchmark: 'Holistic feedback ecosystem'
        }
      }
    ]
  },
  {
    id: 'part-8',
    sectionNumber: '8',
    title: 'Troubleshooting & FAQs',
    description: 'Common issues, solutions, best practices, and frequently asked questions',
    contentLevel: 'troubleshooting',
    estimatedReadTime: 35,
    targetRoles: ['All'],
    subsections: [
      {
        id: 'sec-8-1',
        sectionNumber: '8.1',
        title: 'Common Configuration Issues',
        description: 'Resolving setup problems, validation errors, and configuration conflicts',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'As needed',
          timing: 'During implementation and operation',
          benchmark: 'Configuration best practices'
        }
      },
      {
        id: 'sec-8-2',
        sectionNumber: '8.2',
        title: 'Anonymity Threshold Problems',
        description: 'Handling insufficient raters, bypass scenarios, and threshold adjustments',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 6,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'As needed during cycle',
          timing: 'During response collection',
          benchmark: 'Anonymity protection best practices'
        }
      },
      {
        id: 'sec-8-3',
        sectionNumber: '8.3',
        title: 'Response Collection Issues',
        description: 'Addressing low completion rates, declined raters, and timeout problems',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 6,
        targetRoles: ['HR User'],
        industryContext: {
          frequency: 'During active cycles',
          timing: 'Throughout collection window',
          benchmark: '80%+ completion rate recovery strategies'
        }
      },
      {
        id: 'sec-8-4',
        sectionNumber: '8.4',
        title: 'Report Generation Problems',
        description: 'Resolving template errors, missing data, and generation failures',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'HR User'],
        industryContext: {
          frequency: 'As needed',
          timing: 'During results processing',
          benchmark: 'Report validation checklist'
        }
      },
      {
        id: 'sec-8-5',
        sectionNumber: '8.5',
        title: 'Integration Failures',
        description: 'Diagnosing and resolving cross-module sync issues',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'As needed',
          timing: 'During integration testing',
          benchmark: 'Integration health monitoring'
        }
      },
      {
        id: 'sec-8-6',
        sectionNumber: '8.6',
        title: 'Best Practices & Tips',
        description: 'Industry benchmarks, optimization strategies, and success factors',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Continuous improvement',
          benchmark: 'Enterprise 360 feedback best practices'
        }
      }
    ]
  }
];

// Quick Reference Cards for 360 Feedback
export const FEEDBACK_360_QUICK_REFERENCE = {
  employeeJourney: {
    title: 'Employee Journey',
    description: 'Your path through the 360 feedback process',
    steps: [
      { step: 1, title: 'Receive Invitation', description: 'Get notified of your participation in a 360 cycle' },
      { step: 2, title: 'Complete Self-Rating', description: 'Evaluate yourself on competencies and behaviors' },
      { step: 3, title: 'Nominate Peers', description: 'Select colleagues to provide feedback on your performance' },
      { step: 4, title: 'Await Results', description: 'Wait for raters to complete their assessments' },
      { step: 5, title: 'View Report', description: 'Access your personalized 360 feedback report' },
      { step: 6, title: 'Acknowledge Themes', description: 'Review and confirm AI-generated development themes' }
    ]
  },
  raterJourney: {
    title: 'Rater Journey',
    description: 'Your path when providing feedback for a colleague',
    steps: [
      { step: 1, title: 'Accept Request', description: 'Receive and accept a feedback request' },
      { step: 2, title: 'Complete Survey', description: 'Rate behaviors and provide written feedback' },
      { step: 3, title: 'Submit Response', description: 'Finalize and submit your assessment' },
      { step: 4, title: 'View Summary', description: 'Optionally view your submitted ratings summary' }
    ]
  },
  managerJourney: {
    title: 'Manager Journey',
    description: 'Managing your team through the 360 process',
    steps: [
      { step: 1, title: 'Review Nominations', description: 'Approve or modify peer nominations from direct reports' },
      { step: 2, title: 'Complete Manager Ratings', description: 'Provide manager feedback for each team member' },
      { step: 3, title: 'Monitor Progress', description: 'Track completion rates for your team' },
      { step: 4, title: 'Review Team Results', description: 'Access aggregated team insights' },
      { step: 5, title: 'Coach Employees', description: 'Use reports to guide development conversations' },
      { step: 6, title: 'Document Actions', description: 'Link feedback themes to IDPs and goals' }
    ]
  },
  hrAdminJourney: {
    title: 'HR Administrator Journey',
    description: 'Managing the 360 feedback program end-to-end',
    steps: [
      { step: 1, title: 'Configure Cycle', description: 'Set up cycle settings, deadlines, and questions' },
      { step: 2, title: 'Enroll Participants', description: 'Add employees with eligibility filters' },
      { step: 3, title: 'Monitor Nominations', description: 'Track and approve peer nominations' },
      { step: 4, title: 'Track Responses', description: 'Monitor completion rates and send reminders' },
      { step: 5, title: 'Handle Exceptions', description: 'Manage rater changes and anonymity issues' },
      { step: 6, title: 'Process Results', description: 'Run data quality checks and aggregations' },
      { step: 7, title: 'Approve Release', description: 'Review and approve results for distribution' },
      { step: 8, title: 'Generate Reports', description: 'Create individual and aggregate reports' },
      { step: 9, title: 'Release Results', description: 'Distribute reports to employees and managers' },
      { step: 10, title: 'Analyze Trends', description: 'Review workforce-level insights and plan actions' }
    ]
  }
};

// 360 Feedback Glossary
export const FEEDBACK_360_GLOSSARY: Array<{ term: string; definition: string; category: string }> = [
  // Core Concepts
  { term: 'Multi-Rater Feedback', definition: 'A performance assessment method collecting input from multiple sources including managers, peers, direct reports, and self-assessment.', category: 'Core Concepts' },
  { term: '360-Degree Feedback', definition: 'A comprehensive feedback approach where individuals receive confidential, anonymous feedback from people who work around them.', category: 'Core Concepts' },
  { term: 'Anonymity Threshold', definition: 'The minimum number of raters required per category before aggregated results are shown, typically 3 to protect rater identity.', category: 'Core Concepts' },
  { term: 'Rater Category', definition: 'Classification of feedback providers based on their relationship to the subject: Manager, Peer, Direct Report, Self, External.', category: 'Core Concepts' },
  { term: 'Review Cycle', definition: 'A time-bound period during which 360 feedback is collected, processed, and reported for a defined group of participants.', category: 'Core Concepts' },
  
  // Participants & Roles
  { term: 'Subject', definition: 'The employee receiving 360 feedback from multiple raters.', category: 'Participants' },
  { term: 'Rater', definition: 'Any individual providing feedback on a subject within a 360 cycle.', category: 'Participants' },
  { term: 'Peer Rater', definition: 'A colleague at a similar organizational level who provides feedback on the subject.', category: 'Participants' },
  { term: 'Direct Report Rater', definition: 'An employee who reports directly to the subject and provides upward feedback.', category: 'Participants' },
  { term: 'External Rater', definition: 'A stakeholder outside the organization (customer, vendor, partner) invited to provide feedback.', category: 'Participants' },
  { term: 'Participant', definition: 'An employee enrolled in a 360 cycle to receive feedback.', category: 'Participants' },
  
  // Process Terms
  { term: 'Peer Nomination', definition: 'The process where employees select colleagues to provide peer feedback on their performance.', category: 'Process' },
  { term: 'Feedback Request', definition: 'A formal invitation sent to a rater asking them to complete a feedback assessment.', category: 'Process' },
  { term: 'Feedback Submission', definition: 'A completed feedback response from a rater for a specific participant.', category: 'Process' },
  { term: 'Response Rate', definition: 'The percentage of requested feedback that has been completed and submitted.', category: 'Process' },
  { term: 'Results Release', definition: 'The process of making aggregated feedback reports available to participants and stakeholders.', category: 'Process' },
  { term: 'Cycle Status', definition: 'The current phase of a 360 cycle: Draft, Active, In Progress, Completed, Closed.', category: 'Process' },
  
  // Questions & Assessment
  { term: 'Behavioral Anchor', definition: 'Specific, observable behavior examples that define each rating level for a question.', category: 'Assessment' },
  { term: 'BARS', definition: 'Behaviorally Anchored Rating Scale - a rating method using specific behavioral descriptions for each level.', category: 'Assessment' },
  { term: 'Competency Question', definition: 'A rating question linked to a specific competency from the organization\'s competency framework.', category: 'Assessment' },
  { term: 'Open-Ended Question', definition: 'A question requiring narrative text response rather than a numerical rating.', category: 'Assessment' },
  { term: 'Question Assignment', definition: 'The mapping of specific questions to rater categories, controlling which questions each rater type answers.', category: 'Assessment' },
  
  // Reports & Analytics
  { term: 'Feedback Report', definition: 'A document presenting aggregated 360 feedback results for a participant.', category: 'Reports' },
  { term: 'Report Template', definition: 'A configurable format defining sections, visualizations, and content shown in feedback reports.', category: 'Reports' },
  { term: 'Audience Type', definition: 'The intended recipient category for a report template: Executive, Manager, IC, HR, Self.', category: 'Reports' },
  { term: 'Radar Chart', definition: 'A visual representation showing scores across multiple competency dimensions simultaneously.', category: 'Reports' },
  { term: 'Benchmark', definition: 'A reference score or distribution used to compare individual results against group or organizational norms.', category: 'Reports' },
  { term: 'Gap Analysis', definition: 'Comparison between self-rating and ratings from other sources to identify blind spots.', category: 'Reports' },
  
  // AI & Intelligence
  { term: 'Talent Signal', definition: 'A computed indicator derived from feedback data representing a specific capability or behavior pattern.', category: 'AI Features' },
  { term: 'Signal Snapshot', definition: 'A point-in-time record of computed talent signals for an employee.', category: 'AI Features' },
  { term: 'Development Theme', definition: 'An AI-identified pattern of feedback suggesting a specific area for growth or development.', category: 'AI Features' },
  { term: 'Writing Quality Score', definition: 'An AI-computed metric assessing the clarity, specificity, and actionability of written feedback.', category: 'AI Features' },
  { term: 'Bias Detection', definition: 'AI analysis identifying potential bias indicators in feedback responses.', category: 'AI Features' },
  { term: 'Confidence Score', definition: 'A metric indicating the reliability of a computed insight based on data quality and quantity.', category: 'AI Features' },
  
  // Governance & Compliance
  { term: 'Consent Record', definition: 'Documentation of a rater\'s agreement to participate and terms of data usage.', category: 'Governance' },
  { term: 'Data Policy', definition: 'Configured rules governing data retention, access, and processing for 360 feedback.', category: 'Governance' },
  { term: 'Investigation Mode', definition: 'A controlled access state allowing authorized review of identifiable feedback under documented justification.', category: 'Governance' },
  { term: 'Investigation Request', definition: 'A formal request to access identifiable feedback data, requiring approval and documentation.', category: 'Governance' },
  { term: 'Access Log', definition: 'Audit trail recording who accessed what data and when within the 360 system.', category: 'Governance' },
  { term: 'Exception', definition: 'A documented deviation from standard 360 process rules, requiring approval and justification.', category: 'Governance' },
  { term: 'Rater Exception', definition: 'A recorded reason for a rater being unable to complete feedback (conflict of interest, unavailable, etc.).', category: 'Governance' },
  
  // Visibility & Access
  { term: 'Visibility Rules', definition: 'Configuration controlling what information is shown to different user roles.', category: 'Visibility' },
  { term: 'Release Trigger', definition: 'The condition or action that makes results visible: immediate, cycle_close, or manual_release.', category: 'Visibility' },
  { term: 'Reviewer Breakdown', definition: 'Display option showing scores separated by rater category rather than aggregate only.', category: 'Visibility' },
  { term: 'HR Approval', definition: 'A gate requiring HR authorization before results are released to employees.', category: 'Visibility' },
  
  // Integration
  { term: 'CRGV+360 Model', definition: 'The comprehensive appraisal framework incorporating Goals, Responsibilities, Competencies, Values, and 360 Feedback.', category: 'Integration' },
  { term: 'IDP Link', definition: 'Connection between 360 feedback themes and Individual Development Plan goals.', category: 'Integration' },
  { term: 'Nine-Box Mapping', definition: 'Using 360 signals as inputs to performance/potential grid placement.', category: 'Integration' },
  { term: 'Training Recommendation', definition: 'AI-suggested learning content based on 360 identified development areas.', category: 'Integration' }
];

// Database Tables Reference
export const FEEDBACK_360_DATABASE_TABLES = [
  { table: 'review_cycles', description: 'Core cycle configuration and lifecycle management', section: '2.11, 3.1' },
  { table: 'review_participants', description: 'Participant enrollment and status tracking', section: '3.2' },
  { table: 'feedback_360_cycles', description: '360-specific cycle extensions and settings', section: '2.11' },
  { table: 'feedback_360_rater_categories', description: 'Rater type configuration', section: '2.2' },
  { table: 'feedback_360_questions', description: 'Question bank and competency mappings', section: '2.3' },
  { table: 'feedback_360_requests', description: 'Rater assignment and request tracking', section: '3.4' },
  { table: 'feedback_360_responses', description: 'Individual response records', section: '3.5' },
  { table: 'feedback_submissions', description: 'Submission status and completion tracking', section: '3.5' },
  { table: 'peer_nominations', description: 'Peer nomination workflow', section: '3.3' },
  { table: 'rater_relationships', description: 'Rater-subject relationship metadata', section: '3.4' },
  { table: 'rater_exceptions', description: 'Exception handling records', section: '4.5' },
  { table: 'feedback_report_templates', description: 'Report configuration', section: '2.6, 6.1' },
  { table: 'feedback_frameworks', description: 'Competency framework library', section: '2.8' },
  { table: 'feedback_data_policies', description: 'Data governance configuration', section: '4.3' },
  { table: 'feedback_consent_records', description: 'Rater consent tracking', section: '4.2' },
  { table: 'feedback_investigation_requests', description: 'Investigation mode requests', section: '4.4' },
  { table: 'feedback_investigation_access_log', description: 'Investigation access audit', section: '4.4' },
  { table: 'feedback_exceptions', description: 'Process exception records', section: '4.5' },
  { table: 'feedback_writing_quality', description: 'AI writing analysis results', section: '5.3' },
  { table: 'feedback_writing_suggestions', description: 'AI improvement suggestions', section: '5.3' },
  { table: 'feedback_ai_action_logs', description: 'AI action audit trail', section: '5.6' },
  { table: 'talent_signal_definitions', description: 'Signal configuration', section: '2.9' },
  { table: 'talent_signal_snapshots', description: 'Computed signal records', section: '5.1' },
  { table: 'development_themes', description: 'AI-generated development themes', section: '5.2' },
  { table: 'continuous_feedback', description: 'Continuous feedback connection', section: '7.6' },
  { table: 'review_360_question_assignments', description: 'Question-rater category matrix', section: '2.3' }
];

export type { ManualSection, IndustryContext, ManualCallout, TroubleshootingItem };
