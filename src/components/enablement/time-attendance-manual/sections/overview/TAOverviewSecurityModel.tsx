import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Shield, Lock, Eye, Edit, CheckCircle, XCircle, 
  AlertTriangle, Database, Key, UserCheck, Users, Settings,
  FileText, History
} from 'lucide-react';
import { LearningObjectives } from '@/components/enablement/manual/components/LearningObjectives';
import { InfoCallout, SecurityCallout, TipCallout } from '@/components/enablement/manual/components/Callout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function TAOverviewSecurityModel() {
  return (
    <Card id="ta-sec-1-8" data-manual-anchor="ta-sec-1-8" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.8</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>12 min read</span>
        </div>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Security & Authorization Model
        </CardTitle>
        <CardDescription>Role-based access control, sensitive operations, and audit trail coverage for T&A</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <LearningObjectives objectives={[
          'Understand the T&A role-based access control (RBAC) model',
          'Identify sensitive operations requiring elevated permissions',
          'Explain audit trail coverage for time-sensitive data',
          'Apply data protection principles for biometric and location data',
        ]} />

        {/* Security Overview */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Security-First Design</h3>
              <p className="text-muted-foreground leading-relaxed">
                Time and Attendance data is highly sensitive—it directly impacts payroll, compliance, and 
                employee trust. Intelli HRM applies enterprise-grade security with role-based access, 
                full audit trails, encrypted biometric storage, and GDPR/NDPR-compliant data handling.
              </p>
            </div>
          </div>
        </div>

        {/* Role Permission Matrix */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Role Permission Matrix
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            The following matrix shows T&A-specific permissions by role. General platform permissions 
            are configured in the Admin & Security module.
          </p>
          
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-medium">Role</TableHead>
                  <TableHead className="text-center">View Punches</TableHead>
                  <TableHead className="text-center">Edit Punches</TableHead>
                  <TableHead className="text-center">Approve OT</TableHead>
                  <TableHead className="text-center">Configure Policies</TableHead>
                  <TableHead className="text-center">View Audit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { 
                    role: 'Employee (ESS)', 
                    icon: Users,
                    viewPunches: 'Own only',
                    editPunches: 'none',
                    approveOT: 'Request',
                    configurePolicies: 'none',
                    viewAudit: 'none' 
                  },
                  { 
                    role: 'Manager (MSS)', 
                    icon: Users,
                    viewPunches: 'Team',
                    editPunches: 'Corrections',
                    approveOT: 'Team',
                    configurePolicies: 'none',
                    viewAudit: 'Team only' 
                  },
                  { 
                    role: 'Time Administrator', 
                    icon: Settings,
                    viewPunches: 'All',
                    editPunches: 'All + Audit',
                    approveOT: 'All',
                    configurePolicies: 'full',
                    viewAudit: 'full' 
                  },
                  { 
                    role: 'Payroll Administrator', 
                    icon: FileText,
                    viewPunches: 'Approved',
                    editPunches: 'none',
                    approveOT: 'View only',
                    configurePolicies: 'none',
                    viewAudit: 'Sync logs' 
                  },
                  { 
                    role: 'Compliance Officer', 
                    icon: Shield,
                    viewPunches: 'All',
                    editPunches: 'none',
                    approveOT: 'View only',
                    configurePolicies: 'View only',
                    viewAudit: 'full' 
                  },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <row.icon className="h-4 w-4 text-muted-foreground" />
                        {row.role}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={row.viewPunches === 'All' ? 'default' : 'outline'} className="text-xs">
                        {row.viewPunches}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {row.editPunches === 'none' ? (
                        <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                      ) : (
                        <Badge variant="outline" className="text-xs">{row.editPunches}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.approveOT === 'none' ? (
                        <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                      ) : (
                        <Badge variant="outline" className="text-xs">{row.approveOT}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.configurePolicies === 'full' ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                      ) : row.configurePolicies === 'none' ? (
                        <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                      ) : (
                        <Badge variant="outline" className="text-xs">{row.configurePolicies}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.viewAudit === 'full' ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                      ) : row.viewAudit === 'none' ? (
                        <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                      ) : (
                        <Badge variant="outline" className="text-xs">{row.viewAudit}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Sensitive Operations */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Sensitive Operations
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            These operations have elevated security requirements due to their impact on payroll, 
            compliance, or data integrity.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                operation: 'Clock Entry Corrections',
                requirement: 'Manager+ with audit log',
                reason: 'Directly affects pay calculation',
                icon: Edit,
                color: 'amber'
              },
              {
                operation: 'Overtime Pre-Approval',
                requirement: 'Manager approval required',
                reason: 'Budget and cost control',
                icon: CheckCircle,
                color: 'blue'
              },
              {
                operation: 'Geofence Radius Changes',
                requirement: 'Time Admin only',
                reason: 'Affects location validation',
                icon: Settings,
                color: 'purple'
              },
              {
                operation: 'Face Match Threshold',
                requirement: 'Time Admin only',
                reason: 'Security vs accessibility balance',
                icon: Key,
                color: 'red'
              },
              {
                operation: 'Payroll Sync Initiation',
                requirement: 'Payroll Admin only',
                reason: 'Financial system integration',
                icon: FileText,
                color: 'green'
              },
              {
                operation: 'Period Finalization',
                requirement: 'Timekeeper+ with lock',
                reason: 'Prevents post-period edits',
                icon: Lock,
                color: 'slate'
              },
            ].map((item, i) => (
              <div key={i} className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-${item.color}-500/10`}>
                    <item.icon className={`h-4 w-4 text-${item.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.operation}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Required:</span> {item.requirement}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Reason:</span> {item.reason}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Trail Coverage */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Audit Trail Coverage
          </h3>
          
          <div className="p-4 border rounded-lg bg-muted/30 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <Database className="h-5 w-5 text-primary" />
              <code className="text-sm font-mono bg-primary/10 px-2 py-1 rounded">
                time_attendance_audit_log
              </code>
            </div>
            <p className="text-sm text-muted-foreground">
              All T&A-related changes are captured in a dedicated audit table with immutable records.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Actions Tracked</TableHead>
                  <TableHead>Retention</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { entity: 'Clock Entries', actions: 'Create, Update, Delete, Corrections', retention: '7 years' },
                  { entity: 'Attendance Exceptions', actions: 'Create, Resolve, Dismiss', retention: '7 years' },
                  { entity: 'Overtime Approvals', actions: 'Request, Approve, Reject, Modify', retention: '7 years' },
                  { entity: 'Timesheet Submissions', actions: 'Submit, Approve, Reject, Recall', retention: '7 years' },
                  { entity: 'Policy Changes', actions: 'Create, Update, Activate, Deactivate', retention: '7 years' },
                  { entity: 'Geofence Configuration', actions: 'Create, Update, Delete, Radius changes', retention: '7 years' },
                  { entity: 'Face Enrollments', actions: 'Enroll, Update, Deactivate', retention: '7 years' },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{row.entity}</TableCell>
                    <TableCell className="text-muted-foreground">{row.actions}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.retention}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <TipCallout title="Audit Log Access" className="mt-4">
            Audit logs are accessible via <strong>Reports → Audit Trail</strong> with filters by 
            date range, entity type, user, and action. Exports available in CSV and PDF formats 
            for compliance audits.
          </TipCallout>
        </div>

        {/* Data Protection */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Data Protection & Privacy
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                type: 'Face Templates',
                protection: 'Encrypted at rest (AES-256)',
                icon: Eye,
                note: 'Templates stored, not images'
              },
              {
                type: 'GPS Coordinates',
                protection: 'Masked in exports',
                icon: Shield,
                note: 'Full coords require admin access'
              },
              {
                type: 'Biometric Data',
                protection: 'GDPR/NDPR compliant',
                icon: Key,
                note: 'Consent-based collection'
              },
            ].map((item, i) => (
              <div key={i} className="p-4 border rounded-lg bg-muted/30">
                <item.icon className="h-5 w-5 text-primary mb-2" />
                <h4 className="font-medium text-sm">{item.type}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.protection}</p>
                <p className="text-xs text-primary mt-1">{item.note}</p>
              </div>
            ))}
          </div>

          <SecurityCallout title="Biometric Data Consent" className="mt-4">
            Face verification requires explicit employee consent. Organizations must configure 
            consent workflows in <strong>Admin → Privacy Settings</strong> before enabling 
            biometric features. Non-consenting employees can use alternative clock methods.
          </SecurityCallout>
        </div>

        {/* Access Control Inheritance */}
        <InfoCallout title="Access Control Inheritance">
          T&A permissions inherit from the global security model. Users must have base 
          module access before role-specific T&A permissions apply. Configure in{' '}
          <strong>Admin → Security → Role Permissions</strong>.
        </InfoCallout>
      </CardContent>
    </Card>
  );
}
