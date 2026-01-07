import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle2, Clock } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function BackgroundChecks() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Background checks verify employee information, criminal history, and credentials 
          as part of pre-employment screening and ongoing compliance requirements.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Check Types</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Check Type</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Frequency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Criminal Record</TableCell>
              <TableCell>National/local criminal history</TableCell>
              <TableCell><Badge>Pre-hire</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Employment Verification</TableCell>
              <TableCell>Prior employer confirmation</TableCell>
              <TableCell><Badge>Pre-hire</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Education Verification</TableCell>
              <TableCell>Degree/credential confirmation</TableCell>
              <TableCell><Badge>Pre-hire</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Credit Check</TableCell>
              <TableCell>Financial responsibility (finance roles)</TableCell>
              <TableCell><Badge variant="outline">Role-specific</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.21: Background Checks status and results"
        alt="Background check dashboard showing check types and verification status"
      />

      <Alert className="border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4" />
        <AlertTitle>Compliance Note</AlertTitle>
        <AlertDescription>
          Background check requirements vary by jurisdiction. Configure country-specific 
          check requirements in Admin → Compliance → Background Screening.
        </AlertDescription>
      </Alert>
    </div>
  );
}
