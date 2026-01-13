import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { 
  Target, 
  BookOpen, 
  ExternalLink, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Briefcase,
  Layers,
  Info,
  Sparkles,
  Link2,
  ArrowRight,
  Settings2,
  Percent
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCategoryLabel, getCategoryIcon, normalizeCategory } from "@/components/capabilities/wizard/competencyCategoryConfig";
import { CompetencyConfigStatusBadge } from "./CompetencyConfigStatusBadge";
import { CompetencyExpandedDetails, JobRequirement, SkillMapping } from "./CompetencyExpandedDetails";

interface UnifiedCompetency {
  id: string;
  name: string;
  code: string;
  category: string;
  status: string;
  description: string | null;
  proficiency_indicators: any;
  jobCount: number;
  skillCount: number;
  hasIndicators: boolean;
  avgLevel: number;
  totalWeight: number;
}

interface Props {
  companyId: string;
  onNavigateToLibrary?: () => void;
}

type ConfigStatusFilter = 'all' | 'ready' | 'partial' | 'not_ready';

export function UnifiedCompetencyFramework({ companyId, onNavigateToLibrary }: Props) {
  const navigate = useNavigate();
  const [competencies, setCompetencies] = useState<UnifiedCompetency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [configStatusFilter, setConfigStatusFilter] = useState<ConfigStatusFilter>("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Store detailed job requirements and skill mappings for expanded view
  const [jobDetailsMap, setJobDetailsMap] = useState<Record<string, JobRequirement[]>>({});
  const [skillDetailsMap, setSkillDetailsMap] = useState<Record<string, SkillMapping[]>>({});

  // Stats
  const [stats, setStats] = useState({
    totalCompetencies: 0,
    linkedJobs: 0,
    mappedSkills: 0,
    coverage: 0,
    fullyConfigured: 0
  });

  useEffect(() => {
    if (companyId) {
      fetchCompetencies();
    }
  }, [companyId]);

  const fetchCompetencies = async () => {
    setIsLoading(true);
    try {
      // Fetch active competencies from unified skills_competencies table
      const { data: competenciesData, error: compError } = await supabase
        .from("skills_competencies")
        .select("id, name, code, category, status, description, proficiency_indicators")
        .eq("type", "COMPETENCY")
        .eq("status", "active")
        .or(`company_id.eq.${companyId},is_global.eq.true`)
        .order("name");

      if (compError) throw compError;

      const compIds = competenciesData?.map(c => c.id) || [];

      // Fetch job linkage with FULL details
      const { data: jobLinks, error: jobError } = await supabase
        .from("job_capability_requirements")
        .select(`
          capability_id,
          job_id,
          required_proficiency_level,
          weighting,
          is_required,
          is_preferred,
          start_date,
          end_date,
          jobs(id, name)
        `)
        .in("capability_id", compIds);

      if (jobError) console.error("Job links error:", jobError);

      // Fetch skill mappings with FULL details
      const { data: skillMappings, error: skillError } = await supabase
        .from("competency_skill_mappings")
        .select(`
          competency_id,
          min_proficiency_level,
          weight,
          is_required,
          skill:skills_competencies!competency_skill_mappings_skill_id_fkey(id, name)
        `)
        .in("competency_id", compIds);

      if (skillError) console.error("Skill mappings error:", skillError);

      // Build detailed lookup maps
      const jobDetailsByComp: Record<string, JobRequirement[]> = {};
      const jobCountByComp: Record<string, Set<string>> = {};
      const jobStatsByComp: Record<string, { totalLevel: number; totalWeight: number; count: number }> = {};
      
      (jobLinks || []).forEach(link => {
        const compId = link.capability_id;
        if (!jobDetailsByComp[compId]) {
          jobDetailsByComp[compId] = [];
          jobCountByComp[compId] = new Set();
          jobStatsByComp[compId] = { totalLevel: 0, totalWeight: 0, count: 0 };
        }
        
        jobCountByComp[compId].add(link.job_id);
        
        const jobName = (link.jobs as any)?.name || "Unknown Job";
        jobDetailsByComp[compId].push({
          job_id: link.job_id,
          job_name: jobName,
          required_proficiency_level: link.required_proficiency_level || 3,
          weighting: link.weighting || 0,
          is_required: link.is_required || false,
          is_preferred: link.is_preferred || false,
          start_date: link.start_date,
          end_date: link.end_date
        });
        
        jobStatsByComp[compId].totalLevel += (link.required_proficiency_level || 3);
        jobStatsByComp[compId].totalWeight += (link.weighting || 0);
        jobStatsByComp[compId].count += 1;
      });

      const skillDetailsByComp: Record<string, SkillMapping[]> = {};
      const skillCountByComp: Record<string, number> = {};
      
      (skillMappings || []).forEach(mapping => {
        const compId = mapping.competency_id;
        if (!skillDetailsByComp[compId]) {
          skillDetailsByComp[compId] = [];
          skillCountByComp[compId] = 0;
        }
        
        if (mapping.skill) {
          skillCountByComp[compId] += 1;
          skillDetailsByComp[compId].push({
            skill_id: mapping.skill.id,
            skill_name: mapping.skill.name,
            min_proficiency_level: mapping.min_proficiency_level || 1,
            weight: mapping.weight || 0,
            is_required: mapping.is_required || false
          });
        }
      });

      setJobDetailsMap(jobDetailsByComp);
      setSkillDetailsMap(skillDetailsByComp);

      // Combine data
      const enrichedCompetencies: UnifiedCompetency[] = (competenciesData || []).map(comp => {
        const jobCount = jobCountByComp[comp.id]?.size || 0;
        const skillCount = skillCountByComp[comp.id] || 0;
        const jobStats = jobStatsByComp[comp.id];
        const hasIndicators = comp.proficiency_indicators && 
          typeof comp.proficiency_indicators === 'object' && 
          Object.keys(comp.proficiency_indicators).length > 0;
        
        return {
          ...comp,
          jobCount,
          skillCount,
          hasIndicators,
          avgLevel: jobStats && jobStats.count > 0 ? Math.round((jobStats.totalLevel / jobStats.count) * 10) / 10 : 0,
          totalWeight: jobStats?.totalWeight || 0
        };
      });

      setCompetencies(enrichedCompetencies);

      // Calculate stats
      const totalJobs = new Set((jobLinks || []).map(l => l.job_id)).size;
      const totalSkillMappings = (skillMappings || []).length;
      const compsWithJobs = enrichedCompetencies.filter(c => c.jobCount > 0).length;
      const fullyConfigured = enrichedCompetencies.filter(c => c.hasIndicators && c.jobCount > 0).length;
      const coverage = enrichedCompetencies.length > 0 
        ? Math.round((compsWithJobs / enrichedCompetencies.length) * 100) 
        : 0;

      setStats({
        totalCompetencies: enrichedCompetencies.length,
        linkedJobs: totalJobs,
        mappedSkills: totalSkillMappings,
        coverage,
        fullyConfigured
      });

    } catch (error) {
      console.error("Error fetching competencies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRowExpand = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCats = new Set(competencies.map(c => normalizeCategory(c.category)));
    return Array.from(uniqueCats).sort();
  }, [competencies]);

  // Filtered competencies
  const filteredCompetencies = useMemo(() => {
    return competencies.filter(comp => {
      const matchesSearch = !searchTerm || 
        comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || 
        normalizeCategory(comp.category) === categoryFilter;
      
      // Config status filter
      const isFullyConfigured = comp.hasIndicators && comp.jobCount > 0;
      const isPartial = (comp.hasIndicators || comp.jobCount > 0 || comp.skillCount > 0) && !isFullyConfigured;
      const isNotReady = !comp.hasIndicators && comp.jobCount === 0 && comp.skillCount === 0;
      
      const matchesConfigStatus = 
        configStatusFilter === "all" ||
        (configStatusFilter === "ready" && isFullyConfigured) ||
        (configStatusFilter === "partial" && isPartial) ||
        (configStatusFilter === "not_ready" && isNotReady);
      
      return matchesSearch && matchesCategory && matchesConfigStatus;
    });
  }, [competencies, searchTerm, categoryFilter, configStatusFilter]);

  const handleNavigateToLibrary = () => {
    if (onNavigateToLibrary) {
      onNavigateToLibrary();
    } else {
      navigate("/workforce/capability-registry");
    }
  };

  const getJobSummary = (comp: UnifiedCompetency) => {
    if (comp.jobCount === 0) return null;
    return (
      <div className="text-xs text-muted-foreground">
        Avg L{comp.avgLevel} • {comp.totalWeight}% weight
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  if (competencies.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Get Started with Competencies</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              No competencies have been configured yet. Use the Capability Library to import 
              industry-standard competencies or define your own.
            </p>
            <div className="flex items-center justify-center gap-3 pt-4">
              <Button onClick={handleNavigateToLibrary}>
                <BookOpen className="h-4 w-4 mr-2" />
                Open Capability Library
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Unified Competency Library</AlertTitle>
        <AlertDescription>
          Competencies are managed centrally in the Workforce module and automatically available for 
          performance reviews. Competencies assigned to an employee's job profile will appear in their 
          appraisal form with the configured proficiency levels and weightings.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Competency Framework for Performance Reviews
            </CardTitle>
            <CardDescription>
              Competencies available for use in appraisals, sourced from the central Capability Library
            </CardDescription>
          </div>
          <Button variant="outline" onClick={handleNavigateToLibrary}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Manage in Library
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-5 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Layers className="h-4 w-4" />
                Active Competencies
              </div>
              <div className="text-2xl font-bold">{stats.totalCompetencies}</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Settings2 className="h-4 w-4" />
                Fully Configured
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.fullyConfigured}</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Briefcase className="h-4 w-4" />
                Jobs Linked
              </div>
              <div className="text-2xl font-bold">{stats.linkedJobs}</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Sparkles className="h-4 w-4" />
                Skills Mapped
              </div>
              <div className="text-2xl font-bold">{stats.mappedSkills}</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Link2 className="h-4 w-4" />
                Job Coverage
              </div>
              <div className="text-2xl font-bold">{stats.coverage}%</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search competencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={configStatusFilter} onValueChange={(v) => setConfigStatusFilter(v as ConfigStatusFilter)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Config status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ready">Ready for Appraisals</SelectItem>
                <SelectItem value="partial">Partially Configured</SelectItem>
                <SelectItem value="not_ready">Not Configured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Competencies Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Competency</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Config Status</TableHead>
                <TableHead className="text-center">Jobs</TableHead>
                <TableHead className="text-center">Skills</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompetencies.map((comp) => {
                const isExpanded = expandedRows.has(comp.id);
                const CategoryIcon = getCategoryIcon(normalizeCategory(comp.category));
                const hasExpandableContent = comp.jobCount > 0 || comp.skillCount > 0;

                return (
                  <Collapsible key={comp.id} asChild open={isExpanded}>
                    <>
                      <TableRow className="group">
                        <TableCell>
                          {hasExpandableContent && (
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={() => toggleRowExpand(comp.id)}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            <div>
                              <div className="font-medium">{comp.name}</div>
                              <div className="text-xs text-muted-foreground">{comp.code}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <CategoryIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">
                              {getCategoryLabel(normalizeCategory(comp.category))}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <CompetencyConfigStatusBadge
                            hasIndicators={comp.hasIndicators}
                            jobCount={comp.jobCount}
                            skillCount={comp.skillCount}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <Badge variant={comp.jobCount > 0 ? "default" : "secondary"}>
                              {comp.jobCount}
                            </Badge>
                            {getJobSummary(comp)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={comp.skillCount > 0 ? "outline" : "secondary"}>
                            {comp.skillCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/workforce/capability-registry?id=${comp.id}&action=configure`)}
                            >
                              <Settings2 className="h-3.5 w-3.5 mr-1" />
                              Configure
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/workforce/capability-registry?id=${comp.id}`)}
                            >
                              View
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableCell></TableCell>
                          <TableCell colSpan={6}>
                            <CompetencyExpandedDetails
                              competencyId={comp.id}
                              jobRequirements={jobDetailsMap[comp.id] || []}
                              skillMappings={skillDetailsMap[comp.id] || []}
                            />
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                );
              })}
            </TableBody>
          </Table>

          {filteredCompetencies.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No competencies match your search criteria
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
