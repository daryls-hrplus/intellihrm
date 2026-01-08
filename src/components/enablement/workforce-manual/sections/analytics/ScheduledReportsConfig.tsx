import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Info, Calendar, Mail, Clock, FileText, Users } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function ScheduledReportsConfig() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Scheduled Reports automate the delivery of workforce analytics to stakeholders. 
          Configure recurring report generation and distribution to ensure leadership 
          receives timely insights without manual effort.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Report Schedule Options</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Frequency</TableHead>
              <TableHead>Best For</TableHead>
              <TableHead>Delivery Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                <Badge className="bg-blue-500">Daily</Badge>
              </TableCell>
              <TableCell>Operational metrics, time-sensitive data</TableCell>
              <TableCell>Configurable (default: 7:00 AM local)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <Badge className="bg-green-500">Weekly</Badge>
              </TableCell>
              <TableCell>Manager dashboards, team summaries</TableCell>
              <TableCell>Monday AM (default)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <Badge className="bg-amber-500">Monthly</Badge>
              </TableCell>
              <TableCell>Executive summaries, trend analysis</TableCell>
              <TableCell>1st business day of month</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <Badge className="bg-purple-500">Quarterly</Badge>
              </TableCell>
              <TableCell>Board reports, compliance reviews</TableCell>
              <TableCell>1st week of quarter</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <Badge variant="outline">On-Demand</Badge>
              </TableCell>
              <TableCell>Ad-hoc requests, special analyses</TableCell>
              <TableCell>Immediate</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.4.1: Scheduled Reports configuration with frequency and recipient settings"
        alt="Report scheduler showing frequency options, delivery times, and recipient lists"
      />

      <section>
        <h3 className="text-lg font-semibold mb-3">Distribution Options</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Email Delivery
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Direct attachment (PDF, Excel)</li>
              <li>• Secure link with expiration</li>
              <li>• Inline summary with full report link</li>
              <li>• Distribution lists support</li>
            </ul>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              Format Options
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• PDF (formatted report)</li>
              <li>• Excel (raw data + charts)</li>
              <li>• CSV (data export)</li>
              <li>• PowerPoint (presentation)</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Creating a Scheduled Report</h3>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
            <div>
              <p className="font-medium">Select Report Template</p>
              <p className="text-sm text-muted-foreground">Choose from pre-built templates or create from saved custom report</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
            <div>
              <p className="font-medium">Configure Filters</p>
              <p className="text-sm text-muted-foreground">Set department, location, date range, and other filter criteria</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
            <div>
              <p className="font-medium">Set Schedule</p>
              <p className="text-sm text-muted-foreground">Choose frequency, delivery time, and timezone</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">4</div>
            <div>
              <p className="font-medium">Add Recipients</p>
              <p className="text-sm text-muted-foreground">Select users, roles, or distribution lists</p>
            </div>
          </li>
        </ol>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 7.4.2: Report creation wizard with template and schedule configuration"
        alt="Step-by-step report creation showing template selection, filters, and scheduling options"
      />

      <Alert className="border-border bg-muted/50">
        <Info className="h-4 w-4" />
        <AlertTitle>Data Security</AlertTitle>
        <AlertDescription>
          Scheduled reports respect role-based data access. Recipients only see data 
          they're authorized to view. Configure sensitivity levels in Admin → Reports → Security.
        </AlertDescription>
      </Alert>
    </div>
  );
}
