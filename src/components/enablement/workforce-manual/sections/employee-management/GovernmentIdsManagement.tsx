import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, IdCard } from 'lucide-react';

export function GovernmentIdsManagement() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Government ID management tracks employee identification documents with expiry monitoring 
          and compliance alerts. Country-specific ID types are configurable per territory.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Common ID Types</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Type</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Expiry Tracking</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">National ID Card</TableCell>
              <TableCell>Global</TableCell>
              <TableCell><Badge variant="outline">Optional</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Passport</TableCell>
              <TableCell>Global</TableCell>
              <TableCell><Badge>Required</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Cédula</TableCell>
              <TableCell>Caribbean/LATAM</TableCell>
              <TableCell><Badge variant="outline">Optional</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Driver's License</TableCell>
              <TableCell>Global</TableCell>
              <TableCell><Badge>Required</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">SSN/TRN</TableCell>
              <TableCell>US/Jamaica</TableCell>
              <TableCell><Badge variant="outline">None</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <Alert className="border-amber-500/20 bg-amber-50 dark:bg-amber-900/10">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertTitle>Expiry Alerts</AlertTitle>
        <AlertDescription>
          Configure expiry alerts in HR Hub → Compliance Tracker. Default alerts trigger 
          at 90, 60, and 30 days before expiration.
        </AlertDescription>
      </Alert>
    </div>
  );
}
