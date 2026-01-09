import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Receipt, 
  Upload,
  CheckCircle2,
  Clock,
  BarChart3,
  Lightbulb,
  AlertTriangle
} from "lucide-react";
import { ScreenshotPlaceholder } from "@/components/enablement/shared/ScreenshotPlaceholder";

export function BenefitsManualClaimsSection() {
  return (
    <div className="space-y-8">
      {/* Section 6.1: Claims Overview */}
      <Card id="ben-sec-6-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 6.1</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Receipt className="h-5 w-5 text-primary" />
            Claims Workflow Overview
          </CardTitle>
          <CardDescription>
            End-to-end claims process, statuses, and touchpoints
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              The claims module handles reimbursement requests for eligible expenses such as 
              medical reimbursements, FSA claims, and wellness program submissions. Understanding 
              the workflow ensures efficient processing and employee satisfaction.
            </p>
          </div>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Claims Status Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Badge variant="outline">Draft</Badge>
                  <span className="text-muted-foreground">Claim started but not yet submitted</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary">Submitted</Badge>
                  <span className="text-muted-foreground">Claim submitted, awaiting review</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-yellow-500">Under Review</Badge>
                  <span className="text-muted-foreground">Being reviewed by administrator</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-blue-500">Pending Info</Badge>
                  <span className="text-muted-foreground">Additional information requested</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-green-500">Approved</Badge>
                  <span className="text-muted-foreground">Claim approved for payment</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-purple-500">Paid</Badge>
                  <span className="text-muted-foreground">Payment processed</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="destructive">Denied</Badge>
                  <span className="text-muted-foreground">Claim rejected with reason</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Claim Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Typical Processing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Healthcare FSA</TableCell>
                <TableCell>Eligible medical, dental, vision expenses</TableCell>
                <TableCell>3-5 business days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Dependent Care FSA</TableCell>
                <TableCell>Childcare, elder care expenses</TableCell>
                <TableCell>3-5 business days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">HSA Reimbursement</TableCell>
                <TableCell>Qualified medical expenses</TableCell>
                <TableCell>1-2 business days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Wellness Incentive</TableCell>
                <TableCell>Gym membership, wellness activities</TableCell>
                <TableCell>5-7 business days</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <ScreenshotPlaceholder 
            title="Claims Dashboard"
            description="Claims management screen showing pending, approved, and paid claims with filters"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 6.2: Submitting Claims */}
      <Card id="ben-sec-6-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 6.2</Badge>
            <Badge variant="secondary" className="text-xs">10 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Upload className="h-5 w-5 text-primary" />
            Submitting Claims
          </CardTitle>
          <CardDescription>
            Employee self-service claims, supporting documentation, submission channels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Employee Claim Submission Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                <li>Navigate to Benefits → My Claims in ESS</li>
                <li>Click "Submit New Claim"</li>
                <li>Select claim type (FSA, HSA, Wellness, etc.)</li>
                <li>Enter expense details (date, amount, description)</li>
                <li>Upload receipt/documentation</li>
                <li>Certify the expense is eligible</li>
                <li>Submit claim for processing</li>
              </ol>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Required Information</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Expense Date</TableCell>
                <TableCell>Date the expense was incurred</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Expense Amount</TableCell>
                <TableCell>Total amount being claimed</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Provider/Vendor</TableCell>
                <TableCell>Name of service provider or merchant</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Expense Type</TableCell>
                <TableCell>Category of expense (medical, dental, etc.)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Documentation</TableCell>
                <TableCell>Receipt, EOB, or itemized statement</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Documentation Tips</AlertTitle>
            <AlertDescription>
              Receipts should show: provider name, date of service, patient name (if applicable), 
              description of service/product, and amount paid. Credit card statements alone are 
              typically not sufficient for FSA/HSA claims.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Claim Submission Form"
            description="Employee claim submission screen with expense details, document upload, and certification"
            height="h-48"
          />
        </CardContent>
      </Card>

      {/* Section 6.3: Claims Review */}
      <Card id="ben-sec-6-3">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 6.3</Badge>
            <Badge variant="secondary" className="text-xs">10 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Claims Review & Validation
          </CardTitle>
          <CardDescription>
            Documentation verification, eligibility check, coverage confirmation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Claims review ensures that submitted expenses are eligible, properly documented, 
              and within plan limits. A thorough review process protects both the employee and 
              the organization.
            </p>
          </div>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Review Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Expense date within coverage period</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Expense type is eligible under the plan</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Documentation matches claimed amount</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Employee is enrolled in applicable plan</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Sufficient account balance (for FSA/HSA)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Not a duplicate of previously paid claim</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Decision</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Notification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Approve</TableCell>
                <TableCell>Move to payment queue</TableCell>
                <TableCell>Approval confirmation sent</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Request Info</TableCell>
                <TableCell>Return for additional documentation</TableCell>
                <TableCell>Request details with deadline</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Partial Approve</TableCell>
                <TableCell>Approve eligible portion</TableCell>
                <TableCell>Partial approval with explanation</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Deny</TableCell>
                <TableCell>Reject claim with reason</TableCell>
                <TableCell>Denial notice with appeal info</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Alert className="border-orange-500/20 bg-orange-500/5">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertTitle>Common Denial Reasons</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1">
                <li>• Expense not eligible under plan terms</li>
                <li>• Missing or insufficient documentation</li>
                <li>• Expense incurred outside coverage period</li>
                <li>• Duplicate claim submission</li>
                <li>• Insufficient account balance</li>
              </ul>
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Claims Review Interface"
            description="Administrator claims review screen with claim details, documents, and approval actions"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 6.4: Approval & Payment */}
      <Card id="ben-sec-6-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 6.4</Badge>
            <Badge variant="secondary" className="text-xs">10 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Claims Approval & Payment
          </CardTitle>
          <CardDescription>
            Approval workflow, payment processing, reimbursement methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <div>
                  <span className="font-medium">Direct Deposit</span>
                  <p>Deposited to employee's bank account</p>
                </div>
                <div>
                  <span className="font-medium">Payroll</span>
                  <p>Added to next paycheck as non-taxable</p>
                </div>
                <div>
                  <span className="font-medium">Check</span>
                  <p>Mailed to employee's address</p>
                </div>
                <div>
                  <span className="font-medium">Debit Card</span>
                  <p>Auto-substantiated at point of sale</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Payment Timeline</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Submission to Approval</span>
                  <span>1-3 business days</span>
                </div>
                <div className="flex justify-between">
                  <span>Approval to Payment</span>
                  <span>1-2 business days</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Processing</span>
                  <span>2-5 business days</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <ScreenshotPlaceholder 
            title="Payment Processing"
            description="Claims payment screen showing approved claims ready for payment with batch options"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 6.5: Status Tracking */}
      <Card id="ben-sec-6-5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 6.5</Badge>
            <Badge variant="secondary" className="text-xs">6 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Clock className="h-5 w-5 text-primary" />
            Claims Status Tracking
          </CardTitle>
          <CardDescription>
            Tracking claims through lifecycle, employee visibility, status updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Both employees and administrators can track claim status through the system. 
              Real-time visibility reduces inquiries and improves employee experience.
            </p>
          </div>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Employee View Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• View all submitted claims and statuses</li>
                <li>• See estimated payment dates</li>
                <li>• Track response to information requests</li>
                <li>• View claim history and payment records</li>
                <li>• Download claim receipts and confirmations</li>
              </ul>
            </CardContent>
          </Card>

          <ScreenshotPlaceholder 
            title="Employee Claims Tracker"
            description="Employee self-service view of claim history with status, dates, and payment info"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 6.6: Claims Reporting */}
      <Card id="ben-sec-6-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 6.6</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Claims Reporting
          </CardTitle>
          <CardDescription>
            Claims analytics, trend analysis, provider performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Claims reporting provides insights into utilization patterns, processing efficiency, 
              and potential areas for improvement.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Frequency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Claims Summary</TableCell>
                <TableCell>Overview of claims by status, type, amount</TableCell>
                <TableCell>Weekly/Monthly</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Processing Time</TableCell>
                <TableCell>Average time from submission to payment</TableCell>
                <TableCell>Monthly</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Denial Analysis</TableCell>
                <TableCell>Denied claims by reason, trend over time</TableCell>
                <TableCell>Monthly</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Utilization Report</TableCell>
                <TableCell>FSA/HSA account usage by employee</TableCell>
                <TableCell>Quarterly</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Year-End Summary</TableCell>
                <TableCell>Annual claims totals for tax reporting</TableCell>
                <TableCell>Annual</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <ScreenshotPlaceholder 
            title="Claims Analytics Dashboard"
            description="Claims reporting dashboard with charts showing volume, processing time, and denial trends"
            height="h-40"
          />
        </CardContent>
      </Card>
    </div>
  );
}
