import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { Plus, ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Building2 } from "lucide-react";

interface Company {
  id: string;
  name: string;
}

// Helper to avoid deep type instantiation
const query = (table: string) => supabase.from(table as any);

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  event_type: string;
  location: string | null;
  is_all_day: boolean;
}

const eventTypes = [
  { value: "meeting", label: "Meeting", color: "bg-blue-500" },
  { value: "deadline", label: "Deadline", color: "bg-red-500" },
  { value: "training", label: "Training", color: "bg-green-500" },
  { value: "holiday", label: "Holiday", color: "bg-purple-500" },
  { value: "other", label: "Other", color: "bg-gray-500" },
];

export default function HRCalendarPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    event_type: "meeting",
    location: "",
    is_all_day: false,
    company_id: "",
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    loadEvents();
  }, [currentMonth]);

  const loadCompanies = async () => {
    const res: any = await query("companies")
      .select("id, name")
      .eq("is_active", true)
      .order("name");
    setCompanies(res.data || []);
  };

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const start = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const end = format(endOfMonth(currentMonth), "yyyy-MM-dd");

      const res: any = await query("team_calendar_events")
        .select("*")
        .gte("event_date", start)
        .lte("event_date", end)
        .order("event_date");

      setEvents(res.data || []);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      event_date: format(date, "yyyy-MM-dd"),
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.event_date || !formData.company_id) {
      toast({ title: t("common.error"), description: "Title, date and company are required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res: any = await query("team_calendar_events").insert({
        ...formData,
        company_id: formData.company_id,
        created_by: profile?.id,
      });

      if (res.error) throw res.error;

      toast({ title: t("common.success"), description: t("common.created") });
      setDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        event_date: "",
        event_time: "",
        event_type: "meeting",
        location: "",
        is_all_day: false,
        company_id: "",
      });
      loadEvents();
    } catch (error) {
      toast({ title: t("common.error"), description: t("common.error"), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const getEventsForDay = (date: Date) =>
    events
      .filter((e) => selectedCompany === "all" || (e as any).company_id === selectedCompany)
      .filter((e) => isSameDay(new Date(e.event_date), date));

  const getEventColor = (type: string) =>
    eventTypes.find((t) => t.value === type)?.color || "bg-gray-500";

  const eventTypeLabels: Record<string, string> = {
    meeting: t("hrHub.meeting"),
    deadline: t("hrHub.deadline"),
    training: t("hrHub.training"),
    holiday: t("hrHub.holiday"),
    other: t("hrHub.other"),
  };

  const dayNames = [
    t("hrHub.sun"), t("hrHub.mon"), t("hrHub.tue"), t("hrHub.wed"),
    t("hrHub.thu"), t("hrHub.fri"), t("hrHub.sat")
  ];

  const breadcrumbItems = [
    { label: t("hrHub.title"), href: "/hr-hub" },
    { label: t("hrHub.calendar") },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("hrHub.calendar")}</h1>
            <p className="text-muted-foreground">{t("hrHub.calendarSubtitle")}</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("hrHub.addEvent")}
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {format(currentMonth, "MMMM yyyy")}
            </CardTitle>
            <div className="flex gap-2 items-center">
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-[180px]">
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">{t("common.loading")}</div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-px mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
                  {Array.from({ length: new Date(days[0]).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-background min-h-[100px] p-2" />
                  ))}
                  {days.map((day) => {
                    const dayEvents = getEventsForDay(day);
                    const isToday = isSameDay(day, new Date());
                    return (
                      <div
                        key={day.toISOString()}
                        onClick={() => handleDateClick(day)}
                        className={`bg-background min-h-[100px] p-2 cursor-pointer hover:bg-muted/50 transition-colors ${
                          isToday ? "ring-2 ring-primary ring-inset" : ""
                        }`}
                      >
                        <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
                          {format(day, "d")}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded truncate text-white ${getEventColor(event.event_type)}`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-muted-foreground">+{dayEvents.length - 3} {t("hrHub.more")}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("hrHub.addEventTitle")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Company *</Label>
                <Select value={formData.company_id} onValueChange={(v) => setFormData({ ...formData, company_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("common.name")} *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t("hrHub.eventTitle")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("hrHub.date")} *</Label>
                  <Input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t("hrHub.time")}</Label>
                  <Input
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>{t("hrHub.eventType")}</Label>
                <Select value={formData.event_type} onValueChange={(v) => setFormData({ ...formData, event_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {eventTypeLabels[type.value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("hrHub.eventLocation")}</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder={t("hrHub.optionalLocation")}
                />
              </div>
              <div>
                <Label>{t("common.description")}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t("hrHub.eventDescription")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? t("hrHub.creating") : t("hrHub.createEvent")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
