import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar, RefreshCw, AlertCircle, Check } from "lucide-react";
import { format, addDays, subDays, startOfYear, endOfYear, isMonday, isWeekend, eachDayOfInterval, lastDayOfMonth, isBefore } from "date-fns";
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
  const [isSaving, setIsSaving] = useState(false);
  const [holidays, setHolidays] = useState<Date[]>([]);
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [startDate, setStartDate] = useState<string>("");
  const [startingCycleNumber, setStartingCycleNumber] = useState(1);
  const [payDayOffsetInput, setPayDayOffsetInput] = useState("0");
  const [previewMeta, setPreviewMeta] = useState<{
    year: number;
    startDate: string;
    startingCycleNumber: number;
    payDayOffset: number;
  } | null>(null);

  const clearPreview = () => {
    if (previewPeriods.length === 0) return;
    setPreviewPeriods([]);
    setPreviewMeta(null);
  };

  // Fetch holidays for the company
  useEffect(() => {
    const fetchHolidays = async () => {
      if (!companyId) return;
      
      const yearStart = `${selectedYear}-01-01`;
      const yearEnd = `${selectedYear}-12-31`;
      
      // Fetch company-specific holidays
      const { data: companyHolidays } = await supabase
        .from('leave_holidays')
        .select('holiday_date')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .gte('holiday_date', yearStart)
        .lte('holiday_date', yearEnd);
      
      // Fetch country holidays (if company has country set)
      const { data: countryHolidays } = await supabase
        .from('country_holidays')
        .select('holiday_date')
        .eq('is_active', true)
        .gte('holiday_date', yearStart)
        .lte('holiday_date', yearEnd);
      
      const allHolidayDates = [
        ...(companyHolidays || []).map(h => new Date(h.holiday_date)),
        ...(countryHolidays || []).map(h => new Date(h.holiday_date))
      ];
      
      setHolidays(allHolidayDates);
    };
    
    fetchHolidays();
  }, [companyId, selectedYear]);

  // Check if a date is a holiday
  const isHoliday = (date: Date): boolean => {
    return holidays.some(h => 
      h.getFullYear() === date.getFullYear() &&
      h.getMonth() === date.getMonth() &&
      h.getDate() === date.getDate()
    );
  };

  // Adjust pay date to previous business day if it falls on weekend or holiday
  const adjustPayDate = (date: Date): Date => {
    let adjustedDate = new Date(date);
    
    // Keep moving to previous day while it's a weekend or holiday
    while (isWeekend(adjustedDate) || isHoliday(adjustedDate)) {
      adjustedDate = subDays(adjustedDate, 1);
    }
    
    return adjustedDate;
  };

  const clampPayDayOffset = (n: number) => Math.max(-30, Math.min(30, n));

  const getPayDayOffsetNumber = () => {
    const raw = payDayOffsetInput.trim();
    if (raw === "" || raw === "-") return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? clampPayDayOffset(n) : 0;
  };

  // Calculate pay date with offset and adjustment
  const calculatePayDate = (periodEnd: Date): Date => {
    const rawPayDate = addDays(periodEnd, getPayDayOffsetNumber());
    return adjustPayDate(rawPayDate);
  };

  // Get max cycles per year based on frequency
  const getMaxCyclesPerYear = (frequency: string): number => {
    switch (frequency) {
      case "monthly": return 12;
      case "semimonthly": return 24;
      case "biweekly": return 26;
      case "weekly": return 52;
      default: return 12;
    }
  };

  // Track if we're auto-updating the year to prevent double-increment
  const isAutoUpdatingYear = useRef(false);

  // Check for existing cycles and calculate next available cycle number
  useEffect(() => {
    if (!payGroup?.id || !payGroup?.pay_frequency) return;
    
    // Skip if we just auto-updated the year
    if (isAutoUpdatingYear.current) {
      isAutoUpdatingYear.current = false;
      return;
    }
    
    const fetchExistingCycles = async () => {
      // Query existing pay periods for this pay group and year
      const { data: existingPeriods } = await supabase
        .from("pay_periods")
        .select("period_number, period_end")
        .eq("pay_group_id", payGroup.id)
        .eq("year", selectedYear)
        .order("period_number", { ascending: false });
      
      const maxCycles = getMaxCyclesPerYear(payGroup.pay_frequency);
      
      if (existingPeriods && existingPeriods.length > 0) {
        // Extract the numeric cycle number from period_number (format: "YYYY-NN")
        const lastPeriodNumber = existingPeriods[0].period_number;
        const lastCycleNum = parseInt(lastPeriodNumber.split("-")[1], 10);
        
        // Check if all cycles for the year are already generated
        if (lastCycleNum >= maxCycles) {
          // Year is complete - update year to next year and set cycle 1
          const nextYear = selectedYear + 1;
          isAutoUpdatingYear.current = true;
          setSelectedYear(nextYear);
          setStartingCycleNumber(1);
          setStartDate(format(new Date(nextYear, 0, 1), "yyyy-MM-dd"));
        } else {
          // Set next available cycle number
          setStartingCycleNumber(lastCycleNum + 1);
          
          // Calculate next start date based on last period's end date
          const lastEndDate = new Date(existingPeriods[0].period_end);
          const nextStartDate = addDays(lastEndDate, 1);
          setStartDate(format(nextStartDate, "yyyy-MM-dd"));
        }
      } else {
        // No existing cycles - default to cycle 1 at start of year
        setStartingCycleNumber(1);
        setStartDate(format(new Date(selectedYear, 0, 1), "yyyy-MM-dd"));
      }
    };
    
    fetchExistingCycles();
  }, [payGroup.id, payGroup.pay_frequency, selectedYear]);

  const countMondaysInPeriod = (start: Date, end: Date): number => {
    const days = eachDayOfInterval({ start, end });
    return days.filter(day => isMonday(day)).length;
  };

  const generateMonthlyPeriods = (year: number, startCycle: number, cycleStartDate: Date): GeneratedPeriod[] => {
    const periods: GeneratedPeriod[] = [];
    const startMonth = cycleStartDate.getMonth();
    
    for (let month = startMonth; month < 12; month++) {
      const periodStart = new Date(year, month, 1);
      const periodEnd = lastDayOfMonth(periodStart);
      const payDate = calculatePayDate(periodEnd);
      
      periods.push({
        period_number: startCycle + (month - startMonth),
        period_start: periodStart,
        period_end: periodEnd,
        pay_date: payDate,
        monday_count: countMondaysInPeriod(periodStart, periodEnd),
      });
    }
    return periods;
  };

  const generateSemiMonthlyPeriods = (year: number, startCycle: number, cycleStartDate: Date): GeneratedPeriod[] => {
    const periods: GeneratedPeriod[] = [];
    const startMonth = cycleStartDate.getMonth();
    const startDay = cycleStartDate.getDate();
    const startInSecondHalf = startDay > 15;
    
    let periodNum = startCycle;
    
    for (let month = startMonth; month < 12; month++) {
      const isFirstMonth = month === startMonth;
      
      // First half: 1st to 15th (skip if starting in second half of first month)
      if (!isFirstMonth || !startInSecondHalf) {
        const firstStart = new Date(year, month, 1);
        const firstEnd = new Date(year, month, 15);
        const firstPayDate = calculatePayDate(firstEnd);
        
        periods.push({
          period_number: periodNum++,
          period_start: firstStart,
          period_end: firstEnd,
          pay_date: firstPayDate,
          monday_count: countMondaysInPeriod(firstStart, firstEnd),
        });
      }
      
      // Second half: 16th to end of month
      const secondStart = new Date(year, month, 16);
      const secondEnd = lastDayOfMonth(secondStart);
      const secondPayDate = calculatePayDate(secondEnd);
      
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

  const generateWeeklyPeriods = (year: number, startCycle: number, cycleStartDate: Date): GeneratedPeriod[] => {
    const periods: GeneratedPeriod[] = [];
    const yearEnd = endOfYear(new Date(year, 0, 1));
    
    let currentStart = cycleStartDate;
    let periodNum = startCycle;
    
    while (isBefore(currentStart, yearEnd) || currentStart.getFullYear() === year) {
      const periodEnd = addDays(currentStart, 6);
      const payDate = calculatePayDate(periodEnd);
      
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
      
      if (currentStart.getFullYear() > year && periodNum > startCycle) break;
      if (periodNum > startCycle + 54) break;
    }
    
    return periods;
  };

  const generateBiweeklyPeriods = (year: number, startCycle: number, cycleStartDate: Date): GeneratedPeriod[] => {
    const periods: GeneratedPeriod[] = [];
    const yearEnd = endOfYear(new Date(year, 0, 1));
    
    let currentStart = cycleStartDate;
    let periodNum = startCycle;
    
    while (isBefore(currentStart, yearEnd) || currentStart.getFullYear() === year) {
      const periodEnd = addDays(currentStart, 13);
      const payDate = calculatePayDate(periodEnd);
      
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
      
      if (currentStart.getFullYear() > year && periodNum > startCycle) break;
      if (periodNum > startCycle + 28) break;
    }
    
    return periods;
  };

  const handleGeneratePreview = () => {
    if (!startDate) {
      toast.error("Please enter a cycle start date");
      return;
    }

    if (startingCycleNumber < 1) {
      toast.error("Starting cycle number must be at least 1");
      return;
    }

    const cycleStart = new Date(`${startDate}T00:00:00`);
    const payDayOffset = getPayDayOffsetNumber();

    let periods: GeneratedPeriod[] = [];

    switch (payGroup.pay_frequency) {
      case "monthly":
        periods = generateMonthlyPeriods(selectedYear, startingCycleNumber, cycleStart);
        break;
      case "semimonthly":
        periods = generateSemiMonthlyPeriods(selectedYear, startingCycleNumber, cycleStart);
        break;
      case "weekly":
        periods = generateWeeklyPeriods(selectedYear, startingCycleNumber, cycleStart);
        break;
      case "biweekly":
        periods = generateBiweeklyPeriods(selectedYear, startingCycleNumber, cycleStart);
        break;
    }

    setPreviewMeta({
      year: selectedYear,
      startDate,
      startingCycleNumber,
      payDayOffset,
    });
    setPreviewPeriods(periods);
  };

  const handleSavePeriods = async () => {
    if (previewPeriods.length === 0) {
      toast.error("No periods to save. Generate preview first.");
      return;
    }

    setIsSaving(true);
    try {
      // Check for existing periods for this pay group and year with overlapping period numbers
      const previewYear = previewMeta?.year ?? selectedYear;
      const periodNumbers = previewPeriods.map(
        (p) => `${previewYear}-${String(p.period_number).padStart(2, "0")}`
      );
      
      const { data: existing } = await supabase
        .from("pay_periods")
        .select("id, period_number")
        .eq("pay_group_id", payGroup.id)
        .eq("year", previewYear)
        .in("period_number", periodNumbers);
      
      if (existing && existing.length > 0) {
        const confirmed = confirm(`There are ${existing.length} existing periods that will be replaced. Continue?`);
        if (!confirmed) {
          setIsSaving(false);
          return;
        }
        
        // Delete overlapping periods
        await supabase
          .from("pay_periods")
          .delete()
          .eq("pay_group_id", payGroup.id)
          .eq("year", previewYear)
          .in("period_number", periodNumbers);
      }

      // Get or create a schedule
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
            code: `${payGroup.code}-${previewYear}`,
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
        period_number: `${previewYear}-${String(p.period_number).padStart(2, "0")}`,
        period_start: format(p.period_start, "yyyy-MM-dd"),
        period_end: format(p.period_end, "yyyy-MM-dd"),
        pay_date: format(p.pay_date, "yyyy-MM-dd"),
        monday_count: p.monday_count,
        year: previewYear,
        status: "open",
      }));

      const { error } = await supabase
        .from("pay_periods")
        .insert(periodsToInsert);

      if (error) throw error;

      toast.success(`Generated ${previewPeriods.length} pay periods starting from cycle ${startingCycleNumber}`);
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

  const getMaxCycles = () => {
    switch (payGroup.pay_frequency) {
      case "monthly": return 12;
      case "semimonthly": return 24;
      case "weekly": return 53;
      case "biweekly": return 27;
      default: return 12;
    }
  };

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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={selectedYear}
                      onChange={(e) => {
                        clearPreview();
                        setSelectedYear(parseInt(e.target.value));
                      }}
                      min={currentYear - 1}
                      max={currentYear + 2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Cycle Start Date
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        clearPreview();
                        setStartDate(e.target.value);
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      First day of the first cycle to generate
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Starting Cycle Number
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={startingCycleNumber}
                      onChange={(e) => {
                        clearPreview();
                        setStartingCycleNumber(parseInt(e.target.value) || 1);
                      }}
                      min={1}
                      max={getMaxCycles()}
                    />
                    <p className="text-xs text-muted-foreground">
                      Cycle number for the start date (1-{getMaxCycles()})
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Pay Day Offset</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="-?[0-9]*"
                      value={payDayOffsetInput}
                      onChange={(e) => {
                        clearPreview();
                        setPayDayOffsetInput(e.target.value);
                      }}
                      onBlur={() => setPayDayOffsetInput(String(getPayDayOffsetNumber()))}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Days before (-) or after (+) period end. Auto-adjusts to previous business day if on weekend/holiday.
                    </p>
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
                    <span>Preview ({previewPeriods.length} periods, starting from cycle {startingCycleNumber})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[400px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">Cycle #</TableHead>
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
