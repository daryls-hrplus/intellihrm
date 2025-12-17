import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Archive, Settings, Calendar, Loader2, Play, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { format, subMonths } from "date-fns";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface ArchiveSettings {
  id: string;
  company_id: string;
  archive_after_months: number;
  auto_archive_enabled: boolean;
  last_archive_run: string | null;
  created_at: string;
  updated_at: string;
}

interface ArchivePreview {
  runs_count: number;
  employee_payroll_count: number;
  line_items_count: number;
  oldest_run_date: string | null;
  newest_run_date: string | null;
}

export default function PayrollArchiveSettingsPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [settings, setSettings] = useState<ArchiveSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  
  // Form state
  const [archiveAfterMonths, setArchiveAfterMonths] = useState<number>(24);
  const [autoArchiveEnabled, setAutoArchiveEnabled] = useState(false);
  
  // Archive dialog
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [archivePreview, setArchivePreview] = useState<ArchivePreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadSettings();
    }
  }, [selectedCompanyId]);

  const loadCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, name, code")
      .eq("is_active", true)
      .order("name");
    
    if (data) {
      setCompanies(data);
      if (data.length > 0) {
        setSelectedCompanyId(data[0].id);
      }
    }
  };

  const loadSettings = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("payroll_archive_settings")
      .select("*")
      .eq("company_id", selectedCompanyId)
      .single();
    
    if (data) {
      setSettings(data);
      setArchiveAfterMonths(data.archive_after_months);
      setAutoArchiveEnabled(data.auto_archive_enabled);
    } else {
      // No settings exist yet, use defaults
      setSettings(null);
      setArchiveAfterMonths(24);
      setAutoArchiveEnabled(false);
    }
    setIsLoading(false);
  };

  const handleSaveSettings = async () => {
    if (!selectedCompanyId) return;
    
    setIsSaving(true);
    
    const settingsData = {
      company_id: selectedCompanyId,
      archive_after_months: archiveAfterMonths,
      auto_archive_enabled: autoArchiveEnabled,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (settings) {
      const { error: updateError } = await supabase
        .from("payroll_archive_settings")
        .update(settingsData)
        .eq("id", settings.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("payroll_archive_settings")
        .insert(settingsData);
      error = insertError;
    }

    if (error) {
      toast.error(t("common.error"));
    } else {
      toast.success(t("common.saved"));
      loadSettings();
    }
    setIsSaving(false);
  };

  const loadArchivePreview = async () => {
    if (!selectedCompanyId) return;
    
    setIsLoadingPreview(true);
    const archiveBeforeDate = subMonths(new Date(), archiveAfterMonths);
    
    // Get preview of what will be archived
    const { data: runsData } = await supabase
      .from("payroll_runs")
      .select("id, paid_at")
      .eq("company_id", selectedCompanyId)
      .eq("status", "paid")
      .lt("paid_at", archiveBeforeDate.toISOString());
    
    if (!runsData || runsData.length === 0) {
      setArchivePreview({
        runs_count: 0,
        employee_payroll_count: 0,
        line_items_count: 0,
        oldest_run_date: null,
        newest_run_date: null,
      });
      setIsLoadingPreview(false);
      return;
    }

    const runIds = runsData.map(r => r.id);
    
    // Get employee_payroll count
    const { count: empPayrollCount } = await supabase
      .from("employee_payroll")
      .select("*", { count: "exact", head: true })
      .in("payroll_run_id", runIds);
    
    // Get line items count (approximate based on employee_payroll)
    const { data: empPayrollData } = await supabase
      .from("employee_payroll")
      .select("id")
      .in("payroll_run_id", runIds);
    
    let lineItemsCount = 0;
    if (empPayrollData && empPayrollData.length > 0) {
      const empPayrollIds = empPayrollData.map(ep => ep.id);
      const { count } = await supabase
        .from("payroll_line_items")
        .select("*", { count: "exact", head: true })
        .in("employee_payroll_id", empPayrollIds);
      lineItemsCount = count || 0;
    }

    const sortedRuns = runsData.sort((a, b) => 
      new Date(a.paid_at).getTime() - new Date(b.paid_at).getTime()
    );

    setArchivePreview({
      runs_count: runsData.length,
      employee_payroll_count: empPayrollCount || 0,
      line_items_count: lineItemsCount,
      oldest_run_date: sortedRuns[0]?.paid_at || null,
      newest_run_date: sortedRuns[sortedRuns.length - 1]?.paid_at || null,
    });
    setIsLoadingPreview(false);
  };

  const handleOpenArchiveDialog = async () => {
    setShowArchiveDialog(true);
    await loadArchivePreview();
  };

  const handleRunArchive = async () => {
    if (!selectedCompanyId || !archivePreview || archivePreview.runs_count === 0) return;
    
    setIsArchiving(true);
    const archiveBeforeDate = subMonths(new Date(), archiveAfterMonths);
    
    const { data, error } = await supabase
      .rpc("archive_payroll_data", {
        p_company_id: selectedCompanyId,
        p_archive_before_date: archiveBeforeDate.toISOString().split("T")[0],
      });

    if (error) {
      toast.error(t("payroll.archive.archiveFailed", "Archive failed: {{error}}", { error: error.message }));
    } else {
      const result = data as any;
      toast.success(
        t("payroll.archive.archiveSuccess", 
          "Successfully archived {{runs}} runs, {{employees}} employee records, {{items}} line items",
          { 
            runs: result.runs_archived, 
            employees: result.employee_payroll_archived,
            items: result.line_items_archived 
          }
        )
      );
      setShowArchiveDialog(false);
      loadSettings();
    }
    setIsArchiving(false);
  };

  const archiveBeforeDate = subMonths(new Date(), archiveAfterMonths);

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: t("payroll.title"), href: "/payroll" },
            { label: t("payroll.archive.title", "Archive Settings") },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("payroll.archive.title", "Payroll Archive Settings")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("payroll.archive.description", "Configure how long to retain payroll data before archiving")}
            </p>
          </div>
        </div>

        {/* Company Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {t("payroll.archive.configuration", "Archive Configuration")}
            </CardTitle>
            <CardDescription>
              {t("payroll.archive.configDescription", "Set archive period and automation per company")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("common.company")}</Label>
                <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("common.selectCompany")} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name} ({company.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : selectedCompanyId && (
              <div className="space-y-6 pt-4 border-t">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="archiveMonths">
                      {t("payroll.archive.archiveAfterMonths", "Archive payroll data older than")}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="archiveMonths"
                        type="number"
                        min={6}
                        max={120}
                        value={archiveAfterMonths}
                        onChange={(e) => setArchiveAfterMonths(parseInt(e.target.value) || 24)}
                        className="w-24"
                      />
                      <span className="text-muted-foreground">{t("common.months", "months")}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("payroll.archive.archiveBeforeDate", "Payroll runs paid before {{date}} will be archived", 
                        { date: format(archiveBeforeDate, "MMM dd, yyyy") }
                      )}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="autoArchive">
                      {t("payroll.archive.autoArchive", "Automatic Archiving")}
                    </Label>
                    <div className="flex items-center gap-3">
                      <Switch
                        id="autoArchive"
                        checked={autoArchiveEnabled}
                        onCheckedChange={setAutoArchiveEnabled}
                      />
                      <span className="text-sm text-muted-foreground">
                        {autoArchiveEnabled 
                          ? t("payroll.archive.autoEnabled", "Enabled - runs monthly")
                          : t("payroll.archive.autoDisabled", "Disabled - manual only")
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {settings?.last_archive_run && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {t("payroll.archive.lastRun", "Last archive run: {{date}}", 
                      { date: format(new Date(settings.last_archive_run), "MMM dd, yyyy HH:mm") }
                    )}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
                    {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t("common.saveSettings", "Save Settings")}
                  </Button>
                  <Button variant="outline" onClick={handleOpenArchiveDialog}>
                    <Archive className="h-4 w-4 mr-2" />
                    {t("payroll.archive.runNow", "Run Archive Now")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Archive Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              {t("payroll.archive.howItWorks", "How Archiving Works")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">{t("payroll.archive.whatMoves", "What Gets Archived")}</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Payroll runs (status: paid)</li>
                    <li>• Employee payroll records</li>
                    <li>• Payroll line items</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">{t("payroll.archive.whatStays", "What Remains")}</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Active/processing payrolls</li>
                    <li>• Pay periods & configurations</li>
                    <li>• Employee compensation records</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">{t("payroll.archive.archiveAccess", "Archived Data Access")}</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Read-only access for reporting</li>
                    <li>• Admin/HR manager access only</li>
                    <li>• Cannot be unarchived</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Archive Confirmation Dialog */}
        <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                {t("payroll.archive.confirmTitle", "Archive Payroll Data")}
              </DialogTitle>
              <DialogDescription>
                {t("payroll.archive.confirmDescription", 
                  "This will move payroll data older than {{months}} months to archive tables.",
                  { months: archiveAfterMonths }
                )}
              </DialogDescription>
            </DialogHeader>

            {isLoadingPreview ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : archivePreview && (
              <div className="space-y-4">
                {archivePreview.runs_count === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    {t("payroll.archive.noDataToArchive", "No payroll data found to archive for the selected period.")}
                  </div>
                ) : (
                  <>
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-warning">
                            {t("payroll.archive.warning", "This action cannot be undone")}
                          </p>
                          <p className="text-muted-foreground mt-1">
                            {t("payroll.archive.warningDetail", "Archived data can only be read, not modified or restored.")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("payroll.archive.dataType", "Data Type")}</TableHead>
                          <TableHead className="text-right">{t("payroll.archive.recordCount", "Records")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Payroll Runs</TableCell>
                          <TableCell className="text-right font-mono">{archivePreview.runs_count.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Employee Payroll Records</TableCell>
                          <TableCell className="text-right font-mono">{archivePreview.employee_payroll_count.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Line Items</TableCell>
                          <TableCell className="text-right font-mono">{archivePreview.line_items_count.toLocaleString()}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>

                    {archivePreview.oldest_run_date && archivePreview.newest_run_date && (
                      <p className="text-sm text-muted-foreground">
                        {t("payroll.archive.dateRange", "Date range: {{oldest}} to {{newest}}", {
                          oldest: format(new Date(archivePreview.oldest_run_date), "MMM dd, yyyy"),
                          newest: format(new Date(archivePreview.newest_run_date), "MMM dd, yyyy"),
                        })}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
                {t("common.cancel")}
              </Button>
              <Button 
                onClick={handleRunArchive} 
                disabled={isArchiving || !archivePreview || archivePreview.runs_count === 0}
                variant="destructive"
              >
                {isArchiving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {t("payroll.archive.startArchive", "Start Archive")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
