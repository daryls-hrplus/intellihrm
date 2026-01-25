import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { TroubleshootingSection, TroubleshootingItem } from '../../../components/TroubleshootingSection';
import { MessageSquare, Gauge, Lightbulb, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const learningObjectives = [
  'Understand the four dimensions of feedback quality scoring',
  'Use real-time writing suggestions to improve feedback',
  'Interpret quality scores and improvement recommendations',
  'Configure quality thresholds for your organization'
];

const qualityFields: FieldDefinition[] = [
  {
    name: 'clarity_score',
    required: false,
    type: 'integer',
    description: 'How clear and understandable the feedback is (0-100)',
    defaultValue: 'null',
    validation: '0-100'
  },
  {
    name: 'specificity_score',
    required: false,
    type: 'integer',
    description: 'How specific vs. vague the feedback is (0-100)',
    defaultValue: 'null',
    validation: '0-100'
  },
  {
    name: 'bias_risk_score',
    required: false,
    type: 'integer',
    description: 'Inverse of bias detection - higher is less biased (0-100)',
    defaultValue: 'null',
    validation: '0-100'
  },
  {
    name: 'behavioral_focus_score',
    required: false,
    type: 'integer',
    description: 'How focused on observable behaviors vs. personality (0-100)',
    defaultValue: 'null',
    validation: '0-100'
  },
  {
    name: 'overall_quality_score',
    required: false,
    type: 'integer',
    description: 'Weighted composite of all dimensions (0-100)',
    defaultValue: 'null',
    validation: '0-100'
  },
  {
    name: 'improvement_suggestions',
    required: false,
    type: 'JSONB',
    description: 'Array of specific suggestions to improve feedback quality',
    defaultValue: '[]',
    validation: 'Valid JSON array'
  }
];

const qualityDimensions = [
  {
    dimension: 'Clarity',
    icon: '📝',
    description: 'How clear and understandable is the feedback?',
    low: 'Confusing sentences, unclear meaning',
    high: 'Easy to understand, well-structured',
    weight: 0.25
  },
  {
    dimension: 'Specificity',
    icon: '🎯',
    description: 'Does feedback reference specific examples?',
    low: '"Always does good work"',
    high: '"In the Q3 project, delivered on time with no defects"',
    weight: 0.30
  },
  {
    dimension: 'Bias-Free',
    icon: '⚖️',
    description: 'Is the language neutral and objective?',
    low: 'Gender-coded or stereotyping language',
    high: 'Objective, behavior-focused language',
    weight: 0.20
  },
  {
    dimension: 'Behavioral Focus',
    icon: '👁️',
    description: 'Does feedback describe observable behaviors?',
    low: '"They are smart"',
    high: '"They effectively solved the integration problem by..."',
    weight: 0.25
  }
];

const usageSteps: Step[] = [
  {
    title: 'Start Writing Feedback',
    description: 'Begin typing your feedback response in the text area.',
    substeps: [
      'Navigate to your assigned feedback request',
      'Select a question requiring text response',
      'Start typing your feedback'
    ],
    expectedResult: 'Quality meter appears after 50+ characters typed'
  },
  {
    title: 'Review Real-Time Score',
    description: 'Observe the quality score updating as you type.',
    substeps: [
      'Watch the quality meter in the sidebar',
      'Note which dimensions are scored low',
      'Hover over dimensions for details'
    ],
    expectedResult: 'Current quality score and dimension breakdown visible'
  },
  {
    title: 'Apply Suggestions',
    description: 'Use AI suggestions to improve your feedback.',
    substeps: [
      'Click "View Suggestions" button',
      'Review specific improvement recommendations',
      'Click suggestion to apply or manually edit'
    ],
    expectedResult: 'Feedback quality score improves after applying suggestions'
  },
  {
    title: 'Submit High-Quality Feedback',
    description: 'Finalize and submit once quality target is met.',
    substeps: [
      'Ensure overall score meets threshold (recommended: 70+)',
      'Review final text for accuracy',
      'Click Submit to save feedback'
    ],
    expectedResult: 'Feedback saved with quality metrics for analysis'
  }
];

const beforeAfterExamples = [
  {
    before: 'She is very good at her job and everyone likes working with her.',
    after: 'Maria consistently delivers projects ahead of schedule. During the Q3 product launch, she coordinated across 3 teams and resolved integration issues that could have delayed the release.',
    improvement: '+42 points'
  },
  {
    before: 'He needs to communicate better.',
    after: 'James should provide more context when requesting input from stakeholders. In the budget review, team members needed clearer guidance on the specific decisions being made.',
    improvement: '+38 points'
  }
];

const troubleshootingItems: TroubleshootingItem[] = [
  {
    issue: 'Quality meter not appearing',
    cause: 'Minimum character threshold not met',
    solution: 'Continue typing - meter appears after 50+ characters. For short responses, quality scoring is optional.'
  },
  {
    issue: 'Suggestions not relevant to my context',
    cause: 'AI lacks organization-specific context',
    solution: 'Suggestions are general best practices. Apply judgment based on your organizational culture and context.'
  },
  {
    issue: 'Score dropped after editing',
    cause: 'Changes may have introduced issues',
    solution: 'Review dimension breakdown to identify which aspect decreased. Common: removing specifics or adding vague language.'
  },
  {
    issue: 'Cannot submit with low score',
    cause: 'Organization has minimum quality threshold configured',
    solution: 'Apply suggestions to meet threshold, or contact HR if threshold seems unreasonable for this context.'
  }
];

export function AIWritingQualityAnalysis() {
  return (
    <section id="sec-5-4" data-manual-anchor="sec-5-4" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          5.4 Writing Quality Analysis
        </h3>
        <p className="text-muted-foreground mt-2">
          Real-time AI analysis of feedback quality with actionable improvement suggestions.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Navigation Path */}
      <div className="p-3 bg-muted rounded-lg">
        <span className="text-sm font-medium">Navigation Path: </span>
        <span className="text-sm text-muted-foreground">
          ESS → 360 Feedback → My Requests → Provide Feedback → [Question] → Writing Assistant
        </span>
      </div>

      {/* Quality Dimensions */}
      <div>
        <h4 className="font-medium flex items-center gap-2 mb-4">
          <Gauge className="h-4 w-4" />
          Quality Dimensions
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {qualityDimensions.map((d) => (
            <Card key={d.dimension}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{d.icon}</span>
                    <h5 className="font-medium">{d.dimension}</h5>
                  </div>
                  <Badge variant="outline">Weight: {(d.weight * 100).toFixed(0)}%</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{d.description}</p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-red-500 font-medium">Low:</span>
                    <span className="text-muted-foreground italic">{d.low}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500 font-medium">High:</span>
                    <span className="text-muted-foreground italic">{d.high}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quality Score Visualization */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Quality Score Interpretation</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-24 h-8 bg-gradient-to-r from-red-500 via-amber-500 to-green-500 rounded flex items-center justify-between px-2 text-xs font-bold text-white">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
              <span className="text-sm text-muted-foreground">Overall Quality Score Range</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="font-bold text-red-600">0-49</div>
                <div className="text-xs text-muted-foreground">Needs Improvement</div>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="font-bold text-amber-600">50-69</div>
                <div className="text-xs text-muted-foreground">Acceptable</div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="font-bold text-green-600">70-100</div>
                <div className="text-xs text-muted-foreground">High Quality</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Before/After Examples */}
      <div>
        <h4 className="font-medium flex items-center gap-2 mb-4">
          <Lightbulb className="h-4 w-4" />
          Before & After Examples
        </h4>
        <div className="space-y-4">
          {beforeAfterExamples.map((ex, idx) => (
            <Card key={idx}>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="text-xs font-medium text-red-600 mb-2">Before (Low Score)</div>
                    <p className="text-sm italic">"{ex.before}"</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-green-600">After (High Score)</span>
                      <Badge className="bg-green-500">{ex.improvement}</Badge>
                    </div>
                    <p className="text-sm italic">"{ex.after}"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <StepByStep steps={usageSteps} title="Using the Writing Quality Assistant" />

      <FieldReferenceTable 
        fields={qualityFields} 
        title="Writing Quality Fields (feedback_writing_quality)" 
      />

      <TroubleshootingSection items={troubleshootingItems} />

      {/* Tip Callout */}
      <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950 rounded-r-lg">
        <div className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h5 className="font-medium text-sm">Quality Impact</h5>
            <p className="text-sm text-muted-foreground mt-1">
              Organizations using the writing quality assistant report a 23% improvement in average 
              feedback quality scores and higher recipient satisfaction with feedback usefulness.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
