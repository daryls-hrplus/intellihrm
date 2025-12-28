import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, FolderTree, Plus, Pencil, Trash2, Search, ClipboardList } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";
import { JobFamilyDefaultResponsibilities } from "@/components/workforce/JobFamilyDefaultResponsibilities";
import { Json } from "@/integrations/supabase/types";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface JobFamily {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  default_responsibilities: Json | null;
}

interface DefaultResponsibility {
  responsibility_id: string;
  suggested_weight: number;
}

const emptyForm = {
  name: "",
  code: "",
  description: "",
  company_id: "",
  is_active: true,
  start_date: getTodayString(),
  end_date: "",
  default_responsibilities: [] as DefaultResponsibility[],
};

export default function JobFamiliesPage() {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [jobFamilies, setJobFamilies] = useState<JobFamily[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJobFamily, setSelectedJobFamily] = useState<JobFamily | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const { logAction } = useAuditLog();

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");

      if (data && data.length > 0) {
        setCompanies(data);
        setSelectedCompanyId(data[0].id);
      }
      setIsLoading(false);
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchJobFamilies();
    }
  }, [selectedCompanyId]);

  const fetchJobFamilies = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("job_families")
      .select("*")
      .eq("company_id", selectedCompanyId)
      .order("name");

    if (error) {
      toast.error(t("workforce.jobFamilies.failedToFetch"));
    } else {
      setJobFamilies(data || []);
    }
    setIsLoading(false);
  };

  const handleOpenDialog = (jobFamily?: JobFamily) => {
    if (jobFamily) {
      setSelectedJobFamily(jobFamily);
      // Parse default_responsibilities from JSON
      const defaultResp = Array.isArray(jobFamily.default_responsibilities) 
        ? (jobFamily.default_responsibilities as unknown as DefaultResponsibility[])
        : [];
      setFormData({
        name: jobFamily.name,
        code: jobFamily.code,
        description: jobFamily.description || "",
        company_id: jobFamily.company_id,
        is_active: jobFamily.is_active,
        start_date: jobFamily.start_date,
        end_date: jobFamily.end_date || "",
        default_responsibilities: defaultResp,
      });
    } else {
      setSelectedJobFamily(null);
      setFormData({ ...emptyForm, company_id: selectedCompanyId });
    }
    setActiveTab("general");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error(t("workforce.jobFamilies.nameRequired"));
      return;
    }
    if (!formData.company_id) {
      toast.error(t("workforce.jobFamilies.companyRequired"));
      return;
    }

    setIsSaving(true);
    const payload = {
      company_id: formData.company_id,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim() || null,
      is_active: formData.is_active,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      default_responsibilities: formData.default_responsibilities as unknown as Json,
    };

    if (selectedJobFamily) {
      const { error } = await supabase
        .from("job_families")
        .update(payload)
        .eq("id", selectedJobFamily.id);

      if (error) {
        toast.error(t("workforce.jobFamilies.failedToUpdate"));
      } else {
        toast.success(t("workforce.jobFamilies.jobFamilyUpdated"));
        await logAction({
          action: "UPDATE",
          entityType: "job_family",
          entityId: selectedJobFamily.id,
          entityName: formData.name,
          oldValues: selectedJobFamily as unknown as Record<string, unknown>,
          newValues: payload,
        });
        fetchJobFamilies();
        setDialogOpen(false);
      }
    } else {
      const { data, error } = await supabase
        .from("job_families")
        .insert(payload)
        .select()
        .single();

      if (error) {
        toast.error(error.message.includes("duplicate") ? t("workforce.jobFamilies.codeExists") : t("workforce.jobFamilies.failedToCreate"));
      } else {
        toast.success(t("workforce.jobFamilies.jobFamilyCreated"));
        await logAction({
          action: "CREATE",
          entityType: "job_family",
          entityId: data.id,
          entityName: formData.name,
          newValues: payload,
        });
        fetchJobFamilies();
        setDialogOpen(false);
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedJobFamily) return;

    const { error } = await supabase
      .from("job_families")
      .delete()
      .eq("id", selectedJobFamily.id);

    if (error) {
      toast.error(t("workforce.jobFamilies.failedToDelete"));
    } else {
      toast.success(t("workforce.jobFamilies.jobFamilyDeleted"));
      await logAction({
        action: "DELETE",
        entityType: "job_family",
        entityId: selectedJobFamily.id,
        entityName: selectedJobFamily.name,
        oldValues: selectedJobFamily as unknown as Record<string, unknown>,
      });
      fetchJobFamilies();
    }
    setDeleteDialogOpen(false);
  };

  const filteredJobFamilies = jobFamilies.filter(
    (jf) =>
      jf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jf.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("navigation.workforce"), href: "/workforce" },
            { label: t("workforce.jobFamilies.breadcrumb") },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FolderTree className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("workforce.jobFamilies.title")}
              </h1>
              <p className="text-muted-foreground">
                {t("workforce.jobFamilies.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder={t("workforce.selectCompany")} />
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
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : selectedCompanyId ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("workforce.jobFamilies.title")}</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("common.search")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-[200px]"
                  />
                </div>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("workforce.jobFamilies.addJobFamily")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.code")}</TableHead>
                    <TableHead>{t("common.name")}</TableHead>
                    <TableHead>{t("common.description")}</TableHead>
                    <TableHead>{t("common.startDate")}</TableHead>
                    <TableHead>{t("common.endDate")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead className="w-[100px]">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobFamilies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        {t("workforce.jobFamilies.noJobFamiliesFound")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJobFamilies.map((jf) => (
                      <TableRow key={jf.id}>
                        <TableCell className="font-mono">{jf.code}</TableCell>
                        <TableCell className="font-medium">{jf.name}</TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">
                          {jf.description || "-"}
                        </TableCell>
                        <TableCell>{formatDateForDisplay(jf.start_date, "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          {jf.end_date ? formatDateForDisplay(jf.end_date, "MMM d, yyyy") : "-"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              jf.is_active
                                ? "bg-success/10 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {jf.is_active ? t("common.active") : t("common.inactive")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(jf)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedJobFamily(jf);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">{t("workforce.noCompaniesFound")}</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedJobFamily ? t("workforce.jobFamilies.editJobFamily") : t("workforce.jobFamilies.addJobFamily")}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <FolderTree className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="responsibilities" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Default Responsibilities
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("common.code")} *</Label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g., ENG"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("common.name")} *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Engineering"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("common.company")} *</Label>
                  <Select
                    value={formData.company_id}
                    onValueChange={(value) => setFormData({ ...formData, company_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("workforce.selectCompany")} />
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

                <div className="space-y-2">
                  <Label>{t("common.description")}</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder={t("workforce.jobFamilies.descriptionPlaceholder")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("common.startDate")} *</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("common.endDate")}</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>{t("common.active")}</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="responsibilities" className="flex-1 overflow-y-auto mt-4">
              {formData.company_id ? (
                <JobFamilyDefaultResponsibilities
                  companyId={formData.company_id}
                  familyName={formData.name}
                  familyDescription={formData.description}
                  defaultResponsibilities={formData.default_responsibilities}
                  onUpdate={(responsibilities) => 
                    setFormData({ ...formData, default_responsibilities: responsibilities })
                  }
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Please select a company first to manage default responsibilities.
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? t("common.loading") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("workforce.jobFamilies.deleteJobFamily")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("workforce.deleteConfirmation", { name: selectedJobFamily?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
