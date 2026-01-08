import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Monitor,
  Landmark,
  ShoppingCart,
  Factory,
  Building,
  GraduationCap,
  UtensilsCrossed,
  Leaf,
  Building2,
  CheckCircle2,
  Search,
  RefreshCw,
  Loader2,
  Wheat,
  Plane,
  Car,
  Briefcase,
  Zap,
  Film,
  Hotel,
  Shield,
  Scale,
  Truck,
  Ship,
  Pickaxe,
  HeartHandshake,
  Fuel,
  FlaskConical,
  Laptop,
  Radio,
  Lightbulb,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MasterOccupation {
  id: string;
  occupation_name: string;
  description: string | null;
  job_family: string | null;
  job_level: string | null;
  is_cross_cutting: boolean | null;
  skills_count: number | null;
  competencies_count: number | null;
}

interface MasterIndustry {
  id: string;
  code: string;
  name: string;
  name_en: string | null;
  description: string | null;
  icon_name: string | null;
  display_order: number;
  is_active: boolean;
}

interface IndustrySelectorProps {
  selectedIndustry: string | null;
  selectedOccupations: string[];
  onIndustrySelect: (industryCode: string) => void;
  onOccupationToggle: (occupationId: string, occupationLabel?: string) => void;
  onSelectAllOccupations: (occupations: { uri: string; label: string }[]) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  Monitor,
  Landmark,
  ShoppingCart,
  Factory,
  Building,
  GraduationCap,
  UtensilsCrossed,
  Leaf,
  Building2,
  Wheat,
  Plane,
  Car,
  Briefcase,
  Zap,
  Film,
  Hotel,
  Shield,
  Scale,
  Truck,
  Ship,
  Pickaxe,
  HeartHandshake,
  Fuel,
  FlaskConical,
  Laptop,
  Radio,
  Lightbulb,
  Users,
};

export function IndustrySelector({
  selectedIndustry,
  selectedOccupations,
  onIndustrySelect,
  onOccupationToggle,
  onSelectAllOccupations,
}: IndustrySelectorProps) {
  const [industries, setIndustries] = useState<MasterIndustry[]>([]);
  const [loadingIndustries, setLoadingIndustries] = useState(true);
  const [occupations, setOccupations] = useState<MasterOccupation[]>([]);
  const [crossCuttingOccupations, setCrossCuttingOccupations] = useState<MasterOccupation[]>([]);
  const [loadingOccupations, setLoadingOccupations] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCrossCutting, setShowCrossCutting] = useState(true);

  // Load industries from master_industries table
  useEffect(() => {
    loadIndustries();
    loadCrossCuttingOccupations();
  }, []);

  // Load occupations when industry changes
  useEffect(() => {
    if (selectedIndustry && industries.length > 0) {
      loadOccupationsForIndustry(selectedIndustry);
    } else {
      setOccupations([]);
    }
  }, [selectedIndustry, industries]);

  const loadIndustries = async () => {
    setLoadingIndustries(true);
    try {
      const { data, error } = await supabase
        .from('master_industries')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setIndustries(data || []);
    } catch (err) {
      console.error("Failed to load industries:", err);
      toast.error("Failed to load industries");
    } finally {
      setLoadingIndustries(false);
    }
  };

  const loadCrossCuttingOccupations = async () => {
    try {
      const { data, error } = await supabase
        .from('master_occupations_library')
        .select('id, occupation_name, description, job_family, job_level, is_cross_cutting, skills_count, competencies_count')
        .eq('is_active', true)
        .eq('is_cross_cutting', true)
        .order('occupation_name');

      if (error) throw error;
      setCrossCuttingOccupations(data || []);
    } catch (err) {
      console.error("Failed to load cross-cutting occupations:", err);
    }
  };

  const loadOccupationsForIndustry = async (industryCode: string) => {
    setLoadingOccupations(true);
    setOccupations([]);
    
    const industry = industries.find(i => i.code === industryCode);
    if (!industry) {
      setLoadingOccupations(false);
      return;
    }

    try {
      // Get occupations for this industry from master_occupations_library
      const { data, error } = await supabase
        .from('master_occupations_library')
        .select('id, occupation_name, description, job_family, job_level, is_cross_cutting, skills_count, competencies_count')
        .eq('industry_id', industry.id)
        .eq('is_active', true)
        .order('occupation_name');

      if (error) throw error;
      setOccupations(data || []);
      
      if ((data || []).length === 0) {
        toast.info("No specific occupations for this industry. You can select cross-cutting roles below.");
      }
    } catch (err) {
      console.error("Failed to load occupations:", err);
      toast.error("Failed to load occupations");
    } finally {
      setLoadingOccupations(false);
    }
  };

  // Filter occupations based on search
  const filteredOccupations = occupations.filter(occ => 
    !searchQuery || occ.occupation_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCrossCutting = crossCuttingOccupations.filter(occ =>
    !searchQuery || occ.occupation_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentIndustry = industries.find((i) => i.code === selectedIndustry);

  // Combine industry-specific and cross-cutting occupations for display
  const allDisplayOccupations = showCrossCutting 
    ? [...filteredOccupations, ...filteredCrossCutting]
    : filteredOccupations;

  return (
    <div className="space-y-6">
      {/* Industry Grid */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-muted-foreground">
          Select your industry sector
        </h3>
        {loadingIndustries ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {industries.map((industry) => {
              const Icon = iconMap[industry.icon_name || ''] || Building;
              const isSelected = selectedIndustry === industry.code;

              return (
                <Card
                  key={industry.code}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    isSelected
                      ? "ring-2 ring-primary border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  )}
                  onClick={() => {
                    onIndustrySelect(industry.code);
                    setSearchQuery("");
                  }}
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className={cn(
                        "mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium line-clamp-2">
                      {industry.name}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Occupation Selection */}
      {currentIndustry && (
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">
                {currentIndustry.name} - Occupations
              </h3>
              <p className="text-sm text-muted-foreground">
                Select occupations to import their associated skills from the Intelli HRM library
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadOccupationsForIndustry(currentIndustry.code)}
                disabled={loadingOccupations}
              >
                <RefreshCw className={cn("h-4 w-4 mr-1", loadingOccupations && "animate-spin")} />
                Refresh
              </Button>
              {allDisplayOccupations.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onSelectAllOccupations(
                      allDisplayOccupations.map((o) => ({ uri: o.id, label: o.occupation_name }))
                    )
                  }
                >
                  Select All
                </Button>
              )}
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search occupations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant={showCrossCutting ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowCrossCutting(!showCrossCutting)}
            >
              <Users className="h-4 w-4 mr-1" />
              Cross-cutting
            </Button>
          </div>

          {loadingOccupations ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : allDisplayOccupations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No occupations found.</p>
              <p className="text-sm">Try enabling cross-cutting roles or selecting a different industry.</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {/* Industry-specific occupations */}
                {filteredOccupations.length > 0 && (
                  <>
                    <p className="text-xs font-medium text-muted-foreground px-1 mb-2">
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
                    <p className="text-xs font-medium text-muted-foreground px-1 mt-4 mb-2">
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
        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
        isChecked
          ? "bg-primary/10 border-primary"
          : "bg-background hover:bg-muted"
      )}
      onClick={onToggle}
    >
      <Checkbox checked={isChecked} onCheckedChange={onToggle} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm">
            {occupation.occupation_name}
          </p>
          {isCrossCutting && (
            <Badge variant="outline" className="text-xs">Cross-cutting</Badge>
          )}
          {occupation.job_family && (
            <Badge variant="secondary" className="text-xs">{occupation.job_family}</Badge>
          )}
        </div>
        {occupation.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {occupation.description}
          </p>
        )}
      </div>
      {isChecked && (
        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
      )}
    </div>
  );
}
