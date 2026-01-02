import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Settings, CheckCircle, AlertTriangle, Lightbulb, Clock } from 'lucide-react';
import { NavigationPath } from './NavigationPath';
import { NAVIGATION_PATHS } from './navigationPaths';

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
          <NavigationPath path={NAVIGATION_PATHS['sec-2-1']} />
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
          <NavigationPath path={NAVIGATION_PATHS['sec-2-2']} />
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

      {/* Overall Rating Scales */}
      <Card id="sec-2-3">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 2.3</Badge>
            <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Annual review</Badge>
          </div>
          <CardTitle className="text-2xl">Overall Rating Scales Setup</CardTitle>
          <CardDescription>Configuring final appraisal rating categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-2-3']} />
          <p className="text-muted-foreground">
            Overall rating scales define the final performance categories that aggregate all component scores.
            These categories typically align with compensation and talent planning decisions.
          </p>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Score Range</th>
                  <th className="text-left p-3 font-medium">Target Distribution</th>
                  <th className="text-left p-3 font-medium">Compensation Impact</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { category: 'Exceptional', range: '4.5 - 5.0', dist: '10%', impact: 'Maximum merit + bonus' },
                  { category: 'Exceeds Expectations', range: '3.75 - 4.49', dist: '20%', impact: 'Above-average merit' },
                  { category: 'Meets Expectations', range: '2.75 - 3.74', dist: '40%', impact: 'Standard merit' },
                  { category: 'Needs Improvement', range: '1.75 - 2.74', dist: '20%', impact: 'Reduced/no merit' },
                  { category: 'Unsatisfactory', range: '1.0 - 1.74', dist: '10%', impact: 'No merit, PIP required' }
                ].map((row) => (
                  <tr key={row.category} className="border-t">
                    <td className="p-3 font-medium">{row.category}</td>
                    <td className="p-3">{row.range}</td>
                    <td className="p-3">{row.dist}</td>
                    <td className="p-3 text-muted-foreground">{row.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground">Calibration Connection</h4>
                <p className="text-sm text-muted-foreground">
                  Target distributions are guidelines for calibration sessions. Actual distributions may vary 
                  by department or team based on performance profiles.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competency Library Integration */}
      <Card id="sec-2-4">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 2.4</Badge>
            <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Quarterly updates</Badge>
          </div>
          <CardTitle className="text-2xl">Competency Library Integration</CardTitle>
          <CardDescription>Connecting competencies to appraisal forms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-2-4']} />
          <p className="text-muted-foreground">
            The Competency Library serves as the foundation for behavioral assessments in appraisals. 
            Competencies must be properly linked to job families or positions before they can appear on evaluation forms.
          </p>

          <div>
            <h4 className="font-medium mb-3">Integration Steps</h4>
            <div className="space-y-3">
              {[
                { step: 1, title: 'Verify Competency Library', desc: 'Ensure all required competencies are defined with behavioral indicators and proficiency levels' },
                { step: 2, title: 'Assign to Job Families', desc: 'Map competencies to job families (e.g., Leadership, Technical, Customer Service)' },
                { step: 3, title: 'Set Proficiency Expectations', desc: 'Define expected proficiency level for each job grade within the family' },
                { step: 4, title: 'Link to Appraisal Template', desc: 'Configure the appraisal template to pull competencies dynamically based on employee job assignment' }
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-sm flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h5 className="font-medium">{item.title}</h5>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Core Competencies</h5>
              <p className="text-sm text-muted-foreground mb-2">Applied to all employees</p>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Communication</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Teamwork</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Problem Solving</div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Leadership Competencies</h5>
              <p className="text-sm text-muted-foreground mb-2">Manager+ positions</p>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Strategic Thinking</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> People Development</div>
                <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Change Management</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appraisal Form Templates */}
      <Card id="sec-2-5">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 2.5</Badge>
            <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Annual refresh</Badge>
          </div>
          <CardTitle className="text-2xl">Appraisal Form Templates</CardTitle>
          <CardDescription>Creating and configuring evaluation templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-2-5']} />
          <p className="text-muted-foreground">
            Templates define the structure and content of appraisal forms. Different templates can be created 
            for various employee populations (individual contributors, managers, executives).
          </p>

          <div>
            <h4 className="font-medium mb-3">Template Sections</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { section: 'Goals Section', weight: '40%', desc: 'Dynamic pull from Goals module based on cycle period' },
                { section: 'Competencies Section', weight: '20%', desc: 'Based on job-level competency assignment' },
                { section: 'Responsibilities Section', weight: '30%', desc: 'From job description duties and accountabilities' },
                { section: 'Values Section', weight: '10%', desc: 'Organization-wide values and behaviors' }
              ].map((item) => (
                <div key={item.section} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{item.section}</h5>
                    <Badge variant="secondary">{item.weight}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-3">Template Configuration Options</h4>
            <div className="space-y-2 text-sm">
              {[
                'Allow weight override by managers (with HR approval)',
                'Include self-assessment section',
                'Enable 360 feedback integration',
                'Configure comment requirements (optional vs required)',
                'Set evidence attachment options',
                'Define signature/acknowledgment workflow'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-foreground">Best Practice</h4>
                <p className="text-sm text-muted-foreground">
                  Create and test templates 2-4 weeks before cycle launch. Avoid modifying active templates 
                  as changes may affect in-progress evaluations.
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
          <NavigationPath path={NAVIGATION_PATHS['sec-2-6']} />
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
