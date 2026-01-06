import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Shield, TrendingUp, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

export function SecurityMonitoringDashboard() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        The Security Monitoring Dashboard provides real-time visibility into authentication metrics,
        access patterns, and potential security threats. Use this dashboard for daily security operations and incident response.
      </p>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Proactive Security Monitoring</AlertTitle>
        <AlertDescription>
          Review the security dashboard daily to identify anomalies before they become incidents.
          Key metrics include failed login rates, unusual access patterns, and compliance status.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h4 className="font-semibold">Dashboard Sections</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Authentication Metrics
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Total logins (24h / 7d / 30d)</li>
              <li>• Failed login attempts</li>
              <li>• MFA adoption rate</li>
              <li>• SSO vs password logins</li>
              <li>• Active sessions count</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Access Patterns
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Login by time of day</li>
              <li>• Geographic distribution</li>
              <li>• Device and browser types</li>
              <li>• Most accessed modules</li>
              <li>• Unusual access alerts</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Key Performance Indicators (KPIs)</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>KPI</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Warning</TableHead>
              <TableHead>Critical</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Failed Login Rate</TableCell>
              <TableCell className="text-green-500">{"< 2%"}</TableCell>
              <TableCell className="text-yellow-500">2-5%</TableCell>
              <TableCell className="text-red-500">{"> 5%"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">MFA Adoption</TableCell>
              <TableCell className="text-green-500">{"> 95%"}</TableCell>
              <TableCell className="text-yellow-500">80-95%</TableCell>
              <TableCell className="text-red-500">{"< 80%"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Password Expiry Compliance</TableCell>
              <TableCell className="text-green-500">{"> 98%"}</TableCell>
              <TableCell className="text-yellow-500">90-98%</TableCell>
              <TableCell className="text-red-500">{"< 90%"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Access Review Completion</TableCell>
              <TableCell className="text-green-500">100%</TableCell>
              <TableCell className="text-yellow-500">90-99%</TableCell>
              <TableCell className="text-red-500">{"< 90%"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Orphaned Accounts</TableCell>
              <TableCell className="text-green-500">0</TableCell>
              <TableCell className="text-yellow-500">1-5</TableCell>
              <TableCell className="text-red-500">{"> 5"}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Compliance Indicators</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              SOC 2 Controls
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Access control effectiveness</li>
              <li>• Audit log completeness</li>
              <li>• Incident response readiness</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              GDPR Compliance
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Data access logging</li>
              <li>• Consent management status</li>
              <li>• DSAR response times</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              ISO 27001
            </h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Control effectiveness</li>
              <li>• Risk assessment status</li>
              <li>• Security incident trends</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Alert Management</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alert Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Action Required</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <Badge className="bg-red-500">Active Alerts</Badge>
              </TableCell>
              <TableCell>Unacknowledged security events requiring attention</TableCell>
              <TableCell>Review and acknowledge within SLA</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Badge className="bg-yellow-500">Pending Investigation</Badge>
              </TableCell>
              <TableCell>Acknowledged alerts under review</TableCell>
              <TableCell>Complete investigation and document findings</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Badge className="bg-green-500">Resolved</Badge>
              </TableCell>
              <TableCell>Closed alerts with documented resolution</TableCell>
              <TableCell>None - available for audit review</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Daily Review Checklist</AlertTitle>
        <AlertDescription>
          Security Admins should review the dashboard daily: Check active alerts, review failed login trends,
          verify MFA compliance, and confirm no unauthorized access patterns. Document reviews in the compliance log.
        </AlertDescription>
      </Alert>
    </div>
  );
}
