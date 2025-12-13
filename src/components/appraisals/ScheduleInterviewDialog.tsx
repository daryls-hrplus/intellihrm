import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Video, Phone, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppraisalInterviews, AppraisalInterview } from "@/hooks/useAppraisalInterviews";

interface ScheduleInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantId: string;
  participantName: string;
  cycleName: string;
  existingInterview?: AppraisalInterview | null;
  onSuccess?: () => void;
}

export function ScheduleInterviewDialog({
  open,
  onOpenChange,
  participantId,
  participantName,
  cycleName,
  existingInterview,
  onSuccess,
}: ScheduleInterviewDialogProps) {
  const { createInterview, updateInterview, loading } = useAppraisalInterviews();
  
  const [date, setDate] = useState<Date | undefined>(
    existingInterview ? new Date(existingInterview.scheduled_at) : undefined
  );
  const [time, setTime] = useState(
    existingInterview ? format(new Date(existingInterview.scheduled_at), "HH:mm") : "09:00"
  );
  const [duration, setDuration] = useState(
    existingInterview?.duration_minutes?.toString() || "60"
  );
  const [meetingType, setMeetingType] = useState<"in_person" | "video_call" | "phone_call">(
    existingInterview?.meeting_type || "in_person"
  );
  const [location, setLocation] = useState(existingInterview?.location || "");
  const [meetingLink, setMeetingLink] = useState(existingInterview?.meeting_link || "");
  const [agenda, setAgenda] = useState(existingInterview?.agenda || "");

  useEffect(() => {
    if (existingInterview) {
      setDate(new Date(existingInterview.scheduled_at));
      setTime(format(new Date(existingInterview.scheduled_at), "HH:mm"));
      setDuration(existingInterview.duration_minutes?.toString() || "60");
      setMeetingType(existingInterview.meeting_type);
      setLocation(existingInterview.location || "");
      setMeetingLink(existingInterview.meeting_link || "");
      setAgenda(existingInterview.agenda || "");
    } else {
      setDate(undefined);
      setTime("09:00");
      setDuration("60");
      setMeetingType("in_person");
      setLocation("");
      setMeetingLink("");
      setAgenda("");
    }
  }, [existingInterview, open]);

  const handleSubmit = async () => {
    if (!date) return;

    const [hours, minutes] = time.split(":").map(Number);
    const scheduledAt = new Date(date);
    scheduledAt.setHours(hours, minutes, 0, 0);

    const interviewData = {
      participant_id: participantId,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: parseInt(duration),
      meeting_type: meetingType,
      location: location || null,
      meeting_link: meetingLink || null,
      agenda: agenda || null,
    };

    let result;
    if (existingInterview) {
      result = await updateInterview(existingInterview.id, interviewData);
    } else {
      result = await createInterview(interviewData);
    }

    if (result) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case "video_call":
        return <Video className="h-4 w-4" />;
      case "phone_call":
        return <Phone className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingInterview ? "Reschedule Interview" : "Schedule Appraisal Interview"}
          </DialogTitle>
          <DialogDescription>
            {existingInterview ? "Update the interview details for" : "Schedule an appraisal interview with"}{" "}
            <span className="font-medium">{participantName}</span> for{" "}
            <span className="font-medium">{cycleName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Meeting Type */}
          <div className="space-y-2">
            <Label>Meeting Type</Label>
            <Select value={meetingType} onValueChange={(v) => setMeetingType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_person">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    In Person
                  </div>
                </SelectItem>
                <SelectItem value="video_call">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video Call
                  </div>
                </SelectItem>
                <SelectItem value="phone_call">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Call
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location or Meeting Link */}
          {meetingType === "in_person" ? (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Conference Room A, Building 2"
              />
            </div>
          ) : meetingType === "video_call" ? (
            <div className="space-y-2">
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
              />
            </div>
          ) : null}

          {/* Agenda */}
          <div className="space-y-2">
            <Label htmlFor="agenda">Agenda (optional)</Label>
            <Textarea
              id="agenda"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="Topics to discuss during the interview..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!date || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingInterview ? "Update Interview" : "Schedule Interview"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
