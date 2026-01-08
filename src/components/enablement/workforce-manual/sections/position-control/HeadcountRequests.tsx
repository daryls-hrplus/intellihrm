import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  ArrowRight, 
  CheckCircle, 
  XCircle,
  Clock,
  Shield,
  Users,
  DollarSign,
  AlertTriangle,
  History,
  PenLine
} from "lucide-react";
import { LearningObjectives } from "../lifecycle-workflows/LearningObjectives";
import { ScreenshotPlaceholder } from "@/components/enablement/manual/components/ScreenshotPlaceholder";

export function HeadcountRequests() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-primary pl-6">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline">Section 6.3</Badge>
          <Badge variant="secondary">Estimated: 12 min</Badge>
          <Badge>Procedure</Badge>
        </div>
        <h2 className="text-2xl font-bold">Headcount Requests</h2>
        <p className="text-muted-foreground mt-2">
          Request workflow for new positions, backfills, and headcount changes
        </p>
      </div>

      <LearningObjectives
        items={[
          "Create headcount change requests",
          "Understand approval routing logic",
          "Track request status and history",
          "Manage governance body approvals"
        ]}
      />

      {/* Request Workflow Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Headcount Request Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Headcount requests formalize the process of increasing or decreasing authorized 
            positions. Each request follows an approval workflow that may involve managers, 
            HR, finance, and governance bodies.
          </p>
          <div className="p-4 border rounded-lg bg-muted/30">
            <h4 className="font-semibold mb-3">Navigation</h4>
            <code className="text-sm bg-muted px-2 py-1 rounded">
              Workforce → Headcount Requests
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Request Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Request Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <Badge className="bg-green-500">Headcount Increase</Badge>
              <h4 className="font-semibold">New Position / Expansion</h4>
              <p className="text-sm text-muted-foreground">
                Request to increase authorized headcount for a position. May be for 
                business growth, new projects, or workload distribution.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Budget justification required</li>
                <li>• Manager + HR + Finance approval</li>
                <li>• May require Board/Executive approval</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <Badge variant="secondary">Backfill Request</Badge>
              <h4 className="font-semibold">Replacement Hire</h4>
              <p className="text-sm text-muted-foreground">
                Request to fill a vacancy created by termination, resignation, or 
                internal transfer. Maintains current headcount level.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Simpler approval process</li>
                <li>• Manager + HR approval typically</li>
                <li>• Faster turnaround expected</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <Badge variant="destructive">Headcount Reduction</Badge>
              <h4 className="font-semibold">Position Elimination</h4>
              <p className="text-sm text-muted-foreground">
                Request to reduce authorized headcount. May occur during restructuring, 
                budget cuts, or role consolidation.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Impact analysis required</li>
                <li>• HR + Legal review</li>
                <li>• Transition plan for affected employees</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg space-y-2">
              <Badge variant="outline">Temporary Increase</Badge>
              <h4 className="font-semibold">Seasonal / Project-Based</h4>
              <p className="text-sm text-muted-foreground">
                Time-limited headcount increase for seasonal demand or specific projects. 
                Includes defined end date.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• End date specification required</li>
                <li>• Budget allocation per period</li>
                <li>• Auto-reduction at end date</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Creating a Request */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenLine className="h-5 w-5 text-primary" />
            Creating a Headcount Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
              <div className="flex-1">
                <h4 className="font-semibold">Select Position</h4>
                <p className="text-sm text-muted-foreground">
                  Choose the position for which you want to change headcount. System shows 
                  current authorized count and filled count.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
              <div className="flex-1">
                <h4 className="font-semibold">Specify Change</h4>
                <p className="text-sm text-muted-foreground">
                  Enter the requested new headcount number. System calculates the delta 
                  (increase/decrease) automatically.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
              <div className="flex-1">
                <h4 className="font-semibold">Provide Justification</h4>
                <p className="text-sm text-muted-foreground">
                  Document business reason for the change. This is required for audit trail 
                  and helps approvers make informed decisions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</div>
              <div className="flex-1">
                <h4 className="font-semibold">Select Governance Body (Optional)</h4>
                <p className="text-sm text-muted-foreground">
                  For requests requiring board/committee approval, select the appropriate 
                  governance body. Their signature will be required.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">5</div>
              <div className="flex-1">
                <h4 className="font-semibold">Submit Request</h4>
                <p className="text-sm text-muted-foreground">
                  Request enters pending status and notifications are sent to approvers. 
                  You can track status in the requests list.
                </p>
              </div>
            </div>
          </div>
          <ScreenshotPlaceholder
            caption="Figure 6.3a: Headcount request creation form with position selection and justification"
            alt="New headcount request form showing all required fields"
          />
        </CardContent>
      </Card>

      {/* Approval Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Approval Routing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Requests are routed based on configurable rules that consider request type, 
            headcount delta, budget impact, and organizational level.
          </p>
          <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-lg">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Pending
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" /> Under Review
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge className="bg-green-500 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> Approved
            </Badge>
            <span className="text-muted-foreground mx-2">or</span>
            <Badge variant="destructive" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" /> Rejected
            </Badge>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Standard Approval (1-2 headcount)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>1. Department Manager</li>
                <li>2. HR Partner</li>
                <li>3. Auto-approved on completion</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Extended Approval (3+ headcount)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>1. Department Manager</li>
                <li>2. HR Partner</li>
                <li>3. Finance Review</li>
                <li>4. Executive / Governance Body</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Governance Body Signatures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenLine className="h-5 w-5 text-primary" />
            Digital Signatures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Approvers provide digital signatures as part of the approval process. Each 
            signature is timestamped, hashed, and recorded in the audit trail.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Signature Type</th>
                  <th className="text-left py-2 font-medium">Description</th>
                  <th className="text-center py-2 font-medium">Required</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Manager Approval</td>
                  <td className="text-muted-foreground">Requesting manager signs off</td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">HR Approval</td>
                  <td className="text-muted-foreground">HR validates compliance and policy</td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Finance Approval</td>
                  <td className="text-muted-foreground">Budget verification</td>
                  <td className="text-center"><Badge variant="outline">Conditional</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Governance Body</td>
                  <td className="text-muted-foreground">Board/Committee endorsement</td>
                  <td className="text-center"><Badge variant="outline">Optional</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Status History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Request History & Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Every action on a headcount request is logged with timestamp, actor, and notes. 
            This provides complete audit trail for compliance and review.
          </p>
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="font-medium">Jan 15, 2024 09:32 AM</span>
                <span className="text-muted-foreground"> – Request submitted by John Smith</span>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="font-medium">Jan 16, 2024 02:15 PM</span>
                <span className="text-muted-foreground"> – Approved by Sarah Manager</span>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="font-medium">Jan 17, 2024 10:45 AM</span>
                <span className="text-muted-foreground"> – Approved by HR (Maria Garcia)</span>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <span className="font-medium">Jan 17, 2024 10:45 AM</span>
                <span className="text-muted-foreground"> – Request fully approved, headcount updated</span>
              </div>
            </div>
          </div>
          <ScreenshotPlaceholder
            caption="Figure 6.3b: Request history and audit trail with timestamped approvals"
            alt="Headcount request audit trail showing approval workflow progression"
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Industry Context */}
      <Card className="border-border bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Industry Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Frequency:</span>
              <p className="text-muted-foreground">As needed, quarterly budget cycles</p>
            </div>
            <div>
              <span className="font-medium">Benchmark:</span>
              <p className="text-muted-foreground">Approval SLA &lt; 5 business days</p>
            </div>
            <div>
              <span className="font-medium">Compliance:</span>
              <p className="text-muted-foreground">SOX, internal controls, budget governance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
