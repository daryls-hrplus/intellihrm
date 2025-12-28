import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search, RefreshCw, CheckCircle2, Users, Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MasterOccupation, JOB_LEVELS } from "./types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WizardStepOccupationsProps {
  selectedIndustries: string[];
  selectedOccupations: string[];
  occupationLabels: Record<string, string>;
  onOccupationToggle: (occupationId: string, occupationLabel: string) => void;
  onSelectAll: (occupations: { id: string; name: string }[]) => void;
  onDeselectAll: () => void;
}

export function WizardStepOccupations({
  selectedIndustries,
  selectedOccupations,
  occupationLabels,
  onOccupationToggle,
  onSelectAll,
  onDeselectAll,
}: WizardStepOccupationsProps) {
  const [occupations, setOccupations] = useState<MasterOccupation[]>([]);
  const [crossCuttingOccupations, setCrossCuttingOccupations] = useState<MasterOccupation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCrossCutting, setShowCrossCutting] = useState(true);
  const [selectedJobLevels, setSelectedJobLevels] = useState<string[]>([]);

  useEffect(() => {
    loadOccupations();
  }, [selectedIndustries]);

  const loadOccupations = async () => {
    setLoading(true);
    try {
      // Get industry IDs
      const { data: industries } = await supabase
        .from('master_industries')
        .select('id, code')
        .in('code', selectedIndustries);

      const industryIds = industries?.map(i => i.id) || [];

      // Load industry-specific occupations
      if (industryIds.length > 0) {
        const { data: occupationsData, error } = await supabase
          .from('master_occupations_library')
          .select('id, occupation_name, description, job_family, job_level, is_cross_cutting, skills_count, competencies_count')
          .in('industry_id', industryIds)
          .eq('is_active', true)
          .eq('is_cross_cutting', false)
          .order('occupation_name');

        if (error) throw error;
        setOccupations(occupationsData || []);
      } else {
        setOccupations([]);
      }

      // Load cross-cutting occupations
      const { data: crossCuttingData, error: crossError } = await supabase
        .from('master_occupations_library')
        .select('id, occupation_name, description, job_family, job_level, is_cross_cutting, skills_count, competencies_count')
        .eq('is_active', true)
        .eq('is_cross_cutting', true)
        .order('occupation_name');

      if (crossError) throw crossError;
      setCrossCuttingOccupations(crossCuttingData || []);
    } catch (err) {
      console.error("Failed to load occupations:", err);
      toast.error("Failed to load occupations");
    } finally {
      setLoading(false);
    }
  };

  // Filter occupations
  const filterOccupations = (occs: MasterOccupation[]) => {
    return occs.filter(occ => {
      const matchesSearch = !searchQuery || 
        occ.occupation_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (occ.job_family && occ.job_family.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesLevel = selectedJobLevels.length === 0 || 
        (occ.job_level && selectedJobLevels.includes(occ.job_level));

      return matchesSearch && matchesLevel;
    });
  };

  const filteredOccupations = filterOccupations(occupations);
  const filteredCrossCutting = filterOccupations(crossCuttingOccupations);

  const allDisplayOccupations = showCrossCutting 
    ? [...filteredOccupations, ...filteredCrossCutting]
    : filteredOccupations;

  const handleJobLevelToggle = (level: string) => {
    setSelectedJobLevels(prev => 
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-1">Select Occupations</h3>
        <p className="text-sm text-muted-foreground">
          Choose the job roles you want to import skills and competencies for.
          Skills are mapped to each occupation based on job level.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search occupations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Job Level
              {selectedJobLevels.length > 0 && (
                <Badge variant="secondary" className="ml-1">{selectedJobLevels.length}</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {JOB_LEVELS.map(level => (
              <DropdownMenuCheckboxItem
                key={level.value}
                checked={selectedJobLevels.includes(level.value)}
                onCheckedChange={() => handleJobLevelToggle(level.value)}
              >
                {level.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant={showCrossCutting ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowCrossCutting(!showCrossCutting)}
        >
          <Users className="h-4 w-4 mr-1" />
          Cross-cutting
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={loadOccupations}
          disabled={loading}
        >
          <RefreshCw className={cn("h-4 w-4 mr-1", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Selection Actions */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {selectedOccupations.length} of {allDisplayOccupations.length} selected
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselectAll}
            disabled={selectedOccupations.length === 0}
          >
            Clear Selection
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectAll(allDisplayOccupations.map(o => ({ id: o.id, name: o.occupation_name })))}
          >
            Select All Visible
          </Button>
        </div>
      </div>

      {/* Occupations List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : allDisplayOccupations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg">
          <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No occupations found.</p>
          <p className="text-sm">Try adjusting filters or selecting different industries.</p>
        </div>
      ) : (
        <ScrollArea className="h-[350px] border rounded-lg">
          <div className="p-2 space-y-1">
            {/* Industry-specific occupations */}
            {filteredOccupations.length > 0 && (
              <>
                <p className="text-xs font-medium text-muted-foreground px-2 py-1 sticky top-0 bg-background">
                  Industry-Specific Roles ({filteredOccupations.length})
                </p>
                {filteredOccupations.map((occupation) => (
                  <OccupationItem
                    key={occupation.id}
                    occupation={occupation}
                    isChecked={selectedOccupations.includes(occupation.id)}
                    onToggle={() => onOccupationToggle(occupation.id, occupation.occupation_name)}
                  />
                ))}
              </>
            )}

            {/* Cross-cutting occupations */}
            {showCrossCutting && filteredCrossCutting.length > 0 && (
              <>
                <p className="text-xs font-medium text-muted-foreground px-2 py-1 mt-2 sticky top-0 bg-background">
                  Cross-cutting Roles ({filteredCrossCutting.length})
                </p>
                {filteredCrossCutting.map((occupation) => (
                  <OccupationItem
                    key={occupation.id}
                    occupation={occupation}
                    isChecked={selectedOccupations.includes(occupation.id)}
                    onToggle={() => onOccupationToggle(occupation.id, occupation.occupation_name)}
                    isCrossCutting
                  />
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function OccupationItem({ 
  occupation, 
  isChecked, 
  onToggle,
  isCrossCutting = false
}: { 
  occupation: MasterOccupation; 
  isChecked: boolean; 
  onToggle: () => void;
  isCrossCutting?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
        isChecked
          ? "bg-primary/10 border border-primary"
          : "bg-background hover:bg-muted border border-transparent"
      )}
      onClick={onToggle}
    >
      <Checkbox checked={isChecked} onCheckedChange={onToggle} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-sm">
            {occupation.occupation_name}
          </p>
          {isCrossCutting && (
            <Badge variant="outline" className="text-xs">Cross-cutting</Badge>
          )}
          {occupation.job_family && (
            <Badge variant="secondary" className="text-xs">{occupation.job_family}</Badge>
          )}
          {occupation.job_level && (
            <Badge variant="outline" className="text-xs">{occupation.job_level}</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {occupation.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 flex-1">
              {occupation.description}
            </p>
          )}
          <div className="flex gap-2 text-xs text-muted-foreground shrink-0">
            {occupation.skills_count !== null && occupation.skills_count > 0 && (
              <span>{occupation.skills_count} skills</span>
            )}
            {occupation.competencies_count !== null && occupation.competencies_count > 0 && (
              <span>{occupation.competencies_count} competencies</span>
            )}
          </div>
        </div>
      </div>
      {isChecked && (
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
      )}
    </div>
  );
}
