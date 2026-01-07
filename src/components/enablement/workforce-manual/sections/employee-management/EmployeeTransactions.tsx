import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, ArrowUpRight, ArrowDownRight, ArrowRight, RefreshCw } from 'lucide-react';

export function EmployeeTransactions() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Employee transactions track significant changes to employment status, position, 
          compensation, and organizational placement. All transactions maintain a complete audit trail.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Transaction Types</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Approval Required</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="font-medium">Promotion</span>
              </TableCell>
              <TableCell>Move to higher grade/level position</TableCell>
              <TableCell><Badge>Yes</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Transfer</span>
              </TableCell>
              <TableCell>Move to different department/location</TableCell>
              <TableCell><Badge>Yes</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Demotion</span>
              </TableCell>
              <TableCell>Move to lower grade/level position</TableCell>
              <TableCell><Badge variant="destructive">Yes</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Grade Change</span>
              </TableCell>
              <TableCell>Salary grade adjustment within same position</TableCell>
              <TableCell><Badge>Yes</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertTitle>Effective Dating</AlertTitle>
        <AlertDescription>
          All transactions support future-dated changes. Schedule changes in advance 
          for seamless payroll and benefits transitions.
        </AlertDescription>
      </Alert>
    </div>
  );
}
