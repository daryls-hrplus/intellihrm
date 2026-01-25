import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '@/components/enablement/manual/components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '@/components/enablement/manual/components/FieldReferenceTable';
import { PrerequisiteAlert } from '@/components/enablement/manual/components/PrerequisiteAlert';
import { Callout, TipCallout, InfoCallout } from '@/components/enablement/manual/components/Callout';
import { 
  Puzzle, 
  Link2,
  CheckCircle2,
  ArrowRight,
  Layers,
  Target,
  FileText
} from 'lucide-react';

export function F360CompetencyIntegration() {
  const competencyMappingFields: FieldDefinition[] = [
    {
      name: 'question_id',
      required: true,
      type: 'UUID',
      description: 'Reference to feedback_360_questions',
      defaultValue: '—',
      validation: 'Must exist in questions table',
    },
    {
      name: 'competency_id',
      required: true,
      type: 'UUID',
      description: 'Reference to skills_competencies (unified capability table)',
      defaultValue: '—',
      validation: 'Must exist with type = competency',
    },
    {
      name: 'skill_id',
      required: false,
      type: 'UUID',
      description: 'Alternative: Link to specific skill instead of competency',
      defaultValue: 'null',
      validation: 'Must exist with type = skill',
    },
    {
      name: 'proficiency_level',
      required: false,
      type: 'Number',
      description: 'Expected proficiency level for rating context',
      defaultValue: 'null',
      validation: 'Range: 1-5 (matches scale)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <Puzzle className="h-5 w-5 text-primary" />
        2.0c Competency Framework Integration
      </h3>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Understand how competencies from Core Framework link to 360 questions',
          'Configure competency-to-question mappings for structured feedback',
          'Use behavioral indicators as rating anchors in 360 feedback',
          'Ensure consistent competency measurement across Appraisals and 360',
        ]}
      />

      {/* Prerequisites */}
      <PrerequisiteAlert
        items={[
          'Core Framework → Competencies tab configured with active competencies',
          'At least one competency framework activated for the company',
          'Question bank exists with questions ready for mapping',
        ]}
      />

      {/* Navigation Path */}
      <Callout variant="info" title="Navigation Path">
        <code className="text-xs bg-muted px-2 py-1 rounded">
          Performance → Setup → Core Framework → Competencies
        </code>
        <span className="mx-2 text-muted-foreground">then</span>
        <code className="text-xs bg-muted px-2 py-1 rounded">
          Performance → Setup → 360° Feedback → Question Bank → Link Competency
        </code>
      </Callout>

      {/* Integration Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            How Competencies Connect to 360 Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-muted/50 border font-mono text-xs overflow-x-auto">
            <pre>{`
┌──────────────────────────────────────────────────────────────────────────┐
│                    COMPETENCY → 360 FEEDBACK FLOW                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────┐                                                 │
│  │ skills_competencies │  ◄── Unified Capability Registry               │
│  │ (type: competency)  │                                                 │
│  └──────────┬──────────┘                                                 │
│             │                                                            │
│             │  competency_id                                             │
│             ▼                                                            │
│  ┌─────────────────────┐       ┌─────────────────────┐                   │
│  │ feedback_360_       │──────►│ behavioral_anchors  │                   │
│  │ questions           │       │ (BARS for ratings)  │                   │
│  └──────────┬──────────┘       └─────────────────────┘                   │
│             │                                                            │
│             │  question_id                                               │
│             ▼                                                            │
│  ┌─────────────────────┐       ┌─────────────────────┐                   │
│  │ feedback_360_       │──────►│ talent_signal_      │                   │
│  │ responses           │       │ snapshots           │                   │
│  └─────────────────────┘       │ (competency scores) │                   │
│                                └─────────────────────┘                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
            `}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Benefits of Competency Linking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Benefits of Competency-Linked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-emerald-500/5">
              <h4 className="font-semibold text-sm text-emerald-700 mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Structured Aggregation
              </h4>
              <p className="text-xs text-muted-foreground">
                Responses are automatically grouped by competency in reports, showing 
                competency-level scores rather than just question-level data.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-blue-500/5">
              <h4 className="font-semibold text-sm text-blue-700 mb-2 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Cross-Module Consistency
              </h4>
              <p className="text-xs text-muted-foreground">
                Same competency definitions used in Appraisals, 360 Feedback, 
                Goals, and Succession Planning for unified talent insights.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-violet-500/5">
              <h4 className="font-semibold text-sm text-violet-700 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Development Alignment
              </h4>
              <p className="text-xs text-muted-foreground">
                AI-generated development themes link directly to competencies, 
                enabling targeted learning recommendations.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-amber-500/5">
              <h4 className="font-semibold text-sm text-amber-700 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Behavioral Anchors
              </h4>
              <p className="text-xs text-muted-foreground">
                Competency-linked questions can display proficiency-level 
                behavioral anchors to guide rater responses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Field Reference */}
      <FieldReferenceTable
        title="Question-Competency Mapping Fields"
        fields={competencyMappingFields}
      />

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step-by-Step: Linking Questions to Competencies</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">1</span>
              <div>
                <p className="font-medium">Verify Competency Framework is Active</p>
                <p className="text-sm text-muted-foreground">
                  Navigate to Performance → Setup → Core Framework → Competencies. 
                  Confirm at least one framework is active with defined competencies.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">2</span>
              <div>
                <p className="font-medium">Navigate to Question Bank</p>
                <p className="text-sm text-muted-foreground">
                  Performance → Setup → 360° Feedback → Question Bank
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">3</span>
              <div>
                <p className="font-medium">Select or Create a Question</p>
                <p className="text-sm text-muted-foreground">
                  Click on an existing question to edit, or click "Add Question" to create new.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">4</span>
              <div>
                <p className="font-medium">Expand "Competency Mapping" Section</p>
                <p className="text-sm text-muted-foreground">
                  In the question editor, locate the "Competency Mapping" accordion panel.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">5</span>
              <div>
                <p className="font-medium">Select Competency from Dropdown</p>
                <p className="text-sm text-muted-foreground">
                  Choose from active competencies. The dropdown groups by competency category.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">6</span>
              <div>
                <p className="font-medium">(Optional) Set Expected Proficiency Level</p>
                <p className="text-sm text-muted-foreground">
                  If using job-based proficiency expectations, select the expected level. 
                  This enables gap analysis in reports.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">7</span>
              <div>
                <p className="font-medium">Configure Behavioral Anchors (If Not Using Defaults)</p>
                <p className="text-sm text-muted-foreground">
                  Click "Configure Anchors" to customize BARS for this question. 
                  See Section 2.4 for detailed anchor configuration.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-semibold">8</span>
              <div>
                <p className="font-medium">Save Changes</p>
                <p className="text-sm text-muted-foreground">
                  Competency mapping is saved. Future responses will be grouped under this competency.
                </p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Competency Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Common Competency Categories for 360</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { name: 'Leadership', examples: 'Vision, Influence, Decision-Making, Team Development' },
              { name: 'Communication', examples: 'Clarity, Active Listening, Presentation, Written' },
              { name: 'Collaboration', examples: 'Teamwork, Conflict Resolution, Cross-Functional' },
              { name: 'Results Orientation', examples: 'Accountability, Quality Focus, Innovation' },
              { name: 'Strategic Thinking', examples: 'Business Acumen, Planning, Problem-Solving' },
              { name: 'Emotional Intelligence', examples: 'Self-Awareness, Empathy, Adaptability' },
            ].map((cat) => (
              <div key={cat.name} className="p-3 rounded-lg border">
                <h4 className="font-semibold text-sm mb-1">{cat.name}</h4>
                <p className="text-xs text-muted-foreground">{cat.examples}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Signal Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            Downstream: Competency Scores → Talent Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            When questions are linked to competencies, the aggregated scores feed into 
            the Talent Signal system:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2">talent_signal_snapshots</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <code>competency_id</code>: Links to the competency</li>
                <li>• <code>score_value</code>: Weighted average of related responses</li>
                <li>• <code>source_type</code>: "360_feedback"</li>
                <li>• <code>signal_category</code>: Derived from competency category</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2">Uses</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Nine-Box placement (Performance + Potential)</li>
                <li>• Succession readiness scoring</li>
                <li>• Development theme generation</li>
                <li>• Competency gap analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <TipCallout title="Best Practices">
        <ul className="text-sm space-y-1">
          <li>• Map 2-4 questions per competency for reliable aggregation</li>
          <li>• Use the same competency definitions across Appraisals and 360 for unified scoring</li>
          <li>• Include at least one behavioral and one rating question per competency</li>
          <li>• Review competency mappings when updating the competency framework</li>
        </ul>
      </TipCallout>

      {/* Cross-Reference */}
      <InfoCallout title="Cross-Reference">
        <p className="text-sm">
          For full competency framework setup, see <strong>Core Framework → Competencies</strong> documentation. 
          For question bank configuration, see <strong>Section 2.3 (Question Bank)</strong>.
        </p>
      </InfoCallout>
    </div>
  );
}
