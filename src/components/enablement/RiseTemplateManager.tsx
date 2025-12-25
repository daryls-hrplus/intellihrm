import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  BookOpen,
  Upload,
  MoreHorizontal,
  Trash2,
  Star,
  FileText,
  Sparkles,
  Check,
  Loader2,
} from "lucide-react";
import { useEnablementRiseTemplates } from "@/hooks/useEnablementData";
import { useToast } from "@/hooks/use-toast";
import { formatDateForDisplay } from "@/utils/dateUtils";

export function RiseTemplateManager() {
  const { t } = useTranslation();
  const { templates, isLoading, addTemplate, setDefaultTemplate } = useEnablementRiseTemplates();
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedStructure, setExtractedStructure] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "application/pdf",
      "text/plain",
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a Word document (.docx), PDF, or text file",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsAnalyzing(true);

    // Simulate AI analysis of the document structure
    // In production, this would call an edge function to analyze the document
    setTimeout(() => {
      setExtractedStructure({
        sections: [
          { name: "Introduction", timing: "2 min", type: "overview" },
          { name: "Learning Objectives", timing: "1 min", type: "objectives" },
          { name: "Core Content", timing: "10 min", type: "content" },
          { name: "Knowledge Check", timing: "3 min", type: "quiz" },
          { name: "Summary", timing: "2 min", type: "summary" },
          { name: "Next Steps", timing: "1 min", type: "action" },
        ],
        exercise_types: ["multiple_choice", "scenario_based", "fill_in_blank"],
        estimated_duration: 20,
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleAdd = async () => {
    if (!formData.name || !extractedStructure) return;

    await addTemplate({
      name: formData.name,
      description: formData.description,
      lesson_structure: extractedStructure,
      section_patterns: { sections: extractedStructure.sections },
      timing_guidelines: { estimated_duration: extractedStructure.estimated_duration },
      exercise_types: extractedStructure.exercise_types,
      is_default: templates.length === 0,
    });

    setFormData({ name: "", description: "" });
    setUploadedFile(null);
    setExtractedStructure(null);
    setIsAddOpen(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Articulate Rise Templates
            </CardTitle>
            <CardDescription>
              Upload lesson structure templates for AI course generation
            </CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Rise Lesson Template</DialogTitle>
                <DialogDescription>
                  Upload a Word document containing your Rise lesson structure. AI will analyze and
                  extract the pattern.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Standard Training Lesson"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Brief description..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Lesson Structure Document</Label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".docx,.doc,.pdf,.txt"
                    onChange={handleFileUpload}
                  />
                  {!uploadedFile ? (
                    <Button
                      variant="outline"
                      className="w-full h-24 border-dashed"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Upload Word document with lesson structure
                        </span>
                      </div>
                    </Button>
                  ) : (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div className="flex-1">
                          <p className="font-medium">{uploadedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(uploadedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        {isAnalyzing ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing...
                          </div>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Check className="h-3 w-3" />
                            Analyzed
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Extracted Structure Preview */}
                {extractedStructure && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Extracted Lesson Structure
                    </Label>
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="space-y-2">
                        {extractedStructure.sections.map(
                          (section: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between py-1 border-b last:border-0"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">
                                  {index + 1}
                                </span>
                                <span className="text-sm">{section.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {section.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {section.timing}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Exercise Types: {extractedStructure.exercise_types.join(", ")}
                        </span>
                        <Badge variant="secondary">
                          ~{extractedStructure.estimated_duration} min
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  disabled={!formData.name || !extractedStructure}
                >
                  Save Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertDescription>
              No Rise templates created yet. Upload your lesson structure document to create a
              reusable template.
            </AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Sections</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {template.is_default && (
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      )}
                      <div>
                        <p className="font-medium">{template.name}</p>
                        {template.description && (
                          <p className="text-xs text-muted-foreground">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {(template.section_patterns as any)?.sections?.length || 0} sections
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      ~{(template.timing_guidelines as any)?.estimated_duration || "-"} min
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateForDisplay(template.created_at)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!template.is_default && (
                          <DropdownMenuItem
                            onClick={() => setDefaultTemplate(template.id)}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Set as Default
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          View Structure
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
