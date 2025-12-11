import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Mail, Ticket, MessageSquare, Shield, Megaphone, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface NotificationPreferences {
  ticket_assigned: boolean;
  ticket_status_changed: boolean;
  ticket_comment_added: boolean;
  access_request_updates: boolean;
  system_announcements: boolean;
  email_notifications: boolean;
}

const defaultPreferences: NotificationPreferences = {
  ticket_assigned: true,
  ticket_status_changed: true,
  ticket_comment_added: true,
  access_request_updates: true,
  system_announcements: true,
  email_notifications: false,
};

export default function NotificationPreferencesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching preferences:', error);
    }

    if (data) {
      setPreferences({
        ticket_assigned: data.ticket_assigned,
        ticket_status_changed: data.ticket_status_changed,
        ticket_comment_added: data.ticket_comment_added,
        access_request_updates: data.access_request_updates,
        system_announcements: data.system_announcements,
        email_notifications: data.email_notifications,
      });
    }
    setIsLoading(false);
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!user) return;

    setPreferences(prev => ({ ...prev, [key]: value }));
    setIsSaving(true);

    const { data: existing } = await supabase
      .from('notification_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let error;
    if (existing) {
      const result = await supabase
        .from('notification_preferences')
        .update({ [key]: value, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('notification_preferences')
        .insert({ user_id: user.id, [key]: value });
      error = result.error;
    }

    setIsSaving(false);

    if (error) {
      console.error('Error saving preference:', error);
      toast.error('Failed to save preference');
      setPreferences(prev => ({ ...prev, [key]: !value }));
    } else {
      toast.success('Preference saved');
    }
  };

  const preferenceGroups = [
    {
      title: "Ticket Notifications",
      description: "Notifications related to support tickets",
      icon: Ticket,
      items: [
        {
          key: "ticket_assigned" as keyof NotificationPreferences,
          label: "Ticket Assigned",
          description: "When a ticket is assigned to you",
        },
        {
          key: "ticket_status_changed" as keyof NotificationPreferences,
          label: "Status Changes",
          description: "When your ticket's status is updated",
        },
        {
          key: "ticket_comment_added" as keyof NotificationPreferences,
          label: "New Comments",
          description: "When someone comments on your ticket",
        },
      ],
    },
    {
      title: "Access & Security",
      description: "Notifications about access requests and security",
      icon: Shield,
      items: [
        {
          key: "access_request_updates" as keyof NotificationPreferences,
          label: "Access Request Updates",
          description: "Updates on your module access requests",
        },
      ],
    },
    {
      title: "System",
      description: "General system notifications",
      icon: Megaphone,
      items: [
        {
          key: "system_announcements" as keyof NotificationPreferences,
          label: "System Announcements",
          description: "Important system updates and announcements",
        },
      ],
    },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Employee Self Service", href: "/ess" },
            { label: "Notification Preferences" },
          ]}
        />
        
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Notification Preferences
            </h1>
            <p className="text-muted-foreground">
              Customize which notifications you receive
            </p>
          </div>
          {isSaving && (
            <div className="ml-auto flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Receive notifications via email in addition to in-app notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_notifications" className="text-base">
                  Enable Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get email alerts for important notifications
                </p>
              </div>
              <Switch
                id="email_notifications"
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {preferenceGroups.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <group.icon className="h-5 w-5" />
                {group.title}
              </CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.items.map((item, index) => (
                <div key={item.key}>
                  {index > 0 && <Separator className="mb-4" />}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor={item.key} className="text-base">
                        {item.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      id={item.key}
                      checked={preferences[item.key]}
                      onCheckedChange={(checked) => updatePreference(item.key, checked)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
