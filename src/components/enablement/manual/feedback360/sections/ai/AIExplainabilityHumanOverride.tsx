import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { FileCheck, Eye, Edit, Shield, Database } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const learningObjectives = [
  'Understand ISO 42001 explainability requirements',
  'Review AI action logs and decision factors',
  'Document human overrides with proper justification',
  'Maintain audit trail for compliance'
];

const actionTypes = [
  {
    type: 'signal_extraction',
    description: 'Converting feedback responses into talent signals',
    confidence: 'Required',
    humanReview: 'Low priority'
  },
  {
    type: 'theme_generation',
    description: 'Identifying development themes from patterns',
    confidence: 'Required',
    humanReview: 'High priority - confirmation required'
  },
  {
    type: 'bias_detection',
    description: 'Flagging potentially biased language',
    confidence: 'Required',
    humanReview: 'Medium - dispute option'
  },
  {
    type: 'sentiment_analysis',
    description: 'Classifying emotional tone of feedback',
    confidence: 'Required',
    humanReview: 'Low priority'
  },
  {
    type: 'quality_scoring',
    description: 'Rating feedback clarity, specificity, etc.',
    confidence: 'Required',
    humanReview: 'Low priority'
  },
  {
    type: 'coaching_prompt',
    description: 'Generating manager conversation starters',
    confidence: 'Optional',
    humanReview: 'Optional customization'
  },
  {
    type: 'incident_response',
    description: 'Documenting AI-related incidents and remediation',
    confidence: 'N/A',
    humanReview: 'Required - full documentation'
  }
];

const aiActionFields: FieldDefinition[] = [
  {
    name: 'action_type',
    required: true,
    type: 'text',
    description: 'Type of AI action performed',
    defaultValue: '—',
    validation: 'Valid action type'
  },
  {
    name: 'model_version',
    required: false,
    type: 'text',
    description: 'AI model version used for reproducibility',
    defaultValue: 'null',
    validation: 'Semantic version'
  },
  {
    name: 'input_summary',
    required: false,
    type: 'JSONB',
    description: 'Summary of input data (not raw PII)',
    defaultValue: '{}',
    validation: 'Valid JSON'
  },
  {
    name: 'output_summary',
    required: false,
    type: 'JSONB',
    description: 'Summary of AI output for audit',
    defaultValue: '{}',
    validation: 'Valid JSON'
  },
  {
    name: 'confidence_score',
    required: false,
    type: 'decimal',
    description: 'AI confidence in the output (0-1)',
    defaultValue: 'null',
    validation: '0.0 - 1.0'
  },
  {
    name: 'decision_factors',
    required: false,
    type: 'JSONB',
    description: 'Factors that influenced the AI decision',
    defaultValue: '{}',
    validation: 'Valid JSON'
  },
  {
    name: 'human_override',
    required: false,
    type: 'boolean',
    description: 'Whether a human overrode the AI output',
    defaultValue: 'false',
    validation: 'Boolean'
  },
  {
    name: 'override_reason',
    required: false,
    type: 'text',
    description: 'Documented reason for human override',
    defaultValue: 'null',
    validation: 'Required if human_override=true'
  },
  {
    name: 'override_by',
    required: false,
    type: 'UUID',
    description: 'User who performed the override',
    defaultValue: 'null',
    validation: 'Valid user ID'
  }
];

const reviewSteps: Step[] = [
  {
    title: 'Access AI Audit Log',
    description: 'Navigate to the governance section for AI action review.',
    substeps: [
      'Go to Performance → 360 Feedback → Governance → AI Audit Log',
      'Or access from specific employee/cycle context',
      'Filter by action type, date range, or confidence level'
    ],
    expectedResult: 'List of AI actions with summary data'
  },
  {
    title: 'Review Action Details',
    description: 'Examine a specific AI action for explainability.',
    substeps: [
      'Click on an action row to expand details',
      'Review input_summary and output_summary',
      'Examine decision_factors that influenced the output'
    ],
    expectedResult: 'Full understanding of why AI made this decision'
  },
  {
    title: 'Record Human Override (if needed)',
    description: 'Document when you disagree with AI output.',
    substeps: [
      'Click "Record Override" button',
      'Select override reason category',
      'Provide detailed justification (required)',
      'Submit override'
    ],
    expectedResult: 'Override recorded; AI output marked as overridden'
  }
];

const overrideSteps: Step[] = [
  {
    title: 'Identify Action to Override',
    description: 'Find the AI action you want to correct.',
    substeps: [
      'Navigate to the AI action (theme, bias warning, etc.)',
      'Verify you have permission to override (HR/Admin)',
      'Click "Override AI Decision"'
    ],
    expectedResult: 'Override dialog opens'
  },
  {
    title: 'Document Override Justification',
    description: 'Provide clear reasoning for the override.',
    substeps: [
      'Select category: Incorrect, Incomplete, Context-specific, Policy-based',
      'Enter detailed justification (minimum 50 characters)',
      'Optionally attach supporting evidence'
    ],
    expectedResult: 'Justification captured for audit'
  },
  {
    title: 'Submit and Confirm',
    description: 'Finalize the override.',
    substeps: [
      'Review override summary',
      'Confirm you understand audit implications',
      'Click "Submit Override"'
    ],
    expectedResult: 'AI action marked as overridden; new value applied'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'All AI outputs are logged',
    enforcement: 'System',
    description: 'Every AI action creates a record in feedback_ai_action_logs'
  },
  {
    rule: 'Confidence score required',
    enforcement: 'System',
    description: 'AI must provide confidence score for all outputs'
  },
  {
    rule: 'Override requires justification',
    enforcement: 'System',
    description: 'human_override=true requires non-empty override_reason'
  },
  {
    rule: 'Model version tracked',
    enforcement: 'System',
    description: 'AI model version recorded for reproducibility in audits'
  },
  {
    rule: 'PII minimization in logs',
    enforcement: 'System',
    description: 'Input/output summaries contain aggregated data, not raw PII'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Cannot find AI action in audit log',
    cause: 'Action may be filtered or from a different cycle',
    solution: 'Clear filters; check cycle selector; verify action completed (not in-progress)'
  },
  {
    issue: 'Override option not available',
    cause: 'Insufficient permissions or action type not overridable',
    solution: 'Contact HR Admin; some actions (e.g., logging) cannot be overridden'
  },
  {
    issue: 'Decision factors unclear',
    cause: 'Complex AI models may have abstract factors',
    solution: 'Focus on confidence score and output summary; request AI team explanation if needed'
  }
];

export function AIExplainabilityHumanOverride() {
  return (
    <section id="sec-5-12" data-manual-anchor="sec-5-12" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          5.12 AI Explainability & Human Override
        </h3>
        <p className="text-muted-foreground mt-2">
          ISO 42001-compliant AI governance with full audit logging and human override documentation.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Navigation Path */}
      <div className="p-3 bg-muted rounded-lg">
        <span className="text-sm font-medium">Navigation Path: </span>
        <span className="text-sm text-muted-foreground">
          Performance → 360 Feedback → Governance → AI Audit Log
        </span>
      </div>

      {/* ISO 42001 Callout */}
      <div className="p-4 border-l-4 border-l-primary bg-primary/5 rounded-r-lg">
        <div className="flex items-start gap-2">
          <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-medium">ISO 42001 AI Management System Alignment</h5>
            <p className="text-sm text-muted-foreground mt-1">
              This module implements ISO 42001 requirements for AI transparency, accountability, and 
              human oversight. All AI decisions are logged with decision factors, confidence scores, 
              and model versions for reproducibility. Human overrides are documented with justification 
              to maintain audit compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Action Types */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Database className="h-4 w-4" />
            AI Action Types & Review Requirements
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Action Type</th>
                  <th className="text-left p-2 font-medium">Description</th>
                  <th className="text-center p-2 font-medium">Confidence</th>
                  <th className="text-center p-2 font-medium">Human Review</th>
                </tr>
              </thead>
              <tbody>
                {actionTypes.map((at) => (
                  <tr key={at.type} className="border-b">
                    <td className="p-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">{at.type}</code>
                    </td>
                    <td className="p-2 text-muted-foreground">{at.description}</td>
                    <td className="p-2 text-center">
                      <Badge variant={at.confidence === 'Required' ? 'default' : 'outline'}>
                        {at.confidence}
                      </Badge>
                    </td>
                    <td className="p-2 text-center text-xs">{at.humanReview}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Explainability View Example */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Eye className="h-4 w-4" />
            AI Action Detail View (Example)
          </h4>
          <div className="border-2 border-dashed rounded-lg p-4 bg-muted/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge>theme_generation</Badge>
                <span className="text-sm text-muted-foreground">2024-01-15 14:32:08</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200">
                Confidence: 0.87
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-background border rounded-lg">
                <span className="text-xs font-medium text-muted-foreground uppercase">Input Summary</span>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Cycle: 2024 Q1 360 Feedback</li>
                  <li>• Employee signals: 8 extracted</li>
                  <li>• Rater responses: 12 analyzed</li>
                </ul>
              </div>
              <div className="p-3 bg-background border rounded-lg">
                <span className="text-xs font-medium text-muted-foreground uppercase">Output Summary</span>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Themes generated: 3</li>
                  <li>• Primary: "Communication Development"</li>
                  <li>• Linked signals: 4</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-background border rounded-lg">
              <span className="text-xs font-medium text-muted-foreground uppercase">Decision Factors</span>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Signal clustering: 0.82</Badge>
                <Badge variant="outline" className="text-xs">Pattern frequency: 4/12 responses</Badge>
                <Badge variant="outline" className="text-xs">Competency alignment: Strong</Badge>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                <Edit className="h-3 w-3 mr-1" />
                Record Override
              </Badge>
              <Badge variant="outline" className="text-xs">Model: gpt-4-turbo-2024-01</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep steps={reviewSteps} title="Reviewing AI Action Logs" />

      <StepByStep steps={overrideSteps} title="Recording a Human Override" />

      <FieldReferenceTable 
        fields={aiActionFields} 
        title="AI Action Log Fields (feedback_ai_action_logs)" 
      />

      <BusinessRules rules={businessRules} />

      <TroubleshootingSection items={troubleshootingItems} />

      {/* Confidence Display Requirements */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Confidence Score Display Requirements</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">High Confidence (≥0.8)</span>
              </div>
              <span className="text-xs text-muted-foreground">Standard display; auto-processing allowed</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm">Medium Confidence (0.5-0.79)</span>
              </div>
              <span className="text-xs text-muted-foreground">Flagged for review; caution indicator</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm">Low Confidence (&lt;0.5)</span>
              </div>
              <span className="text-xs text-muted-foreground">Human review required before action</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
