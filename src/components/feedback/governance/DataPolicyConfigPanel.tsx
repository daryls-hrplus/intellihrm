import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Shield, 
  Clock, 
  Eye, 
  Brain, 
  Users,
  Database,
  Share2,
  Plus,
  CheckCircle
} from "lucide-react";
import { useFeedbackGovernance, type PolicyType } from "@/hooks/useFeedbackGovernance";
import { format } from "date-fns";

interface DataPolicyConfigPanelProps {
  companyId: string;
  onPolicyCreated?: () => void;
}

interface PolicyFormState {
  retentionDays: number;
  anonymizationThreshold: number;
  aiUsageEnabled: boolean;
  aiModels: string[];
  externalAccessEnabled: boolean;
  externalAccessDuration: number;
  signalAggregationEnabled: boolean;
  minGroupSizeForAggregation: number;
  crossModuleSharingEnabled: boolean;
  allowedModules: string[];
}

const DEFAULT_POLICY_STATE: PolicyFormState = {
  retentionDays: 365,
  anonymizationThreshold: 5,
  aiUsageEnabled: true,
  aiModels: ['gemini-2.5-flash'],
  externalAccessEnabled: false,
  externalAccessDuration: 30,
  signalAggregationEnabled: true,
  minGroupSizeForAggregation: 5,
  crossModuleSharingEnabled: true,
  allowedModules: ['succession', 'talent_pool', 'nine_box']
};

const AVAILABLE_MODULES = [
  { value: 'succession', label: 'Succession Planning' },
  { value: 'talent_pool', label: 'Talent Pools' },
  { value: 'nine_box', label: '9-Box Assessment' },
  { value: 'appraisals', label: 'Performance Appraisals' },
  { value: 'learning', label: 'Learning & Development' },
  { value: 'compensation', label: 'Compensation' }
];

const AI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'gpt-5-mini', label: 'GPT-5 Mini' }
];

export function DataPolicyConfigPanel({ companyId, onPolicyCreated }: DataPolicyConfigPanelProps) {
  const { policies, loading, fetchPolicies, createPolicy } = useFeedbackGovernance(companyId);
  const [formState, setFormState] = useState<PolicyFormState>(DEFAULT_POLICY_STATE);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("retention");

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  useEffect(() => {
    // Load existing policies into form state
    policies.forEach(policy => {
      const config = policy.policy_config as Record<string, any>;
      switch (policy.policy_type) {
        case 'retention':
          setFormState(prev => ({ ...prev, retentionDays: config.days || 365 }));
          break;
        case 'anonymization':
          setFormState(prev => ({ ...prev, anonymizationThreshold: config.threshold || 5 }));
          break;
        case 'ai_usage':
          setFormState(prev => ({ 
            ...prev, 
            aiUsageEnabled: config.enabled ?? true,
            aiModels: config.models || ['gemini-2.5-flash']
          }));
          break;
        case 'external_access':
          setFormState(prev => ({ 
            ...prev, 
            externalAccessEnabled: config.enabled ?? false,
            externalAccessDuration: config.duration || 30
          }));
          break;
        case 'signal_aggregation':
          setFormState(prev => ({ 
            ...prev, 
            signalAggregationEnabled: config.enabled ?? true,
            minGroupSizeForAggregation: config.minGroupSize || 5
          }));
          break;
        case 'cross_module_sharing':
          setFormState(prev => ({ 
            ...prev, 
            crossModuleSharingEnabled: config.enabled ?? true,
            allowedModules: config.modules || []
          }));
          break;
      }
    });
  }, [policies]);

  const handleSavePolicy = async (policyType: PolicyType, config: Record<string, any>) => {
    setSaving(true);
    try {
      await createPolicy(policyType, config, new Date().toISOString().split('T')[0]);
      onPolicyCreated?.();
    } finally {
      setSaving(false);
    }
  };

  const getPolicyStatus = (policyType: PolicyType) => {
    const policy = policies.find(p => p.policy_type === policyType && p.is_active);
    if (policy) {
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active since {format(new Date(policy.effective_from), "MMM d, yyyy")}
        </Badge>
      );
    }
    return <Badge variant="outline">Not configured</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">Data Policies</CardTitle>
            <CardDescription>Configure data handling policies for 360 feedback</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-4">
            <TabsTrigger value="retention" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Retention
            </TabsTrigger>
            <TabsTrigger value="anonymization" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Anonymity
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              AI Usage
            </TabsTrigger>
            <TabsTrigger value="external" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              External
            </TabsTrigger>
            <TabsTrigger value="aggregation" className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              Aggregation
            </TabsTrigger>
            <TabsTrigger value="sharing" className="text-xs">
              <Share2 className="h-3 w-3 mr-1" />
              Sharing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="retention" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Data Retention Policy</h4>
              {getPolicyStatus('retention')}
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="retentionDays">Retention Period (days)</Label>
                <Input
                  id="retentionDays"
                  type="number"
                  value={formState.retentionDays}
                  onChange={(e) => setFormState(prev => ({ ...prev, retentionDays: parseInt(e.target.value) || 365 }))}
                  min={30}
                  max={2555}
                />
                <p className="text-xs text-muted-foreground">
                  Raw feedback data will be retained for this period. After expiry, data will be anonymized.
                </p>
              </div>
              <Button 
                onClick={() => handleSavePolicy('retention', { days: formState.retentionDays })}
                disabled={saving || loading}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Save Retention Policy
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="anonymization" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Anonymization Policy</h4>
              {getPolicyStatus('anonymization')}
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="anonThreshold">Minimum Responses for Attribution</Label>
                <Input
                  id="anonThreshold"
                  type="number"
                  value={formState.anonymizationThreshold}
                  onChange={(e) => setFormState(prev => ({ ...prev, anonymizationThreshold: parseInt(e.target.value) || 5 }))}
                  min={3}
                  max={10}
                />
                <p className="text-xs text-muted-foreground">
                  Rater category breakdown only shown when this threshold is met (k-anonymity).
                </p>
              </div>
              <Button 
                onClick={() => handleSavePolicy('anonymization', { threshold: formState.anonymizationThreshold })}
                disabled={saving || loading}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Save Anonymization Policy
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">AI Usage Policy</h4>
              {getPolicyStatus('ai_usage')}
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable AI Analysis</Label>
                  <p className="text-xs text-muted-foreground">Allow AI to analyze feedback for themes and bias</p>
                </div>
                <Switch
                  checked={formState.aiUsageEnabled}
                  onCheckedChange={(checked) => setFormState(prev => ({ ...prev, aiUsageEnabled: checked }))}
                />
              </div>
              {formState.aiUsageEnabled && (
                <div className="space-y-2">
                  <Label>Approved AI Models</Label>
                  <Select
                    value={formState.aiModels[0]}
                    onValueChange={(value) => setFormState(prev => ({ ...prev, aiModels: [value] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_MODELS.map(model => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button 
                onClick={() => handleSavePolicy('ai_usage', { 
                  enabled: formState.aiUsageEnabled,
                  models: formState.aiModels
                })}
                disabled={saving || loading}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Save AI Policy
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="external" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">External Access Policy</h4>
              {getPolicyStatus('external_access')}
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow External Raters</Label>
                  <p className="text-xs text-muted-foreground">Enable feedback from customers, vendors, partners</p>
                </div>
                <Switch
                  checked={formState.externalAccessEnabled}
                  onCheckedChange={(checked) => setFormState(prev => ({ ...prev, externalAccessEnabled: checked }))}
                />
              </div>
              {formState.externalAccessEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="externalDuration">Access Token Duration (days)</Label>
                  <Input
                    id="externalDuration"
                    type="number"
                    value={formState.externalAccessDuration}
                    onChange={(e) => setFormState(prev => ({ ...prev, externalAccessDuration: parseInt(e.target.value) || 30 }))}
                    min={7}
                    max={90}
                  />
                </div>
              )}
              <Button 
                onClick={() => handleSavePolicy('external_access', { 
                  enabled: formState.externalAccessEnabled,
                  duration: formState.externalAccessDuration
                })}
                disabled={saving || loading}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Save External Policy
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="aggregation" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Signal Aggregation Policy</h4>
              {getPolicyStatus('signal_aggregation')}
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Signal Aggregation</Label>
                  <p className="text-xs text-muted-foreground">Generate talent signals from feedback</p>
                </div>
                <Switch
                  checked={formState.signalAggregationEnabled}
                  onCheckedChange={(checked) => setFormState(prev => ({ ...prev, signalAggregationEnabled: checked }))}
                />
              </div>
              {formState.signalAggregationEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="minGroupSize">Minimum Group Size for Org Aggregates</Label>
                  <Input
                    id="minGroupSize"
                    type="number"
                    value={formState.minGroupSizeForAggregation}
                    onChange={(e) => setFormState(prev => ({ ...prev, minGroupSizeForAggregation: parseInt(e.target.value) || 5 }))}
                    min={3}
                    max={20}
                  />
                  <p className="text-xs text-muted-foreground">
                    Organization-level aggregates only shown when group exceeds this size.
                  </p>
                </div>
              )}
              <Button 
                onClick={() => handleSavePolicy('signal_aggregation', { 
                  enabled: formState.signalAggregationEnabled,
                  minGroupSize: formState.minGroupSizeForAggregation
                })}
                disabled={saving || loading}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Save Aggregation Policy
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sharing" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Cross-Module Sharing Policy</h4>
              {getPolicyStatus('cross_module_sharing')}
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Cross-Module Sharing</Label>
                  <p className="text-xs text-muted-foreground">Allow signals to flow to other talent modules</p>
                </div>
                <Switch
                  checked={formState.crossModuleSharingEnabled}
                  onCheckedChange={(checked) => setFormState(prev => ({ ...prev, crossModuleSharingEnabled: checked }))}
                />
              </div>
              {formState.crossModuleSharingEnabled && (
                <div className="space-y-2">
                  <Label>Allowed Modules</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_MODULES.map(module => (
                      <label key={module.value} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formState.allowedModules.includes(module.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormState(prev => ({ 
                                ...prev, 
                                allowedModules: [...prev.allowedModules, module.value] 
                              }));
                            } else {
                              setFormState(prev => ({ 
                                ...prev, 
                                allowedModules: prev.allowedModules.filter(m => m !== module.value) 
                              }));
                            }
                          }}
                          className="rounded border-input"
                        />
                        {module.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <Button 
                onClick={() => handleSavePolicy('cross_module_sharing', { 
                  enabled: formState.crossModuleSharingEnabled,
                  modules: formState.allowedModules
                })}
                disabled={saving || loading}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Save Sharing Policy
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
