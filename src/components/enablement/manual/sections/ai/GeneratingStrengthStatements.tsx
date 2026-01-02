import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Users, CheckCircle, Target, Sparkles, ThumbsUp, Pencil, Copy, AlertCircle, Code } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { StepByStep, Step } from '../../components/StepByStep';

const FIELD_REFERENCES = [
  { fieldName: 'Generate Strengths Button', location: 'AI Feedback Assistant Panel → Quick Actions', required: false, description: 'Triggers AI analysis of high-rated areas to generate positive feedback statements' },
  { fieldName: 'Confidence Score', location: 'Each AI Suggestion', required: false, description: 'Percentage indicating AI certainty (80%+ = high confidence)' },
  { fieldName: 'Accept Button', location: 'Suggestion Card', required: false, description: 'Copies the suggestion to the active comment field' },
  { fieldName: 'Edit Button', location: 'Suggestion Card', required: false, description: 'Opens inline editor to modify suggestion before accepting' },
  { fieldName: 'Copy Button', location: 'Suggestion Card', required: false, description: 'Copies suggestion text to clipboard for use elsewhere' }
];

const PROCEDURE_STEPS: Step[] = [
  {
    title: 'Complete Goal and Competency Ratings',
    description: 'Rate at least 3 goals or competencies before using the strength generator.',
    substeps: [
      'Navigate to the employee evaluation form',
      'Enter ratings for goals with scores of 4+ (Exceeds Expectations or higher)',
      'Add initial comments if available—AI will enhance them'
    ]
  },
  {
    title: 'Open the AI Feedback Assistant Panel',
    description: 'The panel is located below the evaluation tabs.',
    substeps: [
      'Scroll to the AI Feedback Assistant section',
      'Click the panel header to expand if collapsed',
      'Verify the employee context is loaded correctly'
    ]
  },
  {
    title: 'Click "Generate Strengths"',
    description: 'AI analyzes high-rated areas and generates tailored statements.',
    substeps: [
      'Click the "Generate Strengths" button in Quick Actions',
      'Wait for the loading indicator (typically 2-5 seconds)',
      'Review the generated suggestions in the panel'
    ]
  },
  {
    title: 'Review Each Suggestion',
    description: 'Evaluate AI suggestions for accuracy and relevance.',
    substeps: [
      'Read the suggested strength statement',
      'Check the confidence score (higher = more reliable)',
      'Review the reasoning provided below each suggestion',
      'Verify the statement aligns with your observations'
    ]
  },
  {
    title: 'Accept, Edit, or Copy',
    description: 'Choose how to use each suggestion.',
    substeps: [
      'Click "Accept" to auto-populate the strength in your evaluation',
      'Click "Edit" to modify the text before accepting',
      'Click "Copy" to paste into a different field or document'
    ]
  }
];

const STRENGTH_EXAMPLES = `// Example AI-Generated Strength Statements

// Based on Goal Rating: 5 (Exceptional)
// Goal: "Increase quarterly sales by 15%"
Suggestion: "Demonstrated exceptional sales leadership by exceeding 
the 15% target with a 23% increase in quarterly revenue. This 
achievement reflects strong client relationship management and 
strategic account prioritization."
Confidence: 92%

// Based on Competency Rating: 4 (Exceeds)
// Competency: "Collaboration & Teamwork"
Suggestion: "Consistently fosters collaborative team dynamics, as 
evidenced by successful cross-functional project delivery and 
positive peer feedback. Proactively shares knowledge and supports 
colleagues during high-pressure periods."
Confidence: 85%

// Based on Multiple High Ratings
Suggestion: "Exhibits a strong combination of technical excellence 
and interpersonal skills. Regularly mentors junior team members 
while maintaining high personal productivity standards."
Confidence: 78%`;

export function GeneratingStrengthStatements() {
  return (
    <Card id="sec-5-2">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 5.2</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~10 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />Manager</Badge>
        </div>
        <CardTitle className="text-2xl">Generating Strength Statements</CardTitle>
        <CardDescription>Using AI to craft compelling, evidence-based positive feedback</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-5-2']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Generate AI-powered strength statements from rating data</li>
            <li>Interpret confidence scores and reasoning</li>
            <li>Edit and customize AI suggestions for your voice</li>
            <li>Integrate strengths into the overall evaluation narrative</li>
          </ul>
        </div>

        {/* When to Use */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            When to Use Strength Generation
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">✓ Ideal Scenarios</h4>
              <ul className="text-sm space-y-1 text-green-700 dark:text-green-300">
                <li>• Employee has 3+ high ratings (4 or 5)</li>
                <li>• Goals have measurable outcomes</li>
                <li>• Evidence/artifacts uploaded to system</li>
                <li>• You need to articulate strengths clearly</li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">⚠ Less Effective When</h4>
              <ul className="text-sm space-y-1 text-amber-700 dark:text-amber-300">
                <li>• Few or no high ratings entered</li>
                <li>• Goals are vague or unmeasurable</li>
                <li>• No evidence or context available</li>
                <li>• New employee with limited history</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Field References */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Key Interface Elements</h3>
          <div className="space-y-2">
            {FIELD_REFERENCES.map((field, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{field.fieldName}</span>
                  <Badge variant="outline" className="text-xs">{field.location}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
              </div>
            ))}
          </div>
        </div>

        <StepByStep title="Generating Strength Statements" steps={PROCEDURE_STEPS} />

        {/* Understanding Confidence Scores */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Understanding Confidence Scores</h3>
          <div className="space-y-3">
            {[
              { range: '80-100%', label: 'High Confidence', color: 'text-green-600 bg-green-100', guidance: 'Strong data support. Safe to use with minor edits.' },
              { range: '60-79%', label: 'Moderate Confidence', color: 'text-amber-600 bg-amber-100', guidance: 'Good foundation but review carefully. May need context additions.' },
              { range: 'Below 60%', label: 'Low Confidence', color: 'text-red-600 bg-red-100', guidance: 'Limited data. Use as inspiration only—significant editing likely needed.' }
            ].map((item) => (
              <div key={item.range} className="flex items-center gap-4 p-3 border rounded-lg">
                <Badge className={item.color}>{item.range}</Badge>
                <div>
                  <span className="font-medium">{item.label}</span>
                  <p className="text-sm text-muted-foreground">{item.guidance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons Explained */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Using the Action Buttons</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: ThumbsUp, action: 'Accept', desc: 'Copies the exact AI text to your evaluation comment field. Use when suggestion is accurate as-is.' },
              { icon: Pencil, action: 'Edit', desc: 'Opens inline editor to modify wording while keeping the structure. Use to add personal voice.' },
              { icon: Copy, action: 'Copy', desc: 'Copies to clipboard for pasting anywhere. Use when building composite feedback.' }
            ].map((item) => (
              <Card key={item.action}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">{item.action}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Example AI-Generated Strengths */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Example AI-Generated Strengths
          </h3>
          <div className="bg-muted/50 p-4 rounded-lg border">
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{STRENGTH_EXAMPLES}</pre>
          </div>
        </div>

        {/* Customization Tips */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Customizing AI Suggestions</h3>
          <div className="space-y-3">
            {[
              { tip: 'Add Specific Examples', detail: 'Insert actual project names, dates, or metrics that you observed firsthand' },
              { tip: 'Adjust Tone', detail: 'Modify formal language to match your communication style and relationship with the employee' },
              { tip: 'Connect to Impact', detail: 'Add how the strength benefited the team, project, or organization' },
              { tip: 'Link to Goals', detail: 'Reference specific goals or competencies when the AI suggestion is general' }
            ].map((item) => (
              <div key={item.tip} className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm">{item.tip}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Pro Tip">
          Generate strengths before development areas—starting with positives helps you frame 
          improvement areas more constructively and creates a balanced evaluation.
        </TipCallout>

        <WarningCallout title="Common Mistake">
          Don't accept AI suggestions verbatim without adding your personal observations. The most 
          effective feedback combines AI structure with your authentic manager perspective.
        </WarningCallout>

        {/* Troubleshooting */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Troubleshooting
          </h3>
          <div className="space-y-2">
            {[
              { issue: 'No suggestions generated', cause: 'Insufficient high ratings or empty goal titles', solution: 'Complete at least 3 ratings of 4+ before generating. Ensure goals have descriptive titles.' },
              { issue: 'Suggestions too generic', cause: 'Goals lack measurable targets or context', solution: 'Add specific metrics to goal descriptions. Upload supporting evidence.' },
              { issue: 'Low confidence scores', cause: 'Limited data available for analysis', solution: 'Add more context in goal comments. Link evidence and artifacts.' }
            ].map((item) => (
              <div key={item.issue} className="p-3 border rounded-lg text-sm">
                <div className="font-medium">{item.issue}</div>
                <div className="text-muted-foreground mt-1"><strong>Cause:</strong> {item.cause}</div>
                <div className="text-muted-foreground"><strong>Solution:</strong> {item.solution}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
