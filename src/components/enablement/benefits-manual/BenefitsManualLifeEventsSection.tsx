import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Heart, 
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import { ScreenshotPlaceholder } from "@/components/enablement/shared/ScreenshotPlaceholder";

export function BenefitsManualLifeEventsSection() {
  return (
    <div className="space-y-8">
      {/* Section 5.1: Life Event Types */}
      <Card id="ben-sec-5-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 5.1</Badge>
            <Badge variant="secondary" className="text-xs">10 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Heart className="h-5 w-5 text-primary" />
            Qualifying Life Event Types
          </CardTitle>
          <CardDescription>
            Marriage, birth, adoption, divorce, loss of coverage, job change events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Qualifying Life Events (QLEs) allow employees to make changes to their benefit 
              elections outside of the annual open enrollment period. Understanding which events 
              qualify and what changes are permitted is essential for proper administration.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Category</TableHead>
                <TableHead>Specific Events</TableHead>
                <TableHead>Permitted Changes</TableHead>
                <TableHead>Window</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Marriage/Partnership</TableCell>
                <TableCell>Marriage, domestic partnership</TableCell>
                <TableCell>Add spouse/partner; change coverage level</TableCell>
                <TableCell>30-60 days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Birth/Adoption</TableCell>
                <TableCell>Birth, adoption, foster placement</TableCell>
                <TableCell>Add child; change to family coverage</TableCell>
                <TableCell>30 days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Divorce/Separation</TableCell>
                <TableCell>Divorce, legal separation, annulment</TableCell>
                <TableCell>Remove spouse; change coverage level</TableCell>
                <TableCell>30-60 days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Death</TableCell>
                <TableCell>Death of dependent</TableCell>
                <TableCell>Remove dependent; change coverage level</TableCell>
                <TableCell>30-60 days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Loss of Coverage</TableCell>
                <TableCell>Spouse loses job/coverage, COBRA ends</TableCell>
                <TableCell>Enroll; add dependents; change plans</TableCell>
                <TableCell>30-60 days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Gain of Coverage</TableCell>
                <TableCell>Spouse gains coverage elsewhere</TableCell>
                <TableCell>Drop coverage; change coverage level</TableCell>
                <TableCell>30 days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Employment Change</TableCell>
                <TableCell>FT to PT, status change</TableCell>
                <TableCell>Dependent on policy; may lose/gain eligibility</TableCell>
                <TableCell>30 days</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Relocation</TableCell>
                <TableCell>Move out of plan service area</TableCell>
                <TableCell>Change to available plan in new area</TableCell>
                <TableCell>60 days</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Alert className="border-blue-500/20 bg-blue-500/5">
            <Lightbulb className="h-4 w-4 text-blue-500" />
            <AlertTitle>Consistency Rule</AlertTitle>
            <AlertDescription>
              IRS regulations require that any benefit election change be <strong>consistent</strong> with 
              the life event. For example, a birth event allows adding a child but not dropping dental coverage 
              (unless part of a consistent plan change).
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Life Event Types Configuration"
            description="Life event setup screen showing event types, window durations, and permitted changes"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 5.2: Recording Life Events */}
      <Card id="ben-sec-5-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 5.2</Badge>
            <Badge variant="secondary" className="text-xs">10 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <FileText className="h-5 w-5 text-primary" />
            Recording Life Events
          </CardTitle>
          <CardDescription>
            Employee self-service submission, HR entry, documentation requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Employee Self-Service</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Employee navigates to Benefits → Life Events</li>
                  <li>Clicks "Report Life Event"</li>
                  <li>Selects event type from list</li>
                  <li>Enters event date</li>
                  <li>Uploads supporting documentation</li>
                  <li>Submits for review</li>
                </ol>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">HR-Initiated Entry</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-muted-foreground">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Navigate to employee record</li>
                  <li>Access Benefits → Life Events</li>
                  <li>Click "Add Life Event"</li>
                  <li>Complete event details</li>
                  <li>Attach documentation</li>
                  <li>Approve or save for review</li>
                </ol>
              </CardContent>
            </Card>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Type</TableHead>
                <TableHead>Required Documentation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Marriage</TableCell>
                <TableCell>Marriage certificate or license</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Birth</TableCell>
                <TableCell>Birth certificate or hospital record</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Adoption</TableCell>
                <TableCell>Adoption decree or placement letter</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Divorce</TableCell>
                <TableCell>Divorce decree or court order</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Loss of Coverage</TableCell>
                <TableCell>Termination letter or COBRA notice</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Death</TableCell>
                <TableCell>Death certificate</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Alert className="border-orange-500/20 bg-orange-500/5">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <AlertTitle>Documentation Requirement</AlertTitle>
            <AlertDescription>
              Always require documentation for life events before approving enrollment changes. 
              Undocumented changes can create compliance issues and claims problems. 
              Set a deadline for documentation submission (typically within 30 days of event approval).
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Life Event Submission"
            description="Employee life event submission form with event details, date picker, and document upload"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 5.3: Special Enrollment Windows */}
      <Card id="ben-sec-5-3">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 5.3</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Calendar className="h-5 w-5 text-primary" />
            Special Enrollment Window Management
          </CardTitle>
          <CardDescription>
            Window duration, deadline tracking, extension handling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Once a life event is approved, a special enrollment window opens for the employee 
              to make benefit changes. Proper window management ensures compliance and timely 
              employee action.
            </p>
          </div>

          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Window Calculation</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p><strong>Example: Birth of Child</strong></p>
              <ul className="mt-2 space-y-1">
                <li>• Event Date: March 15, 2024</li>
                <li>• Window Duration: 30 days</li>
                <li>• Enrollment Deadline: April 14, 2024</li>
                <li>• Coverage Effective: March 15, 2024 (retroactive to event date)</li>
              </ul>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Window Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Open</TableCell>
                <TableCell>Within enrollment window, changes allowed</TableCell>
                <TableCell>Employee can make elections</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Expiring Soon</TableCell>
                <TableCell>Within 7 days of deadline</TableCell>
                <TableCell>Send reminder notifications</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Expired</TableCell>
                <TableCell>Past deadline, no action taken</TableCell>
                <TableCell>Close window, apply defaults</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Extended</TableCell>
                <TableCell>Deadline extended per policy</TableCell>
                <TableCell>Update deadline, notify employee</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>HIPAA Special Enrollment</AlertTitle>
            <AlertDescription>
              HIPAA requires group health plans to allow special enrollment within 30 days for 
              marriage, birth, adoption, or loss of other coverage. The 30-day window is a 
              federal minimum; some plans may offer longer windows.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Section 5.4: Life Event Approval */}
      <Card id="ben-sec-5-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 5.4</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Life Event Approval Workflow
          </CardTitle>
          <CardDescription>
            Documentation review, approval process, enrollment activation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Approval Process Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
                <li>
                  <strong>Receive Life Event Submission</strong>
                  <p className="ml-5 text-xs">Event appears in pending queue</p>
                </li>
                <li>
                  <strong>Review Documentation</strong>
                  <p className="ml-5 text-xs">Verify documentation matches event type and date</p>
                </li>
                <li>
                  <strong>Validate Event Date</strong>
                  <p className="ml-5 text-xs">Confirm submission is within required timeframe</p>
                </li>
                <li>
                  <strong>Approve or Request More Info</strong>
                  <p className="ml-5 text-xs">Approve event or return for additional documentation</p>
                </li>
                <li>
                  <strong>Open Enrollment Window</strong>
                  <p className="ml-5 text-xs">System opens SEP window upon approval</p>
                </li>
                <li>
                  <strong>Notify Employee</strong>
                  <p className="ml-5 text-xs">Confirmation sent with enrollment deadline</p>
                </li>
              </ol>
            </CardContent>
          </Card>

          <ScreenshotPlaceholder 
            title="Life Event Approval Queue"
            description="Admin view showing pending life events with documentation review and approval actions"
            height="h-40"
          />
        </CardContent>
      </Card>

      {/* Section 5.5: Mid-Year Changes */}
      <Card id="ben-sec-5-5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">Section 5.5</Badge>
            <Badge variant="secondary" className="text-xs">8 min read</Badge>
          </div>
          <CardTitle className="flex items-center gap-2 mt-2">
            <Clock className="h-5 w-5 text-primary" />
            Mid-Year Plan Changes
          </CardTitle>
          <CardDescription>
            Permitted changes, effective dates, payroll synchronization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p>
              Mid-year benefit changes resulting from life events require careful handling to 
              ensure correct effective dates and proper payroll deduction adjustments.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Change Type</TableHead>
                <TableHead>Effective Date Rule</TableHead>
                <TableHead>Payroll Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Add Dependent</TableCell>
                <TableCell>Event date (retroactive)</TableCell>
                <TableCell>Adjustment for missed deductions</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Remove Dependent</TableCell>
                <TableCell>Event date or first of next month</TableCell>
                <TableCell>Stop dependent coverage deduction</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">New Enrollment</TableCell>
                <TableCell>Event date or first of next month</TableCell>
                <TableCell>Begin new plan deductions</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Plan Change</TableCell>
                <TableCell>First of month following election</TableCell>
                <TableCell>Adjust to new plan rates</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Alert className="border-blue-500/20 bg-blue-500/5">
            <Clock className="h-4 w-4 text-blue-500" />
            <AlertTitle>Retroactive Changes</AlertTitle>
            <AlertDescription>
              When coverage is effective retroactively (e.g., newborn coverage from birth date), 
              the system calculates missed deductions and applies them in the next pay period. 
              Communicate this to employees to set expectations for larger deductions.
            </AlertDescription>
          </Alert>

          <ScreenshotPlaceholder 
            title="Mid-Year Change Processing"
            description="Enrollment change screen showing effective date options and payroll impact preview"
            height="h-40"
          />
        </CardContent>
      </Card>
    </div>
  );
}
