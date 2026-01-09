// Industry-aligned preset configurations for all 11 document types
// Based on: SAP SuccessFactors, Workday, Oracle HCM, ISO 9001, SHRM standards

import { DocumentTemplate } from "./DocumentTemplateConfig";

export type DocumentType = 
  | 'training_guide' 
  | 'user_manual' 
  | 'sop' 
  | 'quick_start' 
  | 'technical_doc'
  | 'job_aid'
  | 'release_notes'
  | 'implementation_guide'
  | 'reference_guide'
  | 'policy_document'
  | 'faq_document';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  training_guide: 'Training Guide',
  user_manual: 'User Manual',
  sop: 'Standard Operating Procedure',
  quick_start: 'Quick Start Guide',
  technical_doc: 'Technical Documentation',
  job_aid: 'Job Aid',
  release_notes: 'Release Notes',
  implementation_guide: 'Implementation Guide',
  reference_guide: 'Reference Guide',
  policy_document: 'Policy Document',
  faq_document: 'FAQ Document'
};

export const DOCUMENT_TYPE_DESCRIPTIONS: Record<DocumentType, string> = {
  training_guide: 'Comprehensive training with learning objectives and assessments',
  user_manual: '8-part enterprise manual with detailed admin instructions',
  sop: 'Formal SOP with approval sections and compliance elements',
  quick_start: 'Concise getting-started guide for rapid onboarding',
  technical_doc: 'Technical documentation for developers and admins',
  job_aid: '1-2 page quick reference cards for single tasks',
  release_notes: 'Version-specific updates, new features, bug fixes',
  implementation_guide: 'Step-by-step setup guides for implementation consultants',
  reference_guide: 'Lookup-style documentation with field definitions and codes',
  policy_document: 'HR policies with effective dates, approval, and compliance',
  faq_document: 'Structured question-and-answer format'
};

// AI Context presets for each document type
export const AI_CONTEXT_PRESETS: Record<DocumentType, string> = {
  training_guide: `Target Audience: HR professionals and system administrators learning new functionality
Writing Style: Clear, instructional, step-by-step with learning outcomes
Industry Focus: Enterprise HRMS (comparable to Workday, SAP SuccessFactors)
Include: Learning objectives (Bloom's Taxonomy), time estimates per section, role-based guidance, knowledge checks
Structure: Introduction → Learning Objectives → Prerequisites → Content Sections → Summary → Assessment
Avoid: Jargon without explanation, assumptions about prior knowledge
Format: Numbered procedures, visual aids with annotations, callout boxes for tips/warnings`,

  user_manual: `Target Audience: System administrators and HR consultants implementing and managing the module
Writing Style: Enterprise-grade, comprehensive, reference-oriented
Industry Focus: Enterprise HRMS (Workday, SAP SuccessFactors, Oracle HCM benchmark)
Structure: 8-part manual format:
  Part 1: Module Overview & Conceptual Foundation
  Part 2: Setup & Configuration Guide  
  Part 3: Operational Workflows
  Part 4: Advanced Features
  Part 5: AI Features & Intelligence
  Part 6: Analytics & Reporting
  Part 7: Integration Points
  Part 8: Troubleshooting & FAQ
Include per section: estimatedReadTime, targetRoles[], industryContext{frequency, timing, benchmark, compliance[]}
Callout Types: info, tip, warning, danger, industry-standard, best-practice
Include: Industry context (frequency, timing, benchmark), compliance notes, role-based procedures`,

  sop: `Target Audience: Process owners and operators following standardized procedures
Writing Style: Formal, precise, compliance-oriented
Industry Focus: ISO 9001 quality management, regulatory compliance
Structure: Purpose → Scope → Definitions → Responsibilities (RACI) → Procedure → Records → Revision History
Include: Document control information, approval signatures, effective date, revision tracking
Format: Numbered steps with clear accountability, exception handling procedures
Compliance: Audit trail ready, version control emphasis, reference to policies`,

  quick_start: `Target Audience: New users completing their first task in under 15 minutes
Writing Style: Concise, action-oriented, minimal explanation
Industry Focus: SaaS onboarding best practices
Structure: What You'll Learn → Prerequisites → Steps (max 7) → Next Steps
Include: Time-to-complete estimate, clear success criteria, "next steps" links
Format: Maximum 7 steps, inline visuals, minimal text per step (2-3 sentences)
Avoid: Detailed explanations, edge cases, advanced features, lengthy introductions`,

  technical_doc: `Target Audience: Developers, system integrators, and technical administrators
Writing Style: Technical, precise, API-focused
Industry Focus: Enterprise software integration standards
Structure: Overview → Architecture → API Reference → Configuration → Examples → Troubleshooting
Include: Code samples, API endpoints, data schemas, configuration parameters
Format: Code blocks with syntax highlighting, parameter tables, sequence diagrams
Avoid: Non-technical language, business process details`,

  job_aid: `Target Audience: End users needing quick reference for a single task
Writing Style: Ultra-concise, action-oriented, visual-first
Industry Focus: WalkMe, Whatfix, SAP Enable Now patterns
Structure: Task Title → Prerequisites (if any) → Steps (5-7 max) → Tips
Constraints: Maximum 1-2 pages, single task focus only
Include: Visual cues (icons, callouts), numbered steps, success indicator
Format: Large step numbers, inline screenshots, minimal text
Avoid: Background information, related tasks, detailed explanations`,

  release_notes: `Target Audience: Administrators and power users reviewing system updates
Writing Style: Scannable, organized by category, concise descriptions
Industry Focus: Workday Community, SAP Release Notes, Confluence changelog patterns
Structure: Version & Date → Highlights → New Features → Improvements → Bug Fixes → Breaking Changes → Known Issues
Include: Version number, release date, impact level indicators, upgrade notes
Format: Bulleted lists, category groupings, visual indicators for breaking changes
Avoid: Detailed how-to instructions (link to docs instead)`,

  implementation_guide: `Target Audience: Implementation consultants and project managers deploying the system
Writing Style: Comprehensive, methodical, consultant-oriented
Industry Focus: SAP Activate, Workday Deploy, Oracle Implementation methodologies
Structure: Pre-Implementation → System Configuration → Data Migration → Integration Setup → Testing → Go-Live → Post Go-Live
Include: Decision points, configuration checklists, data mapping templates, testing scripts
Format: Phase-based organization, checkpoint reviews, rollback procedures
Compliance: Change management documentation, sign-off requirements`,

  reference_guide: `Target Audience: Users looking up specific field definitions, codes, or values
Writing Style: Reference-oriented, alphabetical or categorical organization
Industry Focus: Workday Field Reference, SAP Data Dictionary patterns
Structure: Introduction → Category Index → Field/Code Definitions → Appendices
Include: Field name, description, valid values, data type, required/optional, default value
Format: Tables for field definitions, alphabetical or categorical indexes, cross-references
Avoid: Procedural content, how-to instructions`,

  policy_document: `Target Audience: Employees, managers, and HR professionals understanding organizational policies
Writing Style: Formal, authoritative, legally-reviewed language
Industry Focus: SHRM Policy Templates, ISO 27001, SOC 2 compliance
Structure: Policy Statement → Purpose → Scope → Definitions → Policy Details → Procedures → Responsibilities → Compliance → Revision History
Include: Effective date, approval signatures, revision history, compliance requirements
Format: Numbered sections, formal language, approval block
Compliance: Legal review ready, audit trail, version control`,

  faq_document: `Target Audience: Users seeking quick answers to common questions
Writing Style: Conversational Q&A format, clear and direct answers
Industry Focus: Zendesk, Confluence FAQ, Notion Q&A patterns
Structure: Category Groupings → Q&A Pairs → Related Questions
Include: Question categories, related question links, "Was this helpful?" prompts
Format: Q: [Question] followed by A: [Answer], grouped by topic
Constraints: Keep answers concise (2-3 paragraphs max), link to detailed docs for complex topics`
};

// Industry-aligned branding presets
export const BRANDING_PRESETS: Record<DocumentType, DocumentTemplate['branding']> = {
  training_guide: {
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    companyName: 'Intelli HRM',
    footerText: '© 2025 Intelli HRM. Training Material - Internal Use Only'
  },
  user_manual: {
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    companyName: 'Intelli HRM',
    footerText: '© 2025 Intelli HRM. Administrator Manual - Confidential'
  },
  sop: {
    primaryColor: '#1e3a5f',
    secondaryColor: '#64748b',
    companyName: 'Intelli HRM',
    footerText: '© 2025 Intelli HRM. Standard Operating Procedure - Controlled Document'
  },
  quick_start: {
    primaryColor: '#0d9488',
    secondaryColor: '#14b8a6',
    companyName: 'Intelli HRM',
    footerText: 'Quick Start Guide - See full documentation for details'
  },
  technical_doc: {
    primaryColor: '#475569',
    secondaryColor: '#64748b',
    companyName: 'Intelli HRM',
    footerText: '© 2025 Intelli HRM. Technical Documentation'
  },
  job_aid: {
    primaryColor: '#f97316',
    secondaryColor: '#fb923c',
    companyName: 'Intelli HRM',
    footerText: 'Job Aid - Quick Reference'
  },
  release_notes: {
    primaryColor: '#06b6d4',
    secondaryColor: '#22d3ee',
    companyName: 'Intelli HRM',
    footerText: '© 2025 Intelli HRM. Release Notes'
  },
  implementation_guide: {
    primaryColor: '#4f46e5',
    secondaryColor: '#6366f1',
    companyName: 'Intelli HRM',
    footerText: '© 2025 Intelli HRM. Implementation Guide - Partner Confidential'
  },
  reference_guide: {
    primaryColor: '#f43f5e',
    secondaryColor: '#fb7185',
    companyName: 'Intelli HRM',
    footerText: '© 2025 Intelli HRM. Reference Guide'
  },
  policy_document: {
    primaryColor: '#dc2626',
    secondaryColor: '#ef4444',
    companyName: 'Intelli HRM',
    footerText: '© 2025 Intelli HRM. HR Policy Document - Official'
  },
  faq_document: {
    primaryColor: '#14b8a6',
    secondaryColor: '#2dd4bf',
    companyName: 'Intelli HRM',
    footerText: '© 2025 Intelli HRM. Frequently Asked Questions'
  }
};

// Layout presets for each document type
export const LAYOUT_PRESETS: Record<DocumentType, DocumentTemplate['layout']> = {
  training_guide: {
    includeTableOfContents: true,
    includeSummary: true,
    includePrerequisites: true,
    includeLearningObjectives: true,
    includeScreenshots: true,
    includeStepNumbers: true,
    includeTimeEstimates: true,
    includeRoleIndicators: true,
    includeVersionInfo: true,
    includeRelatedDocs: true
  },
  user_manual: {
    includeTableOfContents: true,
    includeSummary: true,
    includePrerequisites: true,
    includeLearningObjectives: false,
    includeScreenshots: true,
    includeStepNumbers: true,
    includeTimeEstimates: true,
    includeRoleIndicators: true,
    includeVersionInfo: true,
    includeRelatedDocs: true
  },
  sop: {
    includeTableOfContents: true,
    includeSummary: true,
    includePrerequisites: true,
    includeLearningObjectives: false,
    includeScreenshots: true,
    includeStepNumbers: true,
    includeTimeEstimates: false,
    includeRoleIndicators: true,
    includeVersionInfo: true,
    includeRelatedDocs: true
  },
  quick_start: {
    includeTableOfContents: false,
    includeSummary: true,
    includePrerequisites: true,
    includeLearningObjectives: false,
    includeScreenshots: true,
    includeStepNumbers: true,
    includeTimeEstimates: true,
    includeRoleIndicators: false,
    includeVersionInfo: false,
    includeRelatedDocs: true
  },
  technical_doc: {
    includeTableOfContents: true,
    includeSummary: true,
    includePrerequisites: true,
    includeLearningObjectives: false,
    includeScreenshots: true,
    includeStepNumbers: true,
    includeTimeEstimates: false,
    includeRoleIndicators: true,
    includeVersionInfo: true,
    includeRelatedDocs: true
  },
  job_aid: {
    includeTableOfContents: false,
    includeSummary: false,
    includePrerequisites: true,
    includeLearningObjectives: false,
    includeScreenshots: true,
    includeStepNumbers: true,
    includeTimeEstimates: false,
    includeRoleIndicators: false,
    includeVersionInfo: false,
    includeRelatedDocs: false
  },
  release_notes: {
    includeTableOfContents: true,
    includeSummary: true,
    includePrerequisites: false,
    includeLearningObjectives: false,
    includeScreenshots: false,
    includeStepNumbers: false,
    includeTimeEstimates: false,
    includeRoleIndicators: false,
    includeVersionInfo: true,
    includeRelatedDocs: true
  },
  implementation_guide: {
    includeTableOfContents: true,
    includeSummary: true,
    includePrerequisites: true,
    includeLearningObjectives: false,
    includeScreenshots: true,
    includeStepNumbers: true,
    includeTimeEstimates: true,
    includeRoleIndicators: true,
    includeVersionInfo: true,
    includeRelatedDocs: true
  },
  reference_guide: {
    includeTableOfContents: true,
    includeSummary: false,
    includePrerequisites: false,
    includeLearningObjectives: false,
    includeScreenshots: false,
    includeStepNumbers: false,
    includeTimeEstimates: false,
    includeRoleIndicators: true,
    includeVersionInfo: true,
    includeRelatedDocs: true
  },
  policy_document: {
    includeTableOfContents: true,
    includeSummary: true,
    includePrerequisites: false,
    includeLearningObjectives: false,
    includeScreenshots: false,
    includeStepNumbers: true,
    includeTimeEstimates: false,
    includeRoleIndicators: true,
    includeVersionInfo: true,
    includeRelatedDocs: true
  },
  faq_document: {
    includeTableOfContents: true,
    includeSummary: false,
    includePrerequisites: false,
    includeLearningObjectives: false,
    includeScreenshots: false,
    includeStepNumbers: false,
    includeTimeEstimates: false,
    includeRoleIndicators: false,
    includeVersionInfo: false,
    includeRelatedDocs: true
  }
};

// Sections presets for each document type
export const SECTIONS_PRESETS: Record<DocumentType, DocumentTemplate['sections']> = {
  training_guide: {
    introduction: true,
    overview: true,
    prerequisites: true,
    stepByStep: true,
    bestPractices: true,
    troubleshooting: true,
    faqs: true,
    glossary: true,
    appendix: true
  },
  user_manual: {
    introduction: true,
    overview: true,
    prerequisites: true,
    stepByStep: true,
    bestPractices: true,
    troubleshooting: true,
    faqs: true,
    glossary: true,
    appendix: true
  },
  sop: {
    introduction: true,
    overview: true,
    prerequisites: true,
    stepByStep: true,
    bestPractices: true,
    troubleshooting: true,
    faqs: false,
    glossary: true,
    appendix: true
  },
  quick_start: {
    introduction: true,
    overview: false,
    prerequisites: true,
    stepByStep: true,
    bestPractices: false,
    troubleshooting: false,
    faqs: false,
    glossary: false,
    appendix: false
  },
  technical_doc: {
    introduction: true,
    overview: true,
    prerequisites: true,
    stepByStep: true,
    bestPractices: true,
    troubleshooting: true,
    faqs: false,
    glossary: true,
    appendix: true
  },
  job_aid: {
    introduction: false,
    overview: false,
    prerequisites: true,
    stepByStep: true,
    bestPractices: false,
    troubleshooting: false,
    faqs: false,
    glossary: false,
    appendix: false
  },
  release_notes: {
    introduction: true,
    overview: true,
    prerequisites: false,
    stepByStep: false,
    bestPractices: false,
    troubleshooting: false,
    faqs: false,
    glossary: false,
    appendix: false
  },
  implementation_guide: {
    introduction: true,
    overview: true,
    prerequisites: true,
    stepByStep: true,
    bestPractices: true,
    troubleshooting: true,
    faqs: true,
    glossary: true,
    appendix: true
  },
  reference_guide: {
    introduction: true,
    overview: true,
    prerequisites: false,
    stepByStep: false,
    bestPractices: false,
    troubleshooting: false,
    faqs: false,
    glossary: true,
    appendix: true
  },
  policy_document: {
    introduction: true,
    overview: true,
    prerequisites: false,
    stepByStep: true,
    bestPractices: false,
    troubleshooting: false,
    faqs: false,
    glossary: true,
    appendix: true
  },
  faq_document: {
    introduction: true,
    overview: false,
    prerequisites: false,
    stepByStep: false,
    bestPractices: false,
    troubleshooting: true,
    faqs: true,
    glossary: false,
    appendix: false
  }
};

// Formatting presets for each document type
export const FORMATTING_PRESETS: Record<DocumentType, DocumentTemplate['formatting']> = {
  training_guide: {
    headerStyle: 'numbered',
    calloutStyle: 'confluence',
    screenshotPlacement: 'annotated',
    codeBlockTheme: 'auto'
  },
  user_manual: {
    headerStyle: 'numbered',
    calloutStyle: 'confluence',
    screenshotPlacement: 'annotated',
    codeBlockTheme: 'light'
  },
  sop: {
    headerStyle: 'numbered',
    calloutStyle: 'confluence',
    screenshotPlacement: 'annotated',
    codeBlockTheme: 'light'
  },
  quick_start: {
    headerStyle: 'plain',
    calloutStyle: 'minimal',
    screenshotPlacement: 'inline',
    codeBlockTheme: 'auto'
  },
  technical_doc: {
    headerStyle: 'numbered',
    calloutStyle: 'github',
    screenshotPlacement: 'inline',
    codeBlockTheme: 'dark'
  },
  job_aid: {
    headerStyle: 'plain',
    calloutStyle: 'minimal',
    screenshotPlacement: 'inline',
    codeBlockTheme: 'auto'
  },
  release_notes: {
    headerStyle: 'icon',
    calloutStyle: 'github',
    screenshotPlacement: 'inline',
    codeBlockTheme: 'auto'
  },
  implementation_guide: {
    headerStyle: 'numbered',
    calloutStyle: 'confluence',
    screenshotPlacement: 'annotated',
    codeBlockTheme: 'light'
  },
  reference_guide: {
    headerStyle: 'plain',
    calloutStyle: 'minimal',
    screenshotPlacement: 'inline',
    codeBlockTheme: 'light'
  },
  policy_document: {
    headerStyle: 'numbered',
    calloutStyle: 'confluence',
    screenshotPlacement: 'inline',
    codeBlockTheme: 'light'
  },
  faq_document: {
    headerStyle: 'plain',
    calloutStyle: 'minimal',
    screenshotPlacement: 'inline',
    codeBlockTheme: 'auto'
  }
};

// Complete default templates for all 11 document types
export const INDUSTRY_ALIGNED_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'training-guide',
    name: 'Training Guide',
    description: 'Comprehensive training with learning objectives and assessments',
    type: 'training_guide',
    layout: LAYOUT_PRESETS.training_guide,
    sections: SECTIONS_PRESETS.training_guide,
    formatting: FORMATTING_PRESETS.training_guide,
    branding: BRANDING_PRESETS.training_guide
  },
  {
    id: 'user-manual',
    name: 'User Manual',
    description: '8-part enterprise manual with detailed admin instructions',
    type: 'user_manual',
    layout: LAYOUT_PRESETS.user_manual,
    sections: SECTIONS_PRESETS.user_manual,
    formatting: FORMATTING_PRESETS.user_manual,
    branding: BRANDING_PRESETS.user_manual
  },
  {
    id: 'sop',
    name: 'Standard Operating Procedure',
    description: 'Formal SOP with approval sections and compliance elements',
    type: 'sop',
    layout: LAYOUT_PRESETS.sop,
    sections: SECTIONS_PRESETS.sop,
    formatting: FORMATTING_PRESETS.sop,
    branding: BRANDING_PRESETS.sop
  },
  {
    id: 'quick-start',
    name: 'Quick Start Guide',
    description: 'Concise getting-started guide for rapid onboarding',
    type: 'quick_start',
    layout: LAYOUT_PRESETS.quick_start,
    sections: SECTIONS_PRESETS.quick_start,
    formatting: FORMATTING_PRESETS.quick_start,
    branding: BRANDING_PRESETS.quick_start
  },
  {
    id: 'technical-doc',
    name: 'Technical Documentation',
    description: 'Technical documentation for developers and admins',
    type: 'technical_doc',
    layout: LAYOUT_PRESETS.technical_doc,
    sections: SECTIONS_PRESETS.technical_doc,
    formatting: FORMATTING_PRESETS.technical_doc,
    branding: BRANDING_PRESETS.technical_doc
  },
  {
    id: 'job-aid',
    name: 'Job Aid',
    description: '1-2 page quick reference cards for single tasks',
    type: 'job_aid',
    layout: LAYOUT_PRESETS.job_aid,
    sections: SECTIONS_PRESETS.job_aid,
    formatting: FORMATTING_PRESETS.job_aid,
    branding: BRANDING_PRESETS.job_aid
  },
  {
    id: 'release-notes',
    name: 'Release Notes',
    description: 'Version-specific updates, new features, bug fixes',
    type: 'release_notes',
    layout: LAYOUT_PRESETS.release_notes,
    sections: SECTIONS_PRESETS.release_notes,
    formatting: FORMATTING_PRESETS.release_notes,
    branding: BRANDING_PRESETS.release_notes
  },
  {
    id: 'implementation-guide',
    name: 'Implementation Guide',
    description: 'Step-by-step setup guides for implementation consultants',
    type: 'implementation_guide',
    layout: LAYOUT_PRESETS.implementation_guide,
    sections: SECTIONS_PRESETS.implementation_guide,
    formatting: FORMATTING_PRESETS.implementation_guide,
    branding: BRANDING_PRESETS.implementation_guide
  },
  {
    id: 'reference-guide',
    name: 'Reference Guide',
    description: 'Lookup-style documentation with field definitions and codes',
    type: 'reference_guide',
    layout: LAYOUT_PRESETS.reference_guide,
    sections: SECTIONS_PRESETS.reference_guide,
    formatting: FORMATTING_PRESETS.reference_guide,
    branding: BRANDING_PRESETS.reference_guide
  },
  {
    id: 'policy-document',
    name: 'Policy Document',
    description: 'HR policies with effective dates, approval, and compliance',
    type: 'policy_document',
    layout: LAYOUT_PRESETS.policy_document,
    sections: SECTIONS_PRESETS.policy_document,
    formatting: FORMATTING_PRESETS.policy_document,
    branding: BRANDING_PRESETS.policy_document
  },
  {
    id: 'faq-document',
    name: 'FAQ Document',
    description: 'Structured question-and-answer format',
    type: 'faq_document',
    layout: LAYOUT_PRESETS.faq_document,
    sections: SECTIONS_PRESETS.faq_document,
    formatting: FORMATTING_PRESETS.faq_document,
    branding: BRANDING_PRESETS.faq_document
  }
];
