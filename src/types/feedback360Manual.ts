import { ManualSection, IndustryContext } from './adminManual';

// ============================================================================
// 360 FEEDBACK MANUAL - STRUCTURE DEFINITION
// Version: 2.0.0
// Follows industry-standard implementation sequence:
// Prerequisites → Rating Foundation → Content → Process → Governance → Outputs → Advanced
// ============================================================================

// Re-export for convenience
export type { ManualSection, IndustryContext };

// Extended section type with 360-specific fields
export interface Feedback360Section extends ManualSection {
  tableReferences?: string[];
  fieldMappings?: { field: string; table: string; description: string }[];
}

// ============================================================================
// MANUAL STRUCTURE (ARRAY FORMAT for compatibility with .find(), .filter(), etc.)
// ============================================================================

export const FEEDBACK_360_MANUAL_STRUCTURE: Feedback360Section[] = [
  // ========================================================================
  // PART 1: SYSTEM ARCHITECTURE & OVERVIEW
  // ========================================================================
  {
    id: 'part-1',
    sectionNumber: '1',
    title: 'System Architecture & Overview',
    description: 'Understanding the 360 feedback system architecture, user personas, and key concepts',
    contentLevel: 'overview',
    estimatedReadTime: 40,
    targetRoles: ['Admin', 'Consultant', 'HR Partner'],
    subsections: [
      {
        id: 'sec-1-1',
        sectionNumber: '1.1',
        title: 'User Personas & Access Rights',
        description: 'Understanding roles and permissions in the 360 feedback system',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant', 'HR Partner']
      },
      {
        id: 'sec-1-2',
        sectionNumber: '1.2',
        title: 'Database Architecture',
        description: 'Core tables, relationships, and data flow for 360 feedback',
        contentLevel: 'reference',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant']
      },
      {
        id: 'sec-1-3',
        sectionNumber: '1.3',
        title: 'Multi-Rater Concepts',
        description: 'Understanding rater categories, anonymity, and aggregation',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant', 'HR Partner']
      },
      {
        id: 'sec-1-4',
        sectionNumber: '1.4',
        title: 'Performance Integration',
        description: 'How 360 feedback integrates with performance management',
        contentLevel: 'concept',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'Consultant', 'HR Partner']
      }
    ]
  },
  // ========================================================================
  // PART 2: SETUP & CONFIGURATION GUIDE
  // Industry-standard sequence: Prerequisites → Foundation → Content → Process → Governance → Outputs → Advanced
  // ========================================================================
  {
    id: 'part-2',
    sectionNumber: '2',
    title: 'Setup & Configuration Guide',
    description: 'Complete setup instructions for 360 feedback system components',
    contentLevel: 'procedure',
    estimatedReadTime: 135,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      // Group A: Prerequisites (Section 2.1)
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
      // Group B: Rating Foundation (Sections 2.2-2.3)
      {
        id: 'sec-2-2',
        sectionNumber: '2.2',
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
        id: 'sec-2-3',
        sectionNumber: '2.3',
        title: 'Behavioral Anchors & BARS',
        description: 'Configuring behavioral anchors for objective rating criteria',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Initial setup, annual review',
          timing: 'Post rating scale configuration',
          benchmark: 'BARS (Behaviorally Anchored Rating Scales) methodology'
        }
      },
      // Group C: Content Configuration (Sections 2.4-2.7)
      {
        id: 'sec-2-4',
        sectionNumber: '2.4',
        title: 'Competency Integration',
        description: 'Link competency framework to 360 questions and behavioral anchors',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time setup',
          timing: 'Post rating foundation',
          benchmark: 'Core Framework shared configuration'
        }
      },
      {
        id: 'sec-2-5',
        sectionNumber: '2.5',
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
        id: 'sec-2-6',
        sectionNumber: '2.6',
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
        id: 'sec-2-7',
        sectionNumber: '2.7',
        title: 'Question Bank Setup',
        description: 'Creating questions, linking to competencies, assigning to rater categories',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Initial setup, quarterly updates',
          timing: 'Post competency and rater category setup',
          benchmark: '15-40 questions per cycle, 5-7 minutes completion time'
        }
      },
      // Group D: Process Configuration (Sections 2.8-2.9)
      {
        id: 'sec-2-8',
        sectionNumber: '2.8',
        title: 'Approval Workflows',
        description: '360-specific approval workflows for nominations, results release, and investigations',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time setup, annual review',
          timing: 'Pre-implementation',
          benchmark: 'Core Framework shared configuration'
        }
      },
      {
        id: 'sec-2-9',
        sectionNumber: '2.9',
        title: 'Notifications',
        description: 'Configure 360-specific notifications and reminder templates',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time setup, annual review',
          timing: 'Pre-implementation',
          benchmark: 'Core Framework shared configuration'
        }
      },
      // Group E: Governance (Section 2.10)
      {
        id: 'sec-2-10',
        sectionNumber: '2.10',
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
      // Group F: Outputs & Reporting (Section 2.11)
      {
        id: 'sec-2-11',
        sectionNumber: '2.11',
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
      // Group G: Analytics Integration (Sections 2.12-2.13)
      {
        id: 'sec-2-12',
        sectionNumber: '2.12',
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
        id: 'sec-2-13',
        sectionNumber: '2.13',
        title: 'Performance Trends',
        description: 'Configure 360 contribution to Performance Index and talent signals',
        contentLevel: 'procedure',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time setup',
          timing: 'Post signal definitions',
          benchmark: 'Core Framework shared configuration'
        }
      },
      // Group H: Advanced Configuration (Sections 2.14-2.15)
      {
        id: 'sec-2-14',
        sectionNumber: '2.14',
        title: 'External Rater Configuration',
        description: 'Enabling customer and vendor feedback with invitation flows',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Post core configuration',
          benchmark: 'Optional for customer-facing roles'
        }
      },
      {
        id: 'sec-2-15',
        sectionNumber: '2.15',
        title: 'Cycle Templates & Cloning',
        description: 'Creating reusable templates for rapid cycle deployment',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per cycle type',
          timing: 'Post initial cycle completion',
          benchmark: 'Template-based deployment for consistency'
        }
      }
    ]
  },
  // ========================================================================
  // PART 3: CYCLE MANAGEMENT WORKFLOWS
  // ========================================================================
  {
    id: 'part-3',
    sectionNumber: '3',
    title: 'Cycle Management Workflows',
    description: 'Complete operational guide for managing 360 feedback cycles from creation to results release',
    contentLevel: 'procedure',
    estimatedReadTime: 140,
    targetRoles: ['Admin', 'HR Partner'],
    subsections: [
      {
        id: 'sec-3-1',
        sectionNumber: '3.1',
        title: 'Cycle Lifecycle Management',
        description: 'Understanding cycle status progression, triggers, permissions, and rollback scenarios',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per cycle',
          timing: 'Throughout cycle duration',
          benchmark: 'Draft → Active → In Progress → Completed → Closed lifecycle'
        }
      },
      {
        id: 'sec-3-2',
        sectionNumber: '3.2',
        title: 'Creating a New Cycle',
        description: 'Step-by-step guide to creating and configuring a 360 feedback cycle with timeline and options',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Annual or bi-annual',
          timing: '6-8 weeks before feedback period',
          benchmark: 'Plan for 2-3 week nomination + 3-4 week feedback window'
        }
      },
      {
        id: 'sec-3-3',
        sectionNumber: '3.3',
        title: 'Participant Enrollment',
        description: 'Managing target employees, bulk enrollment, eligibility rules, and exclusions',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per cycle',
          timing: 'At cycle creation',
          benchmark: 'Auto-enroll based on job family, tenure, or performance tier'
        }
      },
      {
        id: 'sec-3-4',
        sectionNumber: '3.4',
        title: 'Peer Nomination Workflows',
        description: 'Self-nomination, manager approval, min/max thresholds, and nomination deadline management',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per cycle',
          timing: 'Nomination phase (2-3 weeks)',
          benchmark: 'Manager approval required; 3-5 peer minimum recommended'
        }
      },
      {
        id: 'sec-3-5',
        sectionNumber: '3.5',
        title: 'Rater Assignment & Requests',
        description: 'Managing feedback requests, mandatory vs optional raters, and decline handling',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per cycle',
          timing: 'Post nomination approval',
          benchmark: 'System-generated requests with HR override capability'
        }
      },
      {
        id: 'sec-3-6',
        sectionNumber: '3.6',
        title: 'External Rater Invitations',
        description: 'Customer and vendor feedback flows, consent management, and secure access tokens',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'As needed',
          timing: 'During nomination phase',
          benchmark: 'Token-based access with 30-day expiration'
        }
      },
      {
        id: 'sec-3-7',
        sectionNumber: '3.7',
        title: 'Feedback Collection Window',
        description: 'Managing response submission, save-as-draft, deadline extensions, and question navigation',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'During feedback window',
          timing: '3-4 weeks duration',
          benchmark: '80%+ completion rate target; 5-7 minute completion time'
        }
      },
      {
        id: 'sec-3-8',
        sectionNumber: '3.8',
        title: 'Response Monitoring',
        description: 'Real-time completion tracking, dashboard metrics, and bulk selection for follow-up',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Daily during collection',
          timing: 'Throughout feedback window',
          benchmark: 'Monitor completion by rater category; target 85%+ response rate'
        }
      },
      {
        id: 'sec-3-9',
        sectionNumber: '3.9',
        title: 'Reminder Management',
        description: 'Automated reminder schedules, manual bulk reminders, and tracking reminder effectiveness',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per cycle',
          timing: 'During feedback window',
          benchmark: 'Default: 7, 3, 1 days before deadline; 15-20% response lift per reminder'
        }
      },
      {
        id: 'sec-3-10',
        sectionNumber: '3.10',
        title: 'Results Processing',
        description: 'Score aggregation, anonymity threshold enforcement, category-based calculations, and signal processing',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Post feedback window',
          timing: 'Within 48 hours of close',
          benchmark: 'Automated calculation with manual review option; minimum 3 raters for anonymity'
        }
      },
      {
        id: 'sec-3-11',
        sectionNumber: '3.11',
        title: 'Results Release Management',
        description: 'Staged release workflows, preview dialogs, notification triggers, and audit logging',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Post processing',
          timing: 'Configurable release schedule',
          benchmark: 'Staged release: HR Review → Manager → Employee'
        }
      },
      {
        id: 'sec-3-12',
        sectionNumber: '3.12',
        title: 'Investigation Mode',
        description: 'Controlled disclosure of anonymous feedback, HR approval workflow, and outcome recording',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Exception-based',
          timing: 'Post-release as needed',
          benchmark: 'HR Director approval required; full audit trail mandatory'
        }
      }
    ]
  },
  // ========================================================================
  // PART 4: GOVERNANCE & COMPLIANCE
  // Industry-standard sequence: Foundation → Consent → Data → Exceptions → Investigations → AI → Audit
  // ========================================================================
  {
    id: 'part-4',
    sectionNumber: '4',
    title: 'Governance & Compliance',
    description: 'Complete governance framework for 360 feedback: anonymity, consent, data policies, investigations, AI governance, regulatory compliance, and audit',
    contentLevel: 'reference',
    estimatedReadTime: 140,
    targetRoles: ['Admin', 'HR Partner', 'DPO', 'Compliance', 'Legal'],
    subsections: [
      // Group A: Anonymity Foundation (4.1-4.2)
      {
        id: 'sec-4-1',
        sectionNumber: '4.1',
        title: 'Anonymity Architecture',
        description: 'Understanding the multi-layer anonymity model, k-anonymity principles, and protection mechanisms',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Reference document',
          timing: 'Pre-implementation understanding',
          benchmark: 'K-anonymity model with category-based thresholds'
        }
      },
      {
        id: 'sec-4-2',
        sectionNumber: '4.2',
        title: 'Threshold Configuration',
        description: 'Configuring minimum rater counts, bypass conditions, and visibility rules',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time setup, annual review',
          timing: 'Pre-implementation',
          benchmark: 'Minimum 3 raters per category for anonymity (industry standard)'
        }
      },
      // Group B: Consent Framework (4.3-4.4)
      {
        id: 'sec-4-3',
        sectionNumber: '4.3',
        title: 'Consent Management Framework',
        description: 'Understanding 6 consent types, GDPR requirements, versioning, and withdrawal rights',
        contentLevel: 'concept',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Reference document',
          timing: 'Pre-implementation',
          benchmark: 'GDPR Article 7 compliant consent management'
        }
      },
      {
        id: 'sec-4-4',
        sectionNumber: '4.4',
        title: 'Consent Collection Workflows',
        description: 'Implementing consent gates, processing withdrawals, and generating consent reports',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per cycle enrollment',
          timing: 'Cycle launch',
          benchmark: 'Required consents must be collected before feedback submission'
        }
      },
      // Group C: Data Policies (4.5-4.6)
      {
        id: 'sec-4-5',
        sectionNumber: '4.5',
        title: 'Data Policy Configuration',
        description: 'Configuring 6 policy types: retention, anonymization, AI usage, external access, signal aggregation, cross-module sharing',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time setup, annual review',
          timing: 'Pre-implementation',
          benchmark: 'Policy versioning for audit trail compliance'
        }
      },
      {
        id: 'sec-4-6',
        sectionNumber: '4.6',
        title: 'Data Retention & Anonymization',
        description: 'Configuring retention periods (3-7 years), anonymization schedules, and regulatory compliance',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Annual review',
          timing: 'Policy configuration',
          benchmark: 'Caribbean/Africa: 3-7 years retention; GDPR: purpose-limited retention'
        }
      },
      // Group D: Exception Handling (4.7)
      {
        id: 'sec-4-7',
        sectionNumber: '4.7',
        title: 'Exception Handling & Approvals',
        description: 'Managing anonymity bypasses, deadline extensions, rater substitutions, and approval workflows',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Exception-based',
          timing: 'During cycle operation',
          benchmark: 'Multi-level approval with time-limited validity'
        }
      },
      // Group E: Investigation Mode (4.8)
      {
        id: 'sec-4-8',
        sectionNumber: '4.8',
        title: 'Investigation Mode',
        description: 'Controlled disclosure procedures, HR Director approval, legal considerations, and outcome documentation',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Exception-based',
          timing: 'Post-release as needed',
          benchmark: 'HR Director approval mandatory; full audit trail required'
        }
      },
      // Group F: AI Governance (4.9)
      {
        id: 'sec-4-9',
        sectionNumber: '4.9',
        title: 'AI Governance & Explainability',
        description: 'ISO 42001 alignment, AI action logging, human overrides, confidence thresholds, and bias monitoring',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Continuous monitoring',
          timing: 'Throughout system operation',
          benchmark: 'ISO 42001 AI management system requirements'
        }
      },
      // Group G: Audit & Compliance (4.10)
      {
        id: 'sec-4-10',
        sectionNumber: '4.10',
        title: 'Audit Logging & Compliance Reports',
        description: 'Comprehensive audit trails, compliance report generation, and external audit response procedures',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Continuous + annual audit',
          timing: 'Throughout system operation',
          benchmark: 'Complete audit trail for all governance actions'
        }
      },
      // Group H: Regulatory Compliance (4.11-4.14)
      {
        id: 'sec-4-11',
        sectionNumber: '4.11',
        title: 'Data Subject Rights (DSAR)',
        description: 'GDPR Articles 15-22 compliance: access, rectification, erasure, portability, and objection rights workflows',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner', 'DPO'],
        industryContext: {
          frequency: 'As-needed',
          timing: 'Within 30 days of request',
          benchmark: 'GDPR Articles 15-22'
        }
      },
      {
        id: 'sec-4-12',
        sectionNumber: '4.12',
        title: 'Breach Notification Procedures',
        description: '72-hour notification workflow, incident classification, authority reporting, and remediation tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner', 'DPO', 'Legal'],
        industryContext: {
          frequency: 'Incident-driven',
          timing: 'Within 72 hours of detection',
          benchmark: 'GDPR Article 33'
        }
      },
      {
        id: 'sec-4-13',
        sectionNumber: '4.13',
        title: 'Cross-Border Data Transfer',
        description: 'Regional data residency, transfer mechanisms (SCCs, BCRs), and Caribbean/Africa compliance requirements',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'DPO', 'Legal'],
        industryContext: {
          frequency: 'Initial setup + changes',
          timing: 'Pre-implementation',
          benchmark: 'GDPR Chapter V'
        }
      },
      {
        id: 'sec-4-14',
        sectionNumber: '4.14',
        title: 'Data Protection Impact Assessment',
        description: 'DPIA triggers, risk assessment methodology, DPO consultation, and approval workflows',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'DPO'],
        industryContext: {
          frequency: 'Annual + new processing',
          timing: 'Before AI features enabled',
          benchmark: 'GDPR Article 35'
        }
      }
    ]
  },
  // ========================================================================
  // PART 5: AI & INTELLIGENCE FEATURES
  // Industry-standard sequence: Overview → Processing → Analysis → Coaching → Integration → Governance
  // ========================================================================
  {
    id: 'part-5',
    sectionNumber: '5',
    title: 'AI & Intelligence Features',
    description: 'Comprehensive AI-powered capabilities for 360 feedback: signal processing, theme generation, writing quality, bias detection, coaching prompts, and cross-module intelligence',
    contentLevel: 'concept',
    estimatedReadTime: 90,
    targetRoles: ['Admin', 'HR Partner', 'Manager'],
    subsections: [
      // Group A: Foundation (5.1)
      {
        id: 'sec-5-1',
        sectionNumber: '5.1',
        title: 'AI Capabilities Overview',
        description: 'Understanding AI scope, human-in-the-loop model, consent requirements, and ISO 42001 governance principles',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner', 'Manager'],
        industryContext: {
          frequency: 'Reference document',
          timing: 'Pre-implementation understanding',
          benchmark: 'Human-in-the-loop AI with full explainability'
        }
      },
      // Group B: Core Processing (5.2-5.3)
      {
        id: 'sec-5-2',
        sectionNumber: '5.2',
        title: 'Signal Processing Engine',
        description: 'How feedback responses are transformed into talent signals with confidence scoring and aggregation methods',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per cycle completion',
          timing: 'Automated post-collection',
          benchmark: 'Signal extraction with confidence thresholds (>0.7 recommended)'
        }
      },
      {
        id: 'sec-5-3',
        sectionNumber: '5.3',
        title: 'Development Theme Generation',
        description: 'AI-powered theme extraction from feedback patterns with confirmation workflows and signal linking',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per cycle completion',
          timing: 'Post signal processing',
          benchmark: 'Manager/HR confirmation required before IDP linkage'
        }
      },
      // Group C: Real-Time Analysis (5.4-5.6)
      {
        id: 'sec-5-4',
        sectionNumber: '5.4',
        title: 'Writing Quality Analysis',
        description: 'Real-time feedback improvement: clarity, specificity, behavioral focus, and actionability scoring',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'During feedback submission',
          timing: 'Real-time as raters type',
          benchmark: 'Target 70+ quality score; suggestions improve by 15-25%'
        }
      },
      {
        id: 'sec-5-5',
        sectionNumber: '5.5',
        title: 'Bias Detection & Warnings',
        description: 'EEOC-aligned bias detection: gender-coded language, age bias, vague language, and mitigation workflows',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'During feedback submission',
          timing: 'Real-time inline warnings',
          benchmark: 'Advisory not blocking; all incidents logged for pattern analysis'
        }
      },
      {
        id: 'sec-5-6',
        sectionNumber: '5.6',
        title: 'Sentiment Analysis',
        description: 'NLP-powered sentiment detection, tone aggregation, and trend identification across feedback',
        contentLevel: 'concept',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per response processing',
          timing: 'Automated post-submission',
          benchmark: 'Positive/Neutral/Negative/Mixed classification with confidence'
        }
      },
      // Group D: Insight Generation (5.7-5.8)
      {
        id: 'sec-5-7',
        sectionNumber: '5.7',
        title: 'Blind Spot Identification',
        description: 'Self vs. Others perception gap analysis, hidden strengths detection, and insight presentation',
        contentLevel: 'concept',
        estimatedReadTime: 6,
        targetRoles: ['HR Partner', 'Manager'],
        industryContext: {
          frequency: 'Per cycle results',
          timing: 'Results processing',
          benchmark: 'Gap threshold of ±0.5 points signals blind spot'
        }
      },
      {
        id: 'sec-5-8',
        sectionNumber: '5.8',
        title: 'Coaching Prompts Generation',
        description: 'AI-generated conversation starters for managers based on feedback themes and blind spots',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['HR Partner', 'Manager'],
        industryContext: {
          frequency: 'Per cycle results',
          timing: 'Post results release',
          benchmark: '4 prompt categories: strength, development, blind spot, exploration'
        }
      },
      // Group E: Development Integration (5.9-5.10)
      {
        id: 'sec-5-9',
        sectionNumber: '5.9',
        title: 'IDP & Learning Integration',
        description: 'Linking AI-generated themes to IDP goals, learning path recommendations, and course suggestions',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per theme confirmation',
          timing: 'Post theme generation',
          benchmark: 'Link types: derived, informed, validated'
        }
      },
      {
        id: 'sec-5-10',
        sectionNumber: '5.10',
        title: 'Remeasurement & Progress Tracking',
        description: 'AI-recommended follow-up assessments, progress comparison, and development validation',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: '6-12 months post-cycle',
          timing: 'Scheduled follow-up',
          benchmark: 'Pulse (5-7 questions) or full 360 remeasurement'
        }
      },
      // Group F: Cross-Module Intelligence (5.11)
      {
        id: 'sec-5-11',
        sectionNumber: '5.11',
        title: 'Cross-Module AI Intelligence',
        description: 'How 360 AI insights feed Appraisals, Succession, L&D, and Workforce Planning modules',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Continuous integration',
          timing: 'Post cycle completion',
          benchmark: 'Signal routing based on cycle purpose and consent'
        }
      },
      // Group G: AI Governance (5.12)
      {
        id: 'sec-5-12',
        sectionNumber: '5.12',
        title: 'AI Explainability & Human Override',
        description: 'ISO 42001 compliance, AI action audit logging, human override documentation, and confidence display',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Continuous monitoring',
          timing: 'Throughout AI operations',
          benchmark: 'All AI outputs logged with model version, confidence, and decision factors'
        }
      }
    ]
  },
  // ========================================================================
  // PART 6: ANALYTICS & REPORTING
  // ========================================================================
  {
    id: 'part-6',
    sectionNumber: '6',
    title: 'Analytics & Reporting',
    description: 'Understanding and utilizing 360 feedback analytics',
    contentLevel: 'reference',
    estimatedReadTime: 30,
    targetRoles: ['Admin', 'HR Partner', 'Manager'],
    subsections: [
      {
        id: 'sec-6-1',
        sectionNumber: '6.1',
        title: 'Individual Feedback Reports',
        description: 'Understanding the employee feedback report structure',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['HR Partner', 'Manager']
      },
      {
        id: 'sec-6-2',
        sectionNumber: '6.2',
        title: 'Team & Organizational Analytics',
        description: 'Aggregate insights across teams, departments, and the organization',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner']
      },
      {
        id: 'sec-6-3',
        sectionNumber: '6.3',
        title: 'Trend Analysis',
        description: 'Year-over-year comparisons and improvement tracking',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner']
      }
    ]
  },
  // ========================================================================
  // PART 7: INTEGRATION & ADVANCED
  // ========================================================================
  {
    id: 'part-7',
    sectionNumber: '7',
    title: 'Integration & Advanced',
    description: 'System integrations and advanced configuration options',
    contentLevel: 'reference',
    estimatedReadTime: 20,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      {
        id: 'sec-7-1',
        sectionNumber: '7.1',
        title: 'Performance Index Integration',
        description: 'How 360 scores contribute to the unified Performance Index',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant']
      },
      {
        id: 'sec-7-2',
        sectionNumber: '7.2',
        title: 'Succession Planning Links',
        description: 'Using 360 data for talent calibration and succession readiness',
        contentLevel: 'concept',
        estimatedReadTime: 7,
        targetRoles: ['Admin', 'HR Partner']
      },
      {
        id: 'sec-7-3',
        sectionNumber: '7.3',
        title: 'Learning Recommendations',
        description: 'Triggering learning paths based on 360 feedback patterns',
        contentLevel: 'concept',
        estimatedReadTime: 5,
        targetRoles: ['Admin']
      }
    ]
  },
  // ========================================================================
  // PART 8: TROUBLESHOOTING
  // ========================================================================
  {
    id: 'part-8',
    sectionNumber: '8',
    title: 'Troubleshooting',
    description: 'Common issues and resolution steps',
    contentLevel: 'troubleshooting',
    estimatedReadTime: 15,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      {
        id: 'sec-8-1',
        sectionNumber: '8.1',
        title: 'Common Configuration Issues',
        description: 'Resolving setup and configuration problems',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'Consultant']
      },
      {
        id: 'sec-8-2',
        sectionNumber: '8.2',
        title: 'Cycle Management Issues',
        description: 'Handling nomination, feedback, and release problems',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'HR Partner']
      },
      {
        id: 'sec-8-3',
        sectionNumber: '8.3',
        title: 'Report & Analytics Issues',
        description: 'Troubleshooting report generation and data discrepancies',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 5,
        targetRoles: ['Admin']
      }
    ]
  }
];

// ============================================================================
// GLOSSARY DATA
// ============================================================================

export const FEEDBACK_360_GLOSSARY = [
  { term: '360 Feedback', definition: 'Multi-rater feedback process collecting input from various stakeholders around an employee', category: 'Core Concepts' },
  { term: 'Anonymity Threshold', definition: 'Minimum number of raters required in a category before individual responses are aggregated', category: 'Governance' },
  { term: 'Behavioral Anchor', definition: 'Specific observable behavior tied to a rating level on a scale', category: 'Configuration' },
  { term: 'BARS', definition: 'Behaviorally Anchored Rating Scales - a rating method linking numeric scores to specific behaviors', category: 'Configuration' },
  { term: 'Cycle', definition: 'A defined period during which 360 feedback is collected, processed, and released', category: 'Core Concepts' },
  { term: 'Direct Report', definition: 'An employee who reports directly to the feedback recipient', category: 'Rater Categories' },
  { term: 'External Rater', definition: 'A non-employee providing feedback, such as a customer or vendor', category: 'Rater Categories' },
  { term: 'Framework Library', definition: 'Collection of reusable competency and question frameworks', category: 'Configuration' },
  { term: 'Manager Rater', definition: 'The direct manager of the feedback recipient', category: 'Rater Categories' },
  { term: 'Nomination', definition: 'The process of selecting raters to provide feedback', category: 'Workflows' },
  { term: 'Participant', definition: 'The employee receiving 360 feedback (target of the feedback)', category: 'Core Concepts' },
  { term: 'Peer Rater', definition: 'A colleague at the same organizational level as the feedback recipient', category: 'Rater Categories' },
  { term: 'Question Bank', definition: 'Library of approved questions organized by competency and rater type', category: 'Configuration' },
  { term: 'Rater', definition: 'Any individual providing feedback on a participant', category: 'Core Concepts' },
  { term: 'Rater Category', definition: 'Classification of raters (Self, Manager, Peer, Direct Report, External)', category: 'Configuration' },
  { term: 'Release', definition: 'The controlled distribution of feedback results to designated audiences', category: 'Workflows' },
  { term: 'Self-Assessment', definition: 'The participant\'s own rating of their performance/behaviors', category: 'Rater Categories' },
  { term: 'Signal', definition: 'A talent insight derived from 360 feedback data for analytics', category: 'Analytics' },
  { term: 'Skip-Level Manager', definition: 'The manager\'s manager (two levels above the feedback recipient)', category: 'Rater Categories' },
  { term: 'Visibility Rules', definition: 'Configuration determining who can see what feedback data and when', category: 'Governance' }
];

// ============================================================================
// QUICK REFERENCE DATA
// ============================================================================

export const FEEDBACK_360_QUICK_REFERENCE = {
  employeeJourney: {
    title: 'Employee Journey',
    description: 'Key steps for employees participating in 360 feedback',
    steps: [
      { step: 1, title: 'Receive Notification', description: 'Get invited to participate in a 360 feedback cycle' },
      { step: 2, title: 'Nominate Raters', description: 'Select peers and optionally external raters for feedback' },
      { step: 3, title: 'Complete Self-Assessment', description: 'Rate yourself on all competencies and behaviors' },
      { step: 4, title: 'Await Results', description: 'Wait for feedback collection and processing to complete' },
      { step: 5, title: 'Review Report', description: 'Access your personalized feedback report when released' },
      { step: 6, title: 'Create Action Plan', description: 'Work with manager to develop improvement goals' }
    ]
  },
  raterJourney: {
    title: 'Rater Journey',
    description: 'Key steps for providing 360 feedback',
    steps: [
      { step: 1, title: 'Receive Request', description: 'Get notified about feedback request(s)' },
      { step: 2, title: 'Accept/Decline', description: 'Confirm participation or decline with reason' },
      { step: 3, title: 'Complete Survey', description: 'Provide ratings and optional comments' },
      { step: 4, title: 'Submit Feedback', description: 'Finalize and submit your responses' }
    ]
  },
  managerJourney: {
    title: 'Manager Journey',
    description: 'Key responsibilities for managers in 360 feedback',
    steps: [
      { step: 1, title: 'Approve Nominations', description: 'Review and approve peer/external rater selections' },
      { step: 2, title: 'Provide Feedback', description: 'Complete manager feedback for direct reports' },
      { step: 3, title: 'Monitor Progress', description: 'Track completion rates for your team' },
      { step: 4, title: 'Review Results', description: 'Access team member feedback reports' },
      { step: 5, title: 'Conduct Debrief', description: 'Discuss results and development plans with employees' }
    ]
  },
  hrAdminJourney: {
    title: 'HR Admin Journey',
    description: 'Key administrative tasks for 360 feedback cycles',
    steps: [
      { step: 1, title: 'Configure Cycle', description: 'Set up cycle parameters, dates, and participants' },
      { step: 2, title: 'Manage Nominations', description: 'Validate rater selections and handle exceptions' },
      { step: 3, title: 'Monitor Collection', description: 'Track completion rates and send reminders' },
      { step: 4, title: 'Process Results', description: 'Generate reports and validate data quality' },
      { step: 5, title: 'Manage Release', description: 'Control staged release to different audiences' },
      { step: 6, title: 'Analyze Trends', description: 'Review organizational insights and patterns' }
    ]
  }
};

// ============================================================================
// DATABASE TABLE REFERENCE
// ============================================================================

export const FEEDBACK_360_TABLES = {
  cycles: {
    name: 'feedback_360_cycles',
    description: 'Stores 360 feedback cycle definitions and configuration',
    keyFields: ['cycle_name', 'status', 'nomination_start_date', 'feedback_end_date']
  },
  participants: {
    name: 'feedback_360_participants',
    description: 'Target employees enrolled in a 360 cycle',
    keyFields: ['cycle_id', 'employee_id', 'status', 'manager_id']
  },
  raters: {
    name: 'feedback_360_raters',
    description: 'Individual raters assigned to provide feedback',
    keyFields: ['participant_id', 'rater_id', 'rater_category', 'status']
  },
  responses: {
    name: 'feedback_360_responses',
    description: 'Individual question responses from raters',
    keyFields: ['rater_id', 'question_id', 'numeric_rating', 'text_response']
  },
  raterCategories: {
    name: 'feedback_360_rater_categories',
    description: 'Defines rater types (Manager, Peer, Direct Report, etc.)',
    keyFields: ['category_code', 'category_name', 'is_anonymous', 'min_raters']
  },
  questions: {
    name: 'feedback_360_questions',
    description: 'Question bank for 360 feedback cycles',
    keyFields: ['question_text', 'question_type', 'competency_id', 'is_required']
  },
  frameworks: {
    name: 'feedback_360_frameworks',
    description: 'Reusable question frameworks for different audiences',
    keyFields: ['framework_name', 'target_audience', 'version', 'is_active']
  },
  aggregatedScores: {
    name: 'feedback_360_aggregated_scores',
    description: 'Calculated scores by competency and rater category',
    keyFields: ['participant_id', 'competency_id', 'rater_category', 'average_score']
  },
  reports: {
    name: 'feedback_360_reports',
    description: 'Generated feedback reports for participants',
    keyFields: ['participant_id', 'report_type', 'generated_at', 'released_at']
  },
  visibilityRules: {
    name: 'feedback_360_visibility_rules',
    description: 'Access control rules for feedback data',
    keyFields: ['cycle_id', 'role', 'can_view_scores', 'can_view_comments']
  },
  releaseSchedules: {
    name: 'feedback_360_release_schedules',
    description: 'Staged release timing for different audiences',
    keyFields: ['cycle_id', 'audience', 'release_date', 'is_released']
  },
  signalMappings: {
    name: 'feedback_360_signal_mappings',
    description: 'Maps 360 results to talent signals for Performance Index',
    keyFields: ['question_id', 'signal_type', 'weight']
  },
  externalRaters: {
    name: 'feedback_360_external_raters',
    description: 'External (non-employee) raters for customer/vendor feedback',
    keyFields: ['email', 'name', 'organization', 'invitation_token']
  }
};

// ============================================================================
// RATER CATEGORY REFERENCE
// ============================================================================

export const RATER_CATEGORIES = [
  { code: 'SELF', name: 'Self', description: 'Employee self-assessment', isAnonymous: false, minRaters: 1, maxRaters: 1, requiresApproval: false },
  { code: 'MANAGER', name: 'Manager', description: 'Direct manager feedback', isAnonymous: false, minRaters: 1, maxRaters: 1, requiresApproval: false },
  { code: 'PEER', name: 'Peer', description: 'Colleague feedback at same level', isAnonymous: true, minRaters: 3, maxRaters: 8, requiresApproval: true },
  { code: 'DIRECT_REPORT', name: 'Direct Report', description: 'Feedback from direct reports', isAnonymous: true, minRaters: 3, maxRaters: null, requiresApproval: false },
  { code: 'SKIP_LEVEL', name: 'Skip-Level Manager', description: 'Manager\'s manager feedback', isAnonymous: false, minRaters: 0, maxRaters: 1, requiresApproval: false },
  { code: 'EXTERNAL', name: 'External/Customer', description: 'External stakeholder feedback', isAnonymous: true, minRaters: 0, maxRaters: 5, requiresApproval: true }
];

// ============================================================================
// CYCLE STATUS REFERENCE
// ============================================================================

export const CYCLE_STATUSES = [
  { code: 'DRAFT', name: 'Draft', description: 'Cycle is being configured, not visible to participants', allowedTransitions: ['NOMINATION', 'CANCELLED'], color: 'gray' },
  { code: 'NOMINATION', name: 'Nomination Open', description: 'Participants can nominate/request raters', allowedTransitions: ['FEEDBACK', 'CANCELLED'], color: 'blue' },
  { code: 'FEEDBACK', name: 'Feedback Collection', description: 'Raters are providing feedback', allowedTransitions: ['PROCESSING', 'CANCELLED'], color: 'amber' },
  { code: 'PROCESSING', name: 'Processing Results', description: 'Scores are being calculated and reports generated', allowedTransitions: ['REVIEW', 'FEEDBACK'], color: 'purple' },
  { code: 'REVIEW', name: 'HR Review', description: 'HR reviewing results before release', allowedTransitions: ['RELEASED', 'PROCESSING'], color: 'orange' },
  { code: 'RELEASED', name: 'Results Released', description: 'Results available to participants per visibility rules', allowedTransitions: ['CLOSED'], color: 'green' },
  { code: 'CLOSED', name: 'Closed', description: 'Cycle complete, historical record', allowedTransitions: [], color: 'gray' },
  { code: 'CANCELLED', name: 'Cancelled', description: 'Cycle was cancelled before completion', allowedTransitions: [], color: 'red' }
];

// ============================================================================
// REPORT TEMPLATE TYPES
// ============================================================================

export const REPORT_TEMPLATES = [
  { code: 'EXECUTIVE', name: 'Executive Summary', audience: 'Senior Leadership', sections: ['overall_score', 'top_strengths', 'development_areas', 'trend_comparison'], showComments: false, showRaterBreakdown: false, showBenchmarks: true },
  { code: 'MANAGER', name: 'Manager Report', audience: 'Direct Manager', sections: ['overall_score', 'competency_scores', 'strengths', 'development_areas', 'action_items', 'trend_comparison'], showComments: true, showRaterBreakdown: true, showBenchmarks: true },
  { code: 'EMPLOYEE', name: 'Employee Report', audience: 'Feedback Recipient', sections: ['overall_score', 'competency_scores', 'strengths', 'development_areas', 'self_vs_others', 'comments_summary', 'development_plan'], showComments: true, showRaterBreakdown: true, showBenchmarks: true },
  { code: 'HR', name: 'HR Analytics Report', audience: 'HR Business Partner', sections: ['all_sections'], showComments: true, showRaterBreakdown: true, showBenchmarks: true },
  { code: 'COACH', name: 'Coach/Consultant Report', audience: 'External Coach', sections: ['overall_score', 'competency_scores', 'strengths', 'development_areas', 'coaching_focus', 'action_items'], showComments: true, showRaterBreakdown: true, showBenchmarks: false }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getAllSections(): Feedback360Section[] {
  const sections: Feedback360Section[] = [];
  
  for (const part of FEEDBACK_360_MANUAL_STRUCTURE) {
    sections.push(part);
    if (part.subsections) {
      sections.push(...part.subsections as Feedback360Section[]);
    }
  }
  
  return sections;
}

export function getSectionById(id: string): Feedback360Section | undefined {
  return getAllSections().find(section => section.id === id);
}

export function getTotalReadTime(): number {
  return FEEDBACK_360_MANUAL_STRUCTURE.reduce((acc, section) => acc + section.estimatedReadTime, 0);
}

export function getSectionsByRole(role: string): Feedback360Section[] {
  return getAllSections().filter(section => section.targetRoles.includes(role));
}

export function getTableReference(tableKey: keyof typeof FEEDBACK_360_TABLES) {
  return FEEDBACK_360_TABLES[tableKey];
}
