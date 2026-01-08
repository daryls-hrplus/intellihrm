import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileEdit, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Eye,
  Filter,
  FileText,
  Users,
  Shield,
  Bell,
  BarChart3,
  Settings,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { 
  InfoCallout, 
  TipCallout, 
  WarningCallout,
  SuccessCallout 
} from '@/components/enablement/manual/components';

export function ESSChangeRequestsSetup() {
  return (
    <div className="space-y-8">
      {/* Introduction */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileEdit className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <CardTitle>ESS Change Requests</CardTitle>
                <Badge variant="outline" className="text-xs">Section 6.2</Badge>
                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Clock className="h-3 w-3" />
                  <span>~15 min</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Employee Self-Service data change requests with approval workflows
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            ESS Change Requests enable employees to submit data updates through self-service 
            portals while maintaining data integrity through configurable approval workflows. 
            HR reviews, compares changes, and approves or rejects requests with full audit trails.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <FileEdit className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-blue-700 dark:text-blue-300">Self-Service</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Employee-initiated data change requests
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-amber-500" />
                <span className="font-medium text-amber-700 dark:text-amber-300">Controlled</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Approval workflows by data type
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-green-500" />
                <span className="font-medium text-green-700 dark:text-green-300">Transparent</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Compare current vs. proposed values
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <span className="font-medium text-purple-700 dark:text-purple-300">Tracked</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Full audit trail and metrics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Request Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Employees can submit change requests for the following data types through the ESS portal:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { type: 'Personal Contact', desc: 'Phone, email, preferred contact method', risk: 'low' },
              { type: 'Emergency Contact', desc: 'Emergency contact persons and details', risk: 'low' },
              { type: 'Address', desc: 'Home address, mailing address changes', risk: 'medium' },
              { type: 'Banking', desc: 'Bank account for salary deposits', risk: 'high' },
              { type: 'Name Change', desc: 'Legal name updates with documentation', risk: 'high' },
              { type: 'Dependents', desc: 'Add/update dependent information', risk: 'medium' },
              { type: 'Government ID', desc: 'Tax ID, SSN, TRN updates', risk: 'high' },
              { type: 'Medical Info', desc: 'Blood type, allergies, conditions', risk: 'medium' },
              { type: 'Marital Status', desc: 'Marriage, divorce status changes', risk: 'medium' },
              { type: 'Qualifications', desc: 'Degrees, certifications, licenses', risk: 'low' }
            ].map((item) => (
              <div key={item.type} className="p-3 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{item.type}</span>
                  <Badge variant={item.risk === 'high' ? 'destructive' : item.risk === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                    {item.risk} risk
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <WarningCallout title="High-Risk Changes">
            Banking details, government IDs, and name changes are flagged as high-risk and 
            always require HR approval with supporting documentation verification.
          </WarningCallout>
        </CardContent>
      </Card>

      {/* Request Lifecycle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Request Lifecycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/30 rounded-lg">
            <Badge className="bg-blue-500">Submitted</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge className="bg-amber-500">Pending Review</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500">Approved</Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <Badge className="bg-primary">Applied</Badge>
              </div>
              <span className="text-xs text-muted-foreground px-1">or</span>
              <Badge variant="destructive">Rejected</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-3">
              <h5 className="font-medium">Status Definitions</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Badge className="bg-blue-500 mt-0.5">Submitted</Badge>
                  <span className="text-muted-foreground">Employee has submitted request, awaiting HR pickup</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-amber-500 mt-0.5">Pending</Badge>
                  <span className="text-muted-foreground">HR is reviewing; may request additional info</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-green-500 mt-0.5">Approved</Badge>
                  <span className="text-muted-foreground">HR approved; changes will be applied</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="mt-0.5">Rejected</Badge>
                  <span className="text-muted-foreground">HR declined with reason provided to employee</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium">SLA Tracking</h5>
              <div className="p-3 rounded-lg border bg-card">
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Target review time: 48 hours
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Overdue indicator after 48 hours
                  </li>
                  <li className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    Escalation notification at 72 hours
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Metrics Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The ESS Change Requests dashboard provides real-time metrics to monitor 
            request volumes and processing efficiency:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border bg-card text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-amber-500" />
              <div className="text-2xl font-bold text-amber-600">—</div>
              <span className="text-xs text-muted-foreground">Pending Requests</span>
            </div>
            <div className="p-4 rounded-lg border bg-card text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold text-red-600">—</div>
              <span className="text-xs text-muted-foreground">Overdue (&gt;48h)</span>
            </div>
            <div className="p-4 rounded-lg border bg-card text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600">—</div>
              <span className="text-xs text-muted-foreground">Completed Today</span>
            </div>
            <div className="p-4 rounded-lg border bg-card text-center">
              <FileText className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-blue-600">—</div>
              <span className="text-xs text-muted-foreground">With Documents</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Queue Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filters & Queue Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use filters to efficiently manage the request queue and prioritize work:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Status Filter</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All requests</li>
                <li>• Pending only</li>
                <li>• Approved</li>
                <li>• Rejected</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Type Filter</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Personal contact</li>
                <li>• Banking</li>
                <li>• Address</li>
                <li>• And more...</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-2">Search</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Employee name</li>
                <li>• Employee ID</li>
                <li>• Request details</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Review Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View Details
              </h5>
              <p className="text-sm text-muted-foreground mb-2">
                Opens a side-by-side comparison showing:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Current values (what's in the system)</li>
                <li>Proposed values (what employee requested)</li>
                <li>Changed fields highlighted</li>
                <li>Attached supporting documents</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Approve Request
              </h5>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Review current vs. proposed values</li>
                <li>Verify any supporting documents</li>
                <li>Add optional approval notes</li>
                <li>Click "Approve" to apply changes</li>
                <li>Employee notified automatically</li>
              </ol>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Reject Request
              </h5>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Review the request details</li>
                <li>Enter rejection reason (required)</li>
                <li>Click "Reject"</li>
                <li>Employee notified with reason</li>
              </ol>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                Request Information
              </h5>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Click "Request Info" button</li>
                <li>Enter what additional info is needed</li>
                <li>Request status changes to "Info Requested"</li>
                <li>Employee notified to provide details</li>
              </ol>
            </div>
          </div>

          <TipCallout title="Bulk Actions">
            Select multiple low-risk requests (like phone number updates) and approve 
            them in bulk to improve processing efficiency.
          </TipCallout>
        </CardContent>
      </Card>

      {/* Approval Policies Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Approval Policy Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            ESS Change Request approval modes are configured in the Compliance & Workflows chapter 
            (Section 3.5: ESS Approval Policies). Each request type can be set to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
              <h5 className="font-medium text-green-700 dark:text-green-300 mb-1">Auto-Approve</h5>
              <p className="text-xs text-muted-foreground">Changes applied immediately without HR review</p>
            </div>
            <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <h5 className="font-medium text-amber-700 dark:text-amber-300 mb-1">Requires Approval</h5>
              <p className="text-xs text-muted-foreground">HR must review and approve before applying</p>
            </div>
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
              <h5 className="font-medium text-red-700 dark:text-red-300 mb-1">Disabled</h5>
              <p className="text-xs text-muted-foreground">Employees cannot self-request this change type</p>
            </div>
          </div>

          <InfoCallout title="Cross-Reference">
            See Chapter 3, Section 3.5 "ESS Approval Policies" to configure which request 
            types require approval and set up auto-approve rules for low-risk changes.
          </InfoCallout>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The system sends automatic notifications at each stage of the request lifecycle:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Event</th>
                  <th className="text-left py-2 px-3 font-medium">Recipient</th>
                  <th className="text-left py-2 px-3 font-medium">Content</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-2 px-3 font-medium">Request Submitted</td>
                  <td className="py-2 px-3 text-muted-foreground">HR Team</td>
                  <td className="py-2 px-3 text-muted-foreground">New request pending review</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Request Approved</td>
                  <td className="py-2 px-3 text-muted-foreground">Employee</td>
                  <td className="py-2 px-3 text-muted-foreground">Your request has been approved</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Request Rejected</td>
                  <td className="py-2 px-3 text-muted-foreground">Employee</td>
                  <td className="py-2 px-3 text-muted-foreground">Request declined with reason</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Info Requested</td>
                  <td className="py-2 px-3 text-muted-foreground">Employee</td>
                  <td className="py-2 px-3 text-muted-foreground">Additional information needed</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Request Overdue</td>
                  <td className="py-2 px-3 text-muted-foreground">HR Manager</td>
                  <td className="py-2 px-3 text-muted-foreground">Escalation: request pending &gt;48h</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
