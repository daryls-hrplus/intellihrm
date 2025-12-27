import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bell, Clock, AlertTriangle, MessageSquare, Target, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotificationPreferences {
  check_in_reminders: boolean;
  overdue_alerts: boolean;
  risk_changes: boolean;
  coaching_suggestions: boolean;
  goal_updates: boolean;
  email_enabled: boolean;
  digest_frequency: string;
}

const defaultPreferences: NotificationPreferences = {
  check_in_reminders: true,
  overdue_alerts: true,
  risk_changes: true,
  coaching_suggestions: true,
  goal_updates: false,
  email_enabled: true,
  digest_frequency: "daily",
};

export function GoalNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadPreferences();
    }
  }, [userId]);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);
  };

  const loadPreferences = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("goal_notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (data && !error) {
      setPreferences({
        check_in_reminders: data.check_in_reminders ?? true,
        overdue_alerts: data.overdue_alerts ?? true,
        risk_changes: data.risk_changes ?? true,
        coaching_suggestions: data.coaching_suggestions ?? true,
        goal_updates: data.goal_updates ?? false,
        email_enabled: data.email_enabled ?? true,
        digest_frequency: data.digest_frequency ?? "daily",
      });
    }
  };

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.from("goal_notification_preferences").upsert(
        {
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) throw error;

      toast.success("Notification preferences saved");
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Goal Notification Preferences
        </CardTitle>
        <CardDescription>
          Configure how and when you receive notifications about your goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* In-App Notifications */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">In-App Notifications</h4>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="check_in_reminders">Check-in Reminders</Label>
                <p className="text-xs text-muted-foreground">Get notified before check-ins are due</p>
              </div>
            </div>
            <Switch
              id="check_in_reminders"
              checked={preferences.check_in_reminders}
              onCheckedChange={(v) => updatePreference("check_in_reminders", v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="overdue_alerts">Overdue Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when check-ins become overdue
                </p>
              </div>
            </div>
            <Switch
              id="overdue_alerts"
              checked={preferences.overdue_alerts}
              onCheckedChange={(v) => updatePreference("overdue_alerts", v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="risk_changes">Risk Status Changes</Label>
                <p className="text-xs text-muted-foreground">Get notified when goal risk status changes</p>
              </div>
            </div>
            <Switch
              id="risk_changes"
              checked={preferences.risk_changes}
              onCheckedChange={(v) => updatePreference("risk_changes", v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="coaching_suggestions">Coaching Nudges</Label>
                <p className="text-xs text-muted-foreground">Receive AI-generated coaching suggestions</p>
              </div>
            </div>
            <Switch
              id="coaching_suggestions"
              checked={preferences.coaching_suggestions}
              onCheckedChange={(v) => updatePreference("coaching_suggestions", v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="goal_updates">Goal Updates</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when goals you're involved with are updated
                </p>
              </div>
            </div>
            <Switch
              id="goal_updates"
              checked={preferences.goal_updates}
              onCheckedChange={(v) => updatePreference("goal_updates", v)}
            />
          </div>
        </div>

        <Separator />

        {/* Email Notifications */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Email Notifications</h4>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email_enabled">Email Notifications</Label>
              <p className="text-xs text-muted-foreground">Receive email notifications</p>
            </div>
            <Switch
              id="email_enabled"
              checked={preferences.email_enabled}
              onCheckedChange={(v) => updatePreference("email_enabled", v)}
            />
          </div>

          {preferences.email_enabled && (
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Frequency</Label>
                <p className="text-xs text-muted-foreground">How often to receive email digests</p>
              </div>
              <Select
                value={preferences.digest_frequency}
                onValueChange={(v) => updatePreference("digest_frequency", v)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {hasChanges && (
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
