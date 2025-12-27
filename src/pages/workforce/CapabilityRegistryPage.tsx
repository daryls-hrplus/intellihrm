import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import {
  Plus,
  Search,
  Zap,
  Target,
  ChevronLeft,
  Filter,
  Layers,
  Loader2,
  BarChart3,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  useCapabilities,
  useProficiencyScales,
  Capability,
  CapabilityType,
  CapabilityCategory,
  CapabilityStatus,
  CapabilityFilters,
  CreateCapabilityInput,
} from "@/hooks/useCapabilities";
import { CapabilityCard } from "@/components/capabilities/CapabilityCard";
import { CapabilityFormDialog } from "@/components/capabilities/CapabilityFormDialog";
import { SkillMappingsDialog } from "@/components/capabilities/SkillMappingsDialog";

interface Company {
  id: string;
  name: string;
}

export default function CapabilityRegistryPage() {
  const {
    capabilities,
    loading,
    fetchCapabilities,
    createCapability,
    updateCapability,
    deleteCapability,
    updateStatus,
  } = useCapabilities();
  const { scales, fetchScales } = useProficiencyScales();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "skills" | "competencies">("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMappingsOpen, setIsMappingsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState<Capability | null>(null);
  const [defaultType, setDefaultType] = useState<CapabilityType>("SKILL");

  useEffect(() => {
    fetchCompanies();
    fetchScales();
  }, [fetchScales]);

  useEffect(() => {
    const filters: CapabilityFilters = {
      type: activeTab === "skills" ? "SKILL" : activeTab === "competencies" ? "COMPETENCY" : undefined,
      category: categoryFilter !== "all" ? (categoryFilter as CapabilityCategory) : undefined,
      status: statusFilter !== "all" ? (statusFilter as CapabilityStatus) : undefined,
      companyId: companyFilter !== "all" ? companyFilter : undefined,
      search: search || undefined,
    };
    fetchCapabilities(filters);
  }, [activeTab, categoryFilter, statusFilter, companyFilter, search, fetchCapabilities]);

  const fetchCompanies = async () => {
    const { data } = await supabase
      .from("companies")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    if (data) setCompanies(data);
  };

  const handleAdd = (type: CapabilityType = "SKILL") => {
    setSelectedCapability(null);
    setDefaultType(type);
    setIsFormOpen(true);
  };

  const handleEdit = (capability: Capability) => {
    setSelectedCapability(capability);
    setDefaultType(capability.type);
    setIsFormOpen(true);
  };

  const handleDelete = (capability: Capability) => {
    setSelectedCapability(capability);
    setIsDeleteOpen(true);
  };

  const handleViewMappings = (capability: Capability) => {
    setSelectedCapability(capability);
    setIsMappingsOpen(true);
  };

  const handleSave = async (data: CreateCapabilityInput) => {
    if (selectedCapability) {
      await updateCapability(selectedCapability.id, data);
    } else {
      await createCapability(data);
    }
    fetchCapabilities({
      type: activeTab === "skills" ? "SKILL" : activeTab === "competencies" ? "COMPETENCY" : undefined,
    });
  };

  const confirmDelete = async () => {
    if (!selectedCapability) return;
    await deleteCapability(selectedCapability.id);
    setIsDeleteOpen(false);
    fetchCapabilities({
      type: activeTab === "skills" ? "SKILL" : activeTab === "competencies" ? "COMPETENCY" : undefined,
    });
  };

  const handleStatusChange = async (id: string, status: "active" | "deprecated") => {
    await updateStatus(id, status);
    fetchCapabilities({
      type: activeTab === "skills" ? "SKILL" : activeTab === "competencies" ? "COMPETENCY" : undefined,
    });
  };

  const skillCount = capabilities.filter((c) => c.type === "SKILL").length;
  const competencyCount = capabilities.filter((c) => c.type === "COMPETENCY").length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <NavLink to="/workforce" className="hover:text-foreground">
            Workforce
          </NavLink>
          <ChevronLeft className="h-4 w-4 rotate-180" />
          <span className="text-foreground">Skills & Competencies</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Skills & Competencies</h1>
              <p className="text-muted-foreground">
                Manage your organization's skills and competencies framework
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleAdd("COMPETENCY")}>
              <Target className="mr-2 h-4 w-4" />
              Add Competency
            </Button>
            <Button onClick={() => handleAdd("SKILL")}>
              <Zap className="mr-2 h-4 w-4" />
              Add Skill
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{skillCount}</p>
                  <p className="text-sm text-muted-foreground">Skills</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                  <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{competencyCount}</p>
                  <p className="text-sm text-muted-foreground">Competencies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                  <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {capabilities.filter((c) => c.status === "active").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                  <Filter className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{scales.length}</p>
                  <p className="text-sm text-muted-foreground">Scales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Skills & Competencies</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search skills & competencies..."
                    className="pl-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="functional">Functional</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="core">Core</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_approval">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Company" />
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
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList>
                <TabsTrigger value="all" className="gap-2">
                  <Layers className="h-4 w-4" />
                  All
                  <Badge variant="secondary">{capabilities.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="skills" className="gap-2">
                  <Zap className="h-4 w-4" />
                  Skills
                  <Badge variant="secondary">{skillCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="competencies" className="gap-2">
                  <Target className="h-4 w-4" />
                  Competencies
                  <Badge variant="secondary">{competencyCount}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : capabilities.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No skills or competencies found</p>
                    <p className="text-sm">
                      Create your first {activeTab === "skills" ? "skill" : activeTab === "competencies" ? "competency" : "skill or competency"} to get started.
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => handleAdd(activeTab === "competencies" ? "COMPETENCY" : "SKILL")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add {activeTab === "competencies" ? "Competency" : "Skill"}
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {capabilities.map((capability) => (
                      <CapabilityCard
                        key={capability.id}
                        capability={capability}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                        onViewMappings={capability.type === "COMPETENCY" ? handleViewMappings : undefined}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <CapabilityFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        capability={selectedCapability}
        scales={scales}
        companies={companies}
        onSave={handleSave}
        defaultType={defaultType}
      />

      {/* Skill Mappings Dialog */}
      <SkillMappingsDialog
        open={isMappingsOpen}
        onOpenChange={setIsMappingsOpen}
        competency={selectedCapability}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCapability?.type === 'SKILL' ? 'Skill' : 'Competency'}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCapability?.name}"? This action
              cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
