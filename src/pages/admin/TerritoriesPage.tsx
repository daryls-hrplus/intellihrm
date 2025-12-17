import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus, Pencil, Trash2, Globe, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";

interface Territory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  region_type: string;
  parent_territory_id: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_at: string;
  parent_territory?: { name: string }[] | null;
  companies_count?: number;
}

interface TerritoryFormData {
  name: string;
  code: string;
  description: string;
  region_type: string;
  parent_territory_id: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
}

const initialFormData: TerritoryFormData = {
  name: "",
  code: "",
  description: "",
  region_type: "geographic",
  parent_territory_id: "",
  is_active: true,
  start_date: getTodayString(),
  end_date: "",
};

export default function TerritoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTerritory, setEditingTerritory] = useState<Territory | null>(null);
  const [formData, setFormData] = useState<TerritoryFormData>(initialFormData);
  const queryClient = useQueryClient();

  const breadcrumbItems = [
    { label: "Admin & Security", href: "/admin" },
    { label: "Territories" },
  ];

  const { data: territories, isLoading } = useQuery({
    queryKey: ["territories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("territories")
        .select(`
          *,
          parent_territory:territories!territories_parent_territory_id_fkey(name)
        `)
        .order("name");

      if (error) throw error;

      // Get company counts
      const { data: companyCounts } = await supabase
        .from("companies")
        .select("territory_id")
        .not("territory_id", "is", null);

      const countMap = new Map<string, number>();
      companyCounts?.forEach((c) => {
        countMap.set(c.territory_id, (countMap.get(c.territory_id) || 0) + 1);
      });

      return (data as Territory[]).map((t) => ({
        ...t,
        companies_count: countMap.get(t.id) || 0,
      }));
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TerritoryFormData) => {
      const { error } = await supabase.from("territories").insert({
        name: data.name,
        code: data.code,
        description: data.description || null,
        region_type: data.region_type,
        parent_territory_id: data.parent_territory_id || null,
        is_active: data.is_active,
        start_date: data.start_date,
        end_date: data.end_date || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["territories"] });
      toast.success("Territory created successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to create territory: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TerritoryFormData }) => {
      const { error } = await supabase
        .from("territories")
        .update({
          name: data.name,
          code: data.code,
          description: data.description || null,
          region_type: data.region_type,
          parent_territory_id: data.parent_territory_id || null,
          is_active: data.is_active,
          start_date: data.start_date,
          end_date: data.end_date || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["territories"] });
      toast.success("Territory updated successfully");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to update territory: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("territories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["territories"] });
      toast.success("Territory deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete territory: " + error.message);
    },
  });

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTerritory(null);
    setFormData(initialFormData);
  };

  const handleEdit = (territory: Territory) => {
    setEditingTerritory(territory);
    setFormData({
      name: territory.name,
      code: territory.code,
      description: territory.description || "",
      region_type: territory.region_type,
      parent_territory_id: territory.parent_territory_id || "",
      is_active: territory.is_active,
      start_date: territory.start_date,
      end_date: territory.end_date || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTerritory) {
      updateMutation.mutate({ id: editingTerritory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getRegionTypeLabel = (type: string) => {
    switch (type) {
      case "geographic":
        return "Geographic";
      case "business":
        return "Business";
      case "regulatory":
        return "Regulatory";
      default:
        return type;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Territories</h1>
            <p className="text-muted-foreground">
              Manage reporting regions to group companies
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormData(initialFormData)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Territory
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingTerritory ? "Edit Territory" : "Create Territory"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g., Caribbean"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g., CARIB"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of this territory"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="region_type">Region Type</Label>
                    <Select
                      value={formData.region_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, region_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geographic">Geographic</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="regulatory">Regulatory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent">Parent Territory</Label>
                    <Select
                      value={formData.parent_territory_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, parent_territory_id: value === "none" ? "" : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {territories
                          ?.filter((t) => t.id !== editingTerritory?.id)
                          .map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {editingTerritory ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              All Territories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : territories?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No territories found. Create your first territory to group companies by region.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Companies</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {territories?.map((territory) => (
                    <TableRow key={territory.id}>
                      <TableCell className="font-medium">{territory.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{territory.code}</Badge>
                      </TableCell>
                      <TableCell>{getRegionTypeLabel(territory.region_type)}</TableCell>
                      <TableCell>
                        {territory.parent_territory?.[0]?.name || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{territory.companies_count}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={territory.is_active ? "default" : "secondary"}>
                          {territory.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateForDisplay(territory.start_date, "MMM d, yyyy")}
                        {territory.end_date && (
                          <> - {formatDateForDisplay(territory.end_date, "MMM d, yyyy")}</>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(territory)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this territory?")) {
                                deleteMutation.mutate(territory.id);
                              }
                            }}
                            disabled={territory.companies_count > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
