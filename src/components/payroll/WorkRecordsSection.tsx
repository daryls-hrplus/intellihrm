import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Clock, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface WorkRecordsSectionProps {
  companyId: string;
  employeeId: string;
  payPeriodId: string;
}

interface PayrollRule {
  id: string;
  name: string;
  code: string;
  rule_type: string;
}

interface WorkRecord {
  id: string;
  work_date: string;
  day_type: string;
  is_scheduled_day: boolean;
  total_hours_worked: number;
  regular_hours: number;
  overtime_hours: number;
  notes: string | null;
  payroll_rule_id: string | null;
  payroll_rules?: PayrollRule;
  position?: { title: string } | null;
  work_periods?: WorkPeriod[];
}

interface WorkPeriod {
  id: string;
  period_type: string;
  clock_in: string;
  clock_out: string | null;
  hours_worked: number | null;
  is_paid: boolean;
  notes: string | null;
  payroll_rule_id: string | null;
  payroll_rules?: PayrollRule;
}

export function WorkRecordsSection({ companyId, employeeId, payPeriodId }: WorkRecordsSectionProps) {
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);
  const [payrollRules, setPayrollRules] = useState<PayrollRule[]>([]);
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isAddingPeriod, setIsAddingPeriod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [newRecord, setNewRecord] = useState({
    work_date: '',
    day_type: 'work_day',
    is_scheduled_day: true,
    payroll_rule_id: '',
    notes: ''
  });

  const [newPeriod, setNewPeriod] = useState({
    period_type: 'regular',
    clock_in: '',
    clock_out: '',
    is_paid: true,
    payroll_rule_id: '',
    notes: ''
  });

  useEffect(() => {
    loadWorkRecords();
    loadPayrollRules();
  }, [employeeId, payPeriodId]);

  const loadPayrollRules = async () => {
    const { data, error } = await supabase
      .from('payroll_rules')
      .select('id, name, code, rule_type')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');
    
    if (!error && data) {
      setPayrollRules(data);
    }
  };

  const loadWorkRecords = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('employee_work_records')
      .select(`
        *,
        payroll_rules(id, name, code, rule_type),
        position:positions(title)
      `)
      .eq('employee_id', employeeId)
      .eq('pay_period_id', payPeriodId)
      .order('work_date');
    
    if (error) {
      toast.error("Failed to load work records");
      setIsLoading(false);
      return;
    }

    // Load work periods for each record
    const recordsWithPeriods = await Promise.all((data || []).map(async (record) => {
      const { data: periods } = await supabase
        .from('employee_work_periods')
        .select(`*, payroll_rules(id, name, code, rule_type)`)
        .eq('work_record_id', record.id)
        .order('clock_in');
      
      return { ...record, work_periods: periods || [] };
    }));

    setWorkRecords(recordsWithPeriods);
    setIsLoading(false);
  };

  const handleAddRecord = async () => {
    if (!newRecord.work_date) {
      toast.error("Please select a date");
      return;
    }

    const { error } = await supabase
      .from('employee_work_records')
      .insert({
        company_id: companyId,
        employee_id: employeeId,
        pay_period_id: payPeriodId,
        work_date: newRecord.work_date,
        day_type: newRecord.day_type,
        is_scheduled_day: newRecord.is_scheduled_day,
        payroll_rule_id: newRecord.payroll_rule_id || null,
        notes: newRecord.notes || null
      });

    if (error) {
      toast.error("Failed to add work record");
      return;
    }

    toast.success("Work record added");
    setIsAddingRecord(false);
    setNewRecord({ work_date: '', day_type: 'work_day', is_scheduled_day: true, payroll_rule_id: '', notes: '' });
    loadWorkRecords();
  };

  const handleAddPeriod = async (recordId: string) => {
    if (!newPeriod.clock_in) {
      toast.error("Please enter clock in time");
      return;
    }

    // Calculate hours worked
    let hoursWorked = null;
    if (newPeriod.clock_in && newPeriod.clock_out) {
      const [inH, inM] = newPeriod.clock_in.split(':').map(Number);
      const [outH, outM] = newPeriod.clock_out.split(':').map(Number);
      hoursWorked = (outH * 60 + outM - inH * 60 - inM) / 60;
      if (hoursWorked < 0) hoursWorked += 24;
    }

    const { error } = await supabase
      .from('employee_work_periods')
      .insert({
        work_record_id: recordId,
        period_type: newPeriod.period_type,
        clock_in: newPeriod.clock_in,
        clock_out: newPeriod.clock_out || null,
        hours_worked: hoursWorked,
        is_paid: newPeriod.is_paid,
        payroll_rule_id: newPeriod.payroll_rule_id || null,
        notes: newPeriod.notes || null
      });

    if (error) {
      toast.error("Failed to add work period");
      return;
    }

    toast.success("Work period added");
    setIsAddingPeriod(null);
    setNewPeriod({ period_type: 'regular', clock_in: '', clock_out: '', is_paid: true, payroll_rule_id: '', notes: '' });
    loadWorkRecords();
  };

  const handleDeletePeriod = async (periodId: string) => {
    const { error } = await supabase
      .from('employee_work_periods')
      .delete()
      .eq('id', periodId);

    if (error) {
      toast.error("Failed to delete period");
      return;
    }

    toast.success("Period deleted");
    loadWorkRecords();
  };

  const toggleExpanded = (recordId: string) => {
    const newExpanded = new Set(expandedRecords);
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId);
    } else {
      newExpanded.add(recordId);
    }
    setExpandedRecords(newExpanded);
  };

  const getDayTypeBadge = (dayType: string) => {
    const variants: Record<string, string> = {
      'work_day': 'bg-green-100 text-green-800',
      'leave_day': 'bg-blue-100 text-blue-800',
      'holiday': 'bg-purple-100 text-purple-800',
      'weekend': 'bg-gray-100 text-gray-800'
    };
    return variants[dayType] || 'bg-gray-100 text-gray-800';
  };

  const getPeriodTypeBadge = (periodType: string) => {
    const variants: Record<string, string> = {
      'regular': 'bg-green-100 text-green-800',
      'break': 'bg-yellow-100 text-yellow-800',
      'lunch': 'bg-orange-100 text-orange-800',
      'overtime': 'bg-red-100 text-red-800'
    };
    return variants[periodType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Work Records & Time Tracking
        </CardTitle>
        <Dialog open={isAddingRecord} onOpenChange={setIsAddingRecord}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Work Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newRecord.work_date}
                  onChange={(e) => setNewRecord({ ...newRecord, work_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Day Type</Label>
                <Select 
                  value={newRecord.day_type} 
                  onValueChange={(v) => setNewRecord({ ...newRecord, day_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work_day">Work Day</SelectItem>
                    <SelectItem value="leave_day">Leave Day</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="weekend">Weekend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Scheduled Day?</Label>
                <Select 
                  value={newRecord.is_scheduled_day ? 'yes' : 'no'} 
                  onValueChange={(v) => setNewRecord({ ...newRecord, is_scheduled_day: v === 'yes' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">On Day (Scheduled)</SelectItem>
                    <SelectItem value="no">Off Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Payroll Rule</Label>
                <Select 
                  value={newRecord.payroll_rule_id} 
                  onValueChange={(v) => setNewRecord({ ...newRecord, payroll_rule_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rule" />
                  </SelectTrigger>
                  <SelectContent>
                    {payrollRules.map((rule) => (
                      <SelectItem key={rule.id} value={rule.id}>
                        {rule.name} ({rule.rule_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingRecord(false)}>Cancel</Button>
              <Button onClick={handleAddRecord}>Add Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center text-muted-foreground py-4">Loading...</p>
        ) : workRecords.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No work records for this period</p>
        ) : (
          <div className="space-y-2">
            {workRecords.map((record) => (
              <Collapsible 
                key={record.id} 
                open={expandedRecords.has(record.id)}
                onOpenChange={() => toggleExpanded(record.id)}
              >
                <div className="border rounded-lg">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        {expandedRecords.has(record.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          {format(new Date(record.work_date), 'EEE, MMM d, yyyy')}
                        </span>
                        <Badge className={getDayTypeBadge(record.day_type)}>
                          {record.day_type.replace('_', ' ')}
                        </Badge>
                        <Badge variant={record.is_scheduled_day ? "default" : "secondary"}>
                          {record.is_scheduled_day ? 'On Day' : 'Off Day'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Total: {record.total_hours_worked || 0}h</span>
                        <span>Regular: {record.regular_hours || 0}h</span>
                        <span>OT: {record.overtime_hours || 0}h</span>
                        {record.payroll_rules && (
                          <Badge variant="outline">
                            {record.payroll_rules.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t p-3 bg-muted/30">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-sm">Work Periods</h4>
                        <Dialog 
                          open={isAddingPeriod === record.id} 
                          onOpenChange={(open) => setIsAddingPeriod(open ? record.id : null)}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-1">
                              <Plus className="h-3 w-3" />
                              Add Period
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Work Period</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Period Type</Label>
                                <Select 
                                  value={newPeriod.period_type} 
                                  onValueChange={(v) => setNewPeriod({ ...newPeriod, period_type: v })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="regular">Regular Work</SelectItem>
                                    <SelectItem value="break">Break</SelectItem>
                                    <SelectItem value="lunch">Lunch</SelectItem>
                                    <SelectItem value="overtime">Overtime</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Clock In</Label>
                                  <Input
                                    type="time"
                                    value={newPeriod.clock_in}
                                    onChange={(e) => setNewPeriod({ ...newPeriod, clock_in: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Clock Out</Label>
                                  <Input
                                    type="time"
                                    value={newPeriod.clock_out}
                                    onChange={(e) => setNewPeriod({ ...newPeriod, clock_out: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Paid?</Label>
                                <Select 
                                  value={newPeriod.is_paid ? 'yes' : 'no'} 
                                  onValueChange={(v) => setNewPeriod({ ...newPeriod, is_paid: v === 'yes' })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="yes">Yes (Paid)</SelectItem>
                                    <SelectItem value="no">No (Unpaid)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Payroll Rule</Label>
                                <Select 
                                  value={newPeriod.payroll_rule_id} 
                                  onValueChange={(v) => setNewPeriod({ ...newPeriod, payroll_rule_id: v })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select rule" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {payrollRules.map((rule) => (
                                      <SelectItem key={rule.id} value={rule.id}>
                                        {rule.name} ({rule.rule_type})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Notes</Label>
                                <Input
                                  value={newPeriod.notes}
                                  onChange={(e) => setNewPeriod({ ...newPeriod, notes: e.target.value })}
                                  placeholder="Optional notes"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsAddingPeriod(null)}>Cancel</Button>
                              <Button onClick={() => handleAddPeriod(record.id)}>Add Period</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      {record.work_periods && record.work_periods.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>From</TableHead>
                              <TableHead>To</TableHead>
                              <TableHead>Hours</TableHead>
                              <TableHead>Paid</TableHead>
                              <TableHead>Rule</TableHead>
                              <TableHead>Notes</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {record.work_periods.map((period) => (
                              <TableRow key={period.id}>
                                <TableCell>
                                  <Badge className={getPeriodTypeBadge(period.period_type)}>
                                    {period.period_type}
                                  </Badge>
                                </TableCell>
                                <TableCell>{period.clock_in}</TableCell>
                                <TableCell>{period.clock_out || '-'}</TableCell>
                                <TableCell>{period.hours_worked?.toFixed(2) || '-'}</TableCell>
                                <TableCell>
                                  <Badge variant={period.is_paid ? "default" : "secondary"}>
                                    {period.is_paid ? 'Yes' : 'No'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {period.payroll_rules ? (
                                    <Badge variant="outline">{period.payroll_rules.name}</Badge>
                                  ) : '-'}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {period.notes || '-'}
                                </TableCell>
                                <TableCell>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDeletePeriod(period.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-sm text-muted-foreground">No work periods recorded</p>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
