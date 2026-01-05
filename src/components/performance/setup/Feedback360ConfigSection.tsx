import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2, MessageSquare, Users, HelpCircle, Sparkles, Route, Copy, Shield, Grid3X3, ListChecks } from "lucide-react";
import { SignalDefinitionsManager } from "@/components/feedback/signals/SignalDefinitionsManager";
import { RoutingPolicyManager } from "@/components/feedback/admin/RoutingPolicyManager";
import { CycleTemplateLibrary } from "@/components/feedback/templates/CycleTemplateLibrary";
import { AnonymityPolicySettings } from "./AnonymityPolicySettings";
import { RaterQuestionMatrix } from "@/components/feedback/questions/RaterQuestionMatrix";
import { BehavioralAnchorEditor } from "@/components/feedback/questions/BehavioralAnchorEditor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

interface RaterCategory {
  id: string;
  name: string;
  code: string;
  description: string | null;
  min_raters: number;
  max_raters: number;
  is_mandatory: boolean;
  is_active: boolean;
  anonymity_threshold: number;
  bypass_threshold_check: boolean;
}

interface QuestionBank {
  id: string;
  question_text: string;
  category: string;
  question_type: string;
  is_active: boolean;
}

interface Feedback360ConfigSectionProps {
  companyId: string;
}

export function Feedback360ConfigSection({ companyId }: Feedback360ConfigSectionProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("rater-categories");
  const [isLoading, setIsLoading] = useState(true);
  
  // Cycles state for dropdown
  const [cycles, setCycles] = useState<Array<{id: string, name: string, status: string}>>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);

  // Rater Categories
  const [raterCategories, setRaterCategories] = useState<RaterCategory[]>([]);
  const [raterDialogOpen, setRaterDialogOpen] = useState(false);
  const [editingRater, setEditingRater] = useState<RaterCategory | null>(null);
  const [raterForm, setRaterForm] = useState({
    name: "",
    code: "",
    description: "",
    min_raters: 1,
    max_raters: 5,
    is_mandatory: true,
    is_active: true,
    anonymity_threshold: 3,
    bypass_threshold_check: false,
  });

  // Question Bank
  const [questions, setQuestions] = useState<QuestionBank[]>([]);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBank | null>(null);
  const [questionForm, setQuestionForm] = useState({
    question_text: "",
    category: "general",
    question_type: "rating",
    is_active: true,
  });

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    setIsLoading(true);
    
    // Fetch 360 cycles from review_cycles table
    const { data: cyclesData } = await supabase
      .from('review_cycles')
      .select('id, name, status')
      .eq('company_id', companyId)
      .eq('is_template', false)
      .order('created_at', { ascending: false });
    
    if (cyclesData) {
      setCycles(cyclesData);
    }
    
    // Fetch rater categories from database
    const { data: raterData } = await supabase
      .from('feedback_360_rater_categories')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('display_order');
    
    if (raterData && raterData.length > 0) {
      setRaterCategories(raterData.map(r => ({
        id: r.id,
        name: r.name,
        code: r.code,
        description: r.description,
        min_raters: r.min_raters ?? 1,
        max_raters: r.max_raters ?? 5,
        is_mandatory: (r as Record<string, unknown>).is_mandatory as boolean ?? false,
        is_active: r.is_active ?? true,
        anonymity_threshold: 3,
        bypass_threshold_check: false,
      })));
    } else {
      // Fallback mock data if no DB data
      setRaterCategories([
        { id: "1", name: "Direct Manager", code: "MGR", description: "Immediate supervisor", min_raters: 1, max_raters: 1, is_mandatory: true, is_active: true, anonymity_threshold: 1, bypass_threshold_check: true },
        { id: "2", name: "Peers", code: "PEER", description: "Team members and colleagues", min_raters: 2, max_raters: 5, is_mandatory: true, is_active: true, anonymity_threshold: 3, bypass_threshold_check: false },
        { id: "3", name: "Direct Reports", code: "DR", description: "Employees who report to this person", min_raters: 1, max_raters: 10, is_mandatory: false, is_active: true, anonymity_threshold: 3, bypass_threshold_check: false },
        { id: "4", name: "External", code: "EXT", description: "Clients, vendors, or external stakeholders", min_raters: 0, max_raters: 3, is_mandatory: false, is_active: true, anonymity_threshold: 2, bypass_threshold_check: false },
      ]);
    }
    
    // Fetch questions from database
    const { data: questionsData } = await supabase
      .from('feedback_360_questions')
      .select('id, question_text, category_id, question_type, is_active')
      .eq('is_active', true)
      .order('display_order');
    
    if (questionsData && questionsData.length > 0) {
      setQuestions(questionsData.map(q => ({
        id: q.id,
        question_text: q.question_text,
        category: q.category_id || 'general',
        question_type: q.question_type,
        is_active: q.is_active ?? true,
      })));
    } else {
      // Fallback mock data
      setQuestions([
        { id: "1", question_text: "How effectively does this person communicate with others?", category: "communication", question_type: "rating", is_active: true },
        { id: "2", question_text: "How well does this person collaborate with team members?", category: "teamwork", question_type: "rating", is_active: true },
        { id: "3", question_text: "What are this person's greatest strengths?", category: "strengths", question_type: "open_text", is_active: true },
        { id: "4", question_text: "What areas could this person improve?", category: "development", question_type: "open_text", is_active: true },
      ]);
    }
    
    setIsLoading(false);
  };

  const handleSaveRater = () => {
    if (!raterForm.name || !raterForm.code) {
      toast.error("Name and code are required");
      return;
    }
    
    if (editingRater) {
      setRaterCategories(prev => prev.map(r => 
        r.id === editingRater.id ? { ...r, ...raterForm, id: r.id } : r
      ));
      toast.success("Rater category updated");
    } else {
      setRaterCategories(prev => [...prev, { ...raterForm, id: Date.now().toString() }]);
      toast.success("Rater category created");
    }
    
    setRaterDialogOpen(false);
    setEditingRater(null);
    setRaterForm({ name: "", code: "", description: "", min_raters: 1, max_raters: 5, is_mandatory: true, is_active: true, anonymity_threshold: 3, bypass_threshold_check: false });
  };

  const handleDeleteRater = (id: string) => {
    if (!confirm("Delete this rater category?")) return;
    setRaterCategories(prev => prev.filter(r => r.id !== id));
    toast.success("Rater category deleted");
  };

  const handleSaveQuestion = () => {
    if (!questionForm.question_text) {
      toast.error("Question text is required");
      return;
    }
    
    if (editingQuestion) {
      setQuestions(prev => prev.map(q => 
        q.id === editingQuestion.id ? { ...q, ...questionForm, id: q.id } : q
      ));
      toast.success("Question updated");
    } else {
      setQuestions(prev => [...prev, { ...questionForm, id: Date.now().toString() }]);
      toast.success("Question created");
    }
    
    setQuestionDialogOpen(false);
    setEditingQuestion(null);
    setQuestionForm({ question_text: "", category: "general", question_type: "rating", is_active: true });
  };

  const handleDeleteQuestion = (id: string) => {
    if (!confirm("Delete this question?")) return;
    setQuestions(prev => prev.filter(q => q.id !== id));
    toast.success("Question deleted");
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="rater-categories" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden lg:inline">Rater Categories</span>
            <span className="lg:hidden">Raters</span>
          </TabsTrigger>
          <TabsTrigger value="question-bank" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden lg:inline">Question Bank</span>
            <span className="lg:hidden">Questions</span>
          </TabsTrigger>
          <TabsTrigger value="behavioral-anchors" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            <span className="hidden lg:inline">Behavioral Anchors</span>
            <span className="lg:hidden">BARS</span>
          </TabsTrigger>
          <TabsTrigger value="question-assignments" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden lg:inline">Question Assignments</span>
            <span className="lg:hidden">Assign</span>
          </TabsTrigger>
          <TabsTrigger value="cycle-templates" className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            <span className="hidden lg:inline">Cycle Templates</span>
            <span className="lg:hidden">Templates</span>
          </TabsTrigger>
          <TabsTrigger value="routing-policies" className="flex items-center gap-2">
            <Route className="h-4 w-4" />
            <span className="hidden lg:inline">Routing Policies</span>
            <span className="lg:hidden">Routing</span>
          </TabsTrigger>
          <TabsTrigger value="anonymity-policy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden lg:inline">Anonymity & Access</span>
            <span className="lg:hidden">Access</span>
          </TabsTrigger>
          <TabsTrigger value="signal-definitions" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden lg:inline">Signal Definitions</span>
            <span className="lg:hidden">Signals</span>
          </TabsTrigger>
        </TabsList>

        {/* Rater Categories Tab */}
        <TabsContent value="rater-categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Rater Categories</CardTitle>
                <CardDescription>Define who can provide feedback (peers, managers, direct reports, etc.)</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setEditingRater(null); setRaterDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Raters Required</TableHead>
                      <TableHead>Anonymity Threshold</TableHead>
                      <TableHead>Mandatory</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {raterCategories.map(rater => (
                      <TableRow key={rater.id}>
                        <TableCell className="font-medium">{rater.name}</TableCell>
                        <TableCell>{rater.code}</TableCell>
                        <TableCell>{rater.min_raters} - {rater.max_raters}</TableCell>
                        <TableCell>
                          {rater.bypass_threshold_check ? (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Always show
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Min {rater.anonymity_threshold} responses
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={rater.is_mandatory ? "default" : "secondary"}>
                            {rater.is_mandatory ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rater.is_active ? "default" : "secondary"}>
                            {rater.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingRater(rater);
                            setRaterForm({
                              name: rater.name,
                              code: rater.code,
                              description: rater.description || "",
                              min_raters: rater.min_raters,
                              max_raters: rater.max_raters,
                              is_mandatory: rater.is_mandatory,
                              is_active: rater.is_active,
                              anonymity_threshold: rater.anonymity_threshold ?? 3,
                              bypass_threshold_check: rater.bypass_threshold_check ?? false,
                            });
                            setRaterDialogOpen(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteRater(rater.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Question Bank Tab */}
        <TabsContent value="question-bank">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Question Bank</CardTitle>
                <CardDescription>Manage feedback questions used in 360° reviews</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setEditingQuestion(null); setQuestionDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map(question => (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium max-w-xs truncate">{question.question_text}</TableCell>
                        <TableCell className="capitalize">{question.category}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {question.question_type === "rating" ? "Rating Scale" : "Open Text"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={question.is_active ? "default" : "secondary"}>
                            {question.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingQuestion(question);
                            setQuestionForm({
                              question_text: question.question_text,
                              category: question.category,
                              question_type: question.question_type,
                              is_active: question.is_active,
                            });
                            setQuestionDialogOpen(true);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(question.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Question Assignments Tab */}
        <TabsContent value="question-assignments">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question-Rater Assignments</CardTitle>
              <CardDescription>
                Configure which questions appear for each rater category. Select a cycle to manage assignments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label>Select Cycle</Label>
                  <Select value={selectedCycleId || ""} onValueChange={setSelectedCycleId}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select a 360 cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      {cycles.length === 0 ? (
                        <SelectItem value="none" disabled>No cycles found</SelectItem>
                      ) : (
                        cycles.map(cycle => (
                          <SelectItem key={cycle.id} value={cycle.id}>
                            {cycle.name} ({cycle.status})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedCycleId ? (
                  <RaterQuestionMatrix cycleId={selectedCycleId} companyId={companyId} />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Select a 360 cycle above to configure question visibility for different rater categories.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavioral Anchors Tab */}
        <TabsContent value="behavioral-anchors">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Behavioral Anchors (BARS)</CardTitle>
              <CardDescription>
                Define behavioral descriptions for each rating level to improve rating consistency.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Label>Select Question</Label>
                  <Select>
                    <SelectTrigger className="w-96">
                      <SelectValue placeholder="Select a question to configure anchors" />
                    </SelectTrigger>
                    <SelectContent>
                      {questions.filter(q => q.question_type === 'rating').map(q => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.question_text.substring(0, 60)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <BehavioralAnchorEditor
                  companyId={companyId}
                  scaleMax={5}
                  onSave={(anchors) => {
                    toast.success("Behavioral anchors saved");
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signal Definitions Tab */}
        <TabsContent value="signal-definitions">
          <SignalDefinitionsManager companyId={companyId} />
        </TabsContent>

        {/* Routing Policies Tab */}
        <TabsContent value="routing-policies">
          <RoutingPolicyManager companyId={companyId} />
        </TabsContent>

        {/* Cycle Templates Tab */}
        <TabsContent value="cycle-templates">
          <CycleTemplateLibrary companyId={companyId} />
        </TabsContent>

        {/* Anonymity & Access Tab */}
        <TabsContent value="anonymity-policy">
          <AnonymityPolicySettings companyId={companyId} />
        </TabsContent>
      </Tabs>

      {/* Rater Category Dialog */}
      <Dialog open={raterDialogOpen} onOpenChange={setRaterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRater ? "Edit Rater Category" : "Add Rater Category"}</DialogTitle>
            <DialogDescription>Configure who can provide feedback in 360° reviews</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={raterForm.name}
                  onChange={e => setRaterForm({ ...raterForm, name: e.target.value })}
                  placeholder="e.g., Peers"
                />
              </div>
              <div>
                <Label>Code</Label>
                <Input
                  value={raterForm.code}
                  onChange={e => setRaterForm({ ...raterForm, code: e.target.value })}
                  placeholder="e.g., PEER"
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={raterForm.description}
                onChange={e => setRaterForm({ ...raterForm, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Raters</Label>
                <Input
                  type="number"
                  min={0}
                  value={raterForm.min_raters}
                  onChange={e => setRaterForm({ ...raterForm, min_raters: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Max Raters</Label>
                <Input
                  type="number"
                  min={1}
                  value={raterForm.max_raters}
                  onChange={e => setRaterForm({ ...raterForm, max_raters: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            
            {/* Anonymity Threshold Settings */}
            <div className="space-y-3 p-3 rounded-lg border bg-muted/20">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Anonymity Protection</Label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Always Show Results</Label>
                  <p className="text-xs text-muted-foreground">
                    Bypass anonymity threshold (e.g., for manager feedback where identity is known)
                  </p>
                </div>
                <Switch 
                  checked={raterForm.bypass_threshold_check} 
                  onCheckedChange={c => setRaterForm({ ...raterForm, bypass_threshold_check: c })} 
                />
              </div>
              
              {!raterForm.bypass_threshold_check && (
                <div className="space-y-2">
                  <Label className="text-sm">Minimum Responses Required</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={raterForm.anonymity_threshold}
                      onChange={e => setRaterForm({ ...raterForm, anonymity_threshold: parseInt(e.target.value) || 3 })}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">responses before showing aggregated scores</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={raterForm.is_mandatory} onCheckedChange={c => setRaterForm({ ...raterForm, is_mandatory: c })} />
                <Label>Mandatory</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={raterForm.is_active} onCheckedChange={c => setRaterForm({ ...raterForm, is_active: c })} />
                <Label>Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRaterDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveRater}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Dialog */}
      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Question" : "Add Question"}</DialogTitle>
            <DialogDescription>Configure feedback questions for 360° reviews</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Question Text</Label>
              <Textarea
                value={questionForm.question_text}
                onChange={e => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                placeholder="Enter the feedback question"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={questionForm.category} onValueChange={v => setQuestionForm({ ...questionForm, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="teamwork">Teamwork</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="technical">Technical Skills</SelectItem>
                    <SelectItem value="strengths">Strengths</SelectItem>
                    <SelectItem value="development">Development Areas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Question Type</Label>
                <Select value={questionForm.question_type} onValueChange={v => setQuestionForm({ ...questionForm, question_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating Scale</SelectItem>
                    <SelectItem value="open_text">Open Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={questionForm.is_active} onCheckedChange={c => setQuestionForm({ ...questionForm, is_active: c })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuestionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveQuestion}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
