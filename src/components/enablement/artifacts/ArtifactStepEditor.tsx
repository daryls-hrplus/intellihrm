import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Lightbulb, AlertTriangle } from 'lucide-react';
import type { ArtifactStep } from '@/types/artifact';

interface ArtifactStepEditorProps {
  steps: ArtifactStep[];
  onChange: (steps: ArtifactStep[]) => void;
  disabled?: boolean;
}

export function ArtifactStepEditor({ steps, onChange, disabled }: ArtifactStepEditorProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const addStep = () => {
    const newStep: ArtifactStep = {
      id: crypto.randomUUID(),
      order: steps.length + 1,
      title: '',
      description: '',
      tips: [],
      warnings: []
    };
    onChange([...steps, newStep]);
    setExpandedStep(newStep.id);
  };

  const updateStep = (id: string, updates: Partial<ArtifactStep>) => {
    onChange(steps.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  const removeStep = (id: string) => {
    const filtered = steps.filter(step => step.id !== id);
    // Reorder remaining steps
    onChange(filtered.map((step, index) => ({ ...step, order: index + 1 })));
  };

  const moveStep = (id: string, direction: 'up' | 'down') => {
    const index = steps.findIndex(step => step.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === steps.length - 1)) {
      return;
    }

    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    // Update order numbers
    onChange(newSteps.map((step, i) => ({ ...step, order: i + 1 })));
  };

  const addTip = (stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (step) {
      updateStep(stepId, { tips: [...(step.tips || []), ''] });
    }
  };

  const addWarning = (stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (step) {
      updateStep(stepId, { warnings: [...(step.warnings || []), ''] });
    }
  };

  const updateTip = (stepId: string, index: number, value: string) => {
    const step = steps.find(s => s.id === stepId);
    if (step && step.tips) {
      const newTips = [...step.tips];
      newTips[index] = value;
      updateStep(stepId, { tips: newTips });
    }
  };

  const removeTip = (stepId: string, index: number) => {
    const step = steps.find(s => s.id === stepId);
    if (step && step.tips) {
      updateStep(stepId, { tips: step.tips.filter((_, i) => i !== index) });
    }
  };

  const updateWarning = (stepId: string, index: number, value: string) => {
    const step = steps.find(s => s.id === stepId);
    if (step && step.warnings) {
      const newWarnings = [...step.warnings];
      newWarnings[index] = value;
      updateStep(stepId, { warnings: newWarnings });
    }
  };

  const removeWarning = (stepId: string, index: number) => {
    const step = steps.find(s => s.id === stepId);
    if (step && step.warnings) {
      updateStep(stepId, { warnings: step.warnings.filter((_, i) => i !== index) });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Steps</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addStep}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Step
        </Button>
      </div>

      {steps.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <p className="mb-2">No steps added yet</p>
            <Button variant="outline" size="sm" onClick={addStep} disabled={disabled}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Step
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <Card key={step.id} className="relative">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 pt-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <div className="flex flex-col gap-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveStep(step.id, 'up')}
                        disabled={disabled || index === 0}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveStep(step.id, 'down')}
                        disabled={disabled || index === steps.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {step.order}
                      </span>
                      <Input
                        placeholder="Step title"
                        value={step.title}
                        onChange={(e) => updateStep(step.id, { title: e.target.value })}
                        disabled={disabled}
                        className="font-medium"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStep(step.id)}
                        disabled={disabled}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <Textarea
                      placeholder="Step description - explain what the user should do..."
                      value={step.description}
                      onChange={(e) => updateStep(step.id, { description: e.target.value })}
                      disabled={disabled}
                      rows={2}
                    />

                    <div className="flex gap-2">
                      <Input
                        placeholder="UI Route (e.g., /hr/employees)"
                        value={step.ui_route || ''}
                        onChange={(e) => updateStep(step.id, { ui_route: e.target.value })}
                        disabled={disabled}
                        className="text-sm"
                      />
                    </div>

                    {/* Tips */}
                    {step.tips && step.tips.length > 0 && (
                      <div className="space-y-2">
                        {step.tips.map((tip, tipIndex) => (
                          <div key={tipIndex} className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                            <Input
                              placeholder="Helpful tip..."
                              value={tip}
                              onChange={(e) => updateTip(step.id, tipIndex, e.target.value)}
                              disabled={disabled}
                              className="text-sm"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeTip(step.id, tipIndex)}
                              disabled={disabled}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Warnings */}
                    {step.warnings && step.warnings.length > 0 && (
                      <div className="space-y-2">
                        {step.warnings.map((warning, warnIndex) => (
                          <div key={warnIndex} className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                            <Input
                              placeholder="Warning or caution..."
                              value={warning}
                              onChange={(e) => updateWarning(step.id, warnIndex, e.target.value)}
                              disabled={disabled}
                              className="text-sm"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeWarning(step.id, warnIndex)}
                              disabled={disabled}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addTip(step.id)}
                        disabled={disabled}
                        className="text-yellow-600"
                      >
                        <Lightbulb className="h-3 w-3 mr-1" />
                        Add Tip
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addWarning(step.id)}
                        disabled={disabled}
                        className="text-destructive"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Add Warning
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
