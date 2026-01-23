import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Brain, CheckCircle, Database, Shield, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AIMLTroubleshootingSection() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle>AI & Machine Learning Troubleshooting</CardTitle>
          <Badge variant="outline">Section 8.9</Badge>
        </div>
        <CardDescription>
          Diagnosing and resolving AI feature issues, bias detection, and explainability logging
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>ISO 42001 Compliance</AlertTitle>
          <AlertDescription>
            All AI troubleshooting actions must be documented. AI decision logs are stored in 
            <code className="mx-1 px-1 bg-muted rounded">ai_explainability_logs</code> for audit purposes.
          </AlertDescription>
        </Alert>

        {/* AI Feature Availability */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">AI Feature Availability Issues</h4>
          
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium">Symptom: AI features are disabled or unavailable</p>
                <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <p><strong>Possible Causes:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>AI system settings disabled at company level</li>
                    <li>User not enabled for AI features in <code>ai_user_settings</code></li>
                    <li>Daily/monthly token limits exceeded</li>
                    <li>Budget tier limits reached</li>
                  </ul>
                  <p className="mt-2"><strong>Resolution Steps:</strong></p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Check <code>ai_system_settings.is_ai_enabled</code> for company</li>
                    <li>Verify <code>ai_user_settings.is_enabled</code> for the user</li>
                    <li>Review token usage in <code>ai_usage_logs</code></li>
                    <li>Check budget tier in <code>ai_budget_tiers</code></li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bias Detection Issues */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Bias Detection Issues</h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <p className="font-medium">False Positive Bias Alerts</p>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Causes:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Sensitivity threshold set too low</li>
                  <li>Context-specific language flagged incorrectly</li>
                  <li>Industry terminology misinterpreted</li>
                </ul>
                <p className="mt-2"><strong>Resolution:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Adjust sensitivity in <code>ai_guardrails_config</code></li>
                  <li>Review <code>bias_nudge_templates</code> for accuracy</li>
                  <li>Mark as false positive in <code>ai_bias_incidents</code></li>
                </ul>
              </div>
            </div>

            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <p className="font-medium">Missed Bias Detection</p>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Causes:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Bias type not covered by detection model</li>
                  <li>Implicit bias patterns not recognized</li>
                  <li>Language nuances not captured</li>
                </ul>
                <p className="mt-2"><strong>Resolution:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Log incident manually in <code>ai_bias_incidents</code></li>
                  <li>Update detection patterns in configuration</li>
                  <li>Review <code>manager_bias_patterns</code> for trends</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* AI Narrative Generation */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">AI Narrative Generation Failures</h4>
          
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium">Symptom: Narratives fail to generate or are low quality</p>
                <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <p><strong>Diagnostic Steps:</strong></p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Check <code>ai_generated_narratives</code> for error records</li>
                    <li>Verify source data in <code>appraisal_scores</code> is complete</li>
                    <li>Review <code>ai_confidence_score</code> - low scores indicate insufficient data</li>
                    <li>Check <code>feedback_ai_action_logs</code> for error details</li>
                  </ol>
                  <p className="mt-2"><strong>Common Fixes:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Ensure all CRGV components have scores before generation</li>
                    <li>Verify manager comments exist (improves narrative quality)</li>
                    <li>Check model availability in <code>ai_model_registry</code></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Confidence Score Issues */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">AI Confidence Score Interpretation</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Score Range</th>
                  <th className="text-left p-2">Interpretation</th>
                  <th className="text-left p-2">Required Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2"><Badge className="bg-green-600 text-white">85-100%</Badge></td>
                  <td className="p-2">High confidence - reliable output</td>
                  <td className="p-2">No action required</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2"><Badge className="bg-amber-600 text-white">60-84%</Badge></td>
                  <td className="p-2">Moderate confidence - review recommended</td>
                  <td className="p-2">Human review suggested</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2"><Badge className="bg-orange-600 text-white">40-59%</Badge></td>
                  <td className="p-2">Low confidence - incomplete data</td>
                  <td className="p-2">Human review required</td>
                </tr>
                <tr>
                  <td className="p-2"><Badge className="bg-red-600 text-white">&lt;40%</Badge></td>
                  <td className="p-2">Very low confidence - unreliable</td>
                  <td className="p-2">Do not use - investigate data gaps</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Explainability Logging */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Explainability Log Analysis</h4>
          
          <div className="p-4 border-2 border-primary bg-primary/10 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-5 w-5 text-primary" />
              <p className="font-medium">Key Tables for AI Troubleshooting</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">ai_explainability_logs</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>decision_factors - why AI made decisions</li>
                  <li>confidence_score - reliability measure</li>
                  <li>context_sources_used - input data sources</li>
                  <li>uncertainty_areas - identified gaps</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">feedback_ai_action_logs</p>
                <ul className="list-disc pl-5 text-muted-foreground">
                  <li>action_type - what AI attempted</li>
                  <li>success - whether action completed</li>
                  <li>error_message - failure details</li>
                  <li>duration_ms - performance metrics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Human Override Workflow */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Human Override Procedures</h4>
          
          <div className="p-4 border rounded-lg space-y-3">
            <p className="text-sm text-muted-foreground">
              When AI outputs require correction, use the human override workflow:
            </p>
            <ol className="list-decimal pl-5 text-sm space-y-2">
              <li>
                <strong>Document Override:</strong> Record in <code>ai_human_overrides</code> with:
                <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                  <li>Original AI response</li>
                  <li>Modified response</li>
                  <li>Override reason (required)</li>
                  <li>Justification category</li>
                </ul>
              </li>
              <li>
                <strong>Approval Path:</strong> If <code>approval_required = true</code>, route to designated approver
              </li>
              <li>
                <strong>Audit Trail:</strong> Override automatically logged for ISO 42001 compliance
              </li>
            </ol>
          </div>
        </div>

        {/* Resolution Checklist */}
        <div className="p-4 border-2 border-green-500 bg-green-500/10 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="font-semibold">AI Issue Resolution Checklist</p>
          </div>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            {[
              'Verify AI is enabled at company and user level',
              'Check token/budget limits are not exceeded',
              'Review explainability logs for error patterns',
              'Confirm input data completeness',
              'Check model availability in registry',
              'Document any overrides with justification',
              'Review bias incident logs for patterns',
              'Verify ISO 42001 compliance documentation'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 border rounded flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
