import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Users, Clock, CheckCircle, Settings, Brain, Layers, Target, BookOpen, Gauge } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { FieldReferenceTable, FieldDefinition } from '../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../components/StepByStep';

const BUSINESS_RULES = [
  { rule: 'Potential templates must have at least 3 questions', enforcement: 'System' as const, description: 'Minimum question count ensures meaningful assessment coverage.' },
  { rule: 'Category weights must sum to 100%', enforcement: 'System' as const, description: 'Weighted categories must total exactly 100% for score calculation.' },
  { rule: 'Questions require both rating scale and weight', enforcement: 'System' as const, description: 'Each question needs a scale (1-5) and percentage weight within its category.' },
  { rule: 'Template changes do not affect active assessments', enforcement: 'Policy' as const, description: 'Modifications only apply to future potential assessments.' }
];

const TEMPLATE_FIELDS: FieldDefinition[] = [
  { name: 'template_name', required: true, type: 'text', description: 'Unique name for the potential assessment template', validation: 'Max 100 characters' },
  { name: 'description', required: false, type: 'text', description: 'Purpose and usage notes for this template', defaultValue: 'Empty' },
  { name: 'assessment_type', required: true, type: 'select', description: 'Type of potential being assessed (leadership, technical, general)', defaultValue: 'general' },
  { name: 'is_active', required: true, type: 'boolean', description: 'Whether this template is available for use', defaultValue: 'true' },
  { name: 'min_assessor_level', required: false, type: 'select', description: 'Minimum seniority level required to complete assessments', defaultValue: 'Manager' }
];

const QUESTION_FIELDS: FieldDefinition[] = [
  { name: 'question_text', required: true, type: 'text', description: 'The question presented to the assessor', validation: 'Max 500 characters' },
  { name: 'category', required: true, type: 'select', description: 'Category this question belongs to (Learning Agility, Leadership, etc.)' },
  { name: 'weight', required: true, type: 'number', description: 'Percentage weight within the category', validation: '1-100, must sum to 100% per category' },
  { name: 'help_text', required: false, type: 'text', description: 'Guidance shown to assessors when answering', defaultValue: 'Empty' },
  { name: 'behavioral_indicators', required: false, type: 'json', description: 'Example behaviors for each rating level' },
  { name: 'sort_order', required: true, type: 'number', description: 'Display order within the category', defaultValue: 'Auto-assigned' }
];

const SETUP_STEPS: Step[] = [
  {
    title: 'Navigate to Potential Assessment Templates',
    description: 'Access the configuration area for potential assessments.',
    substeps: [
      'Go to Settings → Performance → Potential Assessment',
      'Click "Templates" tab in the top navigation',
      'Review existing templates or click "Create Template"'
    ],
    expectedResult: 'Template management screen displays with list of existing templates or empty state.'
  },
  {
    title: 'Create a New Template',
    description: 'Set up the basic template structure.',
    substeps: [
      'Click "Create Template" button',
      'Enter a descriptive template name (e.g., "Leadership Potential Assessment 2024")',
      'Select the assessment type (Leadership, Technical, General)',
      'Add an optional description explaining when to use this template',
      'Set the minimum assessor level if applicable'
    ],
    expectedResult: 'Template record created and question editor opens.'
  },
  {
    title: 'Configure Assessment Categories',
    description: 'Define the major categories that group related questions.',
    substeps: [
      'Click "Add Category" to create a new grouping',
      'Enter category name (e.g., "Learning Agility", "Strategic Thinking")',
      'Set the category weight as a percentage of total score',
      'Repeat for each category—weights must sum to 100%',
      'Drag categories to reorder if needed'
    ],
    expectedResult: 'Categories display with weight distribution totaling 100%.'
  },
  {
    title: 'Add Questions to Each Category',
    description: 'Create specific assessment questions within categories.',
    substeps: [
      'Select a category from the list',
      'Click "Add Question" within that category',
      'Enter the question text (be specific and observable)',
      'Set the question weight within the category',
      'Add help text to guide assessors',
      'Optionally add behavioral indicators for each rating level'
    ],
    expectedResult: 'Questions appear under their category with configured weights.'
  },
  {
    title: 'Validate and Activate',
    description: 'Verify configuration and enable for use.',
    substeps: [
      'Review the weight distribution summary',
      'Check that all required fields are completed',
      'Click "Validate Template" to check for errors',
      'Toggle "Active" to make available for assessments',
      'Click "Save Template" to finalize'
    ],
    expectedResult: 'Template shows "Active" status and appears in Nine-Box configuration options.'
  }
];

export function PotentialAssessmentConfig() {
  return (
    <Card id="sec-4-3">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 4.3</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~10 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />HR Admin</Badge>
        </div>
        <CardTitle className="text-2xl">Potential Assessment Configuration</CardTitle>
        <CardDescription>Configure templates and questions to assess employee potential for Nine-Box placement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-4-3'] || ['Appraisals Manual', 'Chapter 4: Calibration Sessions', 'Potential Assessment Configuration']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand how potential assessment feeds into Nine-Box placement</li>
            <li>Create and configure potential assessment templates</li>
            <li>Design effective questions across key potential categories</li>
            <li>Set appropriate weights for balanced scoring</li>
          </ul>
        </div>

        {/* Why Potential Assessment Matters */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Why Potential Assessment Matters
          </h3>
          <p className="text-muted-foreground">
            While performance measures what an employee has accomplished, potential predicts 
            what they could achieve with growth and opportunity. The Nine-Box grid requires 
            both dimensions to make informed talent decisions—potential assessment provides 
            the structured methodology for evaluating future capability.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Nine-Box Integration</p>
            <p className="text-sm text-muted-foreground mt-1">
              The potential score from this assessment determines vertical placement on the 
              Nine-Box grid. Combined with performance rating, it classifies employees into 
              talent segments (Star, High Potential, Core Player, etc.).
            </p>
          </div>
        </div>

        {/* Assessment Categories */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Standard Potential Categories
          </h3>
          <p className="text-muted-foreground">
            Research-backed categories commonly used to assess future potential:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Brain, title: 'Learning Agility', desc: 'Speed of acquiring new skills, adaptability to change, curiosity and openness to feedback', weight: '25%' },
              { icon: Target, title: 'Leadership Capacity', desc: 'Ability to influence others, develop teams, and drive organizational outcomes', weight: '25%' },
              { icon: Gauge, title: 'Strategic Thinking', desc: 'Long-term vision, systems thinking, ability to connect decisions to business impact', weight: '20%' },
              { icon: BookOpen, title: 'Self-Awareness', desc: 'Understanding of strengths/weaknesses, receptiveness to coaching, emotional intelligence', weight: '15%' },
              { icon: Settings, title: 'Drive & Ambition', desc: 'Motivation to grow, resilience under pressure, career aspiration alignment', weight: '15%' }
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{item.title}</h4>
                      <Badge variant="secondary">{item.weight}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Database Tables */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Related Database Tables</h3>
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">potential_assessment_templates</Badge>
              <span className="text-sm text-muted-foreground">Template definitions and metadata</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">potential_assessment_questions</Badge>
              <span className="text-sm text-muted-foreground">Questions within each template</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">potential_assessments</Badge>
              <span className="text-sm text-muted-foreground">Completed assessment records</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">potential_assessment_responses</Badge>
              <span className="text-sm text-muted-foreground">Individual question responses</span>
            </div>
          </div>
        </div>

        <StepByStep steps={SETUP_STEPS} title="Step-by-Step: Create a Potential Assessment Template" />

        {/* Sample Questions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Example Questions by Category</h3>
          <div className="space-y-3">
            {[
              { category: 'Learning Agility', questions: ['How quickly does this person adapt to new technologies or processes?', 'How effectively do they apply lessons from past experiences to new situations?'] },
              { category: 'Leadership Capacity', questions: ['How well do they motivate and develop team members?', 'How effectively do they make decisions under ambiguity?'] },
              { category: 'Strategic Thinking', questions: ['How well do they anticipate long-term implications of decisions?', 'How effectively do they balance tactical execution with strategic vision?'] }
            ].map((cat) => (
              <div key={cat.category} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">{cat.category}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {cat.questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <FieldReferenceTable fields={TEMPLATE_FIELDS} title="Template Fields Reference" />
        <FieldReferenceTable fields={QUESTION_FIELDS} title="Question Fields Reference" />

        <TipCallout title="Best Practice">
          Include behavioral indicators for each rating level (1-5) in your questions. 
          This helps assessors calibrate their ratings and improves consistency across evaluators.
        </TipCallout>

        <WarningCallout title="Important Consideration">
          Potential assessment is inherently subjective. Consider requiring multiple assessors 
          (manager + skip-level) and averaging scores to reduce individual bias.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />
      </CardContent>
    </Card>
  );
}
