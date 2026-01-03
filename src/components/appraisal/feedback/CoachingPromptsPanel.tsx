import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  HelpCircle,
  Copy,
  Check 
} from 'lucide-react';
import type { CoachingPrompt } from '@/types/developmentThemes';
import { toast } from 'sonner';

interface CoachingPromptsPanelProps {
  prompts: CoachingPrompt[];
  isReadOnly?: boolean;
}

const categoryConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  strength: { 
    icon: TrendingUp, 
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    label: 'Strength' 
  },
  development: { 
    icon: TrendingDown, 
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    label: 'Development' 
  },
  blind_spot: { 
    icon: Eye, 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    label: 'Blind Spot' 
  },
  exploration: { 
    icon: HelpCircle, 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    label: 'Explore' 
  },
};

export function CoachingPromptsPanel({ prompts, isReadOnly = true }: CoachingPromptsPanelProps) {
  const [usedPrompts, setUsedPrompts] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleToggleUsed = (promptId: string) => {
    if (isReadOnly) return;
    setUsedPrompts(prev => {
      const next = new Set(prev);
      if (next.has(promptId)) {
        next.delete(promptId);
      } else {
        next.add(promptId);
      }
      return next;
    });
  };

  const handleCopyPrompt = async (prompt: CoachingPrompt) => {
    try {
      await navigator.clipboard.writeText(prompt.prompt_text);
      setCopiedId(prompt.id);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // Group prompts by category
  const groupedPrompts = prompts.reduce((acc, prompt) => {
    if (!acc[prompt.category]) acc[prompt.category] = [];
    acc[prompt.category].push(prompt);
    return acc;
  }, {} as Record<string, CoachingPrompt[]>);

  if (prompts.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No coaching prompts available.</p>
        <p className="text-xs mt-1">Prompts are generated based on feedback signals.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lightbulb className="h-4 w-4" />
        <span>Suggested conversation starters based on feedback patterns</span>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedPrompts).map(([category, categoryPrompts]) => {
          const config = categoryConfig[category] || categoryConfig.exploration;
          const Icon = config.icon;

          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={config.color}>
                  <Icon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {categoryPrompts.length} prompt{categoryPrompts.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid gap-2">
                {categoryPrompts.map((prompt) => {
                  const isUsed = usedPrompts.has(prompt.id);
                  
                  return (
                    <Card 
                      key={prompt.id} 
                      className={`transition-all ${isUsed ? 'opacity-60 bg-muted/50' : ''}`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          {!isReadOnly && (
                            <Checkbox 
                              checked={isUsed}
                              onCheckedChange={() => handleToggleUsed(prompt.id)}
                              className="mt-0.5"
                            />
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${isUsed ? 'line-through' : ''}`}>
                              "{prompt.prompt_text}"
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {prompt.context}
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => handleCopyPrompt(prompt)}
                          >
                            {copiedId === prompt.id ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {!isReadOnly && usedPrompts.size > 0 && (
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          {usedPrompts.size} prompt{usedPrompts.size !== 1 ? 's' : ''} used in conversation
        </div>
      )}
    </div>
  );
}
