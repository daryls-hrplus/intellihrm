import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plane } from 'lucide-react';

export function ImmigrationWorkPermits() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Immigration and work permit management tracks visa types, permit expiry, 
          and work authorization status for foreign workers.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Document Types</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Alert Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Work Permit</TableCell>
              <TableCell>Authorization to work in country</TableCell>
              <TableCell><Badge variant="destructive">Critical</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Visa</TableCell>
              <TableCell>Entry/residency authorization</TableCell>
              <TableCell><Badge variant="destructive">Critical</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Residence Permit</TableCell>
              <TableCell>Long-term residency status</TableCell>
              <TableCell><Badge>High</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Travel Document</TableCell>
              <TableCell>International travel authorization</TableCell>
              <TableCell><Badge variant="outline">Medium</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <Alert variant="destructive" className="border-destructive/20">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Compliance Critical</AlertTitle>
        <AlertDescription>
          Expired work permits result in immediate work authorization issues. 
          Configure 120-day advance alerts for immigration documents.
        </AlertDescription>
      </Alert>
    </div>
  );
}
