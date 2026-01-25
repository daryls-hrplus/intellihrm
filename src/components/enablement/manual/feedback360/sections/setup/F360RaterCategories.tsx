import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Target, CheckCircle2, AlertTriangle, Lightbulb, Settings, Database, ArrowRight } from 'lucide-react';

export function F360RaterCategories() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">2.2 Rater Categories Configuration</h3>
        <p className="text-muted-foreground">
          Rater categories define the relationship types between feedback providers and subjects.
          Each category has configurable weights, anonymity rules, and participation requirements.
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
            <li>• Configure the five standard rater categories with appropriate weights</li>
            <li>• Set anonymity thresholds to protect rater identity</li>
            <li>• Enable external rater support for customer/vendor feedback</li>
            <li>• Understand bypass conditions for manager feedback</li>
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
              Performance → Setup → 360 Feedback → Rater Categories
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Database Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5" />
            Database Table: feedback_360_rater_categories
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
                  <TableHead className="w-[120px]">Default</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {[
                  { field: 'code', required: true, type: 'Text', desc: 'Unique identifier (e.g., "MANAGER", "PEER")', default: '-' },
                  { field: 'name', required: true, type: 'Text', desc: 'Display name shown in UI', default: '-' },
                  { field: 'description', required: false, type: 'Text', desc: 'Purpose explanation for administrators', default: 'null' },
                  { field: 'weight_percentage', required: true, type: 'Number', desc: 'Contribution to overall score (0-100)', default: '20' },
                  { field: 'min_raters', required: true, type: 'Number', desc: 'Minimum required raters for valid score', default: '1' },
                  { field: 'max_raters', required: false, type: 'Number', desc: 'Maximum allowed raters (null = unlimited)', default: 'null' },
                  { field: 'is_required', required: true, type: 'Boolean', desc: 'Category must have responses for completion', default: 'false' },
                  { field: 'is_anonymous', required: true, type: 'Boolean', desc: 'Responses are anonymized in reports', default: 'true' },
                  { field: 'anonymity_threshold', required: false, type: 'Number', desc: 'Min responses before anonymity applies', default: '3' },
                  { field: 'bypass_threshold_check', required: false, type: 'Boolean', desc: 'Ignore threshold (e.g., single manager)', default: 'false' },
                  { field: 'is_external', required: false, type: 'Boolean', desc: 'Allows non-employee raters', default: 'false' },
                  { field: 'external_consent_required', required: false, type: 'Boolean', desc: 'Require consent from external raters', default: 'true' },
                  { field: 'invitation_template_id', required: false, type: 'UUID', desc: 'Email template for external invitations', default: 'null' },
                  { field: 'reminder_template_id', required: false, type: 'UUID', desc: 'Reminder template for external raters', default: 'null' },
                  { field: 'display_order', required: true, type: 'Number', desc: 'Sort order in UI and reports', default: '0' },
                  { field: 'exclude_from_average', required: false, type: 'Boolean', desc: 'Exclude from weighted average (e.g., self)', default: 'false' },
                  { field: 'is_active', required: true, type: 'Boolean', desc: 'Available for use in cycles', default: 'true' },
                  { field: 'company_id', required: true, type: 'UUID', desc: 'Organization scope', default: 'Current company' },
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
                    <TableCell className="font-mono text-xs text-muted-foreground">{row.default}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Standard Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Standard Rater Categories (5 Types)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {[
              {
                code: 'MANAGER',
                name: 'Manager',
                weight: '25-35%',
                anonymous: 'No',
                threshold: 'N/A (bypass)',
                minRaters: '1',
                notes: 'Direct supervisor evaluation. Typically not anonymous since there\'s only one manager. Weight reflects importance of supervisor perspective.',
                color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
              },
              {
                code: 'PEER',
                name: 'Peer',
                weight: '25-35%',
                anonymous: 'Yes',
                threshold: '3',
                minRaters: '2-5',
                notes: 'Colleagues at same level. Anonymity protected by threshold. Subject may nominate peers with manager approval.',
                color: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800'
              },
              {
                code: 'DIRECT_REPORT',
                name: 'Direct Report',
                weight: '15-25%',
                anonymous: 'Yes',
                threshold: '3',
                minRaters: '2-5',
                notes: 'Team members who report to the subject. Critical for leadership assessment. Anonymity essential for honest feedback.',
                color: 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800'
              },
              {
                code: 'SELF',
                name: 'Self',
                weight: '10-20%',
                anonymous: 'No',
                threshold: 'N/A',
                minRaters: '1',
                notes: 'Subject\'s self-assessment. Often excluded from weighted average but shown for comparison. Identifies self-awareness gaps.',
                color: 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
              },
              {
                code: 'EXTERNAL',
                name: 'External/Customer',
                weight: '0-15%',
                anonymous: 'Yes',
                threshold: '3',
                minRaters: '0-3',
                notes: 'Non-employees (customers, vendors, board members). Requires consent collection. Access via secure token.',
                color: 'bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800'
              }
            ].map((cat) => (
              <div key={cat.code} className={`p-4 rounded-lg border ${cat.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">{cat.code}</Badge>
                    <span className="font-semibold">{cat.name}</span>
                  </div>
                  <Badge variant="secondary">Weight: {cat.weight}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-2">
                  <div><span className="text-muted-foreground">Anonymous:</span> {cat.anonymous}</div>
                  <div><span className="text-muted-foreground">Threshold:</span> {cat.threshold}</div>
                  <div><span className="text-muted-foreground">Min Raters:</span> {cat.minRaters}</div>
                </div>
                <p className="text-sm text-muted-foreground">{cat.notes}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step-by-Step: Configure a Rater Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, action: 'Navigate to Performance → Setup → 360 Feedback → Rater Categories', result: 'Displays list of existing categories' },
              { step: 2, action: 'Click "Add Rater Category" button', result: 'Opens category configuration form' },
              { step: 3, action: 'Enter unique code (uppercase, no spaces)', result: 'e.g., "PEER" or "SKIP_LEVEL_MGR"' },
              { step: 4, action: 'Enter display name and description', result: 'Name appears in UI; description for admin reference' },
              { step: 5, action: 'Set weight percentage (0-100)', result: 'Contribution to overall 360 score' },
              { step: 6, action: 'Configure minimum/maximum rater counts', result: 'Enforced during rater assignment' },
              { step: 7, action: 'Set anonymity options: threshold, bypass flag', result: 'Controls response visibility' },
              { step: 8, action: '(Optional) Enable external rater support', result: 'Shows consent and invitation options' },
              { step: 9, action: 'Set display order for UI positioning', result: 'Lower numbers appear first' },
              { step: 10, action: 'Save and activate the category', result: 'Available for use in cycles' },
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

      {/* Weight Distribution Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration Examples: Weight Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Example 1: Balanced Multi-Rater (Recommended)</h4>
              <div className="grid grid-cols-5 gap-2 text-center text-sm">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">Manager<br/>25%</div>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded">Peer<br/>30%</div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded">Direct Report<br/>25%</div>
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded">Self<br/>10%*</div>
                <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded">External<br/>10%</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">*Self may be excluded from weighted average for comparison only</p>
            </div>

            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Example 2: Manager-Heavy (Traditional)</h4>
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">Manager<br/>40%</div>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded">Peer<br/>30%</div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded">Direct Report<br/>20%</div>
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded">Self<br/>10%</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Best for hierarchical organizations</p>
            </div>

            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Example 3: Peer-Focused (Collaborative Culture)</h4>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">Manager<br/>20%</div>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded">Peer<br/>50%</div>
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded">Self<br/>30%</div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Best for flat organizations with collaborative culture</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Business Rules & Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { rule: 'Total weight across active categories should equal 100%', level: 'Advisory', enforcement: 'Warning shown but not blocked' },
              { rule: 'Manager category typically bypasses anonymity threshold', level: 'Policy', enforcement: 'System default, configurable' },
              { rule: 'Self-rating may be excluded from weighted average', level: 'Policy', enforcement: 'exclude_from_average flag' },
              { rule: 'External categories require consent template configuration', level: 'System', enforcement: 'Blocks external invitations if missing' },
              { rule: 'Anonymity threshold minimum is 2 (cannot be 1)', level: 'System', enforcement: 'Validation error on save' },
              { rule: 'Code must be unique within company', level: 'System', enforcement: 'Database constraint' },
              { rule: 'Max raters must be >= min raters when specified', level: 'System', enforcement: 'Validation error on save' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                <Badge variant={
                  item.level === 'System' ? 'destructive' :
                  item.level === 'Policy' ? 'default' : 'secondary'
                } className="shrink-0 mt-0.5">
                  {item.level}
                </Badge>
                <div>
                  <p className="font-medium text-sm">{item.rule}</p>
                  <p className="text-xs text-muted-foreground">{item.enforcement}</p>
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
              <span>Start with standard 5 categories before adding custom ones</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Use 3 as the default anonymity threshold—balances privacy with data richness</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Consider excluding self-rating from the weighted average to encourage honest self-reflection</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>For external raters, always require consent and set reasonable access token expiration (30 days)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Document weight rationale for audit purposes (e.g., "Aligned with competency model priorities")</span>
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
                issue: 'Category not appearing in cycle configuration',
                cause: 'Category is_active flag is false or company_id mismatch',
                solution: 'Verify is_active = true and correct company scope'
              },
              {
                issue: 'Anonymity not protecting rater identity',
                cause: 'Response count below threshold or bypass_threshold_check enabled',
                solution: 'Increase min_raters or verify threshold settings'
              },
              {
                issue: 'External rater invitations failing',
                cause: 'Missing consent template or invalid email template',
                solution: 'Configure invitation_template_id and consent template'
              },
              {
                issue: 'Weights not summing to 100%',
                cause: 'Inactive categories still contributing or exclude_from_average misconfigured',
                solution: 'Review all active categories and adjust percentages'
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
