import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Target, ChevronDown, ChevronRight, Layers, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";
import { NavLink } from "react-router-dom";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface Competency {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  category: string;
  proficiency_levels: unknown;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  companies?: { name: string };
}

interface CompetencyLevel {
  id: string;
  competency_id: string;
  name: string;
  code: string;
  description: string | null;
  level_order: number;
  is_active: boolean;
}

const categoryOptions = [
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "leadership", label: "Leadership" },
  { value: "functional", label: "Functional" },
  { value: "core", label: "Core" },
];

const emptyForm = {
  company_id: "",
  name: "",
  code: "",
  description: "",
  category: "technical",
  proficiency_levels: [] as string[],
  is_active: true,
  start_date: new Date().toISOString().split("T")[0],
  end_date: "",
};

const emptyLevelForm = {
  name: "",
  code: "",
  description: "",
  level_order: 1,
  is_active: true,
};

export default function CompetenciesPage() {
  const { t } = useLanguage();
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompetency, setSelectedCompetency] = useState<Competency | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>("all");
  const { logAction } = useAuditLog();

  // Competency Levels state
  const [expandedCompetency, setExpandedCompetency] = useState<string | null>(null);
  const [competencyLevels, setCompetencyLevels] = useState<Record<string, CompetencyLevel[]>>({});
  const [levelsLoading, setLevelsLoading] = useState<string | null>(null);
  const [isLevelDialogOpen, setIsLevelDialogOpen] = useState(false);
  const [isLevelDeleteDialogOpen, setIsLevelDeleteDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<CompetencyLevel | null>(null);
  const [levelFormData, setLevelFormData] = useState(emptyLevelForm);
  const [levelCompetencyId, setLevelCompetencyId] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchCompetencies();
  }, [selectedCompanyFilter]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, name, code")
      .eq("is_active", true)
      .order("name");
    if (data) setCompanies(data);
  };

  const fetchCompetencies = async () => {
    setLoading(true);
    let query = supabase
      .from("competencies")
      .select("*, companies(name)")
      .order("name");

    if (selectedCompanyFilter !== "all") {
      query = query.eq("company_id", selectedCompanyFilter);
    }

    const { data, error } = await query;
    if (error) {
      toast.error(t("workforce.competencies.failedToFetch"));
    } else {
      setCompetencies(data || []);
    }
    setLoading(false);
  };

  const fetchLevels = async (competencyId: string) => {
    setLevelsLoading(competencyId);
    const { data, error } = await supabase
      .from("competency_levels")
      .select("*")
      .eq("competency_id", competencyId)
      .order("level_order");

    if (error) {
      toast.error(t("workforce.competencies.levels.failedToFetch"));
    } else {
      setCompetencyLevels((prev) => ({ ...prev, [competencyId]: data || [] }));
    }
    setLevelsLoading(null);
  };

  const toggleExpand = async (competencyId: string) => {
    if (expandedCompetency === competencyId) {
      setExpandedCompetency(null);
    } else {
      setExpandedCompetency(competencyId);
      if (!competencyLevels[competencyId]) {
        await fetchLevels(competencyId);
      }
    }
  };

  const handleAdd = () => {
    setSelectedCompetency(null);
    setFormData({
      ...emptyForm,
      company_id: selectedCompanyFilter !== "all" ? selectedCompanyFilter : "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (competency: Competency) => {
    setSelectedCompetency(competency);
    setFormData({
      company_id: competency.company_id,
      name: competency.name,
      code: competency.code,
      description: competency.description || "",
      category: competency.category,
      proficiency_levels: Array.isArray(competency.proficiency_levels) ? competency.proficiency_levels : [],
      is_active: competency.is_active,
      start_date: competency.start_date,
      end_date: competency.end_date || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (competency: Competency) => {
    setSelectedCompetency(competency);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.company_id || !formData.name || !formData.code) {
      toast.error(t("workforce.competencies.fillRequired"));
      return;
    }

    const payload = {
      company_id: formData.company_id,
      name: formData.name,
      code: formData.code,
      description: formData.description || null,
      category: formData.category,
      proficiency_levels: formData.proficiency_levels,
      is_active: formData.is_active,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
    };

    if (selectedCompetency) {
      const { error } = await supabase
        .from("competencies")
        .update(payload)
        .eq("id", selectedCompetency.id);

      if (error) {
        toast.error(t("workforce.competencies.failedToUpdate"));
        return;
      }
      await logAction({
        action: "UPDATE",
        entityType: "competencies",
        entityId: selectedCompetency.id,
        entityName: formData.name,
        oldValues: { ...selectedCompetency },
        newValues: payload,
      });
      toast.success(t("workforce.competencies.competencyUpdated"));
    } else {
      const { data, error } = await supabase
        .from("competencies")
        .insert([payload])
        .select()
        .single();

      if (error) {
        toast.error(t("workforce.competencies.failedToCreate"));
        return;
      }
      await logAction({
        action: "CREATE",
        entityType: "competencies",
        entityId: data.id,
        entityName: formData.name,
        newValues: payload,
      });
      toast.success(t("workforce.competencies.competencyCreated"));
    }

    setIsDialogOpen(false);
    fetchCompetencies();
  };

  const confirmDelete = async () => {
    if (!selectedCompetency) return;

    const { error } = await supabase
      .from("competencies")
      .delete()
      .eq("id", selectedCompetency.id);

    if (error) {
      toast.error(t("workforce.competencies.failedToDelete"));
      return;
    }

    await logAction({
      action: "DELETE",
      entityType: "competencies",
      entityId: selectedCompetency.id,
      entityName: selectedCompetency.name,
      oldValues: { ...selectedCompetency },
    });
    toast.success(t("workforce.competencies.competencyDeleted"));
    setIsDeleteDialogOpen(false);
    fetchCompetencies();
  };

  // Level handlers
  const handleAddLevel = (competencyId: string) => {
    setSelectedLevel(null);
    setLevelCompetencyId(competencyId);
    const existingLevels = competencyLevels[competencyId] || [];
    const maxOrder = existingLevels.reduce((max, l) => Math.max(max, l.level_order), 0);
    setLevelFormData({ ...emptyLevelForm, level_order: maxOrder + 1 });
    setIsLevelDialogOpen(true);
  };

  const handleEditLevel = (level: CompetencyLevel) => {
    setSelectedLevel(level);
    setLevelCompetencyId(level.competency_id);
    setLevelFormData({
      name: level.name,
      code: level.code,
      description: level.description || "",
      level_order: level.level_order,
      is_active: level.is_active,
    });
    setIsLevelDialogOpen(true);
  };

  const handleDeleteLevel = (level: CompetencyLevel) => {
    setSelectedLevel(level);
    setIsLevelDeleteDialogOpen(true);
  };

  const handleSaveLevel = async () => {
    if (!levelCompetencyId || !levelFormData.name || !levelFormData.code) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      competency_id: levelCompetencyId,
      name: levelFormData.name,
      code: levelFormData.code,
      description: levelFormData.description || null,
      level_order: levelFormData.level_order,
      is_active: levelFormData.is_active,
    };

    if (selectedLevel) {
      const { error } = await supabase
        .from("competency_levels")
        .update(payload)
        .eq("id", selectedLevel.id);

      if (error) {
        toast.error("Failed to update level");
        return;
      }
      await logAction({
        action: "UPDATE",
        entityType: "competency_levels",
        entityId: selectedLevel.id,
        entityName: levelFormData.name,
        oldValues: { ...selectedLevel },
        newValues: payload,
      });
      toast.success("Level updated");
    } else {
      const { data, error } = await supabase
        .from("competency_levels")
        .insert([payload])
        .select()
        .single();

      if (error) {
        toast.error("Failed to create level");
        return;
      }
      await logAction({
        action: "CREATE",
        entityType: "competency_levels",
        entityId: data.id,
        entityName: levelFormData.name,
        newValues: payload,
      });
      toast.success("Level created");
    }

    setIsLevelDialogOpen(false);
    fetchLevels(levelCompetencyId);
  };

  const confirmDeleteLevel = async () => {
    if (!selectedLevel) return;

    const { error } = await supabase
      .from("competency_levels")
      .delete()
      .eq("id", selectedLevel.id);

    if (error) {
      toast.error("Failed to delete level");
      return;
    }

    await logAction({
      action: "DELETE",
      entityType: "competency_levels",
      entityId: selectedLevel.id,
      entityName: selectedLevel.name,
      oldValues: { ...selectedLevel },
    });
    toast.success("Level deleted");
    setIsLevelDeleteDialogOpen(false);
    fetchLevels(selectedLevel.competency_id);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <NavLink to="/workforce" className="hover:text-foreground">
            Workforce
          </NavLink>
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <span className="text-foreground">Competencies</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Competencies</h1>
              <p className="text-muted-foreground">
                Manage competency definitions for workforce planning
              </p>
            </div>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Competency
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Competencies List
              </CardTitle>
              <Select value={selectedCompanyFilter} onValueChange={setSelectedCompanyFilter}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filter by company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : competencies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No competencies found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competencies.map((competency) => (
                    <>
                      <TableRow key={competency.id}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleExpand(competency.id)}
                          >
                            {expandedCompetency === competency.id ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{competency.name}</TableCell>
                        <TableCell>{competency.code}</TableCell>
                        <TableCell>{competency.companies?.name}</TableCell>
                        <TableCell className="capitalize">{competency.category}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              competency.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {competency.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell>{competency.start_date}</TableCell>
                        <TableCell>{competency.end_date || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(competency)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(competency)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedCompetency === competency.id && (
                        <TableRow>
                          <TableCell colSpan={9} className="bg-muted/30 p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold flex items-center gap-2">
                                  <Layers className="h-4 w-4" />
                                  Proficiency Levels
                                </h4>
                                <Button
                                  size="sm"
                                  onClick={() => handleAddLevel(competency.id)}
                                >
                                  <Plus className="mr-1 h-3 w-3" />
                                  Add Level
                                </Button>
                              </div>
                              {levelsLoading === competency.id ? (
                                <div className="text-sm text-muted-foreground">Loading levels...</div>
                              ) : (competencyLevels[competency.id]?.length || 0) === 0 ? (
                                <div className="text-sm text-muted-foreground">No levels defined</div>
                              ) : (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Order</TableHead>
                                      <TableHead>Name</TableHead>
                                      <TableHead>Code</TableHead>
                                      <TableHead>Description</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {competencyLevels[competency.id]?.map((level) => (
                                      <TableRow key={level.id}>
                                        <TableCell>{level.level_order}</TableCell>
                                        <TableCell className="font-medium">{level.name}</TableCell>
                                        <TableCell>{level.code}</TableCell>
                                        <TableCell className="max-w-xs truncate">
                                          {level.description || "-"}
                                        </TableCell>
                                        <TableCell>
                                          <span
                                            className={`px-2 py-1 rounded-full text-xs ${
                                              level.is_active
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                          >
                                            {level.is_active ? "Active" : "Inactive"}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEditLevel(level)}
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteLevel(level)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Competency Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedCompetency ? "Edit Competency" : "Add Competency"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Company *</Label>
                <Select
                  value={formData.company_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, company_id: value })
                  }
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
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Competency Level Dialog */}
        <Dialog open={isLevelDialogOpen} onOpenChange={setIsLevelDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedLevel ? "Edit Level" : "Add Level"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={levelFormData.name}
                    onChange={(e) =>
                      setLevelFormData({ ...levelFormData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input
                    value={levelFormData.code}
                    onChange={(e) =>
                      setLevelFormData({ ...levelFormData, code: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={levelFormData.description}
                  onChange={(e) =>
                    setLevelFormData({ ...levelFormData, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Level Order *</Label>
                <Input
                  type="number"
                  min={1}
                  value={levelFormData.level_order}
                  onChange={(e) =>
                    setLevelFormData({ ...levelFormData, level_order: parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={levelFormData.is_active}
                  onCheckedChange={(checked) =>
                    setLevelFormData({ ...levelFormData, is_active: checked })
                  }
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLevelDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveLevel}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Competency Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Competency</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedCompetency?.name}"? This
                will also delete all associated levels.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Level Dialog */}
        <AlertDialog open={isLevelDeleteDialogOpen} onOpenChange={setIsLevelDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Level</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedLevel?.name}"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteLevel}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
