import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../../components/StepByStep';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { 
  ClipboardCheck, 
  Settings, 
  ChevronRight, 
  Shield,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Activity,
  Eye
} from 'lucide-react';

export function TalentPoolHRReview() {
  const reviewPacketFields: FieldDefinition[] = [
    { name: 'id', required: true, type: 'UUID', description: 'Primary key, auto-generated', validation: 'System-assigned' },
    { name: 'talent_pool_id', required: true, type: 'UUID', description: 'Reference to target talent pool', validation: 'Must be valid pool' },
    { name: 'member_id', required: true, type: 'UUID', description: 'Reference to talent pool member record', validation: 'Must be valid member' },
    { name: 'employee_id', required: true, type: 'UUID', description: 'Reference to employee profile', validation: 'Must be active employee' },
    { name: 'company_id', required: true, type: 'UUID', description: 'Reference to company', validation: 'Must match pool company' },
    { name: 'evidence_snapshot', required: false, type: 'JSONB', description: 'Point-in-time capture of talent profile evidence' },
    { name: 'signal_summary', required: false, type: 'JSONB', description: 'Aggregated talent signal data and scores' },
    { name: 'leadership_indicators', required: false, type: 'JSONB', description: 'Leadership-specific behavioral indicators' },
    { name: 'review_status', required: true, type: 'Text', description: 'Current review status', defaultValue: 'pending', validation: 'pending, approved, declined' },
    { name: 'reviewed_by', required: false, type: 'UUID', description: 'HR user who completed review', defaultValue: 'null' },
    { name: 'reviewed_at', required: false, type: 'Timestamp', description: 'When review was completed', defaultValue: 'null' },
    { name: 'notes', required: false, type: 'Text', description: 'Reviewer comments and decision rationale' },
    { name: 'created_at', required: true, type: 'Timestamp', description: 'Record creation timestamp', defaultValue: 'now()' }
  ];

  const reviewSteps: Step[] = [
    {
      title: 'Access Pending Nominations',
      description: 'Navigate to the talent pool review queue.',
      substeps: [
        'Go to HR Hub → Succession Planning → Talent Pools',
        'Click the "Pending Reviews" tab or filter by nomination status',
        'You see all nominations awaiting review across pools'
      ],
      expectedResult: 'Pending nominations list is displayed with employee and pool details'
    },
    {
      title: 'Open Nomination Review Packet',
      description: 'Access the detailed review packet for a nomination.',
      substeps: [
        'Click on the nomination row to open the review packet',
        'Review packet displays employee profile, justification, and evidence'
      ],
      expectedResult: 'Review packet opens with comprehensive employee information'
    },
    {
      title: 'Review Confidence Indicators',
      description: 'Evaluate the data quality and reliability indicators.',
      substeps: [
        'Check the Confidence Score (0-100%)',
        'Review Bias Risk Level (low/medium/high)',
        'Check Data Freshness status (Fresh/Recent/Stale)',
        'Note the Source Count and Signal Count'
      ],
      notes: [
        'Confidence ≥70% indicates strong evidence base',
        'High bias risk requires additional scrutiny',
        'Stale data (>90 days) may warrant updated assessment'
      ],
      expectedResult: 'You understand the reliability of the supporting data'
    },
    {
      title: 'Review Evidence Summary',
      description: 'Examine the talent signals and evidence supporting the nomination.',
      substeps: [
        'Review top strengths and their scores',
        'Note development areas and gaps',
        'Check pool criteria validation (meets/does not meet)',
        'Review evidence sources by type (performance, feedback, skills)'
      ],
      expectedResult: 'You have a complete picture of the employee\'s qualifications'
    },
    {
      title: 'Review Manager Justification',
      description: 'Evaluate the nominating manager\'s rationale.',
      substeps: [
        'Read the manager\'s nomination justification',
        'Verify claims against evidence in the packet',
        'Check for any development recommendations',
        'Note the manager\'s relationship and tenure with the employee'
      ],
      expectedResult: 'You have assessed the quality of the nomination justification'
    },
    {
      title: 'Make Approval Decision',
      description: 'Approve or decline the nomination with documented rationale.',
      substeps: [
        'Click "Approve" or "Decline" button',
        'Enter review notes explaining your decision',
        'For declines, provide constructive feedback for the manager',
        'Confirm your decision'
      ],
      notes: [
        'Notes are visible to the nominating manager',
        'Decline notes should guide future nominations'
      ],
      expectedResult: 'Nomination status is updated. Manager and employee are notified (for approvals).'
    }
  ];

  const businessRules: BusinessRule[] = [
    { rule: 'HR role required', enforcement: 'System', description: 'Only users with HR Partner or Admin role can approve/decline nominations.' },
    { rule: 'Review packet required', enforcement: 'System', description: 'Review packet must be generated before decision can be made.' },
    { rule: 'Notes required for decline', enforcement: 'Policy', description: 'Declining a nomination requires feedback notes to guide the manager.' },
    { rule: 'Review SLA', enforcement: 'Policy', description: 'Nominations should be reviewed within 5 business days. Escalation after 7 days.' },
    { rule: 'Audit trail', enforcement: 'System', description: 'All review actions are logged with timestamp and reviewer ID.' },
    { rule: 'Pool criteria validation', enforcement: 'Advisory', description: 'System validates against pool criteria but HR can override for exceptions.' }
  ];

  const confidenceIndicators = [
    { name: 'Confidence Score', description: 'Overall reliability score based on evidence depth', calculation: 'Weighted combination of source count, rater diversity, and data consistency', thresholds: '≥70% Strong, 40-70% Moderate, <40% Weak' },
    { name: 'Bias Risk Level', description: 'Risk of skewed assessment data', calculation: 'Analysis of rater relationships, response patterns, and outlier detection', thresholds: 'Low (<10%), Medium (10-30%), High (>30%)' },
    { name: 'Data Freshness', description: 'Currency of supporting evidence', calculation: 'Days since most recent evidence update', thresholds: 'Fresh (<30d), Recent (30-90d), Stale (>90d)' },
    { name: 'Source Count', description: 'Number of evidence items supporting the nomination', calculation: 'Count of unique evidence sources in talent profile', thresholds: 'Strong (≥5), Adequate (3-4), Limited (<3)' },
    { name: 'Signal Count', description: '360 feedback and behavioral signals available', calculation: 'Count of active talent signal definitions with data', thresholds: 'Strong (≥8), Adequate (4-7), Limited (<4)' },
    { name: 'Recommendation Confidence', description: 'System recommendation strength', calculation: 'AI-generated confidence in nomination suitability', thresholds: 'Strong (≥70%), Needs Evidence (40-70%), Insufficient (<40%)' }
  ];

  return (
    <section id="sec-5-6" data-manual-anchor="sec-5-6" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">5.6 HR Review & Approval</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Review packets, confidence indicators, and approval workflows
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Generate and interpret review packets for talent pool nominations',
          'Evaluate confidence indicators to assess data quality and reliability',
          'Apply consistent approval criteria while allowing justified exceptions',
          'Document review decisions with appropriate audit trail compliance'
        ]}
      />

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-primary" />
            <span className="font-medium">Navigation:</span>
            <Badge variant="outline">HR Hub</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Succession Planning</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Talent Pools</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="secondary">Pending Reviews</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            talent_pool_review_packets Table Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={reviewPacketFields} />
        </CardContent>
      </Card>

      {/* Confidence Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Confidence Indicators Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Confidence indicators help HR assess the reliability and completeness of 
            supporting evidence. These are calculated automatically when the review 
            packet is generated.
          </p>
          
          <div className="space-y-3">
            {confidenceIndicators.map((indicator) => (
              <div key={indicator.name} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-sm">{indicator.name}</h5>
                </div>
                <p className="text-xs text-muted-foreground">{indicator.description}</p>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="p-2 bg-muted/50 rounded">
                    <span className="text-xs font-medium">Calculation:</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{indicator.calculation}</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <span className="text-xs font-medium">Thresholds:</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{indicator.thresholds}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visual Example */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-primary" />
            Review Packet UI Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The review packet displays confidence indicators prominently to guide decision-making.
          </p>
          
          {/* Simulated UI */}
          <div className="border rounded-lg overflow-hidden">
            <div className="p-3 bg-muted border-b">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Confidence Indicators</span>
                <Badge variant="secondary">Auto-calculated</Badge>
              </div>
            </div>
            <div className="p-4 grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">78%</div>
                <div className="text-xs text-muted-foreground">Confidence Score</div>
                <Badge variant="outline" className="mt-1 text-xs bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">Strong</Badge>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm font-medium">Low</span>
                </div>
                <div className="text-xs text-muted-foreground">Bias Risk Level</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Fresh</span>
                </div>
                <div className="text-xs text-muted-foreground">Data Freshness (12 days)</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">7</span>
                </div>
                <div className="text-xs text-muted-foreground">Evidence Sources</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="text-xs text-muted-foreground">Talent Signals</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Strong</span>
                </div>
                <div className="text-xs text-muted-foreground">Recommendation</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Review Nomination Procedure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={reviewSteps} title="" />
        </CardContent>
      </Card>

      {/* Decision Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Approval Decision Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 border border-green-200 dark:border-green-900 rounded-lg bg-green-50/50 dark:bg-green-950/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-sm text-green-800 dark:text-green-300">Approve When</span>
              </div>
              <ul className="text-xs space-y-1">
                <li>• Confidence score ≥60% with no major concerns</li>
                <li>• Pool criteria are met or justified exception exists</li>
                <li>• Manager justification is clear and evidence-based</li>
                <li>• Employee career aspirations align with pool purpose</li>
                <li>• Bias risk is low or has been addressed</li>
              </ul>
            </div>
            
            <div className="p-3 border border-red-200 dark:border-red-900 rounded-lg bg-red-50/50 dark:bg-red-950/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="font-medium text-sm text-red-800 dark:text-red-300">Decline When</span>
              </div>
              <ul className="text-xs space-y-1">
                <li>• Employee does not meet pool criteria without valid exception</li>
                <li>• High bias risk without mitigation</li>
                <li>• Insufficient evidence (source count &lt;3)</li>
                <li>• Stale data (&gt;90 days) without recent assessment</li>
                <li>• Justification lacks specific, verifiable evidence</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <BusinessRules rules={businessRules} />

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            HR Review Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Review nominations within SLA (5 business days) to maintain manager confidence',
              'Use confidence indicators as guidance, not absolute thresholds',
              'Document exceptions clearly when approving despite criteria gaps',
              'Provide constructive, actionable feedback for declined nominations',
              'Escalate pattern issues (repeated weak nominations from same manager) for coaching',
              'Periodically audit approved nominations to validate quality'
            ].map((practice, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
