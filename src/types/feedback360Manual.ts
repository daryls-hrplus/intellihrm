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
      // Group G: AI Governance (5.12-5.15)
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
      },
      {
        id: 'sec-5-13',
        sectionNumber: '5.13',
        title: 'AI Incident Response Procedure',
        description: 'AI-specific incident classification, immediate response steps, escalation matrix, root cause analysis, and post-incident review',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Incident-driven',
          timing: 'Within 4 hours of detection',
          benchmark: 'ISO 42001 incident management requirements'
        }
      },
      {
        id: 'sec-5-14',
        sectionNumber: '5.14',
        title: 'Human Review SLA Configuration',
        description: 'Review timeframe requirements, escalation workflows, SLA breach alerting, and metrics tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Configuration-based',
          timing: 'Pre-implementation',
          benchmark: '24-48 hour SLA for high-risk AI actions'
        }
      },
      {
        id: 'sec-5-15',
        sectionNumber: '5.15',
        title: 'Model Performance Drift Monitoring',
        description: 'Drift score calculation, threshold configuration, alerting workflows, and model version tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Continuous monitoring',
          timing: 'Daily automated checks',
          benchmark: 'NIST AI RMF measurement requirements'
        }
      }
    ]
  },
  // ========================================================================
  // PART 6: REPORTS & ANALYTICS
  // ========================================================================
  {
    id: 'part-6',
    sectionNumber: '6',
    title: 'Reports & Analytics',
    description: 'Comprehensive reporting framework including template systems, audience-specific reports, workforce analytics, response monitoring, audit logging, and benchmarking with SOC 2 compliance.',
    contentLevel: 'procedure',
    estimatedReadTime: 100,
    targetRoles: ['Admin', 'HR Partner', 'Manager'],
    subsections: [
      {
        id: 'sec-6-1',
        sectionNumber: '6.1',
        title: 'Report Template System',
        description: 'Template architecture, CRUD operations, audience types, sections configuration, and visualization settings.',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time setup, annual review',
          timing: 'Pre-implementation setup',
          benchmark: 'Audience-specific template methodology'
        }
      },
      {
        id: 'sec-6-2',
        sectionNumber: '6.2',
        title: 'Audience-Specific Reports',
        description: 'Executive, Manager, Individual Contributor, HR, and Self report configurations with content depth and anonymity levels.',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per cycle, per audience',
          timing: 'Report configuration phase',
          benchmark: '5 standard audiences with depth customization'
        }
      },
      {
        id: 'sec-6-3',
        sectionNumber: '6.3',
        title: 'Visualizations & Charts',
        description: 'Radar charts, bar charts, trend lines, Recharts integration, and WCAG 2.1 accessibility compliance.',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time setup',
          timing: 'During template configuration',
          benchmark: 'WCAG 2.1 AA color contrast compliance'
        }
      },
      {
        id: 'sec-6-4',
        sectionNumber: '6.4',
        title: 'Workforce Analytics Dashboard',
        description: 'Organization-wide signal aggregates, dimension filtering, sample size thresholds, and anonymity enforcement.',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Continuous',
          timing: 'Post-cycle analysis',
          benchmark: 'Minimum 5 responses for anonymity threshold'
        }
      },
      {
        id: 'sec-6-5',
        sectionNumber: '6.5',
        title: 'Response Monitoring Dashboard',
        description: 'Real-time completion tracking, reminder workflows, bulk actions, and SHRM response rate benchmarks.',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Daily during collection',
          timing: 'Throughout feedback window',
          benchmark: '80-85% response rate target (SHRM)'
        }
      },
      {
        id: 'sec-6-6',
        sectionNumber: '6.6',
        title: 'Results Release Audit',
        description: 'Distribution logging, acknowledgment workflow, SOC 2 compliance, and audit trail CSV export.',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per distribution event',
          timing: 'At results release',
          benchmark: 'SOC 2 Type II audit trail requirements'
        }
      },
      {
        id: 'sec-6-7',
        sectionNumber: '6.7',
        title: 'PDF Export Configuration',
        description: 'Report generation options, jsPDF configuration, print preview, and format support.',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per report generation',
          timing: 'At results release',
          benchmark: 'PDF/DOCX/Print multi-format support'
        }
      },
      {
        id: 'sec-6-8',
        sectionNumber: '6.8',
        title: 'Benchmarking & Trends',
        description: 'Year-over-year comparison, organization benchmarks, trend direction indicators, and historical analysis.',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Quarterly/Annually',
          timing: 'Post-cycle and trend review',
          benchmark: 'Period-over-period comparison methodology'
        }
      }
    ]
  },
  // ========================================================================
  // PART 7: INTEGRATION & CROSS-MODULE FEATURES
  // ========================================================================
  {
    id: 'part-7',
    sectionNumber: '7',
    title: 'Integration & Cross-Module Features',
    description: 'Comprehensive cross-module integration patterns connecting 360 Feedback with Appraisals, Talent Management, Succession Planning, IDP, Learning, and Continuous Feedback systems following industry-standard HRMS integration architectures.',
    contentLevel: 'procedure',
    estimatedReadTime: 100,
    targetRoles: ['Admin', 'Consultant', 'HR Partner'],
    subsections: [
      {
        id: 'sec-7-1',
        sectionNumber: '7.1',
        title: 'Integration Architecture Overview',
        description: 'System architecture showing data flows between 360 Feedback and other HRplus modules, consent gates, policy enforcement, and bidirectional synchronization patterns.',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time understanding',
          timing: 'Pre-implementation planning',
          benchmark: 'SAP SuccessFactors integration-first design pattern'
        }
      },
      {
        id: 'sec-7-2',
        sectionNumber: '7.2',
        title: 'Appraisal Integration',
        description: 'CRGV+360 model integration, score contribution calculation, weighted scoring, timing dependencies, and appraisal cycle linkage configuration.',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per cycle configuration',
          timing: 'Before 360 cycle activation',
          benchmark: 'Multi-source feedback as 5th CRGV component'
        }
      },
      {
        id: 'sec-7-3',
        sectionNumber: '7.3',
        title: 'Talent Profile Integration',
        description: 'Signal snapshot generation, talent card updates, consent gate enforcement, and aggregation with k-anonymity preservation.',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per cycle completion',
          timing: 'Post-results processing',
          benchmark: 'Talent signal snapshot versioning per cycle'
        }
      },
      {
        id: 'sec-7-4',
        sectionNumber: '7.4',
        title: 'Nine-Box & Succession Integration',
        description: 'Performance axis mapping from 360 scores, succession readiness updates, Nine-Box signal configuration, and candidate pool refreshes.',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Per cycle or quarterly',
          timing: 'Post-360 results release',
          benchmark: '360 feeds Performance axis; Potential remains separate assessment'
        }
      },
      {
        id: 'sec-7-5',
        sectionNumber: '7.5',
        title: 'IDP & Development Planning',
        description: 'Development theme to IDP goal linking, three link types (derived, informed, validated), manager approval workflows, and goal auto-creation.',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per cycle completion',
          timing: 'Post-theme generation',
          benchmark: 'Manager-validated theme-to-goal linking'
        }
      },
      {
        id: 'sec-7-6',
        sectionNumber: '7.6',
        title: 'Learning Recommendations',
        description: 'Skill gap detection from themes, AI-powered course matching, competency-to-training mapping, and LMS synchronization.',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per cycle completion',
          timing: 'Post-theme confirmation',
          benchmark: 'Competency-based gap to course mapping'
        }
      },
      {
        id: 'sec-7-7',
        sectionNumber: '7.7',
        title: 'Continuous Feedback Connection',
        description: 'Linking formal 360 cycles with ongoing check-ins, evidence collection, signal continuity, and manager coaching prompt integration.',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Continuous',
          timing: 'Between formal cycles',
          benchmark: 'Formal-informal feedback loop integration'
        }
      },
      {
        id: 'sec-7-8',
        sectionNumber: '7.8',
        title: 'Integration Rules Configuration',
        description: 'Automation rule setup, 360-specific triggers, condition definitions, target module actions, approval workflows, and execution logging.',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time setup, periodic review',
          timing: 'Pre-implementation',
          benchmark: 'Event-driven cross-module orchestration'
        }
      }
    ]
  },
  // ========================================================================
  // PART 8: TROUBLESHOOTING & FAQS
  // Industry-standard sequence: Configuration → Cycle → Anonymity → Collection → Reports → Integration → AI → Security → Escalation → Best Practices
  // ========================================================================
  {
    id: 'part-8',
    sectionNumber: '8',
    title: 'Troubleshooting & FAQs',
    description: 'Comprehensive troubleshooting guide covering configuration issues, cycle management problems, anonymity violations, response collection failures, report generation errors, integration sync failures, AI feature troubleshooting, security access control, escalation procedures, and best practices for 360 feedback success.',
    contentLevel: 'troubleshooting',
    estimatedReadTime: 120,
    targetRoles: ['Admin', 'Consultant', 'HR Partner'],
    subsections: [
      {
        id: 'sec-8-1',
        sectionNumber: '8.1',
        title: 'Common Configuration Issues',
        description: 'Resolving cycle setup, question bank, rater category, framework, and scale configuration problems with decision trees and diagnostic steps.',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'During implementation & updates',
          timing: 'Pre-cycle validation',
          benchmark: 'Configuration validation checklist methodology'
        }
      },
      {
        id: 'sec-8-2',
        sectionNumber: '8.2',
        title: 'Cycle Management Issues',
        description: 'Handling lifecycle transitions, nomination failures, deadline adjustments, status stuck states, and participant enrollment problems.',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per cycle execution',
          timing: 'Throughout cycle lifecycle',
          benchmark: 'State machine validation patterns'
        }
      },
      {
        id: 'sec-8-3',
        sectionNumber: '8.3',
        title: 'Anonymity & Privacy Problems',
        description: 'Resolving threshold violations, bypass scenarios, visibility rule conflicts, consent gate failures, and k-anonymity preservation issues.',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per cycle or incident-driven',
          timing: 'During collection and results',
          benchmark: 'SHRM minimum 3 raters per anonymous category'
        }
      },
      {
        id: 'sec-8-4',
        sectionNumber: '8.4',
        title: 'Response Collection Issues',
        description: 'Addressing low completion rates, declined raters, external rater access problems, timeout errors, and reminder workflow failures.',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Daily during collection',
          timing: 'Throughout feedback window',
          benchmark: '80-85% response rate target (SHRM)'
        }
      },
      {
        id: 'sec-8-5',
        sectionNumber: '8.5',
        title: 'Report Generation Problems',
        description: 'Resolving template errors, PDF generation failures, missing visualization data, export format issues, and report delivery failures.',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 15,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per report generation',
          timing: 'At results processing',
          benchmark: 'Multi-format export validation'
        }
      },
      {
        id: 'sec-8-6',
        sectionNumber: '8.6',
        title: 'Integration Failures',
        description: 'Diagnosing appraisal sync failures, Nine-Box update errors, IDP linking problems, talent signal processing failures, and cross-module data inconsistencies.',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Per cycle completion',
          timing: 'Post-results processing',
          benchmark: 'Event-driven integration validation'
        }
      },
      {
        id: 'sec-8-7',
        sectionNumber: '8.7',
        title: 'AI Feature Troubleshooting',
        description: 'Resolving signal processing stuck states, theme generation failures, coaching prompt issues, bias detection false positives, and writing quality score problems.',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 12,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per AI processing event',
          timing: 'Post-collection processing',
          benchmark: 'ISO 42001 incident classification'
        }
      },
      {
        id: 'sec-8-8',
        sectionNumber: '8.8',
        title: 'Security & Access Control',
        description: 'Permission matrix issues, RLS policy conflicts, audit logging gaps, data visibility rule enforcement, and authentication problems.',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Incident-driven',
          timing: 'Security review periods',
          benchmark: 'SOC 2 Type II access control requirements'
        }
      },
      {
        id: 'sec-8-9',
        sectionNumber: '8.9',
        title: 'Escalation Procedures',
        description: 'Four-tier support model, severity classification matrix, communication templates, stakeholder notification workflows, and resolution timelines.',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per escalation event',
          timing: 'When issues exceed standard resolution',
          benchmark: 'ITIL-aligned escalation framework'
        }
      },
      {
        id: 'sec-8-10',
        sectionNumber: '8.10',
        title: 'Best Practices & Success Factors',
        description: 'Pre-cycle, during-cycle, and post-cycle best practices with SHRM/CCL industry benchmarks, success metrics, and optimization strategies.',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Reference document',
          timing: 'Cycle planning and review',
          benchmark: 'SHRM & Center for Creative Leadership guidelines'
        }
      }
    ]
  }
];

// ============================================================================
// GLOSSARY DATA
// ============================================================================

export const FEEDBACK_360_GLOSSARY = [
  // Core Concepts (12 terms)
  { term: '360 Feedback', definition: 'Multi-rater feedback process collecting input from various stakeholders around an employee for a holistic performance view', category: 'Core Concepts' },
  { term: 'Multi-Rater Feedback', definition: 'Synonymous with 360 feedback; feedback gathered from multiple perspectives including self, manager, peers, and direct reports', category: 'Core Concepts' },
  { term: 'Cycle', definition: 'A defined period during which 360 feedback is collected, processed, and released; typically annual or semi-annual', category: 'Core Concepts' },
  { term: 'Participant', definition: 'The employee receiving 360 feedback (the target/subject of the feedback process)', category: 'Core Concepts' },
  { term: 'Rater', definition: 'Any individual providing feedback on a participant; can be internal or external to the organization', category: 'Core Concepts' },
  { term: 'Feedback Request', definition: 'An invitation sent to a rater asking them to provide feedback on a specific participant', category: 'Core Concepts' },
  { term: 'Response Window', definition: 'The time period during which raters can submit their feedback responses', category: 'Core Concepts' },
  { term: 'Submission Deadline', definition: 'The final date/time by which all feedback responses must be submitted', category: 'Core Concepts' },
  { term: 'Results Release', definition: 'The controlled distribution of aggregated feedback results to designated audiences', category: 'Core Concepts' },
  { term: 'Feedback Report', definition: 'The final document containing aggregated scores, comments, and insights for a participant', category: 'Core Concepts' },
  { term: 'Competency Score', definition: 'Aggregated rating for a specific competency across all raters or by rater category', category: 'Core Concepts' },
  { term: 'Overall Score', definition: 'Weighted average of all competency scores representing total 360 feedback performance', category: 'Core Concepts' },

  // Rater Categories (8 terms)
  { term: 'Self-Assessment', definition: 'The participant\'s own rating of their performance/behaviors; always non-anonymous', category: 'Rater Categories' },
  { term: 'Manager Rater', definition: 'The direct manager of the feedback recipient; typically non-anonymous and required', category: 'Rater Categories' },
  { term: 'Peer Rater', definition: 'A colleague at the same organizational level as the feedback recipient; typically anonymous', category: 'Rater Categories' },
  { term: 'Direct Report', definition: 'An employee who reports directly to the feedback recipient; anonymous when 3+ responses', category: 'Rater Categories' },
  { term: 'Skip-Level Manager', definition: 'The manager\'s manager (two levels above the feedback recipient); typically non-anonymous', category: 'Rater Categories' },
  { term: 'Skip-Level Rater', definition: 'A subordinate two or more levels below the participant in the hierarchy', category: 'Rater Categories' },
  { term: 'Cross-Functional Rater', definition: 'Colleagues from different departments who collaborate with the participant', category: 'Rater Categories' },
  { term: 'External Rater', definition: 'A non-employee providing feedback, such as a customer, vendor, or board member', category: 'Rater Categories' },

  // Configuration (12 terms)
  { term: 'Question Bank', definition: 'Library of approved questions organized by competency, rater type, and difficulty level', category: 'Configuration' },
  { term: 'Rater Category', definition: 'Classification of raters (Self, Manager, Peer, Direct Report, External) with specific anonymity and threshold rules', category: 'Configuration' },
  { term: 'Rating Scale', definition: 'Numeric scale used for rating behaviors; typically 5-point (1-5) in industry standard', category: 'Configuration' },
  { term: 'Behavioral Anchor', definition: 'Specific observable behavior tied to a rating level on a scale (e.g., "Consistently exceeds expectations" = 5)', category: 'Configuration' },
  { term: 'BARS', definition: 'Behaviorally Anchored Rating Scales - methodology linking numeric scores to specific, observable behaviors', category: 'Configuration' },
  { term: 'Framework Library', definition: 'Collection of reusable competency and question frameworks versioned for historical accuracy', category: 'Configuration' },
  { term: 'Competency Framework', definition: 'Structured set of competencies linked to questions, behavioral anchors, and organizational values', category: 'Configuration' },
  { term: 'Cycle Template', definition: 'Pre-configured cycle settings that can be reused across multiple 360 feedback cycles', category: 'Configuration' },
  { term: 'Weight Configuration', definition: 'Percentage allocation for each rater category\'s contribution to overall scores', category: 'Configuration' },
  { term: 'Question Mapping', definition: 'Association between questions and competencies determining which behaviors each question measures', category: 'Configuration' },
  { term: 'Report Template', definition: 'Pre-defined structure for feedback reports including sections, visualizations, and content depth', category: 'Configuration' },
  { term: 'Audience Type', definition: 'Classification of report recipients (Executive, Manager, Employee, HR, Coach) with different content visibility', category: 'Configuration' },

  // Governance (12 terms)
  { term: 'Anonymity Threshold', definition: 'Minimum number of raters required in a category before individual responses are aggregated (typically 3)', category: 'Governance' },
  { term: 'k-Anonymity', definition: 'Privacy preservation principle ensuring individual responses cannot be identified; enforced via aggregation thresholds', category: 'Governance' },
  { term: 'Aggregation Threshold', definition: 'Minimum response count required before data is displayed; prevents individual identification', category: 'Governance' },
  { term: 'Visibility Rules', definition: 'Configuration determining who can see what feedback data and when; enforced by RLS policies', category: 'Governance' },
  { term: 'Visibility Policy', definition: 'Company-level or cycle-level rules controlling data access based on role and timing', category: 'Governance' },
  { term: 'Consent Gate', definition: 'Checkpoint requiring participant consent before specific data processing (e.g., talent signal generation)', category: 'Governance' },
  { term: 'Data Retention', definition: 'Policy defining how long feedback data is stored and when it must be purged or anonymized', category: 'Governance' },
  { term: 'Audit Trail', definition: 'Immutable log of all actions taken in the 360 feedback system for compliance and security', category: 'Governance' },
  { term: 'Investigation Mode', definition: 'Special access granted to HR/Legal for reviewing non-aggregated data during formal investigations', category: 'Governance' },
  { term: 'GDPR Consent', definition: 'Explicit permission required under EU data protection regulations before processing personal feedback data', category: 'Governance' },
  { term: 'Data Subject Rights', definition: 'Legal rights of individuals (access, rectification, erasure, portability) under GDPR/privacy laws', category: 'Governance' },
  { term: 'Manager Bypass', definition: 'Procedure allowing managers to see direct report feedback before anonymity threshold is met; requires HR approval', category: 'Governance' },

  // Workflows (8 terms)
  { term: 'Nomination', definition: 'The process of selecting and requesting raters to provide feedback', category: 'Workflows' },
  { term: 'Nomination Approval', definition: 'Manager/HR review and approval of participant-nominated raters', category: 'Workflows' },
  { term: 'Rater Assignment', definition: 'Final confirmation of raters after nomination approval, triggering feedback requests', category: 'Workflows' },
  { term: 'Reminder Workflow', definition: 'Automated notifications sent to raters who have not completed their feedback', category: 'Workflows' },
  { term: 'Staged Release', definition: 'Sequential distribution of results to different audiences (HR first, then managers, then employees)', category: 'Workflows' },
  { term: 'Debrief Session', definition: 'Manager-employee meeting to discuss feedback results and create development plans', category: 'Workflows' },
  { term: 'Lifecycle State', definition: 'Current phase of a 360 cycle: Draft → Nomination → Collection → Processing → Review → Released → Closed', category: 'Workflows' },
  { term: 'Status Transition', definition: 'Movement from one lifecycle state to another, subject to validation rules', category: 'Workflows' },

  // AI & Signals (12 terms)
  { term: 'Signal', definition: 'A talent insight derived from 360 feedback data for cross-module analytics and talent management', category: 'AI & Signals' },
  { term: 'Signal Processing', definition: 'AI-powered extraction of structured insights from unstructured feedback responses', category: 'AI & Signals' },
  { term: 'Talent Signal Snapshot', definition: 'Point-in-time record of extracted signals associated with a specific cycle', category: 'AI & Signals' },
  { term: 'Development Theme', definition: 'AI-identified pattern representing a development area derived from multiple feedback comments', category: 'AI & Signals' },
  { term: 'Theme Confidence', definition: 'Statistical measure (0-1) indicating reliability of an AI-generated development theme', category: 'AI & Signals' },
  { term: 'Coaching Prompt', definition: 'AI-generated conversation starters for managers based on feedback patterns and blind spots', category: 'AI & Signals' },
  { term: 'Blind Spot', definition: 'Gap between self-assessment and others\' ratings, indicating potential lack of self-awareness', category: 'AI & Signals' },
  { term: 'Hidden Strength', definition: 'Competency where others rate significantly higher than self-assessment', category: 'AI & Signals' },
  { term: 'Writing Quality Score', definition: 'AI assessment of feedback comment quality: clarity, specificity, behavioral focus (0-100)', category: 'AI & Signals' },
  { term: 'Bias Detection', definition: 'AI identification of potentially biased language in feedback comments (gender, age, vague)', category: 'AI & Signals' },
  { term: 'Sentiment Analysis', definition: 'NLP classification of feedback tone as Positive, Neutral, Negative, or Mixed', category: 'AI & Signals' },
  { term: 'Human Override', definition: 'Manual correction or rejection of AI-generated insights by authorized users', category: 'AI & Signals' },

  // Integration (8 terms)
  { term: 'Appraisal Feed', definition: '360 score contribution to the annual performance appraisal as a CRGV component', category: 'Integration' },
  { term: 'Score Contribution', definition: 'Calculated 360 score that feeds into appraisal final rating with configurable weight', category: 'Integration' },
  { term: 'Nine-Box Mapping', definition: 'Translation of 360 aggregate scores to Performance axis placement in Nine-Box grid', category: 'Integration' },
  { term: 'IDP Linking', definition: 'Connection between development themes and Individual Development Plan goals', category: 'Integration' },
  { term: 'Theme-to-Goal', definition: 'Conversion of an AI-generated development theme into a formal IDP goal', category: 'Integration' },
  { term: 'Skill Gap', definition: 'Competency deficiency identified from 360 feedback feeding learning recommendations', category: 'Integration' },
  { term: 'Integration Rule', definition: 'Automated trigger-action configuration for cross-module data synchronization', category: 'Integration' },
  { term: 'Cross-Module Sync', definition: 'Real-time or scheduled data propagation between 360 and connected modules', category: 'Integration' },

  // Reports & Analytics (8 terms)
  { term: 'Radar Chart', definition: 'Spider/web visualization showing scores across multiple competencies simultaneously', category: 'Reports & Analytics' },
  { term: 'Gap Analysis', definition: 'Comparison between self-rating and others\' ratings to identify perception differences', category: 'Reports & Analytics' },
  { term: 'Trend Analysis', definition: 'Comparison of scores across multiple 360 cycles to track development progress', category: 'Reports & Analytics' },
  { term: 'Benchmarking', definition: 'Comparison of individual/team scores against organizational or industry norms', category: 'Reports & Analytics' },
  { term: 'Response Rate', definition: 'Percentage of assigned raters who completed their feedback (target: 80-85%)', category: 'Reports & Analytics' },
  { term: 'Completion Rate', definition: 'Percentage of participants with sufficient feedback for report generation', category: 'Reports & Analytics' },
  { term: 'Workforce Dashboard', definition: 'Organization-wide analytics view of 360 feedback patterns and trends', category: 'Reports & Analytics' },
  { term: 'PDF Export', definition: 'Generation of printable/shareable feedback reports in PDF format', category: 'Reports & Analytics' },

  // Compliance (6 terms)
  { term: 'SOC 2 Compliance', definition: 'Security, Availability, Processing Integrity, Confidentiality, and Privacy controls certification', category: 'Compliance' },
  { term: 'ISO 42001', definition: 'International standard for AI Management Systems governing AI feature development and deployment', category: 'Compliance' },
  { term: 'DPIA', definition: 'Data Protection Impact Assessment required before processing high-risk personal data', category: 'Compliance' },
  { term: 'SHRM Benchmark', definition: 'Society for Human Resource Management guidelines for 360 feedback best practices', category: 'Compliance' },
  { term: 'CCL Guidelines', definition: 'Center for Creative Leadership research-based recommendations for 360 feedback programs', category: 'Compliance' },
  { term: 'EEOC Alignment', definition: 'Equal Employment Opportunity Commission guidelines for fair, non-discriminatory feedback', category: 'Compliance' }
];

// ============================================================================
// QUICK REFERENCE DATA - Enhanced with detailed persona journeys
// ============================================================================

export const FEEDBACK_360_QUICK_REFERENCE = {
  employeeJourney: {
    title: 'Employee (Subject) Journey',
    description: 'Complete workflow for employees participating in 360 feedback as the subject/participant',
    estimatedTotalTime: '2-3 hours across cycle',
    steps: [
      { step: 1, title: 'Receive Notification', description: 'Email/portal notification with cycle overview, timeline, and expectations', timing: 'Day 1', checkpoint: true },
      { step: 2, title: 'Review Instructions', description: 'Understand competencies, rating scale, and nomination guidelines', timing: '10 min', checkpoint: false },
      { step: 3, title: 'Nominate Peer Raters', description: 'Select 3-8 peers who can provide meaningful feedback on your behaviors', timing: '15 min', checkpoint: true },
      { step: 4, title: 'Nominate External Raters', description: 'Optionally add customers, vendors, or external stakeholders (if enabled)', timing: '10 min', checkpoint: false },
      { step: 5, title: 'Complete Self-Assessment', description: 'Rate yourself on all competencies with behavioral evidence; be honest and reflective', timing: '30-45 min', checkpoint: true },
      { step: 6, title: 'Monitor Nomination Status', description: 'Track manager approval of your nominated raters; respond to any rejections', timing: 'Ongoing', checkpoint: false },
      { step: 7, title: 'Await Feedback Collection', description: 'Raters complete their assessments; you may receive progress updates', timing: '2-4 weeks', checkpoint: false },
      { step: 8, title: 'Receive Report Notification', description: 'Get notified when your feedback report is ready for review', timing: 'After release', checkpoint: true },
      { step: 9, title: 'Review Feedback Report', description: 'Access detailed competency scores, self vs. others gaps, and verbatim comments', timing: '45-60 min', checkpoint: true },
      { step: 10, title: 'Schedule Debrief with Manager', description: 'Book time to discuss results, blind spots, and development opportunities', timing: '30 min', checkpoint: false },
      { step: 11, title: 'Review Development Themes', description: 'Examine AI-generated themes and coaching prompts with manager', timing: '20 min', checkpoint: true },
      { step: 12, title: 'Create IDP Goals', description: 'Link confirmed development themes to Individual Development Plan goals', timing: '30 min', checkpoint: true }
    ]
  },
  raterJourney: {
    title: 'Rater Journey',
    description: 'Complete workflow for providing 360 feedback on colleagues',
    estimatedTotalTime: '25-40 minutes per participant',
    steps: [
      { step: 1, title: 'Receive Request Email', description: 'Notification with participant name, deadline, and unique access link', timing: 'Day 1', checkpoint: true },
      { step: 2, title: 'Accept or Decline', description: 'Confirm participation or decline with reason (e.g., insufficient interaction)', timing: '2 min', checkpoint: true },
      { step: 3, title: 'Review Rating Guidelines', description: 'Understand the 1-5 scale, behavioral anchors, and confidentiality assurance', timing: '5 min', checkpoint: false },
      { step: 4, title: 'Complete Numeric Ratings', description: 'Rate each competency based on observed behaviors over the review period', timing: '15-20 min', checkpoint: false },
      { step: 5, title: 'Provide Written Comments', description: 'Add specific, behavioral examples for strengths and development areas', timing: '10-15 min', checkpoint: false },
      { step: 6, title: 'Review AI Quality Suggestions', description: 'Consider real-time suggestions to improve feedback clarity and specificity', timing: '5 min', checkpoint: false },
      { step: 7, title: 'Final Review & Submit', description: 'Review all responses, confirm anonymity understanding, and submit', timing: '3 min', checkpoint: true }
    ]
  },
  managerJourney: {
    title: 'Manager Journey',
    description: 'Complete workflow for managers supporting direct reports through 360 feedback',
    estimatedTotalTime: '30-60 minutes per direct report',
    steps: [
      { step: 1, title: 'Review Cycle Launch', description: 'Understand cycle timeline, participants from your team, and your responsibilities', timing: 'Day 1', checkpoint: true },
      { step: 2, title: 'Approve Peer Nominations', description: 'Review and approve/reject rater selections from direct reports (validate relevance)', timing: '10 min/employee', checkpoint: true },
      { step: 3, title: 'Complete Manager Feedback', description: 'Provide your assessment as the manager rater for each direct report', timing: '25-35 min/employee', checkpoint: true },
      { step: 4, title: 'Monitor Team Completion', description: 'Track response rates; encourage incomplete raters without pressuring', timing: 'Weekly', checkpoint: false },
      { step: 5, title: 'Send Encouragement Reminders', description: 'Personal outreach to team members with low completion; offer support', timing: 'As needed', checkpoint: false },
      { step: 6, title: 'Access Team Reports', description: 'Review feedback reports for each direct report when released to managers', timing: 'After release', checkpoint: true },
      { step: 7, title: 'Prepare Debrief Notes', description: 'Identify key themes, blind spots, and development opportunities for each employee', timing: '15 min/employee', checkpoint: false },
      { step: 8, title: 'Conduct Debrief Session', description: 'Meet with each employee to discuss results, validate themes, and plan development', timing: '45-60 min/employee', checkpoint: true },
      { step: 9, title: 'Review AI Development Themes', description: 'Validate AI-generated themes; confirm or adjust based on your knowledge', timing: '10 min/employee', checkpoint: true },
      { step: 10, title: 'Use Coaching Prompts', description: 'Leverage AI-generated coaching questions for ongoing development conversations', timing: 'Ongoing', checkpoint: false },
      { step: 11, title: 'Link Themes to IDP', description: 'Help employees connect confirmed themes to formal development goals', timing: '15 min/employee', checkpoint: true },
      { step: 12, title: 'Track Development Progress', description: 'Monitor progress against 360-derived goals; provide ongoing coaching', timing: 'Quarterly', checkpoint: false }
    ]
  },
  hrAdminJourney: {
    title: 'HR Admin Journey',
    description: 'Complete administrative workflow for managing 360 feedback cycles',
    estimatedTotalTime: '20-40 hours per cycle',
    steps: [
      { step: 1, title: 'Plan Cycle Parameters', description: 'Define scope, timeline, participant groups, and success metrics', timing: '4-6 weeks before', checkpoint: true },
      { step: 2, title: 'Configure Cycle Settings', description: 'Set dates, anonymity thresholds, rater categories, and question frameworks', timing: '2-3 hours', checkpoint: true },
      { step: 3, title: 'Enroll Participants', description: 'Import participant list, validate manager assignments, and verify data quality', timing: '1-2 hours', checkpoint: true },
      { step: 4, title: 'Activate Cycle', description: 'Transition to nomination phase; verify notification delivery', timing: '30 min', checkpoint: true },
      { step: 5, title: 'Monitor Nominations', description: 'Track nomination progress; handle exceptions and approval escalations', timing: 'Daily', checkpoint: false },
      { step: 6, title: 'Transition to Collection', description: 'Close nominations; activate feedback collection phase', timing: '30 min', checkpoint: true },
      { step: 7, title: 'Monitor Response Rates', description: 'Track completion by rater category; identify risk areas', timing: 'Daily', checkpoint: false },
      { step: 8, title: 'Send Targeted Reminders', description: 'Execute reminder workflows; escalate persistently non-responsive raters', timing: 'Weekly', checkpoint: false },
      { step: 9, title: 'Handle Anonymity Exceptions', description: 'Process manager bypass requests; document approvals per policy', timing: 'As needed', checkpoint: true },
      { step: 10, title: 'Process Results', description: 'Trigger score calculation, report generation, and AI signal processing', timing: '2-4 hours', checkpoint: true },
      { step: 11, title: 'Validate Data Quality', description: 'Review completion rates, anonymity thresholds, and data anomalies', timing: '2 hours', checkpoint: true },
      { step: 12, title: 'Configure Staged Release', description: 'Set up release schedule for HR, managers, and employees', timing: '1 hour', checkpoint: true },
      { step: 13, title: 'Release to HR/Managers', description: 'Execute first release tier; validate report access', timing: '30 min', checkpoint: true },
      { step: 14, title: 'Release to Employees', description: 'Execute employee release; monitor access and support requests', timing: '30 min', checkpoint: true },
      { step: 15, title: 'Generate Workforce Analytics', description: 'Create organizational trend reports; identify systemic patterns', timing: '3-4 hours', checkpoint: true },
      { step: 16, title: 'Close Cycle', description: 'Archive data; trigger integration sync to Appraisals/Talent modules', timing: '1 hour', checkpoint: true }
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
