import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";
import { useRaterQuestionAssignments, QuestionAssignment } from "@/hooks/useRaterQuestionAssignments";
import { Save, RotateCcw } from "lucide-react";

interface RaterQuestionAssignmentProps {
  questionId: string;
  questionText: string;
  cycleId: string;
  raterCategories: Array<{ id: string; name: string; code: string }>;
  currentAssignments: Record<string, QuestionAssignment>;
  onAssignmentChange: (raterCategoryId: string, isVisible: boolean) => void;
  onSave: () => Promise<void>;
}

export function RaterQuestionAssignment({
  questionId,
  questionText,
  cycleId,
  raterCategories,
  currentAssignments,
  onAssignmentChange,
  onSave,
}: RaterQuestionAssignmentProps) {
  const { t } = useLanguage();
  const { saveAssignment, loading } = useRaterQuestionAssignments();
  const [localAssignments, setLocalAssignments] = useState(currentAssignments);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalAssignments(currentAssignments);
  }, [currentAssignments]);

  const handleToggle = (raterCategoryId: string) => {
    const current = localAssignments[raterCategoryId];
    const newIsVisible = current ? !current.is_visible : true;
    
    setLocalAssignments(prev => ({
      ...prev,
      [raterCategoryId]: {
        ...prev[raterCategoryId],
        is_visible: newIsVisible,
        question_id: questionId,
        rater_category_id: raterCategoryId,
        cycle_id: cycleId,
      } as QuestionAssignment,
    }));
    
    setHasChanges(true);
    onAssignmentChange(raterCategoryId, newIsVisible);
  };

  const handleOrderChange = (raterCategoryId: string, order: number | null) => {
    setLocalAssignments(prev => ({
      ...prev,
      [raterCategoryId]: {
        ...prev[raterCategoryId],
        display_order_override: order,
      } as QuestionAssignment,
    }));
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    for (const [categoryId, assignment] of Object.entries(localAssignments)) {
      await saveAssignment(
        questionId,
        categoryId,
        cycleId,
        assignment?.is_visible ?? true,
        assignment?.display_order_override,
        assignment?.is_required_override
      );
    }
    setHasChanges(false);
    await onSave();
  };

  const handleReset = () => {
    setLocalAssignments(currentAssignments);
    setHasChanges(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium line-clamp-2">
          {questionText}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {raterCategories.map(category => {
          const assignment = localAssignments[category.id];
          const isVisible = assignment?.is_visible ?? true;

          return (
            <div key={category.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isVisible}
                  onCheckedChange={() => handleToggle(category.id)}
                />
                <Label className="text-sm">
                  {category.name}
                </Label>
              </div>
              {isVisible && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Order:</Label>
                  <Input
                    type="number"
                    className="w-16 h-7 text-xs"
                    placeholder="Auto"
                    value={assignment?.display_order_override ?? ''}
                    onChange={(e) => handleOrderChange(
                      category.id, 
                      e.target.value ? parseInt(e.target.value) : null
                    )}
                  />
                </div>
              )}
              {!isVisible && (
                <Badge variant="secondary" className="text-xs">
                  Hidden
                </Badge>
              )}
            </div>
          );
        })}

        {hasChanges && (
          <div className="flex gap-2 pt-2 border-t">
            <Button size="sm" onClick={handleSaveAll} disabled={loading}>
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
