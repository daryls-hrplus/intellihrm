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
import { Building2, FolderTree, Plus, Pencil, Trash2, Search } from "lucide-react";
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
import { format } from "date-fns";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface Division {
  id: string;
  name: string;
  code: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  company_division_id: string | null;
}

interface JobFamily {
  id: string;
  company_id: string;
  company_division_id: string | null;
  department_id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  departments?: { name: string; code: string };
  company_divisions?: { name: string; code: string } | null;
}

const emptyForm = {
  name: "",
  code: "",
  description: "",
  company_id: "",
  company_division_id: "",
  department_id: "",
  is_active: true,
  start_date: format(new Date(), "yyyy-MM-dd"),
  end_date: "",
};

export default function JobFamiliesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobFamilies, setJobFamilies] = useState<JobFamily[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJobFamily, setSelectedJobFamily] = useState<JobFamily | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
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
      fetchDivisionsAndDepartments();
      fetchJobFamilies();
    }
  }, [selectedCompanyId]);

  const fetchDivisionsAndDepartments = async () => {
    const [divisionsRes, departmentsRes] = await Promise.all([
      supabase
        .from("company_divisions")
        .select("id, name, code")
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("departments")
        .select("id, name, code, company_division_id")
        .eq("company_id", selectedCompanyId)
        .eq("is_active", true)
        .order("name"),
    ]);

    setDivisions(divisionsRes.data || []);
    setDepartments(departmentsRes.data || []);
  };

  const fetchJobFamilies = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("job_families")
      .select(`
        *,
        departments(name, code),
        company_divisions(name, code)
      `)
      .eq("company_id", selectedCompanyId)
      .order("name");

    if (error) {
      toast.error("Failed to fetch job families");
    } else {
      setJobFamilies(data || []);
    }
    setIsLoading(false);
  };

  const handleOpenDialog = (jobFamily?: JobFamily) => {
    if (jobFamily) {
      setSelectedJobFamily(jobFamily);
      setFormData({
        name: jobFamily.name,
        code: jobFamily.code,
        description: jobFamily.description || "",
        company_id: jobFamily.company_id,
        company_division_id: jobFamily.company_division_id || "",
        department_id: jobFamily.department_id,
        is_active: jobFamily.is_active,
        start_date: jobFamily.start_date,
        end_date: jobFamily.end_date || "",
      });
    } else {
      setSelectedJobFamily(null);
      setFormData({ ...emptyForm, company_id: selectedCompanyId });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast.error("Name and code are required");
      return;
    }
    if (!formData.company_id) {
      toast.error("Company is required");
      return;
    }
    if (!formData.department_id) {
      toast.error("Department is required");
      return;
    }

    setIsSaving(true);
    const payload = {
      company_id: formData.company_id,
      company_division_id: formData.company_division_id || null,
      department_id: formData.department_id,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim() || null,
      is_active: formData.is_active,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
    };

    if (selectedJobFamily) {
      const { error } = await supabase
        .from("job_families")
        .update(payload)
        .eq("id", selectedJobFamily.id);

      if (error) {
        toast.error("Failed to update job family");
      } else {
        toast.success("Job family updated");
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
        toast.error(error.message.includes("duplicate") ? "Code already exists for this department" : "Failed to create job family");
      } else {
        toast.success("Job family created");
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
      toast.error("Failed to delete job family. It may be in use.");
    } else {
      toast.success("Job family deleted");
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

  // Get divisions and departments for form based on selected company in form
  const formDivisions = formData.company_id === selectedCompanyId ? divisions : [];
  const formDepartments = formData.company_id === selectedCompanyId ? departments : [];
  
  // Filter departments by selected division
  const filteredDepartments = formData.company_division_id
    ? formDepartments.filter((d) => d.company_division_id === formData.company_division_id)
    : formDepartments;

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
            { label: "Workforce", href: "/workforce" },
            { label: "Job Families" },
          ]}
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FolderTree className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Job Families
              </h1>
              <p className="text-muted-foreground">
                Group similar positions together
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-[250px]">
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
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : selectedCompanyId ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Job Families</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-[200px]"
                  />
                </div>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Job Family
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Division</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobFamilies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No job families found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJobFamilies.map((jf) => (
                      <TableRow key={jf.id}>
                        <TableCell className="font-mono">{jf.code}</TableCell>
                        <TableCell className="font-medium">{jf.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {jf.company_divisions?.name || "-"}
                        </TableCell>
                        <TableCell>{jf.departments?.name || "-"}</TableCell>
                        <TableCell>{format(new Date(jf.start_date), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          {jf.end_date ? format(new Date(jf.end_date), "MMM d, yyyy") : "-"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              jf.is_active
                                ? "bg-success/10 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {jf.is_active ? "Active" : "Inactive"}
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
            <p className="text-muted-foreground">No companies found. Please add a company first.</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedJobFamily ? "Edit Job Family" : "Add Job Family"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., ENG"
                />
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Engineering"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Company *</Label>
              <Select
                value={formData.company_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, company_id: value, company_division_id: "", department_id: "" })
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Division (Optional)</Label>
                <Select
                  value={formData.company_division_id || "__none__"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, company_division_id: value === "__none__" ? "" : value, department_id: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {formDivisions.map((div) => (
                      <SelectItem key={div.id} value={div.id}>
                        {div.name} ({div.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this job family..."
                rows={3}
              />
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Family</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedJobFamily?.name}"? This action cannot be undone.
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
    </AppLayout>
  );
}
