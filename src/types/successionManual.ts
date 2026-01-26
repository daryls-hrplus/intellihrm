// Succession Planning Administrator Manual - Structure Definition
// Comprehensive documentation for 29+ database tables, 13 UI pages
// Following industry standards: SAP SuccessFactors, Workday, SHRM patterns

export interface SuccessionSection {
  id: string;
  sectionNumber: string;
  title: string;
  description: string;
  contentLevel: 'overview' | 'concept' | 'procedure' | 'reference';
  estimatedReadTime: number;
  targetRoles: ('Admin' | 'Consultant' | 'HR Partner' | 'Manager' | 'Executive')[];
  industryContext?: {
    frequency?: string;
    timing?: string;
    benchmark?: string;
  };
  subsections?: SuccessionSection[];
}

export interface SuccessionGlossaryTerm {
  term: string;
  definition: string;
  category: 'Core' | 'Nine-Box' | 'Talent Pool' | 'Readiness' | 'Risk' | 'Career' | 'Integration' | 'Analytics';
}

// =============================================================================
// MANUAL STRUCTURE - 11 Parts Following Industry Implementation Sequence
// =============================================================================

export const SUCCESSION_MANUAL_STRUCTURE: SuccessionSection[] = [
  // ==========================================================================
  // PART 1: SYSTEM ARCHITECTURE & OVERVIEW (~40 min)
  // ==========================================================================
  {
    id: 'part-1',
    sectionNumber: '1',
    title: 'System Architecture & Overview',
    description: 'Introduction to succession planning, business value, persona journeys, and complete data architecture covering 29+ database tables.',
    contentLevel: 'overview',
    estimatedReadTime: 40,
    targetRoles: ['Admin', 'Consultant', 'HR Partner'],
    subsections: [
      {
        id: 'sec-1-1',
        sectionNumber: '1.1',
        title: 'Introduction & Business Value',
        description: 'Strategic importance of succession planning, ROI metrics, and industry benchmarks',
        contentLevel: 'overview',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant', 'HR Partner'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-implementation',
          benchmark: 'SHRM: Organizations with formal succession plans have 25% better leadership pipeline metrics'
        }
      },
      {
        id: 'sec-1-2',
        sectionNumber: '1.2',
        title: 'User Personas & Access Rights',
        description: 'HR Admin, Manager, Executive, and Employee persona journeys with role-based access matrix',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-implementation',
          benchmark: 'Role-based access control (RBAC) patterns'
        }
      },
      {
        id: 'sec-1-3',
        sectionNumber: '1.3',
        title: 'Database Architecture',
        description: 'Complete data model with 29+ tables across Nine-Box, Talent Pools, Succession Plans, Readiness, Career, and Mentorship domains',
        contentLevel: 'reference',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-implementation',
          benchmark: 'Enterprise-grade data model following SAP SuccessFactors patterns'
        }
      },
      {
        id: 'sec-1-4',
        sectionNumber: '1.4',
        title: 'Module Dependencies',
        description: 'Integration points with Performance, Workforce, Learning, Compensation, and 360 Feedback modules',
        contentLevel: 'concept',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-implementation',
          benchmark: 'Cross-module data flow architecture'
        }
      }
    ]
  },

  // ==========================================================================
  // PART 2: FOUNDATION SETUP (~60 min)
  // ==========================================================================
  {
    id: 'part-2',
    sectionNumber: '2',
    title: 'Foundation Setup',
    description: 'Prerequisites, assessor types, readiness bands, availability reasons, and company-specific settings.',
    contentLevel: 'procedure',
    estimatedReadTime: 60,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      {
        id: 'sec-2-1',
        sectionNumber: '2.1',
        title: 'Prerequisites Checklist',
        description: 'Required configurations from Workforce, Performance, and Competency modules before succession setup',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time',
          timing: 'Pre-implementation',
          benchmark: 'Job architecture, competency framework, and org structure must be in place'
        }
      },
      {
        id: 'sec-2-2',
        sectionNumber: '2.2',
        title: 'Assessor Types Configuration',
        description: 'Configure Manager, HR, Executive, and Skip-Level assessor roles with permissions',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time setup',
          timing: 'Pre-implementation',
          benchmark: 'Multi-assessor validation for objective readiness evaluation'
        }
      },
      {
        id: 'sec-2-3',
        sectionNumber: '2.3',
        title: 'Readiness Rating Bands',
        description: 'Define Ready Now, 1-2 Years, 3+ Years, Developing, and Not a Successor bands with score ranges',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'One-time, annual review',
          timing: 'Pre-implementation',
          benchmark: '5-band model aligned with SAP SuccessFactors and Workday patterns'
        }
      },
      {
        id: 'sec-2-4',
        sectionNumber: '2.4',
        title: 'Availability Reasons',
        description: 'Configure Retirement, Promotion, Resignation, Transfer, and custom availability reasons',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time setup',
          timing: 'Pre-implementation',
          benchmark: 'Standardized reason codes for vacancy planning'
        }
      },
      {
        id: 'sec-2-5',
        sectionNumber: '2.5',
        title: 'Company-Specific Settings',
        description: 'Multi-company configuration, inheritance rules, and regional compliance settings',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per company',
          timing: 'Post foundation setup',
          benchmark: 'Multi-entity support for global organizations'
        }
      }
    ]
  },

  // ==========================================================================
  // PART 3: NINE-BOX ASSESSMENT CONFIGURATION (~90 min)
  // ==========================================================================
  {
    id: 'part-3',
    sectionNumber: '3',
    title: 'Nine-Box Assessment Configuration',
    description: 'Complete Nine-Box grid setup including rating sources, signal mappings, axis configuration, and label customization.',
    contentLevel: 'procedure',
    estimatedReadTime: 90,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      {
        id: 'sec-3-1',
        sectionNumber: '3.1',
        title: 'Nine-Box Model Overview',
        description: 'Performance vs. Potential matrix theory, box definitions, and strategic implications',
        contentLevel: 'concept',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-configuration',
          benchmark: 'McKinsey 9-Box talent matrix methodology'
        }
      },
      {
        id: 'sec-3-2',
        sectionNumber: '3.2',
        title: 'Rating Sources Configuration',
        description: 'Configure appraisal scores, goal achievement, 360 feedback, and custom sources as inputs',
        contentLevel: 'procedure',
        estimatedReadTime: 20,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time, annual review',
          timing: 'Post foundation setup',
          benchmark: 'Multi-source input for objective assessment'
        }
      },
      {
        id: 'sec-3-3',
        sectionNumber: '3.3',
        title: 'Signal Mappings',
        description: 'Map performance signals to Nine-Box axes with weighted calculations',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time, optimization quarterly',
          timing: 'Post rating sources',
          benchmark: 'Signal-to-axis mapping for automated placement'
        }
      },
      {
        id: 'sec-3-4',
        sectionNumber: '3.4',
        title: 'Box Labels & Descriptions',
        description: 'Customize 9 box labels, descriptions, and recommended actions per company',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time, annual review',
          timing: 'Post signal mappings',
          benchmark: 'Consistent terminology across organization'
        }
      },
      {
        id: 'sec-3-5',
        sectionNumber: '3.5',
        title: 'Performance Axis Sources',
        description: 'Configure performance axis inputs: appraisal ratings, goal completion, KPI achievement',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time',
          timing: 'Post rating sources',
          benchmark: 'Performance = Current contribution and results'
        }
      },
      {
        id: 'sec-3-6',
        sectionNumber: '3.6',
        title: 'Potential Axis Sources',
        description: 'Configure potential axis inputs: learning agility, leadership assessment, career aspirations',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time',
          timing: 'Post performance axis',
          benchmark: 'Potential = Future capability and growth capacity'
        }
      }
    ]
  },

  // ==========================================================================
  // PART 4: READINESS ASSESSMENT FRAMEWORK (~75 min)
  // ==========================================================================
  {
    id: 'part-4',
    sectionNumber: '4',
    title: 'Readiness Assessment Framework',
    description: 'Design readiness indicators, build assessment forms, configure scoring, and set up multi-assessor workflows.',
    contentLevel: 'procedure',
    estimatedReadTime: 75,
    targetRoles: ['Admin', 'Consultant', 'HR Partner'],
    subsections: [
      {
        id: 'sec-4-1',
        sectionNumber: '4.1',
        title: 'Readiness Indicators Design',
        description: 'Create weighted indicators for experience, competency gaps, mobility, and readiness signals',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time, annual review',
          timing: 'Post readiness bands',
          benchmark: 'Weighted scoring for objective readiness calculation'
        }
      },
      {
        id: 'sec-4-2',
        sectionNumber: '4.2',
        title: 'Form Builder Configuration',
        description: 'Create readiness assessment forms by staff type (Executive, Manager, Professional)',
        contentLevel: 'procedure',
        estimatedReadTime: 20,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per staff type',
          timing: 'Post indicators',
          benchmark: 'Role-appropriate assessment depth and questions'
        }
      },
      {
        id: 'sec-4-3',
        sectionNumber: '4.3',
        title: 'Category & Question Setup',
        description: 'Organize indicators into categories with guidance text and scoring rubrics',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per form',
          timing: 'During form creation',
          benchmark: 'Consistent structure for assessor guidance'
        }
      },
      {
        id: 'sec-4-4',
        sectionNumber: '4.4',
        title: 'Scoring Guide Definitions',
        description: 'Define score-to-band mappings, threshold calculations, and override rules',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'One-time, annual calibration',
          timing: 'Post form setup',
          benchmark: 'Automated band assignment with HR override capability'
        }
      },
      {
        id: 'sec-4-5',
        sectionNumber: '4.5',
        title: 'Multi-Assessor Workflows',
        description: 'Configure Manager, HR, and Executive assessment sequences with consolidation rules',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time',
          timing: 'Post forms',
          benchmark: 'Multi-rater validation for objective readiness assessment'
        }
      }
    ]
  },

  // ==========================================================================
  // PART 5: TALENT POOL MANAGEMENT (~45 min)
  // ==========================================================================
  {
    id: 'part-5',
    sectionNumber: '5',
    title: 'Talent Pool Management',
    description: 'Create and manage talent pools for high potentials, leadership pipeline, and critical skills.',
    contentLevel: 'procedure',
    estimatedReadTime: 45,
    targetRoles: ['Admin', 'HR Partner'],
    subsections: [
      {
        id: 'sec-5-1',
        sectionNumber: '5.1',
        title: 'Pool Types & Purposes',
        description: 'Understanding High Potential, Leadership Pipeline, Critical Skills, and Emerging Talent pools',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-configuration',
          benchmark: 'Strategic talent segmentation for focused development'
        }
      },
      {
        id: 'sec-5-2',
        sectionNumber: '5.2',
        title: 'Pool Creation & Configuration',
        description: 'Create pools with criteria, capacity limits, and automatic nomination rules',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per pool type',
          timing: 'Post foundation setup',
          benchmark: 'Criteria-based membership for objective talent identification'
        }
      },
      {
        id: 'sec-5-3',
        sectionNumber: '5.3',
        title: 'Member Management',
        description: 'Add, review, and graduate talent pool members with development tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Quarterly review',
          timing: 'Ongoing operations',
          benchmark: 'Active pool management for pipeline health'
        }
      },
      {
        id: 'sec-5-4',
        sectionNumber: '5.4',
        title: 'Review Packet Generation',
        description: 'Create executive review packets for talent pool calibration sessions',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per review cycle',
          timing: 'Pre-calibration',
          benchmark: 'Comprehensive talent dossiers for leadership review'
        }
      }
    ]
  },

  // ==========================================================================
  // PART 6: SUCCESSION PLANNING WORKFLOW (~90 min)
  // ==========================================================================
  {
    id: 'part-6',
    sectionNumber: '6',
    title: 'Succession Planning Workflow',
    description: 'End-to-end succession planning from key position identification to development plan execution.',
    contentLevel: 'procedure',
    estimatedReadTime: 90,
    targetRoles: ['Admin', 'HR Partner'],
    subsections: [
      {
        id: 'sec-6-1',
        sectionNumber: '6.1',
        title: 'Key Position Identification',
        description: 'Mark positions as key/critical with business impact scoring and risk assessment',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Annual review',
          timing: 'Start of planning cycle',
          benchmark: 'Typically 10-15% of positions are key/critical'
        }
      },
      {
        id: 'sec-6-2',
        sectionNumber: '6.2',
        title: 'Succession Plan Creation',
        description: 'Create succession plans for key positions with timeframes and coverage targets',
        contentLevel: 'procedure',
        estimatedReadTime: 20,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per key position',
          timing: 'Post position identification',
          benchmark: '2-3 ready successors per key position'
        }
      },
      {
        id: 'sec-6-3',
        sectionNumber: '6.3',
        title: 'Candidate Nomination & Ranking',
        description: 'Nominate candidates, assess readiness, and establish succession order',
        contentLevel: 'procedure',
        estimatedReadTime: 20,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per plan',
          timing: 'Post plan creation',
          benchmark: 'Manager + HR collaboration for balanced nominations'
        }
      },
      {
        id: 'sec-6-4',
        sectionNumber: '6.4',
        title: 'Readiness Assessment Execution',
        description: 'Conduct readiness assessments, collect evidence, and determine readiness bands',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per candidate',
          timing: 'Post nomination',
          benchmark: 'Multi-assessor validation for objective placement'
        }
      },
      {
        id: 'sec-6-5',
        sectionNumber: '6.5',
        title: 'Development Plan Linking',
        description: 'Connect succession gaps to IDP goals, learning assignments, and stretch projects',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per candidate',
          timing: 'Post readiness assessment',
          benchmark: 'Development-driven succession readiness acceleration'
        }
      },
      {
        id: 'sec-6-6',
        sectionNumber: '6.6',
        title: 'Candidate Evidence Collection',
        description: 'Document accomplishments, certifications, and readiness evidence for candidates',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Ongoing',
          timing: 'Throughout planning cycle',
          benchmark: 'Evidence-based succession decisions'
        }
      }
    ]
  },

  // ==========================================================================
  // PART 7: RISK MANAGEMENT (~60 min)
  // ==========================================================================
  {
    id: 'part-7',
    sectionNumber: '7',
    title: 'Risk Management',
    description: 'Flight risk assessment, retention strategies, vacancy risk analysis, and bench strength monitoring.',
    contentLevel: 'procedure',
    estimatedReadTime: 60,
    targetRoles: ['Admin', 'HR Partner'],
    subsections: [
      {
        id: 'sec-7-1',
        sectionNumber: '7.1',
        title: 'Flight Risk Assessment',
        description: 'Configure flight risk indicators, scoring models, and AI-assisted risk prediction',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Continuous monitoring',
          timing: 'Ongoing',
          benchmark: 'Early warning for proactive retention interventions'
        }
      },
      {
        id: 'sec-7-2',
        sectionNumber: '7.2',
        title: 'Retention Risk Matrix',
        description: 'Cross-reference impact and probability for prioritized retention actions',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Monthly review',
          timing: 'Ongoing',
          benchmark: 'Impact × Probability prioritization matrix'
        }
      },
      {
        id: 'sec-7-3',
        sectionNumber: '7.3',
        title: 'Key Position Vacancy Risk',
        description: 'Assess vacancy risk factors: retirement, competitive offers, internal movement',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Quarterly',
          timing: 'Succession planning cycle',
          benchmark: 'Anticipate vacancies 12-24 months ahead'
        }
      },
      {
        id: 'sec-7-4',
        sectionNumber: '7.4',
        title: 'Bench Strength Analysis',
        description: 'Monitor coverage ratios, readiness distribution, and pipeline health metrics',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Monthly dashboard',
          timing: 'Ongoing',
          benchmark: '≥1.5 ready successors per key position is healthy'
        }
      }
    ]
  },

  // ==========================================================================
  // PART 8: CAREER DEVELOPMENT & MENTORSHIP (~45 min)
  // ==========================================================================
  {
    id: 'part-8',
    sectionNumber: '8',
    title: 'Career Development & Mentorship',
    description: 'Career path design, progression steps, mentorship program setup, and pairing workflows.',
    contentLevel: 'procedure',
    estimatedReadTime: 45,
    targetRoles: ['Admin', 'HR Partner'],
    subsections: [
      {
        id: 'sec-8-1',
        sectionNumber: '8.1',
        title: 'Career Path Design',
        description: 'Create career paths with job progressions, competency requirements, and typical timeframes',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per career track',
          timing: 'Post job architecture',
          benchmark: 'Clear progression visibility drives engagement'
        }
      },
      {
        id: 'sec-8-2',
        sectionNumber: '8.2',
        title: 'Path Step Configuration',
        description: 'Define prerequisites, development activities, and assessment criteria per step',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per path',
          timing: 'During path creation',
          benchmark: 'Measurable milestones for progression decisions'
        }
      },
      {
        id: 'sec-8-3',
        sectionNumber: '8.3',
        title: 'Mentorship Program Setup',
        description: 'Create mentorship programs with goals, duration, and matching criteria',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per program',
          timing: 'Post career paths',
          benchmark: 'Mentorship accelerates readiness by 30%'
        }
      },
      {
        id: 'sec-8-4',
        sectionNumber: '8.4',
        title: 'Mentor-Mentee Pairing',
        description: 'Match mentors and mentees, track sessions, and measure program effectiveness',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per program cycle',
          timing: 'Program operations',
          benchmark: 'Skills-based matching for maximum impact'
        }
      }
    ]
  },

  // ==========================================================================
  // PART 9: INTEGRATION & CROSS-MODULE FEATURES (~60 min)
  // ==========================================================================
  {
    id: 'part-9',
    sectionNumber: '9',
    title: 'Integration & Cross-Module Features',
    description: 'Performance, 360 Feedback, Learning, Workforce, and Compensation integration patterns.',
    contentLevel: 'procedure',
    estimatedReadTime: 60,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      {
        id: 'sec-9-1',
        sectionNumber: '9.1',
        title: 'Integration Architecture',
        description: 'Data flow overview and cross-module dependencies for succession planning',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-integration',
          benchmark: 'Event-driven integration architecture'
        }
      },
      {
        id: 'sec-9-2',
        sectionNumber: '9.2',
        title: 'Performance Appraisal Integration',
        description: 'Feed appraisal ratings to Nine-Box performance axis and succession readiness',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per appraisal cycle',
          timing: 'Post-appraisal',
          benchmark: 'Automated Nine-Box placement from performance data'
        }
      },
      {
        id: 'sec-9-3',
        sectionNumber: '9.3',
        title: '360 Feedback Integration',
        description: 'Incorporate 360 feedback signals into potential assessment and development themes',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per 360 cycle',
          timing: 'Post-360 results',
          benchmark: 'Multi-rater feedback for leadership potential indicators'
        }
      },
      {
        id: 'sec-9-4',
        sectionNumber: '9.4',
        title: 'Learning & IDP Integration',
        description: 'Link succession gaps to learning recommendations and development plans',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per candidate',
          timing: 'Post readiness assessment',
          benchmark: 'AI-driven learning recommendations for gap closure'
        }
      },
      {
        id: 'sec-9-5',
        sectionNumber: '9.5',
        title: 'Workforce & Position Integration',
        description: 'Sync with org structure, position changes, and headcount planning',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Real-time sync',
          timing: 'Ongoing',
          benchmark: 'Position lifecycle events trigger succession updates'
        }
      },
      {
        id: 'sec-9-6',
        sectionNumber: '9.6',
        title: 'Compensation Integration',
        description: 'Retention bonus triggers, market adjustment recommendations for flight risks',
        contentLevel: 'procedure',
        estimatedReadTime: 5,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per cycle',
          timing: 'Compensation planning',
          benchmark: 'Compensation as retention lever for high-value talent'
        }
      }
    ]
  },

  // ==========================================================================
  // PART 10: REPORTING & ANALYTICS (~30 min)
  // ==========================================================================
  {
    id: 'part-10',
    sectionNumber: '10',
    title: 'Reporting & Analytics',
    description: 'Dashboard metrics, bench strength reports, flight risk analysis, and Nine-Box distribution.',
    contentLevel: 'reference',
    estimatedReadTime: 30,
    targetRoles: ['Admin', 'HR Partner', 'Executive'],
    subsections: [
      {
        id: 'sec-10-1',
        sectionNumber: '10.1',
        title: 'Succession Dashboard Metrics',
        description: 'Key metrics: coverage ratio, readiness distribution, pipeline health, diversity',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Real-time',
          timing: 'Ongoing monitoring',
          benchmark: 'Executive-ready succession health scorecard'
        }
      },
      {
        id: 'sec-10-2',
        sectionNumber: '10.2',
        title: 'Bench Strength Reports',
        description: 'Coverage analysis by department, job family, and criticality level',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Monthly/quarterly',
          timing: 'Planning cycles',
          benchmark: 'Identify coverage gaps for targeted development'
        }
      },
      {
        id: 'sec-10-3',
        sectionNumber: '10.3',
        title: 'Flight Risk Reports',
        description: 'Risk heatmaps, retention action tracking, and prediction accuracy metrics',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Weekly/monthly',
          timing: 'Ongoing',
          benchmark: 'Proactive retention intervention effectiveness'
        }
      },
      {
        id: 'sec-10-4',
        sectionNumber: '10.4',
        title: 'Nine-Box Distribution Reports',
        description: 'Talent distribution, movement trends, and calibration variance analysis',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per assessment cycle',
          timing: 'Post-calibration',
          benchmark: 'Healthy distribution: 10-15% in top-right quadrant'
        }
      }
    ]
  },

  // ==========================================================================
  // PART 11: TROUBLESHOOTING & FAQS (~45 min)
  // ==========================================================================
  {
    id: 'part-11',
    sectionNumber: '11',
    title: 'Troubleshooting & FAQs',
    description: 'Common issues, diagnostic procedures, and escalation paths for succession planning.',
    contentLevel: 'reference',
    estimatedReadTime: 45,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      {
        id: 'sec-11-1',
        sectionNumber: '11.1',
        title: 'Common Configuration Issues',
        description: 'Readiness bands, assessor types, rating sources, and form configuration problems',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Implementation and support',
          benchmark: 'Step-by-step resolution guides'
        }
      },
      {
        id: 'sec-11-2',
        sectionNumber: '11.2',
        title: 'Nine-Box Calculation Problems',
        description: 'Signal mapping errors, missing source data, axis calculation issues',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Post-configuration',
          benchmark: 'Diagnostic flowcharts for calculation issues'
        }
      },
      {
        id: 'sec-11-3',
        sectionNumber: '11.3',
        title: 'Readiness Assessment Issues',
        description: 'Form errors, scoring problems, multi-assessor conflicts',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Assessment execution',
          benchmark: 'Issue patterns and resolution steps'
        }
      },
      {
        id: 'sec-11-4',
        sectionNumber: '11.4',
        title: 'Integration Failures',
        description: 'Performance sync, 360 feed, learning link, and workforce data issues',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Integration troubleshooting',
          benchmark: 'Data flow validation procedures'
        }
      },
      {
        id: 'sec-11-5',
        sectionNumber: '11.5',
        title: 'Escalation Procedures',
        description: 'Support tiers, severity definitions, and communication templates',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Support operations',
          benchmark: '4-tier support model aligned with ITIL'
        }
      }
    ]
  }
];

// =============================================================================
// GLOSSARY - 55+ TERMS ACROSS 8 CATEGORIES
// =============================================================================

export const SUCCESSION_GLOSSARY: SuccessionGlossaryTerm[] = [
  // Core Terms
  { term: 'Succession Planning', definition: 'Strategic process of identifying and developing future leaders to fill key positions when they become vacant.', category: 'Core' },
  { term: 'Key Position', definition: 'A role critical to business operations where vacancy would significantly impact organizational performance.', category: 'Core' },
  { term: 'Successor', definition: 'An employee identified as a potential candidate to fill a key position in the future.', category: 'Core' },
  { term: 'Bench Strength', definition: 'The depth and readiness of potential successors available to fill key positions.', category: 'Core' },
  { term: 'Coverage Ratio', definition: 'The number of ready successors per key position, indicating pipeline health.', category: 'Core' },
  { term: 'Succession Plan', definition: 'Documented strategy identifying successors for a specific key position with development timelines.', category: 'Core' },
  { term: 'Talent Pipeline', definition: 'The flow of employees being developed for future leadership positions.', category: 'Core' },
  { term: 'Critical Role', definition: 'A position requiring specialized skills that are difficult to replace in the market.', category: 'Core' },

  // Nine-Box Terms
  { term: 'Nine-Box Grid', definition: 'A 3x3 matrix plotting employees by Performance (X-axis) and Potential (Y-axis) for talent segmentation.', category: 'Nine-Box' },
  { term: 'Performance Axis', definition: 'The horizontal axis of the Nine-Box measuring current job performance and results delivery.', category: 'Nine-Box' },
  { term: 'Potential Axis', definition: 'The vertical axis of the Nine-Box measuring future growth capacity and leadership capability.', category: 'Nine-Box' },
  { term: 'High Potential (HiPo)', definition: 'Employees in the top-right quadrant of the Nine-Box showing both high performance and high potential.', category: 'Nine-Box' },
  { term: 'Core Contributor', definition: 'Solid performers in the center of the Nine-Box who are essential to daily operations.', category: 'Nine-Box' },
  { term: 'Rating Source', definition: 'Data input used to calculate Nine-Box placement such as appraisals, goals, or 360 feedback.', category: 'Nine-Box' },
  { term: 'Signal Mapping', definition: 'Configuration linking performance signals to Nine-Box axes with weighted calculations.', category: 'Nine-Box' },
  { term: 'Box Calibration', definition: 'Leadership review process to validate and adjust Nine-Box placements for consistency.', category: 'Nine-Box' },

  // Talent Pool Terms
  { term: 'Talent Pool', definition: 'A group of employees identified for accelerated development based on potential or strategic needs.', category: 'Talent Pool' },
  { term: 'High Potential Pool', definition: 'Talent pool containing employees identified as having high future leadership potential.', category: 'Talent Pool' },
  { term: 'Leadership Pipeline', definition: 'Structured program developing employees through progressive leadership roles.', category: 'Talent Pool' },
  { term: 'Critical Skills Pool', definition: 'Talent pool of employees with rare or strategic competencies important for business continuity.', category: 'Talent Pool' },
  { term: 'Pool Nomination', definition: 'Process of identifying and recommending employees for talent pool membership.', category: 'Talent Pool' },
  { term: 'Pool Graduation', definition: 'Transition of talent pool members to successor roles or advanced pools.', category: 'Talent Pool' },
  { term: 'Review Packet', definition: 'Comprehensive talent dossier prepared for executive talent review sessions.', category: 'Talent Pool' },

  // Readiness Terms
  { term: 'Readiness Assessment', definition: 'Evaluation determining how prepared a successor is to assume a key position.', category: 'Readiness' },
  { term: 'Ready Now', definition: 'Readiness band indicating the successor can assume the role immediately (0-12 months).', category: 'Readiness' },
  { term: 'Ready 1-2 Years', definition: 'Readiness band indicating the successor needs 1-2 years of development before assuming the role.', category: 'Readiness' },
  { term: 'Ready 3+ Years', definition: 'Readiness band indicating the successor needs 3 or more years of development.', category: 'Readiness' },
  { term: 'Readiness Indicator', definition: 'Weighted question or criterion used to assess succession readiness.', category: 'Readiness' },
  { term: 'Readiness Score', definition: 'Calculated score from indicator ratings determining readiness band placement.', category: 'Readiness' },
  { term: 'Multi-Assessor', definition: 'Readiness assessment approach involving multiple raters (Manager, HR, Executive).', category: 'Readiness' },
  { term: 'Assessor Type', definition: 'Role category (Manager, HR, Executive) with different assessment perspectives and weights.', category: 'Readiness' },

  // Risk Terms
  { term: 'Flight Risk', definition: 'Probability that an employee will voluntarily leave the organization.', category: 'Risk' },
  { term: 'Retention Risk', definition: 'Combined assessment of flight risk and impact of losing a key employee.', category: 'Risk' },
  { term: 'Vacancy Risk', definition: 'Probability and timing of a key position becoming vacant.', category: 'Risk' },
  { term: 'Impact Score', definition: 'Rating of business disruption if a specific employee or position is lost.', category: 'Risk' },
  { term: 'Retention Action', definition: 'Intervention designed to reduce flight risk such as compensation, development, or recognition.', category: 'Risk' },
  { term: 'Risk Matrix', definition: 'Grid plotting impact vs probability to prioritize retention interventions.', category: 'Risk' },
  { term: 'Early Warning', definition: 'Predictive signals indicating increased flight risk before voluntary departure.', category: 'Risk' },

  // Career Terms
  { term: 'Career Path', definition: 'Defined progression of roles from entry to senior positions within a job family.', category: 'Career' },
  { term: 'Career Step', definition: 'Individual position or level within a career path with defined requirements.', category: 'Career' },
  { term: 'Lateral Move', definition: 'Career transition to a different role at the same level for development purposes.', category: 'Career' },
  { term: 'Stretch Assignment', definition: 'Challenging project or role designed to accelerate development beyond current level.', category: 'Career' },
  { term: 'Mentorship Program', definition: 'Structured relationship between experienced mentor and developing mentee.', category: 'Career' },
  { term: 'Mentor', definition: 'Experienced employee providing guidance and development support to a mentee.', category: 'Career' },
  { term: 'Mentee', definition: 'Employee receiving guidance and development support from a mentor.', category: 'Career' },
  { term: 'Career Aspiration', definition: 'Employee\'s stated interest in specific roles or career directions.', category: 'Career' },

  // Integration Terms
  { term: 'Performance Feed', definition: 'Automated data flow from appraisal system to succession planning.', category: 'Integration' },
  { term: '360 Signal', definition: 'Talent insights extracted from 360 feedback for succession planning.', category: 'Integration' },
  { term: 'IDP Link', definition: 'Connection between succession gaps and individual development plan goals.', category: 'Integration' },
  { term: 'Learning Recommendation', definition: 'AI-suggested training to close succession readiness gaps.', category: 'Integration' },
  { term: 'Position Sync', definition: 'Real-time synchronization between workforce data and succession plans.', category: 'Integration' },
  { term: 'Talent Signal', definition: 'Data point indicating employee potential, performance, or readiness change.', category: 'Integration' },

  // Analytics Terms
  { term: 'Pipeline Health', definition: 'Overall assessment of succession program effectiveness and depth.', category: 'Analytics' },
  { term: 'Diversity Metrics', definition: 'Representation statistics for talent pools and successor populations.', category: 'Analytics' },
  { term: 'Movement Trend', definition: 'Analysis of Nine-Box placement changes over time.', category: 'Analytics' },
  { term: 'Readiness Distribution', definition: 'Statistical breakdown of successors by readiness band.', category: 'Analytics' },
  { term: 'Prediction Accuracy', definition: 'Measure of how well flight risk predictions match actual departures.', category: 'Analytics' },
  { term: 'Calibration Variance', definition: 'Difference between initial assessments and post-calibration ratings.', category: 'Analytics' },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getTotalReadTime(): number {
  return SUCCESSION_MANUAL_STRUCTURE.reduce((acc, section) => acc + section.estimatedReadTime, 0);
}

export function getTotalSections(): number {
  return SUCCESSION_MANUAL_STRUCTURE.reduce((acc, section) => 
    acc + 1 + (section.subsections?.length || 0), 0);
}

export function getGlossaryByCategory(category: SuccessionGlossaryTerm['category']): SuccessionGlossaryTerm[] {
  return SUCCESSION_GLOSSARY.filter(term => term.category === category);
}
