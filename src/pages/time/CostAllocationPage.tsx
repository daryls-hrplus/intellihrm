import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SplitSquareHorizontal, Plus, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface TimeEntry {
  id: string;
  employee_name: string;
  project_name: string;
  entry_date: string;
  hours: number;
  description: string;
  has_allocation: boolean;
}

interface Allocation {
  id?: string;
  target_project_id: string;
  project_name?: string;
  allocation_percent: number;
  allocated_hours: number;
}

export default function CostAllocationPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Allocation dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);

  useEffect(() => {
    if (profile?.company_id) {
      fetchData();
    }
  }, [profile?.company_id]);

  const fetchData = async () => {
    if (!profile?.company_id) return;
    setIsLoading(true);

    try {
      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name')
        .eq('company_id', profile.company_id)
        .order('name');
      setProjects(projectsData || []);

      // Fetch recent time entries
      const { data: entriesData } = await supabase
        .from('project_time_entries')
        .select(`
          id,
          entry_date,
          hours,
          description,
          profiles:employee_id (full_name),
          projects:project_id (name)
        `)
        .eq('company_id', profile.company_id)
        .order('entry_date', { ascending: false })
        .limit(50);

      // Check which entries have allocations
      const entryIds = (entriesData || []).map((e: any) => e.id);
      const { data: allocationsData } = await supabase
        .from('project_cost_allocations')
        .select('source_time_entry_id')
        .in('source_time_entry_id', entryIds);

      const entriesWithAllocations = new Set((allocationsData || []).map((a: any) => a.source_time_entry_id));

      const formattedEntries = (entriesData || []).map((e: any) => ({
        id: e.id,
        employee_name: e.profiles?.full_name || 'Unknown',
        project_name: e.projects?.name || 'Unknown',
        entry_date: e.entry_date,
        hours: e.hours || 0,
        description: e.description || '',
        has_allocation: entriesWithAllocations.has(e.id),
      }));

      setTimeEntries(formattedEntries);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const openAllocationDialog = async (entry: TimeEntry) => {
    setSelectedEntry(entry);
    
    // Fetch existing allocations
    const { data: existingAllocations } = await supabase
      .from('project_cost_allocations')
      .select(`
        id,
        target_project_id,
        allocation_percent,
        allocated_hours,
        projects:target_project_id (name)
      `)
      .eq('source_time_entry_id', entry.id);

    if (existingAllocations && existingAllocations.length > 0) {
      setAllocations(existingAllocations.map((a: any) => ({
        id: a.id,
        target_project_id: a.target_project_id,
        project_name: a.projects?.name,
        allocation_percent: a.allocation_percent,
        allocated_hours: a.allocated_hours,
      })));
    } else {
      // Default: 100% to original project
      const originalProject = projects.find(p => p.name === entry.project_name);
      setAllocations([{
        target_project_id: originalProject?.id || '',
        allocation_percent: 100,
        allocated_hours: entry.hours,
      }]);
    }
    
    setDialogOpen(true);
  };

  const addAllocation = () => {
    if (allocations.length >= 5) {
      toast.error('Maximum 5 allocations per entry');
      return;
    }
    setAllocations([...allocations, {
      target_project_id: '',
      allocation_percent: 0,
      allocated_hours: 0,
    }]);
  };

  const removeAllocation = (index: number) => {
    if (allocations.length <= 1) {
      toast.error('At least one allocation is required');
      return;
    }
    const newAllocations = allocations.filter((_, i) => i !== index);
    setAllocations(newAllocations);
  };

  const updateAllocation = (index: number, field: keyof Allocation, value: any) => {
    const newAllocations = [...allocations];
    newAllocations[index] = { ...newAllocations[index], [field]: value };
    
    // Recalculate hours based on percentage
    if (field === 'allocation_percent' && selectedEntry) {
      newAllocations[index].allocated_hours = (value / 100) * selectedEntry.hours;
    }
    
    setAllocations(newAllocations);
  };

  const getTotalPercent = () => {
    return allocations.reduce((sum, a) => sum + (a.allocation_percent || 0), 0);
  };

  const handleSaveAllocations = async () => {
    if (!selectedEntry || !profile?.company_id) return;

    const totalPercent = getTotalPercent();
    if (Math.abs(totalPercent - 100) > 0.01) {
      toast.error('Allocations must total 100%');
      return;
    }

    if (allocations.some(a => !a.target_project_id)) {
      toast.error('Please select a project for each allocation');
      return;
    }

    try {
      // Delete existing allocations
      await supabase
        .from('project_cost_allocations')
        .delete()
        .eq('source_time_entry_id', selectedEntry.id);

      // Insert new allocations
      const allocationData = allocations.map(a => ({
        company_id: profile.company_id,
        source_time_entry_id: selectedEntry.id,
        target_project_id: a.target_project_id,
        allocation_percent: a.allocation_percent,
        allocated_hours: (a.allocation_percent / 100) * selectedEntry.hours,
        allocated_cost: 0, // Will be calculated by triggers
        allocated_billable: 0,
      }));

      await supabase
        .from('project_cost_allocations')
        .insert(allocationData);

      toast.success('Allocations saved successfully');
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving allocations:', error);
      toast.error('Failed to save allocations');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("timeAttendance.title"), href: "/time-attendance" },
            { label: "Project Costs", href: "/time/project-costs" },
            { label: "Cost Allocation" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <SplitSquareHorizontal className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Cost Allocation</h1>
              <p className="text-muted-foreground">Split time entries across multiple projects</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Time Entries</CardTitle>
            <CardDescription>Select an entry to allocate costs across projects</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Allocation</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : timeEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No time entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  timeEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{format(new Date(entry.entry_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{entry.employee_name}</TableCell>
                      <TableCell className="font-medium">{entry.project_name}</TableCell>
                      <TableCell className="text-right">{entry.hours.toFixed(2)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{entry.description}</TableCell>
                      <TableCell>
                        <Badge variant={entry.has_allocation ? "default" : "outline"}>
                          {entry.has_allocation ? "Split" : "Single"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAllocationDialog(entry)}
                        >
                          Allocate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Allocation Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Allocate Time Entry</DialogTitle>
            </DialogHeader>
            
            {selectedEntry && (
              <div className="space-y-6 py-4">
                <div className="rounded-lg border p-4 bg-muted/50">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Employee:</span>
                      <p className="font-medium">{selectedEntry.employee_name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Original Project:</span>
                      <p className="font-medium">{selectedEntry.project_name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Hours:</span>
                      <p className="font-medium">{selectedEntry.hours.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Allocations</Label>
                    <Button variant="outline" size="sm" onClick={addAllocation}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Split
                    </Button>
                  </div>

                  {allocations.map((allocation, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-lg border">
                      <div className="flex-1 space-y-2">
                        <Label>Project</Label>
                        <Select
                          value={allocation.target_project_id}
                          onValueChange={(v) => updateAllocation(index, 'target_project_id', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-32 space-y-2">
                        <Label>Percent</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={allocation.allocation_percent}
                          onChange={(e) => updateAllocation(index, 'allocation_percent', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="w-24 space-y-2">
                        <Label>Hours</Label>
                        <Input
                          type="text"
                          value={((allocation.allocation_percent / 100) * selectedEntry.hours).toFixed(2)}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mt-6"
                        onClick={() => removeAllocation(index)}
                        disabled={allocations.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}

                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <span className="font-medium">Total Allocation</span>
                    <div className="flex items-center gap-4">
                      <Progress value={Math.min(getTotalPercent(), 100)} className="w-32 h-2" />
                      <span className={`font-bold ${Math.abs(getTotalPercent() - 100) > 0.01 ? 'text-destructive' : 'text-success'}`}>
                        {getTotalPercent().toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {Math.abs(getTotalPercent() - 100) > 0.01 && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>Allocations must total exactly 100%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveAllocations} disabled={Math.abs(getTotalPercent() - 100) > 0.01}>
                Save Allocations
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
