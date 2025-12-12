import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  ClipboardList,
  ChevronLeft,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { format } from "date-fns";

interface Responsibility {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  companies?: { name: string; code: string };
}

interface Company {
  id: string;
  name: string;
  code: string;
}

const emptyForm = {
  name: "",
  code: "",
  description: "",
  company_id: "",
  start_date: format(new Date(), "yyyy-MM-dd"),
  end_date: "",
  is_active: true,
};

export default function ResponsibilitiesPage() {
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedResponsibility, setSelectedResponsibility] = useState<Responsibility | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const { logAction } = useAuditLog();

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchResponsibilities();
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
      toast.error("Failed to load companies");
    } else {
      setCompanies(data || []);
      if (data && data.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(data[0].id);
      }
    }
  };

  const fetchResponsibilities = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("responsibilities")
      .select(`
        *,
        companies(name, code)
      `)
      .eq("company_id", selectedCompanyId)
      .order("name");

    if (error) {
      console.error("Error fetching responsibilities:", error);
      toast.error("Failed to load responsibilities");
    } else {
      setResponsibilities(data || []);
    }
    setIsLoading(false);
  };

  const handleOpenDialog = (responsibility?: Responsibility) => {
    if (responsibility) {
      setSelectedResponsibility(responsibility);
      setFormData({
        name: responsibility.name,
        code: responsibility.code,
        description: responsibility.description || "",
        company_id: responsibility.company_id,
        start_date: responsibility.start_date,
        end_date: responsibility.end_date || "",
        is_active: responsibility.is_active,
      });
    } else {
      setSelectedResponsibility(null);
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
    if (!formData.start_date) {
      toast.error("Start date is required");
      return;
    }

    setIsSaving(true);
    const payload = {
      company_id: formData.company_id,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim() || null,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      is_active: formData.is_active,
    };

    try {
      if (selectedResponsibility) {
        const { error } = await supabase
          .from("responsibilities")
          .update(payload)
          .eq("id", selectedResponsibility.id);

        if (error) throw error;

        await logAction({ action: "UPDATE", entityType: "responsibilities", entityId: selectedResponsibility.id, entityName: formData.name });
        toast.success("Responsibility updated successfully");
      } else {
        const { error } = await supabase.from("responsibilities").insert(payload);

        if (error) throw error;

        await logAction({ action: "CREATE", entityType: "responsibilities", entityName: formData.name });
        toast.success("Responsibility created successfully");
      }

      setDialogOpen(false);
      fetchResponsibilities();
    } catch (error: any) {
      console.error("Error saving responsibility:", error);
      if (error.code === "23505") {
        toast.error("A responsibility with this code already exists for this company");
      } else {
        toast.error("Failed to save responsibility");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedResponsibility) return;

    try {
      const { error } = await supabase
        .from("responsibilities")
        .delete()
        .eq("id", selectedResponsibility.id);

      if (error) throw error;

      await logAction({ action: "DELETE", entityType: "responsibilities", entityId: selectedResponsibility.id, entityName: selectedResponsibility.name });
      toast.success("Responsibility deleted successfully");
      setDeleteDialogOpen(false);
      fetchResponsibilities();
    } catch (error) {
      console.error("Error deleting responsibility:", error);
      toast.error("Failed to delete responsibility");
    }
  };

  const filteredResponsibilities = responsibilities.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <NavLink to="/workforce" className="hover:text-foreground">
            Workforce
          </NavLink>
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <span className="text-foreground">Responsibilities</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Responsibilities</h1>
              <p className="text-muted-foreground">
                Define job responsibilities for your organization
              </p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Responsibility
          </Button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-full sm:w-[250px]">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search responsibilities..."
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
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredResponsibilities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No responsibilities found matching your search" : "No responsibilities found. Create one to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredResponsibilities.map((responsibility) => (
                  <TableRow key={responsibility.id}>
                    <TableCell className="font-medium">{responsibility.name}</TableCell>
                    <TableCell>{responsibility.code}</TableCell>
                    <TableCell className="max-w-xs truncate">{responsibility.description || "-"}</TableCell>
                    <TableCell>{responsibility.start_date}</TableCell>
                    <TableCell>{responsibility.end_date || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={responsibility.is_active ? "default" : "secondary"}>
                        {responsibility.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(responsibility)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedResponsibility(responsibility);
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
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedResponsibility ? "Edit Responsibility" : "Create Responsibility"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Company *</Label>
                <Select
                  value={formData.company_id}
                  onValueChange={(value) => setFormData({ ...formData, company_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Budget Management"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., BUDGMGT"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this responsibility..."
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
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedResponsibility ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Responsibility</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedResponsibility?.name}"? This action cannot be undone.
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
      </div>
    </AppLayout>
  );
}
