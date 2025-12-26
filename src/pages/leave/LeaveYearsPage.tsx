import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/hooks/useLanguage";
import { useLeaveCompanyFilter, LeaveCompanyFilter } from "@/components/leave/LeaveCompanyFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  CalendarRange,
  Plus,
  MoreHorizontal,
  Edit,
  Lock,
  Unlock,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LeaveYear {
  id: string;
  company_id: string;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_closed: boolean;
  closed_at: string | null;
  closed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function LeaveYearsPage() {
  const { t } = useLanguage();
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const { selectedCompanyId, setSelectedCompanyId, isAdminOrHR } = useLeaveCompanyFilter();
  
  const effectiveCompanyId = selectedCompanyId || company?.id;

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<LeaveYear | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    start_date: "",
    end_date: "",
    is_current: false,
    notes: "",
  });

  // Fetch leave years
  const { data: leaveYears = [], isLoading } = useQuery({
    queryKey: ["leave-years", effectiveCompanyId],
    queryFn: async () => {
      if (!effectiveCompanyId) return [];
      
      const { data, error } = await supabase
        .from("leave_years")
        .select("*")
        .eq("company_id", effectiveCompanyId)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data as LeaveYear[];
    },
    enabled: !!effectiveCompanyId,
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<LeaveYear>) => {
      if (editingYear) {
        const { error } = await supabase
          .from("leave_years")
          .update({
            name: data.name,
            code: data.code,
            start_date: data.start_date,
            end_date: data.end_date,
            is_current: data.is_current,
            notes: data.notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingYear.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("leave_years")
          .insert([{
            company_id: effectiveCompanyId!,
            name: data.name!,
            code: data.code!,
            start_date: data.start_date!,
            end_date: data.end_date!,
            is_current: data.is_current ?? false,
            notes: data.notes,
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-years"] });
      toast.success(editingYear ? "Leave year updated" : "Leave year created");
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Close mutation
  const closeMutation = useMutation({
    mutationFn: async (yearId: string) => {
      const { error } = await supabase
        .from("leave_years")
        .update({
          is_closed: true,
          closed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", yearId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-years"] });
      toast.success("Leave year closed");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Reopen mutation
  const reopenMutation = useMutation({
    mutationFn: async (yearId: string) => {
      const { error } = await supabase
        .from("leave_years")
        .update({
          is_closed: false,
          closed_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", yearId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-years"] });
      toast.success("Leave year reopened");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Set as current mutation
  const setCurrentMutation = useMutation({
    mutationFn: async (yearId: string) => {
      // First, unset all current
      await supabase
        .from("leave_years")
        .update({ is_current: false, updated_at: new Date().toISOString() })
        .eq("company_id", effectiveCompanyId);

      // Then set the selected one as current
      const { error } = await supabase
        .from("leave_years")
        .update({ is_current: true, updated_at: new Date().toISOString() })
        .eq("id", yearId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-years"] });
      toast.success("Current leave year updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (yearId: string) => {
      const { error } = await supabase
        .from("leave_years")
        .delete()
        .eq("id", yearId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-years"] });
      toast.success("Leave year deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleOpenDialog = (year?: LeaveYear) => {
    if (year) {
      setEditingYear(year);
      setFormData({
        name: year.name,
        code: year.code,
        start_date: year.start_date,
        end_date: year.end_date,
        is_current: year.is_current,
        notes: year.notes || "",
      });
    } else {
      setEditingYear(null);
      // Generate default values for new leave year
      const now = new Date();
      const startYear = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
      setFormData({
        name: `Leave Year ${startYear}/${startYear + 1}`,
        code: `LY${startYear}${startYear + 1}`,
        start_date: `${startYear}-04-01`,
        end_date: `${startYear + 1}-03-31`,
        is_current: false,
        notes: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingYear(null);
    setFormData({
      name: "",
      code: "",
      start_date: "",
      end_date: "",
      is_current: false,
      notes: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.code || !formData.start_date || !formData.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast.error("End date must be after start date");
      return;
    }

    saveMutation.mutate(formData);
  };

  const currentYear = leaveYears.find(y => y.is_current);
  const openYears = leaveYears.filter(y => !y.is_closed);
  const closedYears = leaveYears.filter(y => y.is_closed);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("leave.title"), href: "/leave" },
            { label: t("leave.leaveYears.title", "Leave Years") },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarRange className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("leave.leaveYears.title", "Leave Years")}
              </h1>
              <p className="text-muted-foreground">
                {t("leave.leaveYears.subtitle", "Configure leave year periods for entitlement tracking")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LeaveCompanyFilter
              selectedCompanyId={selectedCompanyId}
              onCompanyChange={setSelectedCompanyId}
            />
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              {t("leave.leaveYears.addNew", "Add Leave Year")}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("leave.leaveYears.currentYear", "Current Leave Year")}</CardDescription>
              <CardTitle className="text-xl">
                {currentYear?.name || t("leave.leaveYears.notSet", "Not Set")}
              </CardTitle>
            </CardHeader>
            {currentYear && (
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {formatDateForDisplay(currentYear.start_date, "MMM d, yyyy")} - {formatDateForDisplay(currentYear.end_date, "MMM d, yyyy")}
                </p>
              </CardContent>
            )}
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("leave.leaveYears.openYears", "Open Years")}</CardDescription>
              <CardTitle className="text-xl">{openYears.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("leave.leaveYears.openYearsDesc", "Available for leave tracking")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t("leave.leaveYears.closedYears", "Closed Years")}</CardDescription>
              <CardTitle className="text-xl">{closedYears.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t("leave.leaveYears.closedYearsDesc", "Historical records only")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("leave.leaveYears.name", "Name")}</TableHead>
                <TableHead>{t("leave.leaveYears.code", "Code")}</TableHead>
                <TableHead>{t("leave.leaveYears.period", "Period")}</TableHead>
                <TableHead>{t("leave.leaveYears.status", "Status")}</TableHead>
                <TableHead className="w-[100px]">{t("common.actions", "Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {t("common.loading", "Loading...")}
                  </TableCell>
                </TableRow>
              ) : leaveYears.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {t("leave.leaveYears.noRecords", "No leave years configured. Add your first leave year to get started.")}
                  </TableCell>
                </TableRow>
              ) : (
                leaveYears.map((year) => (
                  <TableRow key={year.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{year.name}</span>
                        {year.is_current && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Current
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{year.code}</TableCell>
                    <TableCell>
                      {formatDateForDisplay(year.start_date, "MMM d, yyyy")} - {formatDateForDisplay(year.end_date, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {year.is_closed ? (
                        <Badge variant="secondary" className="flex items-center w-fit gap-1">
                          <Lock className="h-3 w-3" />
                          Closed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center w-fit gap-1">
                          <Unlock className="h-3 w-3" />
                          Open
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(year)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t("common.edit", "Edit")}
                          </DropdownMenuItem>
                          {!year.is_current && !year.is_closed && (
                            <DropdownMenuItem onClick={() => setCurrentMutation.mutate(year.id)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {t("leave.leaveYears.setAsCurrent", "Set as Current")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {year.is_closed ? (
                            <DropdownMenuItem onClick={() => reopenMutation.mutate(year.id)}>
                              <Unlock className="mr-2 h-4 w-4" />
                              {t("leave.leaveYears.reopen", "Reopen")}
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => closeMutation.mutate(year.id)}>
                              <Lock className="mr-2 h-4 w-4" />
                              {t("leave.leaveYears.close", "Close Year")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this leave year?")) {
                                deleteMutation.mutate(year.id);
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("common.delete", "Delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingYear
                  ? t("leave.leaveYears.editTitle", "Edit Leave Year")
                  : t("leave.leaveYears.addTitle", "Add Leave Year")
                }
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("leave.leaveYears.name", "Name")} *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Leave Year 2024/2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("leave.leaveYears.code", "Code")} *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., LY2024"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("leave.leaveYears.startDate", "Start Date")} *</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("leave.leaveYears.endDate", "End Date")} *</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>{t("leave.leaveYears.setAsCurrent", "Set as Current Year")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("leave.leaveYears.setAsCurrentDesc", "New leave balances will be created for this year")}
                  </p>
                </div>
                <Switch
                  checked={formData.is_current}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_current: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("leave.leaveYears.notes", "Notes")}</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t("leave.leaveYears.notesPlaceholder", "Optional notes about this leave year...")}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
                {saveMutation.isPending
                  ? t("common.saving", "Saving...")
                  : editingYear
                  ? t("common.save", "Save Changes")
                  : t("common.create", "Create")
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
