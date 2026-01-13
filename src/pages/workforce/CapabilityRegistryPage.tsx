import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Plus,
  Search,
  Zap,
  Target,
  ChevronLeft,
  ChevronDown,
  Filter,
  Layers,
  Loader2,
  BarChart3,
  Sparkles,
  Upload,
  Heart,
  HelpCircle,
  FileDown,
  CalendarIcon,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CompanyValuesTab } from "@/components/capabilities/CompanyValuesTab";
import { toast } from "sonner";
import { format } from "date-fns";
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
import { CapabilityCard, CapabilityWithMeta } from "@/components/capabilities/CapabilityCard";
import { CapabilityFormDialog } from "@/components/capabilities/CapabilityFormDialog";
import { SkillMappingsDialog } from "@/components/capabilities/SkillMappingsDialog";
import { SkillsQuickStartWizard } from "@/components/capabilities/SkillsQuickStartWizard";
import { BatchGenerateIndicatorsButton } from "@/components/capabilities/BatchGenerateIndicatorsButton";
import { BulkCompetencyImport } from "@/components/capabilities/BulkCompetencyImport";
import { EmptyStateOnboarding } from "@/components/capabilities/EmptyStateOnboarding";
import { VersionHistoryDialog } from "@/components/capabilities/VersionHistoryDialog";
import { DeprecationImpactDialog } from "@/components/capabilities/DeprecationImpactDialog";
import { ConfigurationWizard } from "@/components/capabilities/ConfigurationWizard";
import { CompetencyJobLinker } from "@/components/capabilities/CompetencyJobLinker";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Company {
  id: string;
  name: string;
}

export default function CapabilityRegistryPage() {
  const { user } = useAuth();
  const {
    capabilities,
    loading,
    relationshipCounts,
    fetchCapabilities,
    fetchRelationshipCounts,
    createCapability,
    updateCapability,
    deleteCapability,
    updateStatus,
  } = useCapabilities();
  const { scales, fetchScales } = useProficiencyScales();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);
  const [showQuickStartPrompt, setShowQuickStartPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "skills" | "competencies" | "values">("all");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("");
  
  // Date-driven filters
  const [effectiveAsOfDate, setEffectiveAsOfDate] = useState<Date | undefined>(undefined);
  const [includeExpired, setIncludeExpired] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMappingsOpen, setIsMappingsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isDeprecationOpen, setIsDeprecationOpen] = useState(false);
  const [isConfigWizardOpen, setIsConfigWizardOpen] = useState(false);
  const [isJobLinkerOpen, setIsJobLinkerOpen] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState<Capability | null>(null);
  const [defaultType, setDefaultType] = useState<CapabilityType>("SKILL");

  useEffect(() => {
    fetchCompanies();
    fetchScales();
  }, [fetchScales]);

  // Auto-select first company when companies are loaded and no filter is set
  useEffect(() => {
    if (companies.length > 0 && !companyFilter) {
      setCompanyFilter(companies[0].id);
    }
  }, [companies, companyFilter]);

  // Show quick start prompt if no capabilities exist
  useEffect(() => {
    if (!loading && capabilities.length === 0 && companies.length > 0) {
      setShowQuickStartPrompt(true);
    }
  }, [loading, capabilities.length, companies.length]);

  useEffect(() => {
    // Only fetch when we have a company filter set (avoids fetching all companies' data)
    if (!companyFilter) return;
    
    const filters: CapabilityFilters = {
      type: activeTab === "skills" ? "SKILL" : activeTab === "competencies" ? "COMPETENCY" : undefined,
      category: categoryFilter !== "all" ? (categoryFilter as CapabilityCategory) : undefined,
      status: statusFilter !== "all" ? (statusFilter as CapabilityStatus) : undefined,
      companyId: companyFilter,
      search: search || undefined,
      effectiveAsOf: effectiveAsOfDate ? format(effectiveAsOfDate, "yyyy-MM-dd") : undefined,
      includeExpired: includeExpired,
      includeFuture: true, // Always show future-dated for admin view
    };
    fetchCapabilities(filters);
  }, [activeTab, categoryFilter, statusFilter, companyFilter, search, effectiveAsOfDate, includeExpired, fetchCapabilities]);

  // Fetch relationship counts when capabilities change
  useEffect(() => {
    if (capabilities.length > 0) {
      const capabilityIds = capabilities.map(c => c.id);
      fetchRelationshipCounts(capabilityIds);
    }
  }, [capabilities, fetchRelationshipCounts]);

  // Enrich capabilities with relationship counts
  const enrichedCapabilities = useMemo(() => {
    return capabilities.map(cap => {
      // Check proficiency_indicators - stored as object with keys "1"-"5" by AI generator
      const proficiencyIndicators = (cap as any).proficiency_indicators;
      const hasProficiencyIndicators = proficiencyIndicators && 
        typeof proficiencyIndicators === 'object' && 
        Object.keys(proficiencyIndicators).length > 0;
      
      return {
        ...cap,
        job_count: relationshipCounts[cap.id]?.job_count ?? 0,
        skill_count: relationshipCounts[cap.id]?.skill_count ?? 0,
        has_behavioral_indicators: hasProficiencyIndicators || (cap.type === "SKILL" 
          ? !!(cap.skill_attributes?.inference_keywords?.length)
          : !!(cap.competency_attributes?.behavioral_indicators?.length)),
      };
    }) as CapabilityWithMeta[];
  }, [capabilities, relationshipCounts]);

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
  
  // Get the default company ID based on current filter
  const getDefaultCompanyId = () => {
    if (companyFilter !== "all") return companyFilter;
    return null; // Global by default
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
      includeExpired,
      includeFuture: true,
    });
  };

  const confirmDelete = async () => {
    if (!selectedCapability) return;
    await deleteCapability(selectedCapability.id);
    setIsDeleteOpen(false);
    fetchCapabilities({
      type: activeTab === "skills" ? "SKILL" : activeTab === "competencies" ? "COMPETENCY" : undefined,
      includeExpired,
      includeFuture: true,
    });
  };

  const handleStatusChange = async (id: string, status: "active" | "deprecated") => {
    if (status === "deprecated") {
      // Find the capability and open deprecation dialog
      const cap = capabilities.find(c => c.id === id);
      if (cap) {
        setSelectedCapability(cap);
        setIsDeprecationOpen(true);
        return;
      }
    }
    await updateStatus(id, status);
    fetchCapabilities({
      type: activeTab === "skills" ? "SKILL" : activeTab === "competencies" ? "COMPETENCY" : undefined,
      includeExpired,
      includeFuture: true,
    });
  };

  const handleDeprecationConfirm = async (effectiveTo: string) => {
    if (!selectedCapability) return;
    await updateCapability(selectedCapability.id, {
      status: "deprecated",
      effective_to: effectiveTo,
    });
    fetchCapabilities({
      type: activeTab === "skills" ? "SKILL" : activeTab === "competencies" ? "COMPETENCY" : undefined,
      includeExpired,
      includeFuture: true,
    });
  };

  const handleViewHistory = (capability: Capability) => {
    setSelectedCapability(capability);
    setIsVersionHistoryOpen(true);
  };

  const handleConfigureWizard = (capability: Capability) => {
    setSelectedCapability(capability);
    setIsConfigWizardOpen(true);
  };

  const handleManageJobs = (capability: Capability) => {
    setSelectedCapability(capability);
    setIsJobLinkerOpen(true);
  };

  const handleJobLinkerComplete = () => {
    // Refresh relationship counts to show updated job count
    if (capabilities.length > 0) {
      fetchRelationshipCounts(capabilities.map(c => c.id));
    }
  };

  const handleRestoreVersion = async (snapshot: Capability) => {
    if (!selectedCapability) return;
    await updateCapability(selectedCapability.id, {
      name: snapshot.name,
      code: snapshot.code,
      description: snapshot.description || undefined,
      category: snapshot.category,
      status: snapshot.status,
      effective_from: snapshot.effective_from,
      effective_to: snapshot.effective_to || undefined,
    });
    toast.success("Capability restored to previous version");
    fetchCapabilities({});
  };

  const skillCount = enrichedCapabilities.filter((c) => c.type === "SKILL").length;
  const competencyCount = enrichedCapabilities.filter((c) => c.type === "COMPETENCY").length;
  
  // Count expiring soon items
  const expiringSoonCount = useMemo(() => {
    const now = new Date();
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    return enrichedCapabilities.filter(c => {
      if (!c.effective_to) return false;
      const expiryDate = new Date(c.effective_to);
      return expiryDate > now && expiryDate <= ninetyDaysFromNow;
    }).length;
  }, [enrichedCapabilities]);

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
            {/* Import & Generate Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  Import & Generate
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem onClick={() => setIsQuickStartOpen(true)} className="flex flex-col items-start py-3">
                  <div className="flex items-center">
                    <Sparkles className="mr-2 h-4 w-4 text-primary" />
                    <span className="font-medium">Import from Library</span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-6 mt-0.5">
                    Import from ESCO & O*NET standards
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsBulkImportOpen(true)} className="flex flex-col items-start py-3">
                  <div className="flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    <span className="font-medium">Import from CSV</span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-6 mt-0.5">
                    Upload competencies from spreadsheet
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onSelect={(e) => e.preventDefault()} 
                  className="flex flex-col items-start py-3 cursor-pointer"
                >
                  <BatchGenerateIndicatorsButton
                    companyId={companyFilter || companies[0]?.id}
                    onComplete={() => fetchCapabilities({})}
                    variant="dropdown"
                    type="competency"
                  />
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={(e) => e.preventDefault()} 
                  className="flex flex-col items-start py-3 cursor-pointer"
                >
                  <BatchGenerateIndicatorsButton
                    companyId={companyFilter || companies[0]?.id}
                    onComplete={() => fetchCapabilities({})}
                    variant="dropdown"
                    type="skill"
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
        <div className="grid grid-cols-5 gap-4">
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
                    {enrichedCapabilities.filter((c) => c.status === "active").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  expiringSoonCount > 0 
                    ? "bg-orange-100 dark:bg-orange-900" 
                    : "bg-muted"
                )}>
                  <AlertTriangle className={cn(
                    "h-5 w-5",
                    expiringSoonCount > 0 
                      ? "text-orange-600 dark:text-orange-400" 
                      : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{expiringSoonCount}</p>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
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
                <TooltipProvider>
                  <div className="flex items-center gap-1">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="deprecated">Deprecated</SelectItem>
                      </SelectContent>
                    </Select>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p className="text-sm">
                          <strong>Active:</strong> Ready for use<br />
                          <strong>Deprecated:</strong> Being phased out
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                
                {/* Date Filter */}
                <Popover open={showDateFilter} onOpenChange={setShowDateFilter}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn(
                      "gap-2",
                      (effectiveAsOfDate || includeExpired) && "border-primary"
                    )}>
                      <Clock className="h-4 w-4" />
                      {effectiveAsOfDate ? format(effectiveAsOfDate, "MMM d, yyyy") : "Date Filter"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="end">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">View "As of" Date</Label>
                        <p className="text-xs text-muted-foreground">
                          See which capabilities were/will be effective on a specific date
                        </p>
                        <Calendar
                          mode="single"
                          selected={effectiveAsOfDate}
                          onSelect={setEffectiveAsOfDate}
                          className="rounded-md border"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="include-expired" className="text-sm">
                            Show Expired
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Include expired capabilities
                          </p>
                        </div>
                        <Switch
                          id="include-expired"
                          checked={includeExpired}
                          onCheckedChange={setIncludeExpired}
                        />
                      </div>
                      {(effectiveAsOfDate || includeExpired) && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setEffectiveAsOfDate(undefined);
                            setIncludeExpired(false);
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Company" />
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
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "skills" | "competencies" | "values")}>
              <TabsList>
                <TabsTrigger value="all" className="gap-2">
                  <Layers className="h-4 w-4" />
                  All
                  <Badge variant="secondary">{enrichedCapabilities.length}</Badge>
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
                <TabsTrigger value="values" className="gap-2">
                  <Heart className="h-4 w-4" />
                  Values
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : enrichedCapabilities.length === 0 ? (
                  <EmptyStateOnboarding
                    onOpenWizard={() => setIsQuickStartOpen(true)}
                    onOpenBulkImport={() => setIsBulkImportOpen(true)}
                    onAddSkill={() => handleAdd("SKILL")}
                    onAddCompetency={() => handleAdd("COMPETENCY")}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrichedCapabilities.map((capability) => (
                      <CapabilityCard
                        key={capability.id}
                        capability={capability}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                        onViewHistory={handleViewHistory}
                        onConfigure={handleConfigureWizard}
                        onManageJobs={handleManageJobs}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="skills" className="mt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : skillCount === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No skills found</p>
                    <p className="text-sm mb-4">Create skills manually or import from the library.</p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" onClick={() => setIsQuickStartOpen(true)}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Import from Library
                      </Button>
                      <Button onClick={() => handleAdd("SKILL")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Skill
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrichedCapabilities.filter(c => c.type === "SKILL").map((capability) => (
                      <CapabilityCard
                        key={capability.id}
                        capability={capability}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                        onViewHistory={handleViewHistory}
                        onConfigure={handleConfigureWizard}
                        onManageJobs={handleManageJobs}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="competencies" className="mt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : competencyCount === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No competencies found</p>
                    <p className="text-sm mb-4">Create competencies manually or import from the library.</p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" onClick={() => setIsQuickStartOpen(true)}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Import from Library
                      </Button>
                      <Button onClick={() => handleAdd("COMPETENCY")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Competency
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrichedCapabilities.filter(c => c.type === "COMPETENCY").map((capability) => (
                      <CapabilityCard
                        key={capability.id}
                        capability={capability}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onStatusChange={handleStatusChange}
                        onViewHistory={handleViewHistory}
                        onConfigure={handleConfigureWizard}
                        onManageJobs={handleManageJobs}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="values" className="mt-6">
                <CompanyValuesTab companyId={companyFilter !== "all" ? companyFilter : companies[0]?.id || ""} />
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
        defaultCompanyId={selectedCapability ? selectedCapability.company_id : getDefaultCompanyId()}
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

      {/* Quick Start Wizard */}
      <SkillsQuickStartWizard
        open={isQuickStartOpen || showQuickStartPrompt}
        onOpenChange={(open) => {
          setIsQuickStartOpen(open);
          setShowQuickStartPrompt(false);
        }}
        companyId={companies[0]?.id || ""}
        onComplete={() => {
          fetchCapabilities({});
        }}
      />

      {/* Bulk Competency Import */}
      <BulkCompetencyImport
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
        companyId={companyFilter !== "all" ? companyFilter : companies[0]?.id || ""}
        onImportComplete={() => {
          fetchCapabilities({});
        }}
      />

      {/* Version History Dialog */}
      <VersionHistoryDialog
        open={isVersionHistoryOpen}
        onOpenChange={setIsVersionHistoryOpen}
        capability={selectedCapability}
        onRestore={handleRestoreVersion}
      />

      {/* Deprecation Impact Dialog */}
      <DeprecationImpactDialog
        open={isDeprecationOpen}
        onOpenChange={setIsDeprecationOpen}
        capability={selectedCapability}
        onConfirm={handleDeprecationConfirm}
      />

      {/* Configuration Wizard */}
      <ConfigurationWizard
        open={isConfigWizardOpen}
        onOpenChange={setIsConfigWizardOpen}
        capability={selectedCapability}
        onComplete={() => {
          fetchCapabilities({});
        }}
      />

      {/* Job Linker Dialog */}
      {selectedCapability && (
        <CompetencyJobLinker
          capabilityId={selectedCapability.id}
          capabilityName={selectedCapability.name}
          companyId={selectedCapability.company_id}
          open={isJobLinkerOpen}
          onOpenChange={setIsJobLinkerOpen}
          onComplete={handleJobLinkerComplete}
        />
      )}
    </AppLayout>
  );
}
