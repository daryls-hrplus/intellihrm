import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Users, CheckCircle, Shield, Scale, Eye, ArrowRight, XCircle, CheckCircle2, Code } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { StepByStep, Step } from '../../components/StepByStep';
import { BusinessRules } from '../../components/BusinessRules';

const FIELD_REFERENCES = [
  { fieldName: 'Check Bias Button', location: 'AI Feedback Assistant Panel → Comment Improvement', required: false, description: 'Analyzes entered text for potential bias indicators' },
  { fieldName: 'Bias Alert Banner', location: 'Evaluation Form (when detected)', required: false, description: 'System-generated warning when bias patterns are identified' },
  { fieldName: 'Alternative Suggestions', location: 'Bias Detection Results', required: false, description: 'AI-recommended neutral language replacements' },
  { fieldName: 'Acknowledge Nudge', location: 'Bias Alert', required: false, description: 'Manager confirms they have reviewed and addressed the bias flag' },
  { fieldName: 'Dispute Detection', location: 'Bias Alert', required: false, description: 'Manager can dispute false positives with documented reasoning' }
];

const BUSINESS_RULES = [
  { rule: 'Bias detection is advisory, not blocking', enforcement: 'Policy' as const, description: 'Managers can proceed after acknowledging flags—system does not prevent submission.' },
  { rule: 'All bias incidents are logged', enforcement: 'System' as const, description: 'Detection events are recorded for compliance and pattern analysis.' },
  { rule: 'Disputes require documented justification', enforcement: 'System' as const, description: 'When managers dispute a detection, they must provide written reasoning.' },
  { rule: 'Aggregate bias patterns trigger HR alerts', enforcement: 'System' as const, description: 'Repeated bias flags from a manager generate HR notification.' }
];

const PROCEDURE_STEPS: Step[] = [
  {
    title: 'Enter or Paste Comment Text',
    description: 'Input the feedback text you want to analyze.',
    substeps: [
      'Navigate to the AI Feedback Assistant panel',
      'Type or paste your comment in the improvement text area',
      'Ensure the full comment is visible'
    ]
  },
  {
    title: 'Click "Check Bias"',
    description: 'Initiate the bias detection analysis.',
    substeps: [
      'Click the "Check Bias" button',
      'Wait for AI analysis (2-5 seconds)',
      'Review the results in the panel'
    ]
  },
  {
    title: 'Review Detected Bias Indicators',
    description: 'Examine each flagged term or phrase.',
    substeps: [
      'Read each bias indicator with its category',
      'Understand the severity level (Low/Medium/High)',
      'Review the explanation for why it was flagged'
    ]
  },
  {
    title: 'Apply Neutral Alternatives',
    description: 'Replace biased language with suggested alternatives.',
    substeps: [
      'Click "Apply" next to each suggestion you accept',
      'Review the updated text',
      'Make additional manual edits as needed'
    ]
  },
  {
    title: 'Acknowledge or Dispute',
    description: 'Complete the bias review process.',
    substeps: [
      'If you agree: Click "Acknowledge" to confirm you\'ve addressed the issue',
      'If you disagree: Click "Dispute" and provide justification',
      'Proceed with your evaluation'
    ]
  }
];

const BIAS_EXAMPLES = `// Bias Detection Examples with Neutral Alternatives

// Gender-Coded Language
Original: "She is very nurturing with her team"
Flagged: "nurturing" (gender-coded, medium severity)
Alternative: "Provides strong support and mentorship to team members"
Reason: "Nurturing" is statistically more often applied to women and 
        can reinforce stereotypes

// Age-Related Bias
Original: "For someone his age, he adapts well to technology"
Flagged: "for someone his age" (age-coded, high severity)
Alternative: "Demonstrates strong technology adaptation skills"
Reason: Age qualifiers can constitute age discrimination and are 
        irrelevant to performance assessment

// Vague/Subjective Language
Original: "She has a great attitude and is a pleasure to work with"
Flagged: "great attitude" (vague bias, low severity)
Alternative: "Maintains positive collaboration and contributes 
              constructively in team discussions"
Reason: "Attitude" is subjective and lacks behavioral specificity

// Conditional Praise
Original: "He is very articulate for an engineer"
Flagged: "for an engineer" (conditional praise, high severity)
Alternative: "Communicates complex technical concepts with clarity"
Reason: Conditional praise implies surprise based on role stereotypes`;

export function BiasDetectionRemediation() {
  return (
    <Card id="sec-5-4">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 5.4</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~15 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />Manager / HR / Compliance</Badge>
        </div>
        <CardTitle className="text-2xl">Bias Detection & Remediation</CardTitle>
        <CardDescription>EEOC-aligned language analysis for fair, legally defensible evaluations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-5-4']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand the types of bias detected by the AI system</li>
            <li>Use bias detection tools effectively during evaluation</li>
            <li>Apply neutral language alternatives appropriately</li>
            <li>Navigate the acknowledge/dispute workflow</li>
          </ul>
        </div>

        {/* Why Bias Detection Matters */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            Why Bias Detection Matters
          </h3>
          <p className="text-muted-foreground">
            Unconscious bias in performance evaluations can lead to unfair treatment, legal liability, 
            and talent loss. Research shows that biased language patterns correlate with discriminatory 
            outcomes in compensation, promotion, and termination decisions.
          </p>
          <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Legal Context</h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Performance evaluations are discoverable documents in employment litigation. EEOC 
              guidelines emphasize that evaluations should focus on job-related behaviors and 
              outcomes, not personal characteristics or stereotypes.
            </p>
          </div>
        </div>

        {/* Types of Bias Detected */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Types of Bias Detected
          </h3>
          <div className="space-y-4">
            {[
              { 
                type: 'Gender-Coded Language', 
                color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
                examples: ['nurturing', 'aggressive', 'emotional', 'ambitious (for women)'],
                impact: 'Reinforces stereotypes; may disadvantage employees who don\'t conform to gender expectations'
              },
              { 
                type: 'Age-Related Bias', 
                color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
                examples: ['young and energetic', 'for his age', 'digital native', 'seasoned'],
                impact: 'Can constitute age discrimination under ADEA; irrelevant to job performance'
              },
              { 
                type: 'Racial/Cultural Undertones', 
                color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                examples: ['articulate (coded)', 'professional appearance', 'good fit'],
                impact: 'May indicate unconscious racial bias; can create hostile work environment'
              },
              { 
                type: 'Vague/Subjective Language', 
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                examples: ['good attitude', 'team player', 'likeable', 'reliable'],
                impact: 'Lacks behavioral specificity; vulnerable to personal interpretation'
              },
              { 
                type: 'Conditional Praise', 
                color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                examples: ['for a junior employee', 'considering his background', 'despite being remote'],
                impact: 'Implies surprise based on irrelevant factors; diminishes achievement'
              }
            ].map((item) => (
              <div key={item.type} className="p-4 border rounded-lg space-y-2">
                <Badge className={item.color}>{item.type}</Badge>
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.examples.map((ex) => (
                    <code key={ex} className="text-xs bg-muted px-2 py-1 rounded">{ex}</code>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground"><strong>Impact:</strong> {item.impact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Levels */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Understanding Severity Levels</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { level: 'Low', color: 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950', icon: '⚠️', guidance: 'Worth reviewing but may be contextually appropriate. Consider the alternative but use judgment.' },
              { level: 'Medium', color: 'border-orange-300 bg-orange-50 dark:bg-orange-950', icon: '⚠️⚠️', guidance: 'Likely problematic. Strongly recommend using the neutral alternative. Document if you proceed.' },
              { level: 'High', color: 'border-red-300 bg-red-50 dark:bg-red-950', icon: '🚨', guidance: 'Potentially discriminatory. Revise before submission. May trigger HR notification if pattern persists.' }
            ].map((item) => (
              <div key={item.level} className={`p-4 rounded-lg border ${item.color}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span>{item.icon}</span>
                  <h4 className="font-semibold">{item.level} Severity</h4>
                </div>
                <p className="text-sm text-muted-foreground">{item.guidance}</p>
              </div>
            ))}
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

        <StepByStep title="Using Bias Detection" steps={PROCEDURE_STEPS} />

        {/* Bias Detection Examples */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Bias Detection Examples
          </h3>
          <div className="bg-muted/50 p-4 rounded-lg border">
            <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{BIAS_EXAMPLES}</pre>
          </div>
        </div>

        {/* Before and After Examples */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Reference: Before & After</h3>
          <div className="space-y-3">
            {[
              { before: 'She is very emotional in meetings', after: 'Expresses viewpoints with passion; would benefit from measured delivery in group settings' },
              { before: 'He\'s a young go-getter', after: 'Demonstrates high initiative and proactive problem-solving' },
              { before: 'Good cultural fit', after: 'Aligns well with team collaboration norms and communication style' },
              { before: 'She\'s aggressive about hitting targets', after: 'Pursues goals with determination and focus on results' }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex-1 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <span className="text-sm line-through text-muted-foreground">{item.before}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-sm">{item.after}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dispute Process */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Disputing False Positives</h3>
          <p className="text-muted-foreground text-sm">
            AI detection isn't perfect. If you believe a flag is incorrect given the context, 
            you can dispute it with documented reasoning:
          </p>
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="font-medium text-sm">When Disputing is Appropriate:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>The flagged term has a specific, documented meaning in your industry</li>
              <li>Context makes the usage clearly non-discriminatory</li>
              <li>The employee specifically requested certain descriptive language</li>
            </ul>
            <div className="pt-3 border-t">
              <h4 className="font-medium text-sm">What Happens After Dispute:</h4>
              <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                <li>Your dispute is logged for audit trail</li>
                <li>HR may review repeated disputes</li>
                <li>Dispute data improves AI model accuracy</li>
              </ul>
            </div>
          </div>
        </div>

        <TipCallout title="Best Practice">
          Run bias detection before finalizing any evaluation. It takes seconds and can save hours 
          of remediation if issues surface later during calibration or HR review.
        </TipCallout>

        <WarningCallout title="Important Limitation">
          Bias detection focuses on explicit language patterns. It cannot detect structural bias 
          (e.g., consistently lower ratings for certain groups) or bias in what's omitted. 
          Calibration sessions address these broader patterns.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />
      </CardContent>
    </Card>
  );
}
