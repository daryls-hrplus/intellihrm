import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  MessageSquare,
  ChevronDown,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Loader2,
  Wand2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AI_CONTEXT_PRESETS, DocumentType, DOCUMENT_TYPE_LABELS } from "./TemplatePresetConfigs";

interface Instruction {
  id: string;
  template_id: string | null;
  instruction_type: string;
  instruction_key: string;
  instruction_value: string;
  priority_order: number;
  is_active: boolean;
}

interface TemplateInstructionsManagerProps {
  templateId?: string;
  templateType?: DocumentType;
  onInstructionsChange?: (instructions: Instruction[]) => void;
}

// Preset instruction bundles
const INSTRUCTION_PRESETS = {
  corporate: {
    name: "Corporate Standard",
    instructions: [
      { type: "tone", key: "voice", value: "Professional and formal" },
      { type: "audience", key: "level", value: "intermediate" },
      { type: "formatting", key: "headers", value: "Use numbered headers (1.0, 1.1, 1.2)" },
      { type: "terminology", key: "style", value: "Use industry-standard HR terminology" }
    ]
  },
  caribbean: {
    name: "Caribbean English",
    instructions: [
      { type: "tone", key: "voice", value: "Professional but approachable, using Caribbean English" },
      { type: "formatting", key: "compliance", value: "Include regional compliance notes where relevant" },
      { type: "terminology", key: "regional", value: "Use Caribbean-appropriate terminology (e.g., 'National Insurance' not 'Social Security')" }
    ]
  },
  technical: {
    name: "Technical Documentation",
    instructions: [
      { type: "tone", key: "voice", value: "Technical and precise" },
      { type: "audience", key: "level", value: "expert" },
      { type: "formatting", key: "code", value: "Include code examples where relevant" },
      { type: "content", key: "detail", value: "Include API references and technical specifications" }
    ]
  },
  concise: {
    name: "Quick Reference",
    instructions: [
      { type: "tone", key: "voice", value: "Brief and action-oriented" },
      { type: "formatting", key: "lists", value: "Use bullet points instead of paragraphs" },
      { type: "content", key: "length", value: "Keep each step under 2 sentences" }
    ]
  }
};

// Available instruction options per type
const INSTRUCTION_OPTIONS = {
  tone: {
    label: "Tone & Voice",
    options: [
      { key: "formal", label: "Formal & Professional" },
      { key: "conversational", label: "Conversational & Friendly" },
      { key: "technical", label: "Technical & Precise" },
      { key: "instructional", label: "Instructional & Supportive" }
    ]
  },
  audience: {
    label: "Target Audience",
    options: [
      { key: "beginner", label: "Beginner (no prior knowledge)" },
      { key: "intermediate", label: "Intermediate (some experience)" },
      { key: "expert", label: "Expert (advanced users)" },
      { key: "mixed", label: "Mixed audience levels" }
    ]
  },
  formatting: {
    label: "Formatting Rules",
    options: [
      { key: "numbered_steps", label: "Always use numbered steps" },
      { key: "screenshots", label: "Include screenshot after each major step" },
      { key: "callouts", label: "Use info/warning callouts for important notes" },
      { key: "max_steps", label: "Maximum 5 steps per section" },
      { key: "bullet_lists", label: "Prefer bullet points over paragraphs" }
    ]
  },
  terminology: {
    label: "Terminology",
    options: [
      { key: "employee_staff", label: 'Use "employee" not "staff"' },
      { key: "manager_supervisor", label: 'Use "manager" not "supervisor"' },
      { key: "hr_admin", label: 'Use "HR Administrator" for system admin references' },
      { key: "module_feature", label: 'Use "module" for main areas, "feature" for sub-functions' }
    ]
  },
  content: {
    label: "Content Rules",
    options: [
      { key: "prerequisites", label: "Always include prerequisites section" },
      { key: "learning_objectives", label: "Include learning objectives at start" },
      { key: "summary", label: "Include summary/recap at end" },
      { key: "next_steps", label: 'Include "Next Steps" section' },
      { key: "troubleshooting", label: "Include troubleshooting tips" }
    ]
  }
};

export function TemplateInstructionsManager({
  templateId,
  templateType,
  onInstructionsChange
}: TemplateInstructionsManagerProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({
    tone: [],
    audience: [],
    formatting: [],
    terminology: [],
    content: []
  });
  const [customInstructions, setCustomInstructions] = useState("");
  const [expandedSections, setExpandedSections] = useState<string[]>(["tone", "formatting"]);
  
  const queryClient = useQueryClient();

  // Fetch saved instructions
  const { data: savedInstructions = [], isLoading } = useQuery({
    queryKey: ['enablement-instructions', templateId],
    queryFn: async () => {
      const query = supabase
        .from('enablement_template_instructions')
        .select('*')
        .order('priority_order', { ascending: true });
      
      if (templateId) {
        query.eq('template_id', templateId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Instruction[];
    }
  });

  // Load saved instructions into state
  useEffect(() => {
    if (savedInstructions.length > 0) {
      const options: Record<string, string[]> = {
        tone: [],
        audience: [],
        formatting: [],
        terminology: [],
        content: []
      };

      savedInstructions.forEach(inst => {
        if (options[inst.instruction_type]) {
          options[inst.instruction_type].push(inst.instruction_key);
        }
        if (inst.instruction_type === 'custom') {
          setCustomInstructions(inst.instruction_value);
        }
      });

      setSelectedOptions(options);
    }
  }, [savedInstructions]);

  // Save instructions mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Delete existing instructions for this template
      if (templateId) {
        await supabase
          .from('enablement_template_instructions')
          .delete()
          .eq('template_id', templateId);
      }

      // Build instruction records
      const instructions: Array<{
        template_id: string | null;
        instruction_type: string;
        instruction_key: string;
        instruction_value: string;
        priority_order: number;
        created_by: string;
      }> = [];

      let priority = 0;

      // Add selected options
      Object.entries(selectedOptions).forEach(([type, keys]) => {
        keys.forEach(key => {
          const option = INSTRUCTION_OPTIONS[type as keyof typeof INSTRUCTION_OPTIONS]?.options.find(o => o.key === key);
          if (option) {
            instructions.push({
              template_id: templateId || null,
              instruction_type: type,
              instruction_key: key,
              instruction_value: option.label,
              priority_order: priority++,
              created_by: user.id
            });
          }
        });
      });

      // Add custom instructions
      if (customInstructions.trim()) {
        instructions.push({
          template_id: templateId || null,
          instruction_type: 'custom',
          instruction_key: 'custom_text',
          instruction_value: customInstructions,
          priority_order: priority++,
          created_by: user.id
        });
      }

      if (instructions.length > 0) {
        const { error } = await supabase
          .from('enablement_template_instructions')
          .insert(instructions);

        if (error) throw error;
      }

      return instructions;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enablement-instructions'] });
      toast.success("Instructions saved");
    },
    onError: (error) => {
      toast.error("Failed to save instructions: " + error.message);
    }
  });

  const handlePresetSelect = (presetKey: string) => {
    const preset = INSTRUCTION_PRESETS[presetKey as keyof typeof INSTRUCTION_PRESETS];
    if (!preset) return;

    setSelectedPreset(presetKey);
    
    // Apply preset instructions
    const newOptions: Record<string, string[]> = {
      tone: [],
      audience: [],
      formatting: [],
      terminology: [],
      content: []
    };

    preset.instructions.forEach(inst => {
      if (newOptions[inst.type]) {
        newOptions[inst.type].push(inst.key);
      }
    });

    setSelectedOptions(newOptions);
    toast.success(`Applied "${preset.name}" preset`);
  };

  const handleOptionToggle = (type: string, key: string) => {
    setSelectedOptions(prev => {
      const current = prev[type] || [];
      const isSelected = current.includes(key);
      
      return {
        ...prev,
        [type]: isSelected 
          ? current.filter(k => k !== key)
          : [...current, key]
      };
    });
    setSelectedPreset(null); // Clear preset when manually editing
  };

  const handleReset = () => {
    setSelectedOptions({
      tone: [],
      audience: [],
      formatting: [],
      terminology: [],
      content: []
    });
    setCustomInstructions("");
    setSelectedPreset(null);
    toast.info("Instructions reset");
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getTotalSelectedCount = () => {
    return Object.values(selectedOptions).flat().length + (customInstructions.trim() ? 1 : 0);
  };

  const handleLoadAIContextPreset = (type: DocumentType) => {
    const preset = AI_CONTEXT_PRESETS[type];
    if (preset) {
      setCustomInstructions(preset);
      toast.success(`Loaded ${DOCUMENT_TYPE_LABELS[type]} AI context preset`);
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Context Preset Loader */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Load Industry-Aligned AI Context</Label>
        <div className="flex gap-2">
          <Select onValueChange={(value) => handleLoadAIContextPreset(value as DocumentType)}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select document type preset..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => templateType && handleLoadAIContextPreset(templateType)}
            disabled={!templateType}
            title="Load preset for current template type"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Load industry-standard AI instructions based on document type (Workday, SAP, ISO standards)
        </p>
      </div>

      <Separator />

      {/* Presets */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Quick Presets</Label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(INSTRUCTION_PRESETS).map(([key, preset]) => (
            <Button
              key={key}
              variant={selectedPreset === key ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetSelect(key)}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Instruction Categories */}
      <ScrollArea className="h-[300px]">
        <div className="space-y-3 pr-4">
          {Object.entries(INSTRUCTION_OPTIONS).map(([type, config]) => (
            <Collapsible
              key={type}
              open={expandedSections.includes(type)}
              onOpenChange={() => toggleSection(type)}
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{config.label}</span>
                    {selectedOptions[type]?.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedOptions[type].length} selected
                      </Badge>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${
                    expandedSections.includes(type) ? 'rotate-180' : ''
                  }`} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 pl-4">
                <div className="space-y-2">
                  {config.options.map((option) => (
                    <div key={option.key} className="flex items-center gap-2">
                      <Checkbox
                        id={`${type}-${option.key}`}
                        checked={selectedOptions[type]?.includes(option.key) || false}
                        onCheckedChange={() => handleOptionToggle(type, option.key)}
                      />
                      <Label
                        htmlFor={`${type}-${option.key}`}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>

      <Separator />

      {/* Custom Instructions */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Custom Instructions</Label>
        <Textarea
          placeholder="Add any additional instructions for the AI (e.g., specific phrases to use, content to always include, etc.)"
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          rows={4}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-muted-foreground">
          {getTotalSelectedCount()} instruction(s) configured
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Instructions
          </Button>
        </div>
      </div>
    </div>
  );
}
