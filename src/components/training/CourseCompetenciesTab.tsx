import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Target } from "lucide-react";
import { toast } from "sonner";

interface CourseCompetenciesTabProps {
  companyId: string;
}

interface CourseCompetency {
  id: string;
  course: { id: string; title: string } | null;
  competency: { id: string; name: string } | null;
  level: { id: string; name: string } | null;
}

interface Course {
  id: string;
  title: string;
}

interface Competency {
  id: string;
  name: string;
  levels: { id: string; name: string; level_order: number }[];
}

export function CourseCompetenciesTab({ companyId }: CourseCompetenciesTabProps) {
  const [mappings, setMappings] = useState<CourseCompetency[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    course_id: "",
    competency_id: "",
    level_id: "",
  });

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    const [mappingsRes, coursesRes, competenciesRes] = await Promise.all([
      supabase
        .from("course_competencies")
        .select("*, course:lms_courses(id, title), competency:competencies(id, name), level:competency_levels(id, name)")
        .order("created_at") as any,
      supabase
        .from("lms_courses")
        .select("id, title")
        .eq("company_id", companyId)
        .eq("is_active", true),
      supabase
        .from("competencies")
        .select("id, name, levels:competency_levels(id, name, level_order)") as any
        .eq("company_id", companyId)
        .eq("is_active", true),
    ]);

    if (mappingsRes.data) setMappings(mappingsRes.data);
    if (coursesRes.data) setCourses(coursesRes.data);
    if (competenciesRes.data) {
      // Sort levels within each competency
      const sorted = competenciesRes.data.map((c: any) => ({
        ...c,
        levels: c.levels?.sort((a: any, b: any) => a.level_order - b.level_order) || [],
      }));
      setCompetencies(sorted);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.course_id || !formData.competency_id) {
      toast.error("Course and competency are required");
      return;
    }

    const { error } = await supabase.from("course_competencies").insert({
      course_id: formData.course_id,
      competency_id: formData.competency_id,
      proficiency_level_achieved: formData.level_id || null,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("This mapping already exists");
      } else {
        toast.error("Failed to create mapping");
      }
    } else {
      toast.success("Mapping created");
      setDialogOpen(false);
      setFormData({ course_id: "", competency_id: "", level_id: "" });
      loadData();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("course_competencies").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Mapping deleted");
      loadData();
    }
  };

  const selectedCompetency = competencies.find((c) => c.id === formData.competency_id);

  // Group mappings by course
  const groupedMappings = courses.map((course) => ({
    course,
    competencies: mappings.filter((m) => m.course?.id === course.id),
  })).filter((g) => g.competencies.length > 0);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Course-Competency Mapping</CardTitle>
            <CardDescription>Link courses to competencies employees will develop</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Mapping</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Map Course to Competency</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Course *</Label>
                  <Select value={formData.course_id} onValueChange={(v) => setFormData({ ...formData, course_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Competency *</Label>
                  <Select value={formData.competency_id} onValueChange={(v) => setFormData({ ...formData, competency_id: v, level_id: "" })}>
                    <SelectTrigger><SelectValue placeholder="Select competency" /></SelectTrigger>
                    <SelectContent>
                      {competencies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedCompetency && selectedCompetency.levels.length > 0 && (
                  <div className="space-y-2">
                    <Label>Proficiency Level Achieved</Label>
                    <Select value={formData.level_id} onValueChange={(v) => setFormData({ ...formData, level_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select level (optional)" /></SelectTrigger>
                      <SelectContent>
                        {selectedCompetency.levels.map((l) => (
                          <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>Create Mapping</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {groupedMappings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No course-competency mappings defined</p>
              <p className="text-sm">Map courses to competencies to track skill development</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedMappings.map((group) => (
                <div key={group.course.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">{group.course.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {group.competencies.map((mapping) => (
                      <Badge key={mapping.id} variant="secondary" className="flex items-center gap-1 py-1 px-2">
                        {mapping.competency?.name}
                        {mapping.level && <span className="text-xs text-muted-foreground">({mapping.level.name})</span>}
                        <button onClick={() => handleDelete(mapping.id)} className="ml-1 hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Competency</TableHead>
                <TableHead>Level Achieved</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.course?.title}</TableCell>
                  <TableCell>{m.competency?.name}</TableCell>
                  <TableCell>{m.level?.name || "-"}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(m.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {mappings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">No mappings</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
