import { LearningObjectives } from '../../components/LearningObjectives';
import { StepByStep, Step } from '../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../components/FieldReferenceTable';
import { BusinessRules, BusinessRule } from '../../components/BusinessRules';
import { TroubleshootingSection, TroubleshootingItem } from '../../components/TroubleshootingSection';
import { Brain, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const learningObjectives = [
  'Understand ISO 42001 AI management system requirements for 360 feedback',
  'Configure AI usage policies and consent requirements',
  'Review AI action logs and confidence scores',
  'Implement human override workflows for AI recommendations'
];

const aiActionTypes = [
  {
    type: 'bias_detection',
    label: 'Bias Detection',
    description: 'Analyzes feedback for potential bias indicators',
    consentRequired: true,
    humanReview: 'If bias detected',
    confidenceThreshold: 0.7
  },
  {
    type: 'writing_suggestion',
    label: 'Writing Suggestion',
    description: 'Provides feedback quality and specificity suggestions',
    consentRequired: true,
    humanReview: 'Never (advisory only)',
    confidenceThreshold: 0.6
  },
  {
    type: 'signal_extraction',
    label: 'Signal Extraction',
    description: 'Extracts talent signals from feedback patterns',
    consentRequired: true,
    humanReview: 'For high-stakes signals',
    confidenceThreshold: 0.8
  },
  {
    type: 'theme_clustering',
    label: 'Theme Clustering',
    description: 'Groups feedback comments into development themes',
    consentRequired: true,
    humanReview: 'Optional verification',
    confidenceThreshold: 0.75
  },
  {
    type: 'sentiment_analysis',
    label: 'Sentiment Analysis',
    description: 'Analyzes emotional tone of text feedback',
    consentRequired: true,
    humanReview: 'For negative sentiment flags',
    confidenceThreshold: 0.7
  },
  {
    type: 'readiness_scoring',
    label: 'Readiness Scoring',
    description: 'Contributes to role readiness and succession scoring',
    consentRequired: true,
    humanReview: 'Always (high-stakes)',
    confidenceThreshold: 0.85
  }
];

const aiLogFields: FieldDefinition[] = [
  {
    name: 'id',
    required: true,
    type: 'UUID',
    description: 'Unique identifier for the AI action log',
    defaultValue: 'gen_random_uuid()',
    validation: 'Auto-generated'
  },
  {
    name: 'cycle_id',
    required: true,
    type: 'UUID',
    description: 'Reference to the feedback cycle',
    validation: 'Must exist in feedback_360_cycles'
  },
  {
    name: 'action_type',
    required: true,
    type: 'text',
    description: 'Type of AI action performed',
    validation: 'One of defined action types'
  },
  {
    name: 'target_entity_type',
    required: true,
    type: 'text',
    description: 'Type of entity AI action was performed on',
    validation: 'One of: response, participant, cycle, report'
  },
  {
    name: 'target_entity_id',
    required: true,
    type: 'UUID',
    description: 'ID of the entity AI action was performed on',
    validation: 'Must exist in referenced table'
  },
  {
    name: 'model_version',
    required: true,
    type: 'text',
    description: 'Version of the AI model used',
    validation: 'Semantic version format'
  },
  {
    name: 'input_summary',
    required: false,
    type: 'text',
    description: 'Summary of input data (no PII)',
    validation: 'Max 1000 characters'
  },
  {
    name: 'output_summary',
    required: false,
    type: 'text',
    description: 'Summary of AI output/recommendation',
    validation: 'Max 1000 characters'
  },
  {
    name: 'confidence_score',
    required: true,
    type: 'numeric',
    description: 'AI confidence in the output (0-1)',
    validation: 'Range: 0.0-1.0'
  },
  {
    name: 'decision_factors',
    required: false,
    type: 'JSONB',
    description: 'Explainability data: factors influencing the AI decision',
    validation: 'JSON object with factor weights'
  },
  {
    name: 'human_review_required',
    required: true,
    type: 'boolean',
    description: 'Whether human review is needed before action',
    defaultValue: 'false',
    validation: 'Based on action type and confidence threshold'
  },
  {
    name: 'human_reviewed_at',
    required: false,
    type: 'timestamp',
    description: 'When human review was completed',
    validation: 'Set when review is submitted'
  },
  {
    name: 'human_reviewed_by',
    required: false,
    type: 'UUID',
    description: 'User who performed the human review',
    validation: 'Must have AI review permission'
  },
  {
    name: 'human_override_applied',
    required: false,
    type: 'boolean',
    description: 'Whether human modified the AI recommendation',
    defaultValue: 'false',
    validation: 'Boolean'
  },
  {
    name: 'override_reason',
    required: false,
    type: 'text',
    description: 'Justification for overriding AI recommendation',
    validation: 'Required when human_override_applied = true'
  }
];

const reviewSteps: Step[] = [
  {
    title: 'Access AI Audit Log',
    description: 'Navigate to the AI governance panel to review actions.',
    substeps: [
      'Go to Performance → 360 Feedback → Governance → AI Audit Log',
      'Or access from Admin → AI Governance → 360 Feedback Actions',
      'Filter by cycle, action type, or review status'
    ],
    expectedResult: 'AI action log displayed with filtering options'
  },
  {
    title: 'Review Pending Actions',
    description: 'Identify AI actions requiring human review.',
    substeps: [
      'Filter for human_review_required = true AND human_reviewed_at IS NULL',
      'Sort by confidence_score (lowest first for priority review)',
      'Click on action to view details'
    ],
    expectedResult: 'List of pending human review items displayed'
  },
  {
    title: 'Evaluate AI Recommendation',
    description: 'Assess the AI output and decision factors.',
    substeps: [
      'Review output_summary for the recommendation',
      'Examine decision_factors for explainability',
      'Check confidence_score against threshold',
      'View original input data if needed'
    ],
    expectedResult: 'Full understanding of AI recommendation and reasoning'
  },
  {
    title: 'Approve or Override',
    description: 'Make human decision on the AI recommendation.',
    substeps: [
      'Click "Approve" to accept AI recommendation as-is',
      'Click "Override" to modify the recommendation',
      'If overriding: provide override_reason (required)',
      'Submit review decision'
    ],
    expectedResult: 'Human review recorded; action proceeds or is modified'
  }
];

const overrideSteps: Step[] = [
  {
    title: 'Identify Override Scenario',
    description: 'Determine that AI recommendation needs modification.',
    substeps: [
      'Review AI recommendation against domain expertise',
      'Identify specific aspect requiring change',
      'Consider business context not visible to AI'
    ],
    expectedResult: 'Clear rationale for override established'
  },
  {
    title: 'Apply Override',
    description: 'Modify the AI recommendation with human judgment.',
    substeps: [
      'Click "Override" in the review panel',
      'Make necessary modifications to the recommendation',
      'Enter override_reason explaining the change',
      'Select override category (context_missing, policy_exception, accuracy_concern)'
    ],
    expectedResult: 'Override applied with documented justification'
  },
  {
    title: 'Verify Override Impact',
    description: 'Confirm the override has been correctly applied.',
    substeps: [
      'Check that modified recommendation is now active',
      'Verify override is logged in AI audit trail',
      'Confirm downstream systems received updated data'
    ],
    expectedResult: 'Override verified and audit trail complete'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'AI analysis requires explicit consent',
    enforcement: 'System',
    description: 'ai_analysis consent type must be granted before AI features are enabled'
  },
  {
    rule: 'High-stakes actions require human review',
    enforcement: 'System',
    description: 'Readiness scoring, signal extraction always queue for human approval'
  },
  {
    rule: 'Low confidence triggers automatic review',
    enforcement: 'System',
    description: 'Actions below confidence threshold automatically flagged for human review'
  },
  {
    rule: 'Override requires documented justification',
    enforcement: 'System',
    description: 'Cannot override AI recommendation without providing override_reason'
  },
  {
    rule: 'All AI actions are immutably logged',
    enforcement: 'System',
    description: 'Complete audit trail for ISO 42001 compliance'
  },
  {
    rule: 'Model versions tracked for reproducibility',
    enforcement: 'System',
    description: 'model_version recorded to enable audit of AI behavior changes'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'AI features not available for participant',
    cause: 'ai_analysis consent not granted or withdrawn',
    solution: 'Check consent records for the participant. If consent was withdrawn, AI features are correctly disabled. Cannot override consent requirement.'
  },
  {
    issue: 'Too many actions pending human review',
    cause: 'Confidence thresholds set too high or unusual data patterns',
    solution: 'Review threshold settings for each action type. Consider adjusting thresholds if legitimate patterns are being flagged. Add reviewers to share workload.'
  },
  {
    issue: 'Override not reflected in downstream systems',
    cause: 'Propagation delay or integration error',
    solution: 'Check that override was saved successfully. Verify integration webhooks are functioning. Manual sync may be required if integration is down.'
  },
  {
    issue: 'Cannot view decision_factors - showing as empty',
    cause: 'Older AI actions before explainability was implemented',
    solution: 'Explainability logging was added in a recent update. Older actions may not have detailed decision_factors. Future actions will include full explainability.'
  }
];

export function GovernanceAIExplainability() {
  return (
    <section id="sec-4-9" data-manual-anchor="sec-4-9" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          4.9 AI Governance & Explainability
        </h3>
        <p className="text-muted-foreground mt-2">
          ISO 42001 alignment, AI action logging, human overrides, confidence thresholds, and bias monitoring for responsible AI use.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* ISO 42001 Callout */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800 dark:text-blue-200">ISO 42001 Compliance</AlertTitle>
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          The 360 Feedback AI governance framework aligns with ISO/IEC 42001:2023 - Artificial Intelligence Management System requirements.
          Key controls include: explainability logging, human oversight for high-stakes decisions, consent management, and continuous monitoring.
        </AlertDescription>
      </Alert>

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-2">Navigation Path</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Performance</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">360 Feedback</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">Governance</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">AI Audit Log</span>
          </div>
        </CardContent>
      </Card>

      {/* AI Action Types Table */}
      <div>
        <h4 className="font-medium mb-4">AI Action Types</h4>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead className="font-medium">Action Type</TableHead>
                <TableHead className="font-medium">Purpose</TableHead>
                <TableHead className="font-medium">Consent</TableHead>
                <TableHead className="font-medium">Human Review</TableHead>
                <TableHead className="font-medium">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aiActionTypes.map((action) => (
                <TableRow key={action.type}>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{action.type}</code>
                    <p className="text-xs text-muted-foreground mt-1">{action.label}</p>
                  </TableCell>
                  <TableCell className="text-sm max-w-xs">{action.description}</TableCell>
                  <TableCell>
                    {action.consentRequired ? (
                      <Badge className="bg-amber-600 text-white text-xs">Required</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Optional</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{action.humanReview}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-mono">
                      ≥{action.confidenceThreshold}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* AI Governance Diagram */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">AI Action Flow with Human Oversight</h4>
          <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
            <pre>{`
┌─────────────────────────────────────────────────────────────────────────┐
│                    AI ACTION FLOW                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐    ┌──────────┐    ┌─────────────┐    ┌──────────────┐  │
│  │  INPUT   │ ─▶ │AI MODEL  │ ─▶ │  EVALUATE   │ ─▶ │   OUTPUT     │  │
│  │  DATA    │    │PROCESSING│    │ CONFIDENCE  │    │   LOGGED     │  │
│  └──────────┘    └──────────┘    └──────┬──────┘    └──────────────┘  │
│                                         │                               │
│                    ┌────────────────────┼────────────────────┐          │
│                    ▼                    ▼                    ▼          │
│            ┌─────────────┐     ┌──────────────┐     ┌─────────────┐    │
│            │  ABOVE      │     │   BELOW      │     │  ALWAYS     │    │
│            │  THRESHOLD  │     │   THRESHOLD  │     │  REVIEW     │    │
│            └──────┬──────┘     └──────┬───────┘     └──────┬──────┘    │
│                   │                   │                    │            │
│                   ▼                   ▼                    ▼            │
│            ┌─────────────┐     ┌──────────────┐     ┌─────────────┐    │
│            │  AUTO       │     │   QUEUE FOR  │     │  QUEUE FOR  │    │
│            │  PROCEED    │     │  HUMAN REVIEW│     │ HUMAN REVIEW│    │
│            └─────────────┘     └──────┬───────┘     └──────┬──────┘    │
│                                       │                    │            │
│                                       ▼                    ▼            │
│                              ┌──────────────────────────────────┐      │
│                              │        HUMAN REVIEW PANEL         │      │
│                              ├──────────────────────────────────┤      │
│                              │  ┌─────────┐    ┌────────────┐   │      │
│                              │  │ APPROVE │    │  OVERRIDE  │   │      │
│                              │  └─────────┘    └────────────┘   │      │
│                              └──────────────────────────────────┘      │
│                                                                         │
│  EXPLAINABILITY LOGGED:                                                │
│  ─────────────────────                                                 │
│  ● Model version                    ● Decision factors                 │
│  ● Input summary (no PII)           ● Confidence score                 │
│  ● Output summary                   ● Human review outcome             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      <StepByStep 
        steps={reviewSteps} 
        title="Reviewing AI Action Log" 
      />

      <StepByStep 
        steps={overrideSteps} 
        title="Recording Human Override" 
      />

      <FieldReferenceTable 
        fields={aiLogFields} 
        title="AI Action Log Schema (feedback_ai_action_logs)" 
      />

      {/* Confidence Threshold Tip */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-2 text-green-800 dark:text-green-200">
            <CheckCircle className="h-4 w-4" />
            Best Practice: Confidence Thresholds
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300">
            AI actions with confidence below the defined threshold are automatically flagged for human review.
            This ensures that uncertain AI recommendations receive appropriate oversight. Review threshold settings 
            periodically based on observed accuracy and business needs.
          </p>
        </CardContent>
      </Card>

      <BusinessRules rules={businessRules} />

      <TroubleshootingSection 
        items={troubleshootingItems} 
        title="AI Governance Issues" 
      />
    </section>
  );
}
