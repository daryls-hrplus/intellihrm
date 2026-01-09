import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Settings, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  Users,
  FileText,
  Phone,
  Lightbulb
} from "lucide-react";
import { ScreenshotPlaceholder } from "@/components/enablement/shared/ScreenshotPlaceholder";

export function BenefitsManualFoundationSection() {
  return (
    <div className="space-y-8">
      {/* Section 2.1: Prerequisites */}
      <Card id="ben-sec-2-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 2.1</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Prerequisites Checklist
          </CardTitle>
          <CardDescription>
            Dependencies, data requirements, provider contracts, regulatory info
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Before configuring the Benefits module, ensure the following prerequisites are in place. 
              Missing any of these can cause delays or configuration issues during implementation.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-green-500/5 border-green-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  System Prerequisites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Company/Legal Entity configured in Workforce</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Employee records created with hire dates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Employment types defined (Full-time, Part-time, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>Payroll module configured for deduction processing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Business Prerequisites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>Provider contracts and plan documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>Contribution schedules (employee/employer)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>Eligibility rules and waiting periods</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>Open enrollment dates for current/next plan year</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Alert className="border-orange-500/20 bg-orange-500/5">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertTitle>Important Dependencies</AlertTitle>
            <AlertDescription>
              Benefits configuration should occur <strong>after</strong> Workforce setup (employees, employment types) 
              and <strong>before</strong> running payroll with benefit deductions. Plan the implementation sequence accordingly.
            </AlertDescription>
          </Alert>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prerequisite</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Required For</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Company/Legal Entity</TableCell>
                <TableCell>Workforce Module</TableCell>
                <TableCell>Linking plans to correct entities</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Employee Records</TableCell>
                <TableCell>Workforce Module</TableCell>
                <TableCell>Enrollment eligibility</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Pay Periods</TableCell>
                <TableCell>Payroll Module</TableCell>
                <TableCell>Deduction scheduling</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Provider Contracts</TableCell>
                <TableCell>Business/Legal</TableCell>
                <TableCell>Plan cost and coverage setup</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Eligibility Rules</TableCell>
                <TableCell>HR Policy</TableCell>
                <TableCell>Waiting period configuration</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Section 2.2: Benefit Categories */}
      <Card id="ben-sec-2-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 2.2</Badge>
            <Badge variant="secondary" className="text-xs">10 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Settings className="h-5 w-5 text-primary" />
            Benefit Categories Configuration
          </CardTitle>
          <CardDescription>
            Medical, Dental, Vision, Life, Retirement, HSA, FSA, Wellness categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Benefit categories are the top-level classification for organizing your benefits offerings. 
              Categories group similar types of benefits together and provide a structure for reporting 
              and employee navigation.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Common Plans</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Medical</TableCell>
                <TableCell>Health insurance coverage for medical expenses</TableCell>
                <TableCell>PPO, HMO, HDHP, EPO</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Dental</TableCell>
                <TableCell>Coverage for dental care and procedures</TableCell>
                <TableCell>Basic, Premium, Orthodontic</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Vision</TableCell>
                <TableCell>Eye care, glasses, and contact lenses</TableCell>
                <TableCell>Basic Vision, Premium Vision</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Life Insurance</TableCell>
                <TableCell>Death benefit coverage</TableCell>
                <TableCell>Basic Life, Supplemental, AD&D</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Disability</TableCell>
                <TableCell>Income protection during disability</TableCell>
                <TableCell>Short-term, Long-term</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Retirement</TableCell>
                <TableCell>Retirement savings plans</TableCell>
                <TableCell>401(k), Pension, 403(b)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">HSA</TableCell>
                <TableCell>Health Savings Account (tax-advantaged)</TableCell>
                <TableCell>HSA with HDHP</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">FSA</TableCell>
                <TableCell>Flexible Spending Account</TableCell>
                <TableCell>Healthcare FSA, Dependent Care FSA</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Wellness</TableCell>
                <TableCell>Health and wellness programs</TableCell>
                <TableCell>Gym, EAP, Mental Health</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Configuration Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                <li>Navigate to <strong>Benefits → Categories</strong></li>
                <li>Click <strong>Add Category</strong> to create a new category</li>
                <li>Enter category name, code, and description</li>
                <li>Set display order for employee-facing screens</li>
                <li>Enable or disable category as needed</li>
                <li>Save and repeat for all required categories</li>
              </ol>
            </CardContent>
          </Card>

          <ScreenshotPlaceholder 
            title="Benefit Categories List"
            description="Categories management screen showing all configured benefit categories with status and plan counts"
            height="h-40"
          />

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Best Practice</AlertTitle>
            <AlertDescription>
              Keep category names employee-friendly (e.g., "Health Insurance" vs. "Medical Category Type A"). 
              Employees see these names during enrollment. Use codes for internal tracking.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Section 2.3: Benefit Providers */}
      <Card id="ben-sec-2-3">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 2.3</Badge>
            <Badge variant="secondary" className="text-xs">12 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Building className="h-5 w-5 text-primary" />
            Benefit Providers Setup
          </CardTitle>
          <CardDescription>
            Insurance carriers, retirement plan administrators, wellness vendors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Providers are the insurance companies, administrators, and vendors that deliver benefit services. 
              Each provider record stores key information for administration and integration.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Provider Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Provider name and legal name</li>
                  <li>• Provider type (Insurer, TPA, Vendor)</li>
                  <li>• Tax ID / Registration number</li>
                  <li>• Website and portal URLs</li>
                  <li>• Categories served</li>
                  <li>• Status (Active/Inactive)</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Integration Details</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• EDI/API connection settings</li>
                  <li>• File format preferences</li>
                  <li>• Enrollment feed schedule</li>
                  <li>• Claims data exchange</li>
                  <li>• Eligibility verification</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Configuration Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                <li>Navigate to <strong>Benefits → Providers</strong></li>
                <li>Click <strong>Add Provider</strong></li>
                <li>Enter provider details (name, type, tax ID)</li>
                <li>Add website and portal URLs</li>
                <li>Select categories this provider serves</li>
                <li>Configure integration settings if applicable</li>
                <li>Save provider record</li>
              </ol>
            </CardContent>
          </Card>

          <ScreenshotPlaceholder 
            title="Provider Configuration"
            description="Provider setup form showing company information, contact details, and integration settings"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 2.4: Provider Contacts */}
      <Card id="ben-sec-2-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 2.4</Badge>
            <Badge variant="secondary" className="text-xs">10 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Phone className="h-5 w-5 text-primary" />
            Provider Contact & Contract Management
          </CardTitle>
          <CardDescription>
            Account managers, escalation contacts, contract terms tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Maintaining accurate provider contacts and contract information ensures smooth 
              administration and timely resolution of issues. Track key contacts, contract terms, 
              and renewal dates for each provider relationship.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact Type</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Info Captured</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Account Manager</TableCell>
                <TableCell>Primary relationship contact</TableCell>
                <TableCell>Name, email, phone, territory</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Service Support</TableCell>
                <TableCell>Day-to-day operational issues</TableCell>
                <TableCell>Hotline, email, hours</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Claims Contact</TableCell>
                <TableCell>Claims processing questions</TableCell>
                <TableCell>Claims dept contact info</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Escalation</TableCell>
                <TableCell>Urgent/executive issues</TableCell>
                <TableCell>Management contacts</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Technical/EDI</TableCell>
                <TableCell>Integration and data feeds</TableCell>
                <TableCell>IT contact info</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Contract Tracking Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Contract start date</li>
                  <li>• Contract end date</li>
                  <li>• Auto-renewal terms</li>
                  <li>• Notice period for termination</li>
                </ul>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Rate guarantee period</li>
                  <li>• Performance guarantees</li>
                  <li>• SLA commitments</li>
                  <li>• Contract document storage</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Alert className="border-blue-500/20 bg-blue-500/5">
            <Users className="h-4 w-4 text-blue-500" />
            <AlertTitle>Relationship Management</AlertTitle>
            <AlertDescription>
              Schedule regular check-ins with account managers (quarterly recommended). 
              Document all significant interactions and decisions. Set calendar reminders 
              for contract renewal 90-120 days before expiration.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Provider Contacts & Contracts"
            description="Provider detail page showing contacts list and contract information with renewal dates"
            height="h-40"
          />
        </CardContent>
      </Card>
    </div>
  );
}
