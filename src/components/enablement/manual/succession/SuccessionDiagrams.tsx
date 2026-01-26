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
          System architecture and workflow visualizations for succession planning
        </p>
      </div>

      <div className="space-y-6">
        {DIAGRAMS.map((diagram, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-base">{diagram.title}</CardTitle>
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
