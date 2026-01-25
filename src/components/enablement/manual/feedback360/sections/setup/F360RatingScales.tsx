import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sliders, Target, CheckCircle2, AlertTriangle, Lightbulb, Settings, Star } from 'lucide-react';

export function F360RatingScales() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">2.5 Rating Scales Configuration</h3>
        <p className="text-muted-foreground">
          Rating scales define the numeric values and labels used for rating-type questions. 
          360 feedback typically uses a 5-point scale with behavioral descriptions.
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
            <li>• Configure or select a 360-compatible rating scale</li>
            <li>• Understand scale purposes and their applications</li>
            <li>• Apply display options for optimal rater experience</li>
            <li>• Set up N/A (Not Applicable) handling</li>
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
              Performance → Setup → Foundation → Rating Scales
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Standard 360 Scale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5" />
            Standard 360 Feedback Scale (5-Point)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Value</TableHead>
                  <TableHead className="w-[180px]">Label</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[120px]">Score Weight</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {[
                  { value: 5, label: 'Role Model / Exceptional', desc: 'Consistently exceeds expectations; serves as example for others', weight: '100%' },
                  { value: 4, label: 'Exceeds Expectations', desc: 'Regularly performs above expected level', weight: '80%' },
                  { value: 3, label: 'Meets Expectations', desc: 'Performs at expected level consistently', weight: '60%' },
                  { value: 2, label: 'Needs Improvement', desc: 'Performance below expectations; improvement needed', weight: '40%' },
                  { value: 1, label: 'Does Not Meet', desc: 'Significant performance gaps; urgent attention required', weight: '20%' },
                ].map((row) => (
                  <TableRow key={row.value}>
                    <TableCell className="font-bold text-lg">{row.value}</TableCell>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell className="text-muted-foreground">{row.desc}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{row.weight}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Scale Purposes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sliders className="h-5 w-5" />
            Scale Purposes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Rating scales are tagged with purposes to ensure the correct scale is used in each context.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                purpose: '360_feedback',
                desc: 'Specifically designed for 360 multi-rater assessments',
                recommended: true
              },
              {
                purpose: 'performance_review',
                desc: 'For annual/quarterly performance appraisals',
                recommended: false
              },
              {
                purpose: 'competency_assessment',
                desc: 'For competency-based evaluations',
                recommended: false
              },
              {
                purpose: 'universal',
                desc: 'Can be used across all assessment types',
                recommended: true
              }
            ].map((item) => (
              <div key={item.purpose} className={`p-4 rounded-lg border ${item.recommended ? 'border-green-300 bg-green-50/50 dark:bg-green-900/20' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-mono">{item.purpose}</Badge>
                  {item.recommended && <Badge variant="default" className="text-xs">Recommended</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Display Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Display Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Numbers Only</h4>
              <div className="flex gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="w-8 h-8 rounded-full border flex items-center justify-center text-sm font-medium">
                    {n}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Compact, but requires label reference</p>
            </div>
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Labels Only</h4>
              <div className="space-y-1 text-xs">
                <div className="p-1 rounded bg-muted">Does Not Meet</div>
                <div className="p-1 rounded bg-muted">Needs Improvement</div>
                <div className="p-1 rounded bg-muted">Meets Expectations</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Clear meaning, takes more space</p>
            </div>
            <div className="p-4 rounded-lg border border-green-300 bg-green-50/50 dark:bg-green-900/20">
              <h4 className="font-semibold mb-2">Numbers + Labels</h4>
              <div className="space-y-1 text-xs">
                <div className="p-1 rounded bg-muted flex items-center gap-2">
                  <span className="font-bold">5</span> Role Model
                </div>
                <div className="p-1 rounded bg-muted flex items-center gap-2">
                  <span className="font-bold">4</span> Exceeds
                </div>
                <div className="p-1 rounded bg-muted flex items-center gap-2">
                  <span className="font-bold">3</span> Meets
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Recommended for 360</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* N/A Handling */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">N/A (Not Applicable) Handling</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Configure how "Not Applicable" responses are treated in 360 feedback.
          </p>
          
          <div className="space-y-3">
            {[
              {
                option: 'Exclude from Average',
                desc: 'N/A responses are not counted in score calculations',
                recommended: true
              },
              {
                option: 'Count as Zero',
                desc: 'N/A treated as lowest rating (penalizes unknown areas)',
                recommended: false
              },
              {
                option: 'Count as Midpoint',
                desc: 'N/A treated as neutral (e.g., 3 on 5-point scale)',
                recommended: false
              },
              {
                option: 'Disable N/A',
                desc: 'Raters must provide a rating for all questions',
                recommended: false
              }
            ].map((item) => (
              <div key={item.option} className={`p-3 rounded-lg border flex items-start gap-3 ${item.recommended ? 'border-green-300 bg-green-50/50 dark:bg-green-900/20' : ''}`}>
                <CheckCircle2 className={`h-5 w-5 mt-0.5 shrink-0 ${item.recommended ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.option}</span>
                    {item.recommended && <Badge variant="default" className="text-xs">Recommended</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scale Configuration Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              'Scale has 5 points (industry standard for 360)',
              'Labels are clear and progressively distinct',
              'Behavioral descriptions defined for each level',
              'Purpose includes "360_feedback" or "universal"',
              'N/A handling set to "Exclude from Average"',
              'Display mode set to "Numbers + Labels"',
              'Scale is marked as active',
              'Linked to rating questions in Question Bank'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{item}</span>
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
              <span>Use a 5-point scale (1-5) for optimal rating distribution—7-point adds complexity without value</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Align 360 scale with performance review scale if feeding into appraisals</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Avoid "0" as a rating value—start at 1 for consistency</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Include N/A option for questions raters may not be able to evaluate</span>
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
                issue: 'Scale not available for 360 questions',
                cause: 'Scale purpose does not include "360_feedback"',
                solution: 'Edit scale and add "360_feedback" to purposes'
              },
              {
                issue: 'Scores not calculating correctly',
                cause: 'N/A handling misconfigured or scale values non-sequential',
                solution: 'Verify N/A handling and check scale value sequence'
              },
              {
                issue: 'Raters confused by scale direction',
                cause: 'Inconsistent scale direction (high-to-low vs low-to-high)',
                solution: 'Standardize on 1=low, 5=high across all scales'
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
