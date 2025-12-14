import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bot, Users, TrendingUp, Activity, Settings, Search, Edit2, DollarSign, Calendar, Volume2, VolumeX, Key } from "lucide-react";
import { format } from "date-fns";

interface AIBudgetTier {
  id: string;
  tier_name: string;
  tier_code: string;
  monthly_budget_usd: number | null;
  description: string | null;
  is_active: boolean;
}

interface AIUserSetting {
  id: string;
  user_id: string;
  is_enabled: boolean;
  voice_enabled: boolean;
  monthly_token_limit: number | null;
  daily_token_limit: number | null;
  budget_tier_id: string | null;
  monthly_budget_usd: number | null;
  notes: string | null;
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
  usage_year: number;
  usage_month: number;
  estimated_cost_usd: number | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  company_id: string | null;
  department_id: string | null;
}

interface Company {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  company_id: string;
}

interface MonthlyUsage {
  user_id: string;
  full_name: string;
  email: string;
  year: number;
  month: number;
  total_tokens: number;
  total_cost: number;
  request_count: number;
  budget_limit: number | null;
  tier_name: string | null;
}

export default function AdminAIUsagePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [editTierDialogOpen, setEditTierDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<AIBudgetTier | null>(null);
  const [editTierBudget, setEditTierBudget] = useState("");
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editUserSettings, setEditUserSettings] = useState({
    is_enabled: true,
    budget_tier_id: "",
    custom_budget: "",
  });

  const breadcrumbItems = [
    { label: t("common.home"), href: "/" },
    { label: t("admin.title"), href: "/admin" },
    { label: t("admin.modules.aiUsage.title") },
  ];

  // Fetch budget tiers
  const { data: budgetTiers = [] } = useQuery({
    queryKey: ["ai-budget-tiers"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("ai_budget_tiers")
        .select("*")
        .order("monthly_budget_usd", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as AIBudgetTier[];
    },
  });

  // Fetch usage logs with year/month
  const { data: usageLogs = [] } = useQuery({
    queryKey: ["ai-usage-logs", selectedYear, selectedMonth],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("ai_usage_logs")
        .select("*")
        .eq("usage_year", selectedYear)
        .eq("usage_month", selectedMonth)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AIUsageLog[];
    },
  });

  // Fetch user settings
  const { data: userSettings = [] } = useQuery({
    queryKey: ["ai-user-settings"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("ai_user_settings")
        .select("*");
      if (error) throw error;
      return data as AIUserSetting[];
    },
  });

  // Fetch companies
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["companies-for-ai"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Company[];
    },
  });

  // Fetch departments
  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["departments-for-ai", selectedCompany],
    queryFn: async () => {
      let query = supabase
        .from("departments")
        .select("id, name, company_id")
        .eq("is_active", true)
        .order("name");
      
      if (selectedCompany !== "all") {
        query = query.eq("company_id", selectedCompany);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Department[];
    },
  });

  // Fetch profiles
  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["profiles-for-ai"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("id, full_name, email, company_id, department_id");
      if (error) throw error;
      return (data || []) as Profile[];
    },
  });

  // Calculate monthly usage per user
  const monthlyUsage: MonthlyUsage[] = profiles
    .filter(profile => {
      if (selectedCompany !== "all" && profile.company_id !== selectedCompany) return false;
      if (selectedDepartment !== "all" && profile.department_id !== selectedDepartment) return false;
      return true;
    })
    .map(profile => {
      const userLogs = usageLogs.filter(log => log.user_id === profile.id);
      const userSetting = userSettings.find(s => s.user_id === profile.id);
      const tier = userSetting?.budget_tier_id 
        ? budgetTiers.find(t => t.id === userSetting.budget_tier_id)
        : null;
      
      const totalTokens = userLogs.reduce((sum, log) => sum + log.total_tokens, 0);
      const totalCost = userLogs.reduce((sum, log) => sum + (log.estimated_cost_usd || 0), 0);
      const budgetLimit = userSetting?.monthly_budget_usd ?? tier?.monthly_budget_usd ?? null;

      return {
        user_id: profile.id,
        full_name: profile.full_name || "",
        email: profile.email || "",
        year: selectedYear,
        month: selectedMonth,
        total_tokens: totalTokens,
        total_cost: totalCost,
        request_count: userLogs.length,
        budget_limit: budgetLimit,
        tier_name: tier?.tier_name ?? null,
      };
    })
    .filter(u => 
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.total_cost - a.total_cost);

  // Update budget tier mutation
  const updateTierMutation = useMutation({
    mutationFn: async ({ tierId, budget }: { tierId: string; budget: number | null }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("ai_budget_tiers")
        .update({ monthly_budget_usd: budget, updated_at: new Date().toISOString() })
        .eq("id", tierId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-budget-tiers"] });
      toast.success(t("admin.modules.aiUsage.tierUpdated"));
      setEditTierDialogOpen(false);
    },
    onError: () => {
      toast.error(t("common.error"));
    },
  });

  // Update user settings mutation
  const updateUserSettingsMutation = useMutation({
    mutationFn: async (data: { userId: string; settings: Partial<AIUserSetting> }) => {
      const existingSetting = userSettings.find(s => s.user_id === data.userId);
      
      if (existingSetting) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from("ai_user_settings")
          .update({
            is_enabled: data.settings.is_enabled,
            voice_enabled: data.settings.voice_enabled,
            budget_tier_id: data.settings.budget_tier_id || null,
            monthly_budget_usd: data.settings.monthly_budget_usd,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", data.userId);
        if (error) throw error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from("ai_user_settings")
          .insert({
            user_id: data.userId,
            is_enabled: data.settings.is_enabled ?? true,
            voice_enabled: data.settings.voice_enabled ?? false,
            budget_tier_id: data.settings.budget_tier_id || null,
            monthly_budget_usd: data.settings.monthly_budget_usd,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-user-settings"] });
      toast.success(t("admin.modules.aiUsage.settingsUpdated"));
      setEditUserDialogOpen(false);
    },
    onError: () => {
      toast.error(t("common.error"));
    },
  });

  // Toggle user enabled
  const toggleUserEnabled = (userId: string, currentEnabled: boolean) => {
    updateUserSettingsMutation.mutate({
      userId,
      settings: { is_enabled: !currentEnabled }
    });
  };

  // Toggle user voice enabled
  const toggleUserVoice = (userId: string, currentVoiceEnabled: boolean) => {
    updateUserSettingsMutation.mutate({
      userId,
      settings: { voice_enabled: !currentVoiceEnabled }
    });
  };

  const handleCompanyChange = (value: string) => {
    setSelectedCompany(value);
    setSelectedDepartment("all");
  };

  const openEditTier = (tier: AIBudgetTier) => {
    setSelectedTier(tier);
    setEditTierBudget(tier.monthly_budget_usd?.toString() || "");
    setEditTierDialogOpen(true);
  };

  const saveTier = () => {
    if (!selectedTier) return;
    const budget = editTierBudget.trim() === "" ? null : parseFloat(editTierBudget);
    updateTierMutation.mutate({ tierId: selectedTier.id, budget });
  };

  const openEditUser = (userId: string) => {
    const setting = userSettings.find(s => s.user_id === userId);
    setSelectedUserId(userId);
    setEditUserSettings({
      is_enabled: setting?.is_enabled ?? true,
      budget_tier_id: setting?.budget_tier_id || "",
      custom_budget: setting?.monthly_budget_usd?.toString() || "",
    });
    setEditUserDialogOpen(true);
  };

  const saveUserSettings = () => {
    if (!selectedUserId) return;
    updateUserSettingsMutation.mutate({
      userId: selectedUserId,
      settings: {
        is_enabled: editUserSettings.is_enabled,
        budget_tier_id: editUserSettings.budget_tier_id || null,
        monthly_budget_usd: editUserSettings.custom_budget ? parseFloat(editUserSettings.custom_budget) : null,
      }
    });
  };

  // Calculate stats
  const totalCostThisMonth = usageLogs.reduce((sum, log) => sum + (log.estimated_cost_usd || 0), 0);
  const totalTokensThisMonth = usageLogs.reduce((sum, log) => sum + log.total_tokens, 0);
  const totalRequests = usageLogs.length;
  const activeUsers = new Set(usageLogs.map(log => log.user_id)).size;

  const years = [2024, 2025, 2026];
  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
    { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
    { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }
  ];

  const getProfile = (userId: string) => profiles.find(p => p.id === userId);
  const getUserSetting = (userId: string) => userSettings.find(s => s.user_id === userId);

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("admin.modules.aiUsage.title")}</h1>
              <p className="text-muted-foreground">{t("admin.modules.aiUsage.description")}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">{t("common.company")}</Label>
              <Select value={selectedCompany} onValueChange={handleCompanyChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("common.allCompanies")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.allCompanies")}</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">{t("common.department")}</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("common.allDepartments")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.allDepartments")}</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Period Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t("admin.modules.aiUsage.monthlyBreakdown")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label>{t("admin.modules.aiUsage.year")}:</Label>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label>{t("admin.modules.aiUsage.month")}:</Label>
                <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.modules.aiUsage.estimatedCost")}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCostThisMonth.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{months.find(m => m.value === selectedMonth)?.label} {selectedYear}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.modules.aiUsage.totalTokens")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTokensThisMonth.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{t("admin.modules.aiUsage.thisMonth")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.modules.aiUsage.totalRequests")}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRequests}</div>
              <p className="text-xs text-muted-foreground">{t("admin.modules.aiUsage.thisMonth")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.modules.aiUsage.activeUsers")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">{t("admin.modules.aiUsage.usedAI")}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="usage" className="space-y-4">
          <TabsList>
            <TabsTrigger value="usage">{t("admin.modules.aiUsage.monthlyUsage")}</TabsTrigger>
            <TabsTrigger value="tiers">{t("admin.modules.aiUsage.budgetTiers")}</TabsTrigger>
            <TabsTrigger value="logs">{t("admin.modules.aiUsage.usageLogs")}</TabsTrigger>
            <TabsTrigger value="settings">{t("common.settings")}</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("admin.modules.aiUsage.monthlyUsage")}</CardTitle>
                    <CardDescription>{months.find(m => m.value === selectedMonth)?.label} {selectedYear}</CardDescription>
                  </div>
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
                      <TableHead>{t("admin.modules.aiUsage.tierName")}</TableHead>
                      <TableHead className="text-right">{t("admin.modules.aiUsage.totalRequests")}</TableHead>
                      <TableHead className="text-right">{t("admin.modules.aiUsage.totalTokens")}</TableHead>
                      <TableHead className="text-right">{t("admin.modules.aiUsage.actualUsage")}</TableHead>
                      <TableHead className="text-right">{t("admin.modules.aiUsage.monthlyBudget")}</TableHead>
                      <TableHead className="text-center">{t("common.status")}</TableHead>
                      <TableHead className="text-right">{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyUsage.map((usage) => {
                      const isOverBudget = usage.budget_limit !== null && usage.total_cost > usage.budget_limit;
                      const userSetting = getUserSetting(usage.user_id);
                      const isEnabled = userSetting?.is_enabled ?? true;
                      
                      return (
                        <TableRow key={usage.user_id}>
                          <TableCell className="font-medium">{usage.full_name}</TableCell>
                          <TableCell>{usage.email}</TableCell>
                          <TableCell>
                            {usage.tier_name ? (
                              <Badge variant="outline">{usage.tier_name}</Badge>
                            ) : "-"}
                          </TableCell>
                          <TableCell className="text-right">{usage.request_count}</TableCell>
                          <TableCell className="text-right">{usage.total_tokens.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={isOverBudget ? "text-destructive" : ""}>
                              ${usage.total_cost.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {usage.budget_limit !== null ? `$${usage.budget_limit.toFixed(2)}` : t("admin.modules.aiUsage.unlimitedBudget")}
                          </TableCell>
                          <TableCell className="text-center">
                            {isOverBudget && (
                              <Badge variant="destructive">{t("admin.modules.aiUsage.overBudget")}</Badge>
                            )}
                            {!isEnabled && (
                              <Badge variant="secondary">{t("common.disabled")}</Badge>
                            )}
                            {!isOverBudget && isEnabled && usage.request_count > 0 && (
                              <Badge variant="default">{t("common.active")}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleUserVoice(usage.user_id, userSetting?.voice_enabled ?? false)}
                                title={userSetting?.voice_enabled ? t("admin.modules.aiUsage.disableVoice", "Disable voice") : t("admin.modules.aiUsage.enableVoice", "Enable voice")}
                                className={userSetting?.voice_enabled ? "text-primary" : "text-muted-foreground"}
                              >
                                {userSetting?.voice_enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant={isEnabled ? "destructive" : "default"}
                                size="sm"
                                onClick={() => toggleUserEnabled(usage.user_id, isEnabled)}
                              >
                                {isEnabled ? t("admin.modules.aiUsage.disableAccess") : t("admin.modules.aiUsage.enableAccess")}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditUser(usage.user_id)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {monthlyUsage.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          {t("common.noData")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tiers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.modules.aiUsage.budgetTiersTitle")}</CardTitle>
                <CardDescription>{t("admin.modules.aiUsage.budgetTiersDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.modules.aiUsage.tierName")}</TableHead>
                      <TableHead>{t("admin.modules.aiUsage.tierCode")}</TableHead>
                      <TableHead>{t("common.description")}</TableHead>
                      <TableHead className="text-right">{t("admin.modules.aiUsage.monthlyBudget")}</TableHead>
                      <TableHead className="text-right">{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgetTiers.map((tier) => (
                      <TableRow key={tier.id}>
                        <TableCell className="font-medium">{tier.tier_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tier.tier_code}</Badge>
                        </TableCell>
                        <TableCell>{tier.description || "-"}</TableCell>
                        <TableCell className="text-right font-medium">
                          {tier.monthly_budget_usd !== null ? `$${tier.monthly_budget_usd.toFixed(2)}` : t("admin.modules.aiUsage.unlimitedBudget")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEditTier(tier)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
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
                <CardTitle>{t("admin.modules.aiUsage.recentLogs")}</CardTitle>
                <CardDescription>{months.find(m => m.value === selectedMonth)?.label} {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.user")}</TableHead>
                      <TableHead>{t("admin.modules.aiUsage.model")}</TableHead>
                      <TableHead>{t("admin.modules.aiUsage.feature")}</TableHead>
                      <TableHead className="text-right">{t("admin.modules.aiUsage.totalTokens")}</TableHead>
                      <TableHead className="text-right">{t("admin.modules.aiUsage.estimatedCost")}</TableHead>
                      <TableHead>{t("common.date")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usageLogs.slice(0, 50).map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{getProfile(log.user_id)?.full_name || "-"}</TableCell>
                        <TableCell><Badge variant="outline">{log.model}</Badge></TableCell>
                        <TableCell>{log.feature || "-"}</TableCell>
                        <TableCell className="text-right">{log.total_tokens.toLocaleString()}</TableCell>
                        <TableCell className="text-right">${(log.estimated_cost_usd || 0).toFixed(4)}</TableCell>
                        <TableCell>{format(new Date(log.created_at), "PPp")}</TableCell>
                      </TableRow>
                    ))}
                    {usageLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {t("admin.modules.aiUsage.noLogs")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  {t("admin.modules.aiUsage.voiceSettings", "Voice Settings")}
                </CardTitle>
                <CardDescription>
                  {t("admin.modules.aiUsage.voiceSettingsDescription", "Configure ElevenLabs API key for AI voice responses")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <Volume2 className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-medium">{t("admin.modules.aiUsage.elevenLabsApiKey", "ElevenLabs API Key")}</p>
                      <p className="text-sm text-muted-foreground">
                        {t("admin.modules.aiUsage.elevenLabsDescription", "To enable natural voice responses for the AI Assistant, add your ElevenLabs API key. Users with voice enabled will hear spoken responses.")}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      toast.info(t("admin.modules.aiUsage.contactAdmin", "Please contact your workspace admin to configure the ElevenLabs API key in the project secrets."));
                    }}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    {t("admin.modules.aiUsage.configureApiKey", "Configure API Key")}
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{t("admin.modules.aiUsage.voiceUsageNote", "Note: Voice responses will incur additional costs based on ElevenLabs pricing (~$0.003-0.006 per response). Enable voice access per user in the Monthly Usage tab using the voice icon.")}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Tier Dialog */}
        <Dialog open={editTierDialogOpen} onOpenChange={setEditTierDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("admin.modules.aiUsage.editTier")} - {selectedTier?.tier_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("admin.modules.aiUsage.monthlyBudget")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={t("admin.modules.aiUsage.unlimitedBudget")}
                  value={editTierBudget}
                  onChange={(e) => setEditTierBudget(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Leave empty for unlimited budget</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditTierDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={saveTier}>{t("common.save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Settings Dialog */}
        <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("admin.modules.aiUsage.editSettings")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("admin.modules.aiUsage.assignTier")}</Label>
                <Select 
                  value={editUserSettings.budget_tier_id} 
                  onValueChange={(v) => setEditUserSettings(prev => ({ ...prev, budget_tier_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No tier assigned</SelectItem>
                    {budgetTiers.map((tier) => (
                      <SelectItem key={tier.id} value={tier.id}>
                        {tier.tier_name} ({tier.monthly_budget_usd !== null ? `$${tier.monthly_budget_usd}` : "Unlimited"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("admin.modules.aiUsage.customBudget")} (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Override tier budget"
                  value={editUserSettings.custom_budget}
                  onChange={(e) => setEditUserSettings(prev => ({ ...prev, custom_budget: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">Leave empty to use tier budget</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditUserDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={saveUserSettings}>{t("common.save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
