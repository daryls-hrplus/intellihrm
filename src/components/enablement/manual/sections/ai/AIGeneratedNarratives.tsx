import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, Clock, CheckCircle, Brain, Edit, Shield, Eye, History, Sparkles } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { FieldReferenceTable, FieldDefinition } from '../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../components/StepByStep';

const BUSINESS_RULES = [
  { rule: 'AI narratives require human approval', enforcement: 'System' as const, description: 'Generated content cannot be submitted without explicit manager acceptance.' },
  { rule: 'Version history is maintained', enforcement: 'System' as const, description: 'All versions (generated and edited) are preserved for audit.' },
  { rule: 'Confidence scores must be displayed', enforcement: 'Policy' as const, description: 'ISO 42001 requires transparency about AI certainty levels.' },
  { rule: 'Source data is linked and traceable', enforcement: 'System' as const, description: 'Each narrative references the specific data points used to generate it.' }
];

const NARRATIVE_FIELDS: FieldDefinition[] = [
  { name: 'participant_id', required: true, type: 'uuid', description: 'Reference to the appraisal participant' },
  { name: 'narrative_type', required: true, type: 'select', description: 'Type of narrative (summary, strengths, development, overall)', defaultValue: 'summary' },
  { name: 'generated_content', required: true, type: 'text', description: 'The AI-generated narrative text' },
  { name: 'manager_edited_content', required: false, type: 'text', description: 'Manager\'s edited version of the narrative' },
  { name: 'source_data', required: true, type: 'json', description: 'JSON containing the data points used for generation' },
  { name: 'ai_confidence_score', required: true, type: 'number', description: 'Confidence level of the AI generation (0-100)', validation: '0-100' },
  { name: 'ai_model_used', required: true, type: 'text', description: 'Which AI model produced this narrative' },
  { name: 'is_approved', required: true, type: 'boolean', description: 'Whether the manager has approved this content', defaultValue: 'false' },
  { name: 'approved_by', required: false, type: 'uuid', description: 'Who approved the narrative' },
  { name: 'approved_at', required: false, type: 'timestamp', description: 'When the narrative was approved' },
  { name: 'version', required: true, type: 'number', description: 'Version number for tracking edits', defaultValue: '1' },
  { name: 'iso_human_review_status', required: true, type: 'select', description: 'ISO 42001 human review status', defaultValue: 'pending_review' }
];

const GENERATION_STEPS: Step[] = [
  {
    title: 'Navigate to Performance Summary',
    description: 'Access the narrative generation area.',
    substeps: [
      'Open the employee appraisal in edit mode',
      'Navigate to the "Performance Summary" or "Overall Comments" section',
      'Click the "AI Assist" button to open the narrative generator'
    ],
    expectedResult: 'AI narrative generation panel opens with available options.'
  },
  {
    title: 'Select Narrative Type',
    description: 'Choose what type of narrative to generate.',
    substeps: [
      'Select narrative type: Overall Summary, Strengths Focus, or Development Focus',
      'Review the data sources that will be used (goals, competencies, values, etc.)',
      'Optionally adjust the tone (professional, encouraging, direct)',
      'Click "Generate Narrative"'
    ],
    expectedResult: 'AI processes available data and generates narrative text.'
  },
  {
    title: 'Review Generated Content',
    description: 'Examine the AI output and confidence indicators.',
    substeps: [
      'Read the generated narrative carefully',
      'Check the confidence score indicator',
      'Review the "Data Sources" panel showing what informed the narrative',
      'Note any highlighted areas with lower confidence'
    ],
    expectedResult: 'Narrative displays with transparency about data sources and confidence.'
  },
  {
    title: 'Edit or Accept',
    description: 'Modify the content or approve as-is.',
    substeps: [
      'Click "Edit" to modify the narrative directly',
      'Add personal observations not captured in system data',
      'Adjust phrasing to match your communication style',
      'Click "Accept" when satisfied with the content'
    ],
    expectedResult: 'Narrative is marked as approved and ready for submission.'
  },
  {
    title: 'Submit with Appraisal',
    description: 'Include the approved narrative in the final evaluation.',
    substeps: [
      'Review the narrative in the appraisal form',
      'Verify it appears in the designated field',
      'Complete remaining appraisal sections',
      'Submit the appraisal for workflow processing'
    ],
    expectedResult: 'Narrative is included in submitted appraisal with full audit trail.'
  }
];

export function AIGeneratedNarratives() {
  return (
    <Card id="sec-5-2">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 5.2</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~8 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />Manager / HR Admin</Badge>
        </div>
        <CardTitle className="text-2xl">AI-Generated Narratives</CardTitle>
        <CardDescription>Create cohesive performance summaries from component ratings with AI assistance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-5-2'] || ['Appraisals Manual', 'Chapter 5: AI Features', 'AI-Generated Narratives']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand how AI generates performance narratives from rating data</li>
            <li>Learn the human review workflow for ISO 42001 compliance</li>
            <li>Master the edit and approval process for AI-generated content</li>
            <li>Interpret confidence scores and data source indicators</li>
          </ul>
        </div>

        {/* What are AI-Generated Narratives */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            What are AI-Generated Narratives?
          </h3>
          <p className="text-muted-foreground">
            AI-Generated Narratives transform individual ratings across goals, competencies, 
            responsibilities, and values into coherent, professional performance summaries. 
            Instead of manually synthesizing dozens of data points, managers receive a 
            starting point that captures the full picture of employee performance.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Time Savings</p>
            <p className="text-sm text-muted-foreground mt-1">
              On average, managers save 15-20 minutes per evaluation by starting with 
              AI-generated narratives instead of blank text fields.
            </p>
          </div>
        </div>

        {/* Narrative Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Narrative Types
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { type: 'Overall Summary', description: 'Balanced narrative covering all performance dimensions—strengths, achievements, and areas for growth', useCase: 'Primary use for annual/cycle-end reviews' },
              { type: 'Strengths Focus', description: 'Highlights top achievements, high-rated competencies, and exceptional contributions', useCase: 'Recognition discussions, promotion cases' },
              { type: 'Development Focus', description: 'Emphasizes growth opportunities, gaps, and recommended development actions', useCase: 'IDP creation, coaching conversations' },
              { type: 'Goal Achievement', description: 'Narrative specifically about goal completion and business impact', useCase: 'Objective-focused reviews, bonus discussions' }
            ].map((item) => (
              <Card key={item.type}>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-1">{item.type}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  <Badge variant="outline" className="text-xs">{item.useCase}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Human-in-the-Loop */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            ISO 42001 Human Review Workflow
          </h3>
          <p className="text-muted-foreground">
            All AI-generated content follows a mandatory human review process to ensure 
            accuracy, appropriateness, and compliance with AI governance standards.
          </p>
          <div className="space-y-2">
            {[
              { status: 'pending_review', label: 'Pending Review', description: 'AI has generated content; manager has not yet reviewed', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
              { status: 'under_review', label: 'Under Review', description: 'Manager is actively editing or reviewing the content', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
              { status: 'approved', label: 'Approved', description: 'Manager has accepted the content (with or without edits)', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
              { status: 'rejected', label: 'Rejected', description: 'Manager rejected AI content and wrote manually', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
            ].map((item) => (
              <div key={item.status} className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge className={item.color}>{item.label}</Badge>
                <span className="text-sm text-muted-foreground">{item.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Database Tables */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Related Database Tables</h3>
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">ai_generated_narratives</Badge>
              <span className="text-sm text-muted-foreground">Narrative content and metadata</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">ai_explainability_records</Badge>
              <span className="text-sm text-muted-foreground">Source data and confidence tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">ai_interaction_logs</Badge>
              <span className="text-sm text-muted-foreground">Request/response audit trail</span>
            </div>
          </div>
        </div>

        <StepByStep steps={GENERATION_STEPS} title="Step-by-Step: Generate a Performance Narrative" />

        {/* Version Control */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Version Control & Audit Trail
          </h3>
          <p className="text-muted-foreground">
            Every narrative maintains a complete version history for compliance and transparency:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Version Tracking', description: 'Each edit creates a new version with timestamp and author' },
              { title: 'Original Preserved', description: 'AI-generated original is always accessible, even after edits' },
              { title: 'Diff View', description: 'Compare any two versions to see what changed' },
              { title: 'Audit Export', description: 'Generate compliance reports showing full narrative history' }
            ].map((item) => (
              <div key={item.title} className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <FieldReferenceTable fields={NARRATIVE_FIELDS} title="Narrative Record Fields Reference" />

        <TipCallout title="Best Practice">
          Use AI-generated narratives as a starting point, then personalize with specific 
          examples and observations that only you as the manager would know. This combines 
          AI efficiency with authentic, personalized feedback.
        </TipCallout>

        <WarningCallout title="Important Limitation">
          AI narratives are only as good as the underlying data. If ratings lack comments or 
          evidence, the narrative may be generic. Encourage thorough documentation throughout 
          the performance cycle.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />
      </CardContent>
    </Card>
  );
}
