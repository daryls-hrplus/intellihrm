import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, 
  DollarSign,
  Clock,
  CheckCircle2,
  Settings,
  Lightbulb,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { ScreenshotPlaceholder } from "@/components/enablement/shared/ScreenshotPlaceholder";

export function BenefitsManualPlansSection() {
  return (
    <div className="space-y-8">
      {/* Section 3.1: Plan Types */}
      <Card id="ben-sec-3-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 3.1</Badge>
            <Badge variant="secondary" className="text-xs">12 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <FileText className="h-5 w-5 text-primary" />
            Understanding Plan Types
          </CardTitle>
          <CardDescription>
            Medical, Dental, Vision, Life, 401k, Pension, FSA, HSA, Wellness plans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Each benefit category supports different plan types with unique characteristics. 
              Understanding these types helps in proper configuration and employee communication.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Medical Plan Types</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <span className="font-medium">PPO (Preferred Provider Organization)</span>
                  <p className="text-muted-foreground">Flexible network, higher out-of-network costs</p>
                </div>
                <div>
                  <span className="font-medium">HMO (Health Maintenance Organization)</span>
                  <p className="text-muted-foreground">Lower costs, requires referrals, limited network</p>
                </div>
                <div>
                  <span className="font-medium">HDHP (High Deductible Health Plan)</span>
                  <p className="text-muted-foreground">Lower premiums, higher deductible, HSA-eligible</p>
                </div>
                <div>
                  <span className="font-medium">EPO (Exclusive Provider Organization)</span>
                  <p className="text-muted-foreground">No out-of-network coverage except emergencies</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-500/5 border-green-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Retirement Plan Types</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <span className="font-medium">401(k)</span>
                  <p className="text-muted-foreground">Employee contributions, employer match optional</p>
                </div>
                <div>
                  <span className="font-medium">Roth 401(k)</span>
                  <p className="text-muted-foreground">After-tax contributions, tax-free withdrawals</p>
                </div>
                <div>
                  <span className="font-medium">Pension (Defined Benefit)</span>
                  <p className="text-muted-foreground">Employer-funded, guaranteed benefit at retirement</p>
                </div>
                <div>
                  <span className="font-medium">403(b)</span>
                  <p className="text-muted-foreground">For non-profit and education employers</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Common Plans</TableHead>
                <TableHead>Key Features</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Dental</TableCell>
                <TableCell>Basic, Premium, Orthodontic</TableCell>
                <TableCell>Annual maximums, waiting periods for major services</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Vision</TableCell>
                <TableCell>Basic, Enhanced</TableCell>
                <TableCell>Exam coverage, glasses/contacts allowance</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Life Insurance</TableCell>
                <TableCell>Basic, Supplemental, AD&D</TableCell>
                <TableCell>Coverage multiples of salary, beneficiary designations</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Disability</TableCell>
                <TableCell>Short-term, Long-term</TableCell>
                <TableCell>Elimination periods, benefit percentages</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">FSA</TableCell>
                <TableCell>Healthcare, Dependent Care</TableCell>
                <TableCell>Pre-tax, use-it-or-lose-it, annual limits</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">HSA</TableCell>
                <TableCell>HSA (with HDHP)</TableCell>
                <TableCell>Pre-tax, rolls over, triple tax advantage</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <ScreenshotPlaceholder 
            title="Benefit Plans List"
            description="Plans management screen showing all configured plans by category with status and enrollment counts"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 3.2: Creating Plans */}
      <Card id="ben-sec-3-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 3.2</Badge>
            <Badge variant="secondary" className="text-xs">15 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Settings className="h-5 w-5 text-primary" />
            Creating Benefit Plans
          </CardTitle>
          <CardDescription>
            Plan setup wizard, plan details, effective dates, plan status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Plan Creation Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-sm space-y-3 text-muted-foreground list-decimal list-inside">
                <li>
                  <strong>Navigate to Benefits → Plans</strong>
                  <p className="ml-5 text-xs">Access the plans management screen</p>
                </li>
                <li>
                  <strong>Click "Add Plan"</strong>
                  <p className="ml-5 text-xs">Opens the plan creation wizard</p>
                </li>
                <li>
                  <strong>Select Category and Provider</strong>
                  <p className="ml-5 text-xs">Choose from configured categories and providers</p>
                </li>
                <li>
                  <strong>Enter Plan Details</strong>
                  <p className="ml-5 text-xs">Plan name, code, description, plan type</p>
                </li>
                <li>
                  <strong>Set Effective Dates</strong>
                  <p className="ml-5 text-xs">Plan start date, end date (if applicable), plan year</p>
                </li>
                <li>
                  <strong>Configure Coverage Levels</strong>
                  <p className="ml-5 text-xs">Employee Only, Employee + Spouse, Employee + Family, etc.</p>
                </li>
                <li>
                  <strong>Set Contribution Amounts</strong>
                  <p className="ml-5 text-xs">Employee and employer contributions per coverage level</p>
                </li>
                <li>
                  <strong>Define Eligibility Rules</strong>
                  <p className="ml-5 text-xs">Employment types, waiting periods, job groups</p>
                </li>
                <li>
                  <strong>Review and Save</strong>
                  <p className="ml-5 text-xs">Plan is created in Draft status</p>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Example</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Plan Name</TableCell>
                <TableCell>Employee-facing name shown during enrollment</TableCell>
                <TableCell>Gold PPO Medical Plan</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Plan Code</TableCell>
                <TableCell>Internal identifier for reporting and integration</TableCell>
                <TableCell>MED-PPO-GOLD-2024</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Plan Year</TableCell>
                <TableCell>Calendar or fiscal year the plan covers</TableCell>
                <TableCell>2024</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Effective Date</TableCell>
                <TableCell>When the plan becomes active</TableCell>
                <TableCell>January 1, 2024</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Status</TableCell>
                <TableCell>Plan lifecycle state</TableCell>
                <TableCell>Draft, Active, Inactive</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Best Practice</AlertTitle>
            <AlertDescription>
              Use a consistent naming convention for plan codes. Include category abbreviation, plan type, 
              tier (if applicable), and plan year. Example: <code>MED-PPO-GOLD-2024</code>
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Plan Creation Wizard"
            description="Step-by-step plan creation form showing plan details, coverage levels, and contribution setup"
            height="h-48"
          />
        </CardContent>
      </Card>

      {/* Section 3.3: Contributions */}
      <Card id="ben-sec-3-3">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 3.3</Badge>
            <Badge variant="secondary" className="text-xs">12 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Contribution Configuration
          </CardTitle>
          <CardDescription>
            Employee/Employer contributions, fixed/percentage, tiered structures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Contributions define how premium costs are split between the employee and employer. 
              HRplus supports multiple contribution models to accommodate various plan designs.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Contribution Models</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <span className="font-medium">Fixed Amount</span>
                  <p className="text-muted-foreground">Set dollar amount per pay period (e.g., $200/month)</p>
                </div>
                <div>
                  <span className="font-medium">Percentage of Premium</span>
                  <p className="text-muted-foreground">Employee pays X% of total premium (e.g., 20%)</p>
                </div>
                <div>
                  <span className="font-medium">Tiered by Coverage</span>
                  <p className="text-muted-foreground">Different amounts for EE only vs. EE+Family</p>
                </div>
                <div>
                  <span className="font-medium">Salary-Based</span>
                  <p className="text-muted-foreground">Contribution varies by salary band</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Coverage Level Examples</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Employee Only (EE)</span>
                  <span className="text-muted-foreground">$100/month</span>
                </div>
                <div className="flex justify-between">
                  <span>Employee + Spouse (ES)</span>
                  <span className="text-muted-foreground">$250/month</span>
                </div>
                <div className="flex justify-between">
                  <span>Employee + Children (EC)</span>
                  <span className="text-muted-foreground">$200/month</span>
                </div>
                <div className="flex justify-between">
                  <span>Employee + Family (EF)</span>
                  <span className="text-muted-foreground">$400/month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coverage Level</TableHead>
                <TableHead>Total Premium</TableHead>
                <TableHead>Employer Pays</TableHead>
                <TableHead>Employee Pays</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Employee Only</TableCell>
                <TableCell>$500/month</TableCell>
                <TableCell>$400 (80%)</TableCell>
                <TableCell>$100 (20%)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Employee + Spouse</TableCell>
                <TableCell>$1,000/month</TableCell>
                <TableCell>$750 (75%)</TableCell>
                <TableCell>$250 (25%)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Employee + Family</TableCell>
                <TableCell>$1,400/month</TableCell>
                <TableCell>$1,000 (71%)</TableCell>
                <TableCell>$400 (29%)</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Alert className="border-blue-500/20 bg-blue-500/5">
            <DollarSign className="h-4 w-4 text-blue-500" />
            <AlertTitle>Payroll Integration</AlertTitle>
            <AlertDescription>
              Employee contributions configured here automatically create payroll deductions. 
              Changes to contribution amounts take effect based on the configured effective date 
              and are prorated for mid-period changes.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Contribution Configuration"
            description="Contribution setup screen showing coverage levels with employee and employer amounts"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 3.4: Waiting Periods & Eligibility */}
      <Card id="ben-sec-3-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 3.4</Badge>
            <Badge variant="secondary" className="text-xs">10 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Clock className="h-5 w-5 text-primary" />
            Waiting Periods & Eligibility Rules
          </CardTitle>
          <CardDescription>
            New hire waiting periods, eligibility criteria, employment type rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Eligibility rules determine which employees can enroll in a plan and when. 
              Waiting periods delay eligibility for new hires, while other rules filter by 
              employment type, job classification, or location.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Common Settings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Waiting Period</TableCell>
                <TableCell>Days after hire before eligibility</TableCell>
                <TableCell>30, 60, 90 days; First of month after X days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Employment Type</TableCell>
                <TableCell>Filter by full-time, part-time, etc.</TableCell>
                <TableCell>Full-time only; Full-time and Part-time (20+ hrs)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Hours Threshold</TableCell>
                <TableCell>Minimum hours per week required</TableCell>
                <TableCell>30 hours/week for ACA compliance</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Job Classification</TableCell>
                <TableCell>Specific job families or grades</TableCell>
                <TableCell>Management only; All exempt employees</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Location</TableCell>
                <TableCell>Geographic eligibility</TableCell>
                <TableCell>US employees only; Caribbean region</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Waiting Period Calculation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2 text-muted-foreground">
                <p><strong>Example: 30-day waiting period, First of Month After</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Employee hired January 15</li>
                  <li>30-day waiting period ends February 14</li>
                  <li>Eligibility starts March 1 (first of month after waiting period)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Alert className="border-orange-500/20 bg-orange-500/5">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertTitle>ACA Compliance Note</AlertTitle>
            <AlertDescription>
              For employers subject to ACA, waiting periods for medical coverage cannot exceed 90 days 
              for full-time employees (30+ hours/week). Configure your eligibility rules to comply.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Eligibility Rules Configuration"
            description="Plan eligibility settings showing waiting period, employment type filters, and other criteria"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 3.5: Plan Documents */}
      <Card id="ben-sec-3-5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 3.5</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <FileText className="h-5 w-5 text-primary" />
            Plan Documents & Communications
          </CardTitle>
          <CardDescription>
            Summary Plan Descriptions (SPD), plan amendments, employee notices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Each benefit plan requires supporting documentation for compliance and employee communication. 
              HRplus allows you to attach and manage plan documents directly within the system.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Type</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Requirement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Summary Plan Description (SPD)</TableCell>
                <TableCell>Comprehensive plan overview for participants</TableCell>
                <TableCell>ERISA required</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Summary of Benefits & Coverage (SBC)</TableCell>
                <TableCell>Standardized coverage comparison document</TableCell>
                <TableCell>ACA required for medical</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Plan Amendments</TableCell>
                <TableCell>Changes to plan terms</TableCell>
                <TableCell>As changes occur</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Open Enrollment Guide</TableCell>
                <TableCell>Employee-friendly enrollment instructions</TableCell>
                <TableCell>Best practice</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Provider Directory</TableCell>
                <TableCell>List of in-network providers</TableCell>
                <TableCell>For network-based plans</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Document Management</AlertTitle>
            <AlertDescription>
              Upload plan documents to each plan record. Documents are accessible to employees 
              during enrollment and from their benefits dashboard. Version documents when updates occur.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Section 3.6: Plan Activation */}
      <Card id="ben-sec-3-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 3.6</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Plan Activation & Versioning
          </CardTitle>
          <CardDescription>
            Activating plans, version control, plan year transitions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Plans move through a lifecycle from creation to retirement. Version control ensures 
              historical data is preserved while allowing plans to evolve year over year.
            </p>
          </div>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Plan Lifecycle States</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Badge variant="outline">Draft</Badge>
                  <span className="text-muted-foreground">Plan is being configured, not visible to employees</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="default" className="bg-green-500">Active</Badge>
                  <span className="text-muted-foreground">Plan is open for enrollment, visible to eligible employees</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary">Closed</Badge>
                  <span className="text-muted-foreground">Plan is not accepting new enrollments but existing enrollments remain</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="destructive">Inactive</Badge>
                  <span className="text-muted-foreground">Plan is retired, no enrollments, historical only</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Plan Year Transition Process</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                <li>Create new plan version with updated year and rates</li>
                <li>Configure any changes to coverage or eligibility</li>
                <li>Set new effective dates (typically Jan 1)</li>
                <li>Activate new plan version before open enrollment</li>
                <li>Previous year plan automatically closes at year end</li>
                <li>Enrollments roll over or require re-election per policy</li>
              </ol>
            </CardContent>
          </Card>

          <Alert className="border-blue-500/20 bg-blue-500/5">
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
            <AlertTitle>Version Control</AlertTitle>
            <AlertDescription>
              Each plan maintains a version history. Changes create new versions, preserving the original 
              for audit purposes. Reports can be generated for any historical plan version.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Plan Lifecycle Management"
            description="Plan status transition screen showing current state, version history, and activation controls"
            height="h-40"
          />
        </CardContent>
      </Card>
    </div>
  );
}
