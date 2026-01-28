import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { useVendorCourses } from "@/hooks/useVendorCourses";
import {
  BookOpen,
  Plus,
  Loader2,
  Clock,
  Award,
  Edit,
  Trash2,
} from "lucide-react";
import type { VendorCourse } from "@/types/vendor";

const courseFormSchema = z.object({
  course_code: z.string().optional(),
  course_name: z.string().min(1, "Course name is required"),
  description: z.string().optional(),
  delivery_method: z.string().default("classroom"),
  duration_hours: z.coerce.number().optional(),
  duration_days: z.coerce.number().optional(),
  base_price: z.coerce.number().optional(),
  base_currency: z.string().optional(),
  certification_name: z.string().optional(),
  certification_validity_months: z.coerce.number().optional(),
  prerequisites: z.string().optional(),
  target_audience: z.string().optional(),
  is_active: z.boolean().default(true),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface VendorCoursesTabProps {
  vendorId: string;
}

export function VendorCoursesTab({ vendorId }: VendorCoursesTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<VendorCourse | null>(null);
  const { courses, isLoading, createCourse, updateCourse, deleteCourse, toggleCourseActive } =
    useVendorCourses(vendorId);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      course_code: "",
      course_name: "",
      description: "",
      delivery_method: "classroom",
      duration_hours: undefined,
      duration_days: undefined,
      base_price: undefined,
      base_currency: "USD",
      certification_name: "",
      certification_validity_months: undefined,
      prerequisites: "",
      target_audience: "",
      is_active: true,
    },
  });

  const openDialog = (course?: VendorCourse) => {
    if (course) {
      setEditingCourse(course);
      form.reset({
        course_code: course.course_code || "",
        course_name: course.course_name,
        description: course.description || "",
        delivery_method: course.delivery_method,
        duration_hours: course.duration_hours || undefined,
        duration_days: course.duration_days || undefined,
        base_price: course.base_price || undefined,
        base_currency: course.base_currency || "USD",
        certification_name: course.certification_name || "",
        certification_validity_months: course.certification_validity_months || undefined,
        prerequisites: course.prerequisites || "",
        target_audience: course.target_audience || "",
        is_active: course.is_active,
      });
    } else {
      setEditingCourse(null);
      form.reset();
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: CourseFormValues) => {
    const payload = {
      course_code: data.course_code,
      course_name: data.course_name,
      description: data.description,
      delivery_method: data.delivery_method,
      duration_hours: data.duration_hours,
      duration_days: data.duration_days,
      base_price: data.base_price,
      base_currency: data.base_currency,
      certification_name: data.certification_name,
      certification_validity_months: data.certification_validity_months,
      prerequisites: data.prerequisites,
      target_audience: data.target_audience,
      is_active: data.is_active,
    };

    if (editingCourse) {
      await updateCourse.mutateAsync({ id: editingCourse.id, ...payload });
    } else {
      await createCourse.mutateAsync({ ...payload, vendor_id: vendorId });
    }
    setIsDialogOpen(false);
    form.reset();
  };

  const getDeliveryBadge = (method: string) => {
    const colors: Record<string, string> = {
      classroom: "bg-blue-100 text-blue-800",
      virtual: "bg-purple-100 text-purple-800",
      hybrid: "bg-green-100 text-green-800",
      online: "bg-orange-100 text-orange-800",
      on_the_job: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge variant="outline" className={colors[method] || colors.classroom}>
        {method.replace(/_/g, " ")}
      </Badge>
    );
  };

  const isPending = createCourse.isPending || updateCourse.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Course Catalog ({courses.length})
        </CardTitle>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No courses in the catalog</p>
            <p className="text-sm mt-1">Add courses offered by this vendor</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Certification</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{course.course_name}</p>
                      {course.course_code && (
                        <p className="text-sm text-muted-foreground">{course.course_code}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getDeliveryBadge(course.delivery_method)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-3 w-3" />
                      {course.duration_days
                        ? `${course.duration_days}d`
                        : course.duration_hours
                        ? `${course.duration_hours}h`
                        : "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {course.base_price
                      ? `${course.base_currency || "USD"} ${course.base_price.toFixed(2)}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {course.certification_name ? (
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-warning" />
                        <span className="text-sm">{course.certification_name}</span>
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={course.is_active}
                      onCheckedChange={(checked) =>
                        toggleCourseActive.mutate({ id: course.id, is_active: checked })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(course)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCourse.mutate(course.id)}
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

      {/* Course Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "Add Course"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="course_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Code</FormLabel>
                      <FormControl>
                        <Input placeholder="CRS-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="course_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Leadership Fundamentals" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Course description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="delivery_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="classroom">Classroom</SelectItem>
                          <SelectItem value="virtual">Virtual</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="on_the_job">On the Job</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (Hours)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="base_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="base_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Input placeholder="USD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="certification_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certification Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Certificate of Completion" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="certification_validity_months"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Validity (Months)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="prerequisites"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prerequisites</FormLabel>
                    <FormControl>
                      <Input placeholder="Prior training requirements..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Course is available for enrollment
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingCourse ? "Update" : "Add"} Course
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
