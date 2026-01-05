import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, differenceInDays, isPast, isFuture } from "date-fns";
import { Plus, ShieldCheck, AlertTriangle, CheckCircle, Clock, FileText, Building2 } from "lucide-react";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
}

interface ComplianceItem {
  id: string;
  company_id: string | null;
  title: string;
  category: string;
  description: string | null;
  deadline: string;
  status: "compliant" | "pending" | "overdue" | "in_progress";
  responsible: string | null;
  priority: string;
  progress: number;
}

const categories = [
  "Labor Law",
  "Safety Regulations",
  "Tax Compliance",
  "Data Protection",
  "Immigration",
  "Benefits",
  "Training",
  "Licensing",
];

export default function ComplianceTrackerPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { company, isAdmin, hasRole } = useAuth();
  const isAdminOrHR = isAdmin || hasRole("hr_manager");
  const [selectedCompany, setSelectedCompany] = useState<string>(company?.id || "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    deadline: "",
    responsible: "",
    priority: "medium",
  });

  // Fetch companies for filter
  const { data: companies = [] } = useQuery({
    queryKey: ["companies-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Company[];
    },
    enabled: isAdminOrHR,
  });

  // Fetch compliance items
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["compliance-items", selectedCompany],
    queryFn: async () => {
      let query = supabase
        .from("compliance_items")
        .select("*")
        .order("deadline", { ascending: true });
      
      if (selectedCompany) {
        query = query.eq("company_id", selectedCompany);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ComplianceItem[];
    },
  });

  // Create compliance item mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("compliance_items")
        .insert({
          title: data.title,
          category: data.category,
          description: data.description || null,
          deadline: data.deadline,
          responsible: data.responsible || null,
          priority: data.priority,
          company_id: selectedCompany || company?.id || null,
          status: "pending",
          progress: 0,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-items"] });
      setDialogOpen(false);
      setFormData({ title: "", category: "", description: "", deadline: "", responsible: "", priority: "medium" });
      toast.success(t("common.success"));
    },
    onError: (error) => {
      toast.error("Failed to create: " + error.message);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "in_progress": return "bg-blue-500";
      case "overdue": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "in_progress": return <Clock className="h-4 w-4" />;
      case "overdue": return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDaysRemaining = (deadline: string) => {
    const days = differenceInDays(new Date(deadline), new Date());
    if (days < 0) return t("hrHub.daysOverdue", { days: Math.abs(days) });
    if (days === 0) return t("hrHub.dueToday");
    return t("hrHub.daysRemaining", { days });
  };

  const statusLabels: Record<string, string> = {
    compliant: t("hrHub.compliant"),
    pending: t("hrHub.pending"),
    in_progress: t("hrHub.inProgress"),
    overdue: t("hrHub.overdue"),
  };

  const filteredItems = items.filter(item => {
    if (activeTab === "all") return true;
    if (activeTab === "overdue") return item.status === "overdue";
    if (activeTab === "upcoming") return item.status === "pending" || item.status === "in_progress";
    if (activeTab === "compliant") return item.status === "compliant";
    return true;
  });

  const stats = {
    total: items.length,
    compliant: items.filter(i => i.status === "compliant").length,
    pending: items.filter(i => i.status === "pending" || i.status === "in_progress").length,
    overdue: items.filter(i => i.status === "overdue").length,
  };

  const overallCompliance = Math.round((stats.compliant / stats.total) * 100);

  const breadcrumbItems = [
    { label: t("hrHub.title"), href: "/hr-hub" },
    { label: t("hrHub.compliance") },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">{t("hrHub.compliance")}</h1>
            <p className="text-muted-foreground">{t("hrHub.complianceSubtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            {isAdminOrHR && companies.length > 0 && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("hrHub.addRequirement")}
            </Button>
          </div>
        </div>

        {/* Overall Compliance */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/20">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{t("hrHub.overallComplianceRate")}</h3>
                  <p className="text-sm text-muted-foreground">{t("hrHub.basedOnRequirements", { count: stats.total })}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-primary">{overallCompliance}%</p>
              </div>
            </div>
            <Progress value={overallCompliance} className="h-3" />
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">{t("common.total")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.compliant}</p>
                  <p className="text-sm text-muted-foreground">{t("hrHub.compliant")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">{t("hrHub.inProgress")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.overdue}</p>
                  <p className="text-sm text-muted-foreground">{t("hrHub.overdue")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">{t("common.all")} ({stats.total})</TabsTrigger>
                <TabsTrigger value="overdue">{t("hrHub.overdue")} ({stats.overdue})</TabsTrigger>
                <TabsTrigger value="upcoming">{t("hrHub.inProgress")} ({stats.pending})</TabsTrigger>
                <TabsTrigger value="compliant">{t("hrHub.compliant")} ({stats.compliant})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t("hrHub.noComplianceItems")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-semibold">{item.title}</h3>
                          <Badge variant="outline">{item.category}</Badge>
                          <Badge className={`${getStatusColor(item.status)} text-white`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(item.status)}
                              {statusLabels[item.status]}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{item.description || "-"}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{t("hrHub.responsible")}: {item.responsible || "-"}</span>
                          <span>•</span>
                          <span className={item.status === "overdue" ? "text-red-500 font-medium" : ""}>
                            {getDaysRemaining(item.deadline)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="text-sm text-muted-foreground mb-1">{t("hrHub.progress")}</p>
                        <p className="text-2xl font-bold">{item.progress}%</p>
                        <Progress value={item.progress} className="h-2 mt-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("hrHub.addComplianceRequirement")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t("common.name")} *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t("hrHub.requirementTitle")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("hrHub.category")}</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("common.select")} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t("hrHub.deadline")} *</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("hrHub.responsible")}</Label>
                  <Input
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    placeholder={t("hrHub.responsiblePlaceholder")}
                  />
                </div>
                <div>
                  <Label>{t("helpdesk.priorities.medium")}</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t("helpdesk.priorities.low")}</SelectItem>
                      <SelectItem value="medium">{t("helpdesk.priorities.medium")}</SelectItem>
                      <SelectItem value="high">{t("helpdesk.priorities.high")}</SelectItem>
                      <SelectItem value="urgent">{t("helpdesk.priorities.urgent")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>{t("common.description")}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("hrHub.requirementDescription")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button 
                onClick={() => createMutation.mutate(formData)}
                disabled={!formData.title || !formData.deadline || createMutation.isPending}
              >
                {t("hrHub.addRequirement")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
