import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, ClipboardList } from "lucide-react";
import { toast } from "sonner";

interface TrainingEvaluationsTabProps {
  companyId: string;
}

interface Evaluation {
  id: string;
  name: string;
  description: string | null;
  evaluation_level: number;
  questions: { question: string; type: string }[];
  is_active: boolean;
}

const KIRKPATRICK_LEVELS = [
  { level: 1, name: "Reaction", description: "How participants felt about the training" },
  { level: 2, name: "Learning", description: "Knowledge and skills gained" },
  { level: 3, name: "Behavior", description: "Application of learning on the job" },
  { level: 4, name: "Results", description: "Business impact of the training" },
];

export function TrainingEvaluationsTab({ companyId }: TrainingEvaluationsTabProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    evaluation_level: "1",
    questions: [{ question: "", type: "rating" }],
  });

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("training_evaluations")
      .select("*")
      .eq("company_id", companyId)
      .order("evaluation_level");

    if (data) setEvaluations(data as unknown as Evaluation[]);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }

    const validQuestions = formData.questions.filter((q) => q.question.trim());
    const payload = {
      company_id: companyId,
      name: formData.name,
      description: formData.description || null,
      evaluation_level: parseInt(formData.evaluation_level),
      questions: validQuestions,
      is_active: true,
    };

    if (editingId) {
      const { error } = await supabase.from("training_evaluations").update(payload).eq("id", editingId);
      if (error) {
        toast.error("Failed to update evaluation");
      } else {
        toast.success("Evaluation updated");
        closeDialog();
        loadData();
      }
    } else {
      const { error } = await supabase.from("training_evaluations").insert(payload);
      if (error) {
        toast.error("Failed to create evaluation");
      } else {
        toast.success("Evaluation created");
        closeDialog();
        loadData();
      }
    }
  };

  const addQuestion = () => {
    setFormData({ ...formData, questions: [...formData.questions, { question: "", type: "rating" }] });
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    const updated = [...formData.questions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, questions: updated });
  };

  const removeQuestion = (index: number) => {
    setFormData({ ...formData, questions: formData.questions.filter((_, i) => i !== index) });
  };

  const openEdit = (evaluation: Evaluation) => {
    setEditingId(evaluation.id);
    setFormData({
      name: evaluation.name,
      description: evaluation.description || "",
      evaluation_level: evaluation.evaluation_level.toString(),
      questions: evaluation.questions.length > 0 ? evaluation.questions : [{ question: "", type: "rating" }],
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      evaluation_level: "1",
      questions: [{ question: "", type: "rating" }],
    });
  };

  const getLevelBadge = (level: number) => {
    const colors: Record<number, string> = {
      1: "bg-blue-100 text-blue-800",
      2: "bg-green-100 text-green-800",
      3: "bg-yellow-100 text-yellow-800",
      4: "bg-purple-100 text-purple-800",
    };
    return <Badge className={colors[level]}>Level {level}: {KIRKPATRICK_LEVELS.find((l) => l.level === level)?.name}</Badge>;
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kirkpatrick Evaluation Model</CardTitle>
          <CardDescription>Create evaluations based on the 4 levels of training effectiveness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {KIRKPATRICK_LEVELS.map((level) => (
              <div key={level.level} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Level {level.level}</span>
                </div>
                <p className="font-medium">{level.name}</p>
                <p className="text-sm text-muted-foreground">{level.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Evaluation Templates</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeDialog()}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Create Evaluation</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Evaluation" : "Create Evaluation"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Evaluation Level</Label>
                  <Select value={formData.evaluation_level} onValueChange={(v) => setFormData({ ...formData, evaluation_level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {KIRKPATRICK_LEVELS.map((l) => (
                        <SelectItem key={l.level} value={l.level.toString()}>Level {l.level}: {l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Questions</Label>
                  {formData.questions.map((q, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={q.question}
                        onChange={(e) => updateQuestion(i, "question", e.target.value)}
                        placeholder="Enter question"
                        className="flex-1"
                      />
                      <Select value={q.type} onValueChange={(v) => updateQuestion(i, "type", v)}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rating">Rating (1-5)</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="yes_no">Yes/No</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" onClick={() => removeQuestion(i)}>×</Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addQuestion}>+ Add Question</Button>
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
                <TableHead>Level</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.map((eval_) => (
                <TableRow key={eval_.id}>
                  <TableCell className="font-medium">{eval_.name}</TableCell>
                  <TableCell>{getLevelBadge(eval_.evaluation_level)}</TableCell>
                  <TableCell>{eval_.questions?.length || 0} questions</TableCell>
                  <TableCell>
                    <Badge variant={eval_.is_active ? "default" : "secondary"}>{eval_.is_active ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(eval_)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {evaluations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No evaluations created</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
