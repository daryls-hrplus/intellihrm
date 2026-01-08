// Handbook version tracking and source manual references

export const HANDBOOK_VERSION = {
  version: '2.0.0',
  date: '2026-01-08',
  author: 'Intelli HRM Team',
  nextReviewDate: '2026-04-08'
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
    version: 'v1.3.0',
    lastUpdated: '2026-01-02',
    phasesUsed: ['Phase 6 (Performance)'],
    chaptersReferenced: [
      'Part 2: Cycle Setup',
      'Part 3: Template Configuration',
      'Part 4: Rating Scales',
      'Part 5: Workflow Management'
    ],
    routePath: '/admin/appraisals-admin-manual'
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
