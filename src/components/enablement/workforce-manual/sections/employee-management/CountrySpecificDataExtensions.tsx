import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Info, Globe } from 'lucide-react';

export function CountrySpecificDataExtensions() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Country-specific data extensions capture regional compliance requirements, 
          local payroll data, and jurisdiction-specific employee information.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Supported Regions</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country/Region</TableHead>
              <TableHead>Data Extensions</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Mexico (MX)</TableCell>
              <TableCell>RFC, CURP, IMSS, INFONAVIT, tax regime</TableCell>
              <TableCell><Badge className="bg-green-500">Active</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Jamaica (JM)</TableCell>
              <TableCell>TRN, NIS, statutory deductions</TableCell>
              <TableCell><Badge className="bg-green-500">Active</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Dominican Republic (DO)</TableCell>
              <TableCell>Cédula, TSS, AFP, ARS</TableCell>
              <TableCell><Badge className="bg-green-500">Active</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Ghana (GH)</TableCell>
              <TableCell>SSNIT, GRA TIN, NHIS</TableCell>
              <TableCell><Badge variant="outline">Planned</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Nigeria (NG)</TableCell>
              <TableCell>NIN, NSITF, Pension PIN</TableCell>
              <TableCell><Badge variant="outline">Planned</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertTitle>Automatic Tab Display</AlertTitle>
        <AlertDescription>
          Country-specific tabs appear automatically based on the employee's 
          primary position company location. Configure in Admin → Regional Settings.
        </AlertDescription>
      </Alert>
    </div>
  );
}
