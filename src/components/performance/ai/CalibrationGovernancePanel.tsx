import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Settings, 
  AlertTriangle,
  Check,
  X,
  Plus,
  Edit2,
  Trash2,
  FileText,
  History,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface GovernanceRule {
  id: string;
  ruleName: string;
  ruleType: 'recalibration_permission' | 'change_limit' | 'justification_required' | 'approval_required';
  conditionConfig: {
    roleRequired?: string[];
    maxChangePercent?: number;
    requiresJustification?: boolean;
    requiresApproval?: boolean;
    approverRole?: string;
  };
  isActive: boolean;
}

interface OverrideAudit {
  id: string;
  sessionId: string;
  overrideType: string;
  originalValue: string;
  newValue: string;
  justification: string;
  justificationCategory: string;
  overrideBy: string;
  overrideByName?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  createdAt: string;
}

interface CalibrationGovernancePanelProps {
  companyId: string;
  sessionId?: string;
  isAdmin?: boolean;
  className?: string;
}

const ruleTypeLabels: Record<GovernanceRule['ruleType'], { label: string; description: string }> = {
  recalibration_permission: {
    label: 'Recalibration Permission',
    description: 'Controls who can make calibration changes',
  },
  change_limit: {
    label: 'Change Limit',
    description: 'Maximum allowed change from original score',
  },
  justification_required: {
    label: 'Justification Required',
    description: 'Requires written justification for changes',
  },
  approval_required: {
    label: 'Approval Required',
    description: 'Changes require approval workflow',
  },
};

const justificationCategories = [
  { value: 'business_context', label: 'Business Context' },
  { value: 'data_correction', label: 'Data Correction' },
  { value: 'manager_input', label: 'Manager Input' },
  { value: 'calibration_discussion', label: 'Calibration Discussion' },
  { value: 'other', label: 'Other' },
];

export function CalibrationGovernancePanel({
  companyId,
  sessionId,
  isAdmin = false,
  className,
}: CalibrationGovernancePanelProps) {
  const [rules, setRules] = useState<GovernanceRule[]>([]);
  const [audits, setAudits] = useState<OverrideAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<GovernanceRule | null>(null);
  const [showAuditDetails, setShowAuditDetails] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchRules();
    if (sessionId) {
      fetchAudits();
    }
  }, [companyId, sessionId]);

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('calibration_governance_rules')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRules((data || []).map(r => ({
        id: r.id,
        ruleName: r.rule_name,
        ruleType: r.rule_type as GovernanceRule['ruleType'],
        conditionConfig: r.condition_config as GovernanceRule['conditionConfig'],
        isActive: r.is_active,
      })));
    } catch (err) {
      console.error('Error fetching rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAudits = async () => {
    if (!sessionId) return;
    
    try {
      const { data, error } = await supabase
        .from('calibration_override_audit')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAudits((data || []).map(a => ({
        id: a.id,
        sessionId: a.session_id,
        overrideType: a.override_type,
        originalValue: a.original_value,
        newValue: a.new_value,
        justification: a.justification,
        justificationCategory: a.justification_category || 'other',
        overrideBy: a.override_by,
        approvalStatus: a.approval_status as OverrideAudit['approvalStatus'],
        approvedBy: a.approved_by || undefined,
        createdAt: a.created_at,
      })));
    } catch (err) {
      console.error('Error fetching audits:', err);
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('calibration_governance_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);

      if (error) throw error;

      setRules(prev => prev.map(r => r.id === ruleId ? { ...r, isActive } : r));
      toast({
        title: isActive ? 'Rule Enabled' : 'Rule Disabled',
        description: `The governance rule has been ${isActive ? 'enabled' : 'disabled'}.`,
      });
    } catch (err) {
      console.error('Error toggling rule:', err);
      toast({
        title: 'Error',
        description: 'Failed to update rule status.',
        variant: 'destructive',
      });
    }
  };

  const handleApproveAudit = async (auditId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('calibration_override_audit')
        .update({ 
          approval_status: approved ? 'approved' : 'rejected',
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', auditId);

      if (error) throw error;

      setAudits(prev => prev.map(a => 
        a.id === auditId 
          ? { ...a, approvalStatus: approved ? 'approved' : 'rejected' } 
          : a
      ));
      
      toast({
        title: approved ? 'Override Approved' : 'Override Rejected',
        description: `The calibration override has been ${approved ? 'approved' : 'rejected'}.`,
      });
    } catch (err) {
      console.error('Error updating audit:', err);
      toast({
        title: 'Error',
        description: 'Failed to update approval status.',
        variant: 'destructive',
      });
    }
  };

  const pendingApprovals = audits.filter(a => a.approvalStatus === 'pending');

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Calibration Governance</CardTitle>
          </div>
          {pendingApprovals.length > 0 && (
            <Badge variant="destructive">
              {pendingApprovals.length} Pending Approval{pendingApprovals.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <CardDescription>
          Manage calibration rules, permissions, and audit trail
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="rules">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rules">
              <Settings className="h-4 w-4 mr-2" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="audit">
              <History className="h-4 w-4 mr-2" />
              Audit Trail
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="mt-4 space-y-3">
            {isAdmin && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  setEditingRule(null);
                  setShowRuleDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            )}

            {rules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No governance rules configured</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {rules.map((rule) => {
                    const typeInfo = ruleTypeLabels[rule.ruleType];
                    return (
                      <div 
                        key={rule.id}
                        className={cn(
                          "p-4 rounded-lg border",
                          rule.isActive ? "bg-background" : "bg-muted/30 opacity-60"
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{rule.ruleName}</span>
                              <Badge variant="outline" className="text-xs">
                                {typeInfo.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {typeInfo.description}
                            </p>
                          </div>
                          {isAdmin && (
                            <Switch
                              checked={rule.isActive}
                              onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                            />
                          )}
                        </div>

                        {rule.conditionConfig && (
                          <div className="mt-2 p-2 rounded bg-muted/50 text-xs space-y-1">
                            {rule.conditionConfig.roleRequired && (
                              <p>Roles: {rule.conditionConfig.roleRequired.join(', ')}</p>
                            )}
                            {rule.conditionConfig.maxChangePercent && (
                              <p>Max Change: {rule.conditionConfig.maxChangePercent}%</p>
                            )}
                            {rule.conditionConfig.requiresJustification && (
                              <p>✓ Justification Required</p>
                            )}
                            {rule.conditionConfig.requiresApproval && (
                              <p>✓ Approval Required</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="audit" className="mt-4">
            {audits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No calibration overrides recorded</p>
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {audits.map((audit) => (
                    <Collapsible 
                      key={audit.id}
                      open={showAuditDetails === audit.id}
                      onOpenChange={() => setShowAuditDetails(
                        showAuditDetails === audit.id ? null : audit.id
                      )}
                    >
                      <div className={cn(
                        "p-4 rounded-lg border",
                        audit.approvalStatus === 'pending' && "border-yellow-200 bg-yellow-50",
                        audit.approvalStatus === 'approved' && "border-green-200 bg-green-50",
                        audit.approvalStatus === 'rejected' && "border-red-200 bg-red-50"
                      )}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{audit.overrideType}</Badge>
                              <Badge className={cn(
                                audit.approvalStatus === 'pending' && "bg-yellow-500",
                                audit.approvalStatus === 'approved' && "bg-green-500",
                                audit.approvalStatus === 'rejected' && "bg-red-500"
                              )}>
                                {audit.approvalStatus}
                              </Badge>
                            </div>
                            <p className="text-sm">
                              <span className="text-muted-foreground">Changed:</span>{' '}
                              <span className="line-through">{audit.originalValue}</span>
                              {' → '}
                              <span className="font-medium">{audit.newValue}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(audit.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              {showAuditDetails === audit.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </div>

                        <CollapsibleContent className="mt-3 pt-3 border-t">
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Category:</span>{' '}
                              {justificationCategories.find(c => c.value === audit.justificationCategory)?.label}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Justification:</span>
                              <p className="mt-1 p-2 rounded bg-background border text-sm">
                                {audit.justification}
                              </p>
                            </div>
                            
                            {audit.approvalStatus === 'pending' && isAdmin && (
                              <div className="flex items-center gap-2 pt-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-green-600 border-green-600"
                                  onClick={() => handleApproveAudit(audit.id, true)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 border-red-600"
                                  onClick={() => handleApproveAudit(audit.id, false)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
