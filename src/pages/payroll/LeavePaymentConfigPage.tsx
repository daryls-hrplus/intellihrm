import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Settings, ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface LeaveType {
  id: string;
  name: string;
  code: string;
}

interface Company {
  id: string;
  name: string;
}

interface PayElement {
  id: string;
  name: string;
  code: string;
}

interface LeavePaymentRule {
  id: string;
  company_id: string;
  leave_type_id: string;
  name: string;
  code: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  leave_types?: { name: string; code: string };
  companies?: { name: string };
}

interface LeavePaymentTier {
  id: string;
  leave_payment_rule_id: string;
  from_day: number;
  to_day: number | null;
  payment_percentage: number;
  sort_order: number;
}

interface LeavePayrollMapping {
  id: string;
  company_id: string;
  leave_type_id: string;
  pay_element_id: string | null;
  payroll_code: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  leave_types?: { name: string; code: string };
  companies?: { name: string };
  pay_elements?: { name: string; code: string };
}

const LeavePaymentConfigPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [payElements, setPayElements] = useState<PayElement[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  
  // Payment Rules
  const [paymentRules, setPaymentRules] = useState<LeavePaymentRule[]>([]);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<LeavePaymentRule | null>(null);
  const [ruleForm, setRuleForm] = useState({
    leave_type_id: '',
    name: '',
    code: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_active: true
  });
  
  // Payment Tiers
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
  const [ruleTiers, setRuleTiers] = useState<Record<string, LeavePaymentTier[]>>({});
  const [tierDialogOpen, setTierDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<LeavePaymentTier | null>(null);
  const [currentRuleId, setCurrentRuleId] = useState<string>('');
  const [tierForm, setTierForm] = useState({
    from_day: 1,
    to_day: '',
    payment_percentage: 100,
    sort_order: 0
  });
  
  // Payroll Mappings
  const [payrollMappings, setPayrollMappings] = useState<LeavePayrollMapping[]>([]);
  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<LeavePayrollMapping | null>(null);
  const [mappingForm, setMappingForm] = useState({
    leave_type_id: '',
    pay_element_id: '',
    payroll_code: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    is_active: true
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadLeaveTypes();
      loadPayElements();
      loadPaymentRules();
      loadPayrollMappings();
    }
  }, [selectedCompany]);

  const loadCompanies = async () => {
    const { data } = await supabase.from('companies').select('id, name').eq('is_active', true).order('name');
    if (data) {
      setCompanies(data);
      if (data.length > 0 && !selectedCompany) {
        setSelectedCompany(data[0].id);
      }
    }
  };

  const loadLeaveTypes = async () => {
    const { data } = await supabase.from('leave_types').select('id, name, code').eq('company_id', selectedCompany).eq('is_active', true).order('name');
    if (data) setLeaveTypes(data);
  };

  const loadPayElements = async () => {
    const { data } = await supabase.from('pay_elements').select('id, name, code').eq('company_id', selectedCompany).eq('is_active', true).order('name');
    if (data) setPayElements(data);
  };

  const loadPaymentRules = async () => {
    const { data } = await supabase
      .from('leave_payment_rules')
      .select('*, leave_types(name, code), companies(name)')
      .eq('company_id', selectedCompany)
      .order('name');
    if (data) setPaymentRules(data);
  };

  const loadPayrollMappings = async () => {
    const { data } = await supabase
      .from('leave_payroll_mappings')
      .select('*, leave_types(name, code), companies(name), pay_elements(name, code)')
      .eq('company_id', selectedCompany)
      .order('payroll_code');
    if (data) setPayrollMappings(data);
  };

  const loadTiersForRule = async (ruleId: string) => {
    const { data } = await supabase
      .from('leave_payment_tiers')
      .select('*')
      .eq('leave_payment_rule_id', ruleId)
      .order('sort_order');
    if (data) {
      setRuleTiers(prev => ({ ...prev, [ruleId]: data }));
    }
  };

  const toggleRuleExpanded = async (ruleId: string) => {
    const newExpanded = new Set(expandedRules);
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId);
    } else {
      newExpanded.add(ruleId);
      if (!ruleTiers[ruleId]) {
        await loadTiersForRule(ruleId);
      }
    }
    setExpandedRules(newExpanded);
  };

  // Rule handlers
  const handleSaveRule = async () => {
    if (!ruleForm.leave_type_id || !ruleForm.name || !ruleForm.code) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = {
      company_id: selectedCompany,
      leave_type_id: ruleForm.leave_type_id,
      name: ruleForm.name,
      code: ruleForm.code,
      description: ruleForm.description || null,
      start_date: ruleForm.start_date,
      end_date: ruleForm.end_date || null,
      is_active: ruleForm.is_active
    };

    if (editingRule) {
      const { error } = await supabase.from('leave_payment_rules').update(payload).eq('id', editingRule.id);
      if (error) {
        toast.error('Failed to update rule');
        return;
      }
      toast.success('Rule updated successfully');
    } else {
      const { error } = await supabase.from('leave_payment_rules').insert(payload);
      if (error) {
        toast.error('Failed to create rule');
        return;
      }
      toast.success('Rule created successfully');
    }
    
    setRuleDialogOpen(false);
    setEditingRule(null);
    resetRuleForm();
    loadPaymentRules();
  };

  const handleEditRule = (rule: LeavePaymentRule) => {
    setEditingRule(rule);
    setRuleForm({
      leave_type_id: rule.leave_type_id,
      name: rule.name,
      code: rule.code,
      description: rule.description || '',
      start_date: rule.start_date,
      end_date: rule.end_date || '',
      is_active: rule.is_active
    });
    setRuleDialogOpen(true);
  };

  const handleDeleteRule = async (id: string) => {
    const { error } = await supabase.from('leave_payment_rules').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete rule');
      return;
    }
    toast.success('Rule deleted successfully');
    loadPaymentRules();
  };

  const resetRuleForm = () => {
    setRuleForm({
      leave_type_id: '',
      name: '',
      code: '',
      description: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      is_active: true
    });
  };

  // Tier handlers
  const handleSaveTier = async () => {
    if (tierForm.from_day < 1 || tierForm.payment_percentage < 0) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    const payload = {
      leave_payment_rule_id: currentRuleId,
      from_day: tierForm.from_day,
      to_day: tierForm.to_day ? parseInt(tierForm.to_day as any) : null,
      payment_percentage: tierForm.payment_percentage,
      sort_order: tierForm.sort_order
    };

    if (editingTier) {
      const { error } = await supabase.from('leave_payment_tiers').update(payload).eq('id', editingTier.id);
      if (error) {
        toast.error('Failed to update tier');
        return;
      }
      toast.success('Tier updated successfully');
    } else {
      const { error } = await supabase.from('leave_payment_tiers').insert(payload);
      if (error) {
        toast.error('Failed to create tier');
        return;
      }
      toast.success('Tier created successfully');
    }
    
    setTierDialogOpen(false);
    setEditingTier(null);
    resetTierForm();
    loadTiersForRule(currentRuleId);
  };

  const handleEditTier = (tier: LeavePaymentTier) => {
    setEditingTier(tier);
    setCurrentRuleId(tier.leave_payment_rule_id);
    setTierForm({
      from_day: tier.from_day,
      to_day: tier.to_day?.toString() || '',
      payment_percentage: tier.payment_percentage,
      sort_order: tier.sort_order
    });
    setTierDialogOpen(true);
  };

  const handleDeleteTier = async (tier: LeavePaymentTier) => {
    const { error } = await supabase.from('leave_payment_tiers').delete().eq('id', tier.id);
    if (error) {
      toast.error('Failed to delete tier');
      return;
    }
    toast.success('Tier deleted successfully');
    loadTiersForRule(tier.leave_payment_rule_id);
  };

  const handleAddTier = (ruleId: string) => {
    setCurrentRuleId(ruleId);
    const existingTiers = ruleTiers[ruleId] || [];
    const nextSortOrder = existingTiers.length > 0 ? Math.max(...existingTiers.map(t => t.sort_order)) + 1 : 0;
    setTierForm({
      from_day: 1,
      to_day: '',
      payment_percentage: 100,
      sort_order: nextSortOrder
    });
    setTierDialogOpen(true);
  };

  const resetTierForm = () => {
    setTierForm({
      from_day: 1,
      to_day: '',
      payment_percentage: 100,
      sort_order: 0
    });
  };

  // Mapping handlers
  const handleSaveMapping = async () => {
    if (!mappingForm.leave_type_id || !mappingForm.payroll_code) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = {
      company_id: selectedCompany,
      leave_type_id: mappingForm.leave_type_id,
      pay_element_id: mappingForm.pay_element_id || null,
      payroll_code: mappingForm.payroll_code,
      description: mappingForm.description || null,
      start_date: mappingForm.start_date,
      end_date: mappingForm.end_date || null,
      is_active: mappingForm.is_active
    };

    if (editingMapping) {
      const { error } = await supabase.from('leave_payroll_mappings').update(payload).eq('id', editingMapping.id);
      if (error) {
        toast.error('Failed to update mapping');
        return;
      }
      toast.success('Mapping updated successfully');
    } else {
      const { error } = await supabase.from('leave_payroll_mappings').insert(payload);
      if (error) {
        toast.error('Failed to create mapping');
        return;
      }
      toast.success('Mapping created successfully');
    }
    
    setMappingDialogOpen(false);
    setEditingMapping(null);
    resetMappingForm();
    loadPayrollMappings();
  };

  const handleEditMapping = (mapping: LeavePayrollMapping) => {
    setEditingMapping(mapping);
    setMappingForm({
      leave_type_id: mapping.leave_type_id,
      pay_element_id: mapping.pay_element_id || '',
      payroll_code: mapping.payroll_code,
      description: mapping.description || '',
      start_date: mapping.start_date,
      end_date: mapping.end_date || '',
      is_active: mapping.is_active
    });
    setMappingDialogOpen(true);
  };

  const handleDeleteMapping = async (id: string) => {
    const { error } = await supabase.from('leave_payroll_mappings').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete mapping');
      return;
    }
    toast.success('Mapping deleted successfully');
    loadPayrollMappings();
  };

  const resetMappingForm = () => {
    setMappingForm({
      leave_type_id: '',
      pay_element_id: '',
      payroll_code: '',
      description: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      is_active: true
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/payroll')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Leave Payment Configuration</h1>
          <p className="text-muted-foreground">Configure leave type payment rules and payroll mappings</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="w-64">
            <Label>Company</Label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedCompany && (
        <Tabs defaultValue="rules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="rules">Payment Rules</TabsTrigger>
            <TabsTrigger value="mappings">Payroll Mappings</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Leave Payment Rules</CardTitle>
                <Button onClick={() => { resetRuleForm(); setRuleDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentRules.map(rule => (
                      <React.Fragment key={rule.id}>
                        <TableRow>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => toggleRuleExpanded(rule.id)}
                            >
                              {expandedRules.has(rule.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>{rule.leave_types?.name} ({rule.leave_types?.code})</TableCell>
                          <TableCell>{rule.name}</TableCell>
                          <TableCell><Badge variant="outline">{rule.code}</Badge></TableCell>
                          <TableCell>{rule.start_date}</TableCell>
                          <TableCell>{rule.end_date || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                              {rule.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEditRule(rule)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(rule.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedRules.has(rule.id) && (
                          <TableRow>
                            <TableCell colSpan={8} className="bg-muted/50 p-4">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium">Payment Tiers</h4>
                                  <Button size="sm" onClick={() => handleAddTier(rule.id)}>
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Tier
                                  </Button>
                                </div>
                                {ruleTiers[rule.id]?.length > 0 ? (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>From Day</TableHead>
                                        <TableHead>To Day</TableHead>
                                        <TableHead>Payment %</TableHead>
                                        <TableHead>Order</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {ruleTiers[rule.id].map(tier => (
                                        <TableRow key={tier.id}>
                                          <TableCell>{tier.from_day}</TableCell>
                                          <TableCell>{tier.to_day || 'Onwards'}</TableCell>
                                          <TableCell>
                                            <Badge variant="outline">{tier.payment_percentage}%</Badge>
                                          </TableCell>
                                          <TableCell>{tier.sort_order}</TableCell>
                                          <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEditTier(tier)}>
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTier(tier)}>
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No tiers configured. Add payment tiers to define percentage-based payment rules.</p>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                    {paymentRules.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No payment rules configured
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mappings" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Leave to Payroll Mappings</CardTitle>
                <Button onClick={() => { resetMappingForm(); setMappingDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Mapping
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Payroll Code</TableHead>
                      <TableHead>Pay Element</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollMappings.map(mapping => (
                      <TableRow key={mapping.id}>
                        <TableCell>{mapping.leave_types?.name} ({mapping.leave_types?.code})</TableCell>
                        <TableCell><Badge variant="outline">{mapping.payroll_code}</Badge></TableCell>
                        <TableCell>{mapping.pay_elements?.name || '-'}</TableCell>
                        <TableCell>{mapping.start_date}</TableCell>
                        <TableCell>{mapping.end_date || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={mapping.is_active ? 'default' : 'secondary'}>
                            {mapping.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditMapping(mapping)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteMapping(mapping.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {payrollMappings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No payroll mappings configured
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Rule Dialog */}
      <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Payment Rule' : 'Add Payment Rule'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Leave Type *</Label>
              <Select value={ruleForm.leave_type_id} onValueChange={v => setRuleForm({ ...ruleForm, leave_type_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map(lt => (
                    <SelectItem key={lt.id} value={lt.id}>{lt.name} ({lt.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input value={ruleForm.name} onChange={e => setRuleForm({ ...ruleForm, name: e.target.value })} />
              </div>
              <div>
                <Label>Code *</Label>
                <Input value={ruleForm.code} onChange={e => setRuleForm({ ...ruleForm, code: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={ruleForm.description} onChange={e => setRuleForm({ ...ruleForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Input type="date" value={ruleForm.start_date} onChange={e => setRuleForm({ ...ruleForm, start_date: e.target.value })} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={ruleForm.end_date} onChange={e => setRuleForm({ ...ruleForm, end_date: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={ruleForm.is_active} onCheckedChange={v => setRuleForm({ ...ruleForm, is_active: v })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRuleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRule}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tier Dialog */}
      <Dialog open={tierDialogOpen} onOpenChange={setTierDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTier ? 'Edit Payment Tier' : 'Add Payment Tier'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>From Day *</Label>
                <Input 
                  type="number" 
                  min="1"
                  value={tierForm.from_day} 
                  onChange={e => setTierForm({ ...tierForm, from_day: parseInt(e.target.value) || 1 })} 
                />
              </div>
              <div>
                <Label>To Day (blank = onwards)</Label>
                <Input 
                  type="number" 
                  min="1"
                  value={tierForm.to_day} 
                  onChange={e => setTierForm({ ...tierForm, to_day: e.target.value })} 
                  placeholder="Onwards"
                />
              </div>
            </div>
            <div>
              <Label>Payment Percentage *</Label>
              <Input 
                type="number" 
                min="0" 
                max="100" 
                step="0.01"
                value={tierForm.payment_percentage} 
                onChange={e => setTierForm({ ...tierForm, payment_percentage: parseFloat(e.target.value) || 0 })} 
              />
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input 
                type="number" 
                value={tierForm.sort_order} 
                onChange={e => setTierForm({ ...tierForm, sort_order: parseInt(e.target.value) || 0 })} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTierDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTier}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mapping Dialog */}
      <Dialog open={mappingDialogOpen} onOpenChange={setMappingDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMapping ? 'Edit Payroll Mapping' : 'Add Payroll Mapping'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Leave Type *</Label>
              <Select value={mappingForm.leave_type_id} onValueChange={v => setMappingForm({ ...mappingForm, leave_type_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map(lt => (
                    <SelectItem key={lt.id} value={lt.id}>{lt.name} ({lt.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payroll Code *</Label>
              <Input value={mappingForm.payroll_code} onChange={e => setMappingForm({ ...mappingForm, payroll_code: e.target.value })} />
            </div>
            <div>
              <Label>Pay Element (optional)</Label>
              <Select value={mappingForm.pay_element_id} onValueChange={v => setMappingForm({ ...mappingForm, pay_element_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pay element" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {payElements.map(pe => (
                    <SelectItem key={pe.id} value={pe.id}>{pe.name} ({pe.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={mappingForm.description} onChange={e => setMappingForm({ ...mappingForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Input type="date" value={mappingForm.start_date} onChange={e => setMappingForm({ ...mappingForm, start_date: e.target.value })} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={mappingForm.end_date} onChange={e => setMappingForm({ ...mappingForm, end_date: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={mappingForm.is_active} onCheckedChange={v => setMappingForm({ ...mappingForm, is_active: v })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMappingDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMapping}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeavePaymentConfigPage;
