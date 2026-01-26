import { LearningObjectives } from '../../../components/LearningObjectives';
import { StepByStep, Step } from '../../../components/StepByStep';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { AlertCircle, Shield, Eye, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const learningObjectives = [
  'Identify the five categories of bias detected by the system',
  'Understand how bias warnings are displayed inline during feedback',
  'Process bias warnings: acknowledge, edit, or dispute',
  'Review aggregated bias patterns for training opportunities'
];

const biasCategories = [
  {
    type: 'Gender-Coded Language',
    icon: '👤',
    severity: 'medium',
    examples: ['"She is nurturing"', '"He is aggressive"', '"She should be more assertive"'],
    neutralAlternatives: ['"They demonstrate supportive leadership"', '"They advocate strongly"', '"Could be more direct in communication"']
  },
  {
    type: 'Age-Related Bias',
    icon: '📅',
    severity: 'medium',
    examples: ['"For someone their age"', '"Young and energetic"', '"Old-school approach"'],
    neutralAlternatives: ['"Given their experience level"', '"Brings enthusiasm"', '"Traditional methodology"']
  },
  {
    type: 'Racial/Cultural Undertones',
    icon: '🌍',
    severity: 'high',
    examples: ['"Articulate for a..."', '"They speak so well"', 'Stereotyping references'],
    neutralAlternatives: ['"Communicates effectively"', '"Strong verbal communication"', 'Focus on specific behaviors']
  },
  {
    type: 'Vague/Subjective Language',
    icon: '☁️',
    severity: 'low',
    examples: ['"Has attitude"', '"Just doesn\'t fit in"', '"Difficult personality"'],
    neutralAlternatives: ['"Specific behavior observed..."', '"Collaboration opportunities..."', '"In meetings, they tend to..."']
  },
  {
    type: 'Conditional Praise',
    icon: '⚠️',
    severity: 'low',
    examples: ['"Good for a first attempt"', '"Better than expected"', '"Not bad for someone new"'],
    neutralAlternatives: ['"Solid first delivery"', '"Exceeded project requirements"', '"Quick learner with growing proficiency"']
  }
];

const severityLevels = [
  { level: 'low', color: 'bg-amber-500', action: 'Advisory - shown as suggestion' },
  { level: 'medium', color: 'bg-orange-500', action: 'Warning - highlighted inline with prompt to edit' },
  { level: 'high', color: 'bg-red-500', action: 'Alert - strong recommendation to revise; logged for pattern analysis' }
];

const warningResponseSteps: Step[] = [
  {
    title: 'Notice the Inline Warning',
    description: 'Bias warnings appear as highlighted text with an icon.',
    substeps: [
      'Flagged text is underlined with warning color',
      'Hover to see the bias category detected',
      'Click for detailed explanation and alternatives'
    ],
    expectedResult: 'Understanding of what triggered the warning'
  },
  {
    title: 'Choose Your Response',
    description: 'Select how to handle the flagged content.',
    substeps: [
      'Edit: Revise the text using suggested alternatives',
      'Acknowledge: Keep text but confirm awareness',
      'Dispute: Flag as false positive with reason'
    ],
    expectedResult: 'Response recorded; if edited, warning clears'
  },
  {
    title: 'Continue Writing',
    description: 'Complete your feedback with bias-aware language.',
    substeps: [
      'Apply learnings to remaining content',
      'Use behavioral language over personality',
      'Reference specific examples when possible'
    ],
    expectedResult: 'Higher quality, more objective feedback'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'Bias warnings are advisory only',
    enforcement: 'Policy',
    description: 'Warnings do not block submission; they inform and educate the rater'
  },
  {
    rule: 'All warnings are logged',
    enforcement: 'System',
    description: 'Warning instances, responses, and outcomes stored for pattern analysis'
  },
  {
    rule: 'Disputes trigger review',
    enforcement: 'Policy',
    description: 'Disputed warnings reviewed by HR to improve AI accuracy'
  },
  {
    rule: 'Pattern analysis informs training',
    enforcement: 'Advisory',
    description: 'Aggregate bias patterns identify unconscious bias training needs'
  },
  {
    rule: 'No punitive action for warnings',
    enforcement: 'Policy',
    description: 'Warnings are educational; managers cannot see individual warning counts'
  }
];

export function AIBiasDetectionWarnings() {
  return (
    <section id="sec-5-5" data-manual-anchor="sec-5-5" className="scroll-mt-32 space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          5.5 Bias Detection & Warnings
        </h3>
        <p className="text-muted-foreground mt-2">
          EEOC-aligned bias detection with inline warnings and neutral language suggestions.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Bias Categories */}
      <div>
        <h4 className="font-medium flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4" />
          Bias Categories Detected
        </h4>
        <div className="space-y-4">
          {biasCategories.map((cat) => (
            <Card key={cat.type}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.icon}</span>
                    <h5 className="font-medium">{cat.type}</h5>
                  </div>
                  <Badge className={
                    cat.severity === 'high' ? 'bg-red-500' :
                    cat.severity === 'medium' ? 'bg-orange-500' : 'bg-amber-500'
                  }>
                    {cat.severity} severity
                  </Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs font-medium text-red-600 uppercase">Flagged Examples</span>
                    <ul className="mt-2 space-y-1">
                      {cat.examples.map((ex, i) => (
                        <li key={i} className="text-muted-foreground italic">• {ex}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-green-600 uppercase">Neutral Alternatives</span>
                    <ul className="mt-2 space-y-1">
                      {cat.neutralAlternatives.map((alt, i) => (
                        <li key={i} className="text-muted-foreground">• {alt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Severity Levels */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Eye className="h-4 w-4" />
            Severity Levels & System Response
          </h4>
          <div className="space-y-3">
            {severityLevels.map((s) => (
              <div key={s.level} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${s.color}`} />
                  <span className="font-medium capitalize">{s.level}</span>
                </div>
                <span className="text-sm text-muted-foreground">{s.action}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inline Warning Display */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Inline Warning Display Example</h4>
          <div className="p-4 border-2 border-dashed rounded-lg bg-muted/50">
            <p className="text-sm leading-relaxed">
              Maria is an excellent team member. 
              <span className="bg-amber-200 dark:bg-amber-800 border-b-2 border-amber-500 px-1 relative">
                She is nurturing
                <span className="absolute -top-6 left-0 bg-amber-100 dark:bg-amber-900 text-xs px-2 py-1 rounded border border-amber-300 dark:border-amber-700">
                  ⚠️ Gender-coded language
                </span>
              </span>
              {" "}and supports her colleagues well. In the Q3 project, she delivered ahead of schedule.
            </p>
            <div className="mt-4 p-3 bg-background border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Potential bias detected</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                "Nurturing" is commonly used as gender-coded language. Consider using behavior-specific alternatives.
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  ✏️ Edit Text
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  ✓ Acknowledge
                </Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                  ✗ Dispute
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepByStep steps={warningResponseSteps} title="Responding to Bias Warnings" />

      <BusinessRules rules={businessRules} />

      {/* EEOC Context */}
      <div className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950 rounded-r-lg">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-blue-500 flex-shrink-0 mt-1" />
          <div>
            <h5 className="font-medium text-sm">EEOC Compliance Context</h5>
            <p className="text-sm text-muted-foreground mt-1">
              This system aligns with EEOC guidelines for preventing discrimination in performance evaluations. 
              Bias detection is educational, not punitive, and helps organizations build more equitable 
              feedback cultures. Pattern analysis can identify training needs without exposing individuals.
            </p>
          </div>
        </div>
      </div>

      {/* Fairness Metrics Dashboard */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-primary" />
            Aggregated Fairness Metrics
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            EEOC-aligned fairness monitoring tracks bias patterns across demographic groups without exposing individual data.
          </p>
          
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Metric</th>
                  <th className="text-left p-3 font-medium">Calculation</th>
                  <th className="text-left p-3 font-medium">Target</th>
                  <th className="text-left p-3 font-medium">Review Frequency</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-3 font-medium">Demographic Parity Score</td>
                  <td className="p-3 text-muted-foreground">Bias incident rate across protected groups</td>
                  <td className="p-3"><Badge variant="outline" className="bg-green-50 text-green-700">&lt;10% variance</Badge></td>
                  <td className="p-3">Quarterly</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Adverse Impact Ratio</td>
                  <td className="p-3 text-muted-foreground">Selection/warning rate ratio (4/5ths rule)</td>
                  <td className="p-3"><Badge variant="outline" className="bg-green-50 text-green-700">≥0.80</Badge></td>
                  <td className="p-3">Quarterly</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">False Positive Rate</td>
                  <td className="p-3 text-muted-foreground">Disputed warnings confirmed as false positive</td>
                  <td className="p-3"><Badge variant="outline" className="bg-green-50 text-green-700">&lt;5%</Badge></td>
                  <td className="p-3">Monthly</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Pattern Detection Coverage</td>
                  <td className="p-3 text-muted-foreground">% of feedback analyzed for bias patterns</td>
                  <td className="p-3"><Badge variant="outline" className="bg-green-50 text-green-700">100%</Badge></td>
                  <td className="p-3">Per cycle</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h5 className="text-sm font-medium mb-2">Quarterly Fairness Review Process</h5>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Generate aggregated fairness report from <code className="text-xs bg-background px-1 py-0.5 rounded">ai_governance_metrics</code></li>
              <li>Review bias incident patterns by category and severity</li>
              <li>Identify training needs for departments with elevated patterns</li>
              <li>Update bias detection model if false positive rate exceeds threshold</li>
              <li>Document findings in quarterly AI governance report</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Measured Impact */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium flex items-center gap-2 mb-4">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Measured Impact
          </h4>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">-41%</div>
              <div className="text-sm font-medium mt-1">Bias Incidents</div>
              <p className="text-xs text-muted-foreground mt-2">Reduction after warning implementation</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">73%</div>
              <div className="text-sm font-medium mt-1">Edit Rate</div>
              <p className="text-xs text-muted-foreground mt-2">Raters who revise after seeing warning</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">4%</div>
              <div className="text-sm font-medium mt-1">Dispute Rate</div>
              <p className="text-xs text-muted-foreground mt-2">Warnings challenged as false positive</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
