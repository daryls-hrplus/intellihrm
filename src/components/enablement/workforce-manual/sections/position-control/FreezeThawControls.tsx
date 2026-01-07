import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Snowflake, 
  Sun,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Building2,
  Users,
  Clock,
  Settings,
  Lock
} from "lucide-react";
import { LearningObjectives } from "../lifecycle-workflows/LearningObjectives";

export function FreezeThawControls() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-primary pl-6">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline">Section 6.8</Badge>
          <Badge variant="secondary">Estimated: 8 min</Badge>
          <Badge>Governance</Badge>
        </div>
        <h2 className="text-2xl font-bold">Freeze & Thaw Controls</h2>
        <p className="text-muted-foreground mt-2">
          Implementing hiring freezes with exceptions and org-wide controls
        </p>
      </div>

      <LearningObjectives
        items={[
          "Understand freeze types and their impact",
          "Configure organization-wide hiring controls",
          "Manage exception requests during freezes",
          "Implement thaw procedures"
        ]}
      />

      {/* Freeze Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-blue-500" />
            Hiring Freeze Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg border-blue-500/30 bg-blue-50 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Snowflake className="h-5 w-5 text-blue-500" />
                <h4 className="font-semibold">Soft Freeze</h4>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Backfills allowed</li>
                <li>• New positions blocked</li>
                <li>• Critical roles may be excepted</li>
              </ul>
              <Badge variant="outline" className="mt-3 text-blue-600">Most Common</Badge>
            </div>
            <div className="p-4 border rounded-lg border-blue-700/30 bg-blue-100 dark:bg-blue-900/20">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-5 w-5 text-blue-700" />
                <h4 className="font-semibold">Hard Freeze</h4>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• All hiring stopped</li>
                <li>• No backfills</li>
                <li>• Executive approval for any hire</li>
              </ul>
              <Badge variant="outline" className="mt-3 text-blue-700">Emergency Use</Badge>
            </div>
            <div className="p-4 border rounded-lg border-purple-500/30 bg-purple-50 dark:bg-purple-950/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <h4 className="font-semibold">Strategic Freeze</h4>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Selected departments frozen</li>
                <li>• Revenue roles exempt</li>
                <li>• Targeted cost control</li>
              </ul>
              <Badge variant="outline" className="mt-3 text-purple-600">Targeted</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuring a Freeze */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Configuring a Hiring Freeze
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Hiring freezes are configured at the company or department level and 
              immediately impact headcount request processing.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                <div className="flex-1">
                  <h4 className="font-semibold">Select Freeze Scope</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose whether freeze applies to entire company, specific divisions, 
                    departments, or job families.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                <div className="flex-1">
                  <h4 className="font-semibold">Set Freeze Type</h4>
                  <p className="text-sm text-muted-foreground">
                    Select soft, hard, or strategic freeze. Configure what types of 
                    requests are blocked vs allowed.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                <div className="flex-1">
                  <h4 className="font-semibold">Define Duration</h4>
                  <p className="text-sm text-muted-foreground">
                    Set start and end dates, or configure as indefinite until manually 
                    lifted. System tracks freeze duration.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</div>
                <div className="flex-1">
                  <h4 className="font-semibold">Configure Exceptions</h4>
                  <p className="text-sm text-muted-foreground">
                    Specify which roles, job levels, or departments are exempt from 
                    freeze. Define exception approval workflow.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">5</div>
                <div className="flex-1">
                  <h4 className="font-semibold">Communicate & Activate</h4>
                  <p className="text-sm text-muted-foreground">
                    System sends notifications to HR and managers. Freeze takes effect 
                    immediately upon activation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Behavior During Freeze */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            System Behavior During Freeze
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Action</th>
                  <th className="text-center py-2 font-medium">Soft Freeze</th>
                  <th className="text-center py-2 font-medium">Hard Freeze</th>
                  <th className="text-center py-2 font-medium">Strategic Freeze</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">New headcount requests</td>
                  <td className="text-center"><XCircle className="h-4 w-4 text-red-500 mx-auto" /></td>
                  <td className="text-center"><XCircle className="h-4 w-4 text-red-500 mx-auto" /></td>
                  <td className="text-center"><Badge variant="outline">Per scope</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Backfill requests</td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                  <td className="text-center"><XCircle className="h-4 w-4 text-red-500 mx-auto" /></td>
                  <td className="text-center"><Badge variant="outline">Per scope</Badge></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Internal transfers</td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Exception requests</td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-amber-500 mx-auto" /></td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Requisition creation</td>
                  <td className="text-center"><XCircle className="h-4 w-4 text-red-500 mx-auto" /></td>
                  <td className="text-center"><XCircle className="h-4 w-4 text-red-500 mx-auto" /></td>
                  <td className="text-center"><Badge variant="outline">Per scope</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
              User Experience
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              When users attempt blocked actions during a freeze, they see a clear 
              message explaining the freeze is active, its scope, and how to request 
              an exception if needed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Exception Workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Exception Request Workflow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Critical business needs may require exceptions to hiring freezes. 
            Configure a separate approval workflow for exception requests.
          </p>
          <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
            <h4 className="font-semibold">Exception Request Fields</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <strong>Position:</strong> Which role requires exception</li>
              <li>• <strong>Business Justification:</strong> Why hire is critical now</li>
              <li>• <strong>Impact if Delayed:</strong> Risk of not filling</li>
              <li>• <strong>Alternative Options:</strong> What was considered instead</li>
              <li>• <strong>Sponsoring Executive:</strong> Who is championing the request</li>
            </ul>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Exception Approvers</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>1. CHRO / HR Leader</li>
                <li>2. CFO (if above threshold)</li>
                <li>3. CEO / Executive Committee</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Typical SLA</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Submission: Immediate</li>
                <li>• HR Review: 24-48 hours</li>
                <li>• Executive Decision: 48-72 hours</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thaw Process */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-500" />
            Thaw Process
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            When business conditions improve, freezes can be lifted (thawed) either 
            automatically at the configured end date or manually by authorized users.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Scheduled Thaw</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Freeze automatically lifts at the configured end date. Notifications 
                sent to HR and managers 7 days before thaw.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Manual Thaw</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Authorized users (typically CHRO or CEO) can lift freeze early. 
                Requires documented justification.
              </p>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              Phased Thaw Option
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              For gradual return to normal hiring, configure a phased thaw that 
              progressively loosens restrictions over time (e.g., Week 1: critical 
              roles only → Week 3: backfills allowed → Week 5: all hiring open).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Audit & Reporting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Freeze History & Reporting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            All freeze/thaw events and exception decisions are logged for compliance 
            and analysis.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Event</th>
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Scope</th>
                  <th className="text-left py-2 font-medium">Action By</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">
                    <Badge className="bg-blue-500">Freeze Activated</Badge>
                  </td>
                  <td className="text-muted-foreground">Jan 5, 2024</td>
                  <td className="text-muted-foreground">All Departments</td>
                  <td className="text-muted-foreground">CFO (Budget Review)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">
                    <Badge variant="outline">Exception Approved</Badge>
                  </td>
                  <td className="text-muted-foreground">Jan 12, 2024</td>
                  <td className="text-muted-foreground">Sr. Engineer</td>
                  <td className="text-muted-foreground">CHRO</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">
                    <Badge variant="outline" className="text-red-600">Exception Denied</Badge>
                  </td>
                  <td className="text-muted-foreground">Jan 18, 2024</td>
                  <td className="text-muted-foreground">Marketing Mgr</td>
                  <td className="text-muted-foreground">CHRO</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">
                    <Badge className="bg-amber-500">Thaw Initiated</Badge>
                  </td>
                  <td className="text-muted-foreground">Mar 1, 2024</td>
                  <td className="text-muted-foreground">All Departments</td>
                  <td className="text-muted-foreground">CEO</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Industry Context */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Industry Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Frequency:</span>
              <p className="text-muted-foreground">Economic downturns, budget cycles, M&A</p>
            </div>
            <div>
              <span className="font-medium">Benchmark:</span>
              <p className="text-muted-foreground">Enterprise-wide governance controls</p>
            </div>
            <div>
              <span className="font-medium">Compliance:</span>
              <p className="text-muted-foreground">Board-level reporting, SOX controls</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
