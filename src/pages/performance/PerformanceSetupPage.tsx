import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { EnhancedRatingScaleDialog } from "@/components/performance/EnhancedRatingScaleDialog";
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
  Building
} from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface RatingScale {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  min_rating: number;
  max_rating: number;
  rating_labels: any;
  is_default: boolean;
  is_active: boolean;
}

interface Competency {
  id: string;
  company_id: string;
  name: string;
  code: string;
  category: string;
  description: string | null;
  proficiency_levels: any;
  is_active: boolean;
}

interface GoalTemplate {
  id: string;
  company_id: string | null;
  name: string;
  description: string | null;
  goal_type: string;
  category: string | null;
  default_weighting: number | null;
  is_active: boolean;
}

interface RecognitionCategory {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  points_value: number;
  requires_approval: boolean;
  is_active: boolean;
}

interface AppraisalCycle {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
  goal_weight: number;
  competency_weight: number;
  responsibility_weight: number;
  min_rating: number;
  max_rating: number;
}

export default function PerformanceSetupPage() {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [activeTab, setActiveTab] = useState("rating-scales");
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [ratingScales, setRatingScales] = useState<RatingScale[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [goalTemplates, setGoalTemplates] = useState<GoalTemplate[]>([]);
  const [recognitionCategories, setRecognitionCategories] = useState<RecognitionCategory[]>([]);
  const [appraisalCycles, setAppraisalCycles] = useState<AppraisalCycle[]>([]);

  // Dialog states
  const [ratingScaleDialogOpen, setRatingScaleDialogOpen] = useState(false);
  const [competencyDialogOpen, setCompetencyDialogOpen] = useState(false);
  const [goalTemplateDialogOpen, setGoalTemplateDialogOpen] = useState(false);
  const [recognitionCategoryDialogOpen, setRecognitionCategoryDialogOpen] = useState(false);

  // Edit states
  const [editingRatingScale, setEditingRatingScale] = useState<RatingScale | null>(null);
  const [editingCompetency, setEditingCompetency] = useState<Competency | null>(null);
  const [editingGoalTemplate, setEditingGoalTemplate] = useState<GoalTemplate | null>(null);
  const [editingRecognitionCategory, setEditingRecognitionCategory] = useState<RecognitionCategory | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchAllData();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setCompanies(data || []);
      if (data && data.length > 0) {
        setSelectedCompany(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies");
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchRatingScales(),
        fetchCompetencies(),
        fetchGoalTemplates(),
        fetchRecognitionCategories(),
        fetchAppraisalCycles(),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRatingScales = async () => {
    const { data, error } = await supabase
      .from("performance_rating_scales")
      .select("*")
      .eq("company_id", selectedCompany)
      .order("name");

    if (error) {
      console.error("Error fetching rating scales:", error);
      return;
    }
    setRatingScales(data || []);
  };

  const fetchCompetencies = async () => {
    const { data, error } = await supabase
      .from("competencies")
      .select("*")
      .eq("company_id", selectedCompany)
      .order("category, name");

    if (error) {
      console.error("Error fetching competencies:", error);
      return;
    }
    setCompetencies(data || []);
  };

  const fetchGoalTemplates = async () => {
    const { data, error } = await supabase
      .from("goal_templates")
      .select("*")
      .or(`company_id.eq.${selectedCompany},company_id.is.null`)
      .order("name");

    if (error) {
      console.error("Error fetching goal templates:", error);
      return;
    }
    setGoalTemplates(data || []);
  };

  const fetchRecognitionCategories = async () => {
    const { data, error } = await supabase
      .from("recognition_categories")
      .select("*")
      .eq("company_id", selectedCompany)
      .order("name");

    if (error) {
      console.error("Error fetching recognition categories:", error);
      return;
    }
    setRecognitionCategories(data || []);
  };

  const fetchAppraisalCycles = async () => {
    const { data, error } = await supabase
      .from("appraisal_cycles")
      .select("*")
      .eq("company_id", selectedCompany)
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Error fetching appraisal cycles:", error);
      return;
    }
    setAppraisalCycles(data || []);
  };

  const handleDeleteRatingScale = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rating scale?")) return;
    
    const { error } = await supabase
      .from("performance_rating_scales")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete rating scale");
      return;
    }
    toast.success("Rating scale deleted");
    fetchRatingScales();
  };

  const handleDeleteCompetency = async (id: string) => {
    if (!confirm("Are you sure you want to delete this competency?")) return;
    
    const { error } = await supabase
      .from("competencies")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete competency");
      return;
    }
    toast.success("Competency deleted");
    fetchCompetencies();
  };

  const handleDeleteGoalTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal template?")) return;
    
    const { error } = await supabase
      .from("goal_templates")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete goal template");
      return;
    }
    toast.success("Goal template deleted");
    fetchGoalTemplates();
  };

  const handleDeleteRecognitionCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recognition category?")) return;
    
    const { error } = await supabase
      .from("recognition_categories")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete recognition category");
      return;
    }
    toast.success("Recognition category deleted");
    fetchRecognitionCategories();
  };

  const tabs = [
    { id: "rating-scales", label: t("performance.setup.ratingScales", "Rating Scales"), icon: Star },
    { id: "competencies", label: t("performance.setup.competencies", "Competencies"), icon: BookOpen },
    { id: "goal-templates", label: t("performance.setup.goalTemplates", "Goal Templates"), icon: Target },
    { id: "recognition", label: t("performance.setup.recognition", "Recognition Categories"), icon: Award },
    { id: "appraisal-cycles", label: t("performance.setup.appraisalCycles", "Appraisal Cycles"), icon: Calendar },
  ];

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
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("performance.setup.title", "Performance Setup")}
              </h1>
              <p className="text-muted-foreground">
                {t("performance.setup.subtitle", "Configure company-wide performance management settings")}
              </p>
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
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedCompany && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Rating Scales Tab */}
            <TabsContent value="rating-scales" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t("performance.setup.ratingScales", "Rating Scales")}</CardTitle>
                    <CardDescription>
                      {t("performance.setup.ratingScalesDesc", "Define rating scales used in performance evaluations")}
                    </CardDescription>
                  </div>
                  <Button onClick={() => { setEditingRatingScale(null); setRatingScaleDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("common.add", "Add")}
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : ratingScales.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {t("performance.setup.noRatingScales", "No rating scales configured. Add one to get started.")}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("common.name", "Name")}</TableHead>
                          <TableHead>{t("common.code", "Code")}</TableHead>
                          <TableHead>{t("performance.setup.range", "Range")}</TableHead>
                          <TableHead>{t("common.status", "Status")}</TableHead>
                          <TableHead className="text-right">{t("common.actions", "Actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ratingScales.map((scale) => (
                          <TableRow key={scale.id}>
                            <TableCell className="font-medium">{scale.name}</TableCell>
                            <TableCell>{scale.code}</TableCell>
                            <TableCell>{scale.min_rating} - {scale.max_rating}</TableCell>
                            <TableCell>
                              <Badge variant={scale.is_active ? "default" : "secondary"}>
                                {scale.is_active ? t("common.active", "Active") : t("common.inactive", "Inactive")}
                              </Badge>
                              {scale.is_default && (
                                <Badge variant="outline" className="ml-2">
                                  {t("common.default", "Default")}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { setEditingRatingScale(scale); setRatingScaleDialogOpen(true); }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteRatingScale(scale.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Competencies Tab */}
            <TabsContent value="competencies" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t("performance.setup.competencies", "Competencies")}</CardTitle>
                    <CardDescription>
                      {t("performance.setup.competenciesDesc", "Define competency frameworks for performance evaluations")}
                    </CardDescription>
                  </div>
                  <Button onClick={() => { setEditingCompetency(null); setCompetencyDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("common.add", "Add")}
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : competencies.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {t("performance.setup.noCompetencies", "No competencies configured. Add one to get started.")}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("common.name", "Name")}</TableHead>
                          <TableHead>{t("common.code", "Code")}</TableHead>
                          <TableHead>{t("common.category", "Category")}</TableHead>
                          <TableHead>{t("common.status", "Status")}</TableHead>
                          <TableHead className="text-right">{t("common.actions", "Actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {competencies.map((comp) => (
                          <TableRow key={comp.id}>
                            <TableCell className="font-medium">{comp.name}</TableCell>
                            <TableCell>{comp.code}</TableCell>
                            <TableCell>{comp.category}</TableCell>
                            <TableCell>
                              <Badge variant={comp.is_active ? "default" : "secondary"}>
                                {comp.is_active ? t("common.active", "Active") : t("common.inactive", "Inactive")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { setEditingCompetency(comp); setCompetencyDialogOpen(true); }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteCompetency(comp.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Goal Templates Tab */}
            <TabsContent value="goal-templates" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t("performance.setup.goalTemplates", "Goal Templates")}</CardTitle>
                    <CardDescription>
                      {t("performance.setup.goalTemplatesDesc", "Create reusable goal templates for employees")}
                    </CardDescription>
                  </div>
                  <Button onClick={() => { setEditingGoalTemplate(null); setGoalTemplateDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("common.add", "Add")}
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : goalTemplates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {t("performance.setup.noGoalTemplates", "No goal templates configured. Add one to get started.")}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("common.name", "Name")}</TableHead>
                          <TableHead>{t("common.type", "Type")}</TableHead>
                          <TableHead>{t("common.category", "Category")}</TableHead>
                          <TableHead>{t("performance.setup.weighting", "Weighting")}</TableHead>
                          <TableHead>{t("common.status", "Status")}</TableHead>
                          <TableHead className="text-right">{t("common.actions", "Actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {goalTemplates.map((template) => (
                          <TableRow key={template.id}>
                            <TableCell className="font-medium">{template.name}</TableCell>
                            <TableCell>{template.goal_type.replace(/_/g, " ")}</TableCell>
                            <TableCell>{template.category || "-"}</TableCell>
                            <TableCell>{template.default_weighting ? `${template.default_weighting}%` : "-"}</TableCell>
                            <TableCell>
                              <Badge variant={template.is_active ? "default" : "secondary"}>
                                {template.is_active ? t("common.active", "Active") : t("common.inactive", "Inactive")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { setEditingGoalTemplate(template); setGoalTemplateDialogOpen(true); }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteGoalTemplate(template.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recognition Categories Tab */}
            <TabsContent value="recognition" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t("performance.setup.recognition", "Recognition Categories")}</CardTitle>
                    <CardDescription>
                      {t("performance.setup.recognitionDesc", "Define award types and recognition categories")}
                    </CardDescription>
                  </div>
                  <Button onClick={() => { setEditingRecognitionCategory(null); setRecognitionCategoryDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("common.add", "Add")}
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : recognitionCategories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {t("performance.setup.noRecognitionCategories", "No recognition categories configured. Add one to get started.")}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("common.name", "Name")}</TableHead>
                          <TableHead>{t("common.code", "Code")}</TableHead>
                          <TableHead>{t("performance.setup.points", "Points")}</TableHead>
                          <TableHead>{t("performance.setup.approval", "Approval Required")}</TableHead>
                          <TableHead>{t("common.status", "Status")}</TableHead>
                          <TableHead className="text-right">{t("common.actions", "Actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recognitionCategories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>{category.code}</TableCell>
                            <TableCell>{category.points_value}</TableCell>
                            <TableCell>
                              <Badge variant={category.requires_approval ? "outline" : "secondary"}>
                                {category.requires_approval ? t("common.yes", "Yes") : t("common.no", "No")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={category.is_active ? "default" : "secondary"}>
                                {category.is_active ? t("common.active", "Active") : t("common.inactive", "Inactive")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => { setEditingRecognitionCategory(category); setRecognitionCategoryDialogOpen(true); }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteRecognitionCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appraisal Cycles Tab */}
            <TabsContent value="appraisal-cycles" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("performance.setup.appraisalCycles", "Appraisal Cycles")}</CardTitle>
                  <CardDescription>
                    {t("performance.setup.appraisalCyclesDesc", "View and manage performance appraisal cycles")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : appraisalCycles.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {t("performance.setup.noAppraisalCycles", "No appraisal cycles found. Create cycles from the Appraisals page.")}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("common.name", "Name")}</TableHead>
                          <TableHead>{t("common.period", "Period")}</TableHead>
                          <TableHead>{t("performance.setup.weights", "Weights (G/C/R)")}</TableHead>
                          <TableHead>{t("performance.setup.ratingRange", "Rating Range")}</TableHead>
                          <TableHead>{t("common.status", "Status")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appraisalCycles.map((cycle) => (
                          <TableRow key={cycle.id}>
                            <TableCell className="font-medium">{cycle.name}</TableCell>
                            <TableCell>
                              {new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {cycle.goal_weight}% / {cycle.competency_weight}% / {cycle.responsibility_weight}%
                            </TableCell>
                            <TableCell>{cycle.min_rating} - {cycle.max_rating}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  cycle.status === "active" ? "default" : 
                                  cycle.status === "completed" ? "secondary" : "outline"
                                }
                              >
                                {cycle.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Rating Scale Dialog */}
        <EnhancedRatingScaleDialog
          open={ratingScaleDialogOpen}
          onOpenChange={setRatingScaleDialogOpen}
          companyId={selectedCompany}
          editingScale={editingRatingScale}
          onSuccess={() => {
            setRatingScaleDialogOpen(false);
            fetchRatingScales();
          }}
        />

        {/* Competency Dialog */}
        <CompetencyDialog
          open={competencyDialogOpen}
          onOpenChange={setCompetencyDialogOpen}
          companyId={selectedCompany}
          editingCompetency={editingCompetency}
          onSuccess={() => {
            setCompetencyDialogOpen(false);
            fetchCompetencies();
          }}
        />

        {/* Goal Template Dialog */}
        <GoalTemplateDialog
          open={goalTemplateDialogOpen}
          onOpenChange={setGoalTemplateDialogOpen}
          companyId={selectedCompany}
          editingTemplate={editingGoalTemplate}
          onSuccess={() => {
            setGoalTemplateDialogOpen(false);
            fetchGoalTemplates();
          }}
        />

        {/* Recognition Category Dialog */}
        <RecognitionCategoryDialog
          open={recognitionCategoryDialogOpen}
          onOpenChange={setRecognitionCategoryDialogOpen}
          companyId={selectedCompany}
          editingCategory={editingRecognitionCategory}
          onSuccess={() => {
            setRecognitionCategoryDialogOpen(false);
            fetchRecognitionCategories();
          }}
        />
      </div>
    </AppLayout>
  );
}

// Competency Dialog Component
function CompetencyDialog({
  open,
  onOpenChange,
  companyId,
  editingCompetency,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  editingCompetency: Competency | null;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "Core",
    description: "",
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingCompetency) {
      setFormData({
        name: editingCompetency.name,
        code: editingCompetency.code,
        category: editingCompetency.category,
        description: editingCompetency.description || "",
        is_active: editingCompetency.is_active,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        category: "Core",
        description: "",
        is_active: true,
      });
    }
  }, [editingCompetency, open]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      toast.error("Name and code are required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCompetency) {
        const { error } = await supabase
          .from("competencies")
          .update(formData)
          .eq("id", editingCompetency.id);

        if (error) throw error;
        toast.success("Competency updated");
      } else {
        const { error } = await supabase
          .from("competencies")
          .insert({ ...formData, company_id: companyId });

        if (error) throw error;
        toast.success("Competency created");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save competency");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingCompetency ? t("performance.setup.editCompetency", "Edit Competency") : t("performance.setup.addCompetency", "Add Competency")}
          </DialogTitle>
          <DialogDescription>
            {t("performance.setup.competencyDialogDesc", "Configure competency settings")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("common.name", "Name")}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Communication"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("common.code", "Code")}</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., COMM"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("common.category", "Category")}</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Core">Core</SelectItem>
                <SelectItem value="Leadership">Leadership</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Functional">Functional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("common.description", "Description")}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label>{t("common.active", "Active")}</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("common.saving", "Saving...") : t("common.save", "Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Goal Template Dialog Component
function GoalTemplateDialog({
  open,
  onOpenChange,
  companyId,
  editingTemplate,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  editingTemplate: GoalTemplate | null;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    goal_type: "smart_goal" | "okr_objective" | "okr_key_result";
    category: string;
    default_weighting: number;
    is_active: boolean;
  }>({
    name: "",
    description: "",
    goal_type: "smart_goal",
    category: "",
    default_weighting: 0,
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTemplate) {
      setFormData({
        name: editingTemplate.name,
        description: editingTemplate.description || "",
        goal_type: editingTemplate.goal_type as "smart_goal" | "okr_objective" | "okr_key_result",
        category: editingTemplate.category || "",
        default_weighting: editingTemplate.default_weighting || 0,
        is_active: editingTemplate.is_active,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        goal_type: "smart_goal",
        category: "",
        default_weighting: 0,
        is_active: true,
      });
    }
  }, [editingTemplate, open]);

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from("goal_templates")
          .update(formData)
          .eq("id", editingTemplate.id);

        if (error) throw error;
        toast.success("Goal template updated");
      } else {
        const { error } = await supabase
          .from("goal_templates")
          .insert({ ...formData, company_id: companyId });

        if (error) throw error;
        toast.success("Goal template created");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save goal template");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingTemplate ? t("performance.setup.editGoalTemplate", "Edit Goal Template") : t("performance.setup.addGoalTemplate", "Add Goal Template")}
          </DialogTitle>
          <DialogDescription>
            {t("performance.setup.goalTemplateDialogDesc", "Configure goal template settings")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("common.name", "Name")}</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Quarterly Sales Target"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("common.type", "Type")}</Label>
              <Select value={formData.goal_type} onValueChange={(value: any) => setFormData({ ...formData, goal_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smart_goal">SMART Goal</SelectItem>
                  <SelectItem value="okr_objective">OKR Objective</SelectItem>
                  <SelectItem value="okr_key_result">OKR Key Result</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("common.category", "Category")}</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Sales, Operations"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("common.description", "Description")}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("performance.setup.defaultWeighting", "Default Weighting (%)")}</Label>
              <Input
                type="number"
                value={formData.default_weighting}
                onChange={(e) => setFormData({ ...formData, default_weighting: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center gap-2 pt-8">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>{t("common.active", "Active")}</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("common.saving", "Saving...") : t("common.save", "Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Recognition Category Dialog Component
function RecognitionCategoryDialog({
  open,
  onOpenChange,
  companyId,
  editingCategory,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  editingCategory: RecognitionCategory | null;
  onSuccess: () => void;
}) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    icon: "",
    color: "",
    points_value: 0,
    requires_approval: true,
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        code: editingCategory.code,
        description: editingCategory.description || "",
        icon: editingCategory.icon || "",
        color: editingCategory.color || "",
        points_value: editingCategory.points_value,
        requires_approval: editingCategory.requires_approval,
        is_active: editingCategory.is_active,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        icon: "",
        color: "",
        points_value: 0,
        requires_approval: true,
        is_active: true,
      });
    }
  }, [editingCategory, open]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      toast.error("Name and code are required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from("recognition_categories")
          .update(formData)
          .eq("id", editingCategory.id);

        if (error) throw error;
        toast.success("Recognition category updated");
      } else {
        const { error } = await supabase
          .from("recognition_categories")
          .insert({ ...formData, company_id: companyId });

        if (error) throw error;
        toast.success("Recognition category created");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save recognition category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? t("performance.setup.editCategory", "Edit Category") : t("performance.setup.addCategory", "Add Category")}
          </DialogTitle>
          <DialogDescription>
            {t("performance.setup.categoryDialogDesc", "Configure recognition category settings")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("common.name", "Name")}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Employee of the Month"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("common.code", "Code")}</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g., EOM"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("common.description", "Description")}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t("performance.setup.points", "Points Value")}</Label>
              <Input
                type="number"
                value={formData.points_value}
                onChange={(e) => setFormData({ ...formData, points_value: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("common.icon", "Icon")}</Label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="e.g., trophy"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("common.color", "Color")}</Label>
              <Input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g., #FFD700"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.requires_approval}
                onCheckedChange={(checked) => setFormData({ ...formData, requires_approval: checked })}
              />
              <Label>{t("performance.setup.requiresApproval", "Requires Approval")}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>{t("common.active", "Active")}</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("common.saving", "Saving...") : t("common.save", "Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
