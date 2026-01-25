import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Anchor, Target, CheckCircle2, AlertTriangle, Lightbulb, Settings, Star } from 'lucide-react';

export function F360BehavioralAnchors() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">2.4 Behavioral Anchors & BARS</h3>
        <p className="text-muted-foreground">
          Behavioral Anchors provide descriptive examples for each rating level, using BARS 
          (Behaviorally Anchored Rating Scales) methodology for consistent and objective assessments.
        </p>
      </div>

      {/* Learning Objectives */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Understand BARS methodology and its benefits for 360 feedback</li>
            <li>• Configure behavioral anchors for rating questions</li>
            <li>• Apply display modes: tooltip, inline, or popup</li>
            <li>• Use anchor templates for common competencies</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navigation Path */}
      <Card className="bg-muted/30">
        <CardContent className="py-3">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            <span className="font-medium">Navigation:</span>
            <span className="text-muted-foreground">
              Performance → Setup → 360 Feedback → Question Bank → [Question] → Behavioral Anchors
            </span>
          </div>
        </CardContent>
      </Card>

      {/* What is BARS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Anchor className="h-5 w-5" />
            What is BARS?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            <strong>Behaviorally Anchored Rating Scales (BARS)</strong> combine qualitative and 
            quantitative assessment by providing specific behavioral examples for each rating level. 
            This reduces rater subjectivity and improves consistency across evaluators.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-green-50/50 dark:bg-green-900/20">
              <h4 className="font-semibold text-sm mb-2 text-green-700 dark:text-green-300">Benefits</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Reduced rating bias</li>
                <li>• Clearer expectations</li>
                <li>• Consistent interpretations</li>
                <li>• Actionable feedback</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-900/20">
              <h4 className="font-semibold text-sm mb-2 text-blue-700 dark:text-blue-300">Components</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Numeric scale value</li>
                <li>• Short scale label</li>
                <li>• Behavioral description</li>
                <li>• Example behaviors</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-purple-50/50 dark:bg-purple-900/20">
              <h4 className="font-semibold text-sm mb-2 text-purple-700 dark:text-purple-300">Use Cases</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Leadership competencies</li>
                <li>• Technical skills</li>
                <li>• Values alignment</li>
                <li>• Behavioral assessments</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anchor Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Anchor Structure (Per Rating Level)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Field</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[200px]">Example</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                <TableRow>
                  <TableCell className="font-mono">scale_value</TableCell>
                  <TableCell>Number</TableCell>
                  <TableCell>Numeric rating level (1-5)</TableCell>
                  <TableCell className="text-muted-foreground">5</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">scale_label</TableCell>
                  <TableCell>Text</TableCell>
                  <TableCell>Short label for the level</TableCell>
                  <TableCell className="text-muted-foreground">"Role Model"</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">anchor_text</TableCell>
                  <TableCell>Text</TableCell>
                  <TableCell>Behavioral description (1-2 sentences)</TableCell>
                  <TableCell className="text-muted-foreground">"Consistently demonstrates exceptional..."</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">examples</TableCell>
                  <TableCell>Array</TableCell>
                  <TableCell>Specific behavioral examples</TableCell>
                  <TableCell className="text-muted-foreground">["Led cross-functional initiative", ...]</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Example BARS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5" />
            Example: Leadership Question BARS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Question:</strong> "Rate this person's ability to inspire and motivate team members"
          </p>
          
          <div className="space-y-3">
            {[
              {
                level: 5,
                label: 'Role Model',
                color: 'bg-green-100 dark:bg-green-900/30 border-green-300',
                desc: 'Consistently demonstrates exceptional leadership. Actively develops others and drives team success.',
                examples: ['Mentored 3+ team members to promotion', 'Led cross-functional initiative with measurable outcomes', 'Created team rituals that improved morale']
              },
              {
                level: 4,
                label: 'Exceeds Expectations',
                color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300',
                desc: 'Regularly inspires team members and creates positive team dynamics.',
                examples: ['Organized team development sessions', 'Recognized for team leadership by peers', 'Proactively addressed team conflicts']
              },
              {
                level: 3,
                label: 'Meets Expectations',
                color: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300',
                desc: 'Adequately motivates team and maintains positive working relationships.',
                examples: ['Provides regular feedback to team', 'Supports team goals and initiatives', 'Maintains open communication']
              },
              {
                level: 2,
                label: 'Needs Improvement',
                color: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300',
                desc: 'Inconsistent in motivating team. Some gaps in leadership behaviors.',
                examples: ['Feedback provided only when prompted', 'Team morale could be improved', 'Limited delegation of responsibilities']
              },
              {
                level: 1,
                label: 'Does Not Meet',
                color: 'bg-red-100 dark:bg-red-900/30 border-red-300',
                desc: 'Rarely demonstrates leadership behaviors. Team motivation is lacking.',
                examples: ['Team members feel unsupported', 'Communication gaps affect team performance', 'Avoids leadership responsibilities']
              },
            ].map((anchor) => (
              <div key={anchor.level} className={`p-4 rounded-lg border ${anchor.color}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center font-bold">
                    {anchor.level}
                  </div>
                  <Badge variant="outline">{anchor.label}</Badge>
                </div>
                <p className="text-sm mb-2">{anchor.desc}</p>
                <div className="text-xs text-muted-foreground">
                  <strong>Examples:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {anchor.examples.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Display Modes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Display Modes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Tooltip</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Anchors appear on hover/focus over rating options.
              </p>
              <Badge variant="secondary">Recommended for experienced raters</Badge>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Inline</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Anchors displayed below each rating option.
              </p>
              <Badge variant="secondary">Best for first-time raters</Badge>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Popup</h4>
              <p className="text-sm text-muted-foreground mb-2">
                "Show Guide" button opens full anchor reference.
              </p>
              <Badge variant="secondary">Balance of space and guidance</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step-by-Step: Configure Behavioral Anchors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, action: 'Navigate to Question Bank and select a rating question', result: 'Question detail view opens' },
              { step: 2, action: 'Click "Behavioral Anchors" tab', result: 'Displays anchor editor' },
              { step: 3, action: 'Select display mode (tooltip, inline, popup)', result: 'Determines how anchors appear to raters' },
              { step: 4, action: 'For each rating level (1-5), enter anchor text', result: '1-2 sentence behavioral description' },
              { step: 5, action: '(Optional) Add example behaviors for each level', result: 'Specific observable examples' },
              { step: 6, action: 'Click "Preview" to test rater experience', result: 'Shows how anchors will appear in form' },
              { step: 7, action: 'Save anchors', result: 'Anchors linked to question' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {item.step}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.action}</p>
                  <p className="text-sm text-muted-foreground">{item.result}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Anchor Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Anchor Templates (Pre-Built)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The system includes pre-built anchor templates for common competencies. Clone and customize as needed.
          </p>
          
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Leadership & Influence',
              'Communication',
              'Teamwork & Collaboration',
              'Problem Solving',
              'Customer Focus',
              'Innovation & Creativity',
              'Results Orientation',
              'Adaptability',
              'Technical Expertise',
              'Strategic Thinking'
            ].map((template) => (
              <div key={template} className="flex items-center gap-2 p-2 rounded border text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{template}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-green-600" />
            Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Use observable, measurable behaviors—avoid subjective traits like "good attitude"</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Keep anchor text concise (1-2 sentences); use examples for detail</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Ensure clear differentiation between adjacent levels (e.g., 3 vs 4)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Validate anchors with focus groups before cycle launch</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Use inline display mode for first-time 360 implementations</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                issue: 'Anchors not appearing in feedback form',
                cause: 'Display mode set to "none" or anchors not saved',
                solution: 'Verify display mode and check anchor save status'
              },
              {
                issue: 'Tooltip anchors cut off on mobile',
                cause: 'Long anchor text on small screens',
                solution: 'Use popup mode for mobile or shorten anchor text'
              },
              {
                issue: 'Raters confused by level differences',
                cause: 'Anchors too similar between levels',
                solution: 'Revise anchors with clearer behavioral distinctions'
              },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg border border-amber-300 bg-white dark:bg-background">
                <div className="font-medium text-sm">{item.issue}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-medium">Cause:</span> {item.cause}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  <span className="font-medium">Solution:</span> {item.solution}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
