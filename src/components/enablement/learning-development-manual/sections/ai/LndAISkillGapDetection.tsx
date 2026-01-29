import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Database, Navigation, AlertTriangle, CheckCircle, Code } from 'lucide-react';

export function LndAISkillGapDetection() {
  return (
    <section id="sec-6-2" data-manual-anchor="sec-6-2" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">6.2 Skill Gap Detection & Analysis</h2>
        <p className="text-muted-foreground">
          Automated identification of competency gaps from multiple data sources with priority-based remediation tracking.
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
            <li>Understand how skill gaps are detected from various assessment sources</li>
            <li>Configure gap score calculation and priority thresholds</li>
            <li>Link skill gaps to Individual Development Plan (IDP) items</li>
            <li>Monitor gap remediation status across the organization</li>
          </ul>
        </CardContent>
      </Card>

      {/* Database Schema Reference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Database Schema: employee_skill_gaps
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
                  <td className="py-2 px-3">Employee with the identified gap</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">company_id</td>
                  <td className="py-2 px-3">FK → companies</td>
                  <td className="py-2 px-3">Company scope for RLS</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">capability_id</td>
                  <td className="py-2 px-3">FK → competencies</td>
                  <td className="py-2 px-3">Reference to competency framework (optional)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">capability_name</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">Skill or competency being measured</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">current_level</td>
                  <td className="py-2 px-3">number (1-5)</td>
                  <td className="py-2 px-3">Employee's assessed proficiency level</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">required_level</td>
                  <td className="py-2 px-3">number (1-5)</td>
                  <td className="py-2 px-3">Target level for current role</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">gap_score</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">Calculated: required_level - current_level</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">priority</td>
                  <td className="py-2 px-3">enum</td>
                  <td className="py-2 px-3">critical | high | medium | low</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">recommended_actions</td>
                  <td className="py-2 px-3">JSONB</td>
                  <td className="py-2 px-3">AI-suggested remediation steps</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">source</td>
                  <td className="py-2 px-3">enum</td>
                  <td className="py-2 px-3">appraisal | 360 | assessment | manual</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">source_reference_id</td>
                  <td className="py-2 px-3">UUID</td>
                  <td className="py-2 px-3">Link to source record (appraisal ID, etc.)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">idp_item_id</td>
                  <td className="py-2 px-3">FK → idp_items</td>
                  <td className="py-2 px-3">Link to development plan item</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">status</td>
                  <td className="py-2 px-3">enum</td>
                  <td className="py-2 px-3">open | in_progress | addressed | closed</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">detected_at</td>
                  <td className="py-2 px-3">timestamp</td>
                  <td className="py-2 px-3">When gap was first identified</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">addressed_at</td>
                  <td className="py-2 px-3">timestamp</td>
                  <td className="py-2 px-3">When gap was remediated</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">created_at</td>
                  <td className="py-2 px-3">timestamp</td>
                  <td className="py-2 px-3">Record creation timestamp</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-xs">updated_at</td>
                  <td className="py-2 px-3">timestamp</td>
                  <td className="py-2 px-3">Last modification timestamp</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Gap Detection Sources */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Gap Detection Sources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Skill gaps are automatically detected from multiple assessment sources. Each source provides
            different perspectives on employee competencies.
          </p>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">appraisal</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Competency ratings from performance appraisals compared against role requirements.
              </p>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">360</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Multi-rater feedback aggregated to identify blind spots and development areas.
              </p>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">assessment</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Skills assessment results from online tests or practical evaluations.
              </p>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">manual</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Gaps identified manually by managers or L&D team during development discussions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gap Score Calculation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Gap Score Calculation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm">
            <code>gap_score = required_level - current_level</code>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Gap Score</th>
                  <th className="text-left py-2 px-3 font-medium">Priority</th>
                  <th className="text-left py-2 px-3 font-medium">Action Timeframe</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 px-3">≥ 3</td>
                  <td className="py-2 px-3"><Badge variant="destructive">Critical</Badge></td>
                  <td className="py-2 px-3">Immediate (within 30 days)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">2</td>
                  <td className="py-2 px-3"><Badge className="bg-orange-500">High</Badge></td>
                  <td className="py-2 px-3">Short-term (within 90 days)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">1</td>
                  <td className="py-2 px-3"><Badge variant="secondary">Medium</Badge></td>
                  <td className="py-2 px-3">Mid-term (within 6 months)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">0 or negative</td>
                  <td className="py-2 px-3"><Badge variant="outline">Low / None</Badge></td>
                  <td className="py-2 px-3">No action required</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* UI Navigation - CORRECTED */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            UI Navigation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Skill gaps are accessible from multiple entry points depending on user role:
          </p>
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs">
            <pre>{`Employee Self-Service (ESS):
ESS → My Skill Gaps (/ess/skill-gaps)
├── View personal skill gaps
├── Accept/decline recommendations
└── Link to learning resources

Manager View:
Workforce → Team → [Employee] → Skill Gaps Tab
├── Filter by: Priority, Status, Source
├── View individual employee gap cards
├── Actions:
│   ├── Link to IDP item
│   ├── Assign recommended course
│   └── Mark as addressed
└── Export: Gap report (PDF/Excel)

HR/Admin View:
Workforce → Employees → [Employee] → Skill Gaps Tab
├── Same as manager view with additional controls
└── Bulk gap analysis trigger`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Hook Functions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Code className="h-4 w-4 text-primary" />
            API Reference: useSkillGapManagement Hook
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Function</th>
                  <th className="text-left py-2 px-3 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">fetchEmployeeGaps(employeeId, filters?)</td>
                  <td className="py-2 px-3">Fetch gaps for a specific employee with optional filters</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">fetchCompanyGaps(companyId, filters?)</td>
                  <td className="py-2 px-3">Fetch all gaps across company (HR/Admin view)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">createGapFromAppraisal(...)</td>
                  <td className="py-2 px-3">Create gap from appraisal competency rating</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">linkGapToIDP(gapId, idpItemId)</td>
                  <td className="py-2 px-3">Associate gap with development plan item</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">updateGapStatus(gapId, status)</td>
                  <td className="py-2 px-3">Update gap status with automatic addressed_at</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-xs">triggerGapAnalysis(action, params)</td>
                  <td className="py-2 px-3">Invoke edge function for AI gap analysis</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Business Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Gaps with score ≥ 2 automatically trigger manager notification</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Critical gaps (score ≥ 3) appear in executive dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Gaps linked to IDP items update status when IDP item is completed</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Re-assessment after training completion updates current_level</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Gap history is retained for trend analysis (gaps are soft-deleted)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Edge function: skill-gap-processor handles bulk analysis</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* IDP Integration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">IDP Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Skill gaps can be directly linked to Individual Development Plan items for structured remediation tracking.
          </p>
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs">
            <pre>{`employee_skill_gaps.idp_item_id → idp_items.id

When IDP item status changes:
├── in_progress → gap.status = "in_progress"
├── completed   → gap.status = "addressed", gap.addressed_at = NOW()
└── cancelled   → gap.idp_item_id = NULL (unlink)`}</pre>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
