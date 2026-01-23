import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, GitBranch, Users, Link2, Calculator, Brain, Calendar, Zap, Scale, Target, TrendingUp, FileText, Workflow, Shield } from 'lucide-react';

export function ManualDiagrams() {
  return (
    <div id="diagrams" data-manual-anchor="diagrams" className="space-y-8 scroll-mt-32">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">Architecture Diagrams</h2>
        <p className="text-muted-foreground">14 visual representations of system architecture and flows</p>
      </div>

      {/* Complete Data Architecture */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <CardTitle>Complete Data Architecture</CardTitle>
          </div>
          <CardDescription>40+ appraisal tables organized by domain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              CORE APPRAISAL TABLES (14)                                          │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  appraisal_cycles, appraisal_participants, appraisal_scores, appraisal_score_breakdown,         │
│  appraisal_value_scores, appraisal_form_templates, appraisal_rating_scales,                     │
│  appraisal_position_weights, appraisal_role_segments, appraisal_interviews,                     │
│  appraisal_strengths_gaps, ai_generated_narratives, appraisal_outcome_action_rules,             │
│  appraisal_action_executions                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│                              CALIBRATION TABLES (8)                                              │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  calibration_sessions, calibration_participants, calibration_adjustments,                        │
│  calibration_ai_analyses, calibration_governance_rules, calibration_override_audit,             │
│  manager_calibration_alignment, calibration_notes                                                │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│                              NINE-BOX & POTENTIAL (8)                                            │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  nine_box_assessments, nine_box_rating_sources, nine_box_signal_mappings,                       │
│  nine_box_evidence_sources, potential_assessment_templates, potential_assessment_questions,     │
│  potential_assessments, potential_assessment_responses                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│                              AI & BIAS DETECTION (8)                                             │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ai_explainability_logs, ai_human_overrides, manager_bias_patterns, bias_nudge_templates,       │
│  ai_bias_incidents, feedback_ai_action_logs, ai_governance_metrics, ai_guardrails_config        │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│                              PERFORMANCE ANALYTICS (5)                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  employee_performance_risks, performance_trajectory, performance_trajectory_scores,             │
│  employee_performance_index, performance_index_settings                                          │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│                              REPORTING & BI (7)                                                  │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  report_templates, report_template_bands, report_data_sources, saved_report_configs,            │
│  scheduled_org_reports, bi_dashboards, bi_dashboard_shares                                       │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│                              INTEGRATION & WORKFLOW (5)                                          │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  appraisal_integration_rules, appraisal_integration_log, workflow_instances,                    │
│  workflow_step_actions, workflow_audit_events                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Calibration Session Architecture - NEW */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <CardTitle>Calibration Session Architecture</CardTitle>
            <Badge variant="secondary">NEW</Badge>
          </div>
          <CardDescription>Calibration data flow with governance and audit tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────┐
│                     CALIBRATION SESSION ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐     ┌──────────────────┐                              │
│  │ calibration_     │────▶│ calibration_     │                              │
│  │ sessions         │     │ participants     │                              │
│  └──────────────────┘     └────────┬─────────┘                              │
│                                    │                                         │
│         ┌──────────────────────────┼──────────────────────────┐             │
│         ▼                          ▼                          ▼             │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     │
│  │ calibration_     │     │ calibration_     │     │ calibration_     │     │
│  │ adjustments      │     │ ai_analyses      │     │ governance_rules │     │
│  └────────┬─────────┘     └──────────────────┘     └────────┬─────────┘     │
│           │                                                  │              │
│           ▼                                                  ▼              │
│  ┌──────────────────┐                             ┌──────────────────┐      │
│  │ calibration_     │                             │ manager_         │      │
│  │ override_audit   │                             │ calibration_     │      │
│  │ (EEOC Compliance)│                             │ alignment        │      │
│  └──────────────────┘                             └──────────────────┘      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Nine-Box & Potential Assessment Architecture - NEW */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Nine-Box & Potential Assessment</CardTitle>
            <Badge variant="secondary">NEW</Badge>
          </div>
          <CardDescription>Potential assessments feeding into Nine-Box placement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────┐
│                   NINE-BOX & POTENTIAL ASSESSMENT                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  POTENTIAL AXIS                           PERFORMANCE AXIS                   │
│  ┌────────────────────┐                  ┌────────────────────┐             │
│  │ potential_         │                  │ appraisal_scores   │             │
│  │ assessment_        │                  │ (post_calibration) │             │
│  │ templates          │                  └──────────┬─────────┘             │
│  └────────┬───────────┘                             │                       │
│           │                                         │                       │
│           ▼                                         │                       │
│  ┌────────────────────┐                             │                       │
│  │ potential_         │         ┌───────────────────┘                       │
│  │ assessment_        │         │                                           │
│  │ questions          │         │    ┌──────────────────────────┐          │
│  └────────┬───────────┘         │    │ nine_box_rating_sources  │          │
│           │                     │    │ (weights per source)     │          │
│           ▼                     │    └────────────┬─────────────┘          │
│  ┌────────────────────┐         │                 │                         │
│  │ potential_         │─────────┼─────────────────┘                         │
│  │ assessments        │         │                                           │
│  └────────────────────┘         │                                           │
│                                 ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    nine_box_assessments                              │   │
│  │  (performance_score, potential_score, quadrant, box_number)          │   │
│  └────────────────────────────────────────────────────────────────────────┤ │
│                                    │                                       │ │
│         ┌──────────────────────────┼──────────────────────────┐           │ │
│         ▼                          ▼                          ▼           │ │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐   │ │
│  │ signal_mappings  │     │ evidence_sources │     │ Succession       │   │ │
│  └──────────────────┘     └──────────────────┘     └──────────────────┘   │ │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* AI Bias Detection & Governance - NEW */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>AI Bias Detection & Governance</CardTitle>
            <Badge variant="secondary">NEW</Badge>
          </div>
          <CardDescription>Bias detection with ISO 42001 compliance and human oversight</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────┐
│                   AI BIAS DETECTION & GOVERNANCE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐                                                       │
│  │ Manager Feedback │                                                       │
│  │ (text input)     │                                                       │
│  └────────┬─────────┘                                                       │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────┐               │
│  │                    AI BIAS ANALYSIS                       │               │
│  │  • Recency bias     • Halo/horns effect                  │               │
│  │  • Gender bias      • Attribution error                   │               │
│  │  • Central tendency • Leniency/severity                   │               │
│  └────────┬───────────────────────────────┬─────────────────┘               │
│           │                               │                                  │
│           ▼                               ▼                                  │
│  ┌──────────────────┐           ┌──────────────────┐                        │
│  │ bias_nudge_      │           │ ai_explainability│                        │
│  │ templates        │           │ _logs            │                        │
│  └────────┬─────────┘           └──────────────────┘                        │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐                              │
│  │ Real-time Nudge  │────▶│ manager_bias_    │                              │
│  │ to Manager       │     │ patterns         │                              │
│  └────────┬─────────┘     └────────┬─────────┘                              │
│           │                        │                                         │
│           ▼                        ▼                                         │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     │
│  │ ai_human_        │     │ ai_bias_         │     │ HR Intervention  │     │
│  │ overrides        │     │ incidents        │     │ Workflow         │     │
│  └──────────────────┘     └──────────────────┘     └──────────────────┘     │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ ISO 42001 COMPLIANCE: All AI decisions logged with explainability   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Performance Risk & Trajectory - NEW */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Performance Risk & Trajectory Pipeline</CardTitle>
            <Badge variant="secondary">NEW</Badge>
          </div>
          <CardDescription>Predictive analytics and risk detection architecture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────┐
│                 PERFORMANCE RISK & TRAJECTORY PIPELINE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  HISTORICAL DATA                         RISK DETECTION                      │
│  ┌────────────────────┐                 ┌────────────────────┐              │
│  │ appraisal_scores   │                 │ AI Risk Analysis   │              │
│  │ (multi-cycle)      │────────────────▶│ • Declining trend  │              │
│  └────────────────────┘                 │ • Toxic performer  │              │
│                                         │ • Skills decay     │              │
│  ┌────────────────────┐                 │ • Disengagement    │              │
│  │ performance_index  │                 └──────────┬─────────┘              │
│  │ _settings          │                            │                        │
│  └────────┬───────────┘                            │                        │
│           │                                        ▼                        │
│           ▼                             ┌────────────────────┐              │
│  ┌────────────────────┐                 │ employee_          │              │
│  │ employee_          │                 │ performance_risks  │              │
│  │ performance_index  │                 │ (risk_type,        │              │
│  │ (12/24/36 month)   │                 │ confidence,        │              │
│  └────────────────────┘                 │ intervention)      │              │
│                                         └──────────┬─────────┘              │
│  TRAJECTORY PREDICTION                             │                        │
│  ┌────────────────────┐                            ▼                        │
│  │ performance_       │                 ┌────────────────────┐              │
│  │ trajectory         │────────────────▶│ Manager Dashboard  │              │
│  │ (3/6/12 mo pred.)  │                 │ • Risk alerts      │              │
│  └────────┬───────────┘                 │ • Intervention     │              │
│           │                             │ • Coaching nudges  │              │
│           ▼                             └────────────────────┘              │
│  ┌────────────────────┐                                                     │
│  │ performance_       │                                                     │
│  │ trajectory_scores  │                                                     │
│  └────────────────────┘                                                     │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Report Builder & BI Architecture - NEW */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Report Builder & BI Architecture</CardTitle>
            <Badge variant="secondary">NEW</Badge>
          </div>
          <CardDescription>Report templates, scheduling, and BI dashboard structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────┐
│                     REPORT BUILDER & BI ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  REPORT TEMPLATES                           BI DASHBOARDS                    │
│  ┌────────────────────┐                    ┌────────────────────┐           │
│  │ report_templates   │                    │ bi_dashboards      │           │
│  │ (name, category,   │                    │ (name, widgets[],  │           │
│  │ parameters[])      │                    │ is_shared)         │           │
│  └────────┬───────────┘                    └────────┬───────────┘           │
│           │                                         │                       │
│           ▼                                         ▼                       │
│  ┌────────────────────┐                    ┌────────────────────┐           │
│  │ report_template_   │                    │ bi_dashboard_      │           │
│  │ bands              │                    │ shares             │           │
│  │ (header, detail,   │                    │ (role sharing)     │           │
│  │ group, footer)     │                    └────────────────────┘           │
│  └────────┬───────────┘                                                     │
│           │                                                                  │
│           ▼                                                                  │
│  ┌────────────────────┐                                                     │
│  │ report_data_       │                                                     │
│  │ sources            │                                                     │
│  │ (table, joins,     │                                                     │
│  │ aggregations)      │                                                     │
│  └────────┬───────────┘                                                     │
│           │                                                                  │
│           ▼                                                                  │
│  ┌────────────────────┐         ┌────────────────────┐                      │
│  │ saved_report_      │────────▶│ scheduled_org_     │                      │
│  │ configs            │         │ reports            │                      │
│  │ (user preferences) │         │ (cron, recipients) │                      │
│  └────────────────────┘         └────────┬───────────┘                      │
│                                          │                                   │
│                                          ▼                                   │
│                                 ┌────────────────────┐                      │
│                                 │ Generated Reports  │                      │
│                                 │ (PDF, Excel, CSV)  │                      │
│                                 └────────────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Integration Architecture - NEW */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            <CardTitle>Workflow Integration Architecture</CardTitle>
            <Badge variant="secondary">NEW</Badge>
          </div>
          <CardDescription>Appraisal-triggered workflow execution and monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW INTEGRATION ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TRIGGER                                                                     │
│  ┌────────────────────┐                                                     │
│  │ Appraisal Event    │                                                     │
│  │ (finalization,     │                                                     │
│  │ low score, etc.)   │                                                     │
│  └────────┬───────────┘                                                     │
│           │                                                                  │
│           ▼                                                                  │
│  ┌────────────────────┐         ┌────────────────────┐                      │
│  │ appraisal_         │────────▶│ appraisal_         │                      │
│  │ integration_rules  │         │ integration_log    │                      │
│  │ (conditions,       │         │ (execution status, │                      │
│  │ target module)     │         │ error details)     │                      │
│  └────────┬───────────┘         └────────────────────┘                      │
│           │                                                                  │
│           ▼                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      workflow_instances                              │   │
│  │  (workflow_type, current_step, status, sla_deadline)                 │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│         ┌──────────────────────────┼──────────────────────────┐             │
│         ▼                          ▼                          ▼             │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     │
│  │ workflow_step_   │     │ workflow_audit_  │     │ workflow_        │     │
│  │ actions          │     │ events           │     │ delegates        │     │
│  └──────────────────┘     └──────────────────┘     └──────────────────┘     │
│                                                                              │
│  TARGET MODULES                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  IDP  │  PIP  │  Succession  │  Compensation  │  Learning  │ Nine-Box │ │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
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
