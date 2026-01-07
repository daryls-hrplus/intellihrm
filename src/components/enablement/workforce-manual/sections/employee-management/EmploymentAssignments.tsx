import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Info, Briefcase } from 'lucide-react';

export function EmploymentAssignments() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Employment assignments link employees to positions within the organizational structure. 
          HRplus supports primary, secondary, and acting assignments for flexible workforce modeling.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Assignment Types</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assignment</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>FTE Impact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><Badge>Primary</Badge></TableCell>
              <TableCell>Main position assignment, determines reporting line</TableCell>
              <TableCell>1.0 default</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge variant="outline">Secondary</Badge></TableCell>
              <TableCell>Additional position for dual-role employees</TableCell>
              <TableCell>Configurable split</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge variant="secondary">Acting</Badge></TableCell>
              <TableCell>Temporary assignment covering another role</TableCell>
              <TableCell>No FTE change</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertTitle>Position Control</AlertTitle>
        <AlertDescription>
          Assignments are validated against position headcount budgets. 
          Ensure positions are approved before attempting assignment.
        </AlertDescription>
      </Alert>
    </div>
  );
}
