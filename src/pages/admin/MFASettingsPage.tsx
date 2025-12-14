import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Shield, Users, ShieldCheck, ShieldOff, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MFASettings {
  id?: string;
  company_id: string;
  is_mfa_enabled: boolean;
  is_mfa_required: boolean;
  allowed_factors: string[];
  grace_period_days: number;
}

interface UserMFAStatus {
  user_id: string;
  is_enrolled: boolean;
  enrolled_at: string | null;
  last_verified_at: string | null;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

export default function MFASettingsPage() {
  const { t } = useTranslation();
  const { company, isAdmin } = useAuth();
  const [settings, setSettings] = useState<MFASettings | null>(null);
  const [userStatuses, setUserStatuses] = useState<UserMFAStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchCompanies();
    } else if (company?.id) {
      setSelectedCompanyId(company.id);
    }
  }, [isAdmin, company]);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchSettings();
      fetchUserStatuses();
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, name")
      .order("name");
    
    if (data) {
      setCompanies(data);
      if (data.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(data[0].id);
      }
    }
  };

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("mfa_settings")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          ...data,
          allowed_factors: data.allowed_factors || ['totp']
        });
      } else {
        // Default settings
        setSettings({
          company_id: selectedCompanyId,
          is_mfa_enabled: false,
          is_mfa_required: false,
          allowed_factors: ['totp'],
          grace_period_days: 7,
        });
      }
    } catch (error) {
      console.error("Error fetching MFA settings:", error);
      toast.error("Failed to load MFA settings");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStatuses = async () => {
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("company_id", selectedCompanyId);

      if (!profiles) return;

      const { data: statuses } = await supabase
        .from("user_mfa_status")
        .select("*")
        .in("user_id", profiles.map(p => p.id));

      const combined = profiles.map(profile => {
        const status = statuses?.find(s => s.user_id === profile.id);
        return {
          user_id: profile.id,
          is_enrolled: status?.is_enrolled || false,
          enrolled_at: status?.enrolled_at || null,
          last_verified_at: status?.last_verified_at || null,
          profiles: {
            full_name: profile.full_name,
            email: profile.email,
          },
        };
      });

      setUserStatuses(combined);
    } catch (error) {
      console.error("Error fetching user MFA statuses:", error);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("mfa_settings")
        .upsert({
          ...settings,
          company_id: selectedCompanyId,
        }, { onConflict: "company_id" });

      if (error) throw error;

      toast.success("MFA settings saved successfully");
      fetchSettings();
    } catch (error) {
      console.error("Error saving MFA settings:", error);
      toast.error("Failed to save MFA settings");
    } finally {
      setIsSaving(false);
    }
  };

  const enrolledCount = userStatuses.filter(u => u.is_enrolled).length;
  const totalCount = userStatuses.length;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("nav.admin", "Admin"), href: "/admin" },
            { label: t("admin.mfaSettings", "MFA Settings") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("admin.mfaSettings", "MFA Settings")}
            </h1>
            <p className="text-muted-foreground">
              {t("admin.mfaSettingsDescription", "Configure multi-factor authentication for your organization")}
            </p>
          </div>
          
          {isAdmin && companies.length > 1 && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Stats Cards */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("admin.mfaEnrollmentRate", "Enrollment Rate")}
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalCount > 0 ? Math.round((enrolledCount / totalCount) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {enrolledCount} of {totalCount} users enrolled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("admin.mfaStatus", "MFA Status")}
              </CardTitle>
              {settings?.is_mfa_enabled ? (
                <ShieldCheck className="h-4 w-4 text-green-600" />
              ) : (
                <ShieldOff className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {settings?.is_mfa_enabled ? "Enabled" : "Disabled"}
              </div>
              <p className="text-xs text-muted-foreground">
                {settings?.is_mfa_required ? "Required for all users" : "Optional for users"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("admin.gracePeriod", "Grace Period")}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {settings?.grace_period_days || 7} days
              </div>
              <p className="text-xs text-muted-foreground">
                Time for users to set up MFA
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.mfaConfiguration", "MFA Configuration")}</CardTitle>
            <CardDescription>
              {t("admin.mfaConfigDescription", "Enable and configure multi-factor authentication for your organization")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("admin.enableMfa", "Enable MFA")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("admin.enableMfaDescription", "Allow users to set up two-factor authentication")}
                </p>
              </div>
              <Switch
                checked={settings?.is_mfa_enabled || false}
                onCheckedChange={(checked) => 
                  setSettings(prev => prev ? { ...prev, is_mfa_enabled: checked } : null)
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("admin.requireMfa", "Require MFA")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("admin.requireMfaDescription", "Force all users to set up MFA before accessing the system")}
                </p>
              </div>
              <Switch
                checked={settings?.is_mfa_required || false}
                onCheckedChange={(checked) => 
                  setSettings(prev => prev ? { ...prev, is_mfa_required: checked } : null)
                }
                disabled={!settings?.is_mfa_enabled}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>{t("admin.gracePeriodDays", "Grace Period (Days)")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("admin.gracePeriodDescription", "Number of days users have to set up MFA after it becomes required")}
              </p>
              <Input
                type="number"
                min={0}
                max={30}
                value={settings?.grace_period_days || 7}
                onChange={(e) => 
                  setSettings(prev => prev ? { ...prev, grace_period_days: parseInt(e.target.value) || 7 } : null)
                }
                className="w-32"
                disabled={!settings?.is_mfa_required}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t("common.save", "Save Changes")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Status Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.userMfaStatus", "User MFA Status")}</CardTitle>
            <CardDescription>
              {t("admin.userMfaStatusDescription", "View which users have MFA enabled")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name", "Name")}</TableHead>
                  <TableHead>{t("common.email", "Email")}</TableHead>
                  <TableHead>{t("admin.mfaStatus", "MFA Status")}</TableHead>
                  <TableHead>{t("admin.enrolledAt", "Enrolled At")}</TableHead>
                  <TableHead>{t("admin.lastVerified", "Last Verified")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userStatuses.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">
                      {user.profiles.full_name || "-"}
                    </TableCell>
                    <TableCell>{user.profiles.email}</TableCell>
                    <TableCell>
                      {user.is_enrolled ? (
                        <Badge variant="default" className="gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Enrolled
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <ShieldOff className="h-3 w-3" />
                          Not Enrolled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.enrolled_at 
                        ? new Date(user.enrolled_at).toLocaleDateString()
                        : "-"
                      }
                    </TableCell>
                    <TableCell>
                      {user.last_verified_at 
                        ? new Date(user.last_verified_at).toLocaleString()
                        : "-"
                      }
                    </TableCell>
                  </TableRow>
                ))}
                {userStatuses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
