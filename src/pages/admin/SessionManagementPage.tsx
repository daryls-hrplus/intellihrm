import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
  Clock, 
  Shield, 
  Users, 
  Monitor, 
  Smartphone, 
  Globe,
  AlertTriangle,
  Save,
  RefreshCw,
  LogOut
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface SessionSettings {
  idleTimeoutMinutes: number;
  absoluteTimeoutHours: number;
  warningBeforeTimeoutMinutes: number;
  rememberMeDays: number;
  concurrentSessionPolicy: "unlimited" | "single" | "limited" | "device_based";
  maxConcurrentSessions: number;
  enforceDeviceBinding: boolean;
  logoutOnBrowserClose: boolean;
}

interface ActiveSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  startedAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

const defaultSettings: SessionSettings = {
  idleTimeoutMinutes: 30,
  absoluteTimeoutHours: 8,
  warningBeforeTimeoutMinutes: 5,
  rememberMeDays: 30,
  concurrentSessionPolicy: "unlimited",
  maxConcurrentSessions: 5,
  enforceDeviceBinding: false,
  logoutOnBrowserClose: false,
};

// Mock active sessions for demo
const mockActiveSessions: ActiveSession[] = [
  {
    id: "1",
    userId: "user-1",
    userName: "John Smith",
    userEmail: "john.smith@company.com",
    device: "Desktop",
    browser: "Chrome 120",
    ipAddress: "192.168.1.100",
    location: "New York, US",
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    lastActiveAt: new Date(Date.now() - 300000).toISOString(),
    isCurrent: true,
  },
  {
    id: "2",
    userId: "user-2",
    userName: "Jane Doe",
    userEmail: "jane.doe@company.com",
    device: "Mobile",
    browser: "Safari iOS",
    ipAddress: "192.168.1.105",
    location: "Los Angeles, US",
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    lastActiveAt: new Date(Date.now() - 1800000).toISOString(),
    isCurrent: false,
  },
];

export default function SessionManagementPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<SessionSettings>(defaultSettings);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>(mockActiveSessions);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = <K extends keyof SessionSettings>(
    key: K,
    value: SessionSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Save to backend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Session settings saved successfully");
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Session terminated successfully");
    } catch (error) {
      toast.error("Failed to terminate session");
    }
  };

  const handleTerminateAllSessions = async () => {
    try {
      setActiveSessions((prev) => prev.filter((s) => s.isCurrent));
      toast.success("All other sessions terminated");
    } catch (error) {
      toast.error("Failed to terminate sessions");
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes("mobile")) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const breadcrumbItems = [
    { label: "Admin", href: "/admin" },
    { label: "Security", href: "/admin" },
    { label: "Session Management" },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Session Management</h1>
            <p className="text-muted-foreground mt-1">
              Configure session timeouts, concurrent session policies, and manage active sessions
            </p>
          </div>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Security Best Practice</AlertTitle>
          <AlertDescription>
            For systems with sensitive HR data, we recommend an idle timeout of 15-30 minutes 
            and an absolute timeout of 8-12 hours.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Session Timeout Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Session Timeout Settings
              </CardTitle>
              <CardDescription>
                Configure how long sessions remain active
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Idle Timeout (minutes)</Label>
                <Input
                  type="number"
                  min={5}
                  max={120}
                  value={settings.idleTimeoutMinutes}
                  onChange={(e) => handleSettingChange("idleTimeoutMinutes", parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 15-30 minutes for sensitive data
                </p>
              </div>

              <div className="space-y-2">
                <Label>Absolute Timeout (hours)</Label>
                <Input
                  type="number"
                  min={1}
                  max={24}
                  value={settings.absoluteTimeoutHours}
                  onChange={(e) => handleSettingChange("absoluteTimeoutHours", parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum session duration regardless of activity
                </p>
              </div>

              <div className="space-y-2">
                <Label>Warning Before Timeout (minutes)</Label>
                <Input
                  type="number"
                  min={1}
                  max={15}
                  value={settings.warningBeforeTimeoutMinutes}
                  onChange={(e) => handleSettingChange("warningBeforeTimeoutMinutes", parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Remember Me Duration (days)</Label>
                <Input
                  type="number"
                  min={1}
                  max={90}
                  value={settings.rememberMeDays}
                  onChange={(e) => handleSettingChange("rememberMeDays", parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Concurrent Session Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Concurrent Session Policy
              </CardTitle>
              <CardDescription>
                Control how many sessions a user can have active
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Session Policy</Label>
                <Select
                  value={settings.concurrentSessionPolicy}
                  onValueChange={(value: SessionSettings["concurrentSessionPolicy"]) =>
                    handleSettingChange("concurrentSessionPolicy", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlimited">Unlimited Sessions</SelectItem>
                    <SelectItem value="single">Single Session Only</SelectItem>
                    <SelectItem value="limited">Limited Sessions</SelectItem>
                    <SelectItem value="device_based">Device-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.concurrentSessionPolicy === "limited" && (
                <div className="space-y-2">
                  <Label>Maximum Concurrent Sessions</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={settings.maxConcurrentSessions}
                    onChange={(e) => handleSettingChange("maxConcurrentSessions", parseInt(e.target.value))}
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enforce Device Binding</Label>
                  <p className="text-xs text-muted-foreground">
                    Require re-authentication on new devices
                  </p>
                </div>
                <Switch
                  checked={settings.enforceDeviceBinding}
                  onCheckedChange={(checked) => handleSettingChange("enforceDeviceBinding", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Logout on Browser Close</Label>
                  <p className="text-xs text-muted-foreground">
                    End session when browser is closed
                  </p>
                </div>
                <Switch
                  checked={settings.logoutOnBrowserClose}
                  onCheckedChange={(checked) => handleSettingChange("logoutOnBrowserClose", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role-Based Timeout Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Role-Based Timeout Configuration</CardTitle>
            <CardDescription>
              Different roles may require different timeout settings based on sensitivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Idle Timeout</TableHead>
                  <TableHead>Absolute Timeout</TableHead>
                  <TableHead>Rationale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Super Admin</TableCell>
                  <TableCell>15 minutes</TableCell>
                  <TableCell>4 hours</TableCell>
                  <TableCell className="text-muted-foreground">Highest privilege, strictest controls</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">HR Admin</TableCell>
                  <TableCell>20 minutes</TableCell>
                  <TableCell>8 hours</TableCell>
                  <TableCell className="text-muted-foreground">Access to sensitive employee data</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Manager</TableCell>
                  <TableCell>30 minutes</TableCell>
                  <TableCell>10 hours</TableCell>
                  <TableCell className="text-muted-foreground">Team data access, moderate controls</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Employee</TableCell>
                  <TableCell>60 minutes</TableCell>
                  <TableCell>12 hours</TableCell>
                  <TableCell className="text-muted-foreground">Self-service only, standard controls</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Active Sessions
                </CardTitle>
                <CardDescription>
                  View and manage currently active user sessions
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleTerminateAllSessions}
                  disabled={activeSessions.filter(s => !s.isCurrent).length === 0}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Terminate All Others
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{session.userName}</p>
                        <p className="text-xs text-muted-foreground">{session.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(session.device)}
                        <div>
                          <p className="text-sm">{session.device}</p>
                          <p className="text-xs text-muted-foreground">{session.browser}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{session.location}</p>
                        <p className="text-xs text-muted-foreground">{session.ipAddress}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatTimeAgo(session.startedAt)}</TableCell>
                    <TableCell>{formatTimeAgo(session.lastActiveAt)}</TableCell>
                    <TableCell className="text-right">
                      {session.isCurrent ? (
                        <Badge variant="secondary">Current</Badge>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTerminateSession(session.id)}
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Force Logout Warning */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Force Logout Capability</AlertTitle>
          <AlertDescription>
            Administrators have the ability to force logout all users in the event of a security incident. 
            This action should only be used when absolutely necessary as it will disrupt all active users.
          </AlertDescription>
        </Alert>
      </div>
    </AppLayout>
  );
}
