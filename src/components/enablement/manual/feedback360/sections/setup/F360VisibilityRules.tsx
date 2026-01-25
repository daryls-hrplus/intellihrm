import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, EyeOff, Target, CheckCircle2, AlertTriangle, Lightbulb, Settings, Shield, Lock, Clock } from 'lucide-react';

export function F360VisibilityRules() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">2.7 Anonymity & Visibility Rules</h3>
        <p className="text-muted-foreground">
          Visibility rules control who can see what data in 360 feedback results. This includes 
          anonymity protection, access levels, and release timing configurations.
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
            <li>• Configure role-based access levels (Employee, Manager, HR)</li>
            <li>• Set anonymity thresholds and bypass conditions</li>
            <li>• Configure release timing and approval workflows</li>
            <li>• Understand investigation mode access policies</li>
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
              Performance → Setup → 360 Feedback → Visibility Rules
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Critical Warning */}
      <Card className="border-red-300 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg text-red-700 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Critical Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            <strong>Minimum 3 raters per category required for anonymity protection.</strong> If fewer than 3 
            responses exist for a category, the system will either aggregate with other categories or 
            suppress the data entirely—depending on configuration.
          </p>
        </CardContent>
      </Card>

      {/* Access Level Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            Role-Based Access Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Data Element</TableHead>
                  <TableHead className="text-center">Employee (Subject)</TableHead>
                  <TableHead className="text-center">Manager</TableHead>
                  <TableHead className="text-center">HR Admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {[
                  { element: 'Overall Score', employee: 'Yes', manager: 'Yes', hr: 'Yes' },
                  { element: 'Category Scores', employee: 'Aggregate', manager: 'By Rater Type', hr: 'Full Breakdown' },
                  { element: 'Question-Level Scores', employee: 'No', manager: 'Yes', hr: 'Yes' },
                  { element: 'Verbatim Comments', employee: 'Anonymized', manager: 'Anonymized', hr: 'Full (policy)' },
                  { element: 'Rater Identity', employee: 'Never', manager: 'Manager only', hr: 'Investigation only' },
                  { element: 'Self vs Others Comparison', employee: 'Yes', manager: 'Yes', hr: 'Yes' },
                  { element: 'AI Development Themes', employee: 'Yes', manager: 'Yes', hr: 'Yes' },
                  { element: 'Response Rates', employee: 'No', manager: 'Own team', hr: 'Full' },
                  { element: 'Audit Trail', employee: 'No', manager: 'No', hr: 'Yes' },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{row.element}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={row.employee === 'Yes' || row.employee === 'Aggregate' ? 'default' : row.employee === 'No' || row.employee === 'Never' ? 'secondary' : 'outline'} className="text-xs">
                        {row.employee}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={row.manager === 'Yes' || row.manager.includes('By') ? 'default' : row.manager === 'No' ? 'secondary' : 'outline'} className="text-xs">
                        {row.manager}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={row.hr === 'Yes' || row.hr === 'Full' ? 'default' : 'outline'} className="text-xs">
                        {row.hr}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Anonymity Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5" />
            Anonymity Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Anonymity Threshold</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Minimum number of responses required before showing category-specific data.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded bg-muted text-center">
                  <div className="text-2xl font-bold text-red-500">2</div>
                  <div className="text-xs text-muted-foreground">Minimum (risky)</div>
                </div>
                <div className="p-3 rounded bg-green-100 dark:bg-green-900/30 text-center border border-green-300">
                  <div className="text-2xl font-bold text-green-600">3</div>
                  <div className="text-xs text-muted-foreground">Recommended</div>
                </div>
                <div className="p-3 rounded bg-muted text-center">
                  <div className="text-2xl font-bold">5</div>
                  <div className="text-xs text-muted-foreground">Conservative</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Below-Threshold Handling</h4>
              <div className="space-y-2">
                {[
                  { option: 'Suppress Category', desc: 'Hide the category entirely from reports' },
                  { option: 'Aggregate with Others', desc: 'Combine with another category (e.g., Peer + Direct Report)' },
                  { option: 'Show with Warning', desc: 'Display with "Limited Data" warning (not recommended)' },
                ].map((item) => (
                  <div key={item.option} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">{item.option}:</span>
                      <span className="text-muted-foreground ml-1">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Bypass Conditions</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Categories where threshold does not apply:
              </p>
              <div className="space-y-2">
                {[
                  { category: 'Manager', reason: 'Only one manager per employee; identity inherently known' },
                  { category: 'Self', reason: 'Subject\'s own rating; no anonymity needed' },
                ].map((item) => (
                  <div key={item.category} className="flex items-start gap-2 text-sm p-2 rounded bg-muted">
                    <Badge variant="outline">{item.category}</Badge>
                    <span className="text-muted-foreground">{item.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Release Timing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Release Timing Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                mode: 'Automatic on Cycle Close',
                desc: 'Reports released immediately when cycle status changes to Closed',
                pros: 'Fastest turnaround',
                cons: 'No HR review before release',
                recommended: false
              },
              {
                mode: 'Automatic with Delay',
                desc: 'Reports released X days after cycle close (configurable 1-14 days)',
                pros: 'HR has review window',
                cons: 'Delayed feedback delivery',
                recommended: true
              },
              {
                mode: 'Manual Release',
                desc: 'HR must explicitly release each participant\'s report',
                pros: 'Full control and review',
                cons: 'Labor-intensive for large cycles',
                recommended: false
              }
            ].map((item) => (
              <div key={item.mode} className={`p-4 rounded-lg border ${item.recommended ? 'border-green-300 bg-green-50/50 dark:bg-green-900/20' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-sm">{item.mode}</h4>
                  {item.recommended && <Badge variant="default" className="text-xs">Recommended</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{item.desc}</p>
                <div className="text-xs">
                  <div className="text-green-600">+ {item.pros}</div>
                  <div className="text-amber-600">- {item.cons}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Investigation Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-amber-500" />
            Investigation Mode Access Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Investigation mode allows authorized users to view non-anonymized data for specific 
            compliance or HR investigations. All access is logged and requires formal approval.
          </p>
          
          <div className="space-y-3">
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold text-sm mb-2">Access Policy Options</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { policy: 'Never', desc: 'Investigation access disabled entirely' },
                  { policy: 'With Approval', desc: 'Requires formal request and approval workflow' },
                  { policy: 'HR Admin Only', desc: 'Direct access for designated HR Admins' },
                  { policy: 'With Legal Hold', desc: 'Only during active legal/compliance cases' },
                ].map((item) => (
                  <div key={item.policy} className="flex items-start gap-2 text-sm p-2 rounded bg-muted">
                    <Badge variant="outline">{item.policy}</Badge>
                    <span className="text-muted-foreground text-xs">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg border border-amber-300 bg-amber-50/50 dark:bg-amber-900/20">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Audit Requirements
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• All investigation access logged with timestamp and user</li>
                <li>• Reason for access must be documented</li>
                <li>• Audit logs retained for 7 years (configurable)</li>
                <li>• Subject notified of access (optional, per policy)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step-by-Step: Configure Visibility Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, action: 'Navigate to Performance → Setup → 360 Feedback → Visibility Rules', result: 'Opens visibility configuration' },
              { step: 2, action: 'Configure Employee access level', result: 'Set what subjects can see in their own reports' },
              { step: 3, action: 'Configure Manager access level', result: 'Set what managers can see for their direct reports' },
              { step: 4, action: 'Configure HR access level', result: 'Set HR Admin access including investigation mode' },
              { step: 5, action: 'Set anonymity threshold (default: 3)', result: 'Minimum responses for category-specific data' },
              { step: 6, action: 'Configure below-threshold handling', result: 'Suppress or aggregate low-response categories' },
              { step: 7, action: 'Set release timing option', result: 'Automatic, delayed, or manual release' },
              { step: 8, action: 'Configure investigation mode policy', result: 'Set access rules and approval workflow' },
              { step: 9, action: 'Save configuration', result: 'Rules applied to all cycles using default settings' },
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
              <span>Use 3 as the default anonymity threshold—balances privacy with data richness</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Enable "Automatic with Delay" release (3-5 days) to allow HR review</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Require approval for investigation mode—document all access reasons</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Suppress rather than aggregate low-response categories for maximum privacy</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Communicate visibility rules clearly to all participants before cycle launch</span>
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
                issue: 'Category data showing when should be suppressed',
                cause: 'Anonymity threshold set too low or bypass enabled',
                solution: 'Verify threshold setting and check bypass flags per category'
              },
              {
                issue: 'Reports not releasing automatically',
                cause: 'Release timing set to Manual or delay period not elapsed',
                solution: 'Check release timing configuration; manually release if needed'
              },
              {
                issue: 'Investigation access request not working',
                cause: 'Investigation mode policy set to "Never"',
                solution: 'Change policy to "With Approval" and configure approvers'
              },
              {
                issue: 'Manager cannot see direct report results',
                cause: 'Manager access level too restrictive or report not released',
                solution: 'Check manager access configuration and release status'
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
