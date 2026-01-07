import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, AlertTriangle, Info, Users, Hash, IdCard, UserPlus } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function EmployeeRecordCreation() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Employee record creation establishes the foundational data for each employee in HRplus. 
          This section covers creating new profiles, required vs optional fields, and configuring 
          employee identifiers that ensure unique tracking across the system.
        </p>
        
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertTitle>Data Quality First</AlertTitle>
          <AlertDescription>
            High-quality employee data at creation prevents downstream issues in payroll, 
            benefits, and compliance. Take time to validate data before saving.
          </AlertDescription>
        </Alert>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Employee Identifiers</h3>
        <p className="text-muted-foreground mb-4">
          HRplus supports multiple identifier types for flexible employee tracking:
        </p>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identifier</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Auto-Generated</TableHead>
              <TableHead>Unique Scope</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" />
                  Employee ID
                </div>
              </TableCell>
              <TableCell>Primary internal identifier</TableCell>
              <TableCell><Badge variant="outline">Optional</Badge></TableCell>
              <TableCell>Company-level</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-blue-500" />
                  Badge Number
                </div>
              </TableCell>
              <TableCell>Physical access card / time clock</TableCell>
              <TableCell><Badge variant="outline">Manual</Badge></TableCell>
              <TableCell>Location-level</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  Global ID
                </div>
              </TableCell>
              <TableCell>Multi-company/cross-entity tracking</TableCell>
              <TableCell><Badge variant="outline">Optional</Badge></TableCell>
              <TableCell>Global (all entities)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-amber-500" />
                  Cédula Number
                </div>
              </TableCell>
              <TableCell>Government ID (Caribbean/LATAM)</TableCell>
              <TableCell><Badge variant="outline">Manual</Badge></TableCell>
              <TableCell>Country-level</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Time Clock ID</TableCell>
              <TableCell>Biometric/time attendance systems</TableCell>
              <TableCell><Badge variant="outline">Manual</Badge></TableCell>
              <TableCell>Device-level</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Required Fields</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Core Identity</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                First Name
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Last Name(s)
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Email Address
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Employment Status
              </li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Name Components (Latin America)</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                First Name (Nombre)
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                Middle Name (optional)
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                First Last Name (Apellido Paterno)
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Second Last Name (Apellido Materno)
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Step-by-Step Process</h3>
        <ol className="space-y-4">
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
            <div>
              <p className="font-medium">Navigate to Workforce → Employees</p>
              <p className="text-sm text-muted-foreground">Click "Add Employee" to open the creation dialog</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
            <div>
              <p className="font-medium">Enter Core Identity Information</p>
              <p className="text-sm text-muted-foreground">Provide name components, email, and basic demographics</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
            <div>
              <p className="font-medium">Configure Employee Identifiers</p>
              <p className="text-sm text-muted-foreground">Set employee ID, badge number, and any regional IDs required</p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">4</div>
            <div>
              <p className="font-medium">Save and Assign Position</p>
              <p className="text-sm text-muted-foreground">After creation, assign the employee to their primary position</p>
            </div>
          </li>
        </ol>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.1: Employee Record Creation dialog with identifiers configuration"
        alt="Employee creation form showing name fields, identifiers, and employment status"
      />

      <Alert variant="destructive" className="border-destructive/20">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Common Pitfalls</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Duplicate email addresses will be rejected - verify uniqueness first</li>
            <li>Employee IDs cannot be changed after payroll processing begins</li>
            <li>Name format must match legal documents for compliance</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
