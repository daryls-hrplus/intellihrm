import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface IndustryOccupation {
  id: string;
  industry_code: string;
  industry_name: string;
  industry_icon: string;
  occupation_uri: string;
  occupation_label: string;
  priority: number;
  skill_count_estimate: number | null;
  is_core_occupation: boolean | null;
}

interface Industry {
  code: string;
  name: string;
  icon: string;
  occupations: IndustryOccupation[];
  totalSkills: number;
}

interface IndustrySelectorProps {
  selectedIndustry: string | null;
  selectedOccupations: string[];
  onIndustrySelect: (industryCode: string) => void;
  onOccupationToggle: (occupationUri: string) => void;
  onSelectAllOccupations: (occupationUris: string[]) => void;
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
};

export function IndustrySelector({
  selectedIndustry,
  selectedOccupations,
  onIndustrySelect,
  onOccupationToggle,
  onSelectAllOccupations,
}: IndustrySelectorProps) {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIndustries();
  }, []);

  const fetchIndustries = async () => {
    try {
      const { data, error } = await supabase
        .from("industry_occupation_mappings")
        .select("*")
        .order("industry_name")
        .order("priority");

      if (error) throw error;

      // Group by industry
      const industryMap = new Map<string, Industry>();
      
      (data || []).forEach((item: IndustryOccupation) => {
        if (!industryMap.has(item.industry_code)) {
          industryMap.set(item.industry_code, {
            code: item.industry_code,
            name: item.industry_name,
            icon: item.industry_icon || "Building",
            occupations: [],
            totalSkills: 0,
          });
        }
        const industry = industryMap.get(item.industry_code)!;
        industry.occupations.push(item);
        industry.totalSkills += item.skill_count_estimate || 0;
      });

      setIndustries(Array.from(industryMap.values()));
    } catch (err) {
      console.error("Failed to fetch industries:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentIndustry = industries.find((i) => i.code === selectedIndustry);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Industry Grid */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-muted-foreground">
          Select your industry sector
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {industries.map((industry) => {
            const Icon = iconMap[industry.icon] || Building;
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
                onClick={() => onIndustrySelect(industry.code)}
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
                  <p className="text-xs text-muted-foreground mt-1">
                    ~{industry.totalSkills} skills
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Occupation Selection */}
      {currentIndustry && (
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">
                {currentIndustry.name} - Key Occupations
              </h3>
              <p className="text-sm text-muted-foreground">
                Select occupations to import their associated skills
              </p>
            </div>
            <button
              className="text-sm text-primary hover:underline"
              onClick={() =>
                onSelectAllOccupations(
                  currentIndustry.occupations.map((o) => o.occupation_uri)
                )
              }
            >
              Select All
            </button>
          </div>

          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {currentIndustry.occupations.map((occupation) => {
                const isChecked = selectedOccupations.includes(
                  occupation.occupation_uri
                );

                return (
                  <div
                    key={occupation.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      isChecked
                        ? "bg-primary/10 border-primary"
                        : "bg-background hover:bg-muted"
                    )}
                    onClick={() => onOccupationToggle(occupation.occupation_uri)}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() =>
                        onOccupationToggle(occupation.occupation_uri)
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {occupation.occupation_label}
                      </p>
                      {occupation.is_core_occupation && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Core Role
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ~{occupation.skill_count_estimate || 40}
                      </p>
                      <p className="text-xs text-muted-foreground">skills</p>
                    </div>
                    {isChecked && (
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
