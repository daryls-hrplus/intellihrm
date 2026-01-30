import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sparkles, FileText, CheckCircle, XCircle, Edit, Trash2, Plus, Brain, BookOpen, Target } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GeneratedQuiz {
  id: string;
  quiz_title: string;
  course_id: string | null;
  difficulty_level: string;
  question_count: number;
  generation_status: string;
  ai_confidence_score: number | null;
  bloom_taxonomy_distribution: Record<string, number>;
  generated_at: string | null;
  created_at: string;
}

interface GeneratedQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_option_index: number | null;
  explanation: string | null;
  bloom_level: string | null;
  ai_confidence_score: number | null;
  is_approved: boolean;
  order_index: number;
}

export function AIQuizGeneratorPanel() {
  const [activeTab, setActiveTab] = useState('generator');
  const [selectedQuiz, setSelectedQuiz] = useState<GeneratedQuiz | null>(null);
  const [showNewQuizDialog, setShowNewQuizDialog] = useState(false);
  const [generationConfig, setGenerationConfig] = useState({
    sourceType: 'lesson_content',
    sourceContent: '',
    quizTitle: '',
    difficulty: 'intermediate',
    questionCount: 10,
  });

  const queryClient = useQueryClient();

  const { data: quizzes = [], isLoading: loadingQuizzes } = useQuery({
    queryKey: ['ai-generated-quizzes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_generated_quizzes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as GeneratedQuiz[];
    },
  });

  const { data: questions = [], isLoading: loadingQuestions } = useQuery({
    queryKey: ['ai-generated-questions', selectedQuiz?.id],
    queryFn: async () => {
      if (!selectedQuiz) return [];
      const { data, error } = await supabase
        .from('ai_generated_questions')
        .select('*')
        .eq('quiz_id', selectedQuiz.id)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as GeneratedQuestion[];
    },
    enabled: !!selectedQuiz,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['lms-courses-for-quiz'],
    queryFn: async (): Promise<Array<{ id: string; title: string }>> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('lms_courses')
        .select('id, title')
        .eq('is_active', true)
        .order('title');
      if (error) throw error;
      return (data ?? []) as Array<{ id: string; title: string }>;
    },
  });

  const generateQuizMutation = useMutation({
    mutationFn: async () => {
      // Insert the quiz record
      const { data: quiz, error: quizError } = await supabase
        .from('ai_generated_quizzes')
        .insert([{
          quiz_title: generationConfig.quizTitle || 'AI Generated Quiz',
          source_type: generationConfig.sourceType,
          source_content: generationConfig.sourceContent,
          difficulty_level: generationConfig.difficulty,
          question_count: generationConfig.questionCount,
          generation_status: 'generating',
        }])
        .select()
        .single();

      if (quizError) throw quizError;

      // Simulate AI generation (in production, this would call an edge function)
      const bloomLevels = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];
      const generatedQuestions = Array.from({ length: generationConfig.questionCount }, (_, i) => ({
        quiz_id: quiz.id,
        question_text: `Sample Question ${i + 1}: Based on the provided content, what is the key concept?`,
        question_type: 'multiple_choice',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_option_index: Math.floor(Math.random() * 4),
        explanation: 'This is the explanation for the correct answer.',
        bloom_level: bloomLevels[Math.floor(Math.random() * bloomLevels.length)],
        ai_confidence_score: 0.7 + Math.random() * 0.3,
        order_index: i,
      }));

      const { error: questionsError } = await supabase
        .from('ai_generated_questions')
        .insert(generatedQuestions);

      if (questionsError) throw questionsError;

      // Update quiz status
      await supabase
        .from('ai_generated_quizzes')
        .update({
          generation_status: 'completed',
          generated_at: new Date().toISOString(),
          ai_confidence_score: 0.85,
          bloom_taxonomy_distribution: {
            remember: 2,
            understand: 3,
            apply: 2,
            analyze: 2,
            evaluate: 1,
          },
        })
        .eq('id', quiz.id);

      return quiz;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-generated-quizzes'] });
      setShowNewQuizDialog(false);
      toast.success('Quiz generated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to generate quiz: ' + error.message);
    },
  });

  const approveQuizMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const { error } = await supabase
        .from('ai_generated_quizzes')
        .update({
          generation_status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', quizId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-generated-quizzes'] });
      toast.success('Quiz approved!');
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      generating: 'outline',
      completed: 'default',
      approved: 'default',
      failed: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getBloomBadge = (level: string | null) => {
    if (!level) return null;
    const colors: Record<string, string> = {
      remember: 'bg-blue-100 text-blue-800',
      understand: 'bg-green-100 text-green-800',
      apply: 'bg-yellow-100 text-yellow-800',
      analyze: 'bg-orange-100 text-orange-800',
      evaluate: 'bg-purple-100 text-purple-800',
      create: 'bg-pink-100 text-pink-800',
    };
    return (
      <Badge className={colors[level] || 'bg-gray-100 text-gray-800'} variant="outline">
        {level}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Quiz Generator</CardTitle>
          </div>
          <Dialog open={showNewQuizDialog} onOpenChange={setShowNewQuizDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate New Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Generate AI Quiz</DialogTitle>
                <DialogDescription>
                  Provide content and settings for AI-powered quiz generation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Quiz Title</Label>
                  <Input
                    placeholder="Enter quiz title"
                    value={generationConfig.quizTitle}
                    onChange={(e) => setGenerationConfig({ ...generationConfig, quizTitle: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Source Type</Label>
                    <Select
                      value={generationConfig.sourceType}
                      onValueChange={(value) => setGenerationConfig({ ...generationConfig, sourceType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lesson_content">Lesson Content</SelectItem>
                        <SelectItem value="document">Document Upload</SelectItem>
                        <SelectItem value="transcript">Video Transcript</SelectItem>
                        <SelectItem value="manual_input">Manual Input</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty Level</Label>
                    <Select
                      value={generationConfig.difficulty}
                      onValueChange={(value) => setGenerationConfig({ ...generationConfig, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Number of Questions</Label>
                  <Input
                    type="number"
                    min={5}
                    max={50}
                    value={generationConfig.questionCount}
                    onChange={(e) => setGenerationConfig({ ...generationConfig, questionCount: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Source Content</Label>
                  <Textarea
                    placeholder="Paste the content from which questions should be generated..."
                    rows={6}
                    value={generationConfig.sourceContent}
                    onChange={(e) => setGenerationConfig({ ...generationConfig, sourceContent: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewQuizDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => generateQuizMutation.mutate()}
                  disabled={generateQuizMutation.isPending || !generationConfig.sourceContent}
                >
                  {generateQuizMutation.isPending ? 'Generating...' : 'Generate Quiz'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Generate intelligent quizzes from course content using AI with Bloom's taxonomy alignment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="generator">Generated Quizzes</TabsTrigger>
            <TabsTrigger value="review">Question Review</TabsTrigger>
            <TabsTrigger value="analytics">Generation Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="mt-4">
            {loadingQuizzes ? (
              <div className="text-center py-8 text-muted-foreground">Loading quizzes...</div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No quizzes generated yet</p>
                <p className="text-sm text-muted-foreground">Click "Generate New Quiz" to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz Title</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium">{quiz.quiz_title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{quiz.difficulty_level}</Badge>
                      </TableCell>
                      <TableCell>{quiz.question_count}</TableCell>
                      <TableCell>
                        {quiz.ai_confidence_score 
                          ? `${(quiz.ai_confidence_score * 100).toFixed(0)}%`
                          : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(quiz.generation_status)}</TableCell>
                      <TableCell>{new Date(quiz.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedQuiz(quiz);
                              setActiveTab('review');
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          {quiz.generation_status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => approveQuizMutation.mutate(quiz.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="review" className="mt-4">
            {!selectedQuiz ? (
              <div className="text-center py-8 text-muted-foreground">
                Select a quiz from the list to review questions
              </div>
            ) : loadingQuestions ? (
              <div className="text-center py-8 text-muted-foreground">Loading questions...</div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedQuiz.quiz_title}</h3>
                    <p className="text-sm text-muted-foreground">{questions.length} questions</p>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedQuiz(null)}>
                    Back to List
                  </Button>
                </div>
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <Card key={question.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Q{index + 1}
                              </span>
                              {getBloomBadge(question.bloom_level)}
                              {question.ai_confidence_score && (
                                <Badge variant="outline">
                                  {(question.ai_confidence_score * 100).toFixed(0)}% confidence
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium mb-2">{question.question_text}</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {question.options?.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`p-2 rounded border ${
                                    optIndex === question.correct_option_index
                                      ? 'bg-green-50 border-green-200'
                                      : 'bg-muted/50'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </div>
                              ))}
                            </div>
                            {question.explanation && (
                              <p className="text-sm text-muted-foreground mt-2">
                                <strong>Explanation:</strong> {question.explanation}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1 ml-4">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{quizzes.length}</p>
                      <p className="text-sm text-muted-foreground">Total Quizzes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-green-100">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {quizzes.filter(q => q.generation_status === 'approved').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Approved</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-blue-100">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {quizzes.length > 0
                          ? `${(quizzes.reduce((sum, q) => sum + (q.ai_confidence_score || 0), 0) / quizzes.length * 100).toFixed(0)}%`
                          : '-'}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Confidence</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
