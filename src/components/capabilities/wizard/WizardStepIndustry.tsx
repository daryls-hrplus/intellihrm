import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart, Monitor, Landmark, ShoppingCart, Factory, Building,
  GraduationCap, UtensilsCrossed, Leaf, Building2, Wheat, Plane,
  Car, Briefcase, Zap, Film, Hotel, Shield, Scale, Truck, Ship,
  Pickaxe, HeartHandshake, Fuel, FlaskConical, Laptop, Radio, Lightbulb, Users,
  ChevronLeft, ChevronRight, Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MasterIndustry, OperatorAttributes } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WizardStepIndustryProps {
  selectedIndustries: string[];
  selectedSubIndustries: string[];
  onIndustryToggle: (industryCode: string) => void;
  onSubIndustryToggle: (subIndustryCode: string) => void;
}

interface IndustryWithMeta extends MasterIndustry {
  occupationCount?: number;
  subIndustries?: IndustryWithMeta[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart, Monitor, Landmark, ShoppingCart, Factory, Building,
  GraduationCap, UtensilsCrossed, Leaf, Building2, Wheat, Plane,
  Car, Briefcase, Zap, Film, Hotel, Shield, Scale, Truck, Ship,
  Pickaxe, HeartHandshake, Fuel, FlaskConical, Laptop, Radio, Lightbulb, Users,
};

export function WizardStepIndustry({
  selectedIndustries,
  selectedSubIndustries,
  onIndustryToggle,
  onSubIndustryToggle,
}: WizardStepIndustryProps) {
  const [allIndustries, setAllIndustries] = useState<IndustryWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"parent" | "sub">("parent");

  // Get the selected parent industry that has sub-industries
  const selectedParentWithSubs = useMemo(() => {
    if (selectedIndustries.length !== 1) return null;
    const parent = allIndustries.find(
      (i) => i.code === selectedIndustries[0] && i.subIndustries && i.subIndustries.length > 0
    );
    return parent || null;
  }, [selectedIndustries, allIndustries]);

  useEffect(() => {
    loadIndustries();
  }, []);

  // Auto-switch to sub-industry view when a parent with subs is selected
  useEffect(() => {
    if (selectedParentWithSubs && viewMode === "parent") {
      setViewMode("sub");
    }
  }, [selectedParentWithSubs]);

  const loadIndustries = async () => {
    setLoading(true);
    try {
      // Load all industries
      const { data: industriesData, error: industriesError } = await supabase
        .from("master_industries")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (industriesError) throw industriesError;

      // Separate parent and sub-industries
      const parentIndustries: IndustryWithMeta[] = [];
      const subIndustriesMap: Record<string, IndustryWithMeta[]> = {};

      for (const ind of industriesData || []) {
        const industry: IndustryWithMeta = {
          id: ind.id,
          code: ind.code,
          name: ind.name,
          name_en: ind.name_en,
          description: ind.description,
          icon_name: ind.icon_name,
          display_order: ind.display_order,
          is_active: ind.is_active,
          parent_industry_id: ind.parent_industry_id,
          operator_attributes: ind.operator_attributes as OperatorAttributes | null,
        };

        if (ind.parent_industry_id) {
          if (!subIndustriesMap[ind.parent_industry_id]) {
            subIndustriesMap[ind.parent_industry_id] = [];
          }
          subIndustriesMap[ind.parent_industry_id].push(industry);
        } else {
          parentIndustries.push(industry);
        }
      }

      // Get occupation counts per industry
      const industriesWithCounts = await Promise.all(
        parentIndustries.map(async (industry) => {
          const { count: occCount } = await supabase
            .from("master_occupations_library")
            .select("*", { count: "exact", head: true })
            .eq("industry_id", industry.id)
            .eq("is_active", true);

          // Attach sub-industries
          const subs = subIndustriesMap[industry.id] || [];
          
          return {
            ...industry,
            occupationCount: occCount || 0,
            subIndustries: subs,
          };
        })
      );

      setAllIndustries(industriesWithCounts);
    } catch (err) {
      console.error("Failed to load industries:", err);
      toast.error("Failed to load industries");
    } finally {
      setLoading(false);
    }
  };

  const handleParentClick = (industry: IndustryWithMeta) => {
    const hasSubs = industry.subIndustries && industry.subIndustries.length > 0;
    
    if (hasSubs) {
      // If clicking a parent with sub-industries, select it and show subs
      if (!selectedIndustries.includes(industry.code)) {
        onIndustryToggle(industry.code);
      }
      setViewMode("sub");
    } else {
      // No sub-industries, just toggle selection
      onIndustryToggle(industry.code);
    }
  };

  const handleBackToParents = () => {
    setViewMode("parent");
  };

  const renderOperatorBadges = (attrs: OperatorAttributes | null) => {
    if (!attrs) return null;
    const badges = [];
    if (attrs.seasonal) badges.push({ label: "Seasonal", color: "bg-amber-100 text-amber-800" });
    if (attrs.high_risk) badges.push({ label: "High-Risk", color: "bg-red-100 text-red-800" });
    if (attrs.regulated) badges.push({ label: "Regulated", color: "bg-blue-100 text-blue-800" });
    return badges.length > 0 ? (
      <div className="flex flex-wrap gap-1 mt-1">
        {badges.map((b) => (
          <span key={b.label} className={cn("text-[10px] px-1.5 py-0.5 rounded-full", b.color)}>
            {b.label}
          </span>
        ))}
      </div>
    ) : null;
  };

  const renderIndustryCard = (
    industry: IndustryWithMeta,
    isSelected: boolean,
    onClick: () => void,
    showSubCount?: boolean
  ) => {
    const Icon = iconMap[industry.icon_name || ""] || Building;
    const subCount = industry.subIndustries?.length || 0;

    return (
      <Card
        key={industry.code}
        className={cn(
          "cursor-pointer transition-all hover:shadow-md relative",
          isSelected
            ? "ring-2 ring-primary border-primary bg-primary/5"
            : "hover:border-primary/50"
        )}
        onClick={onClick}
      >
        <CardContent className="p-4 text-center">
          <div
            className={cn(
              "mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2",
              isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium line-clamp-2 mb-1">{industry.name}</p>
          
          {industry.description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 absolute top-2 right-2 text-muted-foreground hover:text-primary" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{industry.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {showSubCount && subCount > 0 && (
            <Badge variant="outline" className="text-xs mt-1">
              {subCount} sub-sectors <ChevronRight className="h-3 w-3 inline ml-1" />
            </Badge>
          )}

          {!showSubCount && industry.occupationCount !== undefined && industry.occupationCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {industry.occupationCount} roles
            </Badge>
          )}

          {renderOperatorBadges(industry.operator_attributes)}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-1">Select Your Industry</h3>
          <p className="text-sm text-muted-foreground">Loading industries...</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Sub-industry selection view
  if (viewMode === "sub" && selectedParentWithSubs) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBackToParents}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h3 className="text-lg font-medium">
              {selectedParentWithSubs.name} - Select Sub-Sector
            </h3>
            <p className="text-sm text-muted-foreground">
              Choose one or more specialized areas within {selectedParentWithSubs.name}.
              You can skip this step if none apply.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {selectedParentWithSubs.subIndustries?.map((sub) => {
            const isSelected = selectedSubIndustries.includes(sub.code);
            return renderIndustryCard(sub, isSelected, () => onSubIndustryToggle(sub.code));
          })}
        </div>

        {selectedSubIndustries.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span>Selected sub-sectors:</span>
            {selectedSubIndustries.map((code) => {
              const sub = selectedParentWithSubs.subIndustries?.find((s) => s.code === code);
              return (
                <Badge key={code} variant="default" className="gap-1">
                  {sub?.name || code}
                </Badge>
              );
            })}
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleBackToParents}>
            Skip - Use All {selectedParentWithSubs.name}
          </Button>
        </div>
      </div>
    );
  }

  // Parent industry selection view
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-1">Select Your Industry</h3>
        <p className="text-sm text-muted-foreground">
          Choose one or more industries to see relevant occupations and skills.
          Industries with sub-sectors will let you drill down further.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {allIndustries.map((industry) => {
          const isSelected = selectedIndustries.includes(industry.code);
          const hasSubs = industry.subIndustries && industry.subIndustries.length > 0;
          return renderIndustryCard(
            industry,
            isSelected,
            () => handleParentClick(industry),
            hasSubs
          );
        })}
      </div>

      {selectedIndustries.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <span>Selected:</span>
          {selectedIndustries.map((code) => {
            const industry = allIndustries.find((i) => i.code === code);
            return (
              <Badge key={code} variant="default" className="gap-1">
                {industry?.name || code}
              </Badge>
            );
          })}
          {selectedSubIndustries.length > 0 && (
            <>
              <span className="mx-1">→</span>
              {selectedSubIndustries.map((code) => {
                const parent = allIndustries.find((i) =>
                  i.subIndustries?.some((s) => s.code === code)
                );
                const sub = parent?.subIndustries?.find((s) => s.code === code);
                return (
                  <Badge key={code} variant="secondary" className="gap-1">
                    {sub?.name || code}
                  </Badge>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
