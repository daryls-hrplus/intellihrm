import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useLeaveManagement } from "@/hooks/useLeaveManagement";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Plus, CalendarDays, PartyPopper } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function LeaveHolidaysPage() {
  const { company } = useAuth();
  const { holidays, loadingHolidays, createHoliday } = useLeaveManagement(company?.id);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    holiday_date: undefined as Date | undefined,
    is_recurring: false,
    is_half_day: false,
    applies_to_all: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      holiday_date: undefined,
      is_recurring: false,
      is_half_day: false,
      applies_to_all: true,
    });
  };

  const handleSubmit = async () => {
    if (!company?.id || !formData.name || !formData.holiday_date) return;

    await createHoliday.mutateAsync({
      company_id: company.id,
      name: formData.name,
      holiday_date: format(formData.holiday_date, "yyyy-MM-dd"),
      is_recurring: formData.is_recurring,
      is_half_day: formData.is_half_day,
      applies_to_all: formData.applies_to_all,
    });
    setIsOpen(false);
    resetForm();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Leave Management", href: "/leave" },
            { label: "Company Holidays" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <PartyPopper className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Company Holidays</h1>
              <p className="text-muted-foreground">Manage holidays that don't count against leave balances</p>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Holiday
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Company Holiday</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Holiday Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., New Year's Day"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.holiday_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {formData.holiday_date ? format(formData.holiday_date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.holiday_date}
                        onSelect={(date) => setFormData({ ...formData, holiday_date: date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="is_recurring">Recurring Annually</Label>
                    <p className="text-xs text-muted-foreground">Repeats every year on the same date</p>
                  </div>
                  <Switch
                    id="is_recurring"
                    checked={formData.is_recurring}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="is_half_day">Half Day</Label>
                    <p className="text-xs text-muted-foreground">Only half the day is off</p>
                  </div>
                  <Switch
                    id="is_half_day"
                    checked={formData.is_half_day}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_half_day: checked })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="applies_to_all">Applies to All</Label>
                    <p className="text-xs text-muted-foreground">Applies to all departments</p>
                  </div>
                  <Switch
                    id="applies_to_all"
                    checked={formData.applies_to_all}
                    onCheckedChange={(checked) => setFormData({ ...formData, applies_to_all: checked })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={!formData.name || !formData.holiday_date}>
                    Add Holiday
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Holiday</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Recurring</TableHead>
                <TableHead>Applies To</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingHolidays ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : holidays.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No holidays configured. Add company holidays to exclude from leave calculations.
                  </TableCell>
                </TableRow>
              ) : (
                holidays.map((holiday) => (
                  <TableRow key={holiday.id}>
                    <TableCell className="font-medium">{holiday.name}</TableCell>
                    <TableCell>{format(new Date(holiday.holiday_date), "EEEE, MMMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant={holiday.is_half_day ? "secondary" : "default"}>
                        {holiday.is_half_day ? "Half Day" : "Full Day"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={holiday.is_recurring ? "default" : "secondary"}>
                        {holiday.is_recurring ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {holiday.applies_to_all ? "All Departments" : "Selected"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={holiday.is_active ? "default" : "secondary"}>
                        {holiday.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
