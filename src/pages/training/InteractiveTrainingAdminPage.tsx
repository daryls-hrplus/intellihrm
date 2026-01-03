import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Plus,
  Upload,
  Video,
  FileText,
  Settings,
  Trash2,
  Edit,
  GripVertical,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Check,
  X,
  Play,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface Program {
  id: string;
  title: string;
  description: string | null;
  program_type: string;
  passing_score: number;
  max_attempts: number;
  is_mandatory: boolean;
  is_active: boolean;
  thumbnail_url: string | null;
  estimated_duration_minutes: number | null;
}

interface Module {
  id: string;
  program_id: string;
  title: string;
  description: string | null;
  sequence_order: number;
  is_gateway: boolean;
  is_active: boolean;
}

interface Content {
  id: string;
  module_id: string;
  content_type: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_duration_seconds: number | null;
  thumbnail_url: string | null;
  sequence_order: number;
  min_watch_percentage: number;
  has_quiz: boolean;
  is_active: boolean;
}

interface Question {
  id: string;
  content_id: string;
  question_type: string;
  question_text: string;
  explanation: string | null;
  points: number;
  sequence_order: number;
  is_active: boolean;
  options?: QuestionOption[];
}

interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  feedback_text: string | null;
  sequence_order: number;
}

export default function InteractiveTrainingAdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [showProgramDialog, setShowProgramDialog] = useState(false);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  
  // Fetch programs
  const { data: programs, isLoading: programsLoading } = useQuery({
    queryKey: ["admin-training-programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("training_programs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Program[];
    },
  });
  
  // Fetch modules for selected program
  const { data: modules } = useQuery({
    queryKey: ["admin-training-modules", selectedProgram?.id],
    queryFn: async () => {
      if (!selectedProgram) return [];
      const { data, error } = await supabase
        .from("training_modules")
        .select("*")
        .eq("program_id", selectedProgram.id)
        .order("sequence_order");
      if (error) throw error;
      return data as Module[];
    },
    enabled: !!selectedProgram,
  });
  
  // Fetch content for selected module
  const { data: contents } = useQuery({
    queryKey: ["admin-training-content", selectedModule?.id],
    queryFn: async () => {
      if (!selectedModule) return [];
      const { data, error } = await supabase
        .from("training_content")
        .select("*")
        .eq("module_id", selectedModule.id)
        .order("sequence_order");
      if (error) throw error;
      return data as Content[];
    },
    enabled: !!selectedModule,
  });
  
  // Fetch questions for selected content
  const { data: questions } = useQuery({
    queryKey: ["admin-training-questions", selectedContent?.id],
    queryFn: async () => {
      if (!selectedContent) return [];
      const { data, error } = await supabase
        .from("training_quiz_questions")
        .select(`*, options:training_quiz_options(*)`)
        .eq("content_id", selectedContent.id)
        .order("sequence_order");
      if (error) throw error;
      return data as Question[];
    },
    enabled: !!selectedContent,
  });
  
  // Mutations
  const createProgram = useMutation({
    mutationFn: async (program: Partial<Program>) => {
      const { data, error } = await supabase
        .from("training_programs")
        .insert([{ 
          title: program.title!, 
          description: program.description,
          program_type: program.program_type,
          passing_score: program.passing_score,
          max_attempts: program.max_attempts,
          is_mandatory: program.is_mandatory,
          thumbnail_url: program.thumbnail_url,
          estimated_duration_minutes: program.estimated_duration_minutes,
          is_active: program.is_active,
          created_by: user?.id 
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-training-programs"] });
      setShowProgramDialog(false);
      toast.success("Program created");
    },
  });
  
  const updateProgram = useMutation({
    mutationFn: async ({ id, ...program }: Partial<Program> & { id: string }) => {
      const { data, error } = await supabase
        .from("training_programs")
        .update(program)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-training-programs"] });
      setShowProgramDialog(false);
      toast.success("Program updated");
    },
  });
  
  const createModule = useMutation({
    mutationFn: async (module: Partial<Module>) => {
      const { data, error } = await supabase
        .from("training_modules")
        .insert([{
          program_id: module.program_id!,
          title: module.title!,
          description: module.description,
          sequence_order: module.sequence_order,
          is_gateway: module.is_gateway,
          is_active: module.is_active,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-training-modules"] });
      setShowModuleDialog(false);
      toast.success("Module created");
    },
  });
  
  const createContent = useMutation({
    mutationFn: async (content: Partial<Content>) => {
      const { data, error } = await supabase
        .from("training_content")
        .insert([{
          module_id: content.module_id!,
          title: content.title!,
          content_type: content.content_type,
          description: content.description,
          video_url: content.video_url,
          thumbnail_url: content.thumbnail_url,
          sequence_order: content.sequence_order,
          min_watch_percentage: content.min_watch_percentage,
          has_quiz: content.has_quiz,
          is_active: content.is_active,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-training-content"] });
      setShowContentDialog(false);
      toast.success("Content created");
    },
  });
  
  const createQuestion = useMutation({
    mutationFn: async ({ question, options }: { question: Partial<Question>; options: Partial<QuestionOption>[] }) => {
      const { data: questionData, error: questionError } = await supabase
        .from("training_quiz_questions")
        .insert([{
          content_id: question.content_id!,
          question_type: question.question_type!,
          question_text: question.question_text!,
          explanation: question.explanation,
          points: question.points,
          sequence_order: question.sequence_order,
          is_active: question.is_active,
        }])
        .select()
        .single();
      if (questionError) throw questionError;
      
      if (options.length > 0) {
        const { error: optionsError } = await supabase
          .from("training_quiz_options")
          .insert(options.map((o, i) => ({ 
            option_text: o.option_text!, 
            is_correct: o.is_correct,
            feedback_text: o.feedback_text,
            question_id: questionData.id, 
            sequence_order: i 
          })));
        if (optionsError) throw optionsError;
      }
      
      // Update content to have quiz
      await supabase
        .from("training_content")
        .update({ has_quiz: true })
        .eq("id", question.content_id);
      
      return questionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-training-questions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-training-content"] });
      setShowQuestionDialog(false);
      toast.success("Question created");
    },
  });
  
  const handleVideoUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `videos/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("training-videos")
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from("training-videos")
        .getPublicUrl(filePath);
      
      return publicUrl;
    } finally {
      setUploading(false);
    }
  };
  
  const handleThumbnailUpload = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `thumbnails/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from("training-videos")
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from("training-videos")
      .getPublicUrl(filePath);
    
    return publicUrl;
  };
  
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <NavLink to="/training">
                <ArrowLeft className="h-4 w-4" />
              </NavLink>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Interactive Training Admin</h1>
              <p className="text-muted-foreground">Manage training programs, videos, and quizzes</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Programs List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Programs</CardTitle>
                <Button size="sm" onClick={() => { setEditingItem(null); setShowProgramDialog(true); }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {programs?.map((program) => (
                  <div
                    key={program.id}
                    className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${selectedProgram?.id === program.id ? "bg-primary/10" : ""}`}
                    onClick={() => { setSelectedProgram(program); setSelectedModule(null); setSelectedContent(null); }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{program.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{program.program_type}</Badge>
                          {program.is_mandatory && <Badge variant="destructive" className="text-xs">Required</Badge>}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
                {programs?.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    No programs yet
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* Modules List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Modules</CardTitle>
                {selectedProgram && (
                  <Button size="sm" onClick={() => { setEditingItem(null); setShowModuleDialog(true); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {!selectedProgram ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Select a program
                  </div>
                ) : modules?.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No modules yet
                  </div>
                ) : (
                  modules?.map((module) => (
                    <div
                      key={module.id}
                      className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${selectedModule?.id === module.id ? "bg-primary/10" : ""}`}
                      onClick={() => { setSelectedModule(module); setSelectedContent(null); }}
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{module.title}</p>
                          {module.is_gateway && <Badge variant="secondary" className="text-xs mt-1">Gateway</Badge>}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* Content List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Content</CardTitle>
                {selectedModule && (
                  <Button size="sm" onClick={() => { setEditingItem(null); setShowContentDialog(true); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {!selectedModule ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Select a module
                  </div>
                ) : contents?.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No content yet
                  </div>
                ) : (
                  contents?.map((content) => (
                    <div
                      key={content.id}
                      className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${selectedContent?.id === content.id ? "bg-primary/10" : ""}`}
                      onClick={() => setSelectedContent(content)}
                    >
                      <div className="flex items-center gap-2">
                        {content.content_type === "video" ? (
                          <Video className="h-4 w-4 text-blue-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-green-500" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium truncate">{content.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {content.has_quiz && <Badge variant="outline" className="text-xs">Has Quiz</Badge>}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>
          
          {/* Questions/Quiz List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Quiz Questions</CardTitle>
                {selectedContent && (
                  <Button size="sm" onClick={() => { setEditingItem(null); setShowQuestionDialog(true); }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {!selectedContent ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Select content
                  </div>
                ) : questions?.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No questions yet
                  </div>
                ) : (
                  questions?.map((question, idx) => (
                    <div key={question.id} className="p-3 border-b">
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-medium text-muted-foreground">{idx + 1}.</span>
                        <div className="flex-1">
                          <p className="text-sm">{question.question_text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{question.question_type}</Badge>
                            <Badge variant="secondary" className="text-xs">{question.points} pts</Badge>
                          </div>
                          {question.options && question.options.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {question.options.map((opt) => (
                                <div key={opt.id} className="flex items-center gap-1 text-xs">
                                  {opt.is_correct ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <X className="h-3 w-3 text-muted-foreground" />
                                  )}
                                  <span className={opt.is_correct ? "text-green-700" : "text-muted-foreground"}>
                                    {opt.option_text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        {/* Program Dialog */}
        <ProgramDialog
          open={showProgramDialog}
          onOpenChange={setShowProgramDialog}
          onSubmit={(data) => {
            if (editingItem) {
              updateProgram.mutate({ id: editingItem.id, ...data });
            } else {
              createProgram.mutate(data);
            }
          }}
          onUploadThumbnail={handleThumbnailUpload}
          initialData={editingItem}
        />
        
        {/* Module Dialog */}
        <ModuleDialog
          open={showModuleDialog}
          onOpenChange={setShowModuleDialog}
          programId={selectedProgram?.id || ""}
          existingCount={modules?.length || 0}
          onSubmit={(data) => createModule.mutate(data)}
        />
        
        {/* Content Dialog */}
        <ContentDialog
          open={showContentDialog}
          onOpenChange={setShowContentDialog}
          moduleId={selectedModule?.id || ""}
          existingCount={contents?.length || 0}
          onSubmit={(data) => createContent.mutate(data)}
          onUploadVideo={handleVideoUpload}
          onUploadThumbnail={handleThumbnailUpload}
          uploading={uploading}
        />
        
        {/* Question Dialog */}
        <QuestionDialog
          open={showQuestionDialog}
          onOpenChange={setShowQuestionDialog}
          contentId={selectedContent?.id || ""}
          existingCount={questions?.length || 0}
          onSubmit={(data) => createQuestion.mutate(data)}
        />
      </div>
    </AppLayout>
  );
}

// Program Dialog Component
function ProgramDialog({
  open,
  onOpenChange,
  onSubmit,
  onUploadThumbnail,
  initialData,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Program>) => void;
  onUploadThumbnail: (file: File) => Promise<string>;
  initialData?: Program;
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [programType, setProgramType] = useState(initialData?.program_type || "onboarding");
  const [passingScore, setPassingScore] = useState(initialData?.passing_score || 80);
  const [maxAttempts, setMaxAttempts] = useState(initialData?.max_attempts || 3);
  const [isMandatory, setIsMandatory] = useState(initialData?.is_mandatory || false);
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail_url || "");
  const [duration, setDuration] = useState(initialData?.estimated_duration_minutes || 30);
  
  const handleSubmit = () => {
    onSubmit({
      title,
      description,
      program_type: programType,
      passing_score: passingScore,
      max_attempts: maxAttempts,
      is_mandatory: isMandatory,
      thumbnail_url: thumbnailUrl || null,
      estimated_duration_minutes: duration,
      is_active: true,
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Create"} Training Program</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., New Employee Onboarding" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Program description..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={programType} onValueChange={setProgramType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="skills">Skills</SelectItem>
                  <SelectItem value="leadership">Leadership</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Passing Score (%)</Label>
              <Input type="number" value={passingScore} onChange={(e) => setPassingScore(parseInt(e.target.value))} min={0} max={100} />
            </div>
            <div>
              <Label>Max Attempts</Label>
              <Input type="number" value={maxAttempts} onChange={(e) => setMaxAttempts(parseInt(e.target.value))} min={1} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isMandatory} onCheckedChange={setIsMandatory} />
            <Label>Mandatory for all employees</Label>
          </div>
          <div>
            <Label>Thumbnail</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = await onUploadThumbnail(file);
                  setThumbnailUrl(url);
                }
              }}
            />
            {thumbnailUrl && <img src={thumbnailUrl} alt="Thumbnail" className="mt-2 h-20 rounded" />}
          </div>
          <Button onClick={handleSubmit} className="w-full">
            {initialData ? "Update" : "Create"} Program
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Module Dialog Component
function ModuleDialog({
  open,
  onOpenChange,
  programId,
  existingCount,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string;
  existingCount: number;
  onSubmit: (data: Partial<Module>) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isGateway, setIsGateway] = useState(false);
  
  const handleSubmit = () => {
    onSubmit({
      program_id: programId,
      title,
      description,
      sequence_order: existingCount,
      is_gateway: isGateway,
      is_active: true,
    });
    setTitle("");
    setDescription("");
    setIsGateway(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Module</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Company Culture" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isGateway} onCheckedChange={setIsGateway} />
            <Label>Gateway Module (must pass to continue)</Label>
          </div>
          <Button onClick={handleSubmit} className="w-full">Create Module</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Content Dialog Component
function ContentDialog({
  open,
  onOpenChange,
  moduleId,
  existingCount,
  onSubmit,
  onUploadVideo,
  onUploadThumbnail,
  uploading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string;
  existingCount: number;
  onSubmit: (data: Partial<Content>) => void;
  onUploadVideo: (file: File) => Promise<string>;
  onUploadThumbnail: (file: File) => Promise<string>;
  uploading: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState("video");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [minWatchPercentage, setMinWatchPercentage] = useState(90);
  
  const handleSubmit = () => {
    onSubmit({
      module_id: moduleId,
      title,
      description,
      content_type: contentType,
      video_url: videoUrl || null,
      thumbnail_url: thumbnailUrl || null,
      sequence_order: existingCount,
      min_watch_percentage: minWatchPercentage,
      has_quiz: false,
      is_active: true,
    });
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setThumbnailUrl("");
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Welcome to the Team" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Content Type</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="interactive">Interactive</SelectItem>
                <SelectItem value="quiz_only">Quiz Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {contentType === "video" && (
            <>
              <div>
                <Label>Upload Video</Label>
                <Input
                  type="file"
                  accept="video/*"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await onUploadVideo(file);
                      setVideoUrl(url);
                    }
                  }}
                />
                {uploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                {videoUrl && <p className="text-sm text-green-600 mt-1">Video uploaded ✓</p>}
              </div>
              <div>
                <Label>Or paste Video URL</Label>
                <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Label>Min Watch Percentage</Label>
                <Input type="number" value={minWatchPercentage} onChange={(e) => setMinWatchPercentage(parseInt(e.target.value))} min={0} max={100} />
              </div>
            </>
          )}
          <div>
            <Label>Thumbnail (optional)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = await onUploadThumbnail(file);
                  setThumbnailUrl(url);
                }
              }}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full" disabled={uploading}>
            Add Content
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Question Dialog Component
function QuestionDialog({
  open,
  onOpenChange,
  contentId,
  existingCount,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string;
  existingCount: number;
  onSubmit: (data: { question: Partial<Question>; options: Partial<QuestionOption>[] }) => void;
}) {
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("multiple_choice");
  const [explanation, setExplanation] = useState("");
  const [points, setPoints] = useState(1);
  const [options, setOptions] = useState([
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
  ]);
  
  const updateOption = (index: number, field: string, value: any) => {
    const newOptions = [...options];
    (newOptions[index] as any)[field] = value;
    // For single choice, uncheck others when one is checked
    if (field === "is_correct" && value && questionType === "multiple_choice") {
      newOptions.forEach((o, i) => {
        if (i !== index) o.is_correct = false;
      });
    }
    setOptions(newOptions);
  };
  
  const handleSubmit = () => {
    const validOptions = options.filter(o => o.option_text.trim());
    onSubmit({
      question: {
        content_id: contentId,
        question_type: questionType,
        question_text: questionText,
        explanation,
        points,
        sequence_order: existingCount,
        is_active: true,
      },
      options: questionType !== "short_answer" ? validOptions : [],
    });
    setQuestionText("");
    setExplanation("");
    setOptions([
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ]);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Quiz Question</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Question Type</Label>
            <Select value={questionType} onValueChange={setQuestionType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="multi_select">Multi-Select</SelectItem>
                <SelectItem value="true_false">True/False</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Question</Label>
            <Textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Enter your question..." />
          </div>
          {questionType !== "short_answer" && (
            <div className="space-y-2">
              <Label>Options (check correct answer{questionType === "multi_select" ? "s" : ""})</Label>
              {(questionType === "true_false" ? options.slice(0, 2) : options).map((option, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type={questionType === "multi_select" ? "checkbox" : "radio"}
                    name="correct-option"
                    checked={option.is_correct}
                    onChange={(e) => updateOption(idx, "is_correct", e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Input
                    value={questionType === "true_false" ? (idx === 0 ? "True" : "False") : option.option_text}
                    onChange={(e) => updateOption(idx, "option_text", e.target.value)}
                    placeholder={`Option ${idx + 1}`}
                    disabled={questionType === "true_false"}
                  />
                </div>
              ))}
            </div>
          )}
          <div>
            <Label>Explanation (shown after answer)</Label>
            <Textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Why is this the correct answer..." />
          </div>
          <div>
            <Label>Points</Label>
            <Input type="number" value={points} onChange={(e) => setPoints(parseInt(e.target.value))} min={1} />
          </div>
          <Button onClick={handleSubmit} className="w-full">Add Question</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
