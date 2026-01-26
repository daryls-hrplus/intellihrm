// Section 4.1: Readiness Assessment Overview
// Lifecycle, roles, strategic value, cross-module integration

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  IndustryCallout,
  IntegrationCallout,
  FeatureCardGrid,
  PrimaryFeatureCard,
  SuccessFeatureCard,
  InfoFeatureCard,
} from '../../../components';
import { 
  ClipboardCheck, 
  Users, 
  ArrowRight, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  UserCheck,
  FileCheck,
  Target,
  Workflow
} from 'lucide-react';

export function ReadinessOverview() {
  return (
    <div className="space-y-8">
      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Understand the operational distinction between Chapter 2 (Configuration) and Chapter 4 (Workflow)",
          "Master the three-stage assessment lifecycle: Initiated → In Progress → Completed",
          "Identify the roles and responsibilities in multi-assessor readiness evaluation",
          "Recognize how readiness assessments integrate with succession planning and candidate profiles"
        ]}
      />

      {/* Navigation Path */}
      <InfoCallout title="Navigation Path">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          Performance → Succession → Assessments → [View/Initiate]
        </code>
      </InfoCallout>

      {/* Chapter Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Chapter Overview: Configuration vs. Operations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Readiness Assessment system is documented across two chapters to separate 
            <strong> one-time configuration</strong> from <strong>ongoing operations</strong>:
          </p>

          <FeatureCardGrid columns={2}>
            <InfoFeatureCard
              icon={Target}
              title="Chapter 2: Foundation Setup"
              description="Configure the assessment infrastructure: rating bands, indicators, BARS scales, forms, categories, assessor types, and weights. This is done once during implementation."
            />
            <PrimaryFeatureCard
              icon={Workflow}
              title="Chapter 4: Workflow Operations"
              description="Execute assessments in production: initiate events, assign forms, collect ratings from multiple assessors, calculate scores, and update candidate profiles."
            />
          </FeatureCardGrid>

          <IndustryCallout>
            <strong>Industry Standard:</strong> SAP SuccessFactors and Workday both separate 
            "Succession Plan Setup" from "Succession Plan Execution" in their documentation. 
            This pattern ensures administrators understand what to configure vs. what HR Partners 
            and Managers execute daily.
          </IndustryCallout>
        </CardContent>
      </Card>

      {/* Assessment Lifecycle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Assessment Event Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Each readiness assessment follows a three-stage lifecycle tracked in the 
            <code className="mx-1 text-xs bg-muted px-1.5 py-0.5 rounded">readiness_assessment_events</code> table:
          </p>

          {/* Lifecycle Diagram */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded-lg px-4 py-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <Badge className="bg-amber-600 text-xs">1. Pending</Badge>
                  <p className="text-xs text-muted-foreground mt-1">Event created, awaiting assessments</p>
                </div>
              </div>
              
              <ArrowRight className="h-5 w-5 text-muted-foreground hidden sm:block" />
              
              <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/40 rounded-lg px-4 py-3">
                <UserCheck className="h-5 w-5 text-blue-600" />
                <div>
                  <Badge className="bg-blue-600 text-xs">2. In Progress</Badge>
                  <p className="text-xs text-muted-foreground mt-1">At least one response submitted</p>
                </div>
              </div>
              
              <ArrowRight className="h-5 w-5 text-muted-foreground hidden sm:block" />
              
              <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg px-4 py-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div>
                  <Badge className="bg-emerald-600 text-xs">3. Completed</Badge>
                  <p className="text-xs text-muted-foreground mt-1">All required assessors finished</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Definitions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Trigger</th>
                  <th className="text-left py-3 px-4 font-medium">Allowed Actions</th>
                  <th className="text-left py-3 px-4 font-medium">Candidate Update</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-amber-600">pending</Badge>
                  </td>
                  <td className="py-3 px-4">Event created by HR</td>
                  <td className="py-3 px-4">Submit responses, edit event, cancel event</td>
                  <td className="py-3 px-4">No updates</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-blue-600">in_progress</Badge>
                  </td>
                  <td className="py-3 px-4">First response submitted</td>
                  <td className="py-3 px-4">Continue submitting, view partial scores</td>
                  <td className="py-3 px-4">No updates</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-600">completed</Badge>
                  </td>
                  <td className="py-3 px-4">All required assessors finish</td>
                  <td className="py-3 px-4">View final score, generate report</td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-600 font-medium">Score & Band Updated</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Role Responsibilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Role Responsibilities Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Readiness assessments involve multiple stakeholders with distinct responsibilities:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Role</th>
                  <th className="text-left py-3 px-4 font-medium">Initiate</th>
                  <th className="text-left py-3 px-4 font-medium">Assess</th>
                  <th className="text-left py-3 px-4 font-medium">Review</th>
                  <th className="text-left py-3 px-4 font-medium">Override</th>
                  <th className="text-left py-3 px-4 font-medium">Finalize</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">HR Partner</td>
                  <td className="py-3 px-4"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Direct Manager</td>
                  <td className="py-3 px-4">—</td>
                  <td className="py-3 px-4"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></td>
                  <td className="py-3 px-4">—</td>
                  <td className="py-3 px-4">—</td>
                  <td className="py-3 px-4">—</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Executive</td>
                  <td className="py-3 px-4">—</td>
                  <td className="py-3 px-4"><CheckCircle2 className="h-4 w-4 text-muted-foreground" /></td>
                  <td className="py-3 px-4"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></td>
                  <td className="py-3 px-4"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></td>
                  <td className="py-3 px-4">—</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Skip-Level Manager</td>
                  <td className="py-3 px-4">—</td>
                  <td className="py-3 px-4"><CheckCircle2 className="h-4 w-4 text-muted-foreground" /></td>
                  <td className="py-3 px-4">—</td>
                  <td className="py-3 px-4">—</td>
                  <td className="py-3 px-4">—</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>Required/Primary</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
              <span>Optional (if enabled)</span>
            </div>
            <div className="flex items-center gap-1">
              <span>—</span>
              <span>Not applicable</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Value */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Strategic Value of Multi-Assessor Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FeatureCardGrid columns={3}>
            <SuccessFeatureCard
              icon={Users}
              title="Multi-Perspective Validation"
              description="Ratings from managers, HR, and executives reduce individual bias and provide a holistic view of candidate readiness."
            />
            <PrimaryFeatureCard
              icon={FileCheck}
              title="Audit-Ready Documentation"
              description="Every response is timestamped with assessor attribution, creating a defensible record for succession decisions."
            />
            <InfoFeatureCard
              icon={ClipboardCheck}
              title="Candidate Profile Integration"
              description="Completed assessments automatically update succession candidate records with latest scores and bands."
            />
          </FeatureCardGrid>

          <IndustryCallout>
            <strong>SHRM Research:</strong> Organizations using multi-rater readiness assessments 
            report 35% higher accuracy in identifying succession-ready candidates compared to 
            single-assessor methods.
          </IndustryCallout>
        </CardContent>
      </Card>

      {/* Cross-Module Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Cross-Module Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Readiness assessments connect to multiple modules in the succession ecosystem:
          </p>

          {/* Data Flow Diagram */}
          <div className="p-4 bg-muted/30 rounded-lg font-mono text-xs">
            <pre className="whitespace-pre-wrap">
{`┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Succession      │───►│  Assessment      │───►│  Succession      │
│  Plans           │    │  Event           │    │  Candidates      │
│  (Nominates)     │    │  (Initiated)     │    │  (Updated)       │
└──────────────────┘    └──────────────────┘    └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Assessment      │
                        │  Responses       │
                        │  (Multi-Rater)   │
                        └──────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       ┌──────────┐     ┌──────────┐     ┌──────────┐
       │ Manager  │     │    HR    │     │Executive │
       │ Response │     │ Response │     │ Response │
       └──────────┘     └──────────┘     └──────────┘
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                        ┌──────────────────┐
                        │  Score           │
                        │  Calculation     │
                        │  (Weighted Avg)  │
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Band            │
                        │  Assignment      │
                        │  (Ready Now, etc)│
                        └──────────────────┘`}
            </pre>
          </div>

          <IntegrationCallout>
            <strong>HR Hub Workflow:</strong> Assessment events trigger the 
            <code className="mx-1 text-xs bg-muted px-1.5 py-0.5 rounded">SUCC_READINESS_APPROVAL</code> 
            workflow, which routes to the appropriate approvers based on the succession plan's 
            configured approval chain.
          </IntegrationCallout>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <TipCallout title="Best Practices for Readiness Assessments">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Schedule assessments 30 days before succession planning reviews for fresh data</li>
          <li>Use the due date field to drive timely completion by assessors</li>
          <li>Review partial scores during the in_progress phase to identify concerns early</li>
          <li>Conduct calibration sessions when assessor variance exceeds thresholds</li>
          <li>Document override reasons when HR adjusts system-calculated bands</li>
        </ul>
      </TipCallout>
    </div>
  );
}
