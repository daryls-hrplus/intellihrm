import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Search, Plus, Pencil, Globe, Loader2 } from "lucide-react";

interface MasterJobFamily {
  id: string;
  code: string;
  name: string;
  description: string | null;
  industry_category: string | null;
  is_active: boolean;
  created_at: string;
}

const emptyForm = {
  code: "",
  name: "",
  description: "",
  industry_category: "",
  is_active: true,
};

export function MasterJobFamiliesTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<MasterJobFamily | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const { data: masterFamilies = [], isLoading } = useQuery({
    queryKey: ["master-job-families"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_job_families")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as MasterJobFamily[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof emptyForm & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from("master_job_families")
          .update({
            code: data.code.toUpperCase(),
            name: data.name,
            description: data.description || null,
            industry_category: data.industry_category || null,
            is_active: data.is_active,
          })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("master_job_families").insert({
          code: data.code.toUpperCase(),
          name: data.name,
          description: data.description || null,
          industry_category: data.industry_category || null,
          is_active: data.is_active,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["master-job-families"] });
      toast.success(editingFamily ? "Master job family updated" : "Master job family created");
      setDialogOpen(false);
      setEditingFamily(null);
      setFormData(emptyForm);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save");
    },
  });

  const filteredFamilies = masterFamilies.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.code.toLowerCase().includes(search.toLowerCase()) ||
      f.industry_category?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenDialog = (family?: MasterJobFamily) => {
    if (family) {
      setEditingFamily(family);
      setFormData({
        code: family.code,
        name: family.name,
        description: family.description || "",
        industry_category: family.industry_category || "",
        is_active: family.is_active,
      });
    } else {
      setEditingFamily(null);
      setFormData(emptyForm);
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error("Code and name are required");
      return;
    }
    saveMutation.mutate({
      ...formData,
      id: editingFamily?.id,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Master Job Families</h3>
          <Badge variant="secondary">{masterFamilies.length} global definitions</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-[200px]"
            />
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Master Family
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Master job families provide global, industry-standard definitions that companies can subscribe to. 
        Changes here affect how companies can link their job families to global standards.
      </p>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFamilies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No master job families found
                </TableCell>
              </TableRow>
            ) : (
              filteredFamilies.map((family) => (
                <TableRow key={family.id}>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                      {family.code}
                    </code>
                  </TableCell>
                  <TableCell className="font-medium">{family.name}</TableCell>
                  <TableCell>
                    {family.industry_category && (
                      <Badge variant="outline">{family.industry_category}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[300px] truncate">
                    {family.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={family.is_active ? "default" : "secondary"}>
                      {family.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(family)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFamily ? "Edit Master Job Family" : "Add Master Job Family"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., TECH"
                />
              </div>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Technology & IT"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Industry Category</Label>
              <Input
                value={formData.industry_category}
                onChange={(e) => setFormData({ ...formData, industry_category: e.target.value })}
                placeholder="e.g., Cross-Industry, Manufacturing, Tech"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Describe the types of roles in this job family..."
              />
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
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
