import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Info, History, GitBranch, FileText, Shield } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function OrgChangesReporting() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Org Changes Reporting provides a complete audit trail of organizational structure 
          modifications. Track department restructures, reporting line changes, and position 
          movements for compliance and governance requirements.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Tracked Change Types</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Change Type</TableHead>
              <TableHead>Details Captured</TableHead>
              <TableHead>Audit Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" />
                Department Changes
              </TableCell>
              <TableCell>Creation, rename, merge, split, deactivation</TableCell>
              <TableCell><Badge>Full History</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Reporting Line Changes</TableCell>
              <TableCell>Manager reassignments, hierarchy modifications</TableCell>
              <TableCell><Badge>Full History</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Position Movements</TableCell>
              <TableCell>Transfers between departments, location changes</TableCell>
              <TableCell><Badge>Full History</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Cost Center Assignments</TableCell>
              <TableCell>Budget reallocations, cost center transfers</TableCell>
              <TableCell><Badge variant="outline">Summary</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Legal Entity Changes</TableCell>
              <TableCell>Cross-entity transfers, new entity assignments</TableCell>
              <TableCell><Badge variant="destructive">Critical</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.2.1: Org Changes timeline showing historical structure modifications"
        alt="Timeline view of organizational changes with before/after comparison"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Report Types</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              Historical Snapshot
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              View organizational structure as it existed at any point in time.
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Point-in-time org chart</li>
              <li>• Headcount at date</li>
              <li>• Manager hierarchy at date</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Change Log Report
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              Detailed log of all changes within a date range.
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Change timestamp</li>
              <li>• Changed by (user)</li>
              <li>• Before/after values</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Compliance Features</h3>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              Audit Trail Requirements
            </h4>
            <p className="text-sm text-muted-foreground">
              All org structure changes are immutably logged with:
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">User ID</Badge>
              <Badge variant="outline">Timestamp (UTC)</Badge>
              <Badge variant="outline">IP Address</Badge>
              <Badge variant="outline">Session ID</Badge>
              <Badge variant="outline">Change Reason</Badge>
            </div>
          </div>
        </div>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.2.2: Audit trail report with change details and user attribution"
        alt="Audit log showing timestamped changes with user, reason, and before/after values"
      />

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertTitle>Regulatory Compliance</AlertTitle>
        <AlertDescription>
          Org change logs support SOX compliance, GDPR data lineage requirements, 
          and internal audit needs. Logs are retained according to company retention policies.
        </AlertDescription>
      </Alert>
    </div>
  );
}
