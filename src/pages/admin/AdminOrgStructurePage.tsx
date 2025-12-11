import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  ArrowLeft, 
  Building2, 
  Layers, 
  FolderTree, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Network,
} from "lucide-react";
import { PositionsManagement } from "@/components/admin/PositionsManagement";
import { OrgChartVisualization } from "@/components/admin/OrgChartVisualization";
import { GovernanceManagement } from "@/components/admin/GovernanceManagement";
import { VacancyDashboard } from "@/components/admin/VacancyDashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NavLink } from "react-router-dom";

interface Company {
  id: string;
  name: string;
  code: string;
}

interface CompanyDivision {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
}

interface Department {
  id: string;
  company_id: string;
  company_division_id: string | null;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
}

interface Section {
  id: string;
  department_id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
}

type EntityType = "division" | "department" | "section";

export default function AdminOrgStructurePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [divisions, setDivisions] = useState<CompanyDivision[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDivisions, setExpandedDivisions] = useState<Set<string>>(new Set());
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<EntityType>("division");
  const [editingEntity, setEditingEntity] = useState<any>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDivisionId, setFormDivisionId] = useState<string>("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchOrgStructure();
    }
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setCompanies(data || []);
      
      if (data && data.length > 0) {
        setSelectedCompanyId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrgStructure = async () => {
    setIsLoading(true);
    try {
      const [divisionsRes, departmentsRes, sectionsRes] = await Promise.all([
        supabase
          .from("company_divisions")
          .select("*")
          .eq("company_id", selectedCompanyId)
          .order("name"),
        supabase
          .from("departments")
          .select("*")
          .eq("company_id", selectedCompanyId)
          .order("name"),
        supabase
          .from("sections")
          .select("*")
          .order("name"),
      ]);

      if (divisionsRes.error) throw divisionsRes.error;
      if (departmentsRes.error) throw departmentsRes.error;
      if (sectionsRes.error) throw sectionsRes.error;

      setDivisions(divisionsRes.data || []);
      setDepartments(departmentsRes.data || []);
      
      // Filter sections to only those belonging to departments in this company
      const deptIds = (departmentsRes.data || []).map(d => d.id);
      const filteredSections = (sectionsRes.data || []).filter(s => deptIds.includes(s.department_id));
      setSections(filteredSections);
    } catch (error) {
      console.error("Error fetching org structure:", error);
      toast.error("Failed to load organizational structure");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = (type: EntityType, parent?: string) => {
    setDialogType(type);
    setEditingEntity(null);
    setParentId(parent || null);
    setFormName("");
    setFormCode("");
    setFormDescription("");
    setFormIsActive(true);
    setFormDivisionId("");
    setDialogOpen(true);
  };

  const openEditDialog = (type: EntityType, entity: any) => {
    setDialogType(type);
    setEditingEntity(entity);
    setParentId(null);
    setFormName(entity.name);
    setFormCode(entity.code);
    setFormDescription(entity.description || "");
    setFormIsActive(entity.is_active);
    setFormDivisionId(entity.company_division_id || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formCode.trim()) {
      toast.error("Name and code are required");
      return;
    }

    setIsProcessing(true);
    try {
      if (dialogType === "division") {
        const data = {
          company_id: selectedCompanyId,
          name: formName.trim(),
          code: formCode.trim(),
          description: formDescription.trim() || null,
          is_active: formIsActive,
        };

        if (editingEntity) {
          const { error } = await supabase
            .from("company_divisions")
            .update(data)
            .eq("id", editingEntity.id);
          if (error) throw error;
          toast.success("Division updated");
        } else {
          const { error } = await supabase
            .from("company_divisions")
            .insert(data);
          if (error) throw error;
          toast.success("Division created");
        }
      } else if (dialogType === "department") {
        const data = {
          company_id: selectedCompanyId,
          company_division_id: formDivisionId || parentId || null,
          name: formName.trim(),
          code: formCode.trim(),
          description: formDescription.trim() || null,
          is_active: formIsActive,
        };

        if (editingEntity) {
          const { error } = await supabase
            .from("departments")
            .update(data)
            .eq("id", editingEntity.id);
          if (error) throw error;
          toast.success("Department updated");
        } else {
          const { error } = await supabase
            .from("departments")
            .insert(data);
          if (error) throw error;
          toast.success("Department created");
        }
      } else if (dialogType === "section") {
        const data = {
          department_id: parentId || editingEntity?.department_id,
          name: formName.trim(),
          code: formCode.trim(),
          description: formDescription.trim() || null,
          is_active: formIsActive,
        };

        if (editingEntity) {
          const { error } = await supabase
            .from("sections")
            .update(data)
            .eq("id", editingEntity.id);
          if (error) throw error;
          toast.success("Section updated");
        } else {
          const { error } = await supabase
            .from("sections")
            .insert(data);
          if (error) throw error;
          toast.success("Section created");
        }
      }

      setDialogOpen(false);
      fetchOrgStructure();
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (type: EntityType, id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const table = type === "division" ? "company_divisions" : type === "department" ? "departments" : "sections";
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted`);
      fetchOrgStructure();
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete");
    }
  };

  const toggleDivision = (id: string) => {
    setExpandedDivisions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleDepartment = (id: string) => {
    setExpandedDepartments(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getDepartmentsForDivision = (divisionId: string) => 
    departments.filter(d => d.company_division_id === divisionId);

  const getDepartmentsWithoutDivision = () => 
    departments.filter(d => !d.company_division_id);

  const getSectionsForDepartment = (departmentId: string) => 
    sections.filter(s => s.department_id === departmentId);

  const getDialogTitle = () => {
    const action = editingEntity ? "Edit" : "Add";
    switch (dialogType) {
      case "division": return `${action} Division`;
      case "department": return `${action} Department`;
      case "section": return `${action} Section`;
    }
  };

  if (isLoading && companies.length === 0) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Organizational Structure" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NavLink
              to="/admin"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted"
            >
              <ArrowLeft className="h-5 w-5" />
            </NavLink>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <FolderTree className="h-8 w-8 text-primary" />
                Organizational Structure
              </h1>
              <p className="text-muted-foreground">
                Manage divisions, departments, and sections within companies
              </p>
            </div>
          </div>
        </div>

        {/* Company Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Select Company</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name} ({company.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedCompanyId && (
          <Tabs defaultValue="structure" className="space-y-6">
            <TabsList className="flex-wrap">
              <TabsTrigger value="structure" className="flex items-center gap-2">
                <FolderTree className="h-4 w-4" />
                Structure
              </TabsTrigger>
              <TabsTrigger value="positions" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Positions
              </TabsTrigger>
              <TabsTrigger value="orgchart" className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                Org Chart
              </TabsTrigger>
              <TabsTrigger value="governance" className="flex items-center gap-2">
                Governance
              </TabsTrigger>
              <TabsTrigger value="vacancies" className="flex items-center gap-2">
                Vacancies
              </TabsTrigger>
            </TabsList>

            <TabsContent value="structure">
              <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Divisions
                  </CardTitle>
                  <Button size="sm" onClick={() => openCreateDialog("division")}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                <CardDescription>
                  Optional internal divisions within the company
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : divisions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No divisions. Departments can be added directly to the company.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {divisions.map((div) => (
                      <div
                        key={div.id}
                        className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{div.name}</p>
                            <p className="text-xs text-muted-foreground">{div.code}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {!div.is_active && (
                              <Badge variant="secondary" className="text-xs">Inactive</Badge>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => openEditDialog("division", div)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive"
                              onClick={() => handleDelete("division", div.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Departments Panel */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Departments
                  </CardTitle>
                  <Button size="sm" onClick={() => openCreateDialog("department")}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                <CardDescription>
                  Business units (required for companies)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : departments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No departments yet. Add your first department.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {departments.map((dept) => {
                      const division = divisions.find(d => d.id === dept.company_division_id);
                      return (
                        <div
                          key={dept.id}
                          className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{dept.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {dept.code}
                                {division && (
                                  <span className="ml-2 text-primary">• {division.name}</span>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {!dept.is_active && (
                                <Badge variant="secondary" className="text-xs">Inactive</Badge>
                              )}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => openEditDialog("department", dept)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive"
                                onClick={() => handleDelete("department", dept.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sections Panel */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FolderTree className="h-5 w-5" />
                    Sections
                  </CardTitle>
                </div>
                <CardDescription>
                  Sub-departments within departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : departments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Add departments first to create sections.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {departments.map((dept) => {
                      const deptSections = getSectionsForDepartment(dept.id);
                      return (
                        <Collapsible key={dept.id}>
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                              <div className="flex items-center gap-2">
                                <ChevronRight className="h-4 w-4 transition-transform ui-open:rotate-90" />
                                <span className="text-sm font-medium">{dept.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {deptSections.length}
                                </Badge>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCreateDialog("section", dept.id);
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="ml-6 space-y-1 py-1">
                              {deptSections.length === 0 ? (
                                <p className="text-xs text-muted-foreground py-2">
                                  No sections
                                </p>
                              ) : (
                                deptSections.map((section) => (
                                  <div
                                    key={section.id}
                                    className="flex items-center justify-between p-2 rounded border bg-background"
                                  >
                                    <div>
                                      <p className="text-sm">{section.name}</p>
                                      <p className="text-xs text-muted-foreground">{section.code}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6"
                                        onClick={() => openEditDialog("section", section)}
                                      >
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-destructive"
                                        onClick={() => handleDelete("section", section.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
            </TabsContent>

            <TabsContent value="positions">
              <PositionsManagement companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="orgchart">
              <OrgChartVisualization companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="governance">
              <GovernanceManagement companyId={selectedCompanyId} />
            </TabsContent>

            <TabsContent value="vacancies">
              <VacancyDashboard companyId={selectedCompanyId} />
            </TabsContent>
          </Tabs>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{getDialogTitle()}</DialogTitle>
              <DialogDescription>
                {dialogType === "division" && "Divisions are optional organizational units within a company."}
                {dialogType === "department" && "Departments are business units that can belong to a division or directly to the company."}
                {dialogType === "section" && "Sections are sub-units within a department."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Human Resources"
                  />
                </div>
                <div>
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g., HR"
                  />
                </div>
              </div>

              {dialogType === "department" && divisions.length > 0 && (
                <div>
                  <Label htmlFor="division">Division (Optional)</Label>
                  <Select value={formDivisionId} onValueChange={setFormDivisionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="No division (direct to company)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No division</SelectItem>
                      {divisions.filter(d => d.is_active).map((div) => (
                        <SelectItem key={div.id} value={div.id}>
                          {div.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={2}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="active"
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isProcessing}>
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {editingEntity ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
