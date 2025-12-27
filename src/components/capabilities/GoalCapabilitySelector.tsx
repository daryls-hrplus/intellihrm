import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, X, Sparkles, Target, CheckCircle2 } from "lucide-react";
import { useCapabilities } from "@/hooks/capabilities/useCapabilities";
import { useGoalCapabilityIntegration } from "@/hooks/capabilities/useGoalCapabilityIntegration";
import type { Database } from "@/integrations/supabase/types";

type CapabilityRow = Database['public']['Tables']['capabilities']['Row'];

interface GoalCapabilitySelectorProps {
  goalId: string;
  companyId: string;
  goalTitle?: string;
  goalDescription?: string;
  onCapabilityAdded?: () => void;
}

const proficiencyLevels = [
  { value: "beginner", label: "Beginner", level: 1 },
  { value: "intermediate", label: "Intermediate", level: 2 },
  { value: "advanced", label: "Advanced", level: 3 },
  { value: "expert", label: "Expert", level: 4 },
];

export function GoalCapabilitySelector({
  goalId,
  companyId,
  goalTitle,
  goalDescription,
  onCapabilityAdded,
}: GoalCapabilitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState<CapabilityRow | null>(null);
  const [proficiencyLevel, setProficiencyLevel] = useState("intermediate");
  const [linkedCapabilities, setLinkedCapabilities] = useState<any[]>([]);
  const [inferring, setInferring] = useState(false);

  const { capabilities, isLoading: loadingCapabilities, fetchCapabilities } = useCapabilities();
  const { 
    isLoading: loadingGoal, 
    fetchGoalCapabilities, 
    addCapabilityToGoal,
    inferCapabilitiesFromGoal,
  } = useGoalCapabilityIntegration();

  useEffect(() => {
    fetchCapabilities({ companyId, status: "active" });
    loadLinkedCapabilities();
  }, [companyId, goalId]);

  const loadLinkedCapabilities = async () => {
    const caps = await fetchGoalCapabilities(goalId);
    setLinkedCapabilities(caps);
  };

  const handleAddCapability = async () => {
    if (!selectedCapability) return;
    
    await addCapabilityToGoal(goalId, companyId, selectedCapability.id, proficiencyLevel);
    setSelectedCapability(null);
    setProficiencyLevel("intermediate");
    setOpen(false);
    loadLinkedCapabilities();
    onCapabilityAdded?.();
  };

  const handleInferCapabilities = async () => {
    if (!goalTitle) return;
    setInferring(true);
    try {
      const result = await inferCapabilitiesFromGoal(goalTitle, goalDescription || "", companyId);
      if (result?.skills) {
        // Show inferred skills as suggestions
        console.log("Inferred capabilities:", result.skills);
      }
    } finally {
      setInferring(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technical: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      leadership: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      functional: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      behavioral: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      core: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[category] || colors.core;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Required Capabilities
          </CardTitle>
          {goalTitle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInferCapabilities}
              disabled={inferring}
              className="text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {inferring ? "Analyzing..." : "AI Suggest"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Linked Capabilities */}
        {loadingGoal ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        ) : linkedCapabilities.length > 0 ? (
          <div className="space-y-2">
            {linkedCapabilities.map((linked) => (
              <div
                key={linked.id}
                className="flex items-center justify-between p-2 rounded-md bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">{linked.skill_name}</span>
                  {linked.capability?.category && (
                    <Badge variant="secondary" className={getCategoryColor(linked.capability.category)}>
                      {linked.capability.category}
                    </Badge>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {linked.proficiency_level || "intermediate"}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No capabilities linked to this goal yet.
          </p>
        )}

        {/* Add Capability */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={loadingCapabilities}
                >
                  {selectedCapability
                    ? selectedCapability.name
                    : "Select capability..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search capabilities..." />
                  <CommandList>
                    <CommandEmpty>No capability found.</CommandEmpty>
                    <CommandGroup>
                      {capabilities
                        .filter(c => !linkedCapabilities.some(l => l.capability_id === c.id))
                        .map((cap) => (
                          <CommandItem
                            key={cap.id}
                            value={cap.name}
                            onSelect={() => {
                              setSelectedCapability(cap);
                              setOpen(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span>{cap.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {cap.category} • {cap.type}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Select value={proficiencyLevel} onValueChange={setProficiencyLevel}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {proficiencyLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleAddCapability}
            disabled={!selectedCapability}
            size="icon"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
