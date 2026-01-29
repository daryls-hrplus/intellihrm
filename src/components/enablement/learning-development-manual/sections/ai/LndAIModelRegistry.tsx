import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Database, Navigation, CheckCircle, Bot, Shield, Calendar } from 'lucide-react';

export function LndAIModelRegistry() {
  return (
    <section id="sec-6-8" data-manual-anchor="sec-6-8" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">6.8 Model Configuration & Registry</h2>
        <p className="text-muted-foreground">
          AI model administration for L&D features including registration, risk classification, fairness auditing, and compliance tracking.
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
            <li>Navigate the AI Model Registry and understand model metadata</li>
            <li>Apply risk classification guidelines to AI models</li>
            <li>Configure approved use cases for L&D AI features</li>
            <li>Schedule and track compliance audits</li>
            <li>Monitor model fairness metrics and audit findings</li>
          </ul>
        </CardContent>
      </Card>

      {/* Database Schema */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Database Schema: ai_model_registry
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
                  <td className="py-2 px-3">Company scope (null = global)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">model_identifier</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">Technical identifier (e.g., google/gemini-2.5-flash)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">display_name</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">User-friendly name for UI display</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">provider</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">Model provider (Google, OpenAI, etc.)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">version</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">Model version for tracking updates</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">purpose</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">Primary use case description</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">risk_classification</td>
                  <td className="py-2 px-3">enum</td>
                  <td className="py-2 px-3">low | medium | high | critical</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">approved_use_cases</td>
                  <td className="py-2 px-3">string[]</td>
                  <td className="py-2 px-3">Permitted L&D functions</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">prohibited_use_cases</td>
                  <td className="py-2 px-3">string[]</td>
                  <td className="py-2 px-3">Explicitly forbidden uses</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">is_active</td>
                  <td className="py-2 px-3">boolean</td>
                  <td className="py-2 px-3">Whether model is currently enabled</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">compliance_status</td>
                  <td className="py-2 px-3">enum</td>
                  <td className="py-2 px-3">compliant | pending | non_compliant</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">last_audit_date / next_audit_due</td>
                  <td className="py-2 px-3">date</td>
                  <td className="py-2 px-3">Audit schedule tracking</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">audit_findings</td>
                  <td className="py-2 px-3">JSONB</td>
                  <td className="py-2 px-3">Results from compliance audits</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">fairness_score</td>
                  <td className="py-2 px-3">number (0-100)</td>
                  <td className="py-2 px-3">Overall fairness rating</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">fairness_metrics</td>
                  <td className="py-2 px-3">JSONB</td>
                  <td className="py-2 px-3">Detailed fairness breakdown by characteristic</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">last_fairness_audit</td>
                  <td className="py-2 px-3">date</td>
                  <td className="py-2 px-3">Most recent fairness evaluation</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">model_card</td>
                  <td className="py-2 px-3">JSONB</td>
                  <td className="py-2 px-3">Model documentation per AI ethics standards</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">data_retention_policy</td>
                  <td className="py-2 px-3">string</td>
                  <td className="py-2 px-3">Data handling and retention rules</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">created_by</td>
                  <td className="py-2 px-3">FK → profiles</td>
                  <td className="py-2 px-3">User who registered the model</td>
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

      {/* Risk Classification */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Risk Classification Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Level</th>
                  <th className="text-left py-2 px-3 font-medium">Criteria</th>
                  <th className="text-left py-2 px-3 font-medium">Audit Frequency</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 px-3"><Badge variant="outline">Low</Badge></td>
                  <td className="py-2 px-3">
                    Suggestions only, no automated actions. User must explicitly accept.
                    Example: Course recommendations
                  </td>
                  <td className="py-2 px-3">Annual</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3"><Badge variant="secondary">Medium</Badge></td>
                  <td className="py-2 px-3">
                    Automated actions with easy reversal. Human can override.
                    Example: Training needs prioritization
                  </td>
                  <td className="py-2 px-3">Semi-annual</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3"><Badge className="bg-orange-500">High</Badge></td>
                  <td className="py-2 px-3">
                    Actions affecting employee records or mandatory assignments.
                    Example: Compliance course auto-enrollment
                  </td>
                  <td className="py-2 px-3">Quarterly</td>
                </tr>
                <tr>
                  <td className="py-2 px-3"><Badge variant="destructive">Critical</Badge></td>
                  <td className="py-2 px-3">
                    Decisions impacting career progression or performance evaluation.
                    Example: Certification decisions, skill verification
                  </td>
                  <td className="py-2 px-3">Monthly</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Approved Use Cases for L&D */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            Approved Use Cases for L&D
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-3 rounded-lg border">
              <p className="font-medium text-sm mb-1">Course Recommendations</p>
              <p className="text-xs text-muted-foreground">
                AI suggests courses based on skill gaps and career goals.
              </p>
              <Badge variant="outline" className="mt-2">Low Risk</Badge>
            </div>
            <div className="p-3 rounded-lg border">
              <p className="font-medium text-sm mb-1">Learning Path Suggestions</p>
              <p className="text-xs text-muted-foreground">
                AI recommends course sequences for role transitions.
              </p>
              <Badge variant="outline" className="mt-2">Low Risk</Badge>
            </div>
            <div className="p-3 rounded-lg border">
              <p className="font-medium text-sm mb-1">Training Needs Prioritization</p>
              <p className="text-xs text-muted-foreground">
                AI ranks organizational training needs by impact.
              </p>
              <Badge variant="secondary" className="mt-2">Medium Risk</Badge>
            </div>
            <div className="p-3 rounded-lg border">
              <p className="font-medium text-sm mb-1">Content Generation Drafts</p>
              <p className="text-xs text-muted-foreground">
                AI drafts quiz questions and course outlines for human review.
              </p>
              <Badge variant="secondary" className="mt-2">Medium Risk</Badge>
            </div>
            <div className="p-3 rounded-lg border">
              <p className="font-medium text-sm mb-1">Compliance Auto-Enrollment</p>
              <p className="text-xs text-muted-foreground">
                AI auto-enrolls employees in mandatory compliance training.
              </p>
              <Badge className="bg-orange-500 mt-2">High Risk</Badge>
            </div>
            <div className="p-3 rounded-lg border">
              <p className="font-medium text-sm mb-1">Analytics Predictions</p>
              <p className="text-xs text-muted-foreground">
                AI predicts completion rates and engagement trends.
              </p>
              <Badge variant="outline" className="mt-2">Low Risk</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fairness Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Fairness Metrics Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs">
            <pre>{`fairness_metrics: {
  "demographic_parity": {
    "gender": 0.95,
    "age_group": 0.92,
    "department": 0.88
  },
  "equalized_odds": {
    "true_positive_rate_variance": 0.03,
    "false_positive_rate_variance": 0.02
  },
  "individual_fairness": 0.91,
  "counterfactual_fairness": 0.89
}

model_card: {
  "intended_use": "Course recommendations based on skill gaps",
  "limitations": ["Limited data for niche roles", "English-only content"],
  "training_data_summary": "50K employee-course pairs, 2020-2024",
  "ethical_considerations": ["Bias monitoring enabled", "Human review for critical"],
  "evaluation_results": {...}
}`}</pre>
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
            <pre>{`Admin → AI Governance → Model Registry (AIModelRegistryPanel)
│
├── Model List:
│   ├── Filter by: Provider, Risk Level, Compliance Status, Active
│   ├── View compliance indicators (badges)
│   ├── Fairness score column
│   └── Click row to view details
│
├── Model Detail:
│   ├── General Information (name, provider, version)
│   ├── Risk Classification
│   ├── Approved Use Cases (editable list)
│   ├── Prohibited Use Cases (editable list)
│   ├── Model Card (structured documentation)
│   ├── Fairness Metrics (visual breakdown)
│   ├── Audit Findings History
│   └── Schedule Next Audit
│
└── Actions:
    ├── Register New Model
    ├── Update Risk Classification
    ├── Schedule Audit
    ├── Run Fairness Evaluation
    └── Deactivate Model`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Audit Scheduling */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Audit Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Model audits verify continued compliance with ISO 42001 requirements and organizational policies.
          </p>
          
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Audit Checklist:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Verify model version matches registered version</li>
              <li>Review bias incident history since last audit</li>
              <li>Validate approved use cases are still appropriate</li>
              <li>Check human override rate (threshold: &lt;10%)</li>
              <li>Confirm explainability logs are complete</li>
              <li>Test model outputs for consistency</li>
              <li>Update fairness_metrics with latest evaluation</li>
              <li>Document findings in audit_findings JSONB</li>
            </ul>
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
              <span>Models with overdue audits are flagged with warning banner in UI</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Critical-risk models cannot be used if audit is &gt;30 days overdue</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Model deactivation (is_active=false) requires approval from AI Governance owner</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>New model registration triggers initial compliance review</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Provider model version changes require re-registration</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>fairness_score &lt; 80 triggers automatic review requirement</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
