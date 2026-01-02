import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, Database, Shield, Cpu, ArrowRight, CheckCircle,
  Lock, Eye, FileText, Workflow
} from 'lucide-react';

export function OverviewArchitecture() {
  return (
    <Card id="sec-1-3">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.3</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>25 min read</span>
        </div>
        <CardTitle className="text-2xl">System Architecture</CardTitle>
        <CardDescription>
          Data model, integration points, security model, and technical overview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Entity Relationship Overview */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Entity Relationship Diagram
          </h3>
          <p className="text-muted-foreground mb-4">
            The Appraisals module consists of 14 core database tables with extensive relationships. 
            Understanding this structure is essential for advanced configuration and troubleshooting.
          </p>
          
          {/* ASCII Diagram */}
          <div className="p-4 bg-muted rounded-lg font-mono text-sm overflow-x-auto mb-4">
            <pre className="text-xs">{`┌─────────────────────────┐
│    appraisal_cycles     │◄──────────────────────────────────────────┐
│  (id, company_id,       │                                          │
│   status, dates, weights)│                                          │
└───────────┬─────────────┘                                          │
            │ 1:N                                                     │
            ▼                                                         │
┌─────────────────────────┐     ┌─────────────────────────┐          │
│ appraisal_participants  │     │ appraisal_form_templates │          │
│  (employee_id, status,  │     │  (sections, questions,  │──────────┤
│   scores, workflow_step)│     │   component_configs)     │          │
└───────────┬─────────────┘     └─────────────────────────┘          │
            │ 1:N                                                     │
            ▼                                                         │
┌─────────────────────────┐     ┌─────────────────────────┐          │
│    appraisal_scores     │     │appraisal_integration_rules│─────────┤
│  (component, score,     │     │  (target_module, trigger,│          │
│   self_score, comments) │     │   field_mappings)        │          │
└─────────────────────────┘     └─────────────────────────┘          │
                                                                      │
┌─────────────────────────┐     ┌─────────────────────────┐          │
│appraisal_outcome_actions│     │  calibration_sessions   │──────────┘
│  (rule conditions,      │     │  (status, participants, │
│   downstream actions)   │     │   distribution_targets) │
└─────────────────────────┘     └─────────────────────────┘`}</pre>
          </div>

          {/* Core Tables Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Core Tables</h4>
              {[
                { name: 'appraisal_cycles', desc: 'Defines evaluation periods, weights, and status', rows: '~10-50/company' },
                { name: 'appraisal_participants', desc: 'Employees enrolled in a cycle with status tracking', rows: '~100-10K/cycle' },
                { name: 'appraisal_scores', desc: 'Individual component scores and comments', rows: '~4-8/participant' },
                { name: 'appraisal_form_templates', desc: 'Form structure, sections, and questions', rows: '~5-20/company' },
                { name: 'appraisal_integration_rules', desc: 'Rules for downstream module updates', rows: '~10-30/company' },
                { name: 'appraisal_outcome_action_rules', desc: 'Automated actions based on scores', rows: '~5-15/company' }
              ].map((table, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <code className="font-mono text-primary">{table.name}</code>
                    <p className="text-xs text-muted-foreground">{table.desc}</p>
                    <p className="text-xs text-muted-foreground italic">Est. size: {table.rows}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="font-medium">Supporting Tables</h4>
              {[
                { name: 'calibration_sessions', desc: 'Group calibration meeting records', rows: '~1-5/cycle' },
                { name: 'calibration_adjustments', desc: 'Individual rating adjustments with justification', rows: '~0-500/session' },
                { name: 'performance_rating_scales', desc: 'Component and overall rating definitions', rows: '~5-10/company' },
                { name: 'ai_generated_narratives', desc: 'AI-assisted feedback content', rows: '~1/participant' },
                { name: 'appraisal_action_executions', desc: 'Audit trail of triggered actions', rows: '~0-2/participant' },
                { name: 'appraisal_score_history', desc: 'Version history of score changes', rows: '~1-5/score' }
              ].map((table, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm">
                  <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <code className="font-mono text-primary">{table.name}</code>
                    <p className="text-xs text-muted-foreground">{table.desc}</p>
                    <p className="text-xs text-muted-foreground italic">Est. size: {table.rows}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Data Flow Diagram */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            Data Flow Diagram
          </h3>
          <p className="text-muted-foreground mb-4">
            Data flows through the appraisal lifecycle in distinct stages, with upstream inputs 
            feeding into the evaluation process and downstream systems receiving the outputs.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground text-center">UPSTREAM INPUTS</h4>
              {['Goals Module', 'Competency Framework', 'Job Profiles', '360 Feedback', 'Employee Master Data'].map((item, i) => (
                <div key={i} className="p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded text-sm text-center">
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-center items-center gap-2">
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <div className="p-4 bg-primary text-primary-foreground rounded-lg font-medium text-center">
                Appraisals<br />Module
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground text-center">DOWNSTREAM OUTPUTS</h4>
              {['Nine-Box Grid', 'Succession Planning', 'Compensation Planning', 'Learning Recommendations', 'PIP/IDP Creation'].map((item, i) => (
                <div key={i} className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded text-sm text-center">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Lifecycle Stages */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2 font-medium">Appraisal Lifecycle Stages</div>
            <div className="p-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { stage: 'Draft', color: 'bg-gray-200 dark:bg-gray-700' },
                  { stage: 'Active', color: 'bg-blue-200 dark:bg-blue-800' },
                  { stage: 'Self-Assessment', color: 'bg-cyan-200 dark:bg-cyan-800' },
                  { stage: 'Manager Evaluation', color: 'bg-amber-200 dark:bg-amber-800' },
                  { stage: 'Calibration', color: 'bg-purple-200 dark:bg-purple-800' },
                  { stage: 'Employee Review', color: 'bg-pink-200 dark:bg-pink-800' },
                  { stage: 'Completed', color: 'bg-green-200 dark:bg-green-800' },
                  { stage: 'Closed', color: 'bg-gray-300 dark:bg-gray-600' }
                ].map((item, i, arr) => (
                  <div key={item.stage} className="flex items-center gap-2">
                    <div className={`px-3 py-2 rounded ${item.color} text-sm font-medium`}>
                      {item.stage}
                    </div>
                    {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Security Model */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Model
          </h3>
          <p className="text-muted-foreground mb-4">
            The Appraisals module implements enterprise-grade security with role-based access control (RBAC), 
            row-level security (RLS), and comprehensive audit logging.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Access Control */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Role-Based Access Control
              </h4>
              <div className="space-y-2">
                {[
                  { role: 'Employee (ESS)', access: 'Own data only', actions: 'View, Self-assess, Acknowledge' },
                  { role: 'Manager (MSS)', access: 'Direct reports', actions: 'Evaluate, Submit, View history' },
                  { role: 'HR Partner', access: 'Assigned population', actions: 'Configure, Monitor, Report' },
                  { role: 'HR Admin', access: 'Company-wide', actions: 'Full configuration, Calibrate' },
                  { role: 'Executive', access: 'Organization-wide', actions: 'View analytics, Approve calibration' }
                ].map((item, i) => (
                  <div key={i} className="p-2 bg-muted/50 rounded text-sm">
                    <div className="font-medium">{item.role}</div>
                    <div className="text-xs text-muted-foreground">Access: {item.access}</div>
                    <div className="text-xs text-muted-foreground">Actions: {item.actions}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Trail */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Audit Trail Logging
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                All sensitive actions are logged with timestamp, user, IP address, and before/after values:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {[
                  'Score creation and modifications',
                  'Calibration adjustments with justification',
                  'Status transitions (submit, approve, reject)',
                  'Form template changes',
                  'Integration rule triggers',
                  'AI-generated content acceptance/rejection',
                  'Export and reporting access'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator />

        {/* AI Services Architecture */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            AI Services Architecture
          </h3>
          <p className="text-muted-foreground mb-4">
            The Appraisals module leverages serverless edge functions for AI capabilities. All AI services 
            are designed with explainability, bias detection, and human-in-the-loop principles.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { 
                name: 'appraisal-feedback-assistant', 
                purpose: 'Generates performance feedback narratives',
                input: 'Scores, competencies, goals, historical data',
                output: 'Draft feedback text with confidence score'
              },
              { 
                name: 'calibration-ai-analyzer', 
                purpose: 'Detects anomalies and bias in rating distributions',
                input: 'Pre-calibration scores, demographics, historical trends',
                output: 'Anomaly flags, bias alerts, distribution analysis'
              },
              { 
                name: 'calibration-ai-suggester', 
                purpose: 'Recommends calibration adjustments',
                input: 'Current scores, target distribution, peer comparisons',
                output: 'Suggested adjustments with justification'
              },
              { 
                name: 'performance-comment-analyzer', 
                purpose: 'Analyzes free-text comments for sentiment and themes',
                input: 'Manager and employee comments',
                output: 'Sentiment score, key themes, actionable insights'
              },
              { 
                name: 'appraisal-integration-orchestrator', 
                purpose: 'Coordinates downstream system updates',
                input: 'Final scores, integration rules, target modules',
                output: 'Execution status, field updates, error handling'
              },
              { 
                name: 'bias-detection-service', 
                purpose: 'Monitors for demographic bias in evaluations',
                input: 'Scores segmented by protected characteristics',
                output: 'Bias risk score, affected groups, remediation suggestions'
              }
            ].map((service, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="h-4 w-4 text-blue-500" />
                  <code className="font-mono text-sm text-primary">{service.name}</code>
                </div>
                <p className="text-sm font-medium mb-2">{service.purpose}</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Input:</strong> {service.input}</p>
                  <p><strong>Output:</strong> {service.output}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
