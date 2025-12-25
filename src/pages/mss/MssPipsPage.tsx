import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2, AlertTriangle, Eye, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useLanguage } from "@/hooks/useLanguage";

interface PIP {
  id: string;
  employee_id: string;
  manager_id: string | null;
  title: string;
  reason: string;
  start_date: string;
  end_date: string;
  status: string;
  improvement_areas: string[];
  success_criteria: string | null;
  employee?: { full_name: string };
  milestones?: { id: string; status: string }[];
}

interface DirectReport {
  employee_id: string;
  employee_name: string;
}

export default function MssPipsPage() {
  const { t } = useLanguage();
  const { user, company } = useAuth();
  const [directReports, setDirectReports] = useState<DirectReport[]>([]);
  const [pips, setPips] = useState<PIP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPip, setSelectedPip] = useState<PIP | null>(null);
  const [formData, setFormData] = useState({
    employee_id: "",
    title: "",
    reason: "",
    start_date: "",
    end_date: "",
    improvement_areas: "",
    success_criteria: "",
  });

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: reports } = await supabase.rpc("get_manager_direct_reports", {
        p_manager_id: user?.id,
      });
      setDirectReports(reports || []);

      const reportIds = (reports || []).map((r: DirectReport) => r.employee_id);

      if (reportIds.length > 0) {
        const { data: pipData } = await supabase
          .from("performance_improvement_plans")
          .select(`
            *,
            employee:profiles!performance_improvement_plans_employee_id_fkey(full_name),
            milestones:pip_milestones(id, status)
          `)
          .in("employee_id", reportIds)
          .order("created_at", { ascending: false });

        setPips((pipData as PIP[]) || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.employee_id || !formData.title || !formData.reason || !formData.start_date || !formData.end_date) {
      toast.error(t('mss.teamPips.fillRequired'));
      return;
    }

    try {
      const { error } = await supabase.from("performance_improvement_plans").insert({
        employee_id: formData.employee_id,
        manager_id: user?.id,
        title: formData.title,
        reason: formData.reason,
        start_date: formData.start_date,
        end_date: formData.end_date,
        improvement_areas: formData.improvement_areas.split(",").map((s) => s.trim()).filter(Boolean),
        success_criteria: formData.success_criteria || null,
        company_id: company?.id,
        status: "active",
      });

      if (error) throw error;

      toast.success(t('mss.teamPips.pipCreated'));
      setDialogOpen(false);
      setFormData({
        employee_id: "",
        title: "",
        reason: "",
        start_date: "",
        end_date: "",
        improvement_areas: "",
        success_criteria: "",
      });
      fetchData();
    } catch (error) {
      console.error("Error creating PIP:", error);
      toast.error(t('mss.teamPips.failedCreate'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-warning/10 text-warning";
      case "completed": return "bg-success/10 text-success";
      case "extended": return "bg-info/10 text-info";
      case "terminated": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const calculateProgress = (pip: PIP) => {
    if (!pip.milestones || pip.milestones.length === 0) return 0;
    const completed = pip.milestones.filter((m) => m.status === "completed").length;
    return Math.round((completed / pip.milestones.length) * 100);
  };

  const activePips = pips.filter((p) => p.status === "active");

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
            { label: t('navigation.mss'), href: "/mss" },
            { label: t('mss.teamPips.title') },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('mss.teamPips.title')}</h1>
            <p className="text-muted-foreground">
              {t('mss.teamPips.subtitle')}
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)} disabled={directReports.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            {t('mss.teamPips.createPip')}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('mss.teamPips.directReports')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{directReports.length}</p>
              <p className="text-sm text-muted-foreground">{t('mss.teamPips.teamMembers')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t('mss.teamPips.activePips')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{activePips.length}</p>
              <p className="text-sm text-muted-foreground">{t('mss.teamPips.inProgress')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{t('mss.teamPips.totalPips')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pips.length}</p>
              <p className="text-sm text-muted-foreground">{t('mss.teamPips.allTime')}</p>
            </CardContent>
          </Card>
        </div>

        {directReports.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {t('mss.teamPips.noDirectReports')}
            </CardContent>
          </Card>
        ) : pips.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {t('mss.teamPips.noPips')}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('mss.teamPips.employee')}</TableHead>
                  <TableHead>{t('mss.teamPips.pipTitle')}</TableHead>
                  <TableHead>{t('mss.teamPips.status')}</TableHead>
                  <TableHead>{t('mss.teamPips.period')}</TableHead>
                  <TableHead>{t('mss.teamPips.progress')}</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pips.map((pip) => (
                  <TableRow key={pip.id}>
                    <TableCell className="font-medium">{pip.employee?.full_name}</TableCell>
                    <TableCell>{pip.title}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(pip.status)} variant="outline">
                        {pip.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateForDisplay(pip.start_date, "MMM d")} - {formatDateForDisplay(pip.end_date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={calculateProgress(pip)} className="w-20 h-2" />
                        <span className="text-sm text-muted-foreground">{calculateProgress(pip)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedPip(pip)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Create PIP Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('mss.teamPips.createPipTitle')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label>{t('mss.teamPips.employeeLabel')} *</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('mss.teamPips.selectTeamMember')} />
                  </SelectTrigger>
                  <SelectContent>
                    {directReports.map((report) => (
                      <SelectItem key={report.employee_id} value={report.employee_id}>
                        {report.employee_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('mss.teamPips.titleLabel')} *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('mss.teamPips.pipTitlePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('mss.teamPips.reason')} *</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder={t('mss.teamPips.reasonPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('mss.teamPips.startDate')} *</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('mss.teamPips.endDate')} *</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('mss.teamPips.improvementAreas')}</Label>
                <Input
                  value={formData.improvement_areas}
                  onChange={(e) => setFormData({ ...formData, improvement_areas: e.target.value })}
                  placeholder={t('mss.teamPips.improvementAreasPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('mss.teamPips.successCriteria')}</Label>
                <Textarea
                  value={formData.success_criteria}
                  onChange={(e) => setFormData({ ...formData, success_criteria: e.target.value })}
                  placeholder={t('mss.teamPips.successCriteriaPlaceholder')}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSubmit}>{t('mss.teamPips.createPip')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View PIP Dialog */}
        <Dialog open={!!selectedPip} onOpenChange={() => setSelectedPip(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedPip?.title}</DialogTitle>
            </DialogHeader>
            {selectedPip && (
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">{t('mss.teamPips.employee')}</Label>
                  <p className="font-medium">{selectedPip.employee?.full_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('mss.teamPips.status')}</Label>
                  <Badge className={getStatusColor(selectedPip.status)} variant="outline">
                    {selectedPip.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('mss.teamPips.period')}</Label>
                  <p>
                    {formatDateForDisplay(selectedPip.start_date)} -{" "}
                    {formatDateForDisplay(selectedPip.end_date)}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t('mss.teamPips.reason')}</Label>
                  <p>{selectedPip.reason}</p>
                </div>
                {selectedPip.improvement_areas?.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">{t('mss.teamPips.improvementAreas')}</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedPip.improvement_areas.map((area, i) => (
                        <Badge key={i} variant="secondary">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedPip.success_criteria && (
                  <div>
                    <Label className="text-muted-foreground">{t('mss.teamPips.successCriteria')}</Label>
                    <p>{selectedPip.success_criteria}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">{t('mss.teamPips.progress')}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={calculateProgress(selectedPip)} className="flex-1 h-2" />
                    <span className="text-sm">{calculateProgress(selectedPip)}%</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPip(null)}>
                {t('common.close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
