import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Info, Globe } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function EmployeeLanguages() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Language proficiency tracking captures reading, writing, and speaking abilities 
          for multi-language workforce support and assignment matching.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Proficiency Levels</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Level</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>CEFR Equivalent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell><Badge className="bg-green-500">Native</Badge></TableCell>
              <TableCell>First language / mother tongue</TableCell>
              <TableCell>C2</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge className="bg-blue-500">Fluent</Badge></TableCell>
              <TableCell>Near-native proficiency</TableCell>
              <TableCell>C1</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge className="bg-amber-500">Proficient</Badge></TableCell>
              <TableCell>Professional working proficiency</TableCell>
              <TableCell>B2</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge variant="outline">Intermediate</Badge></TableCell>
              <TableCell>Limited working proficiency</TableCell>
              <TableCell>B1</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><Badge variant="secondary">Basic</Badge></TableCell>
              <TableCell>Elementary proficiency</TableCell>
              <TableCell>A1-A2</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.14: Language proficiency configuration"
        alt="Languages form showing proficiency levels for multiple languages"
      />

      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4" />
        <AlertTitle>Multi-Language Support</AlertTitle>
        <AlertDescription>
          Language proficiency data supports assignment to multi-language projects, 
          customer-facing roles, and international deployments.
        </AlertDescription>
      </Alert>
    </div>
  );
}
