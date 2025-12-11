import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, Plus, Pencil, Trash2, Eye, CheckCircle, XCircle, Clock, 
  Loader2, Settings, FileCheck, AlertCircle 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

interface LetterTemplate {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string | null;
  subject: string;
  body_template: string;
  available_variables: string[];
  is_active: boolean;
  requires_approval: boolean;
  created_at: string;
}

interface GeneratedLetter {
  id: string;
  letter_number: string;
  generated_content: string;
  status: string;
  created_at: string;
  rejection_reason: string | null;
  employee: { full_name: string; email: string } | null;
  letter_templates: { name: string } | null;
}

const CATEGORIES = [
  { value: "employment", label: "Employment" },
  { value: "career", label: "Career & Promotion" },
  { value: "compensation", label: "Compensation" },
  { value: "general", label: "General" },
];

const DEFAULT_VARIABLES = [
  "employee_name",
  "company_name",
  "current_date",
  "letter_number",
  "position_title",
  "department_name",
  "hire_date",
];

export default function AdminLetterTemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [pendingLetters, setPendingLetters] = useState<GeneratedLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editTemplate, setEditTemplate] = useState<LetterTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewLetter, setViewLetter] = useState<GeneratedLetter | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "general",
    description: "",
    subject: "",
    body_template: "",
    available_variables: [] as string[],
    requires_approval: false,
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [templatesRes, lettersRes] = await Promise.all([
        supabase
          .from("letter_templates")
          .select("*")
          .order("category", { ascending: true }),
        supabase
          .from("generated_letters")
          .select("*, employee:profiles!generated_letters_employee_id_fkey(full_name, email), letter_templates(name)")
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
      ]);

      if (templatesRes.error) throw templatesRes.error;
      if (lettersRes.error) throw lettersRes.error;

      setTemplates(templatesRes.data as LetterTemplate[]);
      setPendingLetters(lettersRes.data as GeneratedLetter[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (template?: LetterTemplate) => {
    if (template) {
      setEditTemplate(template);
      setFormData({
        name: template.name,
        code: template.code,
        category: template.category,
        description: template.description || "",
        subject: template.subject,
        body_template: template.body_template,
        available_variables: template.available_variables,
        requires_approval: template.requires_approval,
        is_active: template.is_active,
      });
    } else {
      setEditTemplate(null);
      setFormData({
        name: "",
        code: "",
        category: "general",
        description: "",
        subject: "",
        body_template: "",
        available_variables: [],
        requires_approval: false,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const extractVariables = (template: string): string[] => {
    const regex = /{{(\w+)}}/g;
    const matches = template.matchAll(regex);
    return [...new Set([...matches].map((m) => m[1]))];
  };

  const handleTemplateChange = (value: string) => {
    const variables = extractVariables(value);
    setFormData((prev) => ({
      ...prev,
      body_template: value,
      available_variables: variables,
    }));
  };

  const handleSaveTemplate = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        created_by: user.id,
      };

      if (editTemplate) {
        const { error } = await supabase
          .from("letter_templates")
          .update(payload)
          .eq("id", editTemplate.id);
        if (error) throw error;
        toast.success("Template updated successfully");
      } else {
        const { error } = await supabase.from("letter_templates").insert(payload);
        if (error) throw error;
        toast.success("Template created successfully");
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast.error(error.message || "Failed to save template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const { error } = await supabase.from("letter_templates").delete().eq("id", id);
      if (error) throw error;
      toast.success("Template deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const handleApproveReject = async (letter: GeneratedLetter, approve: boolean) => {
    try {
      const { error } = await supabase
        .from("generated_letters")
        .update({
          status: approve ? "approved" : "rejected",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          rejection_reason: approve ? null : rejectionReason,
        })
        .eq("id", letter.id);

      if (error) throw error;

      toast.success(approve ? "Letter approved" : "Letter rejected");
      setViewLetter(null);
      setRejectionReason("");
      fetchData();
    } catch (error) {
      console.error("Error updating letter:", error);
      toast.error("Failed to update letter status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-600"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Letter Templates" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Letter Templates
            </h1>
            <p className="text-muted-foreground">
              Manage letter templates and approve letter requests
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>

        <Tabs defaultValue="templates">
          <TabsList>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              Pending Approvals
              {pendingLetters.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingLetters.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell className="text-muted-foreground">{template.code}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {CATEGORIES.find((c) => c.value === template.category)?.label || template.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {template.requires_approval ? (
                          <Badge className="bg-yellow-500/10 text-yellow-600">Required</Badge>
                        ) : (
                          <Badge className="bg-green-500/10 text-green-600">Auto</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {template.is_active ? (
                          <Badge className="bg-green-500/10 text-green-600">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-500/10 text-gray-600">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(template)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            {pendingLetters.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending letter requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pendingLetters.map((letter) => (
                  <Card key={letter.id}>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{letter.letter_templates?.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {letter.employee?.full_name} • {letter.letter_number} • {format(new Date(letter.created_at), "PPP")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setViewLetter(letter)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Template Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editTemplate ? "Edit Template" : "New Template"}</DialogTitle>
              <DialogDescription>
                Create or modify letter templates with variable placeholders
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Employment Confirmation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Code</Label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/\s/g, "_") })}
                      placeholder="employment_confirmation"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Letter subject line"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the template"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.requires_approval}
                      onCheckedChange={(v) => setFormData({ ...formData, requires_approval: v })}
                    />
                    <Label>Requires Approval</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Body Template</Label>
                  <Textarea
                    value={formData.body_template}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    placeholder="Use {{variable_name}} for placeholders"
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Detected Variables</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg min-h-[60px]">
                    {formData.available_variables.length === 0 ? (
                      <span className="text-muted-foreground text-sm">No variables detected</span>
                    ) : (
                      formData.available_variables.map((v) => (
                        <Badge key={v} variant="secondary">{`{{${v}}}`}</Badge>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Common Variables</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/50">
                    {DEFAULT_VARIABLES.map((v) => (
                      <Badge
                        key={v}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => {
                          const newTemplate = formData.body_template + `{{${v}}}`;
                          handleTemplateChange(newTemplate);
                        }}
                      >
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Click to insert into template</p>
                </div>

                <div className="space-y-2">
                  <Label>Preview</Label>
                  <ScrollArea className="h-[300px] border rounded-lg p-4 bg-white">
                    <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                      {formData.body_template || "Start typing to see preview..."}
                    </pre>
                  </ScrollArea>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate} disabled={isSubmitting || !formData.name || !formData.code}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editTemplate ? "Update" : "Create"} Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Review Letter Dialog */}
        <Dialog open={!!viewLetter} onOpenChange={() => { setViewLetter(null); setRejectionReason(""); }}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Review Letter Request
                {viewLetter && getStatusBadge(viewLetter.status)}
              </DialogTitle>
              <DialogDescription>
                {viewLetter?.employee?.full_name} • {viewLetter?.letter_number}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="h-[50vh]">
              <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed p-4 bg-white rounded-lg border">
                {viewLetter?.generated_content}
              </pre>
            </ScrollArea>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Rejection Reason (optional)</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason if rejecting..."
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setViewLetter(null); setRejectionReason(""); }}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => viewLetter && handleApproveReject(viewLetter, false)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button onClick={() => viewLetter && handleApproveReject(viewLetter, true)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}