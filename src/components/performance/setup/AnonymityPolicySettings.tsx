import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, Lock, AlertTriangle, Save, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export type IndividualAccessPolicy = 'never' | 'investigation_only';

export interface AnonymityPolicy {
  individual_response_access: IndividualAccessPolicy;
  allow_investigation_mode: boolean;
  minimum_responses_for_breakdown: number;
  minimum_responses_for_scores: number;
  investigation_approver_role: string;
  investigation_max_duration_days: number;
  require_legal_reference: boolean;
}

const DEFAULT_POLICY: AnonymityPolicy = {
  individual_response_access: 'never',
  allow_investigation_mode: true,
  minimum_responses_for_breakdown: 3,
  minimum_responses_for_scores: 2,
  investigation_approver_role: 'hr_director',
  investigation_max_duration_days: 7,
  require_legal_reference: false,
};

interface AnonymityPolicySettingsProps {
  companyId: string;
}

export function AnonymityPolicySettings({ companyId }: AnonymityPolicySettingsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [policy, setPolicy] = useState<AnonymityPolicy>(DEFAULT_POLICY);

  useEffect(() => {
    if (companyId) {
      loadPolicy();
    }
  }, [companyId]);

  const loadPolicy = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('feedback_360_anonymity_policy')
        .eq('id', companyId)
        .single();

      if (error) throw error;
      
      if (data?.feedback_360_anonymity_policy && typeof data.feedback_360_anonymity_policy === 'object') {
        const policyData = data.feedback_360_anonymity_policy as Record<string, unknown>;
        setPolicy({
          individual_response_access: (policyData.individual_response_access as IndividualAccessPolicy) || DEFAULT_POLICY.individual_response_access,
          allow_investigation_mode: (policyData.allow_investigation_mode as boolean) ?? DEFAULT_POLICY.allow_investigation_mode,
          minimum_responses_for_breakdown: (policyData.minimum_responses_for_breakdown as number) || DEFAULT_POLICY.minimum_responses_for_breakdown,
          minimum_responses_for_scores: (policyData.minimum_responses_for_scores as number) || DEFAULT_POLICY.minimum_responses_for_scores,
          investigation_approver_role: (policyData.investigation_approver_role as string) || DEFAULT_POLICY.investigation_approver_role,
          investigation_max_duration_days: (policyData.investigation_max_duration_days as number) || DEFAULT_POLICY.investigation_max_duration_days,
          require_legal_reference: (policyData.require_legal_reference as boolean) ?? DEFAULT_POLICY.require_legal_reference,
        });
      }
    } catch (error) {
      console.error("Error loading anonymity policy:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const policyToSave = {
        individual_response_access: policy.individual_response_access,
        allow_investigation_mode: policy.allow_investigation_mode,
        minimum_responses_for_breakdown: policy.minimum_responses_for_breakdown,
        minimum_responses_for_scores: policy.minimum_responses_for_scores,
        investigation_approver_role: policy.investigation_approver_role,
        investigation_max_duration_days: policy.investigation_max_duration_days,
        require_legal_reference: policy.require_legal_reference,
      };
      
      const { error } = await supabase
        .from('companies')
        .update({ feedback_360_anonymity_policy: policyToSave })
        .eq('id', companyId);

      if (error) throw error;
      
      toast.success("Anonymity policy saved");
    } catch (error) {
      console.error("Error saving anonymity policy:", error);
      toast.error("Failed to save policy");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">360° Feedback Anonymity Policy</CardTitle>
        </div>
        <CardDescription>
          Configure organization-wide policies for feedback confidentiality and individual response access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Individual Response Access Policy */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Individual Response Access</Label>
          </div>

          <RadioGroup
            value={policy.individual_response_access}
            onValueChange={(val) => setPolicy({ ...policy, individual_response_access: val as IndividualAccessPolicy })}
            className="space-y-2"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
              <RadioGroupItem value="never" id="never" />
              <div className="flex-1">
                <Label htmlFor="never" className="font-medium cursor-pointer flex items-center gap-2">
                  Never
                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Individual responses are never visible. Maximum anonymity protection.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
              <RadioGroupItem value="investigation_only" id="investigation_only" />
              <div className="flex-1">
                <Label htmlFor="investigation_only" className="font-medium cursor-pointer">
                  Investigation Mode Only
                </Label>
                <p className="text-sm text-muted-foreground">
                  Requires formal request and HR Director approval. All access is logged.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Minimum Response Thresholds */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Minimum Response Thresholds</Label>
          </div>
          <p className="text-xs text-muted-foreground -mt-2">
            Prevent identification in small groups by requiring minimum response counts
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">For Reviewer Category Breakdown</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={2}
                  max={10}
                  value={policy.minimum_responses_for_breakdown}
                  onChange={(e) => setPolicy({ ...policy, minimum_responses_for_breakdown: parseInt(e.target.value) || 3 })}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">responses minimum</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">For Aggregate Scores</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={policy.minimum_responses_for_scores}
                  onChange={(e) => setPolicy({ ...policy, minimum_responses_for_scores: parseInt(e.target.value) || 2 })}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">responses minimum</span>
              </div>
            </div>
          </div>
        </div>

        {/* Investigation Mode Settings */}
        {policy.individual_response_access === 'investigation_only' && (
          <div className="space-y-4 p-4 rounded-lg border bg-muted/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <Label className="text-sm font-medium">Investigation Mode Settings</Label>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm">Approver Role</Label>
                <Select 
                  value={policy.investigation_approver_role}
                  onValueChange={(val) => setPolicy({ ...policy, investigation_approver_role: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr_director">HR Director</SelectItem>
                    <SelectItem value="hr_manager">HR Manager</SelectItem>
                    <SelectItem value="chief_people_officer">Chief People Officer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Max Access Duration</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={policy.investigation_max_duration_days}
                    onChange={(e) => setPolicy({ ...policy, investigation_max_duration_days: parseInt(e.target.value) || 7 })}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-background">
              <div>
                <Label className="text-sm font-medium">Require Legal Reference</Label>
                <p className="text-xs text-muted-foreground">
                  Require case/ticket number for investigation requests
                </p>
              </div>
              <Switch
                checked={policy.require_legal_reference}
                onCheckedChange={(checked) => setPolicy({ ...policy, require_legal_reference: checked })}
              />
            </div>
          </div>
        )}

        <Alert className="bg-info/10 border-info/30">
          <Shield className="h-4 w-4 text-info" />
          <AlertDescription className="text-sm">
            This policy applies to all 360° feedback cycles. Individual cycle configurations will inherit these settings 
            and cannot override them. Changes take effect immediately for new and existing cycles.
          </AlertDescription>
        </Alert>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Policy"}
        </Button>
      </CardContent>
    </Card>
  );
}
