import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Target, CheckCircle2, AlertTriangle, Lightbulb, Settings, Database, FileText, Save, RefreshCw } from 'lucide-react';

export function F360CycleTemplates() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">2.11 Cycle Templates & Cloning</h3>
        <p className="text-muted-foreground">
          Cycle templates enable rapid creation of new 360 feedback cycles by cloning proven 
          configurations. Save time and ensure consistency across cycles.
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
            <li>• Save existing cycles as reusable templates</li>
            <li>• Clone templates with automatic date adjustments</li>
            <li>• Organize templates with tags for easy discovery</li>
            <li>• Understand what data is copied vs. what requires fresh input</li>
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
              Performance → Setup → 360 Feedback → Cycle Templates
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Database Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            Database Table: feedback_360_cycle_templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Field</TableHead>
                  <TableHead className="w-[80px]">Required</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {[
                  { field: 'name', required: true, type: 'Text', desc: 'Template display name' },
                  { field: 'description', required: false, type: 'Text', desc: 'Purpose and usage notes' },
                  { field: 'source_cycle_id', required: false, type: 'UUID', desc: 'Original cycle if saved from existing' },
                  { field: 'configuration', required: true, type: 'JSON', desc: 'Complete cycle configuration snapshot' },
                  { field: 'tags', required: false, type: 'Array', desc: 'Categorization tags for filtering' },
                  { field: 'is_system', required: true, type: 'Boolean', desc: 'System-provided template (read-only)' },
                  { field: 'usage_count', required: false, type: 'Number', desc: 'Times this template has been cloned' },
                  { field: 'last_used_at', required: false, type: 'Timestamp', desc: 'Most recent clone timestamp' },
                  { field: 'is_active', required: true, type: 'Boolean', desc: 'Available for use' },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs">{row.field}</TableCell>
                    <TableCell>
                      <Badge variant={row.required ? 'default' : 'secondary'} className="text-xs">
                        {row.required ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.type}</TableCell>
                    <TableCell>{row.desc}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* What Gets Copied */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Copy className="h-5 w-5" />
            What Gets Copied vs. Not Copied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-green-300 bg-green-50/50 dark:bg-green-900/20">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle2 className="h-4 w-4" />
                Copied (Template Configuration)
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Question assignments and visibility matrix</li>
                <li>• Rater category settings and weights</li>
                <li>• Anonymity and visibility rules</li>
                <li>• Report template selections</li>
                <li>• Email template assignments</li>
                <li>• Reminder schedules</li>
                <li>• Integration flags (appraisal, nine-box)</li>
                <li>• Framework/competency links</li>
                <li>• Cycle name pattern (with date placeholder)</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-red-300 bg-red-50/50 dark:bg-red-900/20">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertTriangle className="h-4 w-4" />
                NOT Copied (Cycle-Specific Data)
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Participants (subjects)</li>
                <li>• Rater assignments</li>
                <li>• Feedback responses</li>
                <li>• Talent signals/snapshots</li>
                <li>• Development themes</li>
                <li>• Specific dates (recalculated)</li>
                <li>• Cycle status (starts as Draft)</li>
                <li>• Audit trail</li>
                <li>• Reports (generated fresh)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            System Templates (Pre-Built)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                name: 'Annual 360 Review',
                tags: ['annual', 'comprehensive'],
                desc: 'Full 360 feedback cycle with all rater categories, 30+ questions, detailed reports',
                duration: '6-8 weeks'
              },
              {
                name: 'Leadership 360',
                tags: ['leadership', 'executives'],
                desc: 'Focused on leadership competencies for managers and above',
                duration: '4-6 weeks'
              },
              {
                name: 'Quick Pulse 360',
                tags: ['pulse', 'lightweight'],
                desc: 'Abbreviated cycle with 10-15 questions, faster turnaround',
                duration: '2-3 weeks'
              },
              {
                name: 'New Manager 360',
                tags: ['onboarding', 'managers'],
                desc: 'Focused assessment for newly promoted managers (6-month checkpoint)',
                duration: '3-4 weeks'
              },
              {
                name: 'Development 360',
                tags: ['development', 'coaching'],
                desc: 'Emphasis on development themes and coaching, less on evaluation',
                duration: '4-5 weeks'
              },
              {
                name: 'External Stakeholder 360',
                tags: ['external', 'customer'],
                desc: 'Customer/vendor-focused with external rater emphasis',
                duration: '4-6 weeks'
              },
            ].map((template) => (
              <div key={template.name} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{template.name}</span>
                  <Badge variant="secondary">{template.duration}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{template.desc}</p>
                <div className="flex gap-1 flex-wrap">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Date Adjustment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <RefreshCw className="h-5 w-5" />
            Automatic Date Adjustment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            When cloning, all dates are recalculated relative to the new start date you specify.
          </p>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Field</TableHead>
                  <TableHead>Original</TableHead>
                  <TableHead>New Start: Mar 1</TableHead>
                  <TableHead>Calculation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {[
                  { field: 'Start Date', orig: 'Jan 15', new: 'Mar 1', calc: 'User specified' },
                  { field: 'Nomination Deadline', orig: 'Jan 29 (+14d)', new: 'Mar 15', calc: '+14 days from start' },
                  { field: 'Feedback Deadline', orig: 'Feb 19 (+35d)', new: 'Apr 5', calc: '+35 days from start' },
                  { field: 'Processing Date', orig: 'Feb 21 (+37d)', new: 'Apr 7', calc: '+37 days from start' },
                  { field: 'Results Release', orig: 'Feb 26 (+42d)', new: 'Apr 12', calc: '+42 days from start' },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{row.field}</TableCell>
                    <TableCell className="text-muted-foreground">{row.orig}</TableCell>
                    <TableCell>{row.new}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.calc}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step: Save Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Save className="h-5 w-5" />
            Step-by-Step: Save Cycle as Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, action: 'Navigate to an existing 360 cycle (preferably completed)', result: 'Opens cycle detail view' },
              { step: 2, action: 'Click "Actions" menu → "Save as Template"', result: 'Opens template save dialog' },
              { step: 3, action: 'Enter template name and description', result: 'e.g., "Q4 Annual 360 - Full Cycle"' },
              { step: 4, action: 'Add tags for categorization', result: 'e.g., "annual", "full-cycle", "2025"' },
              { step: 5, action: 'Review configuration preview', result: 'Shows what will be saved' },
              { step: 6, action: 'Click "Save Template"', result: 'Template created and available in library' },
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

      {/* Step-by-Step: Clone Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Copy className="h-5 w-5" />
            Step-by-Step: Clone from Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, action: 'Navigate to Performance → Setup → 360 Feedback → Cycle Templates', result: 'Template library view' },
              { step: 2, action: 'Search or filter for desired template', result: 'Use tags or name search' },
              { step: 3, action: 'Click on template to preview configuration', result: 'Shows all included settings' },
              { step: 4, action: 'Click "Clone to New Cycle"', result: 'Opens clone dialog' },
              { step: 5, action: 'Enter new cycle name', result: 'e.g., "Q1 2026 Annual 360"' },
              { step: 6, action: 'Set cycle start date', result: 'All other dates auto-calculated' },
              { step: 7, action: 'Review and adjust dates if needed', result: 'Optional fine-tuning' },
              { step: 8, action: 'Click "Create Cycle"', result: 'New cycle created in Draft status' },
              { step: 9, action: 'Add participants to the new cycle', result: 'Enroll subjects for feedback' },
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
              <span>Save templates from successful cycles—capture proven configurations</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Use descriptive names with year/quarter (e.g., "Annual 360 - Standard 2025")</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Tag templates by purpose (annual, pulse, leadership) for easy filtering</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Create separate templates for different populations (executives vs. IC)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Review and update templates annually—configurations may need refreshing</span>
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
                issue: 'Template not appearing in library',
                cause: 'Template is_active = false or created in different company',
                solution: 'Verify is_active flag and company scope'
              },
              {
                issue: 'Cloned cycle missing questions',
                cause: 'Questions in original cycle were deactivated',
                solution: 'Re-activate questions or update template configuration'
              },
              {
                issue: 'Date adjustment calculating incorrectly',
                cause: 'Original cycle had irregular date spacing',
                solution: 'Manually adjust dates after cloning'
              },
              {
                issue: 'Cannot edit system template',
                cause: 'System templates are read-only (is_system = true)',
                solution: 'Clone system template to create editable custom version'
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
