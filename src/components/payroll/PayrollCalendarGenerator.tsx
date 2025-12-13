import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar, RefreshCw, AlertCircle, Check } from "lucide-react";
import { format, addDays, addWeeks, startOfYear, endOfYear, isMonday, eachDayOfInterval, getDay, setDate, lastDayOfMonth, isAfter, isBefore, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PayGroup {
  id: string;
  name: string;
  code: string;
  pay_frequency: string;
  uses_national_insurance: boolean;
}

interface GeneratedPeriod {
  period_number: number;
  period_start: Date;
  period_end: Date;
  pay_date: Date;
  monday_count: number;
}

interface PayrollCalendarGeneratorProps {
  companyId: string;
  payGroup: PayGroup;
  onGenerated: () => void;
}

export function PayrollCalendarGenerator({ companyId, payGroup, onGenerated }: PayrollCalendarGeneratorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewPeriods, setPreviewPeriods] = useState<GeneratedPeriod[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [startDate, setStartDate] = useState<string>("");
  const [payDayOffset, setPayDayOffset] = useState(0); // Days after period end

  const countMondaysInPeriod = (start: Date, end: Date): number => {
    const days = eachDayOfInterval({ start, end });
    return days.filter(day => isMonday(day)).length;
  };

  const generateMonthlyPeriods = (year: number): GeneratedPeriod[] => {
    const periods: GeneratedPeriod[] = [];
    for (let month = 0; month < 12; month++) {
      const periodStart = new Date(year, month, 1);
      const periodEnd = lastDayOfMonth(periodStart);
      const payDate = addDays(periodEnd, payDayOffset);
      
      periods.push({
        period_number: month + 1,
        period_start: periodStart,
        period_end: periodEnd,
        pay_date: payDate,
        monday_count: countMondaysInPeriod(periodStart, periodEnd),
      });
    }
    return periods;
  };

  const generateSemiMonthlyPeriods = (year: number): GeneratedPeriod[] => {
    const periods: GeneratedPeriod[] = [];
    let periodNum = 1;
    
    for (let month = 0; month < 12; month++) {
      // First half: 1st to 15th
      const firstStart = new Date(year, month, 1);
      const firstEnd = new Date(year, month, 15);
      const firstPayDate = addDays(firstEnd, payDayOffset);
      
      periods.push({
        period_number: periodNum++,
        period_start: firstStart,
        period_end: firstEnd,
        pay_date: firstPayDate,
        monday_count: countMondaysInPeriod(firstStart, firstEnd),
      });
      
      // Second half: 16th to end of month
      const secondStart = new Date(year, month, 16);
      const secondEnd = lastDayOfMonth(secondStart);
      const secondPayDate = addDays(secondEnd, payDayOffset);
      
      periods.push({
        period_number: periodNum++,
        period_start: secondStart,
        period_end: secondEnd,
        pay_date: secondPayDate,
        monday_count: countMondaysInPeriod(secondStart, secondEnd),
      });
    }
    return periods;
  };

  const generateWeeklyPeriods = (year: number, cycleStartDate: Date): GeneratedPeriod[] => {
    const periods: GeneratedPeriod[] = [];
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 0, 1));
    
    // Start from the provided start date
    let currentStart = cycleStartDate;
    let periodNum = 1;
    
    // Generate periods that fall within or overlap the year
    while (isBefore(currentStart, yearEnd) || currentStart.getFullYear() === year) {
      const periodEnd = addDays(currentStart, 6);
      const payDate = addDays(periodEnd, payDayOffset);
      
      // Include if period end is in target year or period overlaps the year
      if (periodEnd.getFullYear() === year || 
          (currentStart.getFullYear() < year && periodEnd.getFullYear() >= year)) {
        periods.push({
          period_number: periodNum++,
          period_start: currentStart,
          period_end: periodEnd,
          pay_date: payDate,
          monday_count: countMondaysInPeriod(currentStart, periodEnd),
        });
      }
      
      currentStart = addDays(currentStart, 7);
      
      // Stop if we've gone past the year
      if (currentStart.getFullYear() > year && periodNum > 1) break;
      if (periodNum > 54) break; // Safety limit
    }
    
    return periods;
  };

  const generateBiweeklyPeriods = (year: number, cycleStartDate: Date): GeneratedPeriod[] => {
    const periods: GeneratedPeriod[] = [];
    const yearEnd = endOfYear(new Date(year, 0, 1));
    
    let currentStart = cycleStartDate;
    let periodNum = 1;
    
    while (isBefore(currentStart, yearEnd) || currentStart.getFullYear() === year) {
      const periodEnd = addDays(currentStart, 13);
      const payDate = addDays(periodEnd, payDayOffset);
      
      if (periodEnd.getFullYear() === year || 
          (currentStart.getFullYear() < year && periodEnd.getFullYear() >= year)) {
        periods.push({
          period_number: periodNum++,
          period_start: currentStart,
          period_end: periodEnd,
          pay_date: payDate,
          monday_count: countMondaysInPeriod(currentStart, periodEnd),
        });
      }
      
      currentStart = addDays(currentStart, 14);
      
      if (currentStart.getFullYear() > year && periodNum > 1) break;
      if (periodNum > 28) break; // Safety limit
    }
    
    return periods;
  };

  const handleGeneratePreview = () => {
    let periods: GeneratedPeriod[] = [];
    
    switch (payGroup.pay_frequency) {
      case "monthly":
        periods = generateMonthlyPeriods(selectedYear);
        break;
      case "semimonthly":
        periods = generateSemiMonthlyPeriods(selectedYear);
        break;
      case "weekly": {
        if (!startDate) {
          toast.error("Please enter a start date for weekly pay periods");
          return;
        }
        const cycleStart = parseISO(startDate);
        periods = generateWeeklyPeriods(selectedYear, cycleStart);
        break;
      }
      case "biweekly": {
        if (!startDate) {
          toast.error("Please enter a start date for bi-weekly pay periods");
          return;
        }
        const cycleStart = parseISO(startDate);
        periods = generateBiweeklyPeriods(selectedYear, cycleStart);
        break;
      }
    }
    
    setPreviewPeriods(periods);
  };

  const handleSavePeriods = async () => {
    if (previewPeriods.length === 0) {
      toast.error("No periods to save. Generate preview first.");
      return;
    }

    setIsSaving(true);
    try {
      // Check for existing periods for this pay group and year
      const { data: existing } = await supabase
        .from("pay_periods")
        .select("id")
        .eq("pay_group_id", payGroup.id)
        .eq("year", selectedYear);
      
      if (existing && existing.length > 0) {
        const confirmed = confirm(`There are ${existing.length} existing periods for ${selectedYear}. Delete and regenerate?`);
        if (!confirmed) {
          setIsSaving(false);
          return;
        }
        
        // Delete existing periods
        await supabase
          .from("pay_periods")
          .delete()
          .eq("pay_group_id", payGroup.id)
          .eq("year", selectedYear);
      }

      // Get or create a schedule (for backward compatibility)
      let scheduleId: string;
      const { data: schedules } = await supabase
        .from("pay_period_schedules")
        .select("id")
        .eq("company_id", companyId)
        .limit(1);
      
      if (schedules && schedules.length > 0) {
        scheduleId = schedules[0].id;
      } else {
        const { data: newSchedule, error: scheduleError } = await supabase
          .from("pay_period_schedules")
          .insert({
            company_id: companyId,
            code: `${payGroup.code}-${selectedYear}`,
            name: `${payGroup.name} Schedule`,
            frequency: payGroup.pay_frequency === "biweekly" ? "bi_weekly" : 
                       payGroup.pay_frequency === "semimonthly" ? "semi_monthly" : 
                       payGroup.pay_frequency,
            is_active: true,
          })
          .select("id")
          .single();
        
        if (scheduleError) throw scheduleError;
        scheduleId = newSchedule.id;
      }

      // Insert periods
      const periodsToInsert = previewPeriods.map(p => ({
        company_id: companyId,
        schedule_id: scheduleId,
        pay_group_id: payGroup.id,
        period_number: `${selectedYear}-${String(p.period_number).padStart(2, "0")}`,
        period_start: format(p.period_start, "yyyy-MM-dd"),
        period_end: format(p.period_end, "yyyy-MM-dd"),
        pay_date: format(p.pay_date, "yyyy-MM-dd"),
        monday_count: p.monday_count,
        year: selectedYear,
        status: "open",
      }));

      const { error } = await supabase
        .from("pay_periods")
        .insert(periodsToInsert);

      if (error) throw error;

      toast.success(`Generated ${previewPeriods.length} pay periods for ${selectedYear}`);
      setDialogOpen(false);
      setPreviewPeriods([]);
      onGenerated();
    } catch (error: any) {
      console.error("Error saving periods:", error);
      toast.error(error.message || "Failed to save pay periods");
    } finally {
      setIsSaving(false);
    }
  };

  const getExpectedPeriodCount = () => {
    switch (payGroup.pay_frequency) {
      case "monthly": return 12;
      case "semimonthly": return 24;
      case "weekly": return "52-53";
      case "biweekly": return 26;
      default: return "?";
    }
  };

  const needsStartDate = payGroup.pay_frequency === "weekly" || payGroup.pay_frequency === "biweekly";

  return (
    <>
      <Button onClick={() => setDialogOpen(true)} variant="outline">
        <Calendar className="h-4 w-4 mr-2" />
        Generate Calendar
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Generate Payroll Calendar - {payGroup.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Configuration */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="space-y-2">
                    <Label>Pay Frequency</Label>
                    <Badge variant="secondary" className="text-sm">
                      {payGroup.pay_frequency === "monthly" && "Monthly (12 periods)"}
                      {payGroup.pay_frequency === "semimonthly" && "Bi-Monthly (24 periods)"}
                      {payGroup.pay_frequency === "weekly" && "Weekly (52-53 periods)"}
                      {payGroup.pay_frequency === "biweekly" && "Fortnightly (26 periods)"}
                    </Badge>
                  </div>

                  {payGroup.uses_national_insurance && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-success" />
                      National Insurance (Monday count tracked)
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      min={currentYear - 1}
                      max={currentYear + 2}
                    />
                  </div>

                  {needsStartDate && (
                    <div className="space-y-2">
                      <Label>
                        Cycle Start Date
                        <span className="text-destructive ml-1">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="e.g., late December of previous year"
                      />
                      <p className="text-xs text-muted-foreground">
                        Can be in late December of previous year
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Pay Day Offset (days after period end)</Label>
                    <Input
                      type="number"
                      value={payDayOffset}
                      onChange={(e) => setPayDayOffset(parseInt(e.target.value) || 0)}
                      min={0}
                      max={14}
                    />
                  </div>
                </div>

                <Button onClick={handleGeneratePreview}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Preview
                </Button>
              </CardContent>
            </Card>

            {/* Preview Table */}
            {previewPeriods.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>Preview ({previewPeriods.length} periods)</span>
                    {previewPeriods.length !== parseInt(String(getExpectedPeriodCount())) && 
                     typeof getExpectedPeriodCount() === "number" && (
                      <Badge variant="outline" className="text-warning">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Expected {getExpectedPeriodCount()} periods
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">#</TableHead>
                          <TableHead>Period Start</TableHead>
                          <TableHead>Period End</TableHead>
                          <TableHead>Pay Date</TableHead>
                          {payGroup.uses_national_insurance && (
                            <TableHead className="text-center">Mondays</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewPeriods.map((period) => (
                          <TableRow key={period.period_number}>
                            <TableCell className="font-medium">{period.period_number}</TableCell>
                            <TableCell>{format(period.period_start, "MMM d, yyyy")}</TableCell>
                            <TableCell>{format(period.period_end, "MMM d, yyyy")}</TableCell>
                            <TableCell>{format(period.pay_date, "MMM d, yyyy")}</TableCell>
                            {payGroup.uses_national_insurance && (
                              <TableCell className="text-center">
                                <Badge variant="outline">{period.monday_count}</Badge>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSavePeriods} 
              disabled={previewPeriods.length === 0 || isSaving}
            >
              {isSaving ? "Saving..." : `Save ${previewPeriods.length} Periods`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
