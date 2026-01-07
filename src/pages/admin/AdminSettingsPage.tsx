import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Settings, Mail, Eye, EyeOff, Save, Loader2, ShieldAlert, ArrowLeft, Send, CheckCircle, XCircle, Calendar, BarChart3, AlertTriangle, Video, FileText, MapPin } from "lucide-react";
import { NavLink } from "react-router-dom";
import { usePageAudit } from "@/hooks/usePageAudit";

interface SystemSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  is_sensitive: boolean;
}

export default function AdminSettingsPage() {
  usePageAudit('settings', 'Admin');
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingReport, setIsTestingReport] = useState(false);
  const [isTestingHeadcount, setIsTestingHeadcount] = useState(false);
  const [isTestingSla, setIsTestingSla] = useState(false);
  const [isTestingSlaReport, setIsTestingSlaReport] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [reportResult, setReportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [headcountResult, setHeadcountResult] = useState<{ success: boolean; message: string } | null>(null);
  const [slaResult, setSlaResult] = useState<{ success: boolean; message: string } | null>(null);
  const [slaReportResult, setSlaReportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .order("key");

      if (error) throw error;
      
      const typedData = (data || []).map((item: any) => ({
        id: item.id as string,
        key: item.key as string,
        value: item.value as string | null,
        description: item.description as string | null,
        is_sensitive: item.is_sensitive as boolean,
      }));
      
      setSettings(typedData);
      
      const initialValues: Record<string, string> = {};
      typedData.forEach((s) => {
        initialValues[s.key] = s.value || "";
      });
      setEditedValues(initialValues);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (key: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("system_settings")
        .update({ value: editedValues[key] || null })
        .eq("key", key);

      if (error) throw error;
      toast.success("Setting saved successfully");
      fetchSettings();
    } catch (error) {
      console.error("Error saving setting:", error);
      toast.error("Failed to save setting");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestAlert = async () => {
    if (!user) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .single();

      const { data, error } = await supabase.functions.invoke("send-pii-alert", {
        body: {
          userId: user.id,
          userEmail: profile?.email || user.email || "test@example.com",
          accessCount: 99,
          alertType: "TEST_ALERT",
          alertReason: "This is a test alert to verify the email configuration is working correctly.",
        },
      });

      if (error) throw error;

      if (data?.emailSent) {
        setTestResult({
          success: true,
          message: "Test alert sent successfully! Check your email inbox.",
        });
        toast.success("Test alert sent successfully");
      } else {
        setTestResult({
          success: false,
          message: data?.reason || "Email not sent - check if Resend API key is configured.",
        });
        toast.warning("Alert logged but email not sent - configure Resend API key first");
      }
    } catch (error: any) {
      console.error("Error sending test alert:", error);
      setTestResult({
        success: false,
        message: error.message || "Failed to send test alert",
      });
      toast.error("Failed to send test alert");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSendWeeklyReport = async () => {
    setIsTestingReport(true);
    setReportResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("weekly-permissions-report", {
        body: {},
      });

      if (error) throw error;

      if (data?.success) {
        setReportResult({
          success: true,
          message: `Report sent to ${data.emailsSent} admin(s)!`,
        });
        toast.success("Weekly permissions report sent successfully");
      } else {
        setReportResult({
          success: false,
          message: data?.reason || "Report not sent - check configuration.",
        });
        toast.warning(data?.reason || "Report could not be sent");
      }
    } catch (error: any) {
      console.error("Error sending weekly report:", error);
      setReportResult({
        success: false,
        message: error.message || "Failed to send report",
      });
      toast.error("Failed to send weekly report");
    } finally {
      setIsTestingReport(false);
    }
  };

  const handleSendHeadcountReport = async (reportType: "weekly" | "monthly") => {
    setIsTestingHeadcount(true);
    setHeadcountResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("send-headcount-report", {
        body: { reportType },
      });

      if (error) throw error;

      if (data?.success) {
        setHeadcountResult({
          success: true,
          message: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report sent to ${data.emailsSent} admin(s)!`,
        });
        toast.success(`Headcount ${reportType} report sent successfully`);
      } else {
        setHeadcountResult({
          success: false,
          message: data?.reason || "Report not sent - check configuration.",
        });
        toast.warning(data?.reason || "Report could not be sent");
      }
    } catch (error: any) {
      console.error("Error sending headcount report:", error);
      setHeadcountResult({
        success: false,
        message: error.message || "Failed to send report",
      });
      toast.error("Failed to send headcount report");
    } finally {
      setIsTestingHeadcount(false);
    }
  };

  const handleCheckSlaBreach = async () => {
    setIsTestingSla(true);
    setSlaResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("check-sla-breach", {
        body: {},
      });

      if (error) throw error;

      if (data?.success) {
        const emailCount = data.emailsSent?.length || 0;
        setSlaResult({
          success: true,
          message: emailCount > 0 
            ? `SLA check complete! ${emailCount} warning email(s) sent.`
            : "SLA check complete. No tickets approaching breach.",
        });
        toast.success(emailCount > 0 ? `${emailCount} SLA warning(s) sent` : "No SLA warnings needed");
      } else {
        setSlaResult({
          success: false,
          message: data?.message || "SLA check failed - check configuration.",
        });
        toast.warning(data?.message || "SLA check could not complete");
      }
    } catch (error: any) {
      console.error("Error checking SLA breach:", error);
      setSlaResult({
        success: false,
        message: error.message || "Failed to check SLA breach",
      });
      toast.error("Failed to check SLA breach");
    } finally {
      setIsTestingSla(false);
    }
  };

  const handleSendSlaWeeklyReport = async () => {
    setIsTestingSlaReport(true);
    setSlaReportResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("send-sla-weekly-report", {
        body: {},
      });

      if (error) throw error;

      if (data?.success) {
        setSlaReportResult({
          success: true,
          message: data.message || "Weekly SLA report sent successfully!",
        });
        toast.success("Weekly SLA report sent successfully");
      } else {
        setSlaReportResult({
          success: false,
          message: data?.message || "Report not sent - check configuration.",
        });
        toast.warning(data?.message || "Report could not be sent");
      }
    } catch (error: any) {
      console.error("Error sending SLA weekly report:", error);
      setSlaReportResult({
        success: false,
        message: error.message || "Failed to send SLA report",
      });
      toast.error("Failed to send SLA weekly report");
    } finally {
      setIsTestingSlaReport(false);
    }
  };

  const formatSettingName = (key: string) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getSettingIcon = (key: string) => {
    if (key.includes("resend") || key.includes("email")) return Mail;
    if (key.includes("pii") || key.includes("alert")) return ShieldAlert;
    if (key.includes("daily") || key.includes("video")) return Video;
    if (key.includes("copyright")) return FileText;
    if (key.includes("mapbox")) return MapPin;
    return Settings;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const emailSettings = settings.filter((s) => s.key.includes("resend"));
  const alertSettings = settings.filter((s) => s.key.includes("pii") || s.key.includes("alert"));
  const videoSettings = settings.filter((s) => s.key.includes("daily") || s.key.includes("video"));
  const brandingSettings = settings.filter((s) => s.key.includes("copyright"));
  const mapboxSettings = settings.filter((s) => s.key.includes("mapbox"));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <NavLink
            to="/admin"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </NavLink>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                System Settings
              </h1>
              <p className="text-muted-foreground">
                Configure email alerts and security thresholds
              </p>
            </div>
          </div>
        </div>

        {/* Email Configuration */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email Configuration
            </CardTitle>
            <CardDescription>
              Configure Resend API for sending email alerts. Get your API key from{" "}
              <a
                href="https://resend.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                resend.com/api-keys
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {emailSettings.map((setting) => {
              const Icon = getSettingIcon(setting.key);
              return (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.key} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {formatSettingName(setting.key)}
                  </Label>
                  {setting.description && (
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  )}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id={setting.key}
                        type={setting.is_sensitive && !showSensitive[setting.key] ? "password" : "text"}
                        value={editedValues[setting.key] || ""}
                        onChange={(e) =>
                          setEditedValues((prev) => ({ ...prev, [setting.key]: e.target.value }))
                        }
                        placeholder={setting.is_sensitive ? "Enter API key..." : "Enter value..."}
                        className="pr-10"
                      />
                      {setting.is_sensitive && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() =>
                            setShowSensitive((prev) => ({ ...prev, [setting.key]: !prev[setting.key] }))
                          }
                        >
                          {showSensitive[setting.key] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    <Button
                      onClick={() => handleSave(setting.key)}
                      disabled={isSaving}
                      size="sm"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Branding Configuration */}
        {brandingSettings.length > 0 && (
          <Card className="animate-slide-up" style={{ animationDelay: "15ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Branding Configuration
              </CardTitle>
              <CardDescription>
                Configure copyright notice and other branding elements displayed throughout the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {brandingSettings.map((setting) => {
                const Icon = getSettingIcon(setting.key);
                return (
                  <div key={setting.id} className="space-y-2">
                    <Label htmlFor={setting.key} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {formatSettingName(setting.key)}
                    </Label>
                    {setting.description && (
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    )}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id={setting.key}
                          type="text"
                          value={editedValues[setting.key] || ""}
                          onChange={(e) =>
                            setEditedValues((prev) => ({ ...prev, [setting.key]: e.target.value }))
                          }
                          placeholder="Enter copyright notice..."
                        />
                      </div>
                      <Button
                        onClick={() => handleSave(setting.key)}
                        disabled={isSaving}
                        size="sm"
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Video Chat Configuration */}
        {videoSettings.length > 0 && (
          <Card className="animate-slide-up" style={{ animationDelay: "25ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Video Chat Configuration
              </CardTitle>
              <CardDescription>
                Configure Daily.co API for video chat functionality. Get your API key from{" "}
                <a
                  href="https://dashboard.daily.co/developers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  dashboard.daily.co/developers
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {videoSettings.map((setting) => {
                const Icon = getSettingIcon(setting.key);
                return (
                  <div key={setting.id} className="space-y-2">
                    <Label htmlFor={setting.key} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {formatSettingName(setting.key)}
                    </Label>
                    {setting.description && (
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    )}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id={setting.key}
                          type={setting.is_sensitive && !showSensitive[setting.key] ? "password" : "text"}
                          value={editedValues[setting.key] || ""}
                          onChange={(e) =>
                            setEditedValues((prev) => ({ ...prev, [setting.key]: e.target.value }))
                          }
                          placeholder={setting.is_sensitive ? "Enter API key..." : "Enter value..."}
                          className="pr-10"
                        />
                        {setting.is_sensitive && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                            onClick={() =>
                              setShowSensitive((prev) => ({ ...prev, [setting.key]: !prev[setting.key] }))
                            }
                          >
                            {showSensitive[setting.key] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                      <Button
                        onClick={() => handleSave(setting.key)}
                        disabled={isSaving}
                        size="sm"
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Mapbox Configuration */}
        {mapboxSettings.length > 0 && (
          <Card className="animate-slide-up" style={{ animationDelay: "35ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Mapbox Configuration
              </CardTitle>
              <CardDescription>
                Configure Mapbox for geofencing and location selection features. Get your public token from{" "}
                <a
                  href="https://account.mapbox.com/access-tokens/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  account.mapbox.com/access-tokens
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mapboxSettings.map((setting) => {
                const Icon = getSettingIcon(setting.key);
                return (
                  <div key={setting.id} className="space-y-2">
                    <Label htmlFor={setting.key} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {formatSettingName(setting.key)}
                    </Label>
                    {setting.description && (
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    )}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id={setting.key}
                          type={setting.is_sensitive && !showSensitive[setting.key] ? "password" : "text"}
                          value={editedValues[setting.key] || ""}
                          onChange={(e) =>
                            setEditedValues((prev) => ({ ...prev, [setting.key]: e.target.value }))
                          }
                          placeholder={setting.is_sensitive ? "Enter public token..." : "Enter value..."}
                          className="pr-10"
                        />
                        {setting.is_sensitive && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                            onClick={() =>
                              setShowSensitive((prev) => ({ ...prev, [setting.key]: !prev[setting.key] }))
                            }
                          >
                            {showSensitive[setting.key] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                      <Button
                        onClick={() => handleSave(setting.key)}
                        disabled={isSaving}
                        size="sm"
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}


        <Card className="animate-slide-up" style={{ animationDelay: "50ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-info" />
              Test Alert System
            </CardTitle>
            <CardDescription>
              Send a test alert to verify your email configuration is working correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleTestAlert}
                disabled={isTesting}
                variant="outline"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test Alert
                  </>
                )}
              </Button>
              
              {testResult && (
                <div className={`flex items-center gap-2 text-sm ${testResult.success ? "text-success" : "text-warning"}`}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {testResult.message}
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              This will create a test entry in the PII alerts table and attempt to send an email to all admin users.
              The alert will be marked as type "TEST_ALERT" for easy identification.
            </p>
          </CardContent>
        </Card>

        {/* Weekly Permissions Report */}
        <Card className="animate-slide-up" style={{ animationDelay: "75ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Weekly Permissions Report
            </CardTitle>
            <CardDescription>
              Automated weekly report sent every Monday at 8am UTC with permission changes and user access summary
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleSendWeeklyReport}
                disabled={isTestingReport}
                variant="outline"
              >
                {isTestingReport ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Send Report Now
                  </>
                )}
              </Button>
              
              {reportResult && (
                <div className={`flex items-center gap-2 text-sm ${reportResult.success ? "text-success" : "text-warning"}`}>
                  {reportResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {reportResult.message}
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              The report includes: user permissions matrix, PII access holders, recent permission changes, and role summaries.
              Requires Resend API key to be configured above.
            </p>
          </CardContent>
        </Card>

        {/* Headcount Analytics Report */}
        <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Headcount Analytics Report
            </CardTitle>
            <CardDescription>
              Send scheduled headcount analytics reports with vacancy summaries and request trends
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <Button
                onClick={() => handleSendHeadcountReport("weekly")}
                disabled={isTestingHeadcount}
                variant="outline"
              >
                {isTestingHeadcount ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Send Weekly Report
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleSendHeadcountReport("monthly")}
                disabled={isTestingHeadcount}
                variant="outline"
              >
                {isTestingHeadcount ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Send Monthly Report
                  </>
                )}
              </Button>
              
              {headcountResult && (
                <div className={`flex items-center gap-2 text-sm ${headcountResult.success ? "text-success" : "text-warning"}`}>
                  {headcountResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {headcountResult.message}
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              The report includes: headcount request summary, net headcount changes, vacancy summary by company, and recent request details.
              Requires Resend API key to be configured above.
            </p>
          </CardContent>
        </Card>

        {/* SLA Breach Check */}
        <Card className="animate-slide-up" style={{ animationDelay: "112ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              SLA Breach Check
            </CardTitle>
            <CardDescription>
              Manually check for tickets approaching SLA breach and send warning emails to assignees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleCheckSlaBreach}
                disabled={isTestingSla}
                variant="outline"
              >
                {isTestingSla ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Checking...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Check SLA Now
                  </>
                )}
              </Button>
              
              {slaResult && (
                <div className={`flex items-center gap-2 text-sm ${slaResult.success ? "text-success" : "text-warning"}`}>
                  {slaResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {slaResult.message}
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              Checks all open tickets with priority levels. Sends warning emails when tickets reach 80% of their response or resolution SLA time.
              Requires Resend API key to be configured above.
            </p>
          </CardContent>
        </Card>

        {/* Weekly SLA Performance Report */}
        <Card className="animate-slide-up" style={{ animationDelay: "115ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Weekly SLA Performance Report
            </CardTitle>
            <CardDescription>
              Send automated weekly SLA performance reports to all managers with compliance metrics and breach analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleSendSlaWeeklyReport}
                disabled={isTestingSlaReport}
                variant="outline"
              >
                {isTestingSlaReport ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Send SLA Report Now
                  </>
                )}
              </Button>
              
              {slaReportResult && (
                <div className={`flex items-center gap-2 text-sm ${slaReportResult.success ? "text-success" : "text-warning"}`}>
                  {slaReportResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {slaReportResult.message}
                </div>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              The report includes: SLA compliance rates (response & resolution), breach analysis by priority and category, 
              average response/resolution times, and improvement recommendations. Set up a cron job for automated weekly delivery.
            </p>
          </CardContent>
        </Card>

        {/* Alert Thresholds */}
        <Card className="animate-slide-up" style={{ animationDelay: "125ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-warning" />
              PII Alert Thresholds
            </CardTitle>
            <CardDescription>
              Configure when suspicious PII access alerts are triggered
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alertSettings.map((setting) => {
              const Icon = getSettingIcon(setting.key);
              return (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.key} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {formatSettingName(setting.key)}
                  </Label>
                  {setting.description && (
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Input
                      id={setting.key}
                      type="number"
                      value={editedValues[setting.key] || ""}
                      onChange={(e) =>
                        setEditedValues((prev) => ({ ...prev, [setting.key]: e.target.value }))
                      }
                      placeholder="Enter value..."
                      className="max-w-[200px]"
                    />
                    <Button
                      onClick={() => handleSave(setting.key)}
                      disabled={isSaving}
                      size="sm"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
