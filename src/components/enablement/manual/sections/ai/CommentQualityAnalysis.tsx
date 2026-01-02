import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, Users, CheckCircle, Target, FileText, TrendingUp, BarChart3, Lightbulb, Sparkles, AlertCircle } from 'lucide-react';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { TipCallout, WarningCallout } from '../../components/Callout';
import { FieldReference } from '../../components/FieldReference';
import { BusinessRules } from '../../components/BusinessRules';
import { ConfigurationExample } from '../../components/ConfigurationExample';

const FIELD_REFERENCES = [
  { fieldName: 'Comment Quality Panel', location: 'Below Comment Text Area', required: false, description: 'Real-time analysis panel showing quality metrics for entered comments' },
  { fieldName: 'Length Indicator', location: 'Quality Panel', required: false, description: 'Word/character count progress toward recommended minimum' },
  { fieldName: 'Specificity Score', location: 'Quality Panel', required: false, description: 'Measures use of specific, behavioral language vs. vague generalities' },
  { fieldName: 'Evidence Score', location: 'Quality Panel', required: false, description: 'Indicates presence of data, projects, or measurable outcomes' },
  { fieldName: 'Actionability Score', location: 'Quality Panel', required: false, description: 'Measures forward-looking, development-oriented language' },
  { fieldName: 'Improve with AI Button', location: 'Quality Panel', required: false, description: 'Triggers AI enhancement when quality score is below threshold' }
];

const BUSINESS_RULES = [
  { rule: 'Quality hints are advisory only', enforcement: 'Policy' as const, description: 'Low scores do not prevent submission but may flag for HR review.' },
  { rule: 'Minimum comment length is configurable', enforcement: 'System' as const, description: 'Organizations can set required minimum characters per comment type.' },
  { rule: 'AI improvements require human approval', enforcement: 'System' as const, description: 'Enhanced comments must be reviewed and accepted before saving.' }
];

const QUALITY_ANALYSIS_CODE = `// Comment Quality Scoring Algorithm (Simplified)

// Length Score (0-100)
const lengthScore = Math.min(100, (charCount / minRequired) * 100);

// Specificity Score - behavioral language patterns
const specificityPatterns = [
  /demonstrated|showed|achieved|completed|delivered/gi,
  /specific|example|instance|when|during/gi,
  /\\d+%|\\d+\\.\\d+|[A-Z]{2,}/g  // numbers, percentages
];
const specificityScore = Math.min(100, matches * 20);

// Evidence Score - concrete references
const evidencePatterns = [
  /evidence|data|metrics|results|feedback|report/gi,
  /project|initiative|goal|objective|milestone/gi,
  /team|client|stakeholder|customer/gi
];
const evidenceScore = Math.min(100, matches * 25);

// Actionability Score - forward-looking language
const actionPatterns = [
  /should|could|recommend|suggest|consider|focus/gi,
  /next|future|opportunity|growth|development/gi
];
const actionabilityScore = Math.min(100, matches * 30);

// Overall Score
const overallScore = (lengthScore + specificityScore + 
                      evidenceScore + actionabilityScore) / 4;

// Quality Tiers
// 70-100%: Good Quality ✓
// 40-69%:  Can Improve ⚠
// Below 40: Needs Detail ✗`;

export function CommentQualityAnalysis() {
  return (
    <Card id="sec-5-5">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 5.5</Badge>
          <Badge className="gap-1 bg-blue-600 text-white"><Clock className="h-3 w-3" />~10 min read</Badge>
          <Badge className="gap-1 bg-purple-600 text-white"><Users className="h-3 w-3" />Manager</Badge>
        </div>
        <CardTitle className="text-2xl">Comment Quality Analysis</CardTitle>
        <CardDescription>Real-time feedback quality scoring and AI-powered improvement suggestions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <NavigationPath path={NAVIGATION_PATHS['sec-5-5']} />

        {/* Learning Objectives */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Learning Objectives
          </h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
            <li>Understand the four dimensions of comment quality</li>
            <li>Interpret quality scores and improvement hints</li>
            <li>Use AI to enhance low-quality comments</li>
            <li>Write evaluation comments that meet quality standards</li>
          </ul>
        </div>

        {/* What is Comment Quality Analysis */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            What is Comment Quality Analysis?
          </h3>
          <p className="text-muted-foreground">
            Comment Quality Analysis provides real-time feedback as you write evaluation comments. 
            It scores your text across four dimensions and offers specific suggestions to improve 
            clarity, specificity, and actionability.
          </p>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-medium text-primary">Key Insight</p>
            <p className="text-sm text-muted-foreground mt-1">
              Research shows that specific, evidence-based feedback leads to 40% better performance 
              improvement compared to vague comments like "good job" or "needs improvement."
            </p>
          </div>
        </div>

        {/* The Four Quality Dimensions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            The Four Quality Dimensions
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { 
                dimension: 'Length', 
                icon: FileText, 
                what: 'Sufficient detail to be meaningful',
                good: '50+ words with substantive content',
                poor: 'One-liners like "Good work" or "Needs improvement"',
                weight: '25%'
              },
              { 
                dimension: 'Specificity', 
                icon: Target, 
                what: 'Behavioral, observable language',
                good: '"Delivered the Q3 report 2 days early with zero errors"',
                poor: '"Usually meets deadlines"',
                weight: '25%'
              },
              { 
                dimension: 'Evidence', 
                icon: CheckCircle, 
                what: 'References to data, projects, or outcomes',
                good: '"Client satisfaction scores increased 15% after implementing..."',
                poor: '"Customers seem to like working with them"',
                weight: '25%'
              },
              { 
                dimension: 'Actionability', 
                icon: TrendingUp, 
                what: 'Forward-looking development guidance',
                good: '"Consider the Executive Communication workshop to enhance..."',
                poor: '"Should be better at presenting"',
                weight: '25%'
              }
            ].map((item) => (
              <Card key={item.dimension}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <item.icon className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">{item.dimension}</h4>
                    </div>
                    <Badge variant="outline">{item.weight}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground"><strong>Measures:</strong> {item.what}</p>
                  <div className="space-y-2">
                    <div className="p-2 bg-green-50 dark:bg-green-950 rounded text-xs">
                      <span className="font-medium text-green-700 dark:text-green-300">Good: </span>
                      <span className="text-green-600 dark:text-green-400">{item.good}</span>
                    </div>
                    <div className="p-2 bg-red-50 dark:bg-red-950 rounded text-xs">
                      <span className="font-medium text-red-700 dark:text-red-300">Poor: </span>
                      <span className="text-red-600 dark:text-red-400">{item.poor}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quality Score Interpretation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Interpreting Quality Scores</h3>
          <div className="space-y-3">
            {[
              { range: '70-100%', badge: 'Good Quality', color: 'bg-green-100 text-green-800', meaning: 'Comment is well-structured with specific examples, evidence, and development focus.', action: 'Proceed with confidence—minor tweaks optional.' },
              { range: '40-69%', badge: 'Can Improve', color: 'bg-amber-100 text-amber-800', meaning: 'Comment has some good elements but lacks depth or specificity in key areas.', action: 'Review suggested improvements. Consider using AI enhancement.' },
              { range: 'Below 40%', badge: 'Needs Detail', color: 'bg-red-100 text-red-800', meaning: 'Comment is too vague to be useful. Lacks evidence, specificity, or actionable guidance.', action: 'Significant revision needed. Use AI to generate enhanced version.' }
            ].map((item) => (
              <div key={item.range} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold">{item.range}</span>
                  <Badge className={item.color}>{item.badge}</Badge>
                </div>
                <p className="text-sm text-muted-foreground"><strong>Meaning:</strong> {item.meaning}</p>
                <p className="text-sm text-muted-foreground"><strong>Action:</strong> {item.action}</p>
              </div>
            ))}
          </div>
        </div>

        <FieldReference fields={FIELD_REFERENCES} />

        {/* Using AI to Improve Comments */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Using AI to Improve Comments
          </h3>
          <p className="text-muted-foreground text-sm">
            When your quality score is below 70%, the "Improve with AI" button appears. 
            Here's how the enhancement works:
          </p>
          <div className="space-y-3">
            {[
              { step: '1', title: 'Click "Improve with AI"', desc: 'The button appears in the quality panel when your score needs improvement' },
              { step: '2', title: 'AI Analyzes Context', desc: 'The system considers the employee\'s ratings, goals, and your existing text' },
              { step: '3', title: 'Enhanced Version Generated', desc: 'AI produces an improved version with more specificity and evidence' },
              { step: '4', title: 'Review & Accept', desc: 'Compare original and enhanced versions. Accept, edit, or decline.' }
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Before and After Examples */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Before & After: AI Enhancement</h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-red-100 text-red-800">Before: 25% Quality</Badge>
              </div>
              <p className="text-sm italic">
                "John did good work this year. He met most of his goals and was helpful to the team. 
                Could improve on some things."
              </p>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">AI Enhancement</span>
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-100 text-green-800">After: 85% Quality</Badge>
              </div>
              <p className="text-sm italic">
                "John exceeded expectations this year, achieving 4 of 5 goals including the CRM 
                implementation delivered 2 weeks ahead of schedule. He proactively mentored two 
                junior team members, resulting in improved team velocity. To further develop, 
                consider the Project Management certification to enhance timeline estimation skills, 
                an area identified during Q3 planning sessions."
              </p>
            </div>
          </div>
        </div>

        <ConfigurationExample 
          title="Quality Scoring Logic" 
          code={QUALITY_ANALYSIS_CODE}
          description="Simplified view of how quality scores are calculated (actual implementation uses AI-enhanced analysis)"
        />

        {/* Writing High-Quality Comments */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Tips for High-Quality Comments
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { tip: 'Start with a specific achievement', example: '"Delivered the annual audit with zero findings..."' },
              { tip: 'Include measurable outcomes', example: '"...reducing processing time by 23%..."' },
              { tip: 'Reference documented evidence', example: '"...as reflected in Q3 customer survey results..."' },
              { tip: 'End with development focus', example: '"...consider advanced analytics training to build on this foundation."' }
            ].map((item) => (
              <div key={item.tip} className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">{item.tip}</h4>
                <p className="text-xs text-muted-foreground mt-1 italic">{item.example}</p>
              </div>
            ))}
          </div>
        </div>

        <TipCallout title="Best Practice">
          Write comments in short bursts, then check the quality score. It's easier to improve 
          incrementally than to rewrite a long low-quality comment entirely.
        </TipCallout>

        <WarningCallout title="Note">
          Quality analysis is guidance, not gatekeeping. Sometimes brief comments are appropriate 
          (e.g., for exceptional ratings with obvious evidence). Use your judgment.
        </WarningCallout>

        <BusinessRules rules={BUSINESS_RULES} />

        {/* Troubleshooting */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Troubleshooting
          </h3>
          <div className="space-y-2">
            {[
              { issue: 'Quality panel not appearing', cause: 'Comment is too short (under 10 characters)', solution: 'Continue typing—panel appears automatically.' },
              { issue: 'Score stuck at low percentage', cause: 'Missing key quality elements', solution: 'Check which dimension is lowest and add corresponding content.' },
              { issue: '"Improve with AI" not available', cause: 'Score is already above threshold or AI is disabled', solution: 'Verify AI is enabled in organization settings.' }
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
