import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Info, Briefcase, GraduationCap, Award, Building2, Calendar, CheckCircle2 } from 'lucide-react';
import { IntegrationReference } from '@/components/enablement/shared';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function ProfessionalDetailsWorkHistory() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Professional details capture the employee's work history, education, and career progression 
          prior to joining the organization. This information supports background verification, 
          succession planning, and career development initiatives.
        </p>
        
        <IntegrationReference
          moduleCode="hr-hub"
          moduleName="HR Hub"
          sectionId="hh-sec-5-1"
          sectionTitle="Background Check Integration"
          description="Professional history data feeds into background verification workflows"
          manualPath="/enablement/manuals/hr-hub"
        />
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Professional History Components</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Prior Employment</h4>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Company/Organization Name
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Job Title / Position
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Employment Dates (Start/End)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                Responsibilities (optional)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                Reason for Leaving (optional)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                Reference Contact (optional)
              </li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium">Education History</h4>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Institution Name
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Degree / Qualification
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Field of Study / Major
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Graduation Date
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                GPA / Honors (optional)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                Document Upload (optional)
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Professional Info Tab Structure</h3>
        <p className="text-muted-foreground mb-4">
          The Professional Information tab in the employee profile organizes data into logical categories:
        </p>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sub-Tab</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Data Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Professional History</TableCell>
              <TableCell>Prior employment, work experience timeline</TableCell>
              <TableCell><Badge variant="outline">HR Entry / Employee ESS</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Credentials & Memberships</TableCell>
              <TableCell>Professional certifications, industry memberships</TableCell>
              <TableCell><Badge variant="outline">HR Entry / Employee ESS</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">References & Verifications</TableCell>
              <TableCell>Reference contacts, verification status</TableCell>
              <TableCell><Badge variant="outline">HR Entry Only</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Compliance & Legal</TableCell>
              <TableCell>Regulatory requirements, compliance tracking</TableCell>
              <TableCell><Badge variant="outline">HR Entry Only</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Agreements & Signatures</TableCell>
              <TableCell>Employment contracts, policy acknowledgments</TableCell>
              <TableCell><Badge variant="outline">System Generated</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Data Entry Best Practices</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Verify Company Names</p>
              <p className="text-sm text-muted-foreground">
                Use official company names as registered for background check accuracy
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Capture Full Date Ranges</p>
              <p className="text-sm text-muted-foreground">
                Month/Year minimum for employment verification; exact dates preferred
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Document Credentials</p>
              <p className="text-sm text-muted-foreground">
                Upload copies of degrees, certificates for verification and succession planning
              </p>
            </div>
          </div>
        </div>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.3: Professional Information tab with work history and education records"
        alt="Professional details view showing prior employment timeline and education history"
      />

      <Alert className="border-border bg-muted/50">
        <Info className="h-4 w-4" />
        <AlertTitle>Industry Context</AlertTitle>
        <AlertDescription>
          Professional history data is typically collected during onboarding and validated through 
          background verification services. SAP SuccessFactors and Workday recommend capturing 
          minimum 5-10 years of employment history for leadership positions.
        </AlertDescription>
      </Alert>
    </div>
  );
}
