import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Settings, Mail, Eye, EyeOff, Save, Loader2, ShieldAlert, ArrowLeft } from "lucide-react";
import { NavLink } from "react-router-dom";

interface SystemSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  is_sensitive: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  const formatSettingName = (key: string) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getSettingIcon = (key: string) => {
    if (key.includes("resend") || key.includes("email")) return Mail;
    if (key.includes("pii") || key.includes("alert")) return ShieldAlert;
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

        {/* Alert Thresholds */}
        <Card className="animate-slide-up" style={{ animationDelay: "100ms" }}>
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
