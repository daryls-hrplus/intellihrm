import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function AssignmentTypes() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Assignment types define the nature of employment relationships. Configure these types 
          to align with labor law requirements and organizational policies.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Standard Assignment Types</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Benefits Eligible</TableHead>
              <TableHead>End Date Required</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><Badge className="bg-green-500">Permanent</Badge></TableCell>
              <TableCell>Full-time indefinite employment</TableCell>
              <TableCell>Yes</TableCell>
              <TableCell>No</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge className="bg-blue-500">Contract</Badge></TableCell>
              <TableCell>Fixed-term employment agreement</TableCell>
              <TableCell>Configurable</TableCell>
              <TableCell>Yes</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge className="bg-amber-500">Temporary</Badge></TableCell>
              <TableCell>Short-term assignment (agency/seasonal)</TableCell>
              <TableCell>Usually No</TableCell>
              <TableCell>Yes</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge className="bg-purple-500">Secondment</Badge></TableCell>
              <TableCell>Loaned to another department/entity</TableCell>
              <TableCell>Per agreement</TableCell>
              <TableCell>Yes</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.25: Assignment Types configuration"
        alt="Assignment type settings showing permanent, contract, and temporary options"
      />
    </div>
  );
}
