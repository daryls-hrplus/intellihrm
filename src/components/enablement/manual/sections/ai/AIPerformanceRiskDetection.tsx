import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, Users, TrendingDown, Brain, ShieldAlert, Activity, CheckCircle, Target, Heart, Battery, BookOpen, Zap } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { 
  LearningObjectives, 
  StepByStep,
  BusinessRules,
  TroubleshootingSection,
  ScreenshotPlaceholder,
  TipCallout,
  WarningCallout,
  ComplianceCallout,
  RelatedTopics
} from '../../components';

const RISK_TYPES = [
  { 
    type: 'Chronic Underperformance', 
    icon: TrendingDown,
    description: '2+ consecutive appraisal cycles with scores below threshold',
    indicators: ['Overall score < 2.5 for 2+ cycles', 'No improvement trend', 'Multiple goals missed'],
    intervention: 'Performance Improvement Plan (PIP)'
  },
  { 
    type: 'Skills Decay', 
    icon: BookOpen,
    description: 'Expiring certifications or outdated skills without renewal',
    indicators: ['Certifications expired/expiring', 'No recent training', 'Skill assessments declining'],
    intervention: 'Training assignment, skill development IDP'
  },
  { 
    type: 'Toxic High Performer', 
    icon: Heart,
    description: 'Strong results but poor values/behavioral scores',
    indicators: ['Goals score ≥ 4.0 but Values score ≤ 2.5', 'Peer feedback concerns', 'Cultural misalignment'],
    intervention: 'Values coaching, leadership discussion'
  },
  { 
    type: 'Declining Trend', 
    icon: Activity,
    description: 'Performance trajectory moving downward over time',
    indicators: ['Score dropped 0.5+ from prior cycle', 'Goal progress declining mid-cycle', 'Engagement survey drop'],
    intervention: 'Manager coaching conversation, check-in increase'
  },
  { 
    type: 'Competency Gap', 
    icon: Target,
    description: 'Significant gap between role requirements and demonstrated proficiency',
    indicators: ['Competency score ≤ 2.0 in role-critical areas', 'Gap vs expected proficiency', 'Repeated low competency ratings'],
    intervention: 'Targeted IDP, training assignment, mentorship'
  },
  { 
    type: 'Goal Achievement Gap', 
    icon: Zap,
    description: 'Consistent failure to achieve assigned goals',
    indicators: ['< 60% goal completion', 'Missed deadlines', 'Quality issues on deliverables'],
    intervention: 'Goal review, workload assessment, capability check'
  },
  { 
    type: 'Engagement Risk', 
    icon: Battery,
    description: 'Signals of disengagement or potential attrition',
    indicators: ['Pulse survey sentiment declining', 'Reduced participation', 'Check-in frequency drop'],
    intervention: 'Retention conversation, engagement plan'
  }
];

const RESPONSE_STEPS = [
  {
    title: 'Review Risk Dashboard',
    description: 'Access the Performance Risk Dashboard to see flagged employees',
    substeps: [
      'Navigate to Performance → Intelligence Hub → Risk Analysis',
      'Review employees flagged with risk levels',
      'Sort by risk score or risk type'
    ],
    expectedResult: 'Clear view of employees requiring attention'
  },
  {
    title: 'Analyze Individual Risk Profile',
    description: 'Drill into specific employee risk details',
    substeps: [
      'Click on employee to open risk profile',
      'Review AI analysis and contributing factors',
      'Check historical trends and evidence'
    ],
    expectedResult: 'Understanding of why risk was flagged'
  },
  {
    title: 'Review AI Recommendations',
    description: 'Consider AI-suggested interventions',
    substeps: [
      'Review recommended intervention type',
      'Check suggested training or development actions',
      'Note succession impact if applicable'
    ],
    expectedResult: 'Actionable recommendations to consider'
  },
  {
    title: 'Initiate Intervention',
    description: 'Take appropriate action based on risk type',
    substeps: [
      'Select intervention: IDP, PIP, Training, Coaching, etc.',
      'Document rationale for intervention',
      'Assign owner and timeline'
    ],
    expectedResult: 'Intervention initiated with audit trail'
  },
  {
    title: 'Acknowledge Risk',
    description: 'Mark risk as acknowledged and in-progress',
    substeps: [
      'Change risk status to "Acknowledged" or "In Progress"',
      'Add notes about planned actions',
      'Set follow-up reminder'
    ],
    expectedResult: 'Risk tracked with resolution plan'
  }
];

const BUSINESS_RULES = [
  { rule: 'Risk scoring uses weighted algorithm', enforcement: 'System' as const, description: 'Multiple factors contribute to 0-100 risk score with configurable weights.' },
  { rule: 'Risk levels: Low (0-25), Medium (26-50), High (51-75), Critical (76-100)', enforcement: 'System' as const, description: 'Thresholds determine risk severity and required response.' },
  { rule: 'Critical risks require HR acknowledgment', enforcement: 'Policy' as const, description: 'Employees with critical risk scores must be reviewed by HR within 5 days.' },
  { rule: 'Succession candidates flagged separately', enforcement: 'System' as const, description: 'Risk on succession pool members triggers additional alerts to talent team.' },
  { rule: 'Risk analysis runs on schedule', enforcement: 'System' as const, description: 'Edge function analyzes risk daily or on-demand via manual refresh.' }
];

const TROUBLESHOOTING_ITEMS = [
  {
    issue: 'Risk analysis not running',
    cause: 'Edge function disabled or insufficient data.',
    solution: 'Check that performance-risk-analyzer function is deployed and enabled. Verify employee has sufficient appraisal history.'
  },
  {
    issue: 'False positive risk flags',
    cause: 'Edge case not handled or data quality issue.',
    solution: 'Review contributing factors in risk profile. If incorrect, dismiss with reason. Report to system admin if pattern persists.'
  },
  {
    issue: 'Intervention not triggering from risk',
    cause: 'Automation rules not configured.',
    solution: 'Check Action Rules (Section 2.8) for risk-triggered rules. Ensure rule conditions match risk type/level.'
  },
  {
    issue: 'Risk score not updating after intervention',
    cause: 'Intervention not yet reflected in source data.',
    solution: 'Risk scores update with next analysis cycle. Manual refresh available in admin tools. Allow 24 hours for reflection.'
  }
];

export function AIPerformanceRiskDetection() {
  return (
    <Card id="sec-5-8">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 5.8</Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            ~20 min read
          </Badge>
          <Badge className="gap-1 bg-red-600 text-white">
            <Users className="h-3 w-3" />
            HR User / Admin
          </Badge>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-red-500" />
          Performance Risk Detection
        </CardTitle>
        <CardDescription>
          AI-powered identification of performance risks with intervention recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={['Performance', 'Intelligence Hub', 'Risk Analysis']} />

        <LearningObjectives
          objectives={[
            'Understand the 7 performance risk types and their indicators',
            'Interpret risk scores and severity levels',
            'Use the Risk Dashboard to identify at-risk employees',
            'Initiate appropriate interventions based on risk type',
            'Track risk resolution and succession impact'
          ]}
        />

        <div>
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            What is Performance Risk Detection?
          </h4>
          <p className="text-muted-foreground">
            Performance Risk Detection uses AI to analyze patterns across appraisal history, goal 
            progress, competency assessments, and engagement signals to identify employees at risk 
            of performance issues. Early detection enables proactive intervention before problems 
            escalate, protecting both employee careers and organizational performance.
          </p>
        </div>

        {/* Risk Scoring Overview */}
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <h4 className="font-semibold text-red-700 dark:text-red-300 mb-3">Risk Scoring Methodology</h4>
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded">
              <p className="font-bold text-green-700 dark:text-green-300">0-25</p>
              <p className="text-xs">Low Risk</p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded">
              <p className="font-bold text-yellow-700 dark:text-yellow-300">26-50</p>
              <p className="text-xs">Medium Risk</p>
            </div>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded">
              <p className="font-bold text-orange-700 dark:text-orange-300">51-75</p>
              <p className="text-xs">High Risk</p>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded border-2 border-red-400">
              <p className="font-bold text-red-700 dark:text-red-300">76-100</p>
              <p className="text-xs">Critical</p>
            </div>
          </div>
        </div>

        {/* Risk Types */}
        <div>
          <h4 className="font-medium mb-4">Performance Risk Types</h4>
          <div className="space-y-4">
            {RISK_TYPES.map((risk) => (
              <div key={risk.type} className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <risk.icon className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold mb-1">{risk.type}</h5>
                    <p className="text-sm text-muted-foreground mb-2">{risk.description}</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Indicators</p>
                        <ul className="space-y-1">
                          {risk.indicators.map((ind, i) => (
                            <li key={i} className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 text-amber-500" />
                              <span>{ind}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-xs uppercase text-muted-foreground mb-1">Recommended Intervention</p>
                        <p className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {risk.intervention}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ScreenshotPlaceholder
          caption="Figure 5.8.1: Performance Risk Dashboard showing at-risk employees by risk type"
          alt="Performance Risk Dashboard"
        />

        <StepByStep steps={RESPONSE_STEPS} title="Responding to Performance Risks" />

        <ScreenshotPlaceholder
          caption="Figure 5.8.2: Employee Risk Profile with AI analysis and intervention options"
          alt="Employee Risk Profile card"
        />

        {/* Succession Impact */}
        <div className="p-4 border-l-4 border-l-purple-500 bg-muted/50 rounded-r-lg">
          <h4 className="font-semibold mb-2">Succession Impact</h4>
          <p className="text-sm text-muted-foreground">
            When a risk is identified for an employee in the succession pipeline, the system 
            automatically flags this on their succession record. Succession impact values include:
          </p>
          <ul className="text-sm mt-2 space-y-1">
            <li>• <strong>None:</strong> No succession impact</li>
            <li>• <strong>Flagged:</strong> Risk noted but succession candidacy continues</li>
            <li>• <strong>Excluded:</strong> Removed from succession pool pending resolution</li>
          </ul>
        </div>

        <ComplianceCallout title="Documentation Requirements">
          All risk identifications, interventions, and resolutions are logged with full audit 
          trails. This documentation is essential for legal compliance, especially when risks 
          lead to employment actions. Ensure all decisions are objective and well-documented.
        </ComplianceCallout>

        <TipCallout title="Proactive Monitoring">
          Don't wait for Critical risks. Set up alerts for Medium and High risks to enable 
          early intervention. The most effective interventions happen before problems escalate.
        </TipCallout>

        <WarningCallout title="Toxic High Performer Risk">
          This risk type requires special handling. High performers who score low on values 
          can cause significant cultural damage. These cases often require leadership involvement 
          beyond standard HR processes.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />

        <TroubleshootingSection items={TROUBLESHOOTING_ITEMS} />

        <RelatedTopics
          topics={[
            { sectionId: 'sec-2-8', title: 'Action Rules Configuration' },
            { sectionId: 'sec-7-2', title: 'Nine-Box & Succession Integration' },
            { sectionId: 'sec-7-3', title: 'IDP/PIP Auto-Creation' },
            { sectionId: 'sec-5-7', title: 'AI Coaching Nudges' }
          ]}
        />
      </CardContent>
    </Card>
  );
}
