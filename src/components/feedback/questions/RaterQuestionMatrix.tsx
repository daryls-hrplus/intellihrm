import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/hooks/useLanguage";
import { useRaterQuestionAssignments, QuestionWithAssignments } from "@/hooks/useRaterQuestionAssignments";
import { supabase } from "@/integrations/supabase/client";
import { Save, Filter, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";

interface RaterQuestionMatrixProps {
  cycleId: string;
  companyId: string;
}

interface RaterCategory {
  id: string;
  name: string;
  code: string;
}

export function RaterQuestionMatrix({ cycleId, companyId }: RaterQuestionMatrixProps) {
  const { t } = useLanguage();
  const { fetchQuestionsWithAssignments, bulkSaveAssignments, loading } = useRaterQuestionAssignments();
  
  const [questions, setQuestions] = useState<QuestionWithAssignments[]>([]);
  const [raterCategories, setRaterCategories] = useState<RaterCategory[]>([]);
  const [assignments, setAssignments] = useState<Record<string, Record<string, boolean>>>({});
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadData();
  }, [cycleId, companyId]);

  const loadData = async () => {
    // Load rater categories
    const { data: categories } = await supabase
      .from('feedback_360_rater_categories')
      .select('id, name, code')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('display_order');

    if (categories) {
      setRaterCategories(categories);
    }

    // Load questions with assignments
    const questionsData = await fetchQuestionsWithAssignments(cycleId, companyId);
    setQuestions(questionsData);

    // Initialize assignments state
    const initialAssignments: Record<string, Record<string, boolean>> = {};
    questionsData.forEach(q => {
      initialAssignments[q.id] = {};
      (categories || []).forEach(c => {
        const assignment = q.assignments[c.id];
        initialAssignments[q.id][c.id] = assignment?.is_visible ?? true;
      });
    });
    setAssignments(initialAssignments);
  };

  const handleToggle = (questionId: string, categoryId: string) => {
    setAssignments(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [categoryId]: !prev[questionId]?.[categoryId],
      },
    }));
    setHasChanges(true);
  };

  const handleSelectAllForCategory = (categoryId: string, select: boolean) => {
    setAssignments(prev => {
      const newAssignments = { ...prev };
      filteredQuestions.forEach(q => {
        if (!newAssignments[q.id]) newAssignments[q.id] = {};
        newAssignments[q.id][categoryId] = select;
      });
      return newAssignments;
    });
    setHasChanges(true);
  };

  const handleSelectAllForQuestion = (questionId: string, select: boolean) => {
    setAssignments(prev => ({
      ...prev,
      [questionId]: raterCategories.reduce((acc, c) => {
        acc[c.id] = select;
        return acc;
      }, {} as Record<string, boolean>),
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const assignmentsToSave: Array<{
      questionId: string;
      raterCategoryId: string;
      cycleId: string;
      isVisible: boolean;
    }> = [];

    Object.entries(assignments).forEach(([questionId, categories]) => {
      Object.entries(categories).forEach(([categoryId, isVisible]) => {
        assignmentsToSave.push({
          questionId,
          raterCategoryId: categoryId,
          cycleId,
          isVisible,
        });
      });
    });

    const success = await bulkSaveAssignments(assignmentsToSave);
    if (success) {
      setHasChanges(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = !searchFilter || 
      q.question_text.toLowerCase().includes(searchFilter.toLowerCase()) ||
      q.competency_name?.toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesCategory = !categoryFilter || q.competency_name === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const competencyOptions = [...new Set(questions.map(q => q.competency_name).filter(Boolean))];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Question Visibility by Rater Type</CardTitle>
            <CardDescription>
              Configure which questions each rater category can see and respond to
            </CardDescription>
          </div>
          {hasChanges && (
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4 pt-4">
          <div className="flex-1">
            <Input
              placeholder="Search questions..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="border rounded-md px-3 py-1.5 text-sm bg-background"
              value={categoryFilter || ''}
              onChange={(e) => setCategoryFilter(e.target.value || null)}
            >
              <option value="">All Competencies</option>
              {competencyOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-background z-10">
                <tr>
                  <th className="text-left p-2 border-b min-w-[300px]">
                    Question
                  </th>
                  {raterCategories.map(category => (
                    <th key={category.id} className="p-2 border-b text-center min-w-[100px]">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{category.name}</div>
                        <div className="flex justify-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => handleSelectAllForCategory(category.id, true)}
                            title="Select all"
                          >
                            <CheckSquare className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => handleSelectAllForCategory(category.id, false)}
                            title="Deselect all"
                          >
                            <Square className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="p-2 border-b min-w-[80px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.map(question => (
                  <tr key={question.id} className="hover:bg-muted/50">
                    <td className="p-2 border-b">
                      <div className="space-y-1">
                        <div className="text-sm line-clamp-2">{question.question_text}</div>
                        {question.competency_name && (
                          <Badge variant="outline" className="text-xs">
                            {question.competency_name}
                          </Badge>
                        )}
                      </div>
                    </td>
                    {raterCategories.map(category => (
                      <td key={category.id} className="p-2 border-b text-center">
                        <Checkbox
                          checked={assignments[question.id]?.[category.id] ?? true}
                          onCheckedChange={() => handleToggle(question.id, category.id)}
                        />
                      </td>
                    ))}
                    <td className="p-2 border-b text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => handleSelectAllForQuestion(question.id, true)}
                          title="Show for all"
                        >
                          <CheckSquare className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => handleSelectAllForQuestion(question.id, false)}
                          title="Hide for all"
                        >
                          <Square className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No questions found matching your criteria
          </div>
        )}
      </CardContent>
    </Card>
  );
}
