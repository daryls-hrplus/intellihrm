import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Heart, Monitor, Landmark, ShoppingCart, Factory, Building,
  GraduationCap, UtensilsCrossed, Leaf, Building2, Wheat, Plane,
  Car, Briefcase, Zap, Film, Hotel, Shield, Scale, Truck, Ship,
  Pickaxe, HeartHandshake, Fuel, FlaskConical, Laptop, Radio, Lightbulb, Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MasterIndustry } from "./types";

interface WizardStepIndustryProps {
  selectedIndustries: string[];
  onIndustryToggle: (industryCode: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart, Monitor, Landmark, ShoppingCart, Factory, Building,
  GraduationCap, UtensilsCrossed, Leaf, Building2, Wheat, Plane,
  Car, Briefcase, Zap, Film, Hotel, Shield, Scale, Truck, Ship,
  Pickaxe, HeartHandshake, Fuel, FlaskConical, Laptop, Radio, Lightbulb, Users,
};

export function WizardStepIndustry({
  selectedIndustries,
  onIndustryToggle,
}: WizardStepIndustryProps) {
  const [industries, setIndustries] = useState<(MasterIndustry & { occupationCount?: number; skillCount?: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIndustries();
  }, []);

  const loadIndustries = async () => {
    setLoading(true);
    try {
      // Load industries with occupation counts
      const { data: industriesData, error: industriesError } = await supabase
        .from('master_industries')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (industriesError) throw industriesError;

      // Get occupation counts per industry
      const industriesWithCounts = await Promise.all(
        (industriesData || []).map(async (industry) => {
          const { count: occCount } = await supabase
            .from('master_occupations_library')
            .select('*', { count: 'exact', head: true })
            .eq('industry_id', industry.id)
            .eq('is_active', true);

          return {
            ...industry,
            occupationCount: occCount || 0,
          };
        })
      );

      setIndustries(industriesWithCounts);
    } catch (err) {
      console.error("Failed to load industries:", err);
      toast.error("Failed to load industries");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-1">Select Your Industry</h3>
        <p className="text-sm text-muted-foreground">
          Choose one or more industries to see relevant occupations and skills.
          You can select multiple industries.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {industries.map((industry) => {
            const Icon = iconMap[industry.icon_name || ''] || Building;
            const isSelected = selectedIndustries.includes(industry.code);

            return (
              <Card
                key={industry.code}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  isSelected
                    ? "ring-2 ring-primary border-primary bg-primary/5"
                    : "hover:border-primary/50"
                )}
                onClick={() => onIndustryToggle(industry.code)}
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
                  <p className="text-sm font-medium line-clamp-2 mb-1">
                    {industry.name}
                  </p>
                  {industry.occupationCount !== undefined && industry.occupationCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {industry.occupationCount} roles
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedIndustries.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Selected:</span>
          {selectedIndustries.map(code => {
            const industry = industries.find(i => i.code === code);
            return (
              <Badge key={code} variant="default" className="gap-1">
                {industry?.name || code}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
