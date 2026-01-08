import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Award, Clock, Bell } from "lucide-react";
import { format, differenceInDays, isToday, isTomorrow, isPast } from "date-fns";
import { useNavigate } from "react-router-dom";

interface ImportantDate {
  id: string;
  date: string;
  label: string;
  type: "leave" | "document" | "appraisal" | "reminder" | "milestone";
  path: string;
}

export function ImportantDatesStrip() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: dates = [], isLoading } = useQuery({
    queryKey: ["ess-important-dates", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const importantDates: ImportantDate[] = [];
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const todayStr = today.toISOString().split("T")[0];
      const thirtyDaysStr = thirtyDaysFromNow.toISOString().split("T")[0];

      // 1. Upcoming leave dates
      const { data: leaveRequests } = await supabase
        .from("leave_requests")
        .select("id, start_date, leave_types(name)")
        .eq("employee_id", user.id)
        .in("status", ["approved", "pending"])
        .gte("start_date", todayStr)
        .lte("start_date", thirtyDaysStr)
        .order("start_date", { ascending: true })
        .limit(3);

      (leaveRequests || []).forEach(lr => {
        const leaveType = lr.leave_types as { name: string } | null;
        importantDates.push({
          id: `leave-${lr.id}`,
          date: lr.start_date,
          label: leaveType?.name || "Leave",
          type: "leave",
          path: "/ess/leave",
        });
      });

      // 2. Expiring documents
      const { data: documents } = await supabase
        .from("employee_documents")
        .select("id, document_name, document_type, expiry_date")
        .eq("employee_id", user.id)
        .gte("expiry_date", todayStr)
        .lte("expiry_date", thirtyDaysStr)
        .order("expiry_date", { ascending: true })
        .limit(3);

      (documents || []).forEach(doc => {
        importantDates.push({
          id: `doc-${doc.id}`,
          date: doc.expiry_date!,
          label: doc.document_name || doc.document_type || "Document",
          type: "document",
          path: "/ess/documents",
        });
      });

      // 3. Appraisal due dates
      const { data: appraisals } = await supabase
        .from("appraisal_participants")
        .select("id, appraisal_cycles(name, end_date)")
        .eq("employee_id", user.id)
        .in("status", ["pending", "in_progress"]);

      (appraisals || []).forEach(ap => {
        const cycle = ap.appraisal_cycles as { name: string; end_date: string } | null;
        if (cycle?.end_date && new Date(cycle.end_date) >= today && new Date(cycle.end_date) <= thirtyDaysFromNow) {
          importantDates.push({
            id: `apr-${ap.id}`,
            date: cycle.end_date,
            label: cycle.name || "Appraisal",
            type: "appraisal",
            path: "/ess/my-appraisals",
          });
        }
      });

      // 4. Upcoming reminders (event dates)
      const { data: reminders } = await supabase
        .from("employee_reminders")
        .select("id, title, event_date")
        .eq("employee_id", user.id)
        .eq("status", "pending")
        .gte("event_date", todayStr)
        .lte("event_date", thirtyDaysStr)
        .order("event_date", { ascending: true })
        .limit(3);

      (reminders || []).forEach(rem => {
        importantDates.push({
          id: `rem-${rem.id}`,
          date: rem.event_date,
          label: rem.title,
          type: "reminder",
          path: "/ess/reminders",
        });
      });

      // Sort by date and limit
      return importantDates
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 6);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const getIcon = (type: ImportantDate["type"]) => {
    switch (type) {
      case "leave":
        return <Calendar className="h-3 w-3" />;
      case "document":
        return <FileText className="h-3 w-3" />;
      case "appraisal":
        return <Award className="h-3 w-3" />;
      case "reminder":
        return <Bell className="h-3 w-3" />;
      case "milestone":
        return <Award className="h-3 w-3" />;
    }
  };

  const getDateLabel = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return "Today";
    if (isTomorrow(d)) return "Tomorrow";
    const days = differenceInDays(d, new Date());
    if (days <= 7) return `In ${days} days`;
    return format(d, "MMM d");
  };

  const getVariant = (date: string, type: ImportantDate["type"]): "default" | "secondary" | "destructive" | "outline" => {
    const days = differenceInDays(new Date(date), new Date());
    
    if (type === "document" && days <= 7) return "destructive";
    if (isToday(new Date(date))) return "default";
    if (days <= 3) return "secondary";
    return "outline";
  };

  if (isLoading || dates.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
        <Clock className="h-4 w-4" />
        Important Dates:
      </span>
      {dates.map((item) => (
        <Badge
          key={item.id}
          variant={getVariant(item.date, item.type)}
          className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1.5"
          onClick={() => navigate(item.path)}
        >
          {getIcon(item.type)}
          <span className="font-medium">{getDateLabel(item.date)}:</span>
          <span className="truncate max-w-[120px]">{item.label}</span>
        </Badge>
      ))}
    </div>
  );
}
