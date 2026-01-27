// Section 4.6: Executive Assessment Workflow
// Optional executive layer, calibration integration

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  WarningCallout,
  IndustryCallout,
  FeatureCardGrid,
  PrimaryFeatureCard,
  SuccessFeatureCard,
  InfoFeatureCard,
} from '../../../components';
import { 
  Crown, 
  Settings,
  CheckCircle2,
  Users,
  Eye,
  Scale,
  Shield
} from 'lucide-react';

export function ReadinessExecutiveWorkflow() {
  return (
    <div className="space-y-8">
      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          "Understand when to enable the optional Executive assessment layer",
          "Configure Executive-specific indicators in succession_assessor_types",
          "Navigate the Executive assessment interface with consolidated view",
          "Integrate Executive review with talent calibration sessions"
        ]}
      />

      {/* Navigation Path */}
      <InfoCallout title="Navigation Path">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          ESS Executive → My Reviews → Succession Assessments → [Candidate Name]
        </code>
        <br />
        <span className="text-xs text-muted-foreground">Alternative:</span>
        <code className="text-xs bg-muted px-2 py-1 rounded ml-2">
          HR Hub → My Tasks → [Executive Assessment Request]
        </code>
      </InfoCallout>

      {/* When to Enable Executive Layer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            When to Enable Executive Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The Executive assessment layer is optional and should be enabled strategically:
          </p>

          <FeatureCardGrid columns={2}>
            <SuccessFeatureCard
              icon={CheckCircle2}
              title="Enable For"
              description="C-suite succession candidates, VP+ level positions, High-visibility talent pool members, Cross-functional leadership roles, Board-facing positions"
            />
            <InfoFeatureCard
              icon={Settings}
              title="Skip For"
              description="Individual contributor succession, Manager-level positions, Operational roles, Positions with clear technical succession paths, High-volume assessment cycles"
            />
          </FeatureCardGrid>

          <IndustryCallout>
            <strong>Enterprise Pattern:</strong> Executive layer is typically enabled for 
            top 50-100 critical positions in an organization, not for all succession plans. This 
            balances executive time investment with strategic value.
          </IndustryCallout>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Enabling Executive Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            To enable Executive assessments, configure the <code className="text-xs bg-muted px-1.5 py-0.5 rounded">succession_assessor_types</code> table:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Field</th>
                  <th className="text-left py-3 px-4 font-medium">Value for Executive</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">type_code</td>
                  <td className="py-3 px-4"><code className="text-xs bg-muted px-1 py-0.5 rounded">executive</code></td>
                  <td className="py-3 px-4">System identifier for assessor type</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">type_label</td>
                  <td className="py-3 px-4">Executive Reviewer</td>
                  <td className="py-3 px-4">Display name in UI</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">is_enabled</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-emerald-600">true</Badge>
                  </td>
                  <td className="py-3 px-4">Must be true to activate layer</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">is_required</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline">false</Badge>
                  </td>
                  <td className="py-3 px-4">Typically optional—set true for critical roles only</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">weight_percentage</td>
                  <td className="py-3 px-4">15-25%</td>
                  <td className="py-3 px-4">Executive input weighted in final score</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-mono text-xs">applies_to_staff_types</td>
                  <td className="py-3 px-4">["executive", "senior_manager"]</td>
                  <td className="py-3 px-4">Limit to appropriate staff types</td>
                </tr>
              </tbody>
            </table>
          </div>

          <WarningCallout>
            <strong>Configuration Note:</strong> Navigate to <code className="text-xs bg-muted px-1 py-0.5 rounded">
            Succession → Setup → Assessor Types</code> to enable the Executive row. Changes apply 
            to future assessments only—existing events retain their original configuration.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Executive-Specific Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Executive-Specific Indicators
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Executives typically assess high-level strategic indicators not visible to managers or HR:
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border rounded-lg">
              <p className="font-medium text-sm mb-2 flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                Strategic Vision
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Enterprise-level thinking capability</li>
                <li>• Industry and market awareness</li>
                <li>• Long-term planning orientation</li>
              </ul>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium text-sm mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Board & Stakeholder Presence
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Executive presentation capability</li>
                <li>• External stakeholder management</li>
                <li>• Investor/analyst communication</li>
              </ul>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium text-sm mb-2 flex items-center gap-2">
                <Scale className="h-4 w-4 text-emerald-500" />
                Enterprise Leadership
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Cross-functional collaboration</li>
                <li>• Cultural ambassador potential</li>
                <li>• Transformation leadership</li>
              </ul>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium text-sm mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-500" />
                Risk & Reputation
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Reputational risk assessment</li>
                <li>• Crisis leadership potential</li>
                <li>• Ethical decision-making record</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consolidated View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Executive Consolidated View
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Executives see a consolidated summary before providing their assessment:
          </p>

          {/* Consolidated View Diagram */}
          <div className="p-4 bg-muted/30 rounded-lg font-mono text-xs">
            <pre className="whitespace-pre-wrap text-foreground">
{`┌─────────────────────────────────────────────────────────────────┐
│ [Executive Assessment Summary]                                  │
│   Candidate: Jane Smith → VP Operations                         │
├─────────────────────────────────────────────────────────────────┤
│ [Manager Assessment]                                            │
│   Overall: 3.8/5.0 (76%)                                       │
│   Strengths: Strategic Vision, Team Development                │
│   Gaps: Stakeholder Influence, Change Leadership               │
├─────────────────────────────────────────────────────────────────┤
│ [HR Assessment]                                                 │
│   Overall: 3.6/5.0 (72%)                                       │
│   Strengths: Performance History, Compliance                   │
│   Gaps: Flight Risk (engagement score 65%), Career Velocity    │
├─────────────────────────────────────────────────────────────────┤
│ [Variance Flags]                                                │
│   ⚠ Strategic Vision: Manager 4, HR 2 (High Variance)         │
│   ⚠ Mobility: Manager 3, HR 5 (Moderate Variance)             │
├─────────────────────────────────────────────────────────────────┤
│ [Executive Indicators]                                          │
│   ► Enterprise Leadership (4 indicators)                       │
│   ► Board Presence (3 indicators)                              │
│   ► Strategic Vision (3 indicators)                            │
├─────────────────────────────────────────────────────────────────┤
│ [Actions]                                                       │
│   [Complete Executive Assessment]  [Request Calibration]        │
└─────────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>

          <IndustryCallout>
            <strong>Efficiency Pattern:</strong> The consolidated view allows executives to focus 
            their limited time on areas of disagreement and strategic indicators, rather than 
            re-assessing everything Manager and HR already covered.
          </IndustryCallout>
        </CardContent>
      </Card>

      {/* Calibration Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Calibration Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Executives often use assessments as input to talent calibration sessions:
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border border-blue-500/30 bg-blue-500/10 rounded-lg">
              <p className="font-medium text-sm text-blue-700 dark:text-blue-400">Individual Assessment</p>
              <p className="text-xs text-muted-foreground mt-1">
                Executive completes their indicators for each candidate independently before 
                calibration meeting.
              </p>
            </div>
            <div className="p-3 border border-purple-500/30 bg-purple-500/10 rounded-lg">
              <p className="font-medium text-sm text-purple-700 dark:text-purple-400">Calibration Meeting</p>
              <p className="text-xs text-muted-foreground mt-1">
                Leadership team reviews all assessments together, discusses variance, and 
                reaches consensus on final readiness bands.
              </p>
            </div>
          </div>

          <WarningCallout>
            <strong>Workflow Consideration:</strong> If your organization uses formal calibration 
            meetings, set Executive assessor type to <code className="text-xs bg-muted px-1 py-0.5 rounded">is_required = false</code> 
            so events can complete without waiting for Executive input. The calibration meeting 
            can then be used to finalize or override scores.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <TipCallout title="Best Practices for Executive Assessments">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Reserve Executive layer for top 50-100 critical positions to respect executive time</li>
          <li>Pre-populate consolidated view with Manager/HR summaries for efficiency</li>
          <li>Use "Request Calibration" button when significant variance requires discussion</li>
          <li>Schedule Executive assessments before quarterly talent reviews for fresh input</li>
          <li>Focus Executive indicators on strategic, enterprise-level competencies</li>
        </ul>
      </TipCallout>
    </div>
  );
}
