import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Building,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface BranchLocation {
  id: string;
  company_id: string;
  name: string;
  code: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  is_headquarters: boolean;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
}

interface CompanyBranchLocationsProps {
  companyId: string;
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
}

const emptyFormData = {
  name: "",
  code: "",
  address: "",
  city: "",
  state: "",
  country: "",
  postal_code: "",
  phone: "",
  email: "",
  is_headquarters: false,
  is_active: true,
  start_date: new Date().toISOString().split("T")[0],
  end_date: "",
};

export function CompanyBranchLocations({
  companyId,
  companyName,
  isOpen,
  onClose,
}: CompanyBranchLocationsProps) {
  const [branches, setBranches] = useState<BranchLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchLocation | null>(null);
  const [formData, setFormData] = useState(emptyFormData);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && companyId) {
      fetchBranches();
    }
  }, [isOpen, companyId]);

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("company_branch_locations")
        .select("*")
        .eq("company_id", companyId)
        .order("is_headquarters", { ascending: false })
        .order("name");

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast({
        title: "Error",
        description: "Failed to load branch locations.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (branch?: BranchLocation) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        code: branch.code,
        address: branch.address || "",
        city: branch.city || "",
        state: branch.state || "",
        country: branch.country || "",
        postal_code: branch.postal_code || "",
        phone: branch.phone || "",
        email: branch.email || "",
        is_headquarters: branch.is_headquarters,
        is_active: branch.is_active,
        start_date: branch.start_date,
        end_date: branch.end_date || "",
      });
    } else {
      setEditingBranch(null);
      setFormData(emptyFormData);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBranch(null);
    setFormData(emptyFormData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and Code are required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const branchData = {
        company_id: companyId,
        name: formData.name.trim(),
        code: formData.code.toUpperCase().trim(),
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country || null,
        postal_code: formData.postal_code || null,
        phone: formData.phone || null,
        email: formData.email || null,
        is_headquarters: formData.is_headquarters,
        is_active: formData.is_active,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
      };

      if (editingBranch) {
        const { error } = await supabase
          .from("company_branch_locations")
          .update(branchData)
          .eq("id", editingBranch.id);

        if (error) throw error;
        toast({ title: "Branch updated" });
      } else {
        const { error } = await supabase
          .from("company_branch_locations")
          .insert(branchData);

        if (error) {
          if (error.code === "23505") {
            toast({
              title: "Duplicate Code",
              description: "A branch with this code already exists for this company.",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
          throw error;
        }
        toast({ title: "Branch created" });
      }

      handleCloseForm();
      fetchBranches();
    } catch (error) {
      console.error("Error saving branch:", error);
      toast({
        title: "Error",
        description: "Failed to save branch location.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (branch: BranchLocation) => {
    if (!confirm(`Delete branch "${branch.name}"?`)) return;

    try {
      const { error } = await supabase
        .from("company_branch_locations")
        .delete()
        .eq("id", branch.id);

      if (error) throw error;
      toast({ title: "Branch deleted" });
      fetchBranches();
    } catch (error) {
      console.error("Error deleting branch:", error);
      toast({
        title: "Error",
        description: "Failed to delete branch.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Branch Locations - {companyName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => handleOpenForm()} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Branch
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : branches.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
              <MapPin className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">No branch locations yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-4 transition-colors",
                    branch.is_active
                      ? "border-border bg-card"
                      : "border-border/50 bg-muted/50 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold",
                        branch.is_headquarters
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {branch.code.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-card-foreground">
                          {branch.name}
                        </span>
                        {branch.is_headquarters && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            HQ
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          ({branch.code})
                        </span>
                      </div>
                      {(branch.city || branch.country) && (
                        <p className="text-sm text-muted-foreground">
                          <MapPin className="mr-1 inline h-3 w-3" />
                          {[branch.city, branch.state, branch.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenForm(branch)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(branch)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Branch Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBranch ? "Edit Branch" : "Add Branch"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Main Office"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="HQ"
                    className="uppercase"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Address</Label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State / Province</Label>
                  <Input
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_headquarters}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_headquarters: checked })
                    }
                  />
                  <Label>Headquarters</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingBranch ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
