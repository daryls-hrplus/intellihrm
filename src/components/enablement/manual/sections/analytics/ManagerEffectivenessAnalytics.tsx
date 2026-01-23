import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, CheckCircle, TrendingUp, TrendingDown, Minus, BarChart3, Target, UserCog, Award, MessageSquare, Goal, RefreshCw } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { TipCallout, InfoCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { FieldReferenceTable, type FieldReference } from '../../components/FieldReferenceTable';
import { RelatedTopics } from '../../components';

const FIELD_REFERENCES: FieldReference[] = [
  { fieldName: 'manager_id', location: 'manager_effectiveness_scores', required: true, description: 'Manager profile ID for effectiveness tracking' },
  { fieldName: 'company_id', location: 'manager_effectiveness_scores', required: true, description: 'Company context for multi-tenant filtering' },
  { fieldName: 'period_start', location: 'manager_effectiveness_scores', required: true, description: 'Start date of effectiveness calculation period' },
  { fieldName: 'period_end', location: 'manager_effectiveness_scores', required: true, description: 'End date of effectiveness calculation period' },
  { fieldName: 'overall_effectiveness_score', location: 'manager_effectiveness_scores', required: true, description: 'Composite effectiveness score (0-100)' },
  { fieldName: 'avg_team_rating', location: 'manager_effectiveness_scores', required: false, description: 'Average performance rating of direct reports' },
  { fieldName: 'avg_team_rating_change', location: 'manager_effectiveness_scores', required: false, description: 'Change in team rating vs previous period' },
  { fieldName: 'feedback_frequency_score', location: 'manager_effectiveness_scores', required: false, description: 'Frequency of feedback interactions (0-100)' },
  { fieldName: 'feedback_quality_score', location: 'manager_effectiveness_scores', required: false, description: 'Quality of feedback provided (0-100)' },
  { fieldName: 'goal_completion_rate', location: 'manager_effectiveness_scores', required: false, description: 'Team goal achievement percentage' },
  { fieldName: 'appraisal_completion_rate', location: 'manager_effectiveness_scores', required: false, description: 'Percentage of appraisals completed on time' },
  { fieldName: 'team_retention_rate', location: 'manager_effectiveness_scores', required: false, description: 'Team member retention percentage' },
  { fieldName: 'team_development_score', location: 'manager_effectiveness_scores', required: false, description: 'Team skill/competency growth score' },
  { fieldName: 'calibration_alignment_score', location: 'manager_effectiveness_scores', required: false, description: 'Alignment with calibration decisions' },
  { fieldName: 'trend_direction', location: 'manager_effectiveness_scores', required: false, description: 'improving, stable, or declining' },
  { fieldName: 'recommendations', location: 'manager_effectiveness_scores', required: false, description: 'AI-generated improvement recommendations (JSON)' },
  { fieldName: 'calculated_at', location: 'manager_effectiveness_scores', required: true, description: 'Timestamp of score calculation' }
];

const BUSINESS_RULES = [
  { rule: 'Minimum team size for scoring', enforcement: 'System' as const, description: 'Managers must have at least 2 direct reports to appear in effectiveness analytics.' },
  { rule: 'Rolling calculation periods', enforcement: 'System' as const, description: 'Effectiveness scores are calculated for rolling 3, 6, and 12 month periods.' },
  { rule: 'Trend requires history', enforcement: 'System' as const, description: 'Trend direction requires at least 2 calculation periods for comparison.' },
  { rule: 'Confidentiality requirements', enforcement: 'Policy' as const, description: 'Effectiveness data is visible only to HR leadership and the manager directly.' }
];

const EFFECTIVENESS_COMPONENTS = [
  { component: 'Team Performance', weight: '25%', icon: TrendingUp, color: 'text-blue-600', description: 'Average team rating and year-over-year improvement' },
  { component: 'Feedback Quality', weight: '20%', icon: MessageSquare, color: 'text-green-600', description: 'Frequency and quality of feedback interactions' },
  { component: 'Goal Achievement', weight: '20%', icon: Goal, color: 'text-amber-600', description: 'Team goal completion rates and velocity' },
  { component: 'Process Timeliness', weight: '15%', icon: Clock, color: 'text-purple-600', description: 'On-time appraisal and IDP completion' },
  { component: 'Team Development', weight: '10%', icon: Award, color: 'text-pink-600', description: 'Skill development and competency growth' },
  { component: 'Team Retention', weight: '10%', icon: Users, color: 'text-cyan-600', description: 'Direct report retention and engagement' }
];

export function ManagerEffectivenessAnalytics() {
  return (
    <Card id="sec-6-5">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 6.5</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~14 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />HR User / Admin</Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <UserCog className="h-6 w-6 text-blue-500" />
          Manager Effectiveness Analytics
        </CardTitle>
        <CardDescription>
          Track and analyze manager performance as team leaders and evaluators
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'Intelligence Hub', 'Manager Effectiveness']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand the components of manager effectiveness scoring</li>
            <li>Interpret effectiveness trends and comparisons</li>
            <li>Identify managers requiring coaching or recognition</li>
            <li>Use effectiveness data to drive development interventions</li>
          </ul>
        </div>

        {/* Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Understanding Manager Effectiveness
          </h3>
          <p className="text-muted-foreground">
            Manager Effectiveness Analytics provides a comprehensive view of how managers 
            perform in their leadership role. Unlike individual performance reviews, this 
            focuses on a manager's ability to develop their team, provide quality feedback, 
            and drive results through others.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Why Manager Effectiveness Matters</p>
            <p className="text-sm text-muted-foreground mt-1">
              Research shows that 70% of employee engagement variance is driven by the 
              direct manager. Tracking effectiveness enables targeted development and 
              identifies best practices to share across the organization.
            </p>
          </div>
        </div>

        {/* Effectiveness Components */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Effectiveness Score Components</h3>
          <p className="text-muted-foreground text-sm">
            The overall effectiveness score is calculated from six weighted components:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {EFFECTIVENESS_COMPONENTS.map((item) => (
              <div key={item.component} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <h4 className="font-medium">{item.component}</h4>
                  <Badge variant="secondary" className="ml-auto text-xs">{item.weight}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trend Indicators */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Reading Trend Indicators</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, color: 'text-green-600 bg-green-500/10', label: 'Improving', description: 'Score increased 5%+ vs previous period' },
              { icon: Minus, color: 'text-muted-foreground bg-muted/50', label: 'Stable', description: 'Score within ±5% of previous period' },
              { icon: TrendingDown, color: 'text-red-600 bg-red-500/10', label: 'Declining', description: 'Score decreased 5%+ vs previous period' }
            ].map((item) => (
              <Card key={item.label} className={item.color.split(' ')[1]}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className={`h-6 w-6 ${item.color.split(' ')[0]}`} />
                    <h4 className="font-semibold">{item.label}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Step-by-Step */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Step-by-Step: Viewing Manager Effectiveness</h3>
          <ol className="list-decimal list-inside space-y-3 text-muted-foreground ml-2">
            <li>
              <strong>Navigate to Intelligence Hub</strong>
              <p className="ml-6 text-sm mt-1">Go to <strong>Performance → Intelligence Hub</strong>.</p>
            </li>
            <li>
              <strong>Select Workforce Section</strong>
              <p className="ml-6 text-sm mt-1">Click the <strong>Workforce</strong> button in the section navigation.</p>
            </li>
            <li>
              <strong>Access Manager Effectiveness Tab</strong>
              <p className="ml-6 text-sm mt-1">Click <strong>Manager Effectiveness</strong> tab to view analytics.</p>
            </li>
            <li>
              <strong>Review Summary Cards</strong>
              <p className="ml-6 text-sm mt-1">View overall effectiveness average, trend, and outlier counts.</p>
            </li>
            <li>
              <strong>Drill into Individual Managers</strong>
              <p className="ml-6 text-sm mt-1">Click on a manager row to see component breakdown and recommendations.</p>
            </li>
            <li>
              <strong>Refresh Scores (Optional)</strong>
              <p className="ml-6 text-sm mt-1">Click <strong>Refresh</strong> to recalculate scores with latest data.</p>
            </li>
          </ol>
        </div>

        {/* Use Cases */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Practical Use Cases
          </h3>
          <div className="space-y-3">
            {[
              { scenario: 'Manager Development Planning', action: 'Identify managers with declining effectiveness for targeted coaching programs' },
              { scenario: 'Best Practice Sharing', action: 'Study high-scoring managers to extract and share successful approaches' },
              { scenario: 'Promotion Decisions', action: 'Include effectiveness score as input for leadership advancement' },
              { scenario: 'Team Assignment', action: 'Match high-effectiveness managers with critical teams or new hires' }
            ].map((item) => (
              <div key={item.scenario} className="p-3 border rounded-lg">
                <h4 className="font-medium">{item.scenario}</h4>
                <p className="text-sm text-muted-foreground mt-1">{item.action}</p>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Proactive Coaching">
          Use declining trend alerts to intervene before problems escalate. A 2-period 
          declining trend should trigger an HR partner conversation with the manager.
        </TipCallout>

        <InfoCallout title="Data Privacy">
          Effectiveness scores are calculated at the manager level only. Individual employee 
          ratings contributing to the score are aggregated and not exposed.
        </InfoCallout>

        <FieldReferenceTable 
          fields={FIELD_REFERENCES}
          title="Database Fields: manager_effectiveness_scores"
        />

        <BusinessRules rules={BUSINESS_RULES} />

        <RelatedTopics
          topics={[
            { sectionId: 'sec-6-3', title: 'Manager Scoring Patterns' },
            { sectionId: 'sec-6-4', title: 'Trend Analysis & Predictions' },
            { sectionId: 'sec-4-10', title: 'Manager Calibration Alignment' }
          ]}
        />
      </CardContent>
    </Card>
  );
}
