import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch } from 'lucide-react';

const DIAGRAMS = [
  {
    title: 'Succession Planning Data Architecture',
    content: `
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SUCCESSION PLANNING DATA MODEL                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────┐ │
│  │   NINE-BOX DOMAIN   │    │   TALENT POOLS      │    │ SUCCESSION PLANS│ │
│  ├─────────────────────┤    ├─────────────────────┤    ├─────────────────┤ │
│  │ nine_box_assessments│    │ talent_pools        │    │ succession_plans│ │
│  │ nine_box_rating_    │    │ talent_pool_members │    │ succession_     │ │
│  │   sources           │    │ talent_pool_review_ │    │   candidates    │ │
│  │ nine_box_signal_    │    │   packets           │    │ succession_     │ │
│  │   mappings          │    │                     │    │   candidate_    │ │
│  │ nine_box_indicator_ │    │                     │    │   evidence      │ │
│  │   configs           │    │                     │    │                 │ │
│  └─────────────────────┘    └─────────────────────┘    └─────────────────┘ │
│            │                         │                         │           │
│            ▼                         ▼                         ▼           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     READINESS ASSESSMENT DOMAIN                      │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ readiness_assessment_events │ readiness_assessment_forms            │   │
│  │ readiness_assessment_responses │ readiness_assessment_indicators    │   │
│  │ readiness_rating_bands │ succession_assessor_types                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│            ┌───────────────────────┼───────────────────────┐               │
│            ▼                       ▼                       ▼               │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐   │
│  │   RISK MANAGEMENT   │ │   CAREER & MENTOR   │ │   CONFIGURATION     │   │
│  ├─────────────────────┤ ├─────────────────────┤ ├─────────────────────┤   │
│  │ flight_risk_        │ │ career_paths        │ │ succession_assessor_│   │
│  │   assessments       │ │ career_path_steps   │ │   types             │   │
│  │ key_position_risks  │ │ mentorship_programs │ │ succession_         │   │
│  │                     │ │ mentorship_pairings │ │   availability_     │   │
│  │                     │ │ mentorship_sessions │ │   reasons           │   │
│  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
`
  },
  {
    title: 'Nine-Box Calculation Flow',
    content: `
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NINE-BOX CALCULATION FLOW                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  DATA SOURCES                    SIGNAL PROCESSING              PLACEMENT  │
│  ───────────                     ─────────────────              ─────────  │
│                                                                             │
│  ┌─────────────────┐                                                        │
│  │ Appraisal Scores├─────┐                                                  │
│  └─────────────────┘     │                                                  │
│                          │      ┌─────────────────────┐                     │
│  ┌─────────────────┐     ├─────▶│  PERFORMANCE AXIS   │                     │
│  │ Goal Achievement├─────┤      │  (Weighted Average) │──────┐              │
│  └─────────────────┘     │      └─────────────────────┘      │              │
│                          │                                    │              │
│  ┌─────────────────┐     │                                    ▼              │
│  │ KPI Scores      ├─────┘                            ┌─────────────────┐   │
│  └─────────────────┘                                  │                 │   │
│                                                       │   NINE-BOX      │   │
│  ┌─────────────────┐                                  │   PLACEMENT     │   │
│  │ Learning Agility├─────┐                            │                 │   │
│  └─────────────────┘     │                            │  ┌───┬───┬───┐  │   │
│                          │      ┌─────────────────────┐ │   │   │ ★ │  │   │
│  ┌─────────────────┐     ├─────▶│   POTENTIAL AXIS    │─│───┼───┼───┤  │   │
│  │ Leadership Score├─────┤      │  (Weighted Average) │ │   │ ● │   │  │   │
│  └─────────────────┘     │      └─────────────────────┘ │───┼───┼───┤  │   │
│                          │                              │   │   │   │  │   │
│  ┌─────────────────┐     │                              └───┴───┴───┘  │   │
│  │ 360 Feedback    ├─────┘                                             │   │
│  └─────────────────┘                              └─────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
`
  },
  {
    title: 'Succession Planning Workflow',
    content: `
┌─────────────────────────────────────────────────────────────────────────────┐
│                      SUCCESSION PLANNING LIFECYCLE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1              PHASE 2              PHASE 3              PHASE 4    │
│  IDENTIFY             ASSESS               DEVELOP              MONITOR    │
│  ────────             ──────               ───────              ───────    │
│                                                                             │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌────────┐ │
│  │ Identify    │      │ Nominate    │      │ Create      │      │ Track  │ │
│  │ Key         │─────▶│ Successor   │─────▶│ Development │─────▶│ Readine│ │
│  │ Positions   │      │ Candidates  │      │ Plans       │      │ Progress│ │
│  └─────────────┘      └─────────────┘      └─────────────┘      └────────┘ │
│        │                    │                    │                    │    │
│        ▼                    ▼                    ▼                    ▼    │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌────────┐ │
│  │ Assess      │      │ Conduct     │      │ Link to     │      │ Update │ │
│  │ Vacancy     │      │ Readiness   │      │ Learning &  │      │ Nine-  │ │
│  │ Risk        │      │ Assessments │      │ IDP Goals   │      │ Box    │ │
│  └─────────────┘      └─────────────┘      └─────────────┘      └────────┘ │
│        │                    │                    │                    │    │
│        ▼                    ▼                    ▼                    ▼    │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌────────┐ │
│  │ Set         │      │ Rank        │      │ Assign      │      │ Report │ │
│  │ Coverage    │      │ Candidates  │      │ Mentors     │      │ Bench  │ │
│  │ Targets     │      │ by Readines │      │             │      │ Strength│ │
│  └─────────────┘      └─────────────┘      └─────────────┘      └────────┘ │
│                                                                             │
│                           ┌───────────────────┐                            │
│                           │  TALENT REVIEW    │                            │
│                           │  CALIBRATION      │                            │
│                           │  (Annual Cycle)   │                            │
│                           └───────────────────┘                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
`
  },
  {
    title: 'Nine-Box Signal Mapping Flow',
    content: `
┌─────────────────────────────────────────────────────────────────────────────┐
│                     NINE-BOX SIGNAL MAPPING FLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  talent_signal_definitions            nine_box_signal_mappings              │
│  ────────────────────────             ────────────────────────              │
│                                                                             │
│  ┌─────────────────────┐              ┌─────────────────────┐               │
│  │ signal_name         │              │ signal_id           │               │
│  │ signal_type         │─────────────▶│ contributes_to_axis │               │
│  │ category            │              │ weight_percentage   │               │
│  │ source_module       │              │ minimum_confidence  │               │
│  │ data_type           │              │ bias_multiplier     │               │
│  └─────────────────────┘              └─────────────────────┘               │
│                                                  │                          │
│  talent_signal_snapshots                         ▼                          │
│  ───────────────────────           ┌──────────────────────────┐             │
│                                    │   AXIS CALCULATION       │             │
│  ┌─────────────────────┐           │                          │             │
│  │ employee_id         │           │  For each mapped signal: │             │
│  │ signal_id           │──────────▶│  1. Fetch snapshot value │             │
│  │ signal_value        │           │  2. Apply weight_pct     │             │
│  │ confidence_score    │           │  3. Apply bias_multiplier│             │
│  │ captured_at         │           │  4. Sum weighted values  │             │
│  │ source_record_id    │           │  5. Normalize to 0-1     │             │
│  └─────────────────────┘           │  6. Convert to 1-3 rating│             │
│                                    └──────────────────────────┘             │
│                                                  │                          │
│                                                  ▼                          │
│                                    ┌──────────────────────────┐             │
│                                    │  nine_box_assessments    │             │
│                                    │  ──────────────────────  │             │
│                                    │  performance_rating: 1-3 │             │
│                                    │  potential_rating: 1-3   │             │
│                                    │  box_position: 1-9       │             │
│                                    │  is_current: boolean     │             │
│                                    └──────────────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
`
  },
  {
    title: 'Readiness Assessment Lifecycle',
    content: `
┌─────────────────────────────────────────────────────────────────────────────┐
│                    READINESS ASSESSMENT LIFECYCLE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌───────┐ │
│  │  CREATE  │───▶│  ASSIGN  │───▶│ COLLECT  │───▶│CALCULATE │───▶│COMPLETE│ │
│  │  EVENT   │    │ ASSESSORS│    │ RESPONSES│    │  SCORES  │    │ UPDATE │ │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └───────┘ │
│       │               │               │               │              │      │
│       ▼               ▼               ▼               ▼              ▼      │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         TABLE INTERACTIONS                           │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                                                                      │   │
│  │  readiness_         succession_        readiness_         readiness_ │   │
│  │  assessment_        assessor_          assessment_        rating_    │   │
│  │  events             types              responses          bands      │   │
│  │  ─────────          ──────────         ──────────         ──────     │   │
│  │  status:            assessor_code:     indicator_id       band_code  │   │
│  │  - draft            - manager          rating_value       min_score  │   │
│  │  - in_progress      - hr               comments           max_score  │   │
│  │  - completed        - executive        assessed_by        successor_ │   │
│  │  - cancelled        - skip_level       assessed_at        eligible   │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  SCORE CALCULATION FORMULA:                                                 │
│  ─────────────────────────                                                  │
│  Overall Score = Σ (indicator_rating × indicator_weight) / Σ weights       │
│                                                                             │
│  Multi-Assessor Aggregation:                                               │
│  Final Score = Σ (assessor_score × assessor_type_weight)                   │
│                                                                             │
│  Readiness Band Assignment:                                                 │
│  Score 0.85-1.0 → "Ready Now"     │  Score 0.50-0.69 → "3-5 Years"         │
│  Score 0.70-0.84 → "1-2 Years"    │  Score < 0.50 → "Developing"           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
`
  },
  {
    title: 'Risk Management Data Flow',
    content: `
┌─────────────────────────────────────────────────────────────────────────────┐
│                      RISK MANAGEMENT DATA FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INPUT SIGNALS                   RISK ASSESSMENT              OUTPUT       │
│  ─────────────                   ───────────────              ──────       │
│                                                                             │
│  ┌──────────────────┐                                                       │
│  │ Tenure < 2 years │───┐                                                   │
│  │ Recent promotion │   │    ┌────────────────────────┐                     │
│  │ Compa-ratio <80% │───┼───▶│  flight_risk_          │                     │
│  │ Manager change   │   │    │  assessments           │                     │
│  │ Skip-level 1:1   │───┘    │  ──────────────────    │                     │
│  └──────────────────┘        │  risk_level: low/med/  │                     │
│                              │    high/critical       │                     │
│  ┌──────────────────┐        │  risk_factors: JSONB   │                     │
│  │ Position filled  │        │  retention_score       │                     │
│  │ Replacement diff │───────▶│  next_assessment_due   │                     │
│  │ Market scarcity  │        └────────────────────────┘                     │
│  └──────────────────┘                   │                                   │
│                                         ▼                                   │
│                              ┌────────────────────────┐                     │
│                              │  RetentionRiskMatrix   │                     │
│                              │  ────────────────────  │                     │
│                              │     IMPACT OF LOSS     │                     │
│                              │     Low   Med   High   │                     │
│                              │  H ┌─────┬─────┬─────┐ │   ┌──────────────┐  │
│                              │  i │Watch│Alert│Crit │ │   │ RETENTION    │  │
│                              │  g ├─────┼─────┼─────┤ │──▶│ ACTIONS      │  │
│                              │  h │ Low │Watch│Alert│ │   │ ───────────  │  │
│                              │    ├─────┼─────┼─────┤ │   │ Compensation │  │
│                              │  L │ Low │ Low │Watch│ │   │ Development  │  │
│                              │  o └─────┴─────┴─────┘ │   │ Recognition  │  │
│                              │     RISK OF LOSS       │   │ Career path  │  │
│                              └────────────────────────┘   └──────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
`
  },
  {
    title: 'Integration Architecture (Event-Driven)',
    content: `
┌─────────────────────────────────────────────────────────────────────────────┐
│                 CROSS-MODULE INTEGRATION ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SOURCE MODULES                   EVENT BUS                 SUCCESSION     │
│  ──────────────                   ─────────                 ──────────     │
│                                                                             │
│  ┌────────────────┐                                                         │
│  │  PERFORMANCE   │   appraisal_completed                                   │
│  │  ────────────  │─────────────────────────┐                               │
│  │  Appraisals    │   goal_progress_updated │                               │
│  │  Goals         │─────────────────────────┤                               │
│  │  Competencies  │                         │    ┌────────────────────────┐ │
│  └────────────────┘                         │    │  nine_box_assessments  │ │
│                                             ├───▶│  (Performance Axis)    │ │
│  ┌────────────────┐                         │    └────────────────────────┘ │
│  │  360 FEEDBACK  │   360_cycle_completed   │                               │
│  │  ────────────  │─────────────────────────┤    ┌────────────────────────┐ │
│  │  Leadership    │                         ├───▶│  nine_box_assessments  │ │
│  │  Peer ratings  │                         │    │  (Potential Axis)      │ │
│  └────────────────┘                         │    └────────────────────────┘ │
│                                             │                               │
│  ┌────────────────┐                         │    ┌────────────────────────┐ │
│  │  WORKFORCE     │   position_changed      │    │  succession_plans      │ │
│  │  ────────────  │─────────────────────────┼───▶│  (Position sync)       │ │
│  │  Jobs          │   employee_terminated   │    └────────────────────────┘ │
│  │  Positions     │─────────────────────────┤                               │
│  └────────────────┘                         │    ┌────────────────────────┐ │
│                                             │    │  talent_pool_members   │ │
│  ┌────────────────┐                         ├───▶│  (Status updates)      │ │
│  │  LEARNING      │   course_completed      │    └────────────────────────┘ │
│  │  ────────────  │─────────────────────────┤                               │
│  │  Courses       │   certification_earned  │    ┌────────────────────────┐ │
│  │  Certifications│─────────────────────────┼───▶│  succession_development│ │
│  └────────────────┘                         │    │  _plans (Gap closure)  │ │
│                                             │    └────────────────────────┘ │
│  ┌────────────────┐                         │                               │
│  │  COMPENSATION  │   compa_ratio_changed   │    ┌────────────────────────┐ │
│  │  ────────────  │─────────────────────────┴───▶│  flight_risk_          │ │
│  │  Salary data   │                              │  assessments           │ │
│  └────────────────┘                              └────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
`
  },
  {
    title: 'Talent Pool Lifecycle State Machine',
    content: `
┌─────────────────────────────────────────────────────────────────────────────┐
│                   TALENT POOL MEMBER LIFECYCLE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                         ┌──────────────┐                                    │
│                         │              │                                    │
│           ┌────────────▶│   NOMINATED  │◀────────────┐                     │
│           │             │              │             │                      │
│           │             └──────┬───────┘             │                      │
│           │                    │                     │                      │
│           │        ┌───────────┴───────────┐         │                      │
│           │        ▼                       ▼         │                      │
│           │   ┌──────────┐           ┌──────────┐    │                      │
│           │   │          │           │          │    │                      │
│  Re-nom   │   │ APPROVED │           │ REJECTED │    │ Appeal               │
│           │   │          │           │          │────┘                      │
│           │   └────┬─────┘           └──────────┘                           │
│           │        │                                                        │
│           │        ▼                                                        │
│           │   ┌──────────┐                                                  │
│           │   │          │                                                  │
│           │   │  ACTIVE  │◀─────────────────────────────────────┐          │
│           │   │          │                                       │          │
│           │   └────┬─────┘                                       │          │
│           │        │                                             │          │
│           │        ├───────────────────────────────────┐         │          │
│           │        ▼                                   ▼         │          │
│           │   ┌──────────┐                       ┌──────────┐    │          │
│           │   │          │                       │          │    │          │
│           └───│ REMOVED  │                       │GRADUATED │────┘          │
│               │          │                       │          │  (if return)  │
│               └──────────┘                       └──────────┘               │
│                                                                             │
│  STATUS DEFINITIONS:                                                        │
│  ───────────────────                                                        │
│  NOMINATED  - Pending HR review, awaiting approval decision                 │
│  APPROVED   - HR approved for pool entry, transitioning to active          │
│  REJECTED   - HR rejected nomination, can be re-nominated                  │
│  ACTIVE     - Currently in pool, receiving development                     │
│  GRADUATED  - Successfully transitioned to successor role                  │
│  REMOVED    - Exited pool (performance, resignation, reorganization)       │
│                                                                             │
│  DATABASE CONSTRAINT: CHECK (member_status IN                               │
│    ('nominated','approved','rejected','active','graduated','removed'))     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
`
  },
  {
    title: 'Approval Workflow Decision Tree',
    content: `
┌─────────────────────────────────────────────────────────────────────────────┐
│                    APPROVAL WORKFLOW DECISION TREE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                        ┌─────────────────┐                                  │
│                        │  TRANSACTION    │                                  │
│                        │  INITIATED      │                                  │
│                        └────────┬────────┘                                  │
│                                 │                                           │
│                                 ▼                                           │
│                 ┌───────────────────────────────┐                           │
│                 │ Check transaction_type config │                           │
│                 └───────────────┬───────────────┘                           │
│                                 │                                           │
│              ┌──────────────────┼──────────────────┐                        │
│              ▼                  ▼                  ▼                        │
│      ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                 │
│      │ POOL_NOMINATE│   │SUCCESSION_   │   │ READINESS_   │                 │
│      │              │   │ CANDIDATE    │   │ ASSESSMENT   │                 │
│      └──────┬───────┘   └──────┬───────┘   └──────┬───────┘                 │
│             │                  │                  │                         │
│             ▼                  ▼                  ▼                         │
│     ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                 │
│     │ Requires      │  │ Requires      │  │ Requires      │                 │
│     │ approval?     │  │ approval?     │  │ approval?     │                 │
│     └───────┬───────┘  └───────┬───────┘  └───────┬───────┘                 │
│             │                  │                  │                         │
│       ┌─────┴─────┐      ┌─────┴─────┐      ┌─────┴─────┐                   │
│       ▼           ▼      ▼           ▼      ▼           ▼                   │
│    ┌─────┐     ┌─────┐ ┌─────┐     ┌─────┐ ┌─────┐     ┌─────┐              │
│    │ YES │     │ NO  │ │ YES │     │ NO  │ │ YES │     │ NO  │              │
│    └──┬──┘     └──┬──┘ └──┬──┘     └──┬──┘ └──┬──┘     └──┬──┘              │
│       │           │      │           │      │           │                   │
│       ▼           │      ▼           │      ▼           │                   │
│  ┌─────────────┐  │ ┌─────────────┐  │ ┌─────────────┐  │                   │
│  │Route to     │  │ │Route to     │  │ │Route to     │  │                   │
│  │approver(s)  │  │ │approver(s)  │  │ │approver(s)  │  │                   │
│  │based on     │  │ │based on     │  │ │based on     │  │                   │
│  │routing_rule │  │ │routing_rule │  │ │routing_rule │  │                   │
│  └──────┬──────┘  │ └──────┬──────┘  │ └──────┬──────┘  │                   │
│         │         │        │         │        │         │                   │
│         ▼         ▼        ▼         ▼        ▼         ▼                   │
│     ┌───────────────────────────────────────────────────────┐               │
│     │                    COMPLETE                           │               │
│     │  Update record status, send notifications, log audit  │               │
│     └───────────────────────────────────────────────────────┘               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
`
  }
];

export function SuccessionDiagrams() {
  return (
    <div className="space-y-8" id="diagrams" data-manual-anchor="diagrams">
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <GitBranch className="h-6 w-6" />
          Appendix B: Architecture Diagrams
        </h2>
        <p className="text-muted-foreground mb-6">
          System architecture and workflow visualizations for succession planning ({DIAGRAMS.length} diagrams)
        </p>
      </div>

      <div className="space-y-6">
        {DIAGRAMS.map((diagram, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-base">{index + 1}. {diagram.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs font-mono bg-muted/50 p-4 rounded-lg overflow-x-auto whitespace-pre">
                {diagram.content}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
