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
  // PART 1: SYSTEM ARCHITECTURE & OVERVIEW (~62 min)
  // ==========================================================================
  {
    id: 'part-1',
    sectionNumber: '1',
    title: 'System Architecture & Overview',
    description: 'Introduction to succession planning, business value, core concepts, persona journeys, and complete data architecture covering 29+ database tables.',
    contentLevel: 'overview',
    estimatedReadTime: 62,
    targetRoles: ['Admin', 'Consultant', 'HR Partner'],
    subsections: [
      {
        id: 'sec-1-1',
        sectionNumber: '1.1',
        title: 'Introduction & Business Value',
        description: 'Executive summary, strategic value proposition, document scope, learning objectives, and document conventions',
        contentLevel: 'overview',
        estimatedReadTime: 15,
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
        title: 'Core Concepts & Terminology',
        description: 'Nine-Box model theory, readiness assessment model, scoring methodology, 40+ key terms, and lifecycle states',
        contentLevel: 'concept',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'Consultant', 'HR Partner'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-implementation',
          benchmark: 'McKinsey 9-Box talent matrix methodology'
        }
      },
      {
        id: 'sec-1-3',
        sectionNumber: '1.3',
        title: 'User Personas & Journeys',
        description: 'HR Admin, Manager, Executive, and Employee persona journeys with step-by-step tables and role-based access matrix',
        contentLevel: 'concept',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-implementation',
          benchmark: 'Role-based access control (RBAC) patterns'
        }
      },
      {
        id: 'sec-1-4',
        sectionNumber: '1.4',
        title: 'Database Architecture',
        description: 'Entity relationship diagram, 29 table specifications across 7 domains with key fields and relationships',
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
        id: 'sec-1-5',
        sectionNumber: '1.5',
        title: 'Module Dependencies & Calendar',
        description: 'Data flow architecture, prerequisites checklist, integration timing, and annual succession planning calendar',
        contentLevel: 'concept',
        estimatedReadTime: 8,
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
  // PART 2: FOUNDATION SETUP (~99 min)
  // ==========================================================================
  {
    id: 'part-2',
    sectionNumber: '2',
    title: 'Foundation Setup',
    description: 'Prerequisites, assessor types, readiness bands, indicators, forms, availability reasons, and company settings.',
    contentLevel: 'procedure',
    estimatedReadTime: 99,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      {
        id: 'sec-2-1',
        sectionNumber: '2.1',
        title: 'Prerequisites Checklist',
        description: 'Required configurations from Core Framework, Workforce, Performance, and Competency modules before succession setup',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
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
        description: 'Configure Manager, HR, Executive, and Skip-Level assessor roles with permissions and weights',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time setup',
          timing: 'Pre-implementation',
          benchmark: 'Multi-assessor validation for objective readiness evaluation (SAP SuccessFactors)'
        }
      },
      {
        id: 'sec-2-2a',
        sectionNumber: '2.2a',
        title: 'Multi-Assessor Score Aggregation',
        description: 'Weighted average formulas, partial assessment handling, variance detection, and calibration triggers',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Post assessor types',
          benchmark: 'Multi-rater consolidation following Workday patterns'
        }
      },
      {
        id: 'sec-2-3',
        sectionNumber: '2.3',
        title: 'Readiness Rating Bands',
        description: 'Define Ready Now, 1-3 Years, 3-5 Years, Developing, and Not a Successor bands with score ranges and strategic implications',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
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
        title: 'Readiness Indicators & BARS',
        description: '8 categories, 32 default indicators with behaviorally anchored rating scales (BARS) for consistent assessment',
        contentLevel: 'procedure',
        estimatedReadTime: 18,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time, annual review',
          timing: 'Post readiness bands',
          benchmark: 'BARS methodology for objective behavioral assessment'
        }
      },
      {
        id: 'sec-2-4a',
        sectionNumber: '2.4a',
        title: 'Weight Normalization Rules',
        description: 'Indicator weight normalization, skipped indicator handling, validation rules, and relative vs absolute weights',
        contentLevel: 'reference',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Post indicators',
          benchmark: 'Normalized scoring for partial assessments'
        }
      },
      {
        id: 'sec-2-5',
        sectionNumber: '2.5',
        title: 'Readiness Forms',
        description: 'Build readiness assessment forms using form builder, organize indicators into categories, configure staff-type-specific forms',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per staff type',
          timing: 'Post indicators',
          benchmark: 'Role-appropriate assessment depth and questions'
        }
      },
      {
        id: 'sec-2-5a',
        sectionNumber: '2.5a',
        title: 'Staff Type Form Selection',
        description: 'Automatic form selection algorithm, staff type hierarchy, and override capabilities',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Post forms',
          benchmark: 'Role-based form assignment automation'
        }
      },
      {
        id: 'sec-2-6',
        sectionNumber: '2.6',
        title: 'Availability Reasons',
        description: 'Configure planned vs unplanned departure reasons with urgency levels and notification triggers',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time setup',
          timing: 'Post forms',
          benchmark: 'Standardized reason codes for vacancy planning'
        }
      },
      {
        id: 'sec-2-7',
        sectionNumber: '2.7',
        title: 'Company-Specific Settings',
        description: 'Multi-company configuration inheritance, regional compliance settings, and cross-company talent pools',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
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
  // PART 3: NINE-BOX ASSESSMENT CONFIGURATION (~140 min)
  // ==========================================================================
  {
    id: 'part-3',
    sectionNumber: '3',
    title: 'Nine-Box Assessment Configuration',
    description: 'Complete Nine-Box grid setup including rating sources, signal mappings, axis configuration, quadrant labels, assessment workflows, and evidence audit trails.',
    contentLevel: 'procedure',
    estimatedReadTime: 140,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      {
        id: 'sec-3-1',
        sectionNumber: '3.1',
        title: 'Nine-Box Model Overview',
        description: 'McKinsey 9-Box theory, strategic value, axis definitions, quadrant implications, and cross-module integration architecture',
        contentLevel: 'concept',
        estimatedReadTime: 20,
        targetRoles: ['Admin', 'HR Partner', 'Consultant'],
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
        description: 'Configure nine_box_rating_sources table: axis assignment, source types, weights, priority ordering, and default seeds',
        contentLevel: 'procedure',
        estimatedReadTime: 25,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time, annual review',
          timing: 'Post foundation setup',
          benchmark: 'Multi-source input for objective assessment (SAP SuccessFactors pattern)'
        }
      },
      {
        id: 'sec-3-3',
        sectionNumber: '3.3',
        title: 'Signal Mappings',
        description: 'Configure nine_box_signal_mappings: talent signal integration, contributes_to axis, bias risk adjustment, and minimum confidence thresholds',
        contentLevel: 'procedure',
        estimatedReadTime: 20,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time, optimization quarterly',
          timing: 'Post rating sources',
          benchmark: 'Signal-to-axis mapping with bias detection (Workday pattern)'
        }
      },
      {
        id: 'sec-3-4',
        sectionNumber: '3.4',
        title: 'Box Labels & Descriptions',
        description: 'Configure nine_box_indicator_configs: 9 quadrant labels, custom terminology, color coding, suggested actions, and initialize defaults workflow',
        contentLevel: 'procedure',
        estimatedReadTime: 20,
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
        title: 'Performance Axis Configuration',
        description: 'Performance axis formula: appraisal (50%), goals (30%), competency (20%), score normalization, and rating conversion thresholds',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time',
          timing: 'Post rating sources',
          benchmark: 'Performance = Current contribution and results'
        }
      },
      {
        id: 'sec-3-6',
        sectionNumber: '3.6',
        title: 'Potential Axis Configuration',
        description: 'Potential axis formula: assessment (40%), leadership signals (40%), values (20%), learning agility indicators, and bias adjustment',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time',
          timing: 'Post performance axis',
          benchmark: 'Potential = Future capability and growth capacity'
        }
      },
      {
        id: 'sec-3-7',
        sectionNumber: '3.7',
        title: 'Nine-Box Assessment Workflow',
        description: 'Configure nine_box_assessments: assessment lifecycle, is_current flag behavior, AI-suggested ratings, override workflow, and historical retention',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per assessment cycle',
          timing: 'Post configuration',
          benchmark: 'Current vs historical assessment tracking (SAP SuccessFactors pattern)'
        }
      },
      {
        id: 'sec-3-8',
        sectionNumber: '3.8',
        title: 'Evidence & Audit Trail',
        description: 'Configure nine_box_evidence_sources: evidence capture, confidence scoring, contribution summaries, SOC 2 compliance, and audit requirements',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Automatic per assessment',
          timing: 'Post assessment workflow',
          benchmark: 'Evidence-based ratings with full audit trail (SOC 2 compliance)'
        }
      }
    ]
  },

  // ==========================================================================
  // PART 4: READINESS ASSESSMENT WORKFLOW (~120 min)
  // ==========================================================================
  {
    id: 'part-4',
    sectionNumber: '4',
    title: 'Readiness Assessment Workflow',
    description: 'Execute readiness assessments from initiation through completion, including multi-assessor workflows, score calculation, and candidate updates.',
    contentLevel: 'procedure',
    estimatedReadTime: 120,
    targetRoles: ['Admin', 'HR Partner', 'Manager'],
    subsections: [
      {
        id: 'sec-4-1',
        sectionNumber: '4.1',
        title: 'Readiness Assessment Overview',
        description: 'Lifecycle stages, role responsibilities, strategic value, and cross-module integration architecture',
        contentLevel: 'concept',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'HR Partner', 'Manager'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-operations',
          benchmark: 'Configuration (Ch 2) vs. Operations (Ch 4) separation per SAP SuccessFactors pattern'
        }
      },
      {
        id: 'sec-4-2',
        sectionNumber: '4.2',
        title: 'Assessment Event Creation',
        description: 'Initiate assessments, field reference for readiness_assessment_events, workflow integration',
        contentLevel: 'procedure',
        estimatedReadTime: 20,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per candidate assessment',
          timing: 'Ongoing operations',
          benchmark: 'One active assessment per candidate rule'
        }
      },
      {
        id: 'sec-4-3',
        sectionNumber: '4.3',
        title: 'Form Selection & Assignment',
        description: 'Staff type matching algorithm, auto-detect logic, form selection priority hierarchy',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per assessment initiation',
          timing: 'Event creation',
          benchmark: 'Staff-type-specific forms for role-appropriate depth'
        }
      },
      {
        id: 'sec-4-4',
        sectionNumber: '4.4',
        title: 'Manager Assessment Workflow',
        description: 'Field reference for responses, UI walkthrough, BARS tooltips, save draft vs. submit behavior',
        contentLevel: 'procedure',
        estimatedReadTime: 20,
        targetRoles: ['Manager'],
        industryContext: {
          frequency: 'Per assessment event',
          timing: 'After event creation',
          benchmark: 'Direct manager provides primary readiness input'
        }
      },
      {
        id: 'sec-4-5',
        sectionNumber: '4.5',
        title: 'HR Assessment Workflow',
        description: 'Independent vs. validation modes, HR-specific indicators, variance detection',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR Partner'],
        industryContext: {
          frequency: 'Per assessment event',
          timing: 'After manager submission',
          benchmark: 'HR provides compliance and history perspective'
        }
      },
      {
        id: 'sec-4-6',
        sectionNumber: '4.6',
        title: 'Executive Assessment Workflow',
        description: 'Optional executive layer, when to enable, consolidated view, calibration integration',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Executive'],
        industryContext: {
          frequency: 'Optional, per event',
          timing: 'After HR submission',
          benchmark: 'Reserved for C-suite succession candidates'
        }
      },
      {
        id: 'sec-4-7',
        sectionNumber: '4.7',
        title: 'Score Calculation & Band Assignment',
        description: 'Weighted average algorithm, band lookup, partial assessment handling, multi-assessor aggregation',
        contentLevel: 'reference',
        estimatedReadTime: 20,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Automatic on completion',
          timing: 'After all assessors submit',
          benchmark: 'Normalized scoring with weight redistribution for skipped indicators'
        }
      },
      {
        id: 'sec-4-8',
        sectionNumber: '4.8',
        title: 'Assessment Completion & Candidate Update',
        description: 'Event finalization, candidate profile sync, audit trail, historical retention, notifications',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Automatic on completion',
          timing: 'After score calculation',
          benchmark: 'SOC 2 compliant audit trail with full traceability'
        }
      }
    ]
  },

  // ==========================================================================
  // PART 5: TALENT POOL MANAGEMENT (~110 min)
  // ==========================================================================
  {
    id: 'part-5',
    sectionNumber: '5',
    title: 'Talent Pool Management',
    description: 'Create, configure, and manage talent pools including nomination workflows, HR review processes, evidence-based decision support, notifications, reminders, and HR Hub integration.',
    contentLevel: 'procedure',
    estimatedReadTime: 110,
    targetRoles: ['Admin', 'HR Partner', 'Manager'],
    subsections: [
      {
        id: 'sec-5-1',
        sectionNumber: '5.1',
        title: 'Talent Pool Overview',
        description: 'Strategic value, pool lifecycle, and cross-module integration architecture',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner', 'Manager'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-configuration',
          benchmark: 'SHRM talent segmentation best practices'
        }
      },
      {
        id: 'sec-5-2',
        sectionNumber: '5.2',
        title: 'Pool Types & Classification',
        description: 'Five pool types (High Potential, Leadership, Technical, Emerging, Critical Role) with selection criteria and color coding',
        contentLevel: 'concept',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-configuration',
          benchmark: 'Strategic talent segmentation for focused development'
        }
      },
      {
        id: 'sec-5-3',
        sectionNumber: '5.3',
        title: 'Pool Creation & Configuration',
        description: 'Create pools with JSONB eligibility criteria, field reference, and step-by-step procedures',
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
        id: 'sec-5-4',
        sectionNumber: '5.4',
        title: 'Member Management',
        description: 'Add, review, approve, graduate, and remove talent pool members with 6-stage status lifecycle (nominated → approved/rejected → active → graduated/removed). Includes DB-enforced status constraint.',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Quarterly review',
          timing: 'Ongoing operations',
          benchmark: 'Active pool management with formal status transitions'
        }
      },
      {
        id: 'sec-5-5',
        sectionNumber: '5.5',
        title: 'Manager Nomination Workflow',
        description: 'MSS-driven talent nomination with justification requirements, development recommendations (persisted to development_notes field), and notification triggers',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Manager'],
        industryContext: {
          frequency: 'Per nomination',
          timing: 'Ongoing operations',
          benchmark: 'Manager-initiated talent identification with development planning'
        }
      },
      {
        id: 'sec-5-6',
        sectionNumber: '5.6',
        title: 'HR Review & Approval',
        description: 'Review packets, confidence indicators, bias risk assessment, and approval procedures',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per nomination',
          timing: 'Post manager nomination',
          benchmark: 'Evidence-based review with SLA compliance'
        }
      },
      {
        id: 'sec-5-7',
        sectionNumber: '5.7',
        title: 'Evidence-Based Decision Support',
        description: 'Talent signals, evidence snapshots, signal summary calculations, and leadership indicators. Integrates with talent_profile_evidence (13 fields), talent_signal_snapshots (18 fields), and talent_signal_definitions (15 fields) tables.',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Reference',
          timing: 'During review',
          benchmark: 'McKinsey evidence-based talent decisions'
        }
      },
      {
        id: 'sec-5-8',
        sectionNumber: '5.8',
        title: 'Pool Analytics & Reporting',
        description: 'Pool health metrics, pipeline analytics, and review cycle recommendations',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner', 'Executive'],
        industryContext: {
          frequency: 'Monthly/Quarterly',
          timing: 'Review cycles',
          benchmark: 'Gartner talent pipeline management metrics'
        }
      },
      {
        id: 'sec-5-9',
        sectionNumber: '5.9',
        title: 'Notifications & Reminders',
        description: 'Configure succession-specific reminder event types (SUCCESSION_UPDATED, talent_review_reminder, successor_assessment_due, development_plan_action) with reminder rules and automated triggers.',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time setup',
          timing: 'Post pool configuration',
          benchmark: 'Proactive notifications reduce missed review cycles by 40%'
        }
      },
      {
        id: 'sec-5-10',
        sectionNumber: '5.10',
        title: 'HR Hub Integration',
        description: 'Navigate succession from HR Hub Integration Dashboard, configure transaction workflow settings (company_transaction_workflow_settings), and view pending approvals.',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Post workflow setup',
          benchmark: 'Centralized HR Hub reduces context switching by 50%'
        }
      }
    ]
  },

  // ==========================================================================
  // PART 6: SUCCESSION PLANNING WORKFLOW (~120 min)
  // ==========================================================================
  {
    id: 'part-6',
    sectionNumber: '6',
    title: 'Succession Planning Workflow',
    description: 'End-to-end succession planning from key position identification to development plan execution, including candidate management, evidence collection, and workflow approvals.',
    contentLevel: 'procedure',
    estimatedReadTime: 120,
    targetRoles: ['Admin', 'HR Partner', 'Manager'],
    subsections: [
      {
        id: 'sec-6-1',
        sectionNumber: '6.1',
        title: 'Succession Planning Overview',
        description: '8-stage lifecycle (Identify → Plan → Nominate → Assess → Develop → Evidence → Review → Promote), persona responsibilities, and cross-module integration architecture.',
        contentLevel: 'concept',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner', 'Manager'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-operations',
          benchmark: 'Workday/SAP SuccessFactors succession lifecycle patterns'
        }
      },
      {
        id: 'sec-6-2',
        sectionNumber: '6.2',
        title: 'Key Position Identification',
        description: 'Mark positions as key/critical using jobs.is_key_position flag with business impact assessment and navigation via KeyPositionsTab.',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Annual review',
          timing: 'Start of planning cycle',
          benchmark: 'Typically 10-15% of positions are key/critical'
        }
      },
      {
        id: 'sec-6-3',
        sectionNumber: '6.3',
        title: 'Position Risk Assessment',
        description: 'Field reference for key_position_risks table (16 fields): criticality_level, vacancy_risk, retirement_risk, flight_risk, impact_if_vacant, and mitigation planning.',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Quarterly review',
          timing: 'Post key position identification',
          benchmark: 'Risk-weighted succession prioritization'
        }
      },
      {
        id: 'sec-6-4',
        sectionNumber: '6.4',
        title: 'Succession Plan Creation',
        description: 'Field reference for succession_plans table (23 fields): plan_name, risk_level, priority, position_criticality, replacement_difficulty, and calculated risk scoring.',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per key position',
          timing: 'Post risk assessment',
          benchmark: '2-3 ready successors per key position'
        }
      },
      {
        id: 'sec-6-5',
        sectionNumber: '6.5',
        title: 'Candidate Nomination & Ranking',
        description: 'Field reference for succession_candidates table (20 fields): readiness_level, ranking, strengths, development_areas, values promotion check, and leadership signals.',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'HR Partner', 'Manager'],
        industryContext: {
          frequency: 'Per plan',
          timing: 'Post plan creation',
          benchmark: 'Manager + HR collaboration for balanced nominations'
        }
      },
      {
        id: 'sec-6-6',
        sectionNumber: '6.6',
        title: 'Readiness Assessment Integration',
        description: 'Cross-reference to Chapter 4 workflow, automatic sync of latest_readiness_score and latest_readiness_band to succession_candidates, and SUCCESSION_READINESS_APPROVAL workflow trigger.',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per candidate',
          timing: 'Post nomination',
          benchmark: 'Multi-assessor validation for objective readiness placement'
        }
      },
      {
        id: 'sec-6-7',
        sectionNumber: '6.7',
        title: 'Development Plan Management',
        description: 'Field reference for succession_development_plans table (13 fields): development_type (training/project/mentoring/assignment/other), progress tracking, and status lifecycle.',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per candidate',
          timing: 'Post readiness assessment',
          benchmark: 'Development-driven readiness acceleration reduces time-to-ready by 25%'
        }
      },
      {
        id: 'sec-6-8',
        sectionNumber: '6.8',
        title: 'Gap-to-Development Linking',
        description: 'Field reference for succession_gap_development_links table (12 fields): link gaps to IDP items (linked_idp_item_id) and LMS courses (linked_learning_id) with severity tracking.',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per identified gap',
          timing: 'Post development plan creation',
          benchmark: 'Cross-module integration following SAP SuccessFactors patterns'
        }
      },
      {
        id: 'sec-6-9',
        sectionNumber: '6.9',
        title: 'Candidate Evidence Collection',
        description: 'Field reference for succession_candidate_evidence table (10 fields): evidence_type (nine_box/signal_snapshot/manual), signal_summary JSONB, leadership_indicators JSONB, and readiness_contribution.',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Ongoing',
          timing: 'Throughout planning cycle',
          benchmark: 'SOC 2 compliant evidence trail for succession decisions'
        }
      },
      {
        id: 'sec-6-10',
        sectionNumber: '6.10',
        title: 'Workflow & Approval Configuration',
        description: 'Configure SUCCESSION_READINESS_APPROVAL workflow template, transaction types (PERF_SUCCESSION_APPROVAL, SUCC_READINESS_APPROVAL), and company_transaction_workflow_settings.',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time setup',
          timing: 'Post initial configuration',
          benchmark: 'Multi-level approval workflows following enterprise HR patterns'
        }
      }
    ]
  },

  // ==========================================================================
  // PART 7: RISK MANAGEMENT (~75 min)
  // ==========================================================================
  {
    id: 'part-7',
    sectionNumber: '7',
    title: 'Risk Management',
    description: 'Operational risk workflows, retention strategies, governance, AI-assisted prediction, and cross-module integration.',
    contentLevel: 'procedure',
    estimatedReadTime: 75,
    targetRoles: ['Admin', 'HR Partner', 'Manager'],
    subsections: [
      {
        id: 'sec-7-1',
        sectionNumber: '7.1',
        title: 'Risk Management Overview',
        description: 'Framework introduction, chapter scope, cross-module dependencies, and KPIs',
        contentLevel: 'overview',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-operations',
          benchmark: 'Configuration (Ch 6) vs. Operations (Ch 7) separation per SAP SuccessFactors pattern'
        }
      },
      {
        id: 'sec-7-2',
        sectionNumber: '7.2',
        title: 'Risk Terminology & Standards',
        description: 'Industry definitions (Risk of Loss, Impact of Loss, Retention Risk), four-level classification, standard risk factors',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-operations',
          benchmark: 'Oracle HCM dual-axis model, SAP SuccessFactors retention matrix'
        }
      },
      {
        id: 'sec-7-3',
        sectionNumber: '7.3',
        title: 'Employee Flight Risk Assessment Workflow',
        description: 'Operational workflow for FlightRiskTab.tsx: detect, assess, document, action, and is_current lifecycle',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Continuous',
          timing: 'Ongoing operations',
          benchmark: 'One active assessment per employee with historical retention'
        }
      },
      {
        id: 'sec-7-4',
        sectionNumber: '7.4',
        title: 'Retention Strategy & Action Planning',
        description: 'Intervention categories (compensation, career, wellbeing), escalation matrix, action documentation',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner', 'Manager'],
        industryContext: {
          frequency: 'Per case',
          timing: 'Post assessment',
          benchmark: 'High/Critical require retention action within 48 hours'
        }
      },
      {
        id: 'sec-7-5',
        sectionNumber: '7.5',
        title: 'Position Vacancy Risk Monitoring',
        description: 'Vacancy triggers (retirement, flight, market demand), KeyPositionsTab integration, early warning system',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Monthly/Quarterly',
          timing: 'Ongoing',
          benchmark: 'Anticipate vacancies 12-24 months ahead'
        }
      },
      {
        id: 'sec-7-6',
        sectionNumber: '7.6',
        title: 'Risk Review Cadence & Governance',
        description: 'Review cycles by risk level, stakeholder roles, SLA compliance tracking, meeting templates',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per risk level',
          timing: 'Scheduled',
          benchmark: 'SHRM quarterly minimum, Critical bi-weekly'
        }
      },
      {
        id: 'sec-7-7',
        sectionNumber: '7.7',
        title: 'Risk Mitigation Playbooks',
        description: 'Standard response templates by risk level, escalation matrix, success metrics',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner', 'Manager'],
        industryContext: {
          frequency: 'Per case',
          timing: 'Response phase',
          benchmark: 'Retention success rate ≥75% for Critical/High'
        }
      },
      {
        id: 'sec-7-8',
        sectionNumber: '7.8',
        title: 'AI-Assisted Risk Prediction',
        description: 'Talent signal integration, confidence scoring, human override capability, model monitoring',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Continuous',
          timing: 'Ongoing',
          benchmark: 'ISO 42001 human-in-the-loop compliance'
        }
      },
      {
        id: 'sec-7-9',
        sectionNumber: '7.9',
        title: 'Cross-Module Risk Integration',
        description: 'Data flow with Compensation, Performance, Learning, Succession; event-driven notifications',
        contentLevel: 'concept',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Integration setup',
          benchmark: 'Unified talent intelligence layer'
        }
      },
      {
        id: 'sec-7-10',
        sectionNumber: '7.10',
        title: 'Risk Management Troubleshooting',
        description: 'Common issues (is_current conflicts, data quality), FAQs, data quality checklist',
        contentLevel: 'reference',
        estimatedReadTime: 7,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Support',
          benchmark: 'Audit-ready data quality'
        }
      }
    ]
  },

  // ==========================================================================
  // PART 8: SUCCESSION-CAREER INTEGRATION (~35 min)
  // ==========================================================================
  {
    id: 'part-8',
    sectionNumber: '8',
    title: 'Succession-Career Integration',
    description: 'Integration between Succession Planning and Career Development modules, including development plans, gap linking, and succession-specific mentorship.',
    contentLevel: 'procedure',
    estimatedReadTime: 35,
    targetRoles: ['Admin', 'HR Partner'],
    subsections: [
      {
        id: 'sec-8-1',
        sectionNumber: '8.1',
        title: 'Integration Overview',
        description: 'Cross-reference to Career Development Manual, succession-specific use cases, and data flow architecture between modules.',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-implementation',
          benchmark: 'Workday Career Hub integration pattern - separate modules with clear touchpoints'
        }
      },
      {
        id: 'sec-8-2',
        sectionNumber: '8.2',
        title: 'Succession Development Plans',
        description: 'Field reference for succession_development_plans table (13 fields): link candidates to development plans, track progress inline.',
        contentLevel: 'reference',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per candidate',
          timing: 'Post candidate nomination',
          benchmark: 'Candidate-specific development tracking within succession context'
        }
      },
      {
        id: 'sec-8-3',
        sectionNumber: '8.3',
        title: 'Gap-to-Development Linking',
        description: 'Field reference for succession_gap_development_links table (12 fields): link skill gaps to IDP goals via cross-module workflow.',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per gap identified',
          timing: 'Post readiness assessment',
          benchmark: 'Succession → IDP → L&D workflow for gap closure'
        }
      },
      {
        id: 'sec-8-4',
        sectionNumber: '8.4',
        title: 'Mentorship for Succession Candidates',
        description: 'Filter mentorship programs by type="succession", pair candidates with executive mentors. Cross-reference to Career Dev Manual Ch 3.',
        contentLevel: 'procedure',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per candidate',
          timing: 'Post development plan creation',
          benchmark: 'Executive mentorship accelerates succession readiness by 30%'
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
    description: 'Comprehensive cross-module integration: Performance, 360 Feedback, Talent Signals, Learning, Workforce, Compensation, and HR Hub workflows.',
    contentLevel: 'procedure',
    estimatedReadTime: 135,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      {
        id: 'sec-9-1',
        sectionNumber: '9.1',
        title: 'Integration Architecture Overview',
        description: 'Event-driven topology, inbound/outbound data flows, consent gates, and integration timing patterns',
        contentLevel: 'concept',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: { frequency: 'Reference', timing: 'Pre-integration', benchmark: 'Event-driven integration architecture (SAP/Workday pattern)' }
      },
      {
        id: 'sec-9-2',
        sectionNumber: '9.2',
        title: 'Integration Rules Engine',
        description: 'appraisal_integration_rules table (28 fields), trigger events, conditions, target modules, and execution order',
        contentLevel: 'reference',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: { frequency: 'One-time setup', timing: 'Post foundation', benchmark: 'Configurable rules engine for cross-module automation' }
      },
      {
        id: 'sec-9-3',
        sectionNumber: '9.3',
        title: 'Performance Appraisal Integration',
        description: 'Appraisal score contribution to Nine-Box Performance axis, category-to-readiness mapping, orchestrator function',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin'],
        industryContext: { frequency: 'Per appraisal cycle', timing: 'Post-appraisal', benchmark: 'Automated Nine-Box placement from performance data' }
      },
      {
        id: 'sec-9-4',
        sectionNumber: '9.4',
        title: '360 Feedback Integration',
        description: '360 signals feeding Potential axis, signal categories, confidence scoring, bias adjustment, development themes',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin'],
        industryContext: { frequency: 'Per 360 cycle', timing: 'Post-360 results', benchmark: 'Multi-rater feedback for leadership potential indicators' }
      },
      {
        id: 'sec-9-5',
        sectionNumber: '9.5',
        title: 'Talent Signal Processing',
        description: 'talent_signal_definitions (15 fields), talent_signal_snapshots (22 fields), nine_box_signal_mappings (9 fields), axis contribution logic',
        contentLevel: 'reference',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: { frequency: 'Reference', timing: 'Post rules setup', benchmark: 'Signal-to-axis mapping with bias detection' }
      },
      {
        id: 'sec-9-6',
        sectionNumber: '9.6',
        title: 'Nine-Box Automatic Updates',
        description: 'Automatic Nine-Box placement, is_current lifecycle, AI-suggested ratings, evidence source capture',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: { frequency: 'Per trigger event', timing: 'Ongoing', benchmark: 'Evidence-based ratings with full audit trail' }
      },
      {
        id: 'sec-9-7',
        sectionNumber: '9.7',
        title: 'Learning & Development Integration',
        description: 'Gap-to-training course mapping, auto-enrollment rules, development activity tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: { frequency: 'Per candidate', timing: 'Post readiness assessment', benchmark: 'AI-driven learning recommendations for gap closure' }
      },
      {
        id: 'sec-9-8',
        sectionNumber: '9.8',
        title: 'Workforce & Position Integration',
        description: 'jobs.is_key_position sync, position criticality, org structure changes, position lifecycle events',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin'],
        industryContext: { frequency: 'Real-time sync', timing: 'Ongoing', benchmark: 'Position lifecycle events trigger succession updates' }
      },
      {
        id: 'sec-9-9',
        sectionNumber: '9.9',
        title: 'Compensation Integration',
        description: 'Retention bonus triggers, compa-ratio monitoring, compensation review flags, cycle alignment',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: { frequency: 'Per cycle', timing: 'Compensation planning', benchmark: 'Compensation as retention lever for high-value talent' }
      },
      {
        id: 'sec-9-10',
        sectionNumber: '9.10',
        title: 'HR Hub Workflow Integration',
        description: 'Succession transaction types, workflow templates, pending approvals queue, bulk approval procedures',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: { frequency: 'Ongoing', timing: 'Post workflow setup', benchmark: 'Multi-level approval workflows following enterprise HR patterns' }
      },
      {
        id: 'sec-9-11',
        sectionNumber: '9.11',
        title: 'Integration Execution & Audit',
        description: 'appraisal_integration_log (21 fields), execution states, error handling, SOC 2 compliance',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: { frequency: 'Reference', timing: 'Ongoing monitoring', benchmark: 'Complete audit trail for SOC 2 compliance' }
      },
      {
        id: 'sec-9-12',
        sectionNumber: '9.12',
        title: 'Troubleshooting Integrations',
        description: 'Common failures, diagnostic checklist, circular dependency prevention, escalation procedures',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: { frequency: 'As needed', timing: 'Issue resolution', benchmark: 'Self-service troubleshooting before escalation' }
      }
    ]
  },

  // ==========================================================================
  // PART 10: REPORTING & ANALYTICS (~45 min)
  // Industry-aligned analytics following SAP SuccessFactors, Workday, Oracle HCM patterns
  // ==========================================================================
  {
    id: 'part-10',
    sectionNumber: '10',
    title: 'Reporting & Analytics',
    description: 'Industry-aligned succession analytics including coverage metrics, flight risk, Nine-Box distribution, pipeline velocity, and AI-powered insights.',
    contentLevel: 'reference',
    estimatedReadTime: 45,
    targetRoles: ['Admin', 'HR Partner', 'Executive'],
    subsections: [
      {
        id: 'sec-10-1',
        sectionNumber: '10.1',
        title: 'Analytics Architecture Overview',
        description: 'Data flow, integration points, refresh cycles, permission matrix',
        contentLevel: 'reference',
        estimatedReadTime: 4,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: { frequency: 'Reference', timing: 'Initial setup', benchmark: 'Workday Analytics Hub pattern' }
      },
      {
        id: 'sec-10-2',
        sectionNumber: '10.2',
        title: 'Succession Health Scorecard',
        description: 'Coverage ratio, ready-now rate, bench strength ratio, Pipeline Health Index',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'HR Partner', 'Executive'],
        industryContext: { frequency: 'Monthly', timing: 'Dashboard review', benchmark: 'SAP SuccessFactors KPI definitions' }
      },
      {
        id: 'sec-10-3',
        sectionNumber: '10.3',
        title: 'Bench Strength Analysis',
        description: 'Coverage score algorithm, readiness weighting, position coverage thresholds',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: { frequency: 'Per position', timing: 'Ongoing', benchmark: 'SHRM bench strength ratio of 2-3 per critical position' }
      },
      {
        id: 'sec-10-4',
        sectionNumber: '10.4',
        title: 'Flight Risk & Retention Reporting',
        description: 'Risk of Loss, Impact of Loss, Retention Risk Matrix, risk factors',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: { frequency: 'Per assessment', timing: 'Ongoing', benchmark: 'Oracle HCM dual-axis Risk/Impact model' }
      },
      {
        id: 'sec-10-5',
        sectionNumber: '10.5',
        title: 'Nine-Box Distribution & Movement',
        description: 'McKinsey grid labels, distribution benchmarks, movement analysis, calibration variance',
        contentLevel: 'reference',
        estimatedReadTime: 4,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: { frequency: 'Per cycle', timing: 'Post-calibration', benchmark: 'SAP/Workday 10-15% top-right distribution target' }
      },
      {
        id: 'sec-10-6',
        sectionNumber: '10.6',
        title: 'Talent Pipeline Metrics',
        description: 'Pool-to-succession conversion, graduation rate, stagnation rate, pipeline velocity',
        contentLevel: 'reference',
        estimatedReadTime: 4,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: { frequency: 'Monthly', timing: 'Pipeline review', benchmark: 'Workday Pipeline Velocity <24 months' }
      },
      {
        id: 'sec-10-7',
        sectionNumber: '10.7',
        title: 'Readiness Trend Analysis',
        description: 'Time-to-readiness, score progression, development impact correlation, AI trajectory forecasting',
        contentLevel: 'reference',
        estimatedReadTime: 4,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: { frequency: 'Per cycle', timing: 'Assessment review', benchmark: 'Visier Time-to-Readiness benchmarks' }
      },
      {
        id: 'sec-10-8',
        sectionNumber: '10.8',
        title: 'Diversity & Inclusion Analytics',
        description: 'Pipeline representation, demographic distribution, pool-to-promotion equity, ESG alignment',
        contentLevel: 'reference',
        estimatedReadTime: 4,
        targetRoles: ['Admin', 'HR Partner', 'Executive'],
        industryContext: { frequency: 'Quarterly/Annual', timing: 'ESG reporting', benchmark: 'SHRM DEI pipeline metrics' }
      },
      {
        id: 'sec-10-9',
        sectionNumber: '10.9',
        title: 'Executive Summary Reports',
        description: 'Monthly scorecard, quarterly review, board-level summary, emergency vacancy protocol',
        contentLevel: 'reference',
        estimatedReadTime: 4,
        targetRoles: ['Admin', 'Executive'],
        industryContext: { frequency: 'Per schedule', timing: 'Reporting cycles', benchmark: 'Oracle/Workday executive reporting patterns' }
      },
      {
        id: 'sec-10-10',
        sectionNumber: '10.10',
        title: 'AI-Powered Insights',
        description: 'AI Report Builder, predictive analytics, natural language queries, governance',
        contentLevel: 'reference',
        estimatedReadTime: 4,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: { frequency: 'On-demand', timing: 'Analysis', benchmark: 'Visier predictive analytics patterns' }
      },
      {
        id: 'sec-10-11',
        sectionNumber: '10.11',
        title: 'Report Configuration & Scheduling',
        description: 'Custom reports, automated delivery, access control, versioning and audit',
        contentLevel: 'reference',
        estimatedReadTime: 3,
        targetRoles: ['Admin'],
        industryContext: { frequency: 'Setup', timing: 'Initial configuration', benchmark: 'SOC 2 compliant audit trails' }
      },
      {
        id: 'sec-10-12',
        sectionNumber: '10.12',
        title: 'Analytics Troubleshooting',
        description: 'Data quality issues, calculation discrepancies, cache timing, escalation',
        contentLevel: 'reference',
        estimatedReadTime: 3,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: { frequency: 'As needed', timing: 'Issue resolution', benchmark: 'Self-service diagnostic checklist' }
      }
    ]
  },

  // ==========================================================================
  // PART 11: TROUBLESHOOTING & FAQS (~60 min)
  // ==========================================================================
  {
    id: 'part-11',
    sectionNumber: '11',
    title: 'Troubleshooting & FAQs',
    description: 'Comprehensive diagnostic procedures, issue resolution guides, and escalation paths for succession planning.',
    contentLevel: 'reference',
    estimatedReadTime: 60,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      { id: 'sec-11-1', sectionNumber: '11.1', title: 'Troubleshooting Overview', description: 'Diagnostic methodology, chapter scope, quick reference matrix, escalation decision tree', contentLevel: 'overview', estimatedReadTime: 10, targetRoles: ['Admin', 'Consultant'], industryContext: { frequency: 'Reference', timing: 'Initial orientation', benchmark: '4-phase diagnostic methodology (Identify → Diagnose → Resolve → Prevent)' } },
      { id: 'sec-11-2', sectionNumber: '11.2', title: 'Configuration Issues', description: 'Assessor types, readiness bands, rating sources, forms, signal mappings, and company settings', contentLevel: 'reference', estimatedReadTime: 15, targetRoles: ['Admin'], industryContext: { frequency: 'As needed', timing: 'Implementation and support', benchmark: '12 documented issues with step-by-step resolution' } },
      { id: 'sec-11-3', sectionNumber: '11.3', title: 'Nine-Box & Talent Assessment Issues', description: 'Calculation errors, placement issues, signal mapping problems, evidence capture', contentLevel: 'reference', estimatedReadTime: 15, targetRoles: ['Admin'], industryContext: { frequency: 'As needed', timing: 'Post-configuration', benchmark: '10 documented issues with diagnostic checklist' } },
      { id: 'sec-11-4', sectionNumber: '11.4', title: 'Readiness Assessment Issues', description: 'Form errors, scoring problems, multi-assessor conflicts, workflow triggers', contentLevel: 'reference', estimatedReadTime: 12, targetRoles: ['Admin', 'HR Partner'], industryContext: { frequency: 'As needed', timing: 'Assessment execution', benchmark: '10 documented issues with score calculation reference' } },
      { id: 'sec-11-5', sectionNumber: '11.5', title: 'Talent Pool & Succession Plan Issues', description: 'Pool membership, candidate ranking, development linking, bench strength', contentLevel: 'reference', estimatedReadTime: 15, targetRoles: ['Admin', 'HR Partner'], industryContext: { frequency: 'As needed', timing: 'Ongoing operations', benchmark: '11 documented issues with status lifecycle reference' } },
      { id: 'sec-11-6', sectionNumber: '11.6', title: 'Workflow & Approval Issues', description: 'Pending approvals, workflow configuration, transaction types, SLA escalation', contentLevel: 'reference', estimatedReadTime: 10, targetRoles: ['Admin', 'HR Partner'], industryContext: { frequency: 'As needed', timing: 'Workflow troubleshooting', benchmark: '8 documented issues with transaction type reference' } },
      { id: 'sec-11-7', sectionNumber: '11.7', title: 'Data Quality & Migration Issues', description: 'Import errors, duplicate detection, data validation, reference integrity', contentLevel: 'reference', estimatedReadTime: 12, targetRoles: ['Admin', 'Consultant'], industryContext: { frequency: 'As needed', timing: 'Data operations', benchmark: '10 documented issues with data quality checklist' } },
      { id: 'sec-11-8', sectionNumber: '11.8', title: 'Security & Permission Issues', description: 'RLS policies, role access, company scope, manager hierarchy, audit trails', contentLevel: 'reference', estimatedReadTime: 10, targetRoles: ['Admin', 'Consultant'], industryContext: { frequency: 'As needed', timing: 'Security troubleshooting', benchmark: '8 documented issues with access matrix reference' } },
      { id: 'sec-11-9', sectionNumber: '11.9', title: 'AI & Automation Issues', description: 'AI suggestions, signal processing, bias detection, automation rules, ISO 42001 compliance', contentLevel: 'reference', estimatedReadTime: 12, targetRoles: ['Admin', 'Consultant'], industryContext: { frequency: 'As needed', timing: 'AI troubleshooting', benchmark: '10 documented issues with AI data requirements reference' } },
      { id: 'sec-11-10', sectionNumber: '11.10', title: 'Escalation Procedures & Support Resources', description: '4-tier support model, severity definitions, communication templates, FAQ', contentLevel: 'reference', estimatedReadTime: 15, targetRoles: ['Admin', 'HR Partner'], industryContext: { frequency: 'Reference', timing: 'Support operations', benchmark: '4-tier support model aligned with ITIL, 20+ FAQs' } }
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

  // Risk Terms (Oracle HCM / SAP SuccessFactors aligned terminology)
  { term: 'Risk of Loss', definition: 'Probability that an employee will voluntarily leave the organization. Industry-standard term (Oracle HCM, SAP SF) for what is commonly called "flight risk". Stored in flight_risk_assessments.risk_level.', category: 'Risk' },
  { term: 'Impact of Loss', definition: 'Business consequence if an employee departs. Assessed at position level based on role criticality and replacement difficulty. Derived from succession_plans.position_criticality.', category: 'Risk' },
  { term: 'Flight Risk', definition: 'Common term for Risk of Loss - probability an employee will voluntarily leave. Use "Risk of Loss" in formal documentation.', category: 'Risk' },
  { term: 'Retention Risk', definition: 'Combined assessment of Risk of Loss × Impact of Loss. Used to prioritize retention interventions via the RetentionRiskMatrix.', category: 'Risk' },
  { term: 'Vacancy Risk', definition: 'Position-level probability and timing of becoming vacant due to retirement, flight risk, or other factors. Stored in key_position_risks.vacancy_risk.', category: 'Risk' },
  { term: 'Impact Score', definition: 'Rating of business disruption if a specific employee or position is lost. See "Impact of Loss".', category: 'Risk' },
  { term: 'Attrition Risk', definition: 'Alternative industry term for Risk of Loss, commonly used in Visier and workforce analytics contexts.', category: 'Risk' },
  { term: 'Retention Action', definition: 'Intervention designed to reduce Risk of Loss such as compensation adjustment, development opportunity, or recognition.', category: 'Risk' },
  { term: 'Risk Matrix', definition: 'Grid plotting Impact of Loss vs replacement difficulty to calculate overall Retention Risk level.', category: 'Risk' },
  { term: 'Early Warning', definition: 'Predictive signals indicating increased Risk of Loss before voluntary departure. AI-detected via talent_signal_snapshots.', category: 'Risk' },
  { term: 'Loss Impact', definition: 'Synonym for Impact of Loss. The organizational consequence of losing an employee.', category: 'Risk' },

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
