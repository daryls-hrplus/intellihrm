import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, FileDown, Clock, AlertTriangle } from "lucide-react";
import { PII_DOMAINS, ADMIN_CONTAINERS } from "@/types/roles";

export function AccessPoliciesTab() {
  const [defaultPiiLevel, setDefaultPiiLevel] = useState<string>("none");
  const [requireMfaForPii, setRequireMfaForPii] = useState(false);
  const [logPiiAccess, setLogPiiAccess] = useState(true);
  const [logExports, setLogExports] = useState(true);
  const [logPermissionChanges, setLogPermissionChanges] = useState(true);
  const [defaultExportPermission, setDefaultExportPermission] = useState("none");
  const [sessionTimeout, setSessionTimeout] = useState("30");

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        <p>
          Configure global access policies for sensitive data, admin permissions, and audit rules.
          These policies apply across all roles unless explicitly overridden.
        </p>
      </div>

      {/* PII Access Policies */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">PII Access Policies</CardTitle>
          </div>
          <CardDescription>
            Configure how sensitive personal data is protected across the organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Default PII Level for New Roles</Label>
              <Select value={defaultPiiLevel} onValueChange={setDefaultPiiLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None - No PII access by default</SelectItem>
                  <SelectItem value="limited">Limited - Masked access only</SelectItem>
                  <SelectItem value="full">Full - Complete access (not recommended)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Default Export Permission</Label>
              <Select value={defaultExportPermission} onValueChange={setDefaultExportPermission}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Disabled</SelectItem>
                  <SelectItem value="approval_required">Requires Approval</SelectItem>
                  <SelectItem value="allowed">Allowed (not recommended)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Protected Data Domains</h4>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {PII_DOMAINS.map((domain) => (
                <div
                  key={domain.code}
                  className="flex items-center justify-between rounded-md border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{domain.label}</p>
                    <p className="text-xs text-muted-foreground">{domain.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600">
                    Protected
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Require MFA for Full PII Access</Label>
              <p className="text-sm text-muted-foreground">
                Users must re-authenticate with MFA to view unmasked PII data
              </p>
            </div>
            <Switch checked={requireMfaForPii} onCheckedChange={setRequireMfaForPii} />
          </div>
        </CardContent>
      </Card>

      {/* Admin & Insights Policies */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Admin & Insights Policies</CardTitle>
          </div>
          <CardDescription>
            Configure access rules for administrative containers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {ADMIN_CONTAINERS.map((container) => (
              <div
                key={container.code}
                className="rounded-md border p-3"
              >
                <p className="text-sm font-medium">{container.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{container.description}</p>
              </div>
            ))}
          </div>

          <div className="rounded-md bg-muted/50 p-4 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium">Important Rule</p>
                <p className="text-muted-foreground">
                  Admin container access does not automatically grant PII access. Users need explicit
                  PII permissions to view sensitive data even within administrative contexts.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit & Logging Policies */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">Audit & Logging Policies</CardTitle>
          </div>
          <CardDescription>
            Configure what actions are logged for compliance and security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Log PII Access Events</Label>
                <p className="text-sm text-muted-foreground">
                  Record all attempts to view, access, or export PII data
                </p>
              </div>
              <Switch checked={logPiiAccess} onCheckedChange={setLogPiiAccess} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Log Data Exports</Label>
                <p className="text-sm text-muted-foreground">
                  Record all data export operations with user and content details
                </p>
              </div>
              <Switch checked={logExports} onCheckedChange={setLogExports} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Log Permission Changes</Label>
                <p className="text-sm text-muted-foreground">
                  Record all role and permission modifications
                </p>
              </div>
              <Switch checked={logPermissionChanges} onCheckedChange={setLogPermissionChanges} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session & Security Policies */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">Session Policies</CardTitle>
          </div>
          <CardDescription>
            Configure session timeout and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Idle Session Timeout (minutes)</Label>
            <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Users will be logged out after this period of inactivity
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
