import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ClipboardList, 
  Calendar,
  Users,
  CheckCircle2,
  Settings,
  Lightbulb,
  Clock,
  UserPlus
} from "lucide-react";
import { ScreenshotPlaceholder } from "@/components/enablement/shared/ScreenshotPlaceholder";

export function BenefitsManualEnrollmentSection() {
  return (
    <div className="space-y-8">
      {/* Section 4.1: Enrollment Lifecycle */}
      <Card id="ben-sec-4-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 4.1</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Enrollment Lifecycle Overview
          </CardTitle>
          <CardDescription>
            From eligibility to confirmation, enrollment statuses and transitions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Understanding the enrollment lifecycle helps administrators manage the benefits 
              enrollment process effectively and troubleshoot issues when they arise.
            </p>
          </div>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Enrollment Status Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Badge variant="outline">Eligible</Badge>
                  <span className="text-muted-foreground">Employee meets eligibility criteria, can start enrollment</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary">Pending</Badge>
                  <span className="text-muted-foreground">Employee has started enrollment, not yet submitted</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-yellow-500">Submitted</Badge>
                  <span className="text-muted-foreground">Enrollment submitted, awaiting approval (if required)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-green-500">Active</Badge>
                  <span className="text-muted-foreground">Enrollment approved and effective</span>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="destructive">Cancelled</Badge>
                  <span className="text-muted-foreground">Enrollment cancelled or terminated</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enrollment Type</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Window</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">New Hire</TableCell>
                <TableCell>Employee hire date</TableCell>
                <TableCell>30 days from eligibility date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Open Enrollment</TableCell>
                <TableCell>Annual enrollment period</TableCell>
                <TableCell>Defined OE window (typically 2-4 weeks)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Life Event</TableCell>
                <TableCell>Qualifying life event</TableCell>
                <TableCell>30-60 days from event date</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Status Change</TableCell>
                <TableCell>Employment type change</TableCell>
                <TableCell>30 days from status change</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <ScreenshotPlaceholder 
            title="Enrollment Dashboard"
            description="Enrollment management screen showing pending, active, and completed enrollments with filters"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 4.2: Open Enrollment Configuration */}
      <Card id="ben-sec-4-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 4.2</Badge>
            <Badge variant="secondary" className="text-xs">12 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Calendar className="h-5 w-5 text-primary" />
            Open Enrollment Configuration
          </CardTitle>
          <CardDescription>
            Setting up enrollment periods, communications, reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Open Enrollment Setup Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-sm space-y-3 text-muted-foreground list-decimal list-inside">
                <li>
                  <strong>Navigate to Benefits → Open Enrollment</strong>
                  <p className="ml-5 text-xs">Access the open enrollment configuration</p>
                </li>
                <li>
                  <strong>Create Enrollment Period</strong>
                  <p className="ml-5 text-xs">Name the period (e.g., "2024 Open Enrollment")</p>
                </li>
                <li>
                  <strong>Set Dates</strong>
                  <p className="ml-5 text-xs">Start date, end date, and plan effective date</p>
                </li>
                <li>
                  <strong>Select Included Plans</strong>
                  <p className="ml-5 text-xs">Choose which plans are open for enrollment/changes</p>
                </li>
                <li>
                  <strong>Configure Rollover Policy</strong>
                  <p className="ml-5 text-xs">Auto-renew current elections or require active enrollment</p>
                </li>
                <li>
                  <strong>Set Up Communications</strong>
                  <p className="ml-5 text-xs">Launch announcements, reminders, deadline notices</p>
                </li>
                <li>
                  <strong>Activate Period</strong>
                  <p className="ml-5 text-xs">Open enrollment becomes available to employees</p>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Setting</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Example</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Period Name</TableCell>
                <TableCell>Display name for this enrollment window</TableCell>
                <TableCell>2024 Annual Open Enrollment</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Start Date</TableCell>
                <TableCell>When employees can begin making elections</TableCell>
                <TableCell>November 1, 2023</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">End Date</TableCell>
                <TableCell>Deadline for all enrollment changes</TableCell>
                <TableCell>November 15, 2023</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Effective Date</TableCell>
                <TableCell>When new elections take effect</TableCell>
                <TableCell>January 1, 2024</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Auto-Rollover</TableCell>
                <TableCell>Renew current elections if no action taken</TableCell>
                <TableCell>Enabled for Medical/Dental; Disabled for FSA</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Communication Schedule</AlertTitle>
            <AlertDescription>
              Set up automated reminders: 1 week before start, at launch, mid-period, 3 days before close, 
              and final day reminder. Include links to decision support tools and FAQ resources.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Open Enrollment Setup"
            description="Open enrollment configuration screen showing dates, plans, rollover settings, and communications"
            height="h-48"
          />
        </CardContent>
      </Card>

      {/* Section 4.3: Processing Enrollments */}
      <Card id="ben-sec-4-3">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 4.3</Badge>
            <Badge variant="secondary" className="text-xs">12 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Processing Employee Enrollments
          </CardTitle>
          <CardDescription>
            New hire enrollments, plan changes, election confirmations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">New Hire Enrollment</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Employee completes waiting period</li>
                  <li>System sends eligibility notification</li>
                  <li>Employee accesses ESS enrollment</li>
                  <li>Employee selects plans and coverage levels</li>
                  <li>Employee adds dependents (if applicable)</li>
                  <li>Employee confirms elections</li>
                  <li>HR reviews and approves (if required)</li>
                  <li>Enrollment becomes active</li>
                </ol>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Admin-Initiated Enrollment</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Navigate to employee record</li>
                  <li>Access Benefits tab</li>
                  <li>Click "Add Enrollment"</li>
                  <li>Select plan and coverage level</li>
                  <li>Enter effective date</li>
                  <li>Add dependents if applicable</li>
                  <li>Save enrollment</li>
                  <li>Generate confirmation for employee</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          <Alert className="border-blue-500/20 bg-blue-500/5">
            <Clock className="h-4 w-4 text-blue-500" />
            <AlertTitle>Enrollment Windows</AlertTitle>
            <AlertDescription>
              New hires have 30 days from eligibility date to enroll. Monitor the waiting period 
              tracker to ensure employees are notified in time. Late enrollments require life event 
              documentation.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Enrollment Processing"
            description="Admin enrollment screen showing plan selection, coverage levels, dependents, and confirmation"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 4.4: Coverage Levels */}
      <Card id="ben-sec-4-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 4.4</Badge>
            <Badge variant="secondary" className="text-xs">10 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Users className="h-5 w-5 text-primary" />
            Coverage Level Management
          </CardTitle>
          <CardDescription>
            Employee Only, Employee + Spouse, Employee + Family configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coverage Level</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Who is Covered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Employee Only</TableCell>
                <TableCell>EE</TableCell>
                <TableCell>Employee only</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Employee + Spouse</TableCell>
                <TableCell>ES</TableCell>
                <TableCell>Employee and legal spouse/domestic partner</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Employee + Child(ren)</TableCell>
                <TableCell>EC</TableCell>
                <TableCell>Employee and eligible dependent children</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Employee + Family</TableCell>
                <TableCell>EF</TableCell>
                <TableCell>Employee, spouse, and children</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Dependent Eligibility Rules</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <div>
                <span className="font-medium">Spouse/Domestic Partner:</span>
                <p>Legal spouse or registered domestic partner (documentation may be required)</p>
              </div>
              <div>
                <span className="font-medium">Children:</span>
                <p>Biological, adopted, stepchildren, or legal guardianship up to age 26 (or older if disabled)</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Section 4.5: Dependent Management */}
      <Card id="ben-sec-4-5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 4.5</Badge>
            <Badge variant="secondary" className="text-xs">10 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Dependent Management
          </CardTitle>
          <CardDescription>
            Adding dependents, verification requirements, dependent eligibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Adding Dependents</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                <li>Access employee's Benefits section</li>
                <li>Navigate to Dependents tab</li>
                <li>Click "Add Dependent"</li>
                <li>Enter dependent information (name, DOB, relationship, SSN)</li>
                <li>Upload verification documents if required</li>
                <li>Link dependent to specific benefit enrollments</li>
                <li>Save and submit for verification</li>
              </ol>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Relationship</TableHead>
                <TableHead>Documentation Required</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Spouse</TableCell>
                <TableCell>Marriage certificate</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Domestic Partner</TableCell>
                <TableCell>Domestic partner registration or affidavit</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Biological Child</TableCell>
                <TableCell>Birth certificate</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Adopted Child</TableCell>
                <TableCell>Adoption decree or placement documentation</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Stepchild</TableCell>
                <TableCell>Marriage certificate + child's birth certificate</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Alert className="border-orange-500/20 bg-orange-500/5">
            <CheckCircle2 className="h-4 w-4 text-orange-500" />
            <AlertTitle>Dependent Audit</AlertTitle>
            <AlertDescription>
              Consider conducting annual dependent eligibility audits to verify all covered dependents 
              remain eligible. Ineligible dependents can result in claims issues and compliance risks.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Section 4.6: Auto-Enrollment */}
      <Card id="ben-sec-4-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 4.6</Badge>
            <Badge variant="secondary" className="text-xs">10 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Settings className="h-5 w-5 text-primary" />
            Auto-Enrollment Rules Configuration
          </CardTitle>
          <CardDescription>
            Default enrollment rules, passive enrollment, opt-out policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Auto-enrollment rules automatically enroll employees in specified plans if they don't 
              take action during their enrollment window. This ensures coverage and simplifies 
              administration.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Type</TableHead>
                <TableHead>Behavior</TableHead>
                <TableHead>Use Case</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Default Enrollment</TableCell>
                <TableCell>Enroll in specified plan if no selection made</TableCell>
                <TableCell>Basic life insurance, default medical</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Passive Renewal</TableCell>
                <TableCell>Renew current elections if no changes made</TableCell>
                <TableCell>Open enrollment auto-rollover</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Opt-Out Required</TableCell>
                <TableCell>Enrolled unless employee opts out</TableCell>
                <TableCell>Retirement plans with employer match</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <ScreenshotPlaceholder 
            title="Auto-Enrollment Rules"
            description="Auto-enrollment configuration showing rules, default plans, and trigger conditions"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 4.7: Approval Workflows */}
      <Card id="ben-sec-4-7">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 4.7</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Enrollment Approval Workflows
          </CardTitle>
          <CardDescription>
            Manager approvals, HR review, exception handling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Some organizations require approval workflows for benefit enrollments, particularly 
              for high-value plans or to verify dependent eligibility.
            </p>
          </div>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Workflow Configuration Options</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-muted-foreground">
              <div><strong>No Approval:</strong> Enrollments are active immediately upon submission</div>
              <div><strong>HR Approval:</strong> Benefits admin reviews and approves all enrollments</div>
              <div><strong>Manager + HR:</strong> Manager approves, then HR validates</div>
              <div><strong>Conditional:</strong> Approval required only for specific plans or situations</div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Section 4.8: Waiting Period Tracking */}
      <Card id="ben-sec-4-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 4.8</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Clock className="h-5 w-5 text-primary" />
            Waiting Period Tracking
          </CardTitle>
          <CardDescription>
            Monitoring employees in waiting periods, eligibility notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              The waiting period tracker monitors new hires approaching eligibility and ensures 
              timely communication about enrollment windows.
            </p>
          </div>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Waiting Period Dashboard Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• View all employees currently in waiting periods</li>
                <li>• Filter by eligibility date range</li>
                <li>• See days remaining until eligibility</li>
                <li>• Track notification status</li>
                <li>• Export for outreach planning</li>
              </ul>
            </CardContent>
          </Card>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Automated Notifications</AlertTitle>
            <AlertDescription>
              Configure automatic notifications: 14 days before eligibility (heads up), 
              on eligibility date (enrollment open), 7 days before window closes (reminder), 
              and final day warning.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Waiting Period Tracker"
            description="Dashboard showing employees in waiting periods with eligibility dates and status"
            height="h-40"
          />
        </CardContent>
      </Card>
    </div>
  );
}
