import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileBarChart, Target, CheckCircle2, AlertTriangle, Lightbulb, Settings, Database, Eye, EyeOff } from 'lucide-react';

export function F360ReportTemplates() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">2.6 Report Templates Setup</h3>
        <p className="text-muted-foreground">
          Report templates control what information is displayed to each audience in 360 feedback reports.
          Different stakeholders see different levels of detail based on their role and need.
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
            <li>• Configure audience-specific report templates</li>
            <li>• Set content depth levels for each template</li>
            <li>• Configure section visibility and anonymity levels</li>
            <li>• Understand report generation and distribution workflow</li>
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
              Performance → Setup → 360 Feedback → Report Templates
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Database Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            Database Table: feedback_report_templates
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
                  { field: 'audience_type', required: true, type: 'Enum', desc: 'executive, manager, individual_contributor, hr, self' },
                  { field: 'content_depth', required: true, type: 'Enum', desc: 'high_level, summary, detailed, comprehensive' },
                  { field: 'anonymity_level', required: true, type: 'Enum', desc: 'strict (category only), standard, relaxed' },
                  { field: 'sections_config', required: true, type: 'JSON', desc: 'Array of enabled sections with visibility flags' },
                  { field: 'show_scores', required: true, type: 'Boolean', desc: 'Display numeric ratings' },
                  { field: 'show_percentiles', required: false, type: 'Boolean', desc: 'Show comparison to benchmarks' },
                  { field: 'show_verbatim_comments', required: true, type: 'Boolean', desc: 'Display open-text responses' },
                  { field: 'show_ai_insights', required: false, type: 'Boolean', desc: 'Include AI-generated analysis' },
                  { field: 'is_default', required: false, type: 'Boolean', desc: 'Default template for audience type' },
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

      {/* Audience Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileBarChart className="h-5 w-5" />
            Audience-Specific Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                audience: 'Executive',
                color: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300',
                depth: 'High-Level',
                sections: ['Executive Summary', 'Overall Score', 'Top Strengths/Gaps', 'Benchmarks'],
                comments: 'Themed only',
                aiInsights: true,
                desc: 'Strategic view for senior leadership reviewing talent pools'
              },
              {
                audience: 'Manager',
                color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300',
                depth: 'Detailed',
                sections: ['Full Scores', 'Category Breakdown', 'Comments', 'Coaching Prompts', 'Development Themes'],
                comments: 'Anonymized',
                aiInsights: true,
                desc: 'Comprehensive view for managers to coach direct reports'
              },
              {
                audience: 'Individual Contributor (Self)',
                color: 'bg-green-100 dark:bg-green-900/30 border-green-300',
                depth: 'Summary',
                sections: ['Overall Score', 'Category Averages', 'Self vs Others Comparison', 'Development Suggestions'],
                comments: 'Anonymized',
                aiInsights: true,
                desc: 'Personal reflection view for the feedback subject'
              },
              {
                audience: 'HR',
                color: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300',
                depth: 'Comprehensive',
                sections: ['All Sections', 'Response Rates', 'Anomaly Detection', 'Audit Trail'],
                comments: 'Full (with policy)',
                aiInsights: true,
                desc: 'Complete data access for governance and investigations'
              }
            ].map((template) => (
              <div key={template.audience} className={`p-4 rounded-lg border ${template.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{template.audience}</span>
                    <Badge variant="secondary">{template.depth}</Badge>
                  </div>
                  {template.aiInsights && <Badge variant="outline">AI Insights</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{template.desc}</p>
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium">Sections:</span>
                    <ul className="mt-1 space-y-0.5 text-muted-foreground">
                      {template.sections.map((s, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-medium">Comments:</span>
                    <span className="text-muted-foreground ml-1">{template.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Report Sections (9 Sections)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Exec</TableHead>
                  <TableHead className="text-center">Mgr</TableHead>
                  <TableHead className="text-center">Self</TableHead>
                  <TableHead className="text-center">HR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {[
                  { section: 'Executive Summary', desc: 'High-level overview with key metrics', exec: true, mgr: true, self: true, hr: true },
                  { section: 'Score Breakdown', desc: 'Overall and category-level scores', exec: true, mgr: true, self: true, hr: true },
                  { section: 'Category Analysis', desc: 'Detailed per-category with rater type breakdown', exec: false, mgr: true, self: false, hr: true },
                  { section: 'Question-Level Details', desc: 'Individual question scores and responses', exec: false, mgr: true, self: false, hr: true },
                  { section: 'Verbatim Comments', desc: 'Open-text feedback (anonymized)', exec: false, mgr: true, self: true, hr: true },
                  { section: 'Anonymized Themes', desc: 'AI-detected themes from comments', exec: true, mgr: true, self: true, hr: true },
                  { section: 'Comparison to Norms', desc: 'Benchmarks vs. company/industry averages', exec: true, mgr: true, self: false, hr: true },
                  { section: 'Development Suggestions', desc: 'AI-generated development recommendations', exec: false, mgr: true, self: true, hr: true },
                  { section: 'AI Insights', desc: 'AI-powered analysis and predictions', exec: true, mgr: true, self: true, hr: true },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{row.section}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{row.desc}</TableCell>
                    <TableCell className="text-center">
                      {row.exec ? <Eye className="h-4 w-4 mx-auto text-green-500" /> : <EyeOff className="h-4 w-4 mx-auto text-muted-foreground/30" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.mgr ? <Eye className="h-4 w-4 mx-auto text-green-500" /> : <EyeOff className="h-4 w-4 mx-auto text-muted-foreground/30" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.self ? <Eye className="h-4 w-4 mx-auto text-green-500" /> : <EyeOff className="h-4 w-4 mx-auto text-muted-foreground/30" />}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.hr ? <Eye className="h-4 w-4 mx-auto text-green-500" /> : <EyeOff className="h-4 w-4 mx-auto text-muted-foreground/30" />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step-by-Step: Create a Report Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, action: 'Navigate to Performance → Setup → 360 Feedback → Report Templates', result: 'Template list view' },
              { step: 2, action: 'Click "Add Template"', result: 'Opens template editor' },
              { step: 3, action: 'Enter name and description', result: 'e.g., "Manager Detailed Report"' },
              { step: 4, action: 'Select audience type', result: 'executive, manager, individual_contributor, hr' },
              { step: 5, action: 'Set content depth level', result: 'Controls overall detail level' },
              { step: 6, action: 'Configure anonymity level', result: 'strict, standard, or relaxed' },
              { step: 7, action: 'Enable/disable individual sections', result: 'Toggle each section on/off' },
              { step: 8, action: 'Configure comment visibility', result: 'Full, anonymized, or themed only' },
              { step: 9, action: 'Enable AI insights if desired', result: 'Adds AI-generated analysis section' },
              { step: 10, action: 'Save and optionally set as default', result: 'Template available for use' },
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

      {/* Content Depth Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content Depth Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { level: 'high_level', label: 'High-Level', desc: 'Summary metrics and overall score only', pages: '1-2' },
              { level: 'summary', label: 'Summary', desc: 'Category averages and key themes', pages: '3-5' },
              { level: 'detailed', label: 'Detailed', desc: 'Question-level data with comments', pages: '6-10' },
              { level: 'comprehensive', label: 'Comprehensive', desc: 'Full data including audit trail', pages: '10+' },
            ].map((item) => (
              <div key={item.level} className="p-4 rounded-lg border text-center">
                <Badge variant="outline" className="mb-2">{item.level}</Badge>
                <h4 className="font-semibold text-sm mb-1">{item.label}</h4>
                <p className="text-xs text-muted-foreground mb-2">{item.desc}</p>
                <Badge variant="secondary" className="text-xs">{item.pages} pages</Badge>
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
              <span>Create separate templates for each audience—don't reuse manager template for employees</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Set one template as default per audience type for consistent experience</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Enable AI insights—they provide significant value with minimal privacy risk</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>For first-time 360 implementations, start with summary depth and expand over cycles</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Include coaching prompts in manager template to guide development conversations</span>
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
                issue: 'Template not appearing in cycle configuration',
                cause: 'Template is_active = false or audience_type mismatch',
                solution: 'Verify is_active and ensure template matches intended audience'
              },
              {
                issue: 'Comments showing when should be hidden',
                cause: 'show_verbatim_comments enabled or anonymity_level too relaxed',
                solution: 'Disable verbatim comments or set anonymity_level to "strict"'
              },
              {
                issue: 'AI insights section empty',
                cause: 'Insufficient responses for AI processing',
                solution: 'AI requires minimum 5 responses; wait for more data'
              },
              {
                issue: 'Report PDF generation failing',
                cause: 'Template configuration invalid or missing required sections',
                solution: 'Ensure at least Executive Summary section is enabled'
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
