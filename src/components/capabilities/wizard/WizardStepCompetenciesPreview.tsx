import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search, CheckCircle2, AlertTriangle, Target,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MasterCompetency, PROFICIENCY_LEVELS } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WizardStepCompetenciesPreviewProps {
  selectedOccupations: string[];
  selectedCompetencies: Set<string>;
  proficiencyLevels: Record<string, string>;
  companyId: string;
  onCompetencyToggle: (competencyId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onProficiencyChange: (competencyId: string, level: string) => void;
  onCompetenciesLoaded: (competencies: MasterCompetency[]) => void;
}

export function WizardStepCompetenciesPreview({
  selectedOccupations,
  selectedCompetencies,
  proficiencyLevels,
  companyId,
  onCompetencyToggle,
  onSelectAll,
  onDeselectAll,
  onProficiencyChange,
  onCompetenciesLoaded,
}: WizardStepCompetenciesPreviewProps) {
  const [competencies, setCompetencies] = useState<MasterCompetency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [existingCompetencyNames, setExistingCompetencyNames] = useState<Set<string>>(new Set());
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);

  useEffect(() => {
    loadCompetencies();
    loadExistingCompetencies();
  }, [selectedOccupations, companyId]);

  const loadExistingCompetencies = async () => {
    try {
      const { data } = await supabase
        .from('skills_competencies')
        .select('name')
        .eq('company_id', companyId)
        .eq('type', 'COMPETENCY');

      setExistingCompetencyNames(new Set((data || []).map(c => c.name.toLowerCase())));
    } catch (err) {
      console.error("Failed to load existing competencies:", err);
    }
  };

  const loadCompetencies = async () => {
    setLoading(true);
    try {
      // Get all competencies for selected occupations
      const { data: occupationCompetencies, error } = await supabase
        .from('master_occupation_competencies')
        .select(`
          competency_id,
          proficiency_level,
          occupation_id,
          master_competencies_library (
            id,
            competency_name,
            competency_type,
            category,
            description,
            source
          ),
          master_occupations_library (
            occupation_name
          )
        `)
        .in('occupation_id', selectedOccupations);

      if (error) throw error;

      // Track indicator counts (simplified - don't query separately)
      let indicatorsCounts: Record<string, number> = {};

      // Deduplicate and map competencies
      const competenciesMap = new Map<string, MasterCompetency>();
      
      (occupationCompetencies || []).forEach((oc: any) => {
        if (oc.master_competencies_library) {
          const competency = oc.master_competencies_library;
          
          if (!competenciesMap.has(competency.id)) {
            competenciesMap.set(competency.id, {
              id: competency.id,
              competency_name: competency.competency_name,
              competency_type: competency.competency_type,
              category: competency.category,
              description: competency.description,
              source: competency.source,
              behavioral_indicators_count: indicatorsCounts[competency.id] || 0,
              proficiency_level: oc.proficiency_level || 'proficient',
              occupationId: oc.occupation_id,
              occupationName: oc.master_occupations_library?.occupation_name,
              alreadyExists: existingCompetencyNames.has(competency.competency_name.toLowerCase()),
            });
          }
        }
      });

      const competenciesList = Array.from(competenciesMap.values());
      setCompetencies(competenciesList);
      onCompetenciesLoaded(competenciesList);
    } catch (err) {
      console.error("Failed to load competencies:", err);
      toast.error("Failed to load competencies");
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories for filter
  const categories = [...new Set(competencies.map(c => c.category).filter(Boolean))];

  // Filter competencies
  const filteredCompetencies = competencies.filter(competency => {
    const matchesSearch = !searchQuery || 
      competency.competency_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (competency.description && competency.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || competency.category === categoryFilter;
    
    const matchesDuplicates = !showDuplicatesOnly || competency.alreadyExists;

    return matchesSearch && matchesCategory && matchesDuplicates;
  });

  const selectedCount = Array.from(selectedCompetencies).filter(id => competencies.some(c => c.id === id)).length;
  const duplicateCount = competencies.filter(c => c.alreadyExists).length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-1">Preview Competencies</h3>
        <p className="text-sm text-muted-foreground">
          Review and select which competencies to import. These define expected behaviors.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{competencies.length} competencies found</span>
        </div>
        <div className="h-4 w-px bg-border" />
        <span className="text-sm text-muted-foreground">{selectedCount} selected</span>
        {duplicateCount > 0 && (
          <>
            <div className="h-4 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-amber-600"
              onClick={() => setShowDuplicatesOnly(!showDuplicatesOnly)}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              {duplicateCount} already exist
            </Button>
          </>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search competencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selection Actions */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {selectedCount} of {filteredCompetencies.length} selected
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselectAll}
            disabled={selectedCount === 0}
          >
            Clear Selection
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
          >
            Select All
          </Button>
        </div>
      </div>

      {/* Competencies List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : filteredCompetencies.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          <Target className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No competencies found.</p>
          <p className="text-sm">Try adjusting your filters.</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px] border rounded-lg">
          <div className="p-2 space-y-1">
            {filteredCompetencies.map((competency) => (
              <CompetencyItem
                key={competency.id}
                competency={competency}
                isChecked={selectedCompetencies.has(competency.id)}
                proficiencyLevel={proficiencyLevels[competency.id] || competency.proficiency_level || 'proficient'}
                onToggle={() => onCompetencyToggle(competency.id)}
                onProficiencyChange={(level) => onProficiencyChange(competency.id, level)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function CompetencyItem({ 
  competency, 
  isChecked, 
  proficiencyLevel,
  onToggle,
  onProficiencyChange,
}: { 
  competency: MasterCompetency; 
  isChecked: boolean; 
  proficiencyLevel: string;
  onToggle: () => void;
  onProficiencyChange: (level: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-colors",
        isChecked
          ? "bg-primary/10 border border-primary"
          : "bg-background hover:bg-muted border border-transparent",
        competency.alreadyExists && "opacity-60"
      )}
    >
      <Checkbox 
        checked={isChecked} 
        onCheckedChange={onToggle}
        disabled={competency.alreadyExists}
      />
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-sm">
            {competency.competency_name}
          </p>
          {competency.alreadyExists && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
              Already exists
            </Badge>
          )}
          {competency.category && (
            <Badge variant="secondary" className="text-xs">{competency.category}</Badge>
          )}
          {competency.behavioral_indicators_count !== undefined && competency.behavioral_indicators_count > 0 && (
            <Badge variant="outline" className="text-xs">
              {competency.behavioral_indicators_count} indicators
            </Badge>
          )}
        </div>
        {competency.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {competency.description}
          </p>
        )}
      </div>
      
      {isChecked && !competency.alreadyExists && (
        <Select value={proficiencyLevel} onValueChange={onProficiencyChange}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROFICIENCY_LEVELS.map(level => (
              <SelectItem key={level.value} value={level.value}>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", level.color)} />
                  {level.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      {isChecked && !competency.alreadyExists && (
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
      )}
    </div>
  );
}
