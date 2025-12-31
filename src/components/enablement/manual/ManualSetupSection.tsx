import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Settings, CheckCircle, AlertTriangle, Lightbulb, Clock } from 'lucide-react';

export function ManualSetupSection() {
  return (
    <div className="space-y-8">
      {/* Prerequisites Checklist */}
      <Card id="sec-2-1">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 2.1</Badge>
            <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />One-time setup</Badge>
          </div>
          <CardTitle className="text-2xl">Pre-requisites Checklist</CardTitle>
          <CardDescription>Complete these items before configuring appraisals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground">Important</h4>
                <p className="text-sm text-muted-foreground">
                  Complete these prerequisites 4-6 weeks before your planned go-live date.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Rating Scales configured for goals, competencies, and responsibilities', critical: true },
              { label: 'Overall Rating Scales defined with performance categories', critical: true },
              { label: 'Competency Library populated with behavioral indicators', critical: true },
              { label: 'Job Profiles assigned with competencies and responsibilities', critical: true },
              { label: 'Employee-Manager relationships established in org hierarchy', critical: true },
              { label: 'Performance Categories defined with score thresholds', critical: false },
              { label: 'Goal cycles created and goals assigned to employees', critical: false },
              { label: 'Notification templates configured for appraisal events', critical: false }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                <Checkbox id={`prereq-${i}`} />
                <label htmlFor={`prereq-${i}`} className="flex-1 text-sm cursor-pointer">
                  {item.label}
                </label>
                {item.critical && <Badge variant="destructive" className="text-xs">Required</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rating Scales */}
      <Card id="sec-2-2">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 2.2</Badge>
            <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Annual review</Badge>
          </div>
          <CardTitle className="text-2xl">Rating Scales Configuration</CardTitle>
          <CardDescription>Setting up component-level rating scales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Rating scales define how individual items (goals, competencies, responsibilities) are scored 
            during evaluations. Industry standard is a 5-point scale.
          </p>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Rating</th>
                  <th className="text-left p-3 font-medium">Label</th>
                  <th className="text-left p-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { rating: 5, label: 'Exceptional', desc: 'Consistently exceeds all expectations' },
                  { rating: 4, label: 'Exceeds Expectations', desc: 'Frequently exceeds expectations' },
                  { rating: 3, label: 'Meets Expectations', desc: 'Consistently meets expectations' },
                  { rating: 2, label: 'Needs Improvement', desc: 'Occasionally meets expectations' },
                  { rating: 1, label: 'Unsatisfactory', desc: 'Does not meet expectations' }
                ].map((row) => (
                  <tr key={row.rating} className="border-t">
                    <td className="p-3 font-medium">{row.rating}</td>
                    <td className="p-3">{row.label}</td>
                    <td className="p-3 text-muted-foreground">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground">Industry Standard</h4>
                <p className="text-sm text-muted-foreground">
                  Some organizations prefer a 4-point scale to eliminate the "middle option" tendency. 
                  Consider your organizational culture when choosing.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appraisal Cycles */}
      <Card id="sec-2-6">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 2.6</Badge>
            <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Per cycle</Badge>
          </div>
          <CardTitle className="text-2xl">Appraisal Cycles Configuration</CardTitle>
          <CardDescription>Setting up annual, semi-annual, or probationary cycles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-2">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Annual Review</h4>
                <p className="text-sm text-muted-foreground">
                  Standard yearly evaluation aligned with fiscal year
                </p>
                <Badge className="mt-2" variant="outline">Most Common</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Semi-Annual</h4>
                <p className="text-sm text-muted-foreground">
                  Mid-year and year-end evaluations for continuous feedback
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-medium mb-2">Probation Review</h4>
                <p className="text-sm text-muted-foreground">
                  New hire evaluations at 30, 60, or 90 days
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Key Configuration Options</h4>
            <div className="space-y-2 text-sm">
              {[
                'Weight configuration (Goals + Competencies + Responsibilities + Values = 100%)',
                'Include/exclude self-assessment',
                'Enable 360 Feedback integration',
                'Set evaluation deadline and grace period',
                'Configure multi-position mode (Aggregate vs Separate)',
                'Lock weights to prevent manager overrides'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
