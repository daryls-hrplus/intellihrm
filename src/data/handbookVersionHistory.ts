// Handbook version tracking and source manual references

export const HANDBOOK_VERSION = {
  version: '2.6.0',
  date: '2026-01-23',
  author: 'Intelli HRM Team',
  nextReviewDate: '2026-04-23'
};

export interface SourceManualReference {
  id: string;
  manualName: string;
  version: string;
  lastUpdated: string;
  phasesUsed: string[];
  chaptersReferenced: string[];
  routePath: string;
}

export const SOURCE_REFERENCES: SourceManualReference[] = [
  {
    id: 'workforce',
    manualName: 'Workforce Administrator Manual',
    version: 'v1.3.0',
    lastUpdated: '2026-01-08',
    phasesUsed: ['Phase 1 (Org Structure)', 'Phase 2 (Workforce Core)'],
    chaptersReferenced: [
      'Part 2: Foundation Setup',
      'Part 3: Job Architecture',
      'Part 4: Employee Management',
      'Part 5: Lifecycle Workflows',
      'Part 6: Position Control'
    ],
    routePath: '/admin/workforce-admin-manual'
  },
  {
    id: 'hr-hub',
    manualName: 'HR Hub Administrator Manual',
    version: 'v1.3.0',
    lastUpdated: '2026-01-08',
    phasesUsed: ['Phase 8 (HR Hub)'],
    chaptersReferenced: [
      'Chapter 2: Organization Configuration',
      'Chapter 3: Compliance & Workflows',
      'Chapter 4: Document Center',
      'Chapter 5: Communication & Support',
      'Chapter 6: Daily Operations',
      'Chapter 7: AI Configuration'
    ],
    routePath: '/admin/hr-hub-admin-manual'
  },
  {
    id: 'appraisals',
    manualName: 'Appraisals Administrator Manual',
    version: 'v2.2.0',
    lastUpdated: '2026-01-14',
    phasesUsed: ['Phase 6 (Performance)'],
    chaptersReferenced: [
      'Part 2.2: Rating Scales',
      'Part 2.3: Overall Rating Scales',
      'Part 2.4a: Skills vs Competencies Explained',
      'Part 2.4: Competency Framework Configuration',
      'Part 2.5: Appraisal Index',
      'Part 2.7: Rating Levels Configuration',
      'Part 2.8: Action Rules Configuration',
      'Part 3: Appraisal Configuration',
      'Part 4: Goals & Feedback',
      'Part 5: Cycles & Operations',
      'Part 6: Talent Management',
      'Part 7: Support & PIPs'
    ],
    routePath: '/enablement/manuals/appraisals'
  },
  {
    id: 'admin-security',
    manualName: 'Admin & Security Manual',
    version: 'v1.3.0',
    lastUpdated: '2026-01-08',
    phasesUsed: ['Phase 1 (Foundation)'],
    chaptersReferenced: [
      'Part 1: Authentication',
      'Part 2: Authorization',
      'Part 3: Audit & Compliance'
    ],
    routePath: '/admin/security-manual'
  }
];

export interface ChangeLogEntry {
  version: string;
  date: string;
  changes: string[];
}

export const HANDBOOK_CHANGE_LOG: ChangeLogEntry[] = [
  {
    version: '2.6.0',
    date: '2026-01-23',
    changes: [
      'Added Section 2.1a: Appraisal Readiness - pre-launch validation dashboard documentation',
      'Added Section 2.1b: Job Assessment Configuration - responsibility/KRA weight validation',
      'Renamed "Index Settings" to "Performance Trend Settings" with user-friendly terminology',
      'Updated CRGV model to CRGV+360 with optional 360 Feedback as fifth component',
      'Added new terminology: Cycle Type, Phase Deadlines, Rating Level, Job Assessment Mode, Template Versioning, Outcome Rules',
      'Updated System Architecture with 50+ performance tables organized into logical groups',
      'Moved Performance Trend Settings from Appraisals tab to Core Framework (global setting)',
      'Reorganized Chapter 2 section numbering to match actual UI tab structure',
      'Updated Key Differentiators to include Appraisal Readiness feature'
    ]
  },
  {
    version: '2.5.0',
    date: '2026-01-14',
    changes: [
      'Added breadcrumb navigation to Performance Setup page',
      'Reorganized Appraisals sub-tabs for logical setup flow: Rating Levels → Form Templates → Action Rules → ... → Cycles',
      'Moved Index Settings from Appraisals to Core Framework (global setting)',
      'Updated all Performance phase adminRoute paths to use deep-linking with tab parameters',
      'Added URL parameter support (?tab=&sub=) for direct navigation from Implementation Handbook',
      'Reordered Appraisal Administration tabs: moved Approvals earlier for actionable priority',
      'Reduced Phase 6 to 32 steps with corrected step ordering',
      'Updated step routes to match actual UI locations'
    ]
  },
  {
    version: '2.4.0',
    date: '2026-01-14',
    changes: [
      'Added Approval Workflows (Step 5) and Notification Templates (Step 6) to Phase 6A Core Framework Setup',
      'Updated Phase 6 to 33 steps (was 32) with notifications moved from 6F to 6A',
      'Fixed page layout so TOC and content extend to full viewport height',
      'Added SetupNotifications component to Appraisal Manual Foundation Settings',
      'Renumbered all Phase 6 steps to accommodate new workflow and notification steps in Core Framework'
    ]
  },
  {
    version: '2.3.0',
    date: '2026-01-14',
    changes: [
      'Updated Phase 6 to 32 steps (was 31) with new Skills vs Competencies Foundation step',
      'Added Step 3: Skills vs Competencies Foundation referencing Section 2.4a',
      'Updated Step 4 (Competency Library) with 9 subtasks aligned to Section 2.4 workflow',
      'Expanded Step 7 (Rating Levels) to 9 subtasks including all 4 eligibility flags',
      'Updated Step 6 (Form Templates) to include rating level linking and CRGV model',
      'Updated Step 8 (Action Rules) to include eligibility flag triggers and downstream linking',
      'Corrected source section references to match updated manual structure (2.4a, 2.4, 2.7, 2.8)',
      'Updated admin routes for competencies to /workforce/skills-competencies',
      'Updated Appraisals Manual reference to v2.2.0 with expanded chapter list'
    ]
  },
  {
    version: '2.2.0',
    date: '2026-01-13',
    changes: [
      'Added Section 2.4a: Skills vs Competencies Explained - foundational concept for capability framework',
      'Rewrote Section 2.4: Competency Framework Configuration with AI generation and job linking workflow',
      'Renamed Section 2.7: Performance Categories → Rating Levels Configuration',
      'Added eligibility flags documentation (promotion_eligible, succession_eligible, bonus_eligible, requires_pip)',
      'Updated field reference tables with new database columns from rating_levels table',
      'Added job-competency linking with 100% weight validation requirement',
      'Updated navigation paths to reflect current UI structure'
    ]
  },
  {
    version: '2.1.0',
    date: '2026-01-13',
    changes: [
      'Restructured Phase 6 with 6 sub-sections (6A-6F) aligned to Appraisals Manual (31 steps)',
      'Made Phase 6 concurrent - can run after Phase 1 + employees exist',
      'Added company selector for multi-company implementation tracking',
      'Added Global vs Per Company badges to step cards',
      'Updated dependencies to reflect concurrent phase capability',
      'Added isGlobal flag to implementation mappings'
    ]
  },
  {
    version: '2.0.0',
    date: '2026-01-08',
    changes: [
      'Restructured Phase 2 (Workforce) with 4 sub-sections aligned to Workforce Manual',
      'Restructured Phase 8 (HR Hub) with 6 sub-sections aligned to HR Hub Manual',
      'Added Source Reference tracking tab',
      'Made HR Hub flexible - can implement any time after Phase 1',
      'Added sub-section labels and source references to all steps',
      'Updated dependencies to reflect new module relationships'
    ]
  },
  {
    version: '1.5.0',
    date: '2025-12-15',
    changes: [
      'Added Mexico payroll phases (11-13)',
      'Added International Payroll phase (10)',
      'Enhanced Billing phase with leave buyout configuration'
    ]
  },
  {
    version: '1.0.0',
    date: '2025-06-01',
    changes: [
      'Initial implementation handbook release',
      'Established 9-phase implementation structure',
      'Added dependency tracking'
    ]
  }
];

// Phase to manual mapping for quick lookup
export const PHASE_MANUAL_MAPPING: Record<string, string[]> = {
  'foundation': ['admin-security', 'workforce'],
  'workforce': ['workforce'],
  'compensation': ['workforce'],
  'time-leave': ['workforce'],
  'benefits-training': ['workforce'],
  'performance': ['appraisals', 'workforce'],
  'auxiliary': ['workforce'],
  'hr-hub': ['hr-hub'],
  'billing': [],
  'international': [],
  'mexico-core': [],
  'mexico-advanced': [],
  'mexico-enterprise': []
};
