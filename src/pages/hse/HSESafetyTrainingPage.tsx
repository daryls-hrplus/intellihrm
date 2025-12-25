import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useHSE, HSESafetyTraining, HSETrainingRecord } from "@/hooks/useHSE";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/hooks/useLanguage";
import {
  HardHat,
  Plus,
  Search,
  ChevronLeft,
  GraduationCap,
  Clock,
  Users,
  AlertTriangle,
} from "lucide-react";
import { addMonths, isPast } from "date-fns";
import { getTodayString, toDateString, formatDateForDisplay } from "@/utils/dateUtils";
import { NavLink } from "react-router-dom";
import { toast } from "sonner";

const trainingTypes = [
  { value: "induction", label: "Induction" },
  { value: "refresher", label: "Refresher" },
  { value: "specialized", label: "Specialized" },
  { value: "certification", label: "Certification" },
];

const recordStatusOptions = [
  { value: "scheduled", label: "Scheduled", color: "bg-info/10 text-info" },
  { value: "in_progress", label: "In Progress", color: "bg-warning/10 text-warning" },
  { value: "completed", label: "Completed", color: "bg-success/10 text-success" },
  { value: "expired", label: "Expired", color: "bg-destructive/10 text-destructive" },
  { value: "failed", label: "Failed", color: "bg-destructive/10 text-destructive" },
];

export default function HSESafetyTrainingPage() {
  const { t } = useLanguage();
  const [companyId, setCompanyId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("courses");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState<HSESafetyTraining | null>(null);
  const [formData, setFormData] = useState<Partial<HSESafetyTraining>>({});
  const [recordFormData, setRecordFormData] = useState<Partial<HSETrainingRecord>>({});

  const queryClient = useQueryClient();

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("id, name").eq("is_active", true);
      return data || [];
    },
  });

  const { data: employees = [] } = useQuery<{ id: string; full_name: string }[]>({
    queryKey: ["employees", companyId],
    queryFn: async (): Promise<{ id: string; full_name: string }[]> => {
      if (!companyId) return [];
      const query = supabase.from("profiles").select("id, full_name") as any;
      const result = await query.eq("company_id", companyId).eq("is_active", true);
      return result.data || [];
    },
    enabled: !!companyId,
  });

  const { safetyTrainings, trainingsLoading, createSafetyTraining, trainingRecords, recordsLoading } =
    useHSE(companyId || undefined);

  const createTrainingRecord = useMutation({
    mutationFn: async (data: Partial<HSETrainingRecord>) => {
      const { training, employee, attachments, ...rest } = data;
      const { data: result, error } = await supabase
        .from("hse_training_records")
        .insert([{ ...rest, attachments: attachments || [] } as never])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hse-training-records"] });
      toast.success("Training record created successfully");
    },
    onError: (error) => toast.error(`Failed to create record: ${error.message}`),
  });

  const filteredTrainings = safetyTrainings.filter(
    (training) =>
      training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRecords = trainingRecords.filter(
    (record) =>
      record.training?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (training?: HSESafetyTraining) => {
    if (training) {
      setSelectedTraining(training);
      setFormData(training);
    } else {
      setSelectedTraining(null);
      setFormData({
        company_id: companyId,
        training_type: "induction",
        is_mandatory: false,
        is_active: true,
        start_date: getTodayString(),
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSafetyTraining.mutateAsync(formData);
    setDialogOpen(false);
  };

  const handleOpenRecordDialog = (training?: HSESafetyTraining) => {
    setRecordFormData({
      company_id: companyId,
      training_id: training?.id,
      training_date: getTodayString(),
      status: "scheduled",
      expiry_date: training?.frequency_months
        ? toDateString(addMonths(new Date(), training.frequency_months))
        : undefined,
    });
    setRecordDialogOpen(true);
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTrainingRecord.mutateAsync(recordFormData);
    setRecordDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const option = recordStatusOptions.find((s) => s.value === status);
    return <Badge className={option?.color}>{option?.label || status}</Badge>;
  };

  // Stats
  const mandatoryTrainings = safetyTrainings.filter((t) => t.is_mandatory).length;
  const completedRecords = trainingRecords.filter((r) => r.status === "completed").length;
  const expiredRecords = trainingRecords.filter(
    (r) => r.expiry_date && isPast(new Date(r.expiry_date))
  ).length;
  const pendingRecords = trainingRecords.filter(
    (r) => r.status === "scheduled" || r.status === "in_progress"
  ).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <NavLink to="/hse" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
          </NavLink>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
            <HardHat className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("hseModule.safetyTraining.title")}</h1>
            <p className="text-muted-foreground">{t("hseModule.safetyTraining.subtitle")}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("hseModule.stats.mandatoryCourses")}</p>
                  <p className="text-2xl font-bold">{mandatoryTrainings}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("hseModule.stats.completed")}</p>
                  <p className="text-2xl font-bold text-success">{completedRecords}</p>
                </div>
                <Users className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("hseModule.stats.pending")}</p>
                  <p className="text-2xl font-bold text-warning">{pendingRecords}</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("hseModule.stats.expired")}</p>
                  <p className="text-2xl font-bold text-destructive">{expiredRecords}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder={t("hseModule.common.selectCompany")} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {activeTab === "courses" && (
                <Button onClick={() => handleOpenDialog()} disabled={!companyId}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("hseModule.safetyTraining.addTraining")}
                </Button>
              )}
              {activeTab === "records" && (
                <Button onClick={() => handleOpenRecordDialog()} disabled={!companyId}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("hseModule.safetyTraining.addRecord")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="courses">{t("hseModule.safetyTraining.tabs.courses")}</TabsTrigger>
            <TabsTrigger value="records">{t("hseModule.safetyTraining.tabs.records")}</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <Card>
              <CardContent className="p-0">
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.code")}</TableHead>
                  <TableHead>{t("hseModule.common.title")}</TableHead>
                  <TableHead>{t("common.type")}</TableHead>
                  <TableHead>{t("hseModule.safetyTraining.duration")}</TableHead>
                  <TableHead>{t("hseModule.safetyTraining.frequency")}</TableHead>
                  <TableHead>{t("hseModule.safetyTraining.mandatory")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
                  <TableBody>
                {trainingsLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {t("hseModule.common.loading")}
                    </TableCell>
                  </TableRow>
                ) : filteredTrainings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {t("hseModule.safetyTraining.noTrainingCourses")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTrainings.map((training) => (
                        <TableRow key={training.id}>
                          <TableCell className="font-mono text-sm">{training.code}</TableCell>
                          <TableCell className="font-medium">{training.title}</TableCell>
                          <TableCell>
                            {trainingTypes.find((t) => t.value === training.training_type)?.label}
                          </TableCell>
                          <TableCell>
                            {training.duration_hours ? `${training.duration_hours}h` : "-"}
                          </TableCell>
                          <TableCell>
                            {training.frequency_months
                              ? t("hseModule.safetyTraining.everyMonths", { months: training.frequency_months })
                              : t("hseModule.safetyTraining.oneTime")}
                          </TableCell>
                          <TableCell>
                            {training.is_mandatory ? (
                              <Badge className="bg-destructive/10 text-destructive">{t("hseModule.safetyTraining.required")}</Badge>
                            ) : (
                              <Badge variant="outline">{t("hseModule.safetyTraining.optional")}</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {training.is_active ? (
                              <Badge className="bg-success/10 text-success">Active</Badge>
                            ) : (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenRecordDialog(training)}
                            >
                              {t("hseModule.safetyTraining.assign")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records">
            <Card>
              <CardContent className="p-0">
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.employee")}</TableHead>
                  <TableHead>{t("training.title")}</TableHead>
                  <TableHead>{t("hseModule.safetyTraining.trainingDate")}</TableHead>
                  <TableHead>{t("hseModule.safetyTraining.expiryDate")}</TableHead>
                  <TableHead>{t("hseModule.safetyTraining.score")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("hseModule.safetyTraining.certificate")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recordsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {t("hseModule.common.loading")}
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t("hseModule.safetyTraining.noTrainingRecords")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.employee?.full_name}
                          </TableCell>
                          <TableCell>{record.training?.title}</TableCell>
                          <TableCell>
                            {formatDateForDisplay(record.training_date)}
                          </TableCell>
                          <TableCell>
                            {record.expiry_date ? (
                              <span
                                className={
                                  isPast(new Date(record.expiry_date)) ? "text-destructive" : ""
                                }
                              >
                                {formatDateForDisplay(record.expiry_date)}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {record.score !== null ? `${record.score}%` : "-"}
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>{record.certificate_number || "-"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Training Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedTraining ? t("hseModule.safetyTraining.editTraining") : t("hseModule.safetyTraining.addTraining")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input
                    value={formData.code || ""}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select
                    value={formData.training_type}
                    onValueChange={(v) => setFormData({ ...formData, training_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {trainingTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (hours)</Label>
                  <Input
                    type="number"
                    value={formData.duration_hours || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, duration_hours: parseFloat(e.target.value) || null })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency (months)</Label>
                  <Input
                    type="number"
                    value={formData.frequency_months || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        frequency_months: parseInt(e.target.value) || null,
                      })
                    }
                    placeholder="Leave empty for one-time"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_mandatory || false}
                    onCheckedChange={(v) => setFormData({ ...formData, is_mandatory: v })}
                  />
                  <Label>Mandatory</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active !== false}
                    onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createSafetyTraining.isPending}>
                  {selectedTraining ? "Update" : "Create"} Training
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Record Dialog */}
        <Dialog open={recordDialogOpen} onOpenChange={setRecordDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Training Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRecordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select
                  value={recordFormData.employee_id || ""}
                  onValueChange={(v) => setRecordFormData({ ...recordFormData, employee_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Training *</Label>
                <Select
                  value={recordFormData.training_id || ""}
                  onValueChange={(v) => {
                    const training = safetyTrainings.find((t) => t.id === v);
                    setRecordFormData({
                      ...recordFormData,
                      training_id: v,
                      expiry_date: training?.frequency_months
                        ? toDateString(addMonths(new Date(), training.frequency_months))
                        : undefined,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select training" />
                  </SelectTrigger>
                  <SelectContent>
                    {safetyTrainings.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Training Date *</Label>
                  <Input
                    type="date"
                    value={recordFormData.training_date || ""}
                    onChange={(e) =>
                      setRecordFormData({ ...recordFormData, training_date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={recordFormData.expiry_date || ""}
                    onChange={(e) =>
                      setRecordFormData({ ...recordFormData, expiry_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={recordFormData.status}
                  onValueChange={(v) => setRecordFormData({ ...recordFormData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recordStatusOptions.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Score (%)</Label>
                  <Input
                    type="number"
                    value={recordFormData.score || ""}
                    onChange={(e) =>
                      setRecordFormData({
                        ...recordFormData,
                        score: parseFloat(e.target.value) || null,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Trainer Name</Label>
                  <Input
                    value={recordFormData.trainer_name || ""}
                    onChange={(e) =>
                      setRecordFormData({ ...recordFormData, trainer_name: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setRecordDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTrainingRecord.isPending}>
                  Create Record
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
