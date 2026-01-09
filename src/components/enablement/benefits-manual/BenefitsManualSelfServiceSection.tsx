import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  User, 
  ClipboardList,
  Receipt,
  GitCompare,
  Calculator,
  Users,
  Lightbulb
} from "lucide-react";
import { ScreenshotPlaceholder } from "@/components/enablement/shared/ScreenshotPlaceholder";

export function BenefitsManualSelfServiceSection() {
  return (
    <div className="space-y-8">
      {/* Section 8.1: Viewing My Benefits */}
      <Card id="ben-sec-8-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 8.1</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <User className="h-5 w-5 text-primary" />
            ESS: Viewing My Benefits
          </CardTitle>
          <CardDescription>
            Current enrollments, coverage details, beneficiary information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              The Employee Self-Service (ESS) Benefits portal gives employees 24/7 access to 
              view their current benefit enrollments, coverage details, and plan documents.
            </p>
          </div>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">My Benefits Dashboard Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• View all current benefit enrollments</li>
                <li>• See coverage level and who is covered</li>
                <li>• View employee and employer contribution amounts</li>
                <li>• Access plan documents (SPD, SBC)</li>
                <li>• View covered dependents</li>
                <li>• Check beneficiary designations</li>
                <li>• See coverage effective dates</li>
                <li>• Download benefit confirmation statements</li>
              </ul>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Information</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Can Edit?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Current Enrollments</TableCell>
                <TableCell>Benefits → My Benefits</TableCell>
                <TableCell>During enrollment windows only</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Covered Dependents</TableCell>
                <TableCell>Benefits → My Dependents</TableCell>
                <TableCell>During enrollment/life events</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Beneficiaries</TableCell>
                <TableCell>Benefits → Beneficiaries</TableCell>
                <TableCell>Yes, anytime</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Plan Documents</TableCell>
                <TableCell>Benefits → Documents</TableCell>
                <TableCell>View only</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <ScreenshotPlaceholder 
            title="My Benefits Dashboard"
            description="Employee view showing enrolled plans, coverage levels, costs, and quick action buttons"
            height="h-48"
          />
        </CardContent>
      </Card>

      {/* Section 8.2: Enrolling in Benefits */}
      <Card id="ben-sec-8-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 8.2</Badge>
            <Badge variant="secondary" className="text-xs">10 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            ESS: Enrolling in Benefits
          </CardTitle>
          <CardDescription>
            Open enrollment experience, plan selection, confirmation workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Employee Enrollment Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                <li>
                  <strong>Access Enrollment</strong>
                  <p className="ml-5 text-xs">Navigate to Benefits → Enroll Now (during open window)</p>
                </li>
                <li>
                  <strong>Review Current Elections</strong>
                  <p className="ml-5 text-xs">See existing enrollments that will auto-renew</p>
                </li>
                <li>
                  <strong>Browse Available Plans</strong>
                  <p className="ml-5 text-xs">View all plans you're eligible for with plan details</p>
                </li>
                <li>
                  <strong>Compare Plans</strong>
                  <p className="ml-5 text-xs">Use comparison tool to evaluate options side-by-side</p>
                </li>
                <li>
                  <strong>Select Plans</strong>
                  <p className="ml-5 text-xs">Choose plan for each benefit category</p>
                </li>
                <li>
                  <strong>Choose Coverage Level</strong>
                  <p className="ml-5 text-xs">Select EE only, EE+Spouse, EE+Family, etc.</p>
                </li>
                <li>
                  <strong>Add/Verify Dependents</strong>
                  <p className="ml-5 text-xs">Add new dependents or confirm existing</p>
                </li>
                <li>
                  <strong>Designate Beneficiaries</strong>
                  <p className="ml-5 text-xs">Update life insurance beneficiaries</p>
                </li>
                <li>
                  <strong>Review Summary</strong>
                  <p className="ml-5 text-xs">See total costs and confirm all elections</p>
                </li>
                <li>
                  <strong>Submit Enrollment</strong>
                  <p className="ml-5 text-xs">Confirm and submit elections</p>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Save Progress</AlertTitle>
            <AlertDescription>
              Employees can save their enrollment progress and return later before the deadline. 
              A "Save and Continue Later" option preserves selections. Reminder emails are sent 
              if enrollment is incomplete.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Enrollment Wizard"
            description="Step-by-step enrollment experience with plan cards, coverage selection, and cost summary"
            height="h-48"
          />
        </CardContent>
      </Card>

      {/* Section 8.3: Submitting Claims */}
      <Card id="ben-sec-8-3">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 8.3</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Receipt className="h-5 w-5 text-primary" />
            ESS: Submitting Claims
          </CardTitle>
          <CardDescription>
            Claims submission portal, document upload, status tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Submit a Claim</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to Benefits → My Claims</li>
                  <li>Click "Submit New Claim"</li>
                  <li>Select claim type (FSA, HSA, etc.)</li>
                  <li>Enter expense details</li>
                  <li>Upload receipt/documentation</li>
                  <li>Submit for processing</li>
                </ol>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Track My Claims</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-1">
                  <li>• View all submitted claims</li>
                  <li>• Check claim status (Pending, Approved, Paid)</li>
                  <li>• See estimated payment dates</li>
                  <li>• Respond to information requests</li>
                  <li>• Download claim history</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <ScreenshotPlaceholder 
            title="Employee Claims Portal"
            description="Employee claims submission and tracking interface with claim history and quick actions"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 8.4: Plan Comparison Tool */}
      <Card id="ben-sec-8-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 8.4</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <GitCompare className="h-5 w-5 text-primary" />
            Plan Comparison Tool
          </CardTitle>
          <CardDescription>
            Side-by-side plan comparison, cost calculator, decision support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              The Plan Comparison Tool helps employees make informed benefits decisions by 
              comparing plans side-by-side with clear cost and coverage breakdowns.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Gold PPO</TableHead>
                <TableHead>Silver PPO</TableHead>
                <TableHead>HDHP + HSA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Monthly Premium (EE)</TableCell>
                <TableCell>$150</TableCell>
                <TableCell>$100</TableCell>
                <TableCell>$50</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Deductible</TableCell>
                <TableCell>$500</TableCell>
                <TableCell>$1,000</TableCell>
                <TableCell>$2,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Out-of-Pocket Max</TableCell>
                <TableCell>$3,000</TableCell>
                <TableCell>$5,000</TableCell>
                <TableCell>$6,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">PCP Copay</TableCell>
                <TableCell>$20</TableCell>
                <TableCell>$30</TableCell>
                <TableCell>After deductible</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">HSA Contribution</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>N/A</TableCell>
                <TableCell>$500 employer</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Decision Support Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Estimate annual costs based on usage scenario</li>
                <li>• See "Best fit" recommendations based on family size</li>
                <li>• Compare in-network provider coverage</li>
                <li>• Calculate HSA tax savings</li>
                <li>• View plan ratings and satisfaction scores</li>
              </ul>
            </CardContent>
          </Card>

          <ScreenshotPlaceholder 
            title="Plan Comparison Tool"
            description="Interactive plan comparison with cost charts, feature matrix, and recommendation engine"
            height="h-48"
          />
        </CardContent>
      </Card>

      {/* Section 8.5: Benefit Calculator */}
      <Card id="ben-sec-8-5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 8.5</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Calculator className="h-5 w-5 text-primary" />
            Benefit Calculator
          </CardTitle>
          <CardDescription>
            Cost estimator, contribution calculator, tax savings projections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              The Benefit Calculator helps employees understand the true cost of their benefits 
              and model different scenarios to find the best value.
            </p>
          </div>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Calculator Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 text-sm">
                <div>
                  <span className="font-medium">Cost Estimator</span>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    <li>• Annual premium costs</li>
                    <li>• Per-paycheck deductions</li>
                    <li>• Expected out-of-pocket costs</li>
                    <li>• Total estimated annual cost</li>
                  </ul>
                </div>
                <div>
                  <span className="font-medium">Tax Savings Calculator</span>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    <li>• Pre-tax premium savings</li>
                    <li>• FSA/HSA tax benefits</li>
                    <li>• Net cost after tax savings</li>
                    <li>• Retirement contribution impact</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Usage Scenarios</AlertTitle>
            <AlertDescription>
              The calculator lets employees model different healthcare usage scenarios 
              (low, medium, high) to see which plan offers the best value based on their 
              expected needs.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Benefit Calculator"
            description="Interactive calculator showing cost projections, tax savings, and scenario modeling"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 8.6: MSS Team Benefits */}
      <Card id="ben-sec-8-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 8.6</Badge>
            <Badge variant="secondary" className="text-xs">6 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Users className="h-5 w-5 text-primary" />
            MSS: Team Benefits Overview
          </CardTitle>
          <CardDescription>
            Manager visibility, enrollment tracking, team benefits reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Manager Self-Service (MSS) provides managers with visibility into their team's 
              benefits enrollment status, particularly useful during open enrollment periods.
            </p>
          </div>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Manager Benefits View</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Team enrollment completion status</li>
                <li>• Employees who haven't enrolled (during OE)</li>
                <li>• New hires approaching eligibility</li>
                <li>• Team benefits cost summary (aggregate only)</li>
                <li>• Send reminders to team members</li>
              </ul>
            </CardContent>
          </Card>

          <Alert className="border-blue-500/20 bg-blue-500/5">
            <Users className="h-4 w-4 text-blue-500" />
            <AlertTitle>Privacy Note</AlertTitle>
            <AlertDescription>
              Managers see enrollment status (complete/incomplete) but cannot view individual 
              plan selections, coverage levels, or contribution amounts. Detailed enrollment 
              information is private to the employee and HR.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Manager Team Benefits View"
            description="Manager dashboard showing team enrollment completion rates and pending actions"
            height="h-40"
          />
        </CardContent>
      </Card>
    </div>
  );
}
