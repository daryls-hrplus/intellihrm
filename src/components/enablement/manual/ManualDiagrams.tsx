import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, GitBranch, Users, Link2, Calculator, Brain, Calendar, Zap } from 'lucide-react';

export function ManualDiagrams() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Architecture Diagrams</h2>
        <p className="text-muted-foreground">Visual representations of system architecture and flows</p>
      </div>

      {/* Complete Data Architecture */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <CardTitle>Complete Data Architecture</CardTitle>
          </div>
          <CardDescription>All 14 appraisal tables and their relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CORE TABLES                                               │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│  ┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐         │
│  │ appraisal_form_      │────▶│   appraisal_cycles   │◀────│ appraisal_rating_    │         │
│  │ templates            │     │                      │     │ scales               │         │
│  └──────────────────────┘     └──────────┬───────────┘     └──────────────────────┘         │
│                                          │                                                   │
│                                          ▼                                                   │
│                               ┌──────────────────────┐                                       │
│                               │appraisal_participants│◀─────────────────────────────┐       │
│                               └──────────┬───────────┘                              │       │
│                                          │                                          │       │
│         ┌────────────────────────────────┼────────────────────────────────┐         │       │
│         ▼                                ▼                                ▼         │       │
│  ┌──────────────────┐         ┌──────────────────────┐         ┌──────────────────┐ │       │
│  │ appraisal_scores │         │appraisal_score_      │         │ appraisal_value_ │ │       │
│  │                  │         │breakdown             │         │ scores           │ │       │
│  └──────────────────┘         └──────────────────────┘         └──────────────────┘ │       │
│                                                                                      │       │
├─────────────────────────────────────────────────────────────────────────────────────┼───────┤
│                              MULTI-POSITION & ROLE CHANGE                            │       │
├─────────────────────────────────────────────────────────────────────────────────────┼───────┤
│                                                                                      │       │
│  ┌──────────────────────┐                              ┌──────────────────────┐     │       │
│  │ appraisal_position_  │──────────────────────────────│ appraisal_role_      │─────┘       │
│  │ weights              │                              │ segments             │             │
│  └──────────────────────┘                              └──────────────────────┘             │
│                                                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                              AI & DEVELOPMENT TABLES                                         │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│  ┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐         │
│  │ appraisal_strengths_ │     │ ai_generated_        │     │ appraisal_interviews │         │
│  │ gaps                 │     │ narratives           │     │                      │         │
│  └──────────────────────┘     └──────────────────────┘     └──────────────────────┘         │
│                                                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                              AUTOMATION & INTEGRATION                                        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│  ┌──────────────────────┐     ┌──────────────────────┐                                      │
│  │ appraisal_outcome_   │────▶│ appraisal_action_    │──────▶ IDP, PIP, Succession          │
│  │ action_rules         │     │ executions           │                                      │
│  └──────────────────────┘     └──────────────────────┘                                      │
│                                                                                              │
│  ┌──────────────────────┐     ┌──────────────────────┐                                      │
│  │ appraisal_integration│────▶│ appraisal_integration│──────▶ Nine-Box, Succession,         │
│  │ _rules               │     │ _log                 │       Compensation, Workforce        │
│  └──────────────────────┘     └──────────────────────┘                                      │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Complete Workflow Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <CardTitle>Complete Workflow Status Flow</CardTitle>
          </div>
          <CardDescription>All 9 workflow statuses and their transitions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Main flow */}
            <div className="flex flex-wrap justify-center items-center gap-2 p-4">
              {[
                { status: 'draft', color: 'bg-gray-600 text-white' },
                { status: 'pending', color: 'bg-blue-600 text-white' },
                { status: 'in_progress', color: 'bg-amber-600 text-white' },
                { status: 'approved', color: 'bg-green-600 text-white' }
              ].map((item, i, arr) => (
                <div key={item.status} className="flex items-center gap-2">
                  <div className={`px-4 py-2 rounded-lg ${item.color} font-medium text-sm`}>
                    {item.status}
                  </div>
                  {i < arr.length - 1 && <span className="text-primary font-bold">→</span>}
                </div>
              ))}
            </div>
            
            {/* Alternative paths */}
            <div className="grid md:grid-cols-2 gap-4 p-4 border-2 border-primary bg-primary/20 rounded-lg">
              <div>
                <h4 className="font-semibold text-sm mb-3">Exception Statuses</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-red-600 text-white hover:bg-red-700">rejected</Badge>
                  <Badge className="bg-orange-600 text-white hover:bg-orange-700">returned</Badge>
                  <Badge className="bg-purple-600 text-white hover:bg-purple-700">escalated</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-3">Terminal Statuses</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-gray-600 text-white hover:bg-gray-700">cancelled</Badge>
                  <Badge className="bg-slate-600 text-white hover:bg-slate-700">auto_terminated</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Calculation Flow */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>Score Calculation Flow</CardTitle>
          </div>
          <CardDescription>Weighted CRGV scoring with calibration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────┐
│                         SCORE CALCULATION PIPELINE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  COMPONENT SCORES                           WEIGHTS                          │
│  ┌────────────────┐                                                         │
│  │ Competencies   │────────┐                                                │
│  │ (avg score)    │        │         ┌──────────────────────┐               │
│  └────────────────┘        │         │                      │               │
│  ┌────────────────┐        ├────────▶│  Weighted Average    │               │
│  │ Responsibilities│───────┤         │                      │               │
│  │ (avg score)    │        │         │  goal_weight         │               │
│  └────────────────┘        │         │  competency_weight   │               │
│  ┌────────────────┐        │         │  responsibility_     │               │
│  │ Goals          │────────┤         │  weight              │               │
│  │ (avg score)    │        │         │  values_weight       │               │
│  └────────────────┘        │         │  feedback_360_weight │               │
│  ┌────────────────┐        │         │                      │               │
│  │ Values         │────────┤         └──────────┬───────────┘               │
│  │ (if enabled)   │        │                    │                           │
│  └────────────────┘        │                    ▼                           │
│  ┌────────────────┐        │         ┌──────────────────────┐               │
│  │ 360 Feedback   │────────┘         │ pre_calibration_     │               │
│  │ (if enabled)   │                  │ score                │               │
│  └────────────────┘                  └──────────┬───────────┘               │
│                                                 │                           │
│                                                 ▼                           │
│                                      ┌──────────────────────┐               │
│                                      │ CALIBRATION SESSION  │               │
│                                      │ • Adjustment reason  │               │
│                                      │ • Adjusted by        │               │
│                                      └──────────┬───────────┘               │
│                                                 │                           │
│                                                 ▼                           │
│                                      ┌──────────────────────┐               │
│                                      │ post_calibration_    │               │
│                                      │ score                │               │
│                                      └──────────┬───────────┘               │
│                                                 │                           │
│                                                 ▼                           │
│                                      ┌──────────────────────┐               │
│                                      │ performance_category │               │
│                                      │ (Exceptional, Meets, │               │
│                                      │  Needs Improvement)  │               │
│                                      └──────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis Pipeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Analysis Pipeline</CardTitle>
          </div>
          <CardDescription>Strengths/Gaps identification and narrative generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-medium text-sm mb-2">1. Data Collection</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Scores</p>
                <p>Comments</p>
                <p>Goal progress</p>
              </div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-medium text-sm mb-2">2. AI Analysis</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Pattern detection</p>
                <p>Gap identification</p>
                <p>Strength mapping</p>
              </div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-medium text-sm mb-2">3. Output Generation</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Strengths list</p>
                <p>Development gaps</p>
                <p>Confidence score</p>
              </div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <h4 className="font-medium text-sm mb-2">4. IDP Linking</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Suggested goals</p>
                <p>Learning paths</p>
                <p>Action items</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 border-2 border-primary bg-primary/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">appraisal_strengths_gaps Fields</h4>
            <div className="flex flex-wrap gap-2">
              {['strengths', 'development_gaps', 'ai_confidence', 'suggested_idp_goals', 'linked_idp_goal_ids', 'manager_acknowledged'].map((field) => (
                <Badge key={field} className="bg-primary text-primary-foreground">{field}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interview Lifecycle */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Interview Lifecycle</CardTitle>
          </div>
          <CardDescription>Performance review meeting workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center items-center gap-2 p-4">
              {[
                { status: 'scheduled', color: 'bg-blue-600 text-white' },
                { status: 'confirmed', color: 'bg-green-600 text-white' },
                { status: 'completed', color: 'bg-emerald-600 text-white' }
              ].map((item, i, arr) => (
                <div key={item.status} className="flex items-center gap-2">
                  <div className={`px-4 py-2 rounded-lg ${item.color} font-medium text-sm`}>
                    {item.status}
                  </div>
                  {i < arr.length - 1 && <span className="text-primary font-bold">→</span>}
                </div>
              ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 border-2 border-amber-500 bg-amber-500/20 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Exception Paths</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-amber-600 text-white">rescheduled</Badge>
                <Badge className="bg-gray-600 text-white">cancelled</Badge>
                <Badge className="bg-red-600 text-white">no_show</Badge>
              </div>
            </div>
            <div className="p-4 border-2 border-blue-500 bg-blue-500/20 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Video Integration</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-600 text-white">Zoom</Badge>
                <Badge className="bg-purple-600 text-white">Microsoft Teams</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outcome Actions Flow */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle>Outcome Actions Flow</CardTitle>
          </div>
          <CardDescription>Automated action triggering and execution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────┐
│                         OUTCOME ACTION AUTOMATION                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────┐                                                     │
│  │ TRIGGER CONDITIONS │                                                     │
│  ├────────────────────┤                                                     │
│  │ • score_below      │                                                     │
│  │ • score_above      │────────┐                                            │
│  │ • repeated_low     │        │                                            │
│  │ • gap_detected     │        │         ┌──────────────────────┐           │
│  │ • improvement_trend│        ├────────▶│ RULE EVALUATION      │           │
│  │ • competency_gap   │        │         │                      │           │
│  │ • goal_not_met     │────────┘         │ Match condition?     │           │
│  └────────────────────┘                  │ Check threshold      │           │
│                                          │ Verify section       │           │
│                                          └──────────┬───────────┘           │
│                                                     │                       │
│                           ┌─────────────────────────┼─────────────────────┐ │
│                           │                         │                     │ │
│                           ▼                         ▼                     ▼ │
│                  ┌────────────────┐      ┌────────────────┐    ┌──────────┐ │
│                  │ ACTION TYPES   │      │ EXECUTION      │    │ OVERRIDE │ │
│                  ├────────────────┤      │ STATUS         │    │ PATH     │ │
│                  │ create_idp     │      ├────────────────┤    ├──────────┤ │
│                  │ create_pip     │      │ pending        │    │ Override │ │
│                  │ suggest_       │      │ executed       │    │ reason   │ │
│                  │ succession     │      │ overridden     │    │ Approved │ │
│                  │ block_         │      │ acknowledged   │    │ by       │ │
│                  │ finalization   │      └────────────────┘    └──────────┘ │
│                  │ require_comment│                                         │
│                  │ notify_hr      │                                         │
│                  │ schedule_      │                                         │
│                  │ coaching       │                                         │
│                  └────────────────┘                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* User Journey */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>User Journey Map</CardTitle>
          </div>
          <CardDescription>Role-based workflow through the appraisal process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { role: 'Employee', steps: ['Complete Self-Assessment', 'Review Manager Rating', 'Select Response Type', 'Add Comments', 'Attend Interview'] },
              { role: 'Manager', steps: ['Review Self-Assessment', 'Rate Performance (CRGV)', 'Use AI Assistant', 'Review Strengths/Gaps', 'Submit & Discuss'] },
              { role: 'HR', steps: ['Configure Cycle', 'Enroll Participants', 'Monitor Progress', 'Facilitate Calibration', 'Execute Actions'] }
            ].map((journey) => (
              <div key={journey.role} className="flex items-start gap-4">
                <Badge variant="outline" className="min-w-[80px] justify-center">{journey.role}</Badge>
                <div className="flex flex-wrap gap-2">
                  {journey.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm px-3 py-1 bg-muted rounded">{step}</span>
                      {i < journey.steps.length - 1 && <span className="text-muted-foreground">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Map */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            <CardTitle>Integration Map</CardTitle>
          </div>
          <CardDescription>Upstream and downstream data connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-blue-600 dark:text-blue-400">UPSTREAM</h4>
              <div className="space-y-2">
                {['Goals', 'Competencies', 'Job Profiles', '360 Feedback', 'Company Values', 'Position Assignments'].map((item) => (
                  <div key={item} className="p-2 bg-blue-600 text-white rounded text-sm font-medium">{item}</div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="p-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg shadow-lg">
                Appraisals Module
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-green-600 dark:text-green-400">DOWNSTREAM</h4>
              <div className="space-y-2">
                {['Nine-Box', 'Succession', 'Compensation', 'Learning/IDP', 'PIP', 'Workforce Analytics', 'Notifications'].map((item) => (
                  <div key={item} className="p-2 bg-green-600 text-white rounded text-sm font-medium">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
