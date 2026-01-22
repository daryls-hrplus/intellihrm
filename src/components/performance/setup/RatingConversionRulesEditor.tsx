import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, TrendingUp, TrendingDown, Minus, Info, RotateCcw, ArrowRightLeft } from "lucide-react";
import type { ConversionRule, ConversionRuleSet } from "@/hooks/useRatingScale";
import type { Json } from "@/integrations/supabase/types";

// Database row type for conversion rules
interface ConversionRulesRow {
  id: string;
  company_id: string | null;
  name: string;
  description: string | null;
  rules: Json;
  is_default: boolean | null;
  is_active: boolean | null;
  rating_scale_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface RatingConversionRulesEditorProps {
  companyId: string;
  onSave?: () => void;
}

const DEFAULT_RULES: ConversionRule[] = [
  { performance_rating: 5, proficiency_change: 1, condition: "if_below_max", label: "Exceptional - Proficiency Increased" },
  { performance_rating: 4, proficiency_change: 1, condition: "if_below_max", label: "Exceeds Expectations - May Increase" },
  { performance_rating: 3, proficiency_change: 0, condition: "maintain", label: "Meets Expectations - Maintained" },
  { performance_rating: 2, proficiency_change: 0, condition: "maintain", label: "Needs Improvement - Maintained" },
  { performance_rating: 1, proficiency_change: -1, condition: "if_above_min", label: "Unsatisfactory - May Decrease" },
];

const CONDITION_OPTIONS: { value: ConversionRule["condition"]; label: string; description: string }[] = [
  { value: "if_below_max", label: "If Below Max", description: "Apply only if current level is below 5 (Expert)" },
  { value: "if_above_min", label: "If Above Min", description: "Apply only if current level is above 1 (Novice)" },
  { value: "maintain", label: "Maintain", description: "Keep current proficiency level unchanged" },
  { value: "always", label: "Always Apply", description: "Apply regardless of current level (capped at 1-5)" },
];

const PROFICIENCY_LABELS: Record<number, string> = {
  1: "Novice",
  2: "Developing",
  3: "Proficient",
  4: "Advanced",
  5: "Expert",
};

export function RatingConversionRulesEditor({ companyId, onSave }: RatingConversionRulesEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ruleSet, setRuleSet] = useState<ConversionRuleSet | null>(null);
  const [rules, setRules] = useState<ConversionRule[]>(DEFAULT_RULES);
  const [name, setName] = useState("Company Conversion Rules");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (companyId) {
      fetchRules();
    }
  }, [companyId]);

  const fetchRules = async () => {
    setLoading(true);
    try {
      // Use raw SQL query via RPC to avoid type issues with this newer table
      const { data, error } = await supabase.rpc('get_conversion_rules_by_company' as any, {
        p_company_id: companyId
      }).maybeSingle();

      if (error) {
        // Fallback: try direct query
        const { data: directData, error: directError } = await supabase
          .from("rating_proficiency_conversion_rules" as any)
          .select("id, name, description, rules, is_default, is_active, company_id")
          .eq("company_id", companyId)
          .maybeSingle() as { data: any; error: any };

        if (directError && directError.code !== "PGRST116") throw directError;
        
        if (directData) {
          const companyRules = directData;
          setRuleSet({
            id: companyRules.id,
            name: companyRules.name,
            description: companyRules.description,
            rules: Array.isArray(companyRules.rules) 
              ? companyRules.rules as ConversionRule[] 
              : DEFAULT_RULES,
            is_default: companyRules.is_default || false,
            is_active: companyRules.is_active ?? true,
          });
          setName(companyRules.name);
          setDescription(companyRules.description || "");
          setRules(
            Array.isArray(companyRules.rules) 
              ? companyRules.rules as ConversionRule[] 
              : DEFAULT_RULES
          );
          setIsActive(companyRules.is_active ?? true);
        } else {
          setRuleSet(null);
          setRules(DEFAULT_RULES);
          setName("Company Conversion Rules");
          setDescription("");
          setIsActive(true);
        }
        return;
      }

      const rpcData = data as any;
      if (rpcData) {
        setRuleSet(rpcData);
        setName(rpcData.name);
        setDescription(rpcData.description || "");
        setRules(Array.isArray(rpcData.rules) ? rpcData.rules : DEFAULT_RULES);
        setIsActive(rpcData.is_active ?? true);
      } else {
        setRuleSet(null);
        setRules(DEFAULT_RULES);
      }
    } catch (error) {
      console.error("Error fetching conversion rules:", error);
      toast.error("Failed to load conversion rules");
    } finally {
      setLoading(false);
    }
  };

  const updateRule = (index: number, field: keyof ConversionRule, value: any) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    setRules(DEFAULT_RULES);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ruleData = {
        company_id: companyId,
        name,
        description: description || null,
        rules: JSON.parse(JSON.stringify(rules)),
        is_active: isActive,
        is_default: false,
      };

      if (ruleSet?.id) {
        // Update existing
        const { error } = await supabase
          .from("rating_proficiency_conversion_rules" as any)
          .update(ruleData)
          .eq("id", ruleSet.id);
        
        if (error) throw error;
        toast.success("Conversion rules updated");
      } else {
        // Insert new
        const { error } = await supabase
          .from("rating_proficiency_conversion_rules" as any)
          .insert(ruleData);
        
        if (error) throw error;
        toast.success("Conversion rules created");
      }

      setHasChanges(false);
      onSave?.();
      fetchRules(); // Refresh to get the ID
    } catch (error) {
      console.error("Error saving conversion rules:", error);
      toast.error("Failed to save conversion rules");
    } finally {
      setSaving(false);
    }
  };

  const getProficiencyChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-success" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getProficiencyChangeBadge = (change: number) => {
    if (change > 0) return <Badge variant="default" className="bg-success/10 text-success border-success/20">+{change}</Badge>;
    if (change < 0) return <Badge variant="default" className="bg-destructive/10 text-destructive border-destructive/20">{change}</Badge>;
    return <Badge variant="secondary">0</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Proficiency Conversion Rules</CardTitle>
              <CardDescription>
                Define how performance ratings translate to competency proficiency level changes
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="active-switch" className="text-sm text-muted-foreground">Active</Label>
            <Switch 
              id="active-switch"
              checked={isActive} 
              onCheckedChange={(v) => { setIsActive(v); setHasChanges(true); }} 
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info Alert */}
        <Alert className="bg-info/5 border-info/20">
          <Info className="h-4 w-4 text-info" />
          <AlertDescription className="text-sm">
            These rules determine how employee performance ratings affect their competency proficiency levels. 
            After an appraisal is finalized, the system uses these rules to update the Skills Gap Tracker.
          </AlertDescription>
        </Alert>

        {/* Name and Description */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rule-name">Rule Set Name</Label>
            <Input
              id="rule-name"
              value={name}
              onChange={(e) => { setName(e.target.value); setHasChanges(true); }}
              placeholder="Company Conversion Rules"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rule-desc">Description (optional)</Label>
            <Input
              id="rule-desc"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setHasChanges(true); }}
              placeholder="Company-specific conversion rules"
            />
          </div>
        </div>

        {/* Rules Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-24">Rating</TableHead>
                <TableHead>Label</TableHead>
                <TableHead className="w-32">Change</TableHead>
                <TableHead className="w-48">Condition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.sort((a, b) => b.performance_rating - a.performance_rating).map((rule, index) => (
                <TableRow key={rule.performance_rating}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="min-w-[28px] justify-center font-medium">
                        {rule.performance_rating}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={rule.label}
                      onChange={(e) => updateRule(index, "label", e.target.value)}
                      className="h-8"
                      placeholder="Rule label"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getProficiencyChangeIcon(rule.proficiency_change)}
                      <Select
                        value={String(rule.proficiency_change)}
                        onValueChange={(v) => updateRule(index, "proficiency_change", parseInt(v))}
                      >
                        <SelectTrigger className="h-8 w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">+1</SelectItem>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="-1">-1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={rule.condition}
                      onValueChange={(v) => updateRule(index, "condition", v as ConversionRule["condition"])}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex flex-col">
                              <span>{opt.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Proficiency Scale Reference */}
        <div className="p-4 bg-muted/30 rounded-lg border">
          <p className="text-sm font-medium mb-2">Proficiency Scale Reference (Dreyfus Model)</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PROFICIENCY_LABELS).map(([level, label]) => (
              <Badge key={level} variant="outline" className="text-xs">
                L{level}: {label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={saving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Rules
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
