import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { EnhancedRatingScaleDialog } from "@/components/performance/EnhancedRatingScaleDialog";
import { OverallRatingScaleDialog } from "@/components/performance/OverallRatingScaleDialog";
import { useOverallRatingScales, OverallRatingScale } from "@/hooks/useRatingScales";
import { TalentApprovalWorkflowManager } from "@/components/performance/setup/TalentApprovalWorkflowManager";
import { Feedback360ConfigSection } from "@/components/performance/setup/Feedback360ConfigSection";
import { 
  Settings, 
  Star, 
  Target, 
  Award, 
  BookOpen, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2,
  Building,
  GitBranch,
  Layers,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Interfaces
interface Company { id: string; name: string; }
interface RatingScale { id: string; company_id: string; name: string; code: string; description: string | null; min_rating: number; max_rating: number; rating_labels: any; scale_purpose: string[] | null; is_default: boolean; is_active: boolean; }
interface Competency { id: string; company_id: string; name: string; code: string; category: string; description: string | null; proficiency_levels: any; is_active: boolean; }
interface GoalTemplate { id: string; company_id: string | null; name: string; description: string | null; goal_type: string; category: string | null; default_weighting: number | null; is_active: boolean; }
interface RecognitionCategory { id: string; company_id: string; name: string; code: string; description: string | null; icon: string | null; color: string | null; points_value: number; requires_approval: boolean; is_active: boolean; }
interface AppraisalCycle { id: string; company_id: string; name: string; description: string | null; start_date: string; end_date: string; status: string; goal_weight: number; competency_weight: number; responsibility_weight: number; min_rating: number; max_rating: number; }

// Section configuration
const setupSections = [
  {
    id: "foundation",
    title: "Foundation Settings",
    description: "Cross-module settings that apply to Goals, Appraisals, 360 Feedback, and other talent processes",
    icon: Layers,
    color: "text-primary",
    bgColor: "bg-primary/10",
    items: [
      { id: "rating-scales", label: "Component Rating Scales", icon: Star },
      { id: "overall-scales", label: "Overall Rating Scales", icon: Layers },
      { id: "competencies", label: "Competency Framework", icon: BookOpen },
      { id: "approval-workflows", label: "Approval Workflows", icon: GitBranch },
    ],
  },
  {
    id: "goals",
    title: "Goals Configuration",
    description: "Goal-specific settings and templates",
    icon: Target,
    color: "text-success",
    bgColor: "bg-success/10",
    items: [
      { id: "goal-templates", label: "Goal Templates", icon: Target },
    ],
  },
  {
    id: "appraisals",
    title: "Appraisals Configuration",
    description: "Performance appraisal cycle settings",
    icon: Calendar,
    color: "text-info",
    bgColor: "bg-info/10",
    items: [
      { id: "appraisal-cycles", label: "Appraisal Cycles", icon: Calendar },
    ],
  },
  {
    id: "360-feedback",
    title: "360° Feedback Configuration",
    description: "Multi-rater feedback settings",
    icon: MessageSquare,
    color: "text-warning",
    bgColor: "bg-warning/10",
    items: [
      { id: "feedback-360", label: "360° Feedback Settings", icon: MessageSquare },
    ],
  },
  {
    id: "recognition",
    title: "Recognition Configuration",
    description: "Employee recognition and rewards settings",
    icon: Award,
    color: "text-secondary-foreground",
    bgColor: "bg-secondary/50",
    items: [
      { id: "recognition-categories", label: "Recognition Categories", icon: Award },
    ],
  },
];

export default function PerformanceSetupPage() {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [activeSection, setActiveSection] = useState("rating-scales");
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["foundation"]);
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [ratingScales, setRatingScales] = useState<RatingScale[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [goalTemplates, setGoalTemplates] = useState<GoalTemplate[]>([]);
  const [recognitionCategories, setRecognitionCategories] = useState<RecognitionCategory[]>([]);
  const [appraisalCycles, setAppraisalCycles] = useState<AppraisalCycle[]>([]);

  // Dialog states
  const [ratingScaleDialogOpen, setRatingScaleDialogOpen] = useState(false);
  const [overallScaleDialogOpen, setOverallScaleDialogOpen] = useState(false);
  const [competencyDialogOpen, setCompetencyDialogOpen] = useState(false);
  const [goalTemplateDialogOpen, setGoalTemplateDialogOpen] = useState(false);
  const [recognitionCategoryDialogOpen, setRecognitionCategoryDialogOpen] = useState(false);

  // Edit states
  const [editingRatingScale, setEditingRatingScale] = useState<RatingScale | null>(null);
  const [editingOverallScale, setEditingOverallScale] = useState<OverallRatingScale | null>(null);
  const [editingCompetency, setEditingCompetency] = useState<Competency | null>(null);
  const [editingGoalTemplate, setEditingGoalTemplate] = useState<GoalTemplate | null>(null);
  const [editingRecognitionCategory, setEditingRecognitionCategory] = useState<RecognitionCategory | null>(null);

  const { scales: overallScales, isLoading: overallScalesLoading, refetch: refetchOverallScales } = useOverallRatingScales({ 
    companyId: selectedCompany, 
    activeOnly: false 
  });

  useEffect(() => { fetchCompanies(); }, []);
  useEffect(() => { if (selectedCompany) fetchAllData(); }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase.from("companies").select("id, name").eq("is_active", true).order("name");
      if (error) throw error;
      setCompanies(data || []);
      if (data && data.length > 0) setSelectedCompany(data[0].id);
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies");
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchRatingScales(), fetchCompetencies(), fetchGoalTemplates(), fetchRecognitionCategories(), fetchAppraisalCycles()]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRatingScales = async () => {
    const { data, error } = await supabase.from("performance_rating_scales").select("*").eq("company_id", selectedCompany).order("name");
    if (!error) setRatingScales(data || []);
  };

  const fetchCompetencies = async () => {
    const { data, error } = await supabase.from("competencies").select("*").eq("company_id", selectedCompany).order("category, name");
    if (!error) setCompetencies(data || []);
  };

  const fetchGoalTemplates = async () => {
    const { data, error } = await supabase.from("goal_templates").select("*").or(`company_id.eq.${selectedCompany},company_id.is.null`).order("name");
    if (!error) setGoalTemplates(data || []);
  };

  const fetchRecognitionCategories = async () => {
    const { data, error } = await supabase.from("recognition_categories").select("*").eq("company_id", selectedCompany).order("name");
    if (!error) setRecognitionCategories(data || []);
  };

  const fetchAppraisalCycles = async () => {
    const { data, error } = await supabase.from("appraisal_cycles").select("*").eq("company_id", selectedCompany).order("start_date", { ascending: false });
    if (!error) setAppraisalCycles(data || []);
  };

  const handleDeleteRatingScale = async (id: string) => {
    if (!confirm("Delete this rating scale?")) return;
    const { error } = await supabase.from("performance_rating_scales").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Rating scale deleted");
    fetchRatingScales();
  };

  const handleDeleteOverallScale = async (id: string) => {
    if (!confirm("Delete this overall rating scale?")) return;
    const { error } = await supabase.from("overall_rating_scales").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Overall rating scale deleted");
    refetchOverallScales();
  };

  const handleDeleteCompetency = async (id: string) => {
    if (!confirm("Delete this competency?")) return;
    const { error } = await supabase.from("competencies").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Competency deleted");
    fetchCompetencies();
  };

  const handleDeleteGoalTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    const { error } = await supabase.from("goal_templates").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Goal template deleted");
    fetchGoalTemplates();
  };

  const handleDeleteRecognitionCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("recognition_categories").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Recognition category deleted");
    fetchRecognitionCategories();
  };

  const handleNavClick = (sectionId: string, groupId: string) => {
    setActiveSection(sectionId);
    if (!expandedGroups.includes(groupId)) {
      setExpandedGroups([...expandedGroups, groupId]);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "rating-scales":
        return <RatingScalesContent scales={ratingScales} isLoading={isLoading} onAdd={() => { setEditingRatingScale(null); setRatingScaleDialogOpen(true); }} onEdit={(s) => { setEditingRatingScale(s); setRatingScaleDialogOpen(true); }} onDelete={handleDeleteRatingScale} t={t} />;
      case "overall-scales":
        return <OverallScalesContent scales={overallScales} isLoading={overallScalesLoading} onAdd={() => { setEditingOverallScale(null); setOverallScaleDialogOpen(true); }} onEdit={(s) => { setEditingOverallScale(s); setOverallScaleDialogOpen(true); }} onDelete={handleDeleteOverallScale} t={t} />;
      case "competencies":
        return <CompetenciesContent competencies={competencies} isLoading={isLoading} onAdd={() => { setEditingCompetency(null); setCompetencyDialogOpen(true); }} onEdit={(c) => { setEditingCompetency(c); setCompetencyDialogOpen(true); }} onDelete={handleDeleteCompetency} t={t} />;
      case "approval-workflows":
        return <TalentApprovalWorkflowManager companyId={selectedCompany} />;
      case "goal-templates":
        return <GoalTemplatesContent templates={goalTemplates} isLoading={isLoading} onAdd={() => { setEditingGoalTemplate(null); setGoalTemplateDialogOpen(true); }} onEdit={(t) => { setEditingGoalTemplate(t); setGoalTemplateDialogOpen(true); }} onDelete={handleDeleteGoalTemplate} t={t} />;
      case "appraisal-cycles":
        return <AppraisalCyclesContent cycles={appraisalCycles} isLoading={isLoading} t={t} />;
      case "feedback-360":
        return <Feedback360ConfigSection companyId={selectedCompany} />;
      case "recognition-categories":
        return <RecognitionCategoriesContent categories={recognitionCategories} isLoading={isLoading} onAdd={() => { setEditingRecognitionCategory(null); setRecognitionCategoryDialogOpen(true); }} onEdit={(c) => { setEditingRecognitionCategory(c); setRecognitionCategoryDialogOpen(true); }} onDelete={handleDeleteRecognitionCategory} t={t} />;
      default:
        return <div className="text-muted-foreground text-center py-8">Select a configuration option</div>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Performance Setup</h1>
              <p className="text-muted-foreground">Configure company-wide performance management settings</p>
            </div>
          </div>
        </div>

        {/* Company Selector */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1 max-w-xs">
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedCompany && (
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar Navigation */}
            <div className="col-span-12 lg:col-span-3">
              <Card className="sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Configuration</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-320px)]">
                    <Accordion 
                      type="multiple" 
                      value={expandedGroups} 
                      onValueChange={setExpandedGroups}
                      className="w-full"
                    >
                      {setupSections.map((section) => {
                        const SectionIcon = section.icon;
                        return (
                          <AccordionItem key={section.id} value={section.id} className="border-b-0">
                            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                              <div className="flex items-center gap-3">
                                <div className={cn("p-1.5 rounded-md", section.bgColor)}>
                                  <SectionIcon className={cn("h-4 w-4", section.color)} />
                                </div>
                                <div className="text-left">
                                  <div className="font-medium text-sm">{section.title}</div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-2">
                              <div className="ml-4 space-y-1">
                                {section.items.map((item) => {
                                  const ItemIcon = item.icon;
                                  const isActive = activeSection === item.id;
                                  return (
                                    <button
                                      key={item.id}
                                      onClick={() => handleNavClick(item.id, section.id)}
                                      className={cn(
                                        "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                                        isActive 
                                          ? "bg-primary text-primary-foreground" 
                                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                      )}
                                    >
                                      <ItemIcon className="h-4 w-4" />
                                      <span>{item.label}</span>
                                      {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="col-span-12 lg:col-span-9">
              {renderContent()}
            </div>
          </div>
        )}

        {/* Dialogs */}
        <EnhancedRatingScaleDialog open={ratingScaleDialogOpen} onOpenChange={setRatingScaleDialogOpen} companyId={selectedCompany} editingScale={editingRatingScale} onSuccess={() => { setRatingScaleDialogOpen(false); fetchRatingScales(); }} />
        <OverallRatingScaleDialog open={overallScaleDialogOpen} onOpenChange={setOverallScaleDialogOpen} companyId={selectedCompany} editingScale={editingOverallScale} onSuccess={() => { setOverallScaleDialogOpen(false); refetchOverallScales(); }} />
        <CompetencyDialog open={competencyDialogOpen} onOpenChange={setCompetencyDialogOpen} companyId={selectedCompany} editingCompetency={editingCompetency} onSuccess={() => { setCompetencyDialogOpen(false); fetchCompetencies(); }} />
        <GoalTemplateDialog open={goalTemplateDialogOpen} onOpenChange={setGoalTemplateDialogOpen} companyId={selectedCompany} editingTemplate={editingGoalTemplate} onSuccess={() => { setGoalTemplateDialogOpen(false); fetchGoalTemplates(); }} />
        <RecognitionCategoryDialog open={recognitionCategoryDialogOpen} onOpenChange={setRecognitionCategoryDialogOpen} companyId={selectedCompany} editingCategory={editingRecognitionCategory} onSuccess={() => { setRecognitionCategoryDialogOpen(false); fetchRecognitionCategories(); }} />
      </div>
    </AppLayout>
  );
}

// Content Components
function RatingScalesContent({ scales, isLoading, onAdd, onEdit, onDelete, t }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Component Rating Scales</CardTitle>
          <CardDescription>Define rating scales used for goals, competencies, and feedback</CardDescription>
        </div>
        <Button onClick={onAdd}><Plus className="h-4 w-4 mr-2" />Add Scale</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? <LoadingSkeleton /> : scales.length === 0 ? <EmptyState message="No rating scales configured" /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scales.map((scale: RatingScale) => (
                <TableRow key={scale.id}>
                  <TableCell className="font-medium">{scale.name}</TableCell>
                  <TableCell>{scale.code}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {scale.scale_purpose?.map((p: string) => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>) || "—"}
                    </div>
                  </TableCell>
                  <TableCell>{scale.min_rating} - {scale.max_rating}</TableCell>
                  <TableCell>
                    <Badge variant={scale.is_active ? "default" : "secondary"}>{scale.is_active ? "Active" : "Inactive"}</Badge>
                    {scale.is_default && <Badge variant="outline" className="ml-2">Default</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(scale)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(scale.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function OverallScalesContent({ scales, isLoading, onAdd, onEdit, onDelete, t }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Overall Rating Scales</CardTitle>
          <CardDescription>Define final talent categorization scales for performance outcomes</CardDescription>
        </div>
        <Button onClick={onAdd}><Plus className="h-4 w-4 mr-2" />Add Scale</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? <LoadingSkeleton /> : scales.length === 0 ? <EmptyState message="No overall rating scales configured" /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Levels</TableHead>
                <TableHead>Calibration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scales.map((scale: OverallRatingScale) => (
                <TableRow key={scale.id}>
                  <TableCell className="font-medium">{scale.name}</TableCell>
                  <TableCell>{scale.code}</TableCell>
                  <TableCell>{scale.levels.length} levels</TableCell>
                  <TableCell>{scale.requires_calibration ? <Badge variant="outline">Required</Badge> : <span className="text-muted-foreground text-sm">Optional</span>}</TableCell>
                  <TableCell>
                    <Badge variant={scale.is_active ? "default" : "secondary"}>{scale.is_active ? "Active" : "Inactive"}</Badge>
                    {scale.is_default && <Badge variant="outline" className="ml-2">Default</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(scale)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(scale.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function CompetenciesContent({ competencies, isLoading, onAdd, onEdit, onDelete, t }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Competency Framework</CardTitle>
          <CardDescription>Define competencies used across performance evaluations</CardDescription>
        </div>
        <Button onClick={onAdd}><Plus className="h-4 w-4 mr-2" />Add Competency</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? <LoadingSkeleton /> : competencies.length === 0 ? <EmptyState message="No competencies configured" /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competencies.map((comp: Competency) => (
                <TableRow key={comp.id}>
                  <TableCell className="font-medium">{comp.name}</TableCell>
                  <TableCell>{comp.code}</TableCell>
                  <TableCell>{comp.category}</TableCell>
                  <TableCell><Badge variant={comp.is_active ? "default" : "secondary"}>{comp.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(comp)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(comp.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function GoalTemplatesContent({ templates, isLoading, onAdd, onEdit, onDelete, t }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Goal Templates</CardTitle>
          <CardDescription>Create reusable goal templates for employees</CardDescription>
        </div>
        <Button onClick={onAdd}><Plus className="h-4 w-4 mr-2" />Add Template</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? <LoadingSkeleton /> : templates.length === 0 ? <EmptyState message="No goal templates configured" /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Weighting</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template: GoalTemplate) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.goal_type.replace(/_/g, " ")}</TableCell>
                  <TableCell>{template.category || "—"}</TableCell>
                  <TableCell>{template.default_weighting ? `${template.default_weighting}%` : "—"}</TableCell>
                  <TableCell><Badge variant={template.is_active ? "default" : "secondary"}>{template.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(template)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(template.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function AppraisalCyclesContent({ cycles, isLoading, t }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appraisal Cycles</CardTitle>
        <CardDescription>View and manage performance appraisal cycles</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? <LoadingSkeleton /> : cycles.length === 0 ? <EmptyState message="No appraisal cycles found. Create cycles from the Appraisals page." /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Weights (G/C/R)</TableHead>
                <TableHead>Rating Range</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cycles.map((cycle: AppraisalCycle) => (
                <TableRow key={cycle.id}>
                  <TableCell className="font-medium">{cycle.name}</TableCell>
                  <TableCell>{new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>{cycle.goal_weight}% / {cycle.competency_weight}% / {cycle.responsibility_weight}%</TableCell>
                  <TableCell>{cycle.min_rating} - {cycle.max_rating}</TableCell>
                  <TableCell><Badge variant={cycle.status === "active" ? "default" : cycle.status === "completed" ? "secondary" : "outline"}>{cycle.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function RecognitionCategoriesContent({ categories, isLoading, onAdd, onEdit, onDelete, t }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recognition Categories</CardTitle>
          <CardDescription>Define award types and recognition categories</CardDescription>
        </div>
        <Button onClick={onAdd}><Plus className="h-4 w-4 mr-2" />Add Category</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? <LoadingSkeleton /> : categories.length === 0 ? <EmptyState message="No recognition categories configured" /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Approval Required</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category: RecognitionCategory) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.code}</TableCell>
                  <TableCell>{category.points_value}</TableCell>
                  <TableCell><Badge variant={category.requires_approval ? "outline" : "secondary"}>{category.requires_approval ? "Yes" : "No"}</Badge></TableCell>
                  <TableCell><Badge variant={category.is_active ? "default" : "secondary"}>{category.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(category)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(category.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>;
}

function EmptyState({ message }: { message: string }) {
  return <div className="text-center py-8 text-muted-foreground">{message}</div>;
}

// Dialog Components
function CompetencyDialog({ open, onOpenChange, companyId, editingCompetency, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; companyId: string; editingCompetency: Competency | null; onSuccess: () => void; }) {
  const [formData, setFormData] = useState({ name: "", code: "", category: "Core", description: "", is_active: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingCompetency) {
      setFormData({ name: editingCompetency.name, code: editingCompetency.code, category: editingCompetency.category, description: editingCompetency.description || "", is_active: editingCompetency.is_active });
    } else {
      setFormData({ name: "", code: "", category: "Core", description: "", is_active: true });
    }
  }, [editingCompetency, open]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) { toast.error("Name and code are required"); return; }
    setIsSubmitting(true);
    try {
      if (editingCompetency) {
        const { error } = await supabase.from("competencies").update(formData).eq("id", editingCompetency.id);
        if (error) throw error;
        toast.success("Competency updated");
      } else {
        const { error } = await supabase.from("competencies").insert({ ...formData, company_id: companyId });
        if (error) throw error;
        toast.success("Competency created");
      }
      onSuccess();
    } catch (error: any) { toast.error(error.message || "Failed to save"); } finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingCompetency ? "Edit Competency" : "Add Competency"}</DialogTitle>
          <DialogDescription>Configure competency settings</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Name</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Communication" /></div>
            <div><Label>Code</Label><Input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="e.g., COMM" /></div>
          </div>
          <div><Label>Category</Label>
            <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Core">Core</SelectItem>
                <SelectItem value="Leadership">Leadership</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Functional">Functional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" /></div>
          <div className="flex items-center gap-2"><Switch checked={formData.is_active} onCheckedChange={c => setFormData({ ...formData, is_active: c })} /><Label>Active</Label></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GoalTemplateDialog({ open, onOpenChange, companyId, editingTemplate, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; companyId: string; editingTemplate: GoalTemplate | null; onSuccess: () => void; }) {
  const [formData, setFormData] = useState<{ name: string; description: string; goal_type: "smart_goal" | "okr_objective" | "okr_key_result"; category: string; default_weighting: number; is_active: boolean }>({ name: "", description: "", goal_type: "smart_goal", category: "", default_weighting: 0, is_active: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTemplate) {
      setFormData({ name: editingTemplate.name, description: editingTemplate.description || "", goal_type: editingTemplate.goal_type as any, category: editingTemplate.category || "", default_weighting: editingTemplate.default_weighting || 0, is_active: editingTemplate.is_active });
    } else {
      setFormData({ name: "", description: "", goal_type: "smart_goal", category: "", default_weighting: 0, is_active: true });
    }
  }, [editingTemplate, open]);

  const handleSubmit = async () => {
    if (!formData.name) { toast.error("Name is required"); return; }
    setIsSubmitting(true);
    try {
      if (editingTemplate) {
        const { error } = await supabase.from("goal_templates").update(formData).eq("id", editingTemplate.id);
        if (error) throw error;
        toast.success("Goal template updated");
      } else {
        const { error } = await supabase.from("goal_templates").insert({ ...formData, company_id: companyId });
        if (error) throw error;
        toast.success("Goal template created");
      }
      onSuccess();
    } catch (error: any) { toast.error(error.message || "Failed to save"); } finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingTemplate ? "Edit Goal Template" : "Add Goal Template"}</DialogTitle>
          <DialogDescription>Configure goal template settings</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div><Label>Name</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Quarterly Sales Target" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Type</Label>
              <Select value={formData.goal_type} onValueChange={(v: any) => setFormData({ ...formData, goal_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="smart_goal">SMART Goal</SelectItem>
                  <SelectItem value="okr_objective">OKR Objective</SelectItem>
                  <SelectItem value="okr_key_result">OKR Key Result</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Category</Label><Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Sales" /></div>
          </div>
          <div><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Optional" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Default Weighting (%)</Label><Input type="number" value={formData.default_weighting} onChange={e => setFormData({ ...formData, default_weighting: parseInt(e.target.value) || 0 })} /></div>
            <div className="flex items-center gap-2 pt-8"><Switch checked={formData.is_active} onCheckedChange={c => setFormData({ ...formData, is_active: c })} /><Label>Active</Label></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RecognitionCategoryDialog({ open, onOpenChange, companyId, editingCategory, onSuccess }: { open: boolean; onOpenChange: (open: boolean) => void; companyId: string; editingCategory: RecognitionCategory | null; onSuccess: () => void; }) {
  const [formData, setFormData] = useState({ name: "", code: "", description: "", icon: "", color: "", points_value: 0, requires_approval: true, is_active: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setFormData({ name: editingCategory.name, code: editingCategory.code, description: editingCategory.description || "", icon: editingCategory.icon || "", color: editingCategory.color || "", points_value: editingCategory.points_value, requires_approval: editingCategory.requires_approval, is_active: editingCategory.is_active });
    } else {
      setFormData({ name: "", code: "", description: "", icon: "", color: "", points_value: 0, requires_approval: true, is_active: true });
    }
  }, [editingCategory, open]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) { toast.error("Name and code are required"); return; }
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        const { error } = await supabase.from("recognition_categories").update(formData).eq("id", editingCategory.id);
        if (error) throw error;
        toast.success("Recognition category updated");
      } else {
        const { error } = await supabase.from("recognition_categories").insert({ ...formData, company_id: companyId });
        if (error) throw error;
        toast.success("Recognition category created");
      }
      onSuccess();
    } catch (error: any) { toast.error(error.message || "Failed to save"); } finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          <DialogDescription>Configure recognition category settings</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Name</Label><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Employee of the Month" /></div>
            <div><Label>Code</Label><Input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="e.g., EOM" /></div>
          </div>
          <div><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Optional" /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Points</Label><Input type="number" value={formData.points_value} onChange={e => setFormData({ ...formData, points_value: parseInt(e.target.value) || 0 })} /></div>
            <div><Label>Icon</Label><Input value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} placeholder="e.g., trophy" /></div>
            <div><Label>Color</Label><Input value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} placeholder="#FFD700" /></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><Switch checked={formData.requires_approval} onCheckedChange={c => setFormData({ ...formData, requires_approval: c })} /><Label>Requires Approval</Label></div>
            <div className="flex items-center gap-2"><Switch checked={formData.is_active} onCheckedChange={c => setFormData({ ...formData, is_active: c })} /><Label>Active</Label></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
