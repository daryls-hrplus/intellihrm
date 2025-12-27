import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DynamicOccupation {
  uri: string;
  title: string;
  description?: string;
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
  onOccupationToggle: (occupationUri: string, occupationLabel?: string) => void;
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
  const [occupations, setOccupations] = useState<DynamicOccupation[]>([]);
  const [loadingOccupations, setLoadingOccupations] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customSearchResults, setCustomSearchResults] = useState<DynamicOccupation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load industries from master_industries table
  useEffect(() => {
    loadIndustries();
  }, []);

  // Load occupations dynamically when industry changes
  useEffect(() => {
    if (selectedIndustry) {
      loadOccupationsForIndustry(selectedIndustry);
    } else {
      setOccupations([]);
    }
  }, [selectedIndustry]);

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

  const loadOccupationsForIndustry = async (industryCode: string) => {
    setLoadingOccupations(true);
    setOccupations([]);
    
    const industry = industries.find(i => i.code === industryCode);
    if (!industry) {
      setLoadingOccupations(false);
      return;
    }

    try {
      // Call edge function to search ESCO for industry-related occupations
      const { data, error } = await supabase.functions.invoke("esco-skills-import", {
        body: {
          action: "search_industry_occupations",
          industryName: industry.name,
          language: "en",
          limit: 25,
        },
      });

      if (error) throw error;

      const occupationList = (data?.occupations || []).map((occ: any) => ({
        uri: occ.uri,
        title: occ.title,
        description: occ.description,
      }));

      setOccupations(occupationList);
      
      if (occupationList.length === 0) {
        toast.info("No occupations found for this industry. Try searching manually.");
      }
    } catch (err) {
      console.error("Failed to load occupations:", err);
      toast.error("Failed to load occupations from ESCO API");
    } finally {
      setLoadingOccupations(false);
    }
  };

  const handleCustomSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke("esco-skills-import", {
        body: {
          action: "search_occupations",
          query: searchQuery,
          language: "en",
          limit: 15,
        },
      });

      if (error) throw error;

      const results = (data?.occupations || []).map((occ: any) => ({
        uri: occ.uri,
        title: occ.title,
        description: occ.description,
      }));

      setCustomSearchResults(results);
      
      if (results.length === 0) {
        toast.info("No occupations found matching your search");
      }
    } catch (err) {
      console.error("Search failed:", err);
      toast.error("Failed to search ESCO API");
    } finally {
      setIsSearching(false);
    }
  };

  const currentIndustry = industries.find((i) => i.code === selectedIndustry);
  const displayOccupations = customSearchResults.length > 0 ? customSearchResults : occupations;

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
                    setCustomSearchResults([]);
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
                Select occupations to import their associated skills from ESCO
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
              {displayOccupations.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onSelectAllOccupations(
                      displayOccupations.map((o) => ({ uri: o.uri, label: o.title }))
                    )
                  }
                >
                  Select All
                </Button>
              )}
            </div>
          </div>

          {/* Custom Search */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for specific occupations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCustomSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleCustomSearch} disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
            {customSearchResults.length > 0 && (
              <Button
                variant="ghost"
                onClick={() => {
                  setCustomSearchResults([]);
                  setSearchQuery("");
                }}
              >
                Clear
              </Button>
            )}
          </div>

          {loadingOccupations ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : displayOccupations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No occupations loaded yet.</p>
              <p className="text-sm">Use the search above to find specific occupations.</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {displayOccupations.map((occupation) => {
                  const isChecked = selectedOccupations.includes(occupation.uri);

                  return (
                    <div
                      key={occupation.uri}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        isChecked
                          ? "bg-primary/10 border-primary"
                          : "bg-background hover:bg-muted"
                      )}
                      onClick={() => onOccupationToggle(occupation.uri, occupation.title)}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() =>
                          onOccupationToggle(occupation.uri, occupation.title)
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {occupation.title}
                        </p>
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
                })}
              </div>
            </ScrollArea>
          )}

          {customSearchResults.length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Showing {customSearchResults.length} search results. Clear to see industry occupations.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
