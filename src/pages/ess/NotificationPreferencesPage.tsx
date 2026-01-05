import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Mail, CheckCircle2, XCircle, ArrowLeft, GitBranch, Clock, MessageSquare, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface NotificationPreferences {
  id?: string;
  email_notifications: boolean;
  // Workflow preferences
  workflow_pending_approval: boolean;
  workflow_approved: boolean;
  workflow_rejected: boolean;
  workflow_escalated: boolean;
  workflow_returned: boolean;
  workflow_completed: boolean;
  // Other preferences
  ticket_assigned: boolean;
  ticket_status_changed: boolean;
  ticket_comment_added: boolean;
  access_request_updates: boolean;
  system_announcements: boolean;
  performance_review_updates: boolean;
  review_response_reminders: boolean;
  escalation_updates: boolean;
  leave_request_updates: boolean;
  training_request_updates: boolean;
}

const defaultPreferences: NotificationPreferences = {
  email_notifications: true,
  workflow_pending_approval: true,
  workflow_approved: true,
  workflow_rejected: true,
  workflow_escalated: true,
  workflow_returned: true,
  workflow_completed: true,
  ticket_assigned: true,
  ticket_status_changed: true,
  ticket_comment_added: true,
  access_request_updates: true,
  system_announcements: true,
  performance_review_updates: true,
  review_response_reminders: true,
  escalation_updates: true,
  leave_request_updates: true,
  training_request_updates: true,
};

export default function NotificationPreferencesPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalPrefs, setOriginalPrefs] = useState<NotificationPreferences>(defaultPreferences);

  useEffect(() => {
    if (user?.id) {
      fetchPreferences();
    }
  }, [user?.id]);

  const fetchPreferences = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching preferences:", error);
      }

      if (data) {
        const prefs = { ...defaultPreferences, ...data };
        setPreferences(prefs);
        setOriginalPrefs(prefs);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    setHasChanges(JSON.stringify(newPrefs) !== JSON.stringify(originalPrefs));
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

      if (error) throw error;

      setOriginalPrefs(preferences);
      setHasChanges(false);
      toast.success(t("notifications.preferences.saved", "Preferences saved successfully"));
    } catch (err) {
      console.error("Error saving preferences:", err);
      toast.error(t("notifications.preferences.saveFailed", "Failed to save preferences"));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPreferences(originalPrefs);
    setHasChanges(false);
  };

  const breadcrumbItems = [
    { label: t("navigation.ess", "Employee Self Service"), href: "/ess" },
    { label: t("notifications.preferences.title", "Notification Preferences") },
  ];

  const PreferenceItem = ({ 
    label, 
    description, 
    prefKey, 
    icon: Icon 
  }: { 
    label: string; 
    description: string; 
    prefKey: keyof NotificationPreferences;
    icon?: React.ElementType;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-start gap-3">
        {Icon && <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />}
        <div>
          <Label htmlFor={prefKey} className="font-medium cursor-pointer">
            {label}
          </Label>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch
        id={prefKey}
        checked={preferences[prefKey] as boolean}
        onCheckedChange={(checked) => handleToggle(prefKey, checked)}
      />
    </div>
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6 max-w-4xl">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("notifications.preferences.title", "Notification Preferences")}
              </h1>
              <p className="text-muted-foreground">
                {t("notifications.preferences.subtitle", "Control how and when you receive notifications")}
              </p>
            </div>
          </div>

          {hasChanges && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                Unsaved changes
              </Badge>
              <Button variant="outline" onClick={handleReset}>
                {t("common.reset", "Reset")}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? t("common.saving", "Saving...") : t("common.save", "Save")}
              </Button>
            </div>
          )}
        </div>

        {/* Email Master Toggle */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>{t("notifications.preferences.emailNotifications", "Email Notifications")}</CardTitle>
                <CardDescription>
                  {t("notifications.preferences.emailDescription", "Receive notifications via email in addition to in-app alerts")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {preferences.email_notifications ? (
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Disabled
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  {preferences.email_notifications 
                    ? "You will receive email notifications for enabled categories"
                    : "You will only receive in-app notifications"}
                </span>
              </div>
              <Switch
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => handleToggle("email_notifications", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Workflow Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <GitBranch className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>{t("notifications.preferences.workflowNotifications", "Workflow Notifications")}</CardTitle>
                <CardDescription>
                  {t("notifications.preferences.workflowDescription", "Notifications for approval requests, status changes, and workflow events")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <PreferenceItem
              label={t("notifications.preferences.pendingApproval", "Pending Approvals")}
              description={t("notifications.preferences.pendingApprovalDesc", "When a workflow step is assigned to you for approval")}
              prefKey="workflow_pending_approval"
              icon={Clock}
            />
            <Separator />
            <PreferenceItem
              label={t("notifications.preferences.approved", "Request Approved")}
              description={t("notifications.preferences.approvedDesc", "When your submitted request is approved")}
              prefKey="workflow_approved"
              icon={CheckCircle2}
            />
            <Separator />
            <PreferenceItem
              label={t("notifications.preferences.rejected", "Request Rejected")}
              description={t("notifications.preferences.rejectedDesc", "When your submitted request is rejected")}
              prefKey="workflow_rejected"
              icon={XCircle}
            />
            <Separator />
            <PreferenceItem
              label={t("notifications.preferences.escalated", "Workflow Escalated")}
              description={t("notifications.preferences.escalatedDesc", "When a workflow is escalated due to no response")}
              prefKey="workflow_escalated"
              icon={AlertTriangle}
            />
            <Separator />
            <PreferenceItem
              label={t("notifications.preferences.returned", "Returned for Revision")}
              description={t("notifications.preferences.returnedDesc", "When your request is sent back for changes")}
              prefKey="workflow_returned"
            />
            <Separator />
            <PreferenceItem
              label={t("notifications.preferences.completed", "Workflow Completed")}
              description={t("notifications.preferences.completedDesc", "When a workflow is fully completed")}
              prefKey="workflow_completed"
            />
          </CardContent>
        </Card>

        {/* Other Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>{t("notifications.preferences.otherNotifications", "Other Notifications")}</CardTitle>
                <CardDescription>
                  {t("notifications.preferences.otherDescription", "System announcements, tickets, and other alerts")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <PreferenceItem
              label={t("notifications.preferences.systemAnnouncements", "System Announcements")}
              description={t("notifications.preferences.systemAnnouncementsDesc", "Important company-wide announcements")}
              prefKey="system_announcements"
            />
            <Separator />
            <PreferenceItem
              label={t("notifications.preferences.ticketAssigned", "Ticket Assigned")}
              description={t("notifications.preferences.ticketAssignedDesc", "When a help desk ticket is assigned to you")}
              prefKey="ticket_assigned"
            />
            <Separator />
            <PreferenceItem
              label={t("notifications.preferences.ticketUpdates", "Ticket Status Changes")}
              description={t("notifications.preferences.ticketUpdatesDesc", "When a ticket you created or are assigned to changes status")}
              prefKey="ticket_status_changed"
            />
            <Separator />
            <PreferenceItem
              label={t("notifications.preferences.performanceReviews", "Performance Review Updates")}
              description={t("notifications.preferences.performanceReviewsDesc", "Updates on performance reviews and appraisals")}
              prefKey="performance_review_updates"
            />
            <Separator />
            <PreferenceItem
              label={t("notifications.preferences.leaveRequests", "Leave Request Updates")}
              description={t("notifications.preferences.leaveRequestsDesc", "Updates on your leave request status")}
              prefKey="leave_request_updates"
            />
            <Separator />
            <PreferenceItem
              label={t("notifications.preferences.trainingRequests", "Training Request Updates")}
              description={t("notifications.preferences.trainingRequestsDesc", "Updates on training requests and enrollments")}
              prefKey="training_request_updates"
            />
          </CardContent>
        </Card>

        {/* Save Button (Mobile) */}
        {hasChanges && (
          <div className="flex justify-end gap-2 sm:hidden">
            <Button variant="outline" onClick={handleReset}>
              {t("common.reset", "Reset")}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t("common.saving", "Saving...") : t("common.save", "Save")}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
