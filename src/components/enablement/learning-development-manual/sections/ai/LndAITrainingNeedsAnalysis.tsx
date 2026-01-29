import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Database, Navigation, CheckCircle, Users } from 'lucide-react';

export function LndAITrainingNeedsAnalysis() {
  return (
    <section id="sec-6-3" data-manual-anchor="sec-6-3" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">6.3 Training Needs Analysis</h2>
        <p className="text-muted-foreground">
          Systematic identification and prioritization of training requirements at organizational, departmental, and individual levels.
        </p>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Create and manage training needs analyses at different organizational levels</li>
            <li>Aggregate skill gaps into actionable training requirements</li>
            <li>Prioritize training investments based on business impact</li>
            <li>Track remediation status from identification to completion</li>
          </ul>
        </CardContent>
      </Card>

      {/* Database Schema: training_needs_analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Database Schema: training_needs_analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Field</th>
                  <th className="text-left py-2 px-3 font-medium">Type</th>
                  <th className="text-left py-2 px-3 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">id</td>
                  <td className="py-2 px-3">UUID</td>
                  <td className="py-2 px-3">Primary key</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">company_id</td>
                  <td className="py-2 px-3">FK → companies</td>
                  <td className="py-2 px-3">Company scope for RLS</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">name</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">Analysis name/title</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">description</td>
                  <td className="py-2 px-3">text</td>
                  <td className="py-2 px-3">Detailed description of analysis scope</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">analysis_type</td>
                  <td className="py-2 px-3">enum</td>
                  <td className="py-2 px-3">organizational | departmental | individual</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">department_id</td>
                  <td className="py-2 px-3">FK → departments</td>
                  <td className="py-2 px-3">Target department (for departmental type)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">analysis_date</td>
                  <td className="py-2 px-3">date</td>
                  <td className="py-2 px-3">Date when analysis was conducted</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">analysis_period_start</td>
                  <td className="py-2 px-3">date</td>
                  <td className="py-2 px-3">Analysis coverage start date</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">analysis_period_end</td>
                  <td className="py-2 px-3">date</td>
                  <td className="py-2 px-3">Analysis coverage end date</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">findings</td>
                  <td className="py-2 px-3">JSONB</td>
                  <td className="py-2 px-3">Analysis results and observations</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">recommendations</td>
                  <td className="py-2 px-3">JSONB</td>
                  <td className="py-2 px-3">AI-generated or manual recommendations</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">status</td>
                  <td className="py-2 px-3">enum</td>
                  <td className="py-2 px-3">draft | in_progress | completed</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-xs">created_at / updated_at</td>
                  <td className="py-2 px-3">timestamp</td>
                  <td className="py-2 px-3">Audit timestamps</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Database Schema: training_needs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Database Schema: training_needs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Field</th>
                  <th className="text-left py-2 px-3 font-medium">Type</th>
                  <th className="text-left py-2 px-3 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">id</td>
                  <td className="py-2 px-3">UUID</td>
                  <td className="py-2 px-3">Primary key</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">employee_id</td>
                  <td className="py-2 px-3">FK → profiles</td>
                  <td className="py-2 px-3">Employee with the training need</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">company_id</td>
                  <td className="py-2 px-3">FK → companies</td>
                  <td className="py-2 px-3">Company scope for RLS</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">skill_gap_description</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">Free-text description of the gap</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">notes</td>
                  <td className="py-2 px-3">text</td>
                  <td className="py-2 px-3">Additional notes or context</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">priority</td>
                  <td className="py-2 px-3">enum</td>
                  <td className="py-2 px-3">critical | high | medium | low</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">competency_id</td>
                  <td className="py-2 px-3">FK → competencies</td>
                  <td className="py-2 px-3">Related competency (optional)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">recommended_course_id</td>
                  <td className="py-2 px-3">FK → lms_courses</td>
                  <td className="py-2 px-3">AI-suggested internal course</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">recommended_training</td>
                  <td className="py-2 px-3">text</td>
                  <td className="py-2 px-3">Free-text training recommendation (for external/custom)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">target_date</td>
                  <td className="py-2 px-3">date</td>
                  <td className="py-2 px-3">Target completion date</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">addressed_at</td>
                  <td className="py-2 px-3">timestamp</td>
                  <td className="py-2 px-3">When need was resolved</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">analysis_id</td>
                  <td className="py-2 px-3">FK → training_needs_analysis</td>
                  <td className="py-2 px-3">Parent analysis reference</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">status</td>
                  <td className="py-2 px-3">enum</td>
                  <td className="py-2 px-3">identified | planned | in_progress | addressed</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-xs">created_at / updated_at</td>
                  <td className="py-2 px-3">timestamp</td>
                  <td className="py-2 px-3">Audit timestamps</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Types */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Analysis Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Badge>Organizational</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Company-wide analysis aggregating gaps across all departments. Used for annual training budget planning
                and strategic capability building initiatives.
              </p>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">Departmental</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Department-specific analysis focusing on team skill gaps. Enables targeted training programs and
                resource allocation at the business unit level.
              </p>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Individual</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Single employee analysis typically triggered by role change, performance concern, or career
                development discussion. Links directly to IDP.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UI Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            UI Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs">
            <pre>{`Learning & Development → Training Needs (Tab)
│
├── Analyses List:
│   ├── Create New Analysis (button)
│   ├── Filter by: Type, Status, Period
│   └── View/Edit existing analyses
│
├── Analysis Detail:
│   ├── Overview & metadata
│   ├── Description (editable text)
│   ├── Findings (JSONB editor)
│   ├── Recommendations (JSONB editor)
│   └── Status workflow
│
└── Training Needs List:
    ├── Filter by: Priority, Status, Department
    ├── Bulk actions (assign course, update status)
    └── Export to Excel/PDF`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Status Workflow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Status Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs">
            <pre>{`Training Need Status Flow:
┌────────────┐    ┌─────────┐    ┌─────────────┐    ┌───────────┐
│ identified │ →  │ planned │ →  │ in_progress │ →  │ addressed │
└────────────┘    └─────────┘    └─────────────┘    └───────────┘
     │                 │                │                │
     │                 │                │                └── addressed_at = NOW()
     │                 │                └── Course enrolled & started
     │                 └── Course assigned, awaiting enrollment
     └── Gap identified, awaiting action planning

Analysis Status Flow:
┌───────┐    ┌─────────────┐    ┌───────────┐
│ draft │ →  │ in_progress │ →  │ completed │
└───────┘    └─────────────┘    └───────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Business Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Organizational analyses require HR Admin or L&D Admin role</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Departmental analyses can be created by department managers</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Training needs with "critical" priority generate manager notifications</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Completed analyses are locked from editing (create new version instead)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Training needs automatically update status when linked course is completed</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>addressed_at is auto-populated when status changes to "addressed"</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
