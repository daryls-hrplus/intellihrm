import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRotationPatterns, PatternDay } from "@/hooks/useRotationPatterns";
import { RotateCcw, Plus, Trash2, UserPlus, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getTodayString, formatDateForDisplay } from "@/utils/dateUtils";

interface RotationPatternsTabProps {
  companyId: string;
}

export function RotationPatternsTab({ companyId }: RotationPatternsTabProps) {
  const { patterns, assignments, isLoading, createPattern, deletePattern, assignEmployeeToPattern, removeAssignment } = useRotationPatterns(companyId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [shifts, setShifts] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([]);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    pattern_type: "rotating",
    cycle_length_days: 7,
    color: "#3b82f6",
  });

  const [patternDays, setPatternDays] = useState<PatternDay[]>([]);

  const [assignData, setAssignData] = useState({
    employee_id: "",
    start_date: getTodayString(),
    end_date: "",
    cycle_start_offset: 0,
    notes: "",
  });

  useEffect(() => {
    const loadData = async () => {
      const [shiftRes, empRes] = await Promise.all([
        supabase.from("shifts").select("id, name").eq("company_id", companyId).eq("is_active", true),
        supabase.from("profiles").select("id, full_name").eq("company_id", companyId).order("full_name"),
      ]);
      setShifts(shiftRes.data || []);
      setEmployees(empRes.data || []);
    };
    loadData();
  }, [companyId]);

  useEffect(() => {
    // Initialize pattern days when cycle length changes
    const newDays: PatternDay[] = [];
    for (let i = 0; i < formData.cycle_length_days; i++) {
      newDays.push({ day: i, shift_id: null, is_off: false });
    }
    setPatternDays(newDays);
  }, [formData.cycle_length_days]);

  const handleCreatePattern = async () => {
    await createPattern({
      name: formData.name,
      code: formData.code,
      description: formData.description || undefined,
      pattern_type: formData.pattern_type,
      cycle_length_days: formData.cycle_length_days,
      pattern_definition: patternDays,
      color: formData.color,
    });
    setDialogOpen(false);
    setFormData({ name: "", code: "", description: "", pattern_type: "rotating", cycle_length_days: 7, color: "#3b82f6" });
  };

  const handleAssign = async () => {
    if (!selectedPattern) return;
    await assignEmployeeToPattern({
      employee_id: assignData.employee_id,
      rotation_pattern_id: selectedPattern,
      start_date: assignData.start_date,
      end_date: assignData.end_date || undefined,
      cycle_start_offset: assignData.cycle_start_offset,
      notes: assignData.notes || undefined,
    });
    setAssignDialogOpen(false);
    setAssignData({ employee_id: "", start_date: getTodayString(), end_date: "", cycle_start_offset: 0, notes: "" });
  };

  const updatePatternDay = (index: number, shiftId: string | null, isOff: boolean) => {
    const newDays = [...patternDays];
    newDays[index] = { ...newDays[index], shift_id: shiftId, is_off: isOff, shift_name: shifts.find(s => s.id === shiftId)?.name };
    setPatternDays(newDays);
  };

  const currentPattern = patterns.find(p => p.id === selectedPattern);
  const patternAssignments = assignments.filter(a => a.rotation_pattern_id === selectedPattern);

  // Common rotation presets
  const presets = [
    { name: "4x4", days: 8, pattern: "Work 4, Off 4" },
    { name: "2-2-3", days: 14, pattern: "2 on, 2 off, 3 on" },
    { name: "5x2", days: 7, pattern: "Work 5, Off 2" },
    { name: "Continental", days: 28, pattern: "7-day rotation" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Rotation Patterns
          </h3>
          <p className="text-sm text-muted-foreground">Define shift rotation schedules</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Pattern
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Rotation Pattern</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Quick Presets */}
              <div className="space-y-2">
                <Label>Quick Presets</Label>
                <div className="flex flex-wrap gap-2">
                  {presets.map(preset => (
                    <Button 
                      key={preset.name} 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFormData(p => ({ ...p, name: preset.name, cycle_length_days: preset.days }))}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pattern Name</Label>
                  <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g., 4x4 Rotation" />
                </div>
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g., ROT-4X4" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Pattern Type</Label>
                  <Select value={formData.pattern_type} onValueChange={v => setFormData(p => ({ ...p, pattern_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="rotating">Rotating</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cycle Length (days)</Label>
                  <Input type="number" min={1} max={56} value={formData.cycle_length_days} onChange={e => setFormData(p => ({ ...p, cycle_length_days: parseInt(e.target.value) || 7 }))} />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <Input type="color" value={formData.color} onChange={e => setFormData(p => ({ ...p, color: e.target.value }))} className="h-10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Describe the rotation pattern..." />
              </div>

              {/* Pattern Days Grid */}
              <div className="space-y-2">
                <Label>Pattern Definition</Label>
                <div className="grid grid-cols-7 gap-2">
                  {patternDays.map((day, index) => (
                    <div key={index} className="space-y-1">
                      <div className="text-xs text-center font-medium">Day {index + 1}</div>
                      <Select 
                        value={day.is_off ? "off" : (day.shift_id || "")} 
                        onValueChange={v => {
                          if (v === "off") {
                            updatePatternDay(index, null, true);
                          } else {
                            updatePatternDay(index, v, false);
                          }
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="off">OFF</SelectItem>
                          {shifts.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreatePattern} disabled={!formData.name || !formData.code}>Create Pattern</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Patterns List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading...</div>
            ) : patterns.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No rotation patterns defined</div>
            ) : (
              <div className="space-y-2">
                {patterns.map(pattern => (
                  <div 
                    key={pattern.id} 
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedPattern === pattern.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                    onClick={() => setSelectedPattern(pattern.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pattern.color }} />
                        <div>
                          <div className="font-medium">{pattern.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {pattern.code} • {pattern.cycle_length_days} days • {pattern.pattern_type}
                          </div>
                        </div>
                      </div>
                      <Badge variant={pattern.is_active ? "default" : "secondary"}>
                        {pattern.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {pattern.pattern_definition.length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {pattern.pattern_definition.slice(0, 14).map((day, i) => (
                          <div 
                            key={i} 
                            className={`w-5 h-5 rounded text-xs flex items-center justify-center ${day.is_off ? "bg-muted" : "bg-primary/20"}`}
                            title={day.is_off ? "Off" : (day.shift_name || "Work")}
                          >
                            {day.is_off ? "O" : "W"}
                          </div>
                        ))}
                        {pattern.pattern_definition.length > 14 && <span className="text-xs text-muted-foreground">...</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pattern Details & Assignments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {currentPattern ? `${currentPattern.name} Assignments` : "Select a Pattern"}
            </CardTitle>
            {currentPattern && (
              <div className="flex gap-2">
                <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Assign
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Employee to Rotation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Employee</Label>
                        <Select value={assignData.employee_id} onValueChange={v => setAssignData(p => ({ ...p, employee_id: v }))}>
                          <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                          <SelectContent>
                            {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input type="date" value={assignData.start_date} onChange={e => setAssignData(p => ({ ...p, start_date: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date (optional)</Label>
                          <Input type="date" value={assignData.end_date} onChange={e => setAssignData(p => ({ ...p, end_date: e.target.value }))} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Cycle Start Offset (days)</Label>
                        <Input type="number" min={0} value={assignData.cycle_start_offset} onChange={e => setAssignData(p => ({ ...p, cycle_start_offset: parseInt(e.target.value) || 0 }))} />
                        <p className="text-xs text-muted-foreground">Use to stagger employees in the rotation</p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAssign} disabled={!assignData.employee_id}>Assign</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button size="sm" variant="ghost" onClick={() => currentPattern && deletePattern(currentPattern.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!currentPattern ? (
              <div className="text-center py-8 text-muted-foreground">Select a pattern to view assignments</div>
            ) : patternAssignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No employees assigned to this rotation</div>
            ) : (
              <div className="space-y-2">
                {patternAssignments.map(assignment => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{assignment.employee?.full_name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {formatDateForDisplay(assignment.start_date)}
                        {assignment.end_date && ` - ${formatDateForDisplay(assignment.end_date)}`}
                        {assignment.cycle_start_offset > 0 && (
                          <span className="text-xs">+{assignment.cycle_start_offset}d offset</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={assignment.is_active ? "default" : "outline"}>
                        {assignment.is_active ? "Active" : "Ended"}
                      </Badge>
                      <Button size="sm" variant="ghost" onClick={() => removeAssignment(assignment.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
