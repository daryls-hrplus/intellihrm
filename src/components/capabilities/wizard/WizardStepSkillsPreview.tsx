import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search, CheckCircle2, AlertTriangle, Sparkles, Loader2, Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MasterSkill, PROFICIENCY_LEVELS } from "./types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WizardStepSkillsPreviewProps {
  selectedOccupations: string[];
  selectedSkills: Set<string>;
  proficiencyLevels: Record<string, string>;
  companyId: string;
  onSkillToggle: (skillId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onProficiencyChange: (skillId: string, level: string) => void;
  onSkillsLoaded: (skills: MasterSkill[]) => void;
}

export function WizardStepSkillsPreview({
  selectedOccupations,
  selectedSkills,
  proficiencyLevels,
  companyId,
  onSkillToggle,
  onSelectAll,
  onDeselectAll,
  onProficiencyChange,
  onSkillsLoaded,
}: WizardStepSkillsPreviewProps) {
  const [skills, setSkills] = useState<MasterSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [existingSkillNames, setExistingSkillNames] = useState<Set<string>>(new Set());
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);
  const [suggestedSkills, setSuggestedSkills] = useState<MasterSkill[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    loadSkills();
    loadExistingSkills();
  }, [selectedOccupations, companyId]);

  const loadExistingSkills = async () => {
    try {
      const { data } = await supabase
        .from('skills_competencies')
        .select('name')
        .eq('company_id', companyId)
        .eq('type', 'SKILL');

      setExistingSkillNames(new Set((data || []).map(s => s.name.toLowerCase())));
    } catch (err) {
      console.error("Failed to load existing skills:", err);
    }
  };

  const loadSkills = async () => {
    setLoading(true);
    try {
      // Get all skills for selected occupations
      const { data: occupationSkills, error } = await supabase
        .from('master_occupation_skills')
        .select(`
          skill_id,
          proficiency_level,
          occupation_id,
          master_skills_library (
            id,
            skill_name,
            skill_type,
            category,
            description,
            source,
            reuse_level
          ),
          master_occupations_library (
            occupation_name
          )
        `)
        .in('occupation_id', selectedOccupations);

      if (error) throw error;

      // Deduplicate and map skills
      const skillsMap = new Map<string, MasterSkill>();
      
      (occupationSkills || []).forEach((os: any) => {
        if (os.master_skills_library) {
          const skill = os.master_skills_library;
          const existingSkill = skillsMap.get(skill.id);
          
          if (!existingSkill) {
            skillsMap.set(skill.id, {
              id: skill.id,
              skill_name: skill.skill_name,
              skill_type: skill.skill_type,
              category: skill.category,
              description: skill.description,
              source: skill.source,
              reuse_level: skill.reuse_level,
              proficiency_level: os.proficiency_level || 'proficient',
              occupationId: os.occupation_id,
              occupationName: os.master_occupations_library?.occupation_name,
              alreadyExists: existingSkillNames.has(skill.skill_name.toLowerCase()),
            });
          }
        }
      });

      const skillsList = Array.from(skillsMap.values());
      setSkills(skillsList);
      onSkillsLoaded(skillsList);

      // Load AI suggestions
      loadSuggestions(skillsList);
    } catch (err) {
      console.error("Failed to load skills:", err);
      toast.error("Failed to load skills");
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async (currentSkills: MasterSkill[]) => {
    setLoadingSuggestions(true);
    try {
      // Get skills from the same categories that aren't already selected
      const categories = [...new Set(currentSkills.map(s => s.category).filter(Boolean))];
      const currentSkillIds = new Set(currentSkills.map(s => s.id));

      const { data } = await supabase
        .from('master_skills_library')
        .select('*')
        .in('category', categories)
        .eq('is_active', true)
        .limit(10);

      const suggestions = (data || [])
        .filter(s => !currentSkillIds.has(s.id))
        .slice(0, 5)
        .map(s => ({
          id: s.id,
          skill_name: s.skill_name,
          skill_type: s.skill_type,
          category: s.category,
          description: s.description,
          source: s.source,
          reuse_level: s.reuse_level,
          alreadyExists: existingSkillNames.has(s.skill_name.toLowerCase()),
        }));

      setSuggestedSkills(suggestions);
    } catch (err) {
      console.error("Failed to load suggestions:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Get unique categories for filter
  const categories = [...new Set(skills.map(s => s.category).filter(Boolean))];

  // Filter skills
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = !searchQuery || 
      skill.skill_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (skill.description && skill.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || skill.category === categoryFilter;
    
    const matchesDuplicates = !showDuplicatesOnly || skill.alreadyExists;

    return matchesSearch && matchesCategory && matchesDuplicates;
  });

  const selectedCount = Array.from(selectedSkills).filter(id => skills.some(s => s.id === id)).length;
  const duplicateCount = skills.filter(s => s.alreadyExists).length;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-1">Preview Skills</h3>
        <p className="text-sm text-muted-foreground">
          Review and select which skills to import. Uncheck any you don't need.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{skills.length} skills found</span>
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
            placeholder="Search skills..."
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
          {selectedCount} of {filteredSkills.length} selected
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

      {/* Skills List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          <Zap className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No skills found.</p>
          <p className="text-sm">Try adjusting your filters.</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px] border rounded-lg">
          <div className="p-2 space-y-1">
            {filteredSkills.map((skill) => (
              <SkillItem
                key={skill.id}
                skill={skill}
                isChecked={selectedSkills.has(skill.id)}
                proficiencyLevel={proficiencyLevels[skill.id] || skill.proficiency_level || 'proficient'}
                onToggle={() => onSkillToggle(skill.id)}
                onProficiencyChange={(level) => onProficiencyChange(skill.id, level)}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* AI Suggestions */}
      {suggestedSkills.length > 0 && (
        <div className="border rounded-lg p-3 bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Suggestions</span>
            {loadingSuggestions && <Loader2 className="h-3 w-3 animate-spin" />}
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Based on your selections, consider adding these related skills:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills.map(skill => (
              <TooltipProvider key={skill.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={selectedSkills.has(skill.id) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => onSkillToggle(skill.id)}
                      className="h-7 text-xs"
                    >
                      {selectedSkills.has(skill.id) && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {skill.skill_name}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-[200px] text-xs">{skill.description || "No description"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SkillItem({ 
  skill, 
  isChecked, 
  proficiencyLevel,
  onToggle,
  onProficiencyChange,
}: { 
  skill: MasterSkill; 
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
        skill.alreadyExists && "opacity-60"
      )}
    >
      <Checkbox 
        checked={isChecked} 
        onCheckedChange={onToggle}
        disabled={skill.alreadyExists}
      />
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-sm">
            {skill.skill_name}
          </p>
          {skill.alreadyExists && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
              Already exists
            </Badge>
          )}
          {skill.category && (
            <Badge variant="secondary" className="text-xs">{skill.category}</Badge>
          )}
          {skill.skill_type && (
            <Badge variant="outline" className="text-xs">{skill.skill_type}</Badge>
          )}
        </div>
        {skill.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {skill.description}
          </p>
        )}
      </div>
      
      {isChecked && !skill.alreadyExists && (
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
      
      {isChecked && !skill.alreadyExists && (
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
      )}
    </div>
  );
}
