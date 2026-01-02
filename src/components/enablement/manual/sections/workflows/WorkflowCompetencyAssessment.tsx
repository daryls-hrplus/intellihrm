import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock, CheckCircle, Layers, Users, ThumbsUp, ThumbsDown } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout, NoteCallout } from '../../components/Callout';
import { WorkflowDiagram } from '../../components/WorkflowDiagram';
import { StepByStep } from '../../components/StepByStep';
import { FieldReferenceTable } from '../../components/FieldReferenceTable';
import { BusinessRules } from '../../components/BusinessRules';
import { TroubleshootingSection } from '../../components/TroubleshootingSection';
import { ConfigurationExample } from '../../components/ConfigurationExample';

const ASSESSMENT_STEPS = [
  {
    title: 'Understand the Competency Framework',
    description: 'Review the competency structure and proficiency levels.',
    substeps: [
      'Read the competency name and definition',
      'Review all behavioral indicators for the competency',
      'Understand the proficiency level expectations for this role',
      'Note the expected vs. stretch proficiency levels'
    ],
    expectedResult: 'Clear understanding of what each proficiency level looks like'
  },
  {
    title: 'Recall Observable Behaviors',
    description: 'Think of specific situations demonstrating the competency.',
    substeps: [
      'Identify 2-3 situations where competency was demonstrated',
      'Note behaviors observed, not intentions assumed',
      'Consider both positive examples and development areas',
      'Reference feedback from others if available'
    ],
    expectedResult: 'Concrete behavioral examples ready for assessment'
  },
  {
    title: 'Match to Proficiency Level',
    description: 'Select the level that best matches demonstrated behaviors.',
    substeps: [
      'Compare observed behaviors to level descriptions',
      'Consider frequency and consistency of behaviors',
      'Assess complexity of situations handled',
      'Select the level with best overall fit'
    ],
    expectedResult: 'Proficiency level selected based on behavioral evidence'
  },
  {
    title: 'Document Behavioral Evidence',
    description: 'Write specific examples supporting your assessment.',
    substeps: [
      'Describe the situation (context)',
      'Explain the behavior observed',
      'Note the outcome or impact',
      'Keep examples recent (within review period)'
    ],
    expectedResult: 'STAR-format evidence documented for each competency'
  },
  {
    title: 'Identify Development Opportunities',
    description: 'Note areas for growth even in strong competencies.',
    substeps: [
      'Consider next-level behaviors not yet demonstrated',
      'Identify situations avoided or handled poorly',
      'Suggest specific development actions',
      'Link to available learning resources'
    ],
    expectedResult: 'Actionable development suggestions recorded'
  }
];

const FIELDS = [
  { name: 'competency_id', required: true, type: 'UUID', description: 'The competency being assessed', validation: 'Must be assigned to participant role' },
  { name: 'proficiency_level', required: true, type: 'Integer', description: 'Demonstrated proficiency level', validation: 'Within defined scale (e.g., 1-5)' },
  { name: 'expected_level', required: false, type: 'Integer', description: 'Required level for this role', validation: 'From job profile' },
  { name: 'behavioral_examples', required: true, type: 'Text', description: 'Specific observed behaviors', validation: 'Minimum 30 characters' },
  { name: 'development_notes', required: false, type: 'Text', description: 'Suggested improvement areas' },
  { name: 'strength_indicator', required: false, type: 'Boolean', description: 'Mark as notable strength', defaultValue: 'false' },
  { name: 'assessed_by', required: true, type: 'UUID', description: 'Who completed the assessment' },
  { name: 'assessed_at', required: true, type: 'Timestamp', description: 'When assessment was completed' }
];

const BUSINESS_RULES = [
  { rule: 'All assigned competencies must be assessed', enforcement: 'System' as const, description: 'Cannot complete evaluation without assessing every competency.' },
  { rule: 'Behavioral examples required', enforcement: 'Policy' as const, description: 'Each competency assessment must include specific behavioral evidence.' },
  { rule: 'Assess behaviors, not personality', enforcement: 'Policy' as const, description: 'Focus on observable actions, not character traits or potential.' },
  { rule: 'Consider full review period', enforcement: 'Advisory' as const, description: 'Avoid recency bias by reflecting on behaviors throughout the cycle.' },
  { rule: 'Expected level informs but does not constrain', enforcement: 'Advisory' as const, description: 'Rate actual demonstrated level, even if above or below expected.' }
];

const EXAMPLES = [
  {
    title: 'Strong Communicator - Exceeds Level',
    context: 'Assessing "Communication" competency for a Senior Analyst',
    values: [
      { field: 'Expected Level', value: 'Level 3 - Proficient' },
      { field: 'Demonstrated Level', value: 'Level 4 - Advanced' },
      { field: 'Positive Example', value: 'Led stakeholder presentation to C-suite. Translated complex technical data into clear business insights. Received unsolicited praise from CFO.' },
      { field: 'Development Area', value: 'Could improve written communication brevity in email updates.' }
    ],
    outcome: 'Balanced assessment showing strength with specific development opportunity'
  },
  {
    title: 'Developing Leadership - Below Level',
    context: 'Assessing "Leadership" competency for new Team Lead',
    values: [
      { field: 'Expected Level', value: 'Level 3 - Proficient' },
      { field: 'Demonstrated Level', value: 'Level 2 - Developing' },
      { field: 'Positive Example', value: 'Successfully delegated routine tasks and provided clear instructions.' },
      { field: 'Gap Example', value: 'Struggled with difficult conversations. Delayed addressing team conflict for 3 weeks.' },
      { field: 'Development Focus', value: 'Recommend "Crucial Conversations" training and monthly 1:1 coaching.' }
    ],
    outcome: 'Constructive assessment identifying gap with actionable development plan'
  }
];

const TROUBLESHOOTING = [
  { issue: 'Cannot differentiate between proficiency levels', cause: 'Level definitions may be unclear or too similar.', solution: 'Focus on complexity and independence. Higher levels handle more complex situations with less guidance.' },
  { issue: 'Insufficient examples to assess competency', cause: 'Limited observation opportunities or new employee.', solution: 'Document limitation and assess based on available evidence. Note areas needing more observation.' },
  { issue: 'Competency seems irrelevant to role', cause: 'Competency assignment may be outdated or incorrect.', solution: 'Flag with HR. Complete assessment with available evidence and note relevance concern.' }
];

export function WorkflowCompetencyAssessment() {
  return (
    <Card id="sec-3-6">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 3.6</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~10 min read</Badge>
          <Badge className="gap-1 bg-green-600 text-white"><Brain className="h-3 w-3" />All Roles</Badge>
        </div>
        <CardTitle className="text-2xl">Competency Assessment</CardTitle>
        <CardDescription>Behavioral indicator evaluation and proficiency level mapping</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-3-6']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand competency frameworks and proficiency levels</li>
            <li>Assess behaviors objectively using specific examples</li>
            <li>Document evidence using the STAR method</li>
            <li>Identify meaningful development opportunities</li>
          </ul>
        </div>

        {/* Interactive Workflow Diagram */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Competency Assessment Workflow</h3>
          <div className="p-4 bg-muted/30 rounded-lg overflow-x-auto">
            <pre className="text-xs text-muted-foreground mb-2">Participant Flow Diagram</pre>
            <div className="mermaid-container">
              <presentation-mermaid>
                {`flowchart TD
    subgraph Understanding["📖 Understanding"]
        A[Read Competency Definition] --> B[Review Behavioral Indicators]
        B --> C[Check Expected Level for Role]
    end
    
    subgraph Observation["👁️ Observation"]
        D[Recall Specific Situations] --> E[Identify Behaviors Observed]
        E --> F[Note Frequency & Consistency]
    end
    
    subgraph Assessment["📊 Assessment"]
        G{Match to Level}
        G -->|Complex + Independent| H[Level 4-5]
        G -->|Standard + Competent| I[Level 3]
        G -->|Needs Guidance| J[Level 1-2]
    end
    
    subgraph Documentation["📝 Documentation"]
        K[Write STAR Examples]
        L[Identify Development Areas]
        M[Submit Assessment]
    end
    
    C --> D
    F --> G
    H --> K
    I --> K
    J --> K
    K --> L
    L --> M`}
              </presentation-mermaid>
            </div>
          </div>
        </div>

        {/* Proficiency Level Framework */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-600" />
            Typical Proficiency Levels
          </h3>
          <div className="space-y-2">
            {[
              { level: 5, label: 'Expert', desc: 'Recognized authority. Mentors others. Handles most complex situations. Sets standards.', color: 'border-l-purple-500' },
              { level: 4, label: 'Advanced', desc: 'Consistently strong. Coaches peers. Handles complex situations independently.', color: 'border-l-blue-500' },
              { level: 3, label: 'Proficient', desc: 'Solid performance. Meets role expectations. Handles standard situations well.', color: 'border-l-green-500' },
              { level: 2, label: 'Developing', desc: 'Building capability. Needs guidance for complex situations. Growing confidence.', color: 'border-l-amber-500' },
              { level: 1, label: 'Foundational', desc: 'New to competency. Requires supervision. Learning fundamentals.', color: 'border-l-red-500' }
            ].map((item) => (
              <div key={item.level} className={`flex items-start gap-4 p-3 bg-muted/50 rounded-lg border-l-4 ${item.color}`}>
                <Badge className="bg-slate-600 text-white">{item.level}</Badge>
                <div>
                  <span className="font-medium">{item.label}</span>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <NoteCallout title="Level Expectations">
          Expected proficiency levels are defined in job profiles. An employee can demonstrate above or below expected level—rate what you observe, not what is expected.
        </NoteCallout>

        {/* Behavioral vs Non-Behavioral */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Behavioral vs. Non-Behavioral Examples</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-l-4 border-l-green-500 bg-muted/50 rounded-l-none">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-700 dark:text-green-400">Good: Behavioral</h4>
                </div>
                <ul className="text-sm space-y-2 text-foreground">
                  <li>"Facilitated 3 cross-team meetings, ensuring all voices were heard"</li>
                  <li>"Identified process bottleneck and proposed solution that saved 4 hours/week"</li>
                  <li>"De-escalated customer complaint, retaining $50K account"</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500 bg-muted/50 rounded-l-none">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsDown className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-red-700 dark:text-red-400">Avoid: Non-Behavioral</h4>
                </div>
                <ul className="text-sm space-y-2 text-foreground">
                  <li>"Good team player" (vague trait, not behavior)</li>
                  <li>"Has leadership potential" (future-focused, not demonstrated)</li>
                  <li>"Seems motivated" (inference, not observation)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <StepByStep steps={ASSESSMENT_STEPS} title="Competency Assessment Steps" />

        {/* Multi-Rater Considerations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Multi-Rater Considerations
          </h3>
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <p className="text-sm text-muted-foreground">When competencies include 360° feedback:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>Self:</strong> Employee self-assesses first, providing their perspective</li>
              <li><strong>Manager:</strong> Primary evaluation based on direct observation</li>
              <li><strong>Peers:</strong> May provide input on collaboration competencies</li>
              <li><strong>Direct Reports:</strong> May assess leadership competencies (for managers)</li>
              <li><strong>Consolidation:</strong> Manager reviews all inputs before finalizing</li>
            </ul>
          </div>
        </div>

        <TipCallout title="STAR Method for Examples">
          Situation: What was the context? Task: What needed to be done? Action: What did they do? Result: What was the outcome? This structure ensures behavioral specificity.
        </TipCallout>

        <WarningCallout title="Avoid Common Biases">
          Halo effect: Letting one strong competency inflate others. Horn effect: Letting one weak area drag down all ratings. Rate each competency independently based on its own evidence.
        </WarningCallout>

        <FieldReferenceTable fields={FIELDS} title="Competency Assessment Fields" />
        <ConfigurationExample examples={EXAMPLES} title="Assessment Examples" />
        <BusinessRules rules={BUSINESS_RULES} />
        <TroubleshootingSection items={TROUBLESHOOTING} />
      </CardContent>
    </Card>
  );
}
