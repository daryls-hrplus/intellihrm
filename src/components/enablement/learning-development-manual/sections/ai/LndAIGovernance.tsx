import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Database, Navigation, Shield, AlertTriangle, CheckCircle, Eye } from 'lucide-react';

export function LndAIGovernance() {
  return (
    <section id="sec-6-7" data-manual-anchor="sec-6-7" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">6.7 AI Governance & Explainability</h2>
        <p className="text-muted-foreground">
          ISO 42001 compliance framework for L&D AI features including explainability, bias monitoring, and human oversight.
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
            <li>Understand AI explainability requirements for L&D recommendations</li>
            <li>Configure human oversight workflows for AI-generated content</li>
            <li>Monitor and respond to bias detection alerts</li>
            <li>Maintain audit trails for ISO 42001 compliance</li>
          </ul>
        </CardContent>
      </Card>

      {/* Database Schema: ai_explainability_logs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Database Schema: ai_explainability_logs
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
                  <td className="py-2 px-3 font-mono text-xs">interaction_log_id</td>
                  <td className="py-2 px-3">FK</td>
                  <td className="py-2 px-3">Link to parent AI interaction</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">confidence_score</td>
                  <td className="py-2 px-3">number (0-1)</td>
                  <td className="py-2 px-3">AI model confidence in recommendation</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">decision_factors</td>
                  <td className="py-2 px-3">JSONB</td>
                  <td className="py-2 px-3">Factors that influenced the AI decision</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">citations</td>
                  <td className="py-2 px-3">JSONB</td>
                  <td className="py-2 px-3">Source data references supporting decision</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">context_sources_used</td>
                  <td className="py-2 px-3">JSONB</td>
                  <td className="py-2 px-3">Data sources accessed during processing</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">uncertainty_areas</td>
                  <td className="py-2 px-3">string[]</td>
                  <td className="py-2 px-3">Known limitations or uncertainty factors</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">model_used</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">AI model identifier (e.g., gemini-2.5-flash)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-xs">prompt_tokens / completion_tokens</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">Token usage for cost tracking</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Database Schema: ai_governance_metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Database Schema: ai_governance_metrics
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
                  <td className="py-2 px-3 font-mono text-xs">metric_date</td>
                  <td className="py-2 px-3">date</td>
                  <td className="py-2 px-3">Date of metrics aggregation</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">metric_type</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">Type of metric (daily, weekly, monthly)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">total_interactions</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">Total AI interactions in period</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">compliance_rate</td>
                  <td className="py-2 px-3">number (%)</td>
                  <td className="py-2 px-3">ISO 42001 compliance percentage</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">bias_incidents_detected</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">Count of bias flags raised</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">human_reviews_required</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">Interactions requiring human review</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">human_reviews_completed</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">Reviews completed within SLA</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-xs">overrides_count</td>
                  <td className="py-2 px-3">number</td>
                  <td className="py-2 px-3">AI decisions overridden by humans</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Explainability Requirements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Explainability Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Every AI recommendation in the L&D module must be explainable. Users can view the reasoning
            behind any AI-generated suggestion.
          </p>
          
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs">
            <pre>{`Example Explainability Record:
{
  "confidence_score": 0.87,
  "decision_factors": {
    "skill_gap_severity": "high",
    "course_relevance_score": 0.92,
    "peer_completion_rate": 0.78,
    "role_alignment": "exact_match"
  },
  "citations": [
    {"source": "appraisal_2024", "field": "leadership_rating", "value": 2},
    {"source": "job_profile", "field": "required_competencies", "match": true}
  ],
  "uncertainty_areas": [
    "Limited historical data for this role-course combination",
    "Employee preference data not available"
  ]
}`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Human Oversight Workflow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Human Oversight Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs">
            <pre>{`Human Review Triggers:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Automatic Review Required When:                                │
│  ├── confidence_score < 0.7                                     │
│  ├── AI-generated training content (always)                     │
│  ├── Mandatory compliance course assignment                     │
│  ├── High-risk employee (flagged in system)                     │
│  └── Bias detection alert triggered                             │
│                                                                 │
│  Review Workflow:                                               │
│  1. AI flags interaction for review                             │
│  2. Notification sent to designated reviewer                    │
│  3. Reviewer approves, modifies, or rejects                     │
│  4. Decision logged with justification                          │
│  5. Employee notified of final recommendation                   │
│                                                                 │
│  SLA: 24 hours for standard, 4 hours for urgent                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Bias Detection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Bias Detection & Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The system monitors for potential bias in AI recommendations across protected characteristics.
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Bias Type</th>
                  <th className="text-left py-2 px-3 font-medium">Detection Method</th>
                  <th className="text-left py-2 px-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 px-3">Gender Disparity</td>
                  <td className="py-2 px-3">Recommendation rate comparison by gender</td>
                  <td className="py-2 px-3">Alert + Investigation</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Age Discrimination</td>
                  <td className="py-2 px-3">Course type distribution by age group</td>
                  <td className="py-2 px-3">Alert + Investigation</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Department Favoritism</td>
                  <td className="py-2 px-3">Budget allocation patterns</td>
                  <td className="py-2 px-3">Quarterly Review</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Role-Level Bias</td>
                  <td className="py-2 px-3">Training access by job level</td>
                  <td className="py-2 px-3">Annual Audit</td>
                </tr>
              </tbody>
            </table>
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
            <pre>{`Admin → AI Governance
│
├── Dashboard:
│   ├── Compliance Rate (gauge)
│   ├── Pending Reviews (count)
│   ├── Bias Alerts (count)
│   └── Override Rate (trend)
│
├── Explainability Logs:
│   ├── Filter by: Date, Module, Confidence
│   └── View detailed reasoning for any AI decision
│
├── Human Review Queue:
│   ├── Pending reviews (sortable by urgency)
│   ├── Review history
│   └── SLA compliance metrics
│
└── Bias Incidents:
    ├── Active investigations
    ├── Resolved incidents
    └── Trend analysis`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Audit Trail Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>All AI interactions logged with full request/response payload</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Human overrides include justification and approver identity</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Bias incidents tracked from detection through remediation</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Logs retained for 7 years per regulatory requirements</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Quarterly governance reports auto-generated for compliance review</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
