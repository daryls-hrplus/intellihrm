import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  ArrowRight, 
  Shield, 
  Database, 
  GitBranch,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  WarningCallout,
  TipCallout
} from '@/components/enablement/manual/components';

export function LndIntegrationArchitecture() {
  return (
    <section id="sec-8-1" data-manual-anchor="sec-8-1" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Network className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">8.1 Integration Architecture Overview</h3>
          <p className="text-sm text-muted-foreground">
            Event-driven integration model connecting L&D to HR lifecycle modules
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Understand the event-driven integration architecture connecting L&D to other HR modules',
        'Identify inbound data flows from Onboarding, Performance, and Succession',
        'Map outbound data flows to Competencies, Career Development, and Notifications',
        'Configure audit trail via appraisal_integration_log for SOC 2 compliance'
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
            The L&D module operates as both a <strong>data consumer</strong> (receiving triggers from Onboarding, 
            Performance, Succession) and a <strong>data producer</strong> (feeding Competencies, Career Paths, 
            Notifications). The integration follows an event-driven architecture where module events trigger 
            downstream training actions via configurable rules.
          </p>

          <InfoCallout>
            The integration engine uses the <code>appraisal_integration_rules</code> table to define triggers, 
            conditions, and actions. For L&D-specific rules, set <code>target_module = 'training'</code>. 
            Full rules engine documentation is in the Succession Manual, Chapter 9.
          </InfoCallout>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <ArrowRight className="h-4 w-4 text-green-600 rotate-180" />
                Inbound Triggers (→ L&D)
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Onboarding</Badge>
                  <span>New hire task completion → auto-enrollment</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Performance</Badge>
                  <span>Appraisal finalized → training recommendation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Competency</Badge>
                  <span>Skill gap detected → course suggestion</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Succession</Badge>
                  <span>Readiness gap → development path enrollment</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Recertification</Badge>
                  <span>Certificate expiring → auto-request</span>
                </li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                Outbound Data Flows (L&D →)
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Competencies</Badge>
                  <span>Course completion → skill level update</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Career Paths</Badge>
                  <span>Learning path completion → progression unlock</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Succession</Badge>
                  <span>Development activity → readiness update</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Notifications</Badge>
                  <span>Enrollment, overdue, completion alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Workflow</Badge>
                  <span>Training requests → approval routing</span>
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
                  <p className="text-muted-foreground">e.g., <code>appraisal_finalized</code>, <code>onboarding_task_completed</code>, <code>certificate_expiring</code></p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">2</Badge>
                <div>
                  <p className="font-medium">Orchestrator Evaluates Rules</p>
                  <p className="text-muted-foreground">Queries <code>appraisal_integration_rules</code> for target_module='training', evaluates conditions</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">3</Badge>
                <div>
                  <p className="font-medium">Training Action Executed</p>
                  <p className="text-muted-foreground">Creates enrollment, training request, or recommendation based on action_type</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Badge className="mt-0.5">4</Badge>
                <div>
                  <p className="font-medium">Audit Log Created</p>
                  <p className="text-muted-foreground">All executions logged to <code>appraisal_integration_log</code> for compliance</p>
                </div>
              </li>
            </ol>
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
                  <code>appraisal_integration_rules</code>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <code>competency_course_mappings</code>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <code>workflow_templates</code> (training category)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <code>reminder_event_types</code>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Execution & Audit</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  <code>appraisal_integration_log</code>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  <code>training_requests</code>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  <code>lms_enrollments</code>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  <code>workflow_instances</code>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <WarningCallout>
        All cross-module data flows are governed by the rules engine configuration. Ensure rules 
        are tested in a non-production environment before enabling <code>auto_execute = true</code>.
      </WarningCallout>

      <TipCallout>
        <strong>Implementation Sequence:</strong> Configure integrations in this order: (1) Onboarding, 
        (2) Performance/Appraisal, (3) Competency sync, (4) Workflows, (5) Notifications. 
        This ensures data dependencies are satisfied at each step.
      </TipCallout>

      <InfoCallout>
        For the complete integration rules engine specification, refer to the <strong>Succession Planning 
        Administrator Manual, Chapter 9.2</strong>, which documents the full <code>appraisal_integration_rules</code> 
        table schema and action configuration patterns.
      </InfoCallout>
    </section>
  );
}
