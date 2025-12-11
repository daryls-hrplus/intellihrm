import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Cake, 
  CalendarHeart, 
  Baby, 
  Heart, 
  TrendingUp,
  Shield,
  Loader2
} from "lucide-react";

interface PrivacySettings {
  share_birthday: boolean;
  share_work_anniversary: boolean;
  share_new_child: boolean;
  share_marriage: boolean;
  share_promotion: boolean;
}

const defaultSettings: PrivacySettings = {
  share_birthday: true,
  share_work_anniversary: true,
  share_new_child: true,
  share_marriage: true,
  share_promotion: true,
};

export default function PrivacySettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<PrivacySettings>(defaultSettings);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("employee_privacy_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const fetched: PrivacySettings = {
          share_birthday: data.share_birthday,
          share_work_anniversary: data.share_work_anniversary,
          share_new_child: data.share_new_child,
          share_marriage: data.share_marriage,
          share_promotion: data.share_promotion,
        };
        setSettings(fetched);
        setOriginalSettings(fetched);
      }
    } catch (error) {
      console.error("Error fetching privacy settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof PrivacySettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(originalSettings));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("employee_privacy_settings")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("employee_privacy_settings")
          .update({
            ...settings,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("employee_privacy_settings")
          .insert({
            user_id: user.id,
            ...settings,
          });

        if (error) throw error;
      }

      setOriginalSettings(settings);
      setHasChanges(false);
      toast.success("Privacy settings saved");
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      toast.error("Failed to save privacy settings");
    } finally {
      setSaving(false);
    }
  };

  const privacyOptions = [
    {
      key: "share_birthday" as keyof PrivacySettings,
      icon: Cake,
      label: "Birthday Announcements",
      description: "Allow your birthday to be shared in company announcements",
    },
    {
      key: "share_work_anniversary" as keyof PrivacySettings,
      icon: CalendarHeart,
      label: "Work Anniversary",
      description: "Allow your work anniversary to be announced",
    },
    {
      key: "share_new_child" as keyof PrivacySettings,
      icon: Baby,
      label: "New Child Announcements",
      description: "Allow announcements about new additions to your family",
    },
    {
      key: "share_marriage" as keyof PrivacySettings,
      icon: Heart,
      label: "Marriage Announcements",
      description: "Allow announcements about your marriage",
    },
    {
      key: "share_promotion" as keyof PrivacySettings,
      icon: TrendingUp,
      label: "Promotion Announcements",
      description: "Allow announcements about your promotions",
    },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Profile", href: "/profile" },
            { label: "Privacy Settings", href: "/profile/privacy" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Privacy Settings</h1>
            <p className="text-muted-foreground">
              Control what personal information is shared in company announcements
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Announcement Preferences</CardTitle>
            </div>
            <CardDescription>
              Choose which personal milestones can be included in company-wide announcements. 
              Opting out means your information will not appear in intranet announcements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {privacyOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.key}
                  className="flex items-center justify-between py-4 border-b last:border-b-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <Label className="text-base font-medium">{option.label}</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings[option.key]}
                    onCheckedChange={() => handleToggle(option.key)}
                  />
                </div>
              );
            })}

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges || saving}
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Your Privacy Matters</h3>
                <p className="text-sm text-muted-foreground">
                  These settings only affect what appears in company announcements. 
                  Your HR records and official employment data remain confidential 
                  and accessible only to authorized personnel regardless of these settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
