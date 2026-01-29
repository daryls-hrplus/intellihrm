import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Upload, Download, CheckCircle2, AlertTriangle } from 'lucide-react';

export function LndComplianceBulkAssignments() {
  return (
    <section id="sec-5-4" data-manual-anchor="sec-5-4" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-500/10">
          <Users className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">5.4 Bulk Assignment Operations</h2>
          <p className="text-muted-foreground">Mass assignment, import/export, and batch processing</p>
        </div>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Execute bulk compliance training assignments for large employee populations</li>
            <li>Import assignment data from external systems via CSV/Excel</li>
            <li>Export compliance status reports for external processing</li>
            <li>Manage batch assignment errors and rollback procedures</li>
          </ul>
        </CardContent>
      </Card>

      {/* Bulk Assignment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bulk Assignment Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Use Case</TableHead>
                <TableHead>Max Records</TableHead>
                <TableHead>Processing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Rule-Based Auto-Assignment</TableCell>
                <TableCell>Ongoing compliance rules targeting criteria</TableCell>
                <TableCell>Unlimited</TableCell>
                <TableCell>Scheduled (daily)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Manual Bulk Selection</TableCell>
                <TableCell>Ad-hoc assignment to selected employees</TableCell>
                <TableCell>500 per batch</TableCell>
                <TableCell>Immediate</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">CSV Import</TableCell>
                <TableCell>External system migration, historical data</TableCell>
                <TableCell>10,000 per file</TableCell>
                <TableCell>Background job</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Department/Location Assign</TableCell>
                <TableCell>Assign to all employees in org unit</TableCell>
                <TableCell>Per org unit size</TableCell>
                <TableCell>Immediate</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Manual Bulk Assignment Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Manual Bulk Assignment Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{`Navigation: Training → Compliance → Bulk Assign

Step 1: Select Compliance Rule
├── Choose from active compliance_training rules
├── Or select specific lms_courses for ad-hoc assignment
└── View rule details (frequency, target criteria, linked course)

Step 2: Define Target Population
├── Option A: Use rule criteria (auto-populated)
├── Option B: Manual employee selection (checkbox grid)
├── Option C: Filter by department, location, position
├── Option D: Upload employee ID list (CSV)
└── Preview: "This action will create X assignments"

Step 3: Configure Assignment Details
├── due_date:           Fixed date or calculated from rule
├── priority:           normal | high | urgent
├── notification_mode:  immediate | batch_daily | none
├── exemption_allowed:  true | false
└── notes:              Optional assignment notes

Step 4: Validation
├── Check for existing active assignments (skip duplicates)
├── Validate employee eligibility (active status, target match)
├── Estimate processing time based on volume
└── Display validation summary with warnings

Step 5: Execute & Confirm
├── Submit bulk assignment request
├── Background job processes assignments
├── Real-time progress indicator
├── Completion notification with summary report
└── Audit log entry for bulk operation`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* CSV Import Format */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            CSV Import Format
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Import compliance assignments from external systems using the standardized CSV format.
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">employee_id</TableCell>
                <TableCell><Badge variant="destructive">Required</Badge></TableCell>
                <TableCell>UUID or employee_number</TableCell>
                <TableCell>Employee identifier</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">compliance_rule_code</TableCell>
                <TableCell><Badge variant="destructive">Required</Badge></TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>Compliance rule code or course code</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">due_date</TableCell>
                <TableCell><Badge variant="secondary">Optional</Badge></TableCell>
                <TableCell>YYYY-MM-DD</TableCell>
                <TableCell>Assignment due date (default: rule setting)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">status</TableCell>
                <TableCell><Badge variant="secondary">Optional</Badge></TableCell>
                <TableCell>pending | completed</TableCell>
                <TableCell>Initial status (default: pending)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">completed_at</TableCell>
                <TableCell><Badge variant="secondary">Optional</Badge></TableCell>
                <TableCell>YYYY-MM-DD HH:MM</TableCell>
                <TableCell>Completion timestamp (if importing history)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">exemption_reason</TableCell>
                <TableCell><Badge variant="secondary">Optional</Badge></TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>Exemption justification (sets status: exempted)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">notes</TableCell>
                <TableCell><Badge variant="secondary">Optional</Badge></TableCell>
                <TableCell>TEXT</TableCell>
                <TableCell>Assignment notes</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="bg-muted/50 p-4 rounded-lg font-mono text-xs">
            <p className="text-sm font-semibold mb-2">Example CSV:</p>
            <pre>{`employee_id,compliance_rule_code,due_date,status,completed_at,notes
EMP001,ANTI-HARASSMENT-2026,2026-03-31,pending,,New hire assignment
EMP002,ANTI-HARASSMENT-2026,2026-03-31,completed,2026-02-15 10:30,Completed early
EMP003,OSHA-10,2026-06-30,pending,,Annual recertification`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Export Type</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Contents</TableHead>
                <TableHead>Use Case</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Assignment Status Report</TableCell>
                <TableCell>CSV, Excel</TableCell>
                <TableCell>All assignments with status, due dates, completion</TableCell>
                <TableCell>Compliance audit, regulatory reporting</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Overdue Report</TableCell>
                <TableCell>CSV, Excel, PDF</TableCell>
                <TableCell>Only overdue assignments with escalation status</TableCell>
                <TableCell>Manager review, HR action</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Completion Certificates</TableCell>
                <TableCell>PDF (batch)</TableCell>
                <TableCell>Individual certificates for completed training</TableCell>
                <TableCell>Employee records, external audit</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Audit Trail Export</TableCell>
                <TableCell>CSV, JSON</TableCell>
                <TableCell>All assignment actions with timestamps</TableCell>
                <TableCell>Legal hold, investigation</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Error Handling */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Error Handling & Rollback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Error Type</TableHead>
                <TableHead>Cause</TableHead>
                <TableHead>System Behavior</TableHead>
                <TableHead>Resolution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Duplicate Assignment</TableCell>
                <TableCell>Employee already has active assignment</TableCell>
                <TableCell>Skip record, continue batch</TableCell>
                <TableCell>Review existing assignment</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Invalid Employee</TableCell>
                <TableCell>Employee ID not found or inactive</TableCell>
                <TableCell>Skip record, log error</TableCell>
                <TableCell>Verify employee status</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Invalid Rule Code</TableCell>
                <TableCell>Compliance rule not found</TableCell>
                <TableCell>Skip record, log error</TableCell>
                <TableCell>Check rule configuration</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Date Format Error</TableCell>
                <TableCell>Invalid date in import file</TableCell>
                <TableCell>Skip record, log error</TableCell>
                <TableCell>Fix CSV formatting</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Batch Timeout</TableCell>
                <TableCell>Processing exceeded time limit</TableCell>
                <TableCell>Partial completion, resume option</TableCell>
                <TableCell>Split into smaller batches</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-amber-600 mb-2">Rollback Procedure</h4>
            <p className="text-sm">
              Bulk assignments can be rolled back within 24 hours if errors are discovered. 
              Navigate to <strong>Training → Compliance → Bulk Operations → History</strong>, 
              select the batch, and click <strong>Rollback</strong>. This removes all assignments 
              created in that batch and logs the rollback action.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bulk Assignment Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mode</TableHead>
                <TableHead>Behavior</TableHead>
                <TableHead>Use Case</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Immediate</TableCell>
                <TableCell>Send notification per assignment as created</TableCell>
                <TableCell>Small batches, urgent training</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Batch Daily</TableCell>
                <TableCell>Aggregate all assignments into daily digest</TableCell>
                <TableCell>Large batches, avoid notification overload</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">None</TableCell>
                <TableCell>No notification sent (silent assignment)</TableCell>
                <TableCell>Historical data import, system migration</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <p className="text-sm text-muted-foreground">
            Event type: <code className="bg-muted px-1 rounded">COMPLIANCE_TRAINING_ASSIGNED</code><br/>
            Template placeholders: <code className="bg-muted px-1 rounded">{'{course_name}'}</code>, 
            <code className="bg-muted px-1 rounded">{'{due_date}'}</code>, 
            <code className="bg-muted px-1 rounded">{'{employee_name}'}</code>
          </p>
        </CardContent>
      </Card>

      {/* Industry Benchmark */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Bulk Operations Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">500</div>
              <div className="text-sm text-muted-foreground">Max manual batch size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">10,000</div>
              <div className="text-sm text-muted-foreground">Max CSV import size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">&lt; 5 min</div>
              <div className="text-sm text-muted-foreground">Processing for 1000 records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24 hrs</div>
              <div className="text-sm text-muted-foreground">Rollback window</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
