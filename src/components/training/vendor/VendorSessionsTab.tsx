import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useVendorSessions } from "@/hooks/useVendorSessions";
import { useVendorCourses } from "@/hooks/useVendorCourses";
import {
  Calendar,
  Plus,
  Loader2,
  Users,
  MapPin,
  Video,
  Edit,
  Trash2,
  Clock,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import type { VendorSession } from "@/types/vendor";

const sessionFormSchema = z.object({
  vendor_course_id: z.string().min(1, "Course is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  location: z.string().optional(),
  location_type: z.string().default("onsite"),
  meeting_url: z.string().optional(),
  instructor_name: z.string().optional(),
  capacity: z.coerce.number().optional(),
  minimum_attendees: z.coerce.number().optional(),
  registration_deadline: z.string().optional(),
  cost_per_person: z.coerce.number().optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
});

type SessionFormValues = z.infer<typeof sessionFormSchema>;

interface VendorSessionsTabProps {
  vendorId: string;
}

export function VendorSessionsTab({ vendorId }: VendorSessionsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<VendorSession | null>(null);
  const { sessions, isLoading, createSession, updateSession, deleteSession, updateSessionStatus } =
    useVendorSessions(vendorId);
  const { courses } = useVendorCourses(vendorId);

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      vendor_course_id: "",
      start_date: "",
      end_date: "",
      start_time: "",
      end_time: "",
      location: "",
      location_type: "onsite",
      meeting_url: "",
      instructor_name: "",
      capacity: undefined,
      minimum_attendees: undefined,
      registration_deadline: "",
      cost_per_person: undefined,
      currency: "USD",
      notes: "",
    },
  });

  const openDialog = (session?: VendorSession) => {
    if (session) {
      setEditingSession(session);
      form.reset({
        vendor_course_id: session.vendor_course_id,
        start_date: session.start_date?.split("T")[0] || "",
        end_date: session.end_date?.split("T")[0] || "",
        start_time: session.start_time || "",
        end_time: session.end_time || "",
        location: session.location || "",
        location_type: session.location_type || "onsite",
        meeting_url: session.meeting_url || "",
        instructor_name: session.instructor_name || "",
        capacity: session.capacity || undefined,
        minimum_attendees: session.minimum_attendees || undefined,
        registration_deadline: session.registration_deadline?.split("T")[0] || "",
        cost_per_person: session.cost_per_person || undefined,
        currency: session.currency || "USD",
        notes: session.notes || "",
      });
    } else {
      setEditingSession(null);
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: SessionFormValues) => {
    const payload = {
      vendor_course_id: data.vendor_course_id,
      start_date: data.start_date,
      end_date: data.end_date,
      start_time: data.start_time,
      end_time: data.end_time,
      location: data.location,
      location_type: data.location_type,
      meeting_url: data.meeting_url,
      instructor_name: data.instructor_name,
      capacity: data.capacity,
      minimum_attendees: data.minimum_attendees,
      registration_deadline: data.registration_deadline,
      cost_per_person: data.cost_per_person,
      currency: data.currency,
      notes: data.notes,
    };

    if (editingSession) {
      await updateSession.mutateAsync({ id: editingSession.id, ...payload });
    } else {
      await createSession.mutateAsync(payload);
    }
    setIsDialogOpen(false);
    form.reset();
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <Badge variant="outline" className={colors[status] || colors.scheduled}>
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  const isPending = createSession.isPending || updateSession.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Sessions ({sessions.length})
        </CardTitle>
        <Button onClick={() => openDialog()} disabled={courses.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Session
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Add courses first before scheduling sessions</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No sessions scheduled</p>
            <p className="text-sm mt-1">Schedule training sessions with this vendor</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {session.vendor_course?.course_name || "Unknown Course"}
                      </p>
                      {session.instructor_name && (
                        <p className="text-sm text-muted-foreground">
                          Instructor: {session.instructor_name}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {format(parseISO(session.start_date), "MMM d, yyyy")}
                        {session.end_date &&
                          session.end_date !== session.start_date &&
                          ` - ${format(parseISO(session.end_date), "MMM d, yyyy")}`}
                      </div>
                      {session.start_time && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {session.start_time}
                          {session.end_time && ` - ${session.end_time}`}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {session.location_type === "virtual" || session.meeting_url ? (
                        <Video className="h-4 w-4 text-purple-600" />
                      ) : (
                        <MapPin className="h-4 w-4 text-blue-600" />
                      )}
                      <span className="text-sm">{session.location || "Virtual"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {session.registered_count}/{session.capacity || "∞"}
                      </span>
                      {session.waitlist_count > 0 && (
                        <Badge variant="outline" className="ml-1 text-xs">
                          +{session.waitlist_count} waitlist
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={session.status}
                      onValueChange={(value) =>
                        updateSessionStatus.mutate({ id: session.id, status: value })
                      }
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue>{getStatusBadge(session.status)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(session)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSession.mutate(session.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Session Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSession ? "Edit Session" : "Schedule Session"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="vendor_course_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.course_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="onsite">On-site</SelectItem>
                          <SelectItem value="virtual">Virtual</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location/Venue</FormLabel>
                      <FormControl>
                        <Input placeholder="Training Room A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="meeting_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://zoom.us/j/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="instructor_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Capacity</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cost_per_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost per Person</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registration_deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional session notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingSession ? "Update" : "Schedule"} Session
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
