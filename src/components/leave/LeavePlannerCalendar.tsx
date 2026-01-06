import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Trash2, Edit2, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { useLeavePlanner, LeavePlanItem } from "@/hooks/useLeaveEnhancements";
import { useLeaveManagement } from "@/hooks/useLeaveManagement";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, differenceInDays, parseISO } from "date-fns";

export function LeavePlannerCalendar() {
  const { company } = useAuth();
  const { planItems, isLoading, createPlanItem, updatePlanItem, deletePlanItem } = useLeavePlanner(company?.id);
  const { leaveTypes, leaveBalances } = useLeaveManagement(company?.id);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<LeavePlanItem | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    leave_type_id: "",
    planned_start_date: "",
    planned_end_date: "",
    notes: "",
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get plan items for the current month
  const monthPlanItems = useMemo(() => {
    return planItems.filter(item => {
      const start = parseISO(item.planned_start_date);
      const end = parseISO(item.planned_end_date);
      return (start <= monthEnd && end >= monthStart);
    });
  }, [planItems, monthStart, monthEnd]);

  const getDayItems = (date: Date) => {
    return monthPlanItems.filter(item => {
      const start = parseISO(item.planned_start_date);
      const end = parseISO(item.planned_end_date);
      return date >= start && date <= end;
    });
  };

  const handleDateClick = (date: Date) => {
    const dayItems = getDayItems(date);
    if (dayItems.length > 0) {
      setEditingItem(dayItems[0]);
      setFormData({
        leave_type_id: dayItems[0].leave_type_id,
        planned_start_date: dayItems[0].planned_start_date,
        planned_end_date: dayItems[0].planned_end_date,
        notes: dayItems[0].notes || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        leave_type_id: "",
        planned_start_date: format(date, "yyyy-MM-dd"),
        planned_end_date: format(date, "yyyy-MM-dd"),
        notes: "",
      });
    }
    setSelectedDate(date);
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    const days = differenceInDays(parseISO(formData.planned_end_date), parseISO(formData.planned_start_date)) + 1;
    
    if (editingItem) {
      await updatePlanItem.mutateAsync({
        id: editingItem.id,
        ...formData,
        planned_days: days,
      });
    } else {
      await createPlanItem.mutateAsync({
        ...formData,
        planned_days: days,
      });
    }
    
    setShowDialog(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    await deletePlanItem.mutateAsync(editingItem.id);
    setShowDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      leave_type_id: "",
      planned_start_date: "",
      planned_end_date: "",
      notes: "",
    });
  };

  const selectedLeaveType = leaveTypes.find(lt => lt.id === formData.leave_type_id);
  const selectedBalance = leaveBalances.find(b => b.leave_type_id === formData.leave_type_id);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Leave Planner
            </CardTitle>
            <CardDescription>Plan your leave in advance. Click on a date to add planned leave.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
          
          {/* Empty cells for days before month start */}
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 bg-muted/20 rounded-lg" />
          ))}
          
          {/* Day cells */}
          {daysInMonth.map(day => {
            const dayItems = getDayItems(day);
            const hasItems = dayItems.length > 0;
            
            return (
              <div
                key={day.toISOString()}
                className={`h-24 p-1 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                  isToday(day) ? 'border-primary bg-primary/5' : 'border-border/50'
                } ${hasItems ? 'bg-primary/10' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                <div className={`text-xs font-medium ${isToday(day) ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </div>
                <div className="mt-1 space-y-0.5 overflow-hidden">
                  {dayItems.slice(0, 2).map(item => (
                    <div
                      key={item.id}
                      className="text-xs px-1 py-0.5 rounded truncate"
                      style={{ backgroundColor: item.leave_type?.color || item.color || '#3b82f6', color: 'white' }}
                    >
                      {item.leave_type?.code || item.leave_type?.name}
                    </div>
                  ))}
                  {dayItems.length > 2 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{dayItems.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3">
          {monthPlanItems.map(item => (
            <Badge
              key={item.id}
              variant="outline"
              className="gap-1"
              style={{ borderColor: item.leave_type?.color || item.color }}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.leave_type?.color || item.color }}
              />
              {item.leave_type?.name}: {item.planned_days} days
              {item.is_tentative && <span className="text-muted-foreground">(tentative)</span>}
            </Badge>
          ))}
        </div>
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => { if (!open) resetForm(); setShowDialog(open); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit Planned Leave' : 'Plan Leave'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select value={formData.leave_type_id} onValueChange={(v) => setFormData({ ...formData, leave_type_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map(lt => {
                    const balance = leaveBalances.find(b => b.leave_type_id === lt.id);
                    return (
                      <SelectItem key={lt.id} value={lt.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lt.color }} />
                          <span>{lt.name}</span>
                          <Badge variant="secondary" className="ml-2">{balance?.current_balance || 0} avail</Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.planned_start_date}
                  onChange={(e) => setFormData({ ...formData, planned_start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.planned_end_date}
                  onChange={(e) => setFormData({ ...formData, planned_end_date: e.target.value })}
                  min={formData.planned_start_date}
                />
              </div>
            </div>

            {formData.planned_start_date && formData.planned_end_date && (
              <div className="text-sm text-muted-foreground">
                Duration: {differenceInDays(parseISO(formData.planned_end_date), parseISO(formData.planned_start_date)) + 1} day(s)
              </div>
            )}

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Add any notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {editingItem && (
              <Button variant="destructive" onClick={handleDelete} disabled={deletePlanItem.isPending}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.leave_type_id || !formData.planned_start_date || !formData.planned_end_date}
            >
              {editingItem ? 'Update' : 'Save Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
