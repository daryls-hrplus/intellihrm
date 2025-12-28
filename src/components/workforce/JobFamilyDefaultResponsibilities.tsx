import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import {
  Search,
  Plus,
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Responsibility {
  id: string;
  name: string;
  category: string | null;
  complexity_level: number | null;
}

interface DefaultResponsibility {
  responsibility_id: string;
  suggested_weight: number;
  responsibility?: Responsibility;
}

interface AISuggestion {
  name: string;
  category: string;
  suggestedWeight: number;
  description: string;
}

interface JobFamilyDefaultResponsibilitiesProps {
  companyId: string;
  familyName: string;
  familyDescription?: string;
  defaultResponsibilities: DefaultResponsibility[];
  onUpdate: (responsibilities: DefaultResponsibility[]) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  financial: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  operational: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  people_leadership: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  technical: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  compliance: "bg-red-500/10 text-red-600 border-red-500/20",
  strategic: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  administrative: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  customer_service: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  project_management: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
};

export function JobFamilyDefaultResponsibilities({
  companyId,
  familyName,
  familyDescription,
  defaultResponsibilities,
  onUpdate,
}: JobFamilyDefaultResponsibilitiesProps) {
  const { t } = useLanguage();
  const [responsibilities, setResponsibilities] = useState<Responsibility[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingResponsibilities, setIsLoadingResponsibilities] = useState(true);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchResponsibilities();
  }, [companyId]);

  const fetchResponsibilities = async () => {
    setIsLoadingResponsibilities(true);
    const { data, error } = await supabase
      .from("responsibilities")
      .select("id, name, category, complexity_level")
      .eq("company_id", companyId)
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching responsibilities:", error);
    } else {
      setResponsibilities(data || []);
    }
    setIsLoadingResponsibilities(false);
  };

  const totalWeight = defaultResponsibilities.reduce((sum, r) => sum + r.suggested_weight, 0);

  const addResponsibility = (responsibility: Responsibility) => {
    if (defaultResponsibilities.some((r) => r.responsibility_id === responsibility.id)) {
      toast.error("Responsibility already added");
      return;
    }

    const newResponsibility: DefaultResponsibility = {
      responsibility_id: responsibility.id,
      suggested_weight: 15,
      responsibility,
    };

    onUpdate([...defaultResponsibilities, newResponsibility]);
    setSearchOpen(false);
    setSearchTerm("");
  };

  const removeResponsibility = (responsibilityId: string) => {
    onUpdate(defaultResponsibilities.filter((r) => r.responsibility_id !== responsibilityId));
  };

  const updateWeight = (responsibilityId: string, weight: number) => {
    onUpdate(
      defaultResponsibilities.map((r) =>
        r.responsibility_id === responsibilityId ? { ...r, suggested_weight: weight } : r
      )
    );
  };

  const handleAISuggest = async () => {
    if (!familyName) {
      toast.error("Please enter a family name first");
      return;
    }

    setIsGeneratingSuggestions(true);
    setShowSuggestions(false);

    try {
      const existingNames = responsibilities.map((r) => r.name);

      const { data, error } = await supabase.functions.invoke("responsibility-ai-helper", {
        body: {
          action: "suggest_for_family",
          familyName,
          familyDescription,
          existingResponsibilities: existingNames,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.suggestions && data.suggestions.length > 0) {
        setAiSuggestions(data.suggestions);
        setShowSuggestions(true);
      } else {
        toast.info("No suggestions generated");
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast.error("Failed to generate suggestions");
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const acceptSuggestion = async (suggestion: AISuggestion) => {
    // Check if a responsibility with this name already exists
    const existing = responsibilities.find(
      (r) => r.name.toLowerCase() === suggestion.name.toLowerCase()
    );

    if (existing) {
      // Add existing responsibility
      addResponsibility(existing);
    } else {
      // Create new responsibility and add it
      try {
        const { data, error } = await supabase
          .from("responsibilities")
          .insert([{
            company_id: companyId,
            name: suggestion.name,
            category: suggestion.category,
            description: suggestion.description,
            complexity_level: 3,
            is_active: true,
            code: suggestion.name.toUpperCase().replace(/\s+/g, '_').substring(0, 20),
          }])
          .select("id, name, category, complexity_level")
          .single();

        if (error) throw error;

        if (data) {
          setResponsibilities([...responsibilities, data]);
          const newResponsibility: DefaultResponsibility = {
            responsibility_id: data.id,
            suggested_weight: suggestion.suggestedWeight,
            responsibility: data,
          };
          onUpdate([...defaultResponsibilities, newResponsibility]);
          toast.success(`Created and added: ${suggestion.name}`);
        }
      } catch (error) {
        console.error("Error creating responsibility:", error);
        toast.error("Failed to create responsibility");
      }
    }

    // Remove from suggestions
    setAiSuggestions(aiSuggestions.filter((s) => s.name !== suggestion.name));
  };

  const dismissSuggestion = (name: string) => {
    setAiSuggestions(aiSuggestions.filter((s) => s.name !== name));
  };

  const getResponsibilityDetails = (responsibilityId: string): Responsibility | undefined => {
    return responsibilities.find((r) => r.id === responsibilityId);
  };

  const availableResponsibilities = responsibilities.filter(
    (r) =>
      !defaultResponsibilities.some((dr) => dr.responsibility_id === r.id) &&
      r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header with Add and AI Suggest buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Responsibility
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[350px]" align="start">
              <Command>
                <CommandInput
                  placeholder="Search responsibilities..."
                  value={searchTerm}
                  onValueChange={setSearchTerm}
                />
                <CommandList>
                  <CommandEmpty>
                    {isLoadingResponsibilities ? "Loading..." : "No responsibilities found."}
                  </CommandEmpty>
                  <CommandGroup>
                    {availableResponsibilities.slice(0, 10).map((r) => (
                      <CommandItem
                        key={r.id}
                        onSelect={() => addResponsibility(r)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{r.name}</span>
                          {r.category && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${CATEGORY_COLORS[r.category] || ""}`}
                            >
                              {r.category.replace("_", " ")}
                            </Badge>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAISuggest}
            disabled={isGeneratingSuggestions || !familyName}
          >
            {isGeneratingSuggestions ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1" />
            )}
            AI Suggest
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Suggested Total:</span>
          <Badge
            variant={totalWeight > 100 ? "destructive" : totalWeight === 100 ? "default" : "secondary"}
          >
            {totalWeight}%
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[280px]">
                <p className="text-sm">
                  These are <strong>suggested weights</strong> that will be pre-populated when creating jobs in this family. Weights can be adjusted at the individual job level.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* AI Suggestions Panel */}
      {showSuggestions && aiSuggestions.length > 0 && (
        <div className="border rounded-lg p-4 bg-primary/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">AI Suggestions for {familyName}</span>
              <Badge variant="outline" className="text-xs">
                {aiSuggestions.length} suggestions
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestions(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
            {aiSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-3 bg-background rounded-md border hover:border-primary/50 transition-colors"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{suggestion.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs ${CATEGORY_COLORS[suggestion.category] || ""}`}
                    >
                      {suggestion.category.replace("_", " ")}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.suggestedWeight}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {suggestion.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-success border-success/30 hover:bg-success/10 hover:text-success"
                    onClick={() => acceptSuggestion(suggestion)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => dismissSuggestion(suggestion.name)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              Click "Add" to include a responsibility in the template
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                aiSuggestions.forEach((s) => acceptSuggestion(s));
              }}
            >
              Add All
            </Button>
          </div>
        </div>
      )}

      {/* Helper text */}
      <p className="text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-2">
        <Info className="h-3 w-3 inline mr-1" />
        Suggested weights serve as templates for new jobs in this family. They can be customized at the individual job level.
      </p>

      {/* Selected Responsibilities List */}
      {defaultResponsibilities.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
          <p className="text-sm">No default responsibilities configured</p>
          <p className="text-xs mt-1">
            Add responsibilities or use AI Suggest to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {defaultResponsibilities.map((dr) => {
            const details = dr.responsibility || getResponsibilityDetails(dr.responsibility_id);
            return (
              <div
                key={dr.responsibility_id}
                className="flex items-center gap-4 p-3 border rounded-lg bg-card"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {details?.name || "Unknown Responsibility"}
                    </span>
                    {details?.category && (
                      <Badge
                        variant="outline"
                        className={`text-xs ${CATEGORY_COLORS[details.category] || ""}`}
                      >
                        {details.category.replace("_", " ")}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-[220px]">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Suggested:</span>
                  <Slider
                    value={[dr.suggested_weight]}
                    onValueChange={(value) => updateWeight(dr.responsibility_id, value[0])}
                    min={5}
                    max={50}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-10 text-right">
                    {dr.suggested_weight}%
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeResponsibility(dr.responsibility_id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {totalWeight > 100 && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Total weight exceeds 100%. Consider reducing some weights.</span>
        </div>
      )}
    </div>
  );
}
