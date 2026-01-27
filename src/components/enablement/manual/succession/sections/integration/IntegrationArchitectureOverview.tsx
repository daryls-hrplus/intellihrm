import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  ArrowRight, 
  Shield, 
  Database, 
  GitBranch,
  CheckCircle2,
  Lock,
  Zap
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout
} from '@/components/enablement/manual/components';

export function IntegrationArchitectureOverview() {
  return (
    <section id="sec-9-1" data-manual-anchor="sec-9-1" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <Network className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">9.1 Integration Architecture Overview</h3>
          <p className="text-sm text-muted-foreground">
            Event-driven topology and data flow patterns for succession module integrations
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Understand the event-driven integration architecture connecting Succession to other modules',
        'Identify inbound data flows from Performance, 360 Feedback, and Workforce',
        'Map outbound data flows to Nine-Box, IDP, L&D, and Compensation',
        'Configure consent gates and policy enforcement points'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Integration Topology
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Succession Planning operates as both a <strong>data consumer</strong> (receiving signals from Performance, 360, Workforce) 
            and a <strong>data producer</strong> (feeding Nine-Box, IDP, L&D, Compensation). The integration follows an 
            event-driven architecture where module events trigger downstream updates via configurable rules.
          </p>

          <InfoCallout>
            The integration engine uses the <code>appraisal_integration_rules</code> table to define triggers, conditions, 
            and actions. When an event fires (e.g., appraisal finalized), the orchestrator evaluates matching rules 
            and executes configured actions in priority order.
          </InfoCallout>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <ArrowRight className="h-4 w-4 text-green-600 rotate-180" />
                Inbound Data Flows (→ Succession)
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Performance</Badge>
                  <span>Appraisal scores, categories, calibration results</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">360 Feedback</Badge>
                  <span>Leadership signals, development themes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Workforce</Badge>
                  <span>Position changes, org structure, job criticality</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Competencies</Badge>
                  <span>Skill assessments, proficiency levels</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Goals</Badge>
                  <span>Achievement rates, OKR progress</span>
                </li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                Outbound Data Flows (Succession →)
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Nine-Box</Badge>
                  <span>Performance/Potential axis ratings</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">IDP</Badge>
                  <span>Gap-based development goals</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Learning</Badge>
                  <span>Training requests, course recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Compensation</Badge>
                  <span>Retention flags, merit review triggers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Notifications</Badge>
                  <span>Alerts, reminders, workflow triggers</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Event-Driven Execution Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">1</Badge>
                <div>
                  <p className="font-medium">Source Event Fires</p>
                  <p className="text-muted-foreground">e.g., <code>appraisal_finalized</code>, <code>360_cycle_completed</code>, <code>position_vacancy_created</code></p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">Orchestrator Evaluates Rules</p>
                  <p className="text-muted-foreground">Queries <code>appraisal_integration_rules</code> for matching trigger_event, evaluates conditions</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">Actions Queued by Priority</p>
                  <p className="text-muted-foreground">Matching rules sorted by execution_order, actions prepared with parameters</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">4</Badge>
                <div>
                  <p className="font-medium">Execution or Approval Queue</p>
                  <p className="text-muted-foreground">Auto-execute rules run immediately; requires_approval rules enter HR approval queue</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">5</Badge>
                <div>
                  <p className="font-medium">Audit Log Created</p>
                  <p className="text-muted-foreground">All executions logged to <code>appraisal_integration_log</code> for SOC 2 compliance</p>
                </div>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Consent Gates & Policy Enforcement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <WarningCallout>
            All cross-module data flows are governed by consent gates and policy conditions. Data only propagates 
            when explicit configuration enables integration and policy rules are satisfied. This ensures GDPR/data 
            protection compliance across all succession integrations.
          </WarningCallout>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium">Signal Generation Consent</p>
                <p className="text-sm text-muted-foreground">
                  Talent signals require explicit configuration in <code>nine_box_signal_mappings</code> with minimum confidence thresholds.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium">Approval-Required Actions</p>
                <p className="text-sm text-muted-foreground">
                  High-impact actions (Nine-Box updates, succession candidate changes) can require HR approval via <code>requires_approval</code> flag.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium">K-Anonymity for Aggregates</p>
                <p className="text-sm text-muted-foreground">
                  Organizational signal aggregates require minimum response thresholds (typically 5) to protect individual privacy.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Core Integration Tables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Rules & Configuration</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <code>appraisal_integration_rules</code> (28 fields)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <code>nine_box_rating_sources</code> (10 fields)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <code>nine_box_signal_mappings</code> (9 fields)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <code>company_transaction_workflow_settings</code>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Execution & Audit</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  <code>appraisal_integration_log</code> (21 fields)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  <code>talent_signal_snapshots</code> (22 fields)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  <code>nine_box_evidence_sources</code>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  <code>org_signal_aggregates</code> (13 fields)
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <TipCallout>
        <strong>Implementation Sequence:</strong> Configure integrations in this order: (1) Rules Engine setup, 
        (2) Performance → Nine-Box, (3) 360 → Potential signals, (4) Talent signals → Succession, 
        (5) Gaps → L&D, (6) HR Hub workflows. This ensures data dependencies are satisfied at each step.
      </TipCallout>

      <InfoCallout>
        The integration architecture follows enterprise talent management patterns for multi-source 
        data governance, ensuring enterprise-grade interoperability and data governance compliance.
      </InfoCallout>
    </section>
  );
}
