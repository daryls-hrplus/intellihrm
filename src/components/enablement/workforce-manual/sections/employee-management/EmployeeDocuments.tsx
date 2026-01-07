import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Info, FileText, Upload } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function EmployeeDocuments() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Employee document management provides secure storage for employment-related documents 
          with category organization, expiry tracking, and compliance document requirements.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Document Categories</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Examples</TableHead>
              <TableHead>Retention</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Identity</TableCell>
              <TableCell>ID copies, passport scans</TableCell>
              <TableCell>Employment + 7 years</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Employment</TableCell>
              <TableCell>Contracts, offer letters</TableCell>
              <TableCell>Employment + 7 years</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Education</TableCell>
              <TableCell>Degrees, transcripts, certifications</TableCell>
              <TableCell>Employment + 3 years</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Compliance</TableCell>
              <TableCell>Training certificates, policy acknowledgments</TableCell>
              <TableCell>Per regulation</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.13: Employee Documents management with categories"
        alt="Document list showing uploaded files with category tags and expiry dates"
      />

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertTitle>Document Security</AlertTitle>
        <AlertDescription>
          Documents are stored with encryption and role-based access controls. 
          Configure document visibility in Admin → Security → Document Access.
        </AlertDescription>
      </Alert>
    </div>
  );
}
