import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, EyeOff, Users, Key, AlertTriangle, CheckCircle, FileText, Database } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NavigationPath } from '../../NavigationPath';
import { NAVIGATION_PATHS } from '../../navigationPaths';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PERMISSION_MATRIX = [
  {
    action: 'View own appraisal',
    employee: '✓',
    manager: '✓',
    hrUser: '✓',
    admin: '✓',
    notes: 'After manager submits'
  },
  {
    action: 'Complete self-assessment',
    employee: '✓',
    manager: '—',
    hrUser: '—',
    admin: '—',
    notes: 'During self-assessment window'
  },
  {
    action: 'View direct reports appraisals',
    employee: '—',
    manager: '✓',
    hrUser: '✓',
    admin: '✓',
    notes: 'Based on org hierarchy'
  },
  {
    action: 'Complete team evaluations',
    employee: '—',
    manager: '✓',
    hrUser: '—',
    admin: '✓',
    notes: 'During evaluation window'
  },
  {
    action: 'View department appraisals',
    employee: '—',
    manager: '—',
    hrUser: '✓',
    admin: '✓',
    notes: 'Based on HR assignment'
  },
  {
    action: 'View all company appraisals',
    employee: '—',
    manager: '—',
    hrUser: '△',
    admin: '✓',
    notes: 'HR: if assigned company-wide'
  },
  {
    action: 'Create/edit appraisal cycles',
    employee: '—',
    manager: '—',
    hrUser: '—',
    admin: '✓',
    notes: 'Configuration access'
  },
  {
    action: 'Adjust scores in calibration',
    employee: '—',
    manager: '△',
    hrUser: '✓',
    admin: '✓',
    notes: 'Manager: only if calibrator'
  },
  {
    action: 'View calibration audit trail',
    employee: '—',
    manager: '—',
    hrUser: '✓',
    admin: '✓',
    notes: 'Compliance requirement'
  },
  {
    action: 'Export appraisal data',
    employee: '—',
    manager: '—',
    hrUser: '△',
    admin: '✓',
    notes: 'HR: limited to assigned scope'
  },
  {
    action: 'Configure integration rules',
    employee: '—',
    manager: '—',
    hrUser: '—',
    admin: '✓',
    notes: 'System configuration'
  },
  {
    action: 'Access AI bias reports',
    employee: '—',
    manager: '—',
    hrUser: '✓',
    admin: '✓',
    notes: 'Compliance monitoring'
  }
];

const DATA_VISIBILITY_RULES = [
  {
    dataType: 'Appraisal Scores',
    employee: 'Own only (after submit)',
    manager: 'Direct reports only',
    hrUser: 'Assigned population',
    admin: 'Company-wide',
    sensitivity: 'High'
  },
  {
    dataType: 'Manager Comments',
    employee: 'Own only (after submit)',
    manager: 'Written by self',
    hrUser: 'Assigned population',
    admin: 'Company-wide',
    sensitivity: 'High'
  },
  {
    dataType: 'Calibration Adjustments',
    employee: 'Own final score only',
    manager: 'Own team adjustments',
    hrUser: 'All in scope',
    admin: 'Company-wide',
    sensitivity: 'Critical'
  },
  {
    dataType: 'Peer Feedback (360)',
    employee: 'Aggregated only',
    manager: 'Aggregated only',
    hrUser: 'Individual responses',
    admin: 'Individual responses',
    sensitivity: 'High'
  },
  {
    dataType: 'AI Bias Alerts',
    employee: '—',
    manager: '—',
    hrUser: 'Flagged cases',
    admin: 'All alerts',
    sensitivity: 'Critical'
  },
  {
    dataType: 'Historical Trends',
    employee: 'Own trend only',
    manager: 'Team aggregates',
    hrUser: 'Department trends',
    admin: 'All trends',
    sensitivity: 'Medium'
  }
];

// Actual RLS policies from the database
const RLS_POLICIES = [
  {
    table: 'appraisal_participants',
    policy: 'Employees can view own participation',
    condition: 'auth.uid() = employee_id',
    purpose: 'Self-service access'
  },
  {
    table: 'appraisal_participants',
    policy: 'Evaluators can view and update assigned participants',
    condition: 'auth.uid() = evaluator_id',
    purpose: 'Manager evaluation access'
  },
  {
    table: 'appraisal_participants',
    policy: 'Admins and HR can manage all participants',
    condition: 'has_role(auth.uid(), \'admin\') OR has_role(auth.uid(), \'hr_manager\')',
    purpose: 'HR administration'
  },
  {
    table: 'appraisal_cycles',
    policy: 'Employees can view cycles they participate in',
    condition: 'EXISTS (SELECT 1 FROM appraisal_participants WHERE cycle_id = appraisal_cycles.id AND employee_id = auth.uid())',
    purpose: 'View assigned cycles'
  },
  {
    table: 'appraisal_cycles',
    policy: 'Managers can manage their own cycles',
    condition: 'is_manager_cycle = true AND created_by = auth.uid()',
    purpose: 'Manager-initiated probation reviews'
  },
  {
    table: 'appraisal_scores',
    policy: 'Employees can view own scores',
    condition: 'EXISTS (SELECT 1 FROM appraisal_participants ap WHERE ap.id = appraisal_scores.participant_id AND ap.employee_id = auth.uid())',
    purpose: 'Self-service score visibility'
  },
  {
    table: 'appraisal_scores',
    policy: 'Evaluators can manage scores for assigned participants',
    condition: 'EXISTS (SELECT 1 FROM appraisal_participants ap WHERE ap.id = appraisal_scores.participant_id AND ap.evaluator_id = auth.uid())',
    purpose: 'Manager scoring capability'
  },
  {
    table: 'appraisal_integration_rules',
    policy: 'Admins and HR can manage integration rules',
    condition: 'has_any_role(auth.uid(), ARRAY[\'admin\', \'hr_manager\'])',
    purpose: 'Configuration access control'
  },
  {
    table: 'appraisal_integration_log',
    policy: 'Users can view integration logs for their company',
    condition: 'company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())',
    purpose: 'Audit visibility'
  }
];

const AUDIT_LOG_EVENTS = [
  { event: 'appraisal.created', description: 'New appraisal participant added', retention: 'Per company policy' },
  { event: 'appraisal.score_updated', description: 'Score changed by manager', retention: 'Per company policy' },
  { event: 'calibration.adjustment', description: 'Score adjusted in calibration', retention: 'Per company policy' },
  { event: 'appraisal.finalized', description: 'Appraisal marked as final', retention: 'Per company policy' },
  { event: 'appraisal.acknowledged', description: 'Employee acknowledgment recorded', retention: 'Per company policy' },
  { event: 'integration.triggered', description: 'Downstream action initiated', retention: 'Per company policy' },
  { event: 'ai.analysis_run', description: 'AI feature invoked', retention: 'Per company policy' }
];

export function SecurityAccessControlSection() {
  return (
    <div className="space-y-8">
      <Card id="sec-8-3">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 8.3</Badge>
            <Badge variant="secondary">Reference</Badge>
          </div>
          <CardTitle className="text-2xl">Security & Access Control</CardTitle>
          <CardDescription>
            Permission configuration, data protection rules, and compliance controls for appraisal data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-8-3']} />

          {/* Security Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-semibold">Role-Based Access</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Permissions enforced at application and database level based on user role
              </p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-5 w-5 text-primary" />
                <span className="font-semibold">Row-Level Security</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Database policies ensure users only access data within their scope
              </p>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-semibold">Full Audit Trail</span>
              </div>
              <p className="text-sm text-muted-foreground">
                All changes logged with user, timestamp, and before/after values
              </p>
            </div>
          </div>

          <Tabs defaultValue="permissions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="visibility">Data Visibility</TabsTrigger>
              <TabsTrigger value="rls">RLS Policies</TabsTrigger>
              <TabsTrigger value="audit">Audit Trail</TabsTrigger>
            </TabsList>

            <TabsContent value="permissions" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Key className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Permission Matrix by Role</h3>
              </div>
              
              <div className="text-sm text-muted-foreground mb-4">
                <span className="font-mono">✓</span> = Full access | 
                <span className="font-mono ml-2">△</span> = Conditional access | 
                <span className="font-mono ml-2">—</span> = No access
              </div>

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Action</TableHead>
                      <TableHead className="text-center w-20">Employee</TableHead>
                      <TableHead className="text-center w-20">Manager</TableHead>
                      <TableHead className="text-center w-20">HR User</TableHead>
                      <TableHead className="text-center w-20">Admin</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PERMISSION_MATRIX.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-sm">{row.action}</TableCell>
                        <TableCell className="text-center font-mono">{row.employee}</TableCell>
                        <TableCell className="text-center font-mono">{row.manager}</TableCell>
                        <TableCell className="text-center font-mono">{row.hrUser}</TableCell>
                        <TableCell className="text-center font-mono">{row.admin}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{row.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="visibility" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Eye className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Data Visibility Rules</h3>
              </div>

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Data Type</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Manager</TableHead>
                      <TableHead>HR User</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead className="w-24">Sensitivity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {DATA_VISIBILITY_RULES.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-sm">{row.dataType}</TableCell>
                        <TableCell className="text-xs">{row.employee}</TableCell>
                        <TableCell className="text-xs">{row.manager}</TableCell>
                        <TableCell className="text-xs">{row.hrUser}</TableCell>
                        <TableCell className="text-xs">{row.admin}</TableCell>
                        <TableCell>
                          <Badge variant={row.sensitivity === 'Critical' ? 'destructive' : row.sensitivity === 'High' ? 'outline' : 'secondary'}>
                            {row.sensitivity}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="font-semibold text-amber-700 dark:text-amber-400">Important Notes</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 360 feedback is always anonymized to employees and managers</li>
                  <li>• Calibration adjustment visibility may vary by company policy</li>
                  <li>• AI bias alerts contain sensitive demographic correlations</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="rls" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Lock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Row-Level Security Policies</h3>
              </div>

              <p className="text-sm text-muted-foreground">
                The following database policies enforce data access at the row level, ensuring users cannot 
                bypass application-level controls through direct database access or API calls.
              </p>

              <div className="space-y-4">
                {RLS_POLICIES.map((policy, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-mono text-xs">{policy.table}</Badge>
                      <span className="font-medium text-sm">{policy.policy}</span>
                    </div>
                    <div className="bg-muted p-2 rounded font-mono text-xs mb-2 overflow-x-auto">
                      {policy.condition}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {policy.purpose}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4 mt-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Audit Log Configuration</h3>
              </div>

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Event Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-24">Retention</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {AUDIT_LOG_EVENTS.map((event, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-xs">{event.event}</TableCell>
                        <TableCell className="text-sm">{event.description}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{event.retention}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">Audit Log Contents</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• User ID and role at time of action</li>
                    <li>• Timestamp with timezone</li>
                    <li>• IP address and session ID</li>
                    <li>• Before and after values</li>
                    <li>• Related record identifiers</li>
                  </ul>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Export Options</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• CSV export for compliance review</li>
                    <li>• JSON export for SIEM integration</li>
                    <li>• Filtered by date range, user, event type</li>
                    <li>• Automated scheduled exports available</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Compliance Callout */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-primary" />
              Compliance Frameworks Supported
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['GDPR', 'SOC 2 Type II', 'ISO 27001', 'EEOC Guidelines'].map((framework) => (
                <div key={framework} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{framework}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
