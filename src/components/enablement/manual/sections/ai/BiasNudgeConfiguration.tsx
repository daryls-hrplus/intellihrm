import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Users, Clock, CheckCircle, AlertTriangle, MessageSquare, Settings, Shield, BookOpen, Lightbulb } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { BusinessRules } from '../../components/BusinessRules';
import { FieldReferenceTable, FieldDefinition } from '../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../components/StepByStep';

const BUSINESS_RULES = [
  { rule: 'Nudges are non-blocking by default', enforcement: 'Policy' as const, description: 'Managers can acknowledge and proceed; blocking requires explicit configuration.' },
  { rule: 'Nudge templates support localization', enforcement: 'System' as const, description: 'Messages can be configured in multiple languages.' },
  { rule: 'Educational content is optional but recommended', enforcement: 'Policy' as const, description: 'Links to learning resources improve long-term behavior change.' },
  { rule: 'Nudge interactions are logged', enforcement: 'System' as const, description: 'All acknowledgments and dismissals are tracked for analytics.' }
];

const NUDGE_TEMPLATE_FIELDS: FieldDefinition[] = [
  { name: 'template_name', required: true, type: 'text', description: 'Internal name for this nudge template', validation: 'Max 100 characters' },
  { name: 'bias_type', required: true, type: 'select', description: 'Type of bias this nudge addresses', validation: 'gender | age | recency | halo | leniency | etc.' },
  { name: 'severity_level', required: true, type: 'select', description: 'Severity classification for this bias type', defaultValue: 'medium', validation: 'low | medium | high | critical' },
  { name: 'nudge_title', required: true, type: 'text', description: 'Brief title shown in the nudge alert', validation: 'Max 60 characters' },
  { name: 'nudge_message', required: true, type: 'text', description: 'Full message explaining the potential bias and suggestion', validation: 'Max 500 characters' },
  { name: 'education_link', required: false, type: 'url', description: 'Link to learning content about this bias type' },
  { name: 'education_text', required: false, type: 'text', description: 'Brief educational snippet shown with the nudge' },
  { name: 'is_blocking', required: true, type: 'boolean', description: 'Whether manager must address before proceeding', defaultValue: 'false' },
  { name: 'requires_acknowledgment', required: true, type: 'boolean', description: 'Whether explicit acknowledgment is required', defaultValue: 'true' },
  { name: 'is_active', required: true, type: 'boolean', description: 'Whether this nudge template is enabled', defaultValue: 'true' }
];

const SETUP_STEPS: Step[] = [
  {
    title: 'Access Bias Nudge Configuration',
    description: 'Navigate to the nudge template management area.',
    substeps: [
      'Go to Settings → AI Features → Bias Detection',
      'Click "Nudge Templates" tab',
      'Review existing templates or create new ones'
    ],
    expectedResult: 'Nudge template list displays with bias types and activation status.'
  },
  {
    title: 'Create or Edit a Nudge Template',
    description: 'Configure the message and behavior for a bias type.',
    substeps: [
      'Click "Add Template" or select existing to edit',
      'Select the bias type this nudge addresses',
      'Set severity level (affects visual urgency)',
      'Enter the nudge title (shown in alert header)',
      'Write the full nudge message with constructive suggestion'
    ],
    expectedResult: 'Nudge form populated with bias type and messaging fields.'
  },
  {
    title: 'Add Educational Content',
    description: 'Include learning resources to support behavior change.',
    substeps: [
      'Enable "Include Educational Content" toggle',
      'Enter a brief educational snippet (2-3 sentences)',
      'Add a link to detailed learning content (LMS course, article)',
      'Preview how the nudge will appear to managers'
    ],
    expectedResult: 'Educational section appears in nudge preview.'
  },
  {
    title: 'Configure Response Behavior',
    description: 'Set how managers must interact with the nudge.',
    substeps: [
      'Choose if nudge is blocking (must address) or advisory',
      'Enable or disable acknowledgment requirement',
      'Set timeout behavior if applicable',
      'Configure follow-up nudge if manager doesn\'t change behavior'
    ],
    expectedResult: 'Behavior settings saved; preview shows expected interaction flow.'
  },
  {
    title: 'Activate and Test',
    description: 'Enable the nudge and validate in test mode.',
    substeps: [
      'Toggle "Active" to enable the template',
      'Use "Test Mode" to trigger nudge with sample text',
      'Verify appearance and messaging are appropriate',
      'Save and deploy to production'
    ],
    expectedResult: 'Nudge template active and triggering for real evaluations.'
  }
];

export function BiasNudgeConfiguration() {
  return (
    <Card id="sec-5-8">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 5.8</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~8 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />HR Admin</Badge>
        </div>
        <CardTitle className="text-2xl">Bias Nudge Configuration</CardTitle>
        <CardDescription>Configure the messages and educational content shown when AI detects potential bias</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-5-8'] || ['Appraisals Manual', 'Chapter 5: AI Features', 'Bias Nudge Configuration']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand the purpose and philosophy of bias nudges</li>
            <li>Create and configure nudge templates for different bias types</li>
            <li>Add educational content to support manager development</li>
            <li>Set appropriate response behaviors (blocking vs. advisory)</li>
          </ul>
        </div>

        {/* What are Bias Nudges */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            What are Bias Nudges?
          </h3>
          <p className="text-muted-foreground">
            Bias nudges are contextual alerts that appear when AI detects potentially biased 
            language or patterns in performance evaluations. Unlike hard blocks, nudges gently 
            encourage managers to reconsider their wording while educating them about unconscious 
            bias—leading to lasting behavior change rather than mere compliance.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Design Philosophy</p>
            <p className="text-sm text-muted-foreground mt-1">
              "Coach, don't police." Nudges are designed to be helpful, not punitive. 
              They assume positive intent and offer constructive alternatives rather than 
              accusations of bias.
            </p>
          </div>
        </div>

        {/* Bias Types Covered */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Bias Types & Default Nudges
          </h3>
          <div className="space-y-3">
            {[
              { type: 'Gender Bias', example: '"She\'s aggressive" vs "He\'s assertive"', nudge: 'Consider whether this description would apply equally to all genders.' },
              { type: 'Age Bias', example: 'References to "keeping up" or "energy"', nudge: 'Focus on demonstrated performance rather than perceived generational traits.' },
              { type: 'Recency Bias', example: 'Recent project dominates full-year review', nudge: 'Consider the full review period—are earlier accomplishments reflected?' },
              { type: 'Halo Effect', example: 'One strength influences all ratings', nudge: 'Each competency should be rated independently based on specific evidence.' },
              { type: 'Leniency/Strictness', example: 'All ratings cluster at extremes', nudge: 'Your rating distribution differs significantly from organizational norms.' },
              { type: 'Vague Language', example: '"Good attitude" without examples', nudge: 'Add specific behavioral examples to make this feedback actionable.' }
            ].map((item) => (
              <div key={item.type} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-1">{item.type}</h4>
                <p className="text-sm text-muted-foreground mb-2"><strong>Example:</strong> {item.example}</p>
                <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                  <MessageSquare className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                  <span>{item.nudge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database Tables */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Related Database Tables</h3>
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">bias_nudge_templates</Badge>
              <span className="text-sm text-muted-foreground">Nudge message templates by bias type</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">bias_nudge_interactions</Badge>
              <span className="text-sm text-muted-foreground">Manager acknowledgments and responses</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">bias_detection_logs</Badge>
              <span className="text-sm text-muted-foreground">AI detection events and triggers</span>
            </div>
          </div>
        </div>

        <StepByStep steps={SETUP_STEPS} title="Step-by-Step: Configure a Bias Nudge Template" />

        {/* Severity Levels */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Severity Levels & Visual Treatment
          </h3>
          <div className="space-y-2">
            {[
              { level: 'Low', visual: 'Info icon, subtle blue styling', behavior: 'Informational only, no acknowledgment required', example: 'Minor vagueness in language' },
              { level: 'Medium', visual: 'Warning icon, yellow styling', behavior: 'Acknowledgment required but not blocking', example: 'Potential recency bias detected' },
              { level: 'High', visual: 'Alert icon, orange styling', behavior: 'Acknowledgment required, may trigger HR review', example: 'Gender-coded language detected' },
              { level: 'Critical', visual: 'Stop icon, red styling', behavior: 'Blocking—must address before submission', example: 'Clear discriminatory language' }
            ].map((item) => (
              <div key={item.level} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold">{item.level}</h4>
                  <Badge variant="outline">{item.visual}</Badge>
                </div>
                <p className="text-sm text-muted-foreground"><strong>Behavior:</strong> {item.behavior}</p>
                <p className="text-xs text-primary mt-1"><strong>Example:</strong> {item.example}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Educational Content */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Adding Educational Content
          </h3>
          <p className="text-muted-foreground">
            Nudges are most effective when they include brief educational content:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Inline Snippet', description: '2-3 sentences explaining the bias and why it matters', example: '"Recency bias causes recent events to disproportionately influence evaluations. Research shows..."' },
              { title: 'Learning Link', description: 'URL to LMS course, article, or video on the topic', example: 'Link to 15-minute microlearning on unconscious bias' },
              { title: 'Alternative Phrasing', description: 'Suggested rewording that avoids the detected issue', example: '"Consider: \'Demonstrates leadership\' instead of \'Bossy\'"' },
              { title: 'Reflection Prompt', description: 'Question to encourage self-reflection', example: '"Would you use this same description for a male colleague?"' }
            ].map((item) => (
              <div key={item.title} className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                <p className="text-xs italic text-primary mt-2">{item.example}</p>
              </div>
            ))}
          </div>
        </div>

        <FieldReferenceTable fields={NUDGE_TEMPLATE_FIELDS} title="Nudge Template Fields Reference" />

        <TipCallout title="Best Practice">
          Test nudge messages with a diverse group of managers before deployment. 
          Language that feels constructive to some may feel accusatory to others—iterate 
          until the tone is consistently helpful.
        </TipCallout>

        <WarningCallout title="Important Consideration">
          Over-nudging can lead to alert fatigue. Reserve blocking nudges for critical 
          issues and use advisory nudges for educational opportunities.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />
      </CardContent>
    </Card>
  );
}
