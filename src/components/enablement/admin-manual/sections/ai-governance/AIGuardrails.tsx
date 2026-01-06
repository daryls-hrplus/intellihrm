import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Lock, AlertTriangle, UserX } from 'lucide-react';
import { ScreenshotPlaceholder } from '../../../manual/components';

export function AIGuardrails() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        AI Guardrails are safety mechanisms that ensure AI responses remain appropriate, secure, and aligned with 
        organizational policies. Configure these settings to maintain control over AI behavior and outputs.
      </p>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Defense in Depth</AlertTitle>
        <AlertDescription>
          Guardrails operate at multiple levels: input validation, context filtering, output sanitization, 
          and human-in-the-loop checkpoints for high-risk decisions.
        </AlertDescription>
      </Alert>

      <ScreenshotPlaceholder
        caption="Figure 6.2.1: AI Guardrails configuration dashboard"
        alt="Guardrails settings page showing role security, PII protection, and escalation rules"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold">Role-Based Security</h4>
        <p className="text-sm text-muted-foreground">
          AI responses are filtered based on user roles. Users only receive information relevant to their access level.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Level</TableHead>
              <TableHead>AI Access</TableHead>
              <TableHead>Data Visibility</TableHead>
              <TableHead>Action Permissions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Employee</TableCell>
              <TableCell>Own data only</TableCell>
              <TableCell>Personal records, team info</TableCell>
              <TableCell>View, request</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Manager</TableCell>
              <TableCell>Team data</TableCell>
              <TableCell>Direct reports, department</TableCell>
              <TableCell>View, approve, recommend</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">HR Admin</TableCell>
              <TableCell>Company-wide</TableCell>
              <TableCell>All employee data</TableCell>
              <TableCell>Full CRUD, analytics</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Super Admin</TableCell>
              <TableCell>Full access</TableCell>
              <TableCell>All data + audit logs</TableCell>
              <TableCell>All actions + configuration</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <Lock className="h-4 w-4" />
          PII Protection
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium">Detection Rules</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Social Security/National ID numbers</li>
              <li>• Bank account and routing numbers</li>
              <li>• Salary and compensation details</li>
              <li>• Medical and health information</li>
              <li>• Personal contact information</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h5 className="font-medium">Protection Actions</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Automatic redaction in responses</li>
              <li>• Access logging for audit trail</li>
              <li>• Manager approval for bulk access</li>
              <li>• Encryption at rest and in transit</li>
              <li>• Data masking in non-production</li>
            </ul>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 6.2.2: PII detection and protection settings"
        alt="Configuration panel for PII detection rules and automated protection actions"
        aspectRatio="wide"
      />

      <div className="space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <UserX className="h-4 w-4" />
          Escalation Rules
        </h4>
        <p className="text-sm text-muted-foreground">
          Define when AI interactions should be escalated to human reviewers.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trigger</TableHead>
              <TableHead>Escalation Path</TableHead>
              <TableHead>Response Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Termination discussion</TableCell>
              <TableCell>HR Business Partner</TableCell>
              <TableCell>Immediate</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Legal/compliance query</TableCell>
              <TableCell>Legal Team</TableCell>
              <TableCell>Within 4 hours</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Harassment/discrimination</TableCell>
              <TableCell>HR Director</TableCell>
              <TableCell>Immediate</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Compensation dispute</TableCell>
              <TableCell>Compensation Manager</TableCell>
              <TableCell>Within 24 hours</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Critical Actions Require Approval</AlertTitle>
        <AlertDescription>
          AI can suggest but never automatically execute actions affecting employment status, compensation, 
          or legal matters. Human approval is always required for these decisions.
        </AlertDescription>
      </Alert>
    </div>
  );
}
