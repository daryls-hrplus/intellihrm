import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/hooks/useLanguage";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Briefcase,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Copy,
  Upload,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { NavLink } from "react-router-dom";
import { format } from "date-fns";
import { JobCompetenciesManager } from "@/components/workforce/JobCompetenciesManager";
import { JobResponsibilitiesManager } from "@/components/workforce/JobResponsibilitiesManager";
import { JobGoalsManager } from "@/components/workforce/JobGoalsManager";
import { BulkJobDataImport } from "@/components/workforce/BulkJobDataImport";

interface Job {
  id: string;
  company_id: string;
  job_family_id: string;
  name: string;
  code: string;
  description: string | null;
  job_grade: string | null;
  job_level: string | null;
  critical_level: string | null;
  job_class: string | null;
  standard_hours: number | null;
  standard_work_period: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  companies?: { name: string; code: string };
  job_families?: { name: string; code: string };
}

interface Company {
  id: string;
  name: string;
  code: string;
}

interface JobFamily {
  id: string;
  name: string;
  code: string;
  company_id: string;
}

const WORK_PERIODS = [
  { value: "monthly", label: "Monthly" },
  { value: "bi-monthly", label: "Bi-Monthly" },
  { value: "fortnightly", label: "Fortnightly" },
  { value: "weekly", label: "Weekly" },
];

const emptyForm = {
  name: "",
  code: "",
  description: "",
  company_id: "",
  job_family_id: "",
  job_grade: "",
  job_level: "",
  critical_level: "",
  job_class: "",
  standard_hours: "",
  standard_work_period: "",
  start_date: format(new Date(), "yyyy-MM-dd"),
  end_date: "",
  is_active: true,
};

export default function JobsPage() {
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobFamilies, setJobFamilies] = useState<JobFamily[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  
  // Copy job state
  const [copyFormData, setCopyFormData] = useState({
    name: "",
    code: "",
    copyCompetencies: true,
    copyResponsibilities: true,
    copyGoals: true,
  });
  const [isCopying, setIsCopying] = useState(false);
  
  // Bulk import state
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  const { logAction } = useAuditLog();

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchJobs();
      fetchJobFamilies();
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, code")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching companies:", error);
      toast.error(t("workforce.jobs.failedToLoad"));
    } else {
      setCompanies(data || []);
      if (data && data.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(data[0].id);
      }
    }
  };

  const fetchJobs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select(`
        *,
        companies(name, code),
        job_families(name, code)
      `)
      .eq("company_id", selectedCompanyId)
      .order("name");

    if (error) {
      console.error("Error fetching jobs:", error);
      toast.error(t("workforce.jobs.failedToLoad"));
    } else {
      setJobs(data || []);
    }
    setIsLoading(false);
  };

  const fetchJobFamilies = async () => {
    const { data, error } = await supabase
      .from("job_families")
      .select("id, name, code, company_id")
      .eq("company_id", selectedCompanyId)
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching job families:", error);
    } else {
      setJobFamilies(data || []);
    }
  };

  const handleOpenDialog = (job?: Job) => {
    if (job) {
      setSelectedJob(job);
      setFormData({
        name: job.name,
        code: job.code,
        description: job.description || "",
        company_id: job.company_id,
        job_family_id: job.job_family_id,
        job_grade: job.job_grade || "",
        job_level: job.job_level || "",
        critical_level: job.critical_level || "",
        job_class: job.job_class || "",
        standard_hours: job.standard_hours?.toString() || "",
        standard_work_period: job.standard_work_period || "",
        start_date: job.start_date,
        end_date: job.end_date || "",
        is_active: job.is_active,
      });
    } else {
      setSelectedJob(null);
      setFormData({ ...emptyForm, company_id: selectedCompanyId });
    }
    setDialogOpen(true);
  };

  const toggleExpand = (jobId: string) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error(t("workforce.jobs.nameRequired"));
      return;
    }
    if (!formData.company_id) {
      toast.error(t("workforce.jobs.companyRequired"));
      return;
    }
    if (!formData.job_family_id) {
      toast.error(t("workforce.jobs.jobFamilyRequired"));
      return;
    }
    if (!formData.start_date) {
      toast.error(t("workforce.jobs.startDateRequired"));
      return;
    }

    setIsSaving(true);
    const payload = {
      company_id: formData.company_id,
      job_family_id: formData.job_family_id,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim() || null,
      job_grade: formData.job_grade.trim() || null,
      job_level: formData.job_level.trim() || null,
      critical_level: formData.critical_level.trim() || null,
      job_class: formData.job_class.trim() || null,
      standard_hours: formData.standard_hours ? parseFloat(formData.standard_hours) : null,
      standard_work_period: formData.standard_work_period || null,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      is_active: formData.is_active,
    };

    if (selectedJob) {
      const { error } = await supabase
        .from("jobs")
        .update(payload)
        .eq("id", selectedJob.id);

      if (error) {
        console.error("Error updating job:", error);
        toast.error(t("workforce.jobs.failedToUpdate"));
      } else {
        toast.success(t("workforce.jobs.jobUpdated"));
        logAction({
          action: "UPDATE",
          entityType: "jobs",
          entityId: selectedJob.id,
          entityName: formData.name,
          oldValues: { ...selectedJob },
          newValues: payload,
        });
        fetchJobs();
        setDialogOpen(false);
      }
    } else {
      const { data, error } = await supabase
        .from("jobs")
        .insert([payload])
        .select("id")
        .single();

      if (error) {
        console.error("Error creating job:", error);
        if (error.code === "23505") {
          toast.error(t("workforce.jobs.codeExists"));
        } else {
          toast.error(t("workforce.jobs.failedToCreate"));
        }
      } else {
        toast.success(t("workforce.jobs.jobCreated"));
        logAction({
          action: "CREATE",
          entityType: "jobs",
          entityId: data.id,
          entityName: formData.name,
          newValues: payload,
        });
        fetchJobs();
        setDialogOpen(false);
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedJob) return;

    const { error } = await supabase.from("jobs").delete().eq("id", selectedJob.id);

    if (error) {
      console.error("Error deleting job:", error);
      toast.error(t("workforce.jobs.failedToDelete"));
    } else {
      toast.success(t("workforce.jobs.jobDeleted"));
      logAction({
        action: "DELETE",
        entityType: "jobs",
        entityId: selectedJob.id,
        entityName: selectedJob.name,
        oldValues: { ...selectedJob },
      });
      fetchJobs();
    }
    setDeleteDialogOpen(false);
  };

  const handleOpenCopyDialog = (job: Job) => {
    setSelectedJob(job);
    setCopyFormData({
      name: `${job.name} (Copy)`,
      code: `${job.code}_COPY`,
      copyCompetencies: true,
      copyResponsibilities: true,
      copyGoals: true,
    });
    setCopyDialogOpen(true);
  };

  const handleCopyJob = async () => {
    if (!selectedJob) return;
    if (!copyFormData.name.trim() || !copyFormData.code.trim()) {
      toast.error(t("workforce.jobs.nameRequired"));
      return;
    }

    setIsCopying(true);
    try {
      // Create the new job
      const { data: newJob, error: jobError } = await supabase
        .from("jobs")
        .insert([{
          company_id: selectedJob.company_id,
          job_family_id: selectedJob.job_family_id,
          name: copyFormData.name.trim(),
          code: copyFormData.code.trim().toUpperCase(),
          description: selectedJob.description,
          job_grade: selectedJob.job_grade,
          job_level: selectedJob.job_level,
          critical_level: selectedJob.critical_level,
          job_class: selectedJob.job_class,
          standard_hours: selectedJob.standard_hours,
          standard_work_period: selectedJob.standard_work_period,
          start_date: format(new Date(), "yyyy-MM-dd"),
          end_date: null,
          is_active: true,
        }])
        .select("id")
        .single();

      if (jobError) throw jobError;

      const newJobId = newJob.id;

      // Copy competencies if selected
      if (copyFormData.copyCompetencies) {
        const { data: competencies } = await supabase
          .from("job_competencies")
          .select("*")
          .eq("job_id", selectedJob.id)
          .is("end_date", null);

        if (competencies && competencies.length > 0) {
          const newCompetencies = competencies.map(c => ({
            job_id: newJobId,
            competency_id: c.competency_id,
            competency_level_id: c.competency_level_id,
            weighting: c.weighting,
            is_required: c.is_required,
            notes: c.notes,
            start_date: format(new Date(), "yyyy-MM-dd"),
            end_date: null,
          }));
          await supabase.from("job_competencies").insert(newCompetencies);
        }
      }

      // Copy responsibilities if selected
      if (copyFormData.copyResponsibilities) {
        const { data: responsibilities } = await supabase
          .from("job_responsibilities")
          .select("*")
          .eq("job_id", selectedJob.id)
          .is("end_date", null);

        if (responsibilities && responsibilities.length > 0) {
          const newResponsibilities = responsibilities.map(r => ({
            job_id: newJobId,
            responsibility_id: r.responsibility_id,
            weighting: r.weighting,
            notes: r.notes,
            start_date: format(new Date(), "yyyy-MM-dd"),
            end_date: null,
          }));
          await supabase.from("job_responsibilities").insert(newResponsibilities);
        }
      }

      // Copy goals if selected
      if (copyFormData.copyGoals) {
        const { data: goals } = await supabase
          .from("job_goals")
          .select("*")
          .eq("job_id", selectedJob.id)
          .is("end_date", null);

        if (goals && goals.length > 0) {
          const newGoals = goals.map(g => ({
            job_id: newJobId,
            goal_name: g.goal_name,
            weighting: g.weighting,
            notes: g.notes,
            start_date: format(new Date(), "yyyy-MM-dd"),
            end_date: null,
          }));
          await supabase.from("job_goals").insert(newGoals);
        }
      }

      toast.success(t("workforce.jobs.jobCopied"));
      logAction({
        action: "CREATE",
        entityType: "jobs",
        entityId: newJobId,
        entityName: copyFormData.name,
        metadata: {
          copiedFrom: selectedJob.id,
          copiedFromName: selectedJob.name,
          copiedCompetencies: copyFormData.copyCompetencies,
          copiedResponsibilities: copyFormData.copyResponsibilities,
          copiedGoals: copyFormData.copyGoals,
        },
      });
      
      fetchJobs();
      setCopyDialogOpen(false);
    } catch (error: any) {
      console.error("Error copying job:", error);
      if (error.code === "23505") {
        toast.error(t("workforce.jobs.codeExists"));
      } else {
        toast.error(t("workforce.jobs.failedToCopy"));
      }
    } finally {
      setIsCopying(false);
    }
  };

  // Filter job families based on selected company in form
  const formJobFamilies = formData.company_id === selectedCompanyId ? jobFamilies : [];

  const filteredJobs = jobs.filter(
    (job) =>
      job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.job_families?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderJobForm = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Senior Software Engineer"
          />
        </div>
        <div className="space-y-2">
          <Label>Code *</Label>
          <Input
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="e.g., SSE"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Job description..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Company *</Label>
          <Select
            value={formData.company_id}
            onValueChange={(value) =>
              setFormData({ ...formData, company_id: value, job_family_id: "" })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select company" />
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
          <Label>Job Family *</Label>
          <Select
            value={formData.job_family_id}
            onValueChange={(value) => setFormData({ ...formData, job_family_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select job family" />
            </SelectTrigger>
            <SelectContent>
              {formJobFamilies.map((jf) => (
                <SelectItem key={jf.id} value={jf.id}>
                  {jf.name} ({jf.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Job Grade</Label>
          <Input
            value={formData.job_grade}
            onChange={(e) => setFormData({ ...formData, job_grade: e.target.value })}
            placeholder="e.g., G5"
          />
        </div>
        <div className="space-y-2">
          <Label>Job Level</Label>
          <Input
            value={formData.job_level}
            onChange={(e) => setFormData({ ...formData, job_level: e.target.value })}
            placeholder="e.g., Senior"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Critical Level</Label>
          <Input
            value={formData.critical_level}
            onChange={(e) => setFormData({ ...formData, critical_level: e.target.value })}
            placeholder="e.g., High"
          />
        </div>
        <div className="space-y-2">
          <Label>Job Class (User Defined)</Label>
          <Input
            value={formData.job_class}
            onChange={(e) => setFormData({ ...formData, job_class: e.target.value })}
            placeholder="e.g., Technical"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Standard Hours</Label>
          <Input
            type="number"
            value={formData.standard_hours}
            onChange={(e) => setFormData({ ...formData, standard_hours: e.target.value })}
            placeholder="e.g., 40"
          />
        </div>
        <div className="space-y-2">
          <Label>Standard Work Period</Label>
          <Select
            value={formData.standard_work_period}
            onValueChange={(value) =>
              setFormData({ ...formData, standard_work_period: value === "__none__" ? "" : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {WORK_PERIODS.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date *</Label>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
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
        <Label>Active</Label>
      </div>
    </>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <NavLink to="/workforce" className="hover:text-foreground">
            Workforce
          </NavLink>
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <span className="text-foreground">Jobs</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
              <p className="text-muted-foreground">
                Define job roles within job families
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setBulkImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Import
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Job
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name} ({company.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Job Family</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Work Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No jobs found matching your search" : "No jobs found. Create one to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <>
                    <TableRow key={job.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleExpand(job.id)}
                        >
                          {expandedJobId === job.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{job.name}</TableCell>
                      <TableCell>{job.code}</TableCell>
                      <TableCell>{job.job_families?.name || "-"}</TableCell>
                      <TableCell>{job.job_grade || "-"}</TableCell>
                      <TableCell>{job.job_level || "-"}</TableCell>
                      <TableCell className="capitalize">{job.standard_work_period || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={job.is_active ? "default" : "secondary"}>
                          {job.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(job)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenCopyDialog(job)}
                            title="Copy as Template"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedJob(job);
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedJobId === job.id && (
                      <TableRow>
                        <TableCell colSpan={9} className="bg-muted/30 p-4">
                          <Tabs defaultValue="competencies" className="w-full">
                            <TabsList>
                              <TabsTrigger value="competencies">Competencies</TabsTrigger>
                              <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
                              <TabsTrigger value="goals">Goals</TabsTrigger>
                            </TabsList>
                            <TabsContent value="competencies" className="mt-4">
                              <JobCompetenciesManager 
                                jobId={job.id} 
                                companyId={job.company_id} 
                              />
                            </TabsContent>
                            <TabsContent value="responsibilities" className="mt-4">
                              <JobResponsibilitiesManager 
                                jobId={job.id} 
                                companyId={job.company_id} 
                              />
                            </TabsContent>
                            <TabsContent value="goals" className="mt-4">
                              <JobGoalsManager 
                                jobId={job.id} 
                                companyId={job.company_id} 
                              />
                            </TabsContent>
                          </Tabs>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedJob ? "Edit Job" : "Create Job"}
              </DialogTitle>
            </DialogHeader>
            
            {selectedJob ? (
              <div className="space-y-4 py-4">
                {renderJobForm()}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {renderJobForm()}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Job</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedJob?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Copy Job Dialog */}
        <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Copy Job as Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Create a copy of "{selectedJob?.name}" with its associated competencies, responsibilities, and goals.
              </p>
              
              <div className="space-y-2">
                <Label>New Job Name *</Label>
                <Input
                  value={copyFormData.name}
                  onChange={(e) => setCopyFormData({ ...copyFormData, name: e.target.value })}
                  placeholder="Enter new job name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>New Job Code *</Label>
                <Input
                  value={copyFormData.code}
                  onChange={(e) => setCopyFormData({ ...copyFormData, code: e.target.value.toUpperCase() })}
                  placeholder="Enter new job code"
                />
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-base">Include in copy:</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="copyCompetencies"
                      checked={copyFormData.copyCompetencies}
                      onCheckedChange={(checked) => 
                        setCopyFormData({ ...copyFormData, copyCompetencies: !!checked })
                      }
                    />
                    <label htmlFor="copyCompetencies" className="text-sm cursor-pointer">
                      Competencies
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="copyResponsibilities"
                      checked={copyFormData.copyResponsibilities}
                      onCheckedChange={(checked) => 
                        setCopyFormData({ ...copyFormData, copyResponsibilities: !!checked })
                      }
                    />
                    <label htmlFor="copyResponsibilities" className="text-sm cursor-pointer">
                      Responsibilities
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="copyGoals"
                      checked={copyFormData.copyGoals}
                      onCheckedChange={(checked) => 
                        setCopyFormData({ ...copyFormData, copyGoals: !!checked })
                      }
                    />
                    <label htmlFor="copyGoals" className="text-sm cursor-pointer">
                      Goals
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCopyJob} disabled={isCopying}>
                {isCopying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Copy className="mr-2 h-4 w-4" />
                Copy Job
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Import Dialog */}
        <BulkJobDataImport
          open={bulkImportOpen}
          onOpenChange={setBulkImportOpen}
          companyId={selectedCompanyId}
          onImportComplete={fetchJobs}
        />
      </div>
    </AppLayout>
  );
}
