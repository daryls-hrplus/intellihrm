import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, GraduationCap, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface LearningPathsTabProps {
  companyId: string;
}

interface LearningPath {
  id: string;
  name: string;
  code: string;
  description: string | null;
  target_audience: string | null;
  estimated_duration_hours: number | null;
  is_mandatory: boolean;
  is_active: boolean;
  courses?: { id: string; course: { title: string } }[];
}

interface Course {
  id: string;
  title: string;
}

export function LearningPathsTab({ companyId }: LearningPathsTabProps) {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [coursesDialogOpen, setCoursesDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    target_audience: "",
    estimated_duration_hours: "",
    is_mandatory: false,
  });

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    const [pathsRes, coursesRes] = await Promise.all([
      supabase
        .from("learning_paths")
        .select("*, courses:learning_path_courses(id, course:lms_courses(title))")
        .eq("company_id", companyId)
        .order("name"),
      supabase
        .from("lms_courses")
        .select("id, title")
        .eq("company_id", companyId)
        .eq("is_active", true),
    ]);

    if (pathsRes.data) setPaths(pathsRes.data);
    if (coursesRes.data) setCourses(coursesRes.data);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      toast.error("Name and code are required");
      return;
    }

    const payload = {
      company_id: companyId,
      name: formData.name,
      code: formData.code,
      description: formData.description || null,
      target_audience: formData.target_audience || null,
      estimated_duration_hours: formData.estimated_duration_hours ? parseInt(formData.estimated_duration_hours) : null,
      is_mandatory: formData.is_mandatory,
      is_active: true,
    };

    if (editingId) {
      const { error } = await supabase.from("learning_paths").update(payload).eq("id", editingId);
      if (error) {
        toast.error("Failed to update learning path");
      } else {
        toast.success("Learning path updated");
        closeDialog();
        loadData();
      }
    } else {
      const { error } = await supabase.from("learning_paths").insert(payload);
      if (error) {
        toast.error("Failed to create learning path");
      } else {
        toast.success("Learning path created");
        closeDialog();
        loadData();
      }
    }
  };

  const openManageCourses = async (path: LearningPath) => {
    setSelectedPath(path);
    const { data } = await supabase
      .from("learning_path_courses")
      .select("course_id")
      .eq("learning_path_id", path.id);
    setSelectedCourses(data?.map((c) => c.course_id) || []);
    setCoursesDialogOpen(true);
  };

  const saveCourses = async () => {
    if (!selectedPath) return;

    // Delete existing and insert new
    await supabase.from("learning_path_courses").delete().eq("learning_path_id", selectedPath.id);

    if (selectedCourses.length > 0) {
      const inserts = selectedCourses.map((courseId, i) => ({
        learning_path_id: selectedPath.id,
        course_id: courseId,
        sequence_order: i + 1,
      }));
      await supabase.from("learning_path_courses").insert(inserts);
    }

    toast.success("Courses updated");
    setCoursesDialogOpen(false);
    loadData();
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((c) => c !== courseId) : [...prev, courseId]
    );
  };

  const openEdit = (path: LearningPath) => {
    setEditingId(path.id);
    setFormData({
      name: path.name,
      code: path.code,
      description: path.description || "",
      target_audience: path.target_audience || "",
      estimated_duration_hours: path.estimated_duration_hours?.toString() || "",
      is_mandatory: path.is_mandatory,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      code: "",
      description: "",
      target_audience: "",
      estimated_duration_hours: "",
      is_mandatory: false,
    });
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Learning Paths</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Create Path</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Learning Path" : "Create Learning Path"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Code *</Label>
                    <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Input value={formData.target_audience} onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })} placeholder="e.g., New Managers" />
                  </div>
                  <div className="space-y-2">
                    <Label>Est. Duration (hours)</Label>
                    <Input type="number" value={formData.estimated_duration_hours} onChange={(e) => setFormData({ ...formData, estimated_duration_hours: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_mandatory"
                    checked={formData.is_mandatory}
                    onCheckedChange={(c) => setFormData({ ...formData, is_mandatory: !!c })}
                  />
                  <Label htmlFor="is_mandatory">Mandatory for assigned employees</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={closeDialog}>Cancel</Button>
                <Button onClick={handleSubmit}>{editingId ? "Update" : "Create"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Target Audience</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paths.map((path) => (
                <TableRow key={path.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      {path.name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{path.code}</TableCell>
                  <TableCell>{path.target_audience || "-"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => openManageCourses(path)}>
                      {path.courses?.length || 0} courses <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </TableCell>
                  <TableCell>{path.estimated_duration_hours ? `${path.estimated_duration_hours}h` : "-"}</TableCell>
                  <TableCell>
                    <Badge variant={path.is_mandatory ? "default" : "secondary"}>{path.is_mandatory ? "Mandatory" : "Optional"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(path)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {paths.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">No learning paths created</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Manage Courses Dialog */}
      <Dialog open={coursesDialogOpen} onOpenChange={setCoursesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Courses - {selectedPath?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center gap-2 p-2 border rounded">
                <Checkbox
                  checked={selectedCourses.includes(course.id)}
                  onCheckedChange={() => toggleCourse(course.id)}
                />
                <span>{course.title}</span>
              </div>
            ))}
            {courses.length === 0 && <p className="text-muted-foreground text-center py-4">No courses available</p>}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setCoursesDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveCourses}>Save Courses</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
