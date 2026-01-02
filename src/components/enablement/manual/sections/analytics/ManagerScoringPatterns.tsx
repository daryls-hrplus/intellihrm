import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle, TrendingUp, TrendingDown, Minus, AlertTriangle, BarChart3, Target, Eye, Shield } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';

const FIELD_REFERENCES = [
  { fieldName: 'Manager Patterns Table', location: 'Appraisals → Manager Patterns Tab', required: false, description: 'List of managers with their scoring statistics and pattern classification' },
  { fieldName: 'Company Average', location: 'Patterns Tab Header', required: false, description: 'Organization-wide average score for comparison baseline' },
  { fieldName: 'Flagged Managers', location: 'Patterns Tab Header', required: false, description: 'Count of managers with patterns requiring review' },
  { fieldName: 'Pattern Badge', location: 'Manager Row', required: false, description: 'Classification: Lenient, Strict, Balanced, or Inconsistent' },
  { fieldName: 'Deviation Indicator', location: 'Manager Row', required: false, description: 'Visual indicator showing variance from company average' }
];

const BUSINESS_RULES = [
  { rule: 'Minimum evaluations required', enforcement: 'System' as const, description: 'Managers must have at least 2 completed evaluations to appear in pattern analysis.' },
  { rule: 'Pattern thresholds are configurable', enforcement: 'Advisory' as const, description: 'Deviation thresholds for lenient/strict classification can be adjusted.' },
  { rule: 'Patterns are cycle-scoped', enforcement: 'System' as const, description: 'Analysis is calculated per appraisal cycle when filtered; aggregated otherwise.' },
  { rule: 'Confidentiality requirements', enforcement: 'Policy' as const, description: 'Manager pattern data should only be shared with HR leadership and the manager directly.' }
];

const PATTERN_WORKFLOW = `graph TB
    subgraph Data Collection
        A[Manager Evaluations] --> D[Score Aggregation]
        B[Employee Scores] --> D
        C[Company Baseline] --> D
    end
    
    subgraph Pattern Analysis
        D --> E[Calculate Manager Avg]
        D --> F[Calculate Std Dev]
        E --> G[Compare to Company Avg]
        F --> H[Consistency Check]
    end
    
    subgraph Classification
        G -->|+0.5 or more| I[Lenient]
        G -->|-0.5 or less| J[Strict]
        G -->|Within ±0.5| K[Balanced]
        H -->|StdDev > 1.0| L[Inconsistent]
    end
    
    subgraph Actions
        I --> M[Coaching Recommendation]
        J --> M
        L --> M
        K --> N[No Action Required]
    end
    
    style D fill:#3b82f6,stroke:#2563eb,color:#fff
    style M fill:#f59e0b,stroke:#d97706,color:#fff`;

export function ManagerScoringPatternsSection() {
  return (
    <Card id="sec-6-3">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 6.3</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~12 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />HR User / Admin</Badge>
        </div>
        <CardTitle className="text-2xl">Manager Scoring Patterns</CardTitle>
        <CardDescription>Identifying rating tendencies and addressing calibration needs at the manager level</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-6-3']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand manager scoring pattern classifications</li>
            <li>Interpret deviation metrics and consistency scores</li>
            <li>Identify managers requiring calibration coaching</li>
            <li>Use pattern data to improve rating accuracy organization-wide</li>
          </ul>
        </div>

        {/* Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Understanding Manager Scoring Patterns
          </h3>
          <p className="text-muted-foreground">
            Manager scoring pattern analysis compares each manager's rating behavior against the organization 
            average. This helps identify unconscious biases (leniency or strictness) and inconsistent raters 
            who may need additional training or calibration support.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Why Pattern Analysis Matters</p>
            <p className="text-sm text-muted-foreground mt-1">
              Studies show that without calibration, managers can differ by 1-2 rating points on average. 
              Pattern analysis surfaces these differences objectively, enabling targeted interventions.
            </p>
          </div>
        </div>

        <WorkflowDiagram 
          title="Pattern Analysis Flow" 
          diagram={PATTERN_WORKFLOW}
        />

        {/* Pattern Classifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pattern Classifications</h3>
          <p className="text-muted-foreground text-sm">
            The system classifies each manager into one of four patterns based on statistical analysis:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { 
                pattern: 'Lenient', 
                icon: TrendingUp,
                color: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
                criteria: 'Average score ≥ 0.5 points above company average',
                implications: 'May be giving inflated ratings. Employees may have unrealistic expectations.',
                actions: ['Review rating criteria understanding', 'Provide comparative context', 'Include in next calibration focus group']
              },
              { 
                pattern: 'Strict', 
                icon: TrendingDown,
                color: 'text-blue-600 bg-blue-500/10 border-blue-500/30',
                criteria: 'Average score ≤ 0.5 points below company average',
                implications: 'May be overly harsh. Employee morale and retention risk.',
                actions: ['Discuss rating philosophy', 'Review evidence standards', 'Pair with balanced rater for calibration']
              },
              { 
                pattern: 'Balanced', 
                icon: Target,
                color: 'text-green-600 bg-green-500/10 border-green-500/30',
                criteria: 'Average score within ±0.5 of company average',
                implications: 'Ratings align with organizational norms. Good calibration.',
                actions: ['No immediate intervention needed', 'Consider as calibration facilitator', 'Share best practices']
              },
              { 
                pattern: 'Inconsistent', 
                icon: AlertTriangle,
                color: 'text-red-600 bg-red-500/10 border-red-500/30',
                criteria: 'Standard deviation > 1.0 (wide spread of ratings)',
                implications: 'May not be applying criteria consistently across employees.',
                actions: ['Review rating justifications', 'Provide rubric training', 'Monitor next cycle closely']
              }
            ].map((item) => (
              <Card key={item.pattern} className={`border ${item.color.split(' ').slice(1).join(' ')}`}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-5 w-5 ${item.color.split(' ')[0]}`} />
                    <h4 className="font-semibold">{item.pattern}</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Criteria:</strong> {item.criteria}</p>
                    <p className="text-muted-foreground"><strong>Implications:</strong> {item.implications}</p>
                    <div>
                      <strong>Recommended Actions:</strong>
                      <ul className="list-disc list-inside text-muted-foreground mt-1">
                        {item.actions.map((action, i) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Key Metrics Explained
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 border-b">Metric</th>
                  <th className="text-left p-3 border-b">Definition</th>
                  <th className="text-left p-3 border-b">Interpretation</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { metric: 'Manager Average', definition: 'Mean of all ratings given by manager', interpretation: 'Compare to company average to identify bias direction' },
                  { metric: 'Company Average', definition: 'Mean of all ratings across organization', interpretation: 'Baseline for deviation calculations' },
                  { metric: 'Deviation', definition: 'Manager avg minus company avg', interpretation: 'Positive = lenient, Negative = strict' },
                  { metric: 'Standard Deviation', definition: 'Spread of manager ratings', interpretation: 'High (>1.0) indicates inconsistency' },
                  { metric: 'Employee Count', definition: 'Number of evaluations by manager', interpretation: 'Higher count = more reliable pattern' }
                ].map((row, i) => (
                  <tr key={row.metric} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                    <td className="p-3 border-b font-medium">{row.metric}</td>
                    <td className="p-3 border-b text-muted-foreground">{row.definition}</td>
                    <td className="p-3 border-b text-muted-foreground">{row.interpretation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Step-by-Step */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Step-by-Step: Reviewing Manager Patterns</h3>
          <ol className="list-decimal list-inside space-y-3 text-muted-foreground ml-2">
            <li>
              <strong>Navigate to Intelligence Hub</strong>
              <p className="ml-6 text-sm mt-1">Go to <strong>Performance → Intelligence Hub</strong>.</p>
            </li>
            <li>
              <strong>Select Appraisals Section</strong>
              <p className="ml-6 text-sm mt-1">Click the <strong>Appraisals</strong> button in the section navigation.</p>
            </li>
            <li>
              <strong>Choose Manager Patterns Tab</strong>
              <p className="ml-6 text-sm mt-1">Click <strong>Manager Patterns</strong> tab to view the analysis.</p>
            </li>
            <li>
              <strong>Review Header Statistics</strong>
              <p className="ml-6 text-sm mt-1">Note the <strong>Company Average</strong> and <strong>Flagged Managers</strong> count.</p>
            </li>
            <li>
              <strong>Sort and Filter</strong>
              <p className="ml-6 text-sm mt-1">Sort by deviation to quickly identify extreme cases. Apply cycle filter if needed.</p>
            </li>
            <li>
              <strong>Review Individual Patterns</strong>
              <p className="ml-6 text-sm mt-1">Click a manager row to see detailed breakdown and comparison charts.</p>
            </li>
            <li>
              <strong>Document Coaching Needs</strong>
              <p className="ml-6 text-sm mt-1">Note managers requiring intervention for follow-up conversations.</p>
            </li>
          </ol>
        </div>

        {/* Coaching Approach */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Coaching Approaches by Pattern
          </h3>
          <div className="space-y-3">
            {[
              { 
                pattern: 'Lenient Managers', 
                approach: 'Share comparison data showing their ratings vs. organization. Discuss expectations for each rating level. Review rating justifications to ensure evidence supports scores.',
                sample: '"Your average rating is 3.9 while the organization average is 3.4. Let\'s review the criteria for Exceeds Expectations together."'
              },
              { 
                pattern: 'Strict Managers', 
                approach: 'Acknowledge high standards while discussing impact on team morale. Review if evidence requirements are appropriate. Pair with balanced rater during calibration.',
                sample: '"Your team averages 2.8 vs. company average of 3.4. Are there barriers preventing your team from higher achievement, or might criteria be applied differently?"'
              },
              { 
                pattern: 'Inconsistent Managers', 
                approach: 'Focus on consistent application of criteria across all employees. Review rating rubric and behavioral indicators. Request evidence documentation for each rating.',
                sample: '"Your ratings range from 1.5 to 4.8 within one team. Let\'s discuss how you\'re applying the rating criteria to ensure consistency."'
              }
            ].map((item) => (
              <div key={item.pattern} className="p-4 border rounded-lg space-y-2">
                <h4 className="font-semibold">{item.pattern}</h4>
                <p className="text-sm text-muted-foreground">{item.approach}</p>
                <div className="p-3 bg-muted/50 rounded-lg text-sm italic">
                  <strong>Sample Conversation Starter:</strong> {item.sample}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Field References */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Key Interface Elements</h3>
          <div className="space-y-2">
            {FIELD_REFERENCES.map((field, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{field.fieldName}</span>
                  <Badge variant="outline" className="text-xs">{field.location}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Proactive Pattern Review">
          Review manager patterns annually, even outside calibration season. Early identification 
          allows for coaching before it impacts employee experience and compensation decisions.
        </TipCallout>

        <WarningCallout title="Confidentiality Reminder">
          Manager pattern data is sensitive. Share only with the individual manager and HR leadership. 
          Never compare managers publicly or share patterns in group settings.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />
      </CardContent>
    </Card>
  );
}
