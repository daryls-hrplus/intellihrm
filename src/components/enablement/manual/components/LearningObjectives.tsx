import { Target } from 'lucide-react';

interface LearningObjectivesProps {
  objectives: string[];
}

export function LearningObjectives({ objectives }: LearningObjectivesProps) {
  return (
    <div className="p-4 border-l-4 border-l-primary bg-muted/50 rounded-r-lg my-4">
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-5 w-5 text-primary" />
        <h4 className="font-semibold text-foreground">Learning Objectives</h4>
      </div>
      <p className="text-sm text-muted-foreground mb-2">After completing this section, you will be able to:</p>
      <ul className="space-y-2">
        {objectives.map((objective, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-foreground">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
              {index + 1}
            </span>
            <span>{objective}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
