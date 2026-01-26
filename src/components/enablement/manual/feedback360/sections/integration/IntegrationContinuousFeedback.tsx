import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  RefreshCw, 
  Calendar, 
  Link2, 
  Clock,
  Lightbulb,
  Users,
  TrendingUp
} from 'lucide-react';
import { 
  LearningObjectives, 
  InfoCallout, 
  TipCallout,
  FieldReferenceTable,
  BusinessRules,
  type FieldDefinition,
  type BusinessRule 
} from '@/components/enablement/manual/components';

const continuousFeedbackFields: FieldDefinition[] = [
  {
    name: 'linked_360_cycle_id',
    required: false,
    type: 'UUID',
    description: 'Associates continuous feedback with a formal 360 cycle',
    defaultValue: 'null',
    validation: 'Optional linkage for context'
  },
  {
    name: 'feedback_type',
    required: true,
    type: 'text',
    description: 'Type of continuous feedback',
    defaultValue: '—',
    validation: 'Enum: praise, constructive, question, observation'
  },
  {
    name: 'is_360_evidence',
    required: false,
    type: 'boolean',
    description: 'Whether this feedback can serve as 360 evidence',
    defaultValue: 'false',
    validation: 'Opt-in flag for raters'
  },
  {
    name: 'development_theme_id',
    required: false,
    type: 'UUID',
    description: 'Links to a development theme from prior 360',
    defaultValue: 'null',
    validation: 'For tracking progress on themes'
  }
];

const cycleIntegrationFields: FieldDefinition[] = [
  {
    name: 'continuous_feedback_enabled',
    required: false,
    type: 'boolean',
    description: 'Whether to pull continuous feedback into 360 context',
    defaultValue: 'false',
    validation: 'Cycle-level configuration'
  },
  {
    name: 'continuous_feedback_window_days',
    required: false,
    type: 'integer',
    description: 'How far back to look for continuous feedback',
    defaultValue: '90',
    validation: 'Typically 90-180 days'
  },
  {
    name: 'include_check_ins',
    required: false,
    type: 'boolean',
    description: 'Whether goal check-ins contribute as evidence',
    defaultValue: 'false',
    validation: 'Separate from peer feedback'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'Continuous feedback is supplementary',
    enforcement: 'Advisory',
    description: 'Continuous feedback enriches but does not replace formal 360 responses'
  },
  {
    rule: 'Evidence opt-in required',
    enforcement: 'System',
    description: 'Only feedback marked is_360_evidence=true contributes to 360 context'
  },
  {
    rule: 'Anonymity maintained',
    enforcement: 'System',
    description: 'Continuous feedback shown in 360 respects same anonymity settings as responses'
  },
  {
    rule: 'Time window applies',
    enforcement: 'System',
    description: 'Only feedback within continuous_feedback_window_days is considered'
  },
  {
    rule: 'Manager coaching prompts triggered',
    enforcement: 'Advisory',
    description: 'Development themes can trigger coaching prompts for managers to deliver via check-ins'
  }
];

export function IntegrationContinuousFeedback() {
  return (
    <section id="sec-7-7" data-manual-anchor="sec-7-7" className="scroll-mt-32 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">7.7 Continuous Feedback Connection</h3>
          <p className="text-sm text-muted-foreground">
            Linking formal 360 cycles with ongoing check-ins and peer feedback
          </p>
        </div>
      </div>

      <LearningObjectives objectives={[
        'Understand the relationship between formal and informal feedback',
        'Configure continuous feedback evidence collection for 360 cycles',
        'Use coaching prompts to bridge 360 themes and ongoing development',
        'Track signal continuity between formal feedback cycles'
      ]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Formal-Informal Feedback Loop
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            360 Feedback cycles are periodic (annual/semi-annual), while continuous feedback 
            flows daily. The integration creates a continuous improvement loop:
          </p>

          <div className="flex items-center justify-center gap-4 p-6 border rounded-lg">
            <div className="text-center">
              <div className="p-4 bg-purple-100 dark:bg-purple-950/40 rounded-full mb-2">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <p className="font-medium">360 Cycle</p>
              <p className="text-xs text-muted-foreground">Formal, periodic</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Themes</span>
                <RefreshCw className="h-4 w-4" />
              </div>
              <div className="h-0.5 w-20 bg-primary my-2" />
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">Evidence</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-blue-100 dark:bg-blue-950/40 rounded-full mb-2">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <p className="font-medium">Continuous</p>
              <p className="text-xs text-muted-foreground">Informal, ongoing</p>
            </div>
          </div>

          <InfoCallout>
            Development themes from 360 inform what to look for in continuous feedback. 
            Continuous feedback provides evidence for the next 360 cycle.
          </InfoCallout>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={continuousFeedbackFields} 
        title="continuous_feedback Integration Fields" 
      />

      <FieldReferenceTable 
        fields={cycleIntegrationFields} 
        title="feedback_360_cycles Continuous Integration Fields" 
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Coaching Prompts Bridge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Development themes from 360 feedback can trigger coaching prompts for managers 
            to deliver during regular check-ins:
          </p>

          <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              Sample Coaching Prompt
            </h4>
            <div className="text-sm space-y-2">
              <p><strong>Theme:</strong> Improve cross-team collaboration</p>
              <p><strong>Prompt for Manager:</strong></p>
              <p className="italic text-muted-foreground pl-4 border-l-2">
                "During your next 1:1 with Sarah, consider exploring her recent cross-functional 
                project work. Ask about challenges in stakeholder alignment and discuss strategies 
                for building relationships across teams. This connects to feedback themes from 
                her recent 360 review."
              </p>
              <p><strong>Suggested Questions:</strong></p>
              <ul className="list-disc list-inside text-muted-foreground pl-4">
                <li>How are cross-team relationships progressing?</li>
                <li>What barriers have you encountered?</li>
                <li>How can I help facilitate introductions?</li>
              </ul>
            </div>
          </div>

          <TipCallout>
            Coaching prompts appear in the manager's check-in preparation view. They're 
            suggestions, not requirements—managers can use or dismiss them.
          </TipCallout>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Signal Continuity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Between formal 360 cycles, continuous feedback maintains signal continuity:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Evidence Collection</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs mt-0.5">Peer</Badge>
                  <span>Real-time peer feedback marked as 360 evidence</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs mt-0.5">Check-in</Badge>
                  <span>Goal progress notes from manager 1:1s</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge variant="outline" className="text-xs mt-0.5">Recognition</Badge>
                  <span>Public kudos and achievements</span>
                </li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Next Cycle Context</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5" />
                  <span>Raters see prior cycle themes as context</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5" />
                  <span>Continuous feedback summarized for raters</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5" />
                  <span>Progress on development areas highlighted</span>
                </li>
              </ul>
            </div>
          </div>

          <InfoCallout>
            When continuous_feedback_enabled is true, raters in the next 360 cycle see a 
            summary of the subject's continuous feedback (respecting visibility rules) 
            to inform their responses.
          </InfoCallout>
        </CardContent>
      </Card>

      <BusinessRules rules={businessRules} />
    </section>
  );
}
