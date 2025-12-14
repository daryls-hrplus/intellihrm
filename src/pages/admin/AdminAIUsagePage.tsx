import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bot, Users, TrendingUp, Activity, Settings, Search, Edit2, Save } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";

interface AIUserSetting {
  id: string;
  user_id: string;
  is_enabled: boolean;
  monthly_token_limit: number | null;
  daily_token_limit: number | null;
  notes: string | null;
  updated_at: string;
}

interface AIUsageLog {
  id: string;
  user_id: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  feature: string | null;
  created_at: string;
}

interface UserUsageSummary {
  user_id: string;
  full_name: string;
  email: string;
  total_tokens: number;
  request_count: number;
  is_enabled: boolean;
  monthly_limit: number | null;
  daily_limit: number | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
}

export default function AdminAIUsagePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserUsageSummary | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSettings, setEditSettings] = useState({
    is_enabled: true,
    monthly_token_limit: "",
    daily_token_limit: "",
    notes: ""
  });

  const breadcrumbItems = [
    { label: t("common.home"), href: "/" },
    { label: t("admin.title"), href: "/admin" },
    { label: t("admin.aiUsage.title") },
  ];

  // Fetch usage logs
  const { data: usageLogs = [] } = useQuery({
    queryKey: ["ai-usage-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_usage_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as AIUsageLog[];
    },
  });

  // Fetch user settings
  const { data: userSettings = [] } = useQuery({
    queryKey: ["ai-user-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_user_settings")
        .select("*");
      if (error) throw error;
      return data as AIUserSetting[];
    },
  });

  // Fetch all profiles to show usage summary
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["profiles-for-ai"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, email")
        .eq("is_active", true);
      if (error) throw error;
      return (data || []) as Profile[];
    },
  });

  // Helper to get profile by user_id
  const getProfile = (userId: string) => profiles.find(p => p.id === userId);

  // Calculate user usage summaries
  const userSummaries: UserUsageSummary[] = profiles.map(profile => {
    const userLogs = usageLogs.filter(log => log.user_id === profile.id);
    const userSetting = userSettings.find(s => s.user_id === profile.id);
    
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const monthlyTokens = userLogs
      .filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= monthStart && logDate <= monthEnd;
      })
      .reduce((sum, log) => sum + log.total_tokens, 0);

    return {
      user_id: profile.id,
      full_name: profile.full_name || "",
      email: profile.email || "",
      total_tokens: monthlyTokens,
      request_count: userLogs.length,
      is_enabled: userSetting?.is_enabled ?? true,
      monthly_limit: userSetting?.monthly_token_limit ?? null,
      daily_limit: userSetting?.daily_token_limit ?? null,
    };
  }).filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update user settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { userId: string; settings: Partial<AIUserSetting> }) => {
      const existingSetting = userSettings.find(s => s.user_id === data.userId);
      
      if (existingSetting) {
        const { error } = await supabase
          .from("ai_user_settings")
          .update({
            is_enabled: data.settings.is_enabled,
            monthly_token_limit: data.settings.monthly_token_limit,
            daily_token_limit: data.settings.daily_token_limit,
            notes: data.settings.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", data.userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("ai_user_settings")
          .insert({
            user_id: data.userId,
            is_enabled: data.settings.is_enabled ?? true,
            monthly_token_limit: data.settings.monthly_token_limit,
            daily_token_limit: data.settings.daily_token_limit,
            notes: data.settings.notes,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-user-settings"] });
      toast.success(t("admin.aiUsage.settingsUpdated"));
      setEditDialogOpen(false);
    },
    onError: () => {
      toast.error(t("common.error"));
    },
  });

  // Toggle user enabled status
  const toggleUserEnabled = async (userId: string, currentStatus: boolean) => {
    updateSettingsMutation.mutate({
      userId,
      settings: { is_enabled: !currentStatus }
    });
  };

  // Open edit dialog
  const openEditDialog = (user: UserUsageSummary) => {
    setSelectedUser(user);
    const userSetting = userSettings.find(s => s.user_id === user.user_id);
    setEditSettings({
      is_enabled: userSetting?.is_enabled ?? true,
      monthly_token_limit: userSetting?.monthly_token_limit?.toString() || "",
      daily_token_limit: userSetting?.daily_token_limit?.toString() || "",
      notes: userSetting?.notes || "",
    });
    setEditDialogOpen(true);
  };

  // Save user settings
  const saveUserSettings = () => {
    if (!selectedUser) return;
    
    updateSettingsMutation.mutate({
      userId: selectedUser.user_id,
      settings: {
        is_enabled: editSettings.is_enabled,
        monthly_token_limit: editSettings.monthly_token_limit ? parseInt(editSettings.monthly_token_limit) : null,
        daily_token_limit: editSettings.daily_token_limit ? parseInt(editSettings.daily_token_limit) : null,
        notes: editSettings.notes || null,
      }
    });
  };

  // Calculate stats
  const totalTokensThisMonth = usageLogs.reduce((sum, log) => {
    const logDate = new Date(log.created_at);
    const now = new Date();
    if (logDate >= startOfMonth(now) && logDate <= endOfMonth(now)) {
      return sum + log.total_tokens;
    }
    return sum;
  }, 0);

  const totalRequests = usageLogs.length;
  const activeUsers = new Set(usageLogs.map(log => log.user_id)).size;
  const disabledUsers = userSettings.filter(s => !s.is_enabled).length;

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("admin.aiUsage.title")}</h1>
            <p className="text-muted-foreground">{t("admin.aiUsage.description")}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.aiUsage.totalTokens")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTokensThisMonth.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{t("admin.aiUsage.thisMonth")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.aiUsage.totalRequests")}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRequests}</div>
              <p className="text-xs text-muted-foreground">{t("admin.aiUsage.allTime")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.aiUsage.activeUsers")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">{t("admin.aiUsage.usedAI")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.aiUsage.disabledUsers")}</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{disabledUsers}</div>
              <p className="text-xs text-muted-foreground">{t("admin.aiUsage.accessRevoked")}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">{t("admin.aiUsage.userManagement")}</TabsTrigger>
            <TabsTrigger value="logs">{t("admin.aiUsage.usageLogs")}</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("admin.aiUsage.userSettings")}</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("common.search")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.name")}</TableHead>
                      <TableHead>{t("common.email")}</TableHead>
                      <TableHead className="text-right">{t("admin.aiUsage.monthlyTokens")}</TableHead>
                      <TableHead className="text-right">{t("admin.aiUsage.monthlyLimit")}</TableHead>
                      <TableHead className="text-right">{t("admin.aiUsage.dailyLimit")}</TableHead>
                      <TableHead className="text-center">{t("common.status")}</TableHead>
                      <TableHead className="text-right">{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userSummaries.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-medium">
                          {user.full_name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-right">
                          {user.total_tokens.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.monthly_limit ? user.monthly_limit.toLocaleString() : t("common.unlimited")}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.daily_limit ? user.daily_limit.toLocaleString() : t("common.unlimited")}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={user.is_enabled ? "default" : "destructive"}>
                            {user.is_enabled ? t("common.enabled") : t("common.disabled")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Switch
                              checked={user.is_enabled}
                              onCheckedChange={() => toggleUserEnabled(user.user_id, user.is_enabled)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(user)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.aiUsage.recentLogs")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.user")}</TableHead>
                      <TableHead>{t("admin.aiUsage.model")}</TableHead>
                      <TableHead>{t("admin.aiUsage.feature")}</TableHead>
                      <TableHead className="text-right">{t("admin.aiUsage.promptTokens")}</TableHead>
                      <TableHead className="text-right">{t("admin.aiUsage.completionTokens")}</TableHead>
                      <TableHead className="text-right">{t("admin.aiUsage.totalTokens")}</TableHead>
                      <TableHead>{t("common.date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usageLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {getProfile(log.user_id)?.full_name || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.model}</Badge>
                        </TableCell>
                        <TableCell>{log.feature || "-"}</TableCell>
                        <TableCell className="text-right">{log.prompt_tokens.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{log.completion_tokens.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">{log.total_tokens.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(log.created_at), "PPp")}</TableCell>
                      </TableRow>
                    ))}
                    {usageLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          {t("admin.aiUsage.noLogs")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Settings Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("admin.aiUsage.editSettings")} - {selectedUser?.full_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Label>{t("admin.aiUsage.aiAccess")}</Label>
                <Switch
                  checked={editSettings.is_enabled}
                  onCheckedChange={(checked) => setEditSettings(prev => ({ ...prev, is_enabled: checked }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.aiUsage.monthlyTokenLimit")}</Label>
                <Input
                  type="number"
                  placeholder={t("common.unlimited")}
                  value={editSettings.monthly_token_limit}
                  onChange={(e) => setEditSettings(prev => ({ ...prev, monthly_token_limit: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.aiUsage.dailyTokenLimit")}</Label>
                <Input
                  type="number"
                  placeholder={t("common.unlimited")}
                  value={editSettings.daily_token_limit}
                  onChange={(e) => setEditSettings(prev => ({ ...prev, daily_token_limit: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("common.notes")}</Label>
                <Input
                  value={editSettings.notes}
                  onChange={(e) => setEditSettings(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={saveUserSettings} disabled={updateSettingsMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
