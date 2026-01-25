import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Callout, TipCallout, InfoCallout, IntegrationCallout } from '@/components/enablement/manual/components/Callout';
import { 
  Database, 
  Server, 
  Shield, 
  Brain, 
  ArrowRight,
  ArrowDown,
  Lock,
  Eye,
  FileText,
  Workflow,
  Zap,
  Link2,
  Layers,
  Box,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export function F360Architecture() {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <Database className="h-5 w-5 text-primary" />
        1.4 System Architecture
      </h3>
      
      <p className="text-muted-foreground">
        The 360 Feedback module is built on <strong>45+ database tables</strong> organized into 10 functional domains. 
        This section covers the data model, entity relationships, integration flows, and AI services architecture.
      </p>

      {/* Entity Relationship Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5 text-cyan-600" />
            Entity Relationship Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-muted/50 border font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            FEEDBACK 360 DATA MODEL                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐   │
│   │   companies      │◄──────│ feedback_360_    │──────►│   profiles       │   │
│   │                  │       │ cycles           │       │   (subjects)     │   │
│   └──────────────────┘       └────────┬─────────┘       └──────────────────┘   │
│                                       │                                         │
│           ┌───────────────────────────┼───────────────────────────┐             │
│           │                           │                           │             │
│           ▼                           ▼                           ▼             │
│   ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐   │
│   │ feedback_360_    │       │ feedback_360_    │       │ peer_nominations │   │
│   │ rater_categories │       │ questions        │       │                  │   │
│   └────────┬─────────┘       └──────────────────┘       └──────────────────┘   │
│            │                                                                    │
│            ▼                                                                    │
│   ┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐   │
│   │ feedback_360_    │──────►│ feedback_360_    │──────►│ talent_signal_   │   │
│   │ requests         │       │ responses        │       │ snapshots        │   │
│   └──────────────────┘       └──────────────────┘       └──────────────────┘   │
│                                       │                                         │
│                                       ▼                                         │
│                              ┌──────────────────┐       ┌──────────────────┐   │
│                              │ development_     │──────►│ appraisal_       │   │
│                              │ themes           │       │ participants     │   │
│                              └──────────────────┘       └──────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Core Tables Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Box className="h-5 w-5" />
            Database Tables by Domain
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cycle Management */}
            <div className="p-3 rounded-lg border bg-cyan-500/5 min-w-0">
              <h4 className="font-semibold text-sm text-cyan-700 mb-2">Cycle Management</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li><code className="break-all">feedback_360_cycles</code></li>
                <li><code className="break-all">review_cycles</code></li>
                <li><code className="break-all">review_participants</code></li>
                <li><code className="break-all">feedback_submissions</code></li>
              </ul>
            </div>
            
            {/* Raters & Nominations */}
            <div className="p-3 rounded-lg border bg-emerald-500/5 min-w-0">
              <h4 className="font-semibold text-sm text-emerald-700 mb-2">Raters & Nominations</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li><code className="break-all">feedback_360_rater_categories</code></li>
                <li><code className="break-all">feedback_360_requests</code></li>
                <li><code className="break-all">peer_nominations</code></li>
                <li><code className="break-all">rater_relationships</code></li>
                <li><code className="break-all">rater_exceptions</code></li>
              </ul>
            </div>
            
            {/* Questions & Responses */}
            <div className="p-3 rounded-lg border bg-violet-500/5 min-w-0">
              <h4 className="font-semibold text-sm text-violet-700 mb-2">Questions & Responses</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li><code className="break-all">feedback_360_questions</code></li>
                <li><code className="break-all">feedback_360_responses</code></li>
                <li><code className="break-all">feedback_question_categories</code></li>
                <li><code className="break-all">feedback_frameworks</code></li>
              </ul>
            </div>
            
            {/* Governance */}
            <div className="p-3 rounded-lg border bg-rose-500/5 min-w-0">
              <h4 className="font-semibold text-sm text-rose-700 mb-2">Governance</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li><code className="break-all">feedback_consent_records</code></li>
                <li><code className="break-all">feedback_data_policies</code></li>
                <li><code className="break-all">feedback_investigation_requests</code></li>
                <li><code className="break-all">feedback_investigation_access_log</code></li>
                <li><code className="break-all">feedback_exceptions</code></li>
              </ul>
            </div>
            
            {/* AI & Signals */}
            <div className="p-3 rounded-lg border bg-amber-500/5 min-w-0">
              <h4 className="font-semibold text-sm text-amber-700 mb-2">AI & Signals</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li><code className="break-all">talent_signal_definitions</code></li>
                <li><code className="break-all">talent_signal_snapshots</code></li>
                <li><code className="break-all">development_themes</code></li>
                <li><code className="break-all">feedback_writing_quality</code></li>
                <li><code className="break-all">feedback_writing_suggestions</code></li>
                <li><code className="break-all">feedback_ai_action_logs</code></li>
              </ul>
            </div>
            
            {/* Reports & Templates */}
            <div className="p-3 rounded-lg border bg-blue-500/5 min-w-0">
              <h4 className="font-semibold text-sm text-blue-700 mb-2">Reports & Templates</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li><code className="break-all">feedback_report_templates</code></li>
                <li><code className="break-all">feedback_report_sections</code></li>
                <li><code className="break-all">nine_box_signal_mappings</code></li>
              </ul>
            </div>
            
            {/* Integration */}
            <div className="p-3 rounded-lg border bg-indigo-500/5 min-w-0">
              <h4 className="font-semibold text-sm text-indigo-700 mb-2">Integration</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li><code className="break-all">appraisal_360_scores</code></li>
                <li><code className="break-all">appraisal_participants</code></li>
                <li><code className="break-all">continuous_feedback</code></li>
                <li><code className="break-all">idp_recommendations</code></li>
              </ul>
            </div>
            
            {/* Notifications & Reminders */}
            <div className="p-3 rounded-lg border bg-orange-500/5 min-w-0">
              <h4 className="font-semibold text-sm text-orange-700 mb-2 whitespace-nowrap">Notifications & Reminders</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li><code className="break-all">reminder_event_types</code></li>
                <li><code className="break-all">reminder_rules</code></li>
                <li><code className="break-all">employee_reminders</code></li>
                <li><code className="break-all">reminder_delivery_log</code></li>
                <li><code className="break-all">employee_reminder_preferences</code></li>
              </ul>
            </div>
            
            {/* Workflows */}
            <div className="p-3 rounded-lg border bg-teal-500/5 min-w-0">
              <h4 className="font-semibold text-sm text-teal-700 mb-2">Workflows</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li><code className="break-all">workflow_templates</code></li>
                <li><code className="break-all">workflow_steps</code></li>
                <li><code className="break-all">workflow_instances</code></li>
                <li><code className="break-all">workflow_step_actions</code></li>
                <li><code className="break-all">workflow_audit_events</code></li>
              </ul>
            </div>
            
            {/* Audit & Logging */}
            <div className="p-3 rounded-lg border bg-slate-500/5 min-w-0">
              <h4 className="font-semibold text-sm text-slate-700 mb-2">Audit & Logging</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li><code className="break-all">audit_logs</code></li>
                <li><code className="break-all">notification_logs</code></li>
                <li><code className="break-all">feedback_ai_action_logs</code></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Table Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Key Table Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* feedback_360_cycles */}
          <div className="p-4 rounded-lg border bg-muted/30">
            <h4 className="font-semibold text-sm mb-2">
              <code className="bg-cyan-500/10 text-cyan-700 px-2 py-0.5 rounded">feedback_360_cycles</code>
              <Badge variant="outline" className="ml-2">40+ columns</Badge>
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              Central configuration table for 360 feedback cycles.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-medium mb-1">Core Fields:</p>
                <ul className="text-muted-foreground space-y-0.5">
                  <li>• <code>id</code>, <code>company_id</code>, <code>name</code></li>
                  <li>• <code>start_date</code>, <code>end_date</code>, <code>status</code></li>
                  <li>• <code>nomination_start_date</code>, <code>nomination_end_date</code></li>
                  <li>• <code>response_deadline</code></li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Configuration Fields:</p>
                <ul className="text-muted-foreground space-y-0.5">
                  <li>• <code>allow_self_rating</code>, <code>allow_peer_nomination</code></li>
                  <li>• <code>allow_external_raters</code></li>
                  <li>• <code>min_peers</code>, <code>max_peers</code></li>
                  <li>• <code>anonymity_threshold</code></li>
                </ul>
              </div>
            </div>
          </div>

          {/* feedback_360_requests */}
          <div className="p-4 rounded-lg border bg-muted/30">
            <h4 className="font-semibold text-sm mb-2">
              <code className="bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded">feedback_360_requests</code>
              <Badge variant="outline" className="ml-2">12+ columns</Badge>
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              Individual rater assignments linking raters to subjects within a cycle.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-medium mb-1">Core Fields:</p>
                <ul className="text-muted-foreground space-y-0.5">
                  <li>• <code>id</code>, <code>cycle_id</code>, <code>participant_id</code></li>
                  <li>• <code>subject_employee_id</code>, <code>rater_id</code></li>
                  <li>• <code>rater_category_id</code></li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Status Fields:</p>
                <ul className="text-muted-foreground space-y-0.5">
                  <li>• <code>status</code>: pending, accepted, in_progress, completed, declined</li>
                  <li>• <code>sent_at</code>, <code>submitted_at</code></li>
                  <li>• <code>reminder_count</code></li>
                </ul>
              </div>
            </div>
          </div>

          {/* feedback_360_responses */}
          <div className="p-4 rounded-lg border bg-muted/30">
            <h4 className="font-semibold text-sm mb-2">
              <code className="bg-violet-500/10 text-violet-700 px-2 py-0.5 rounded">feedback_360_responses</code>
              <Badge variant="outline" className="ml-2">10+ columns</Badge>
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              Individual question responses within a feedback request.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-medium mb-1">Core Fields:</p>
                <ul className="text-muted-foreground space-y-0.5">
                  <li>• <code>id</code>, <code>request_id</code>, <code>question_id</code></li>
                  <li>• <code>rating_value</code> (numeric scale)</li>
                  <li>• <code>text_response</code> (open-ended)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Extended Fields:</p>
                <ul className="text-muted-foreground space-y-0.5">
                  <li>• <code>selected_choices</code> (multi-select JSON)</li>
                  <li>• <code>created_at</code>, <code>updated_at</code></li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Data Flow Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Upstream */}
            <div className="p-4 rounded-lg border bg-blue-500/5">
              <h4 className="font-semibold text-sm text-blue-700 mb-3 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Upstream Data Sources
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <Box className="h-3 w-3" />
                  <span>Competency Framework</span>
                </li>
                <li className="flex items-center gap-2">
                  <Box className="h-3 w-3" />
                  <span>Job Profiles & Families</span>
                </li>
                <li className="flex items-center gap-2">
                  <Box className="h-3 w-3" />
                  <span>Employee Master Data</span>
                </li>
                <li className="flex items-center gap-2">
                  <Box className="h-3 w-3" />
                  <span>Org Hierarchy</span>
                </li>
              </ul>
            </div>

            {/* Core Module */}
            <div className="p-4 rounded-lg border-2 border-primary/50 bg-primary/5">
              <h4 className="font-semibold text-sm text-primary mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                360 Feedback Module
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>Cycle Configuration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>Feedback Collection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>AI Signal Processing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>Report Generation</span>
                </li>
              </ul>
            </div>

            {/* Downstream */}
            <div className="p-4 rounded-lg border bg-emerald-500/5">
              <h4 className="font-semibold text-sm text-emerald-700 mb-3 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Downstream Consumers
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <Link2 className="h-3 w-3" />
                  <span>Appraisals (CRGV 360 component)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Link2 className="h-3 w-3" />
                  <span>Nine-Box / Succession</span>
                </li>
                <li className="flex items-center gap-2">
                  <Link2 className="h-3 w-3" />
                  <span>Individual Development Plans</span>
                </li>
                <li className="flex items-center gap-2">
                  <Link2 className="h-3 w-3" />
                  <span>Learning Recommendations</span>
                </li>
              </ul>
            </div>
          </div>

          <IntegrationCallout title="Appraisal Integration">
            The 360 score feeds into the CRGV model's "Values" component. The <code>appraisal_360_scores</code> table 
            links participant records to their computed 360 scores with normalization metadata.
          </IntegrationCallout>
        </CardContent>
      </Card>

      {/* Lifecycle States */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Cycle Lifecycle States
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 justify-center py-4">
            {[
              { status: 'draft', color: 'bg-slate-500', desc: 'Initial configuration' },
              { status: 'active', color: 'bg-blue-500', desc: 'Cycle launched' },
              { status: 'nominations', color: 'bg-violet-500', desc: 'Peer nomination period' },
              { status: 'collection', color: 'bg-amber-500', desc: 'Feedback being collected' },
              { status: 'processing', color: 'bg-cyan-500', desc: 'AI signal processing' },
              { status: 'review', color: 'bg-purple-500', desc: 'HR review/calibration' },
              { status: 'released', color: 'bg-emerald-500', desc: 'Results visible' },
              { status: 'closed', color: 'bg-slate-600', desc: 'Cycle archived' },
            ].map((state, index) => (
              <div key={state.status} className="flex items-center gap-2">
                <div className="text-center">
                  <Badge className={`${state.color} text-white`}>
                    {state.status.toUpperCase()}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{state.desc}</p>
                </div>
                {index < 7 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Model */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-rose-600" />
            Security Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Lock className="h-4 w-4 text-rose-600" />
                Role-Based Access Control
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• ESS: Own data only</li>
                <li>• MSS: Team scope</li>
                <li>• HR: Full module access</li>
                <li>• Admin: Configuration access</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Database className="h-4 w-4 text-rose-600" />
                Row-Level Security
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Company isolation enforced</li>
                <li>• Subject cannot see rater IDs</li>
                <li>• Anonymous responses protected</li>
                <li>• Investigation access logged</li>
              </ul>
            </div>
            
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4 text-rose-600" />
                Audit Trail
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• All CRUD operations logged</li>
                <li>• Results access tracked</li>
                <li>• Investigation requests audited</li>
                <li>• AI decisions recorded</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Services Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-violet-600" />
            AI Services Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The 360 Feedback module leverages multiple AI edge functions for automated processing, 
            quality analysis, and insight generation.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-violet-500/5">
              <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-violet-600" />
                feedback-signal-processor
              </h4>
              <p className="text-xs text-muted-foreground">
                Extracts talent signals from aggregated feedback data. Computes leadership potential, 
                collaboration scores, and technical depth indicators.
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-emerald-500/5">
              <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-emerald-600" />
                development-theme-generator
              </h4>
              <p className="text-xs text-muted-foreground">
                Analyzes feedback patterns to identify recurring development themes. Generates 
                actionable recommendations linked to competency gaps.
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-amber-500/5">
              <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-600" />
                feedback-writing-analyzer
              </h4>
              <p className="text-xs text-muted-foreground">
                Scores written feedback for quality, specificity, and constructiveness. Provides 
                real-time suggestions to improve response quality.
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-rose-500/5">
              <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-rose-600" />
                feedback-bias-detector
              </h4>
              <p className="text-xs text-muted-foreground">
                Scans for potential bias patterns in aggregated responses. Flags statistical 
                anomalies for HR review before results release.
              </p>
            </div>
          </div>

          <TipCallout title="AI Explainability">
            All AI decisions are logged to <code>feedback_ai_action_logs</code> with confidence scores, 
            source data references, and model version metadata for governance compliance.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Section Footer */}
      <div className="flex items-center justify-end text-sm text-muted-foreground border-t pt-4">
        <Badge variant="outline">Section 1.4 of 1.5</Badge>
      </div>
    </div>
  );
}
