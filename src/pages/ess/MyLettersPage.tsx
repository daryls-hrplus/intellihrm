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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Plus, Clock, CheckCircle, XCircle, Eye, Download, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useLanguage } from "@/hooks/useLanguage";

interface LetterTemplate {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  subject: string;
  body_template: string;
  available_variables: string[];
  requires_approval: boolean;
}

interface GeneratedLetter {
  id: string;
  template_id: string;
  letter_number: string;
  generated_content: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  rejection_reason: string | null;
  letter_templates: {
    name: string;
    category: string;
  };
}

export default function MyLettersPage() {
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [letters, setLetters] = useState<GeneratedLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [previewContent, setPreviewContent] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewLetter, setViewLetter] = useState<GeneratedLetter | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [templatesRes, lettersRes] = await Promise.all([
        supabase
          .from("letter_templates")
          .select("*")
          .eq("is_active", true)
          .order("category", { ascending: true }),
        supabase
          .from("generated_letters")
          .select("*, letter_templates(name, category)")
          .eq("employee_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (templatesRes.error) throw templatesRes.error;
      if (lettersRes.error) throw lettersRes.error;

      setTemplates(templatesRes.data as LetterTemplate[]);
      setLetters(lettersRes.data as GeneratedLetter[]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      // Pre-fill known variables
      const initialValues: Record<string, string> = {};
      template.available_variables.forEach((v) => {
        if (v === "employee_name") initialValues[v] = profile?.full_name || "";
        else if (v === "current_date") initialValues[v] = formatDateForDisplay(new Date().toISOString(), "MMMM d, yyyy");
        else if (v === "company_name") initialValues[v] = "";
        else initialValues[v] = "";
      });
      setVariableValues(initialValues);
      updatePreview(template.body_template, initialValues);
    }
  };

  const updatePreview = (template: string, values: Record<string, string>) => {
    let content = template;
    Object.entries(values).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, "g"), value || `[${key}]`);
    });
    setPreviewContent(content);
  };

  const handleVariableChange = (key: string, value: string) => {
    const newValues = { ...variableValues, [key]: value };
    setVariableValues(newValues);
    if (selectedTemplate) {
      updatePreview(selectedTemplate.body_template, newValues);
    }
  };

  const handleSubmitRequest = async () => {
    if (!user || !selectedTemplate) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("generated_letters").insert({
        template_id: selectedTemplate.id,
        employee_id: user.id,
        requested_by: user.id,
        generated_content: previewContent,
        variable_values: variableValues,
        status: selectedTemplate.requires_approval ? "pending" : "approved",
      });

      if (error) throw error;

      toast.success(
        selectedTemplate.requires_approval
          ? t('common.success')
          : t('common.success')
      );
      setIsDialogOpen(false);
      setSelectedTemplate(null);
      setVariableValues({});
      fetchData();
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error(t('common.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600"><CheckCircle className="h-3 w-3 mr-1" />{t('ess.myLetters.approved')}</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-600"><XCircle className="h-3 w-3 mr-1" />{t('ess.myLetters.rejected')}</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-600"><Clock className="h-3 w-3 mr-1" />{t('ess.myLetters.pending')}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      employment: "Employment",
      career: "Career & Promotion",
      compensation: "Compensation",
      general: "General",
    };
    return labels[category] || category;
  };

  const handlePrint = (content: string) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Letter</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; white-space: pre-wrap; }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
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

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) acc[template.category] = [];
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, LetterTemplate[]>);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t('navigation.ess'), href: "/ess" },
            { label: t('ess.myLetters.breadcrumb') },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              {t('ess.myLetters.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('ess.myLetters.subtitle')}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('ess.myLetters.requestLetter')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle>Request a Letter</DialogTitle>
                <DialogDescription>
                  Select a template and fill in the required information
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 h-[60vh]">
                <div className="space-y-4 overflow-y-auto pr-2">
                  <div className="space-y-2">
                    <Label>Letter Template</Label>
                    <Select onValueChange={handleTemplateSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(groupedTemplates).map(([category, temps]) => (
                          <div key={category}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                              {getCategoryLabel(category)}
                            </div>
                            {temps.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTemplate && (
                    <>
                      <div className="rounded-lg bg-muted/50 p-3 text-sm">
                        <p className="font-medium">{selectedTemplate.name}</p>
                        <p className="text-muted-foreground">{selectedTemplate.description}</p>
                        {selectedTemplate.requires_approval && (
                          <Badge variant="outline" className="mt-2">Requires Approval</Badge>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label>Fill in the Details</Label>
                        {selectedTemplate.available_variables
                          .filter((v) => !["letter_number", "current_date"].includes(v))
                          .map((variable) => (
                            <div key={variable} className="space-y-1">
                              <Label className="text-xs capitalize">
                                {variable.replace(/_/g, " ")}
                              </Label>
                              {variable.includes("responsibilities") || variable.includes("summary") ? (
                                <Textarea
                                  value={variableValues[variable] || ""}
                                  onChange={(e) => handleVariableChange(variable, e.target.value)}
                                  placeholder={`Enter ${variable.replace(/_/g, " ")}`}
                                  rows={3}
                                />
                              ) : (
                                <Input
                                  value={variableValues[variable] || ""}
                                  onChange={(e) => handleVariableChange(variable, e.target.value)}
                                  placeholder={`Enter ${variable.replace(/_/g, " ")}`}
                                />
                              )}
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Preview</Label>
                  </div>
                  <ScrollArea className="h-[calc(60vh-60px)]">
                    <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">
                      {previewContent || "Select a template to see preview"}
                    </pre>
                  </ScrollArea>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitRequest} disabled={!selectedTemplate || isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {selectedTemplate?.requires_approval ? "Submit for Approval" : "Generate Letter"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Letters</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <LettersList
              letters={letters}
              getStatusBadge={getStatusBadge}
              onView={setViewLetter}
              onPrint={handlePrint}
            />
          </TabsContent>
          <TabsContent value="pending" className="mt-4">
            <LettersList
              letters={letters.filter((l) => l.status === "pending")}
              getStatusBadge={getStatusBadge}
              onView={setViewLetter}
              onPrint={handlePrint}
            />
          </TabsContent>
          <TabsContent value="approved" className="mt-4">
            <LettersList
              letters={letters.filter((l) => l.status === "approved")}
              getStatusBadge={getStatusBadge}
              onView={setViewLetter}
              onPrint={handlePrint}
            />
          </TabsContent>
        </Tabs>

        {/* View Letter Dialog */}
        <Dialog open={!!viewLetter} onOpenChange={() => setViewLetter(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {viewLetter?.letter_templates?.name}
                {viewLetter && getStatusBadge(viewLetter.status)}
              </DialogTitle>
              <DialogDescription>
                {viewLetter?.letter_number} • {viewLetter && formatDateForDisplay(viewLetter.created_at, "PPP")}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh]">
              <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed p-4 bg-white rounded-lg border">
                {viewLetter?.generated_content}
              </pre>
            </ScrollArea>
            {viewLetter?.status === "rejected" && viewLetter.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <strong>Rejection Reason:</strong> {viewLetter.rejection_reason}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setViewLetter(null)}>
                Close
              </Button>
              {viewLetter?.status === "approved" && (
                <Button onClick={() => viewLetter && handlePrint(viewLetter.generated_content)}>
                  <Download className="h-4 w-4 mr-2" />
                  Print / Download
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

function LettersList({
  letters,
  getStatusBadge,
  onView,
  onPrint,
}: {
  letters: GeneratedLetter[];
  getStatusBadge: (status: string) => React.ReactNode;
  onView: (letter: GeneratedLetter) => void;
  onPrint: (content: string) => void;
}) {
  if (letters.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No letters found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {letters.map((letter) => (
        <Card key={letter.id}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{letter.letter_templates?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {letter.letter_number} • {formatDateForDisplay(letter.created_at, "PPP")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(letter.status)}
                <Button variant="ghost" size="sm" onClick={() => onView(letter)}>
                  <Eye className="h-4 w-4" />
                </Button>
                {letter.status === "approved" && (
                  <Button variant="ghost" size="sm" onClick={() => onPrint(letter.generated_content)}>
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}