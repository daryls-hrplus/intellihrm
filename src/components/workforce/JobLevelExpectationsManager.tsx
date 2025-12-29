import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import {
  useJobLevelExpectations,
  JobLevelExpectationForm,
  emptyExpectationForm,
  ThresholdSuggestion,
  ValidationWarning,
} from "@/hooks/useJobLevelExpectations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Target,
  TrendingUp,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

const JOB_LEVELS = [
  "Intern",
  "Clerk",
  "Operator",
  "Officer",
  "Staff",
  "Senior",
  "Supervisor",
  "Manager",
  "Director",
  "Executive",
];

const JOB_GRADES = [
  "GR1",
  "GR2",
  "GR3",
  "GR4",
  "GR5",
  "GR6",
  "GR7",
  "GR8",
  "GR9",
  "GR10",
];

interface Props {
  companyId: string;
}

export function JobLevelExpectationsManager({ companyId }: Props) {
  const { t } = useLanguage();
  const {
    expectations,
    isLoading,
    isSaving,
    isGenerating,
    saveExpectation,
    deleteExpectation,
    analyzeThresholdPatterns,
    validateConsistency,
    generateProgressionCriteria,
  } = useJobLevelExpectations(companyId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<JobLevelExpectationForm>(
    emptyExpectationForm
  );
  const [suggestions, setSuggestions] = useState<ThresholdSuggestion | null>(null);
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);
  const [warningsOpen, setWarningsOpen] = useState(true);

  // Update suggestions when grade/level changes
  useEffect(() => {
    if (dialogOpen && formData.job_grade && formData.job_level) {
      const newSuggestions = analyzeThresholdPatterns(formData.job_grade, formData.job_level);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions(null);
    }
  }, [dialogOpen, formData.job_grade, formData.job_level, analyzeThresholdPatterns]);

  // Update warnings when form data changes
  useEffect(() => {
    if (dialogOpen && formData.job_grade && formData.job_level) {
      const newWarnings = validateConsistency(formData, selectedId || undefined);
      setWarnings(newWarnings);
    } else {
      setWarnings([]);
    }
  }, [dialogOpen, formData, selectedId, validateConsistency]);

  const handleOpenDialog = (id?: string) => {
    if (id) {
      const exp = expectations.find((e) => e.id === id);
      if (exp) {
        setSelectedId(id);
        setFormData({
          job_level: exp.job_level,
          job_grade: exp.job_grade,
          min_competency_score: exp.min_competency_score?.toString() || "3.0",
          min_goal_achievement_percent:
            exp.min_goal_achievement_percent?.toString() || "80",
          progression_criteria: exp.progression_criteria || "",
          progression_criteria_en: exp.progression_criteria_en || "",
          notes: exp.notes || "",
          is_active: exp.is_active,
          effective_from: exp.effective_from,
          effective_to: exp.effective_to || "",
        });
      }
    } else {
      setSelectedId(null);
      setFormData(emptyExpectationForm);
    }
    setSuggestions(null);
    setWarnings([]);
    setWarningsOpen(true);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const success = await saveExpectation(formData, selectedId || undefined);
    if (success) {
      setDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    if (selectedId) {
      const success = await deleteExpectation(selectedId);
      if (success) {
        setDeleteDialogOpen(false);
        setSelectedId(null);
      }
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-green-600";
    if (score >= 3) return "text-amber-600";
    return "text-red-600";
  };

  const activeExpectations = expectations.filter((e) => e.is_active);
  const inactiveExpectations = expectations.filter((e) => !e.is_active);

  // Group by grade for summary view
  const gradeGroups = JOB_GRADES.reduce((acc, grade) => {
    acc[grade] = activeExpectations.filter((e) => e.job_grade === grade);
    return acc;
  }, {} as Record<string, typeof expectations>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Job Level Expectations
          </h3>
          <p className="text-sm text-muted-foreground">
            Define minimum performance thresholds and progression criteria for each
            job grade/level combination
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Expectation
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Defined
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeExpectations.length}</div>
            <p className="text-xs text-muted-foreground">
              level/grade combinations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Grades Covered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(gradeGroups).filter((g) => g.length > 0).length} / {JOB_GRADES.length}
            </div>
            <p className="text-xs text-muted-foreground">grades configured</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Min Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeExpectations.length > 0
                ? (
                    activeExpectations.reduce(
                      (sum, e) => sum + (e.min_competency_score || 0),
                      0
                    ) / activeExpectations.length
                  ).toFixed(1)
                : "-"}
            </div>
            <p className="text-xs text-muted-foreground">competency threshold</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Goal Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeExpectations.length > 0
                ? (
                    activeExpectations.reduce(
                      (sum, e) => sum + (e.min_goal_achievement_percent || 0),
                      0
                    ) / activeExpectations.length
                  ).toFixed(0)
                : "-"}
              %
            </div>
            <p className="text-xs text-muted-foreground">goal achievement</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : expectations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h4 className="font-medium text-lg mb-2">
              No Level Expectations Defined
            </h4>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Define minimum performance thresholds for each job grade/level to
              set clear standards across the organization.
            </p>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Expectation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1 mx-auto">
                        Min Competency
                        <HelpCircle className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Minimum average competency score required</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1 mx-auto">
                        Min Goal %
                        <HelpCircle className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Minimum goal achievement percentage</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
                <TableHead>Progression Criteria</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Effective</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expectations.map((exp) => (
                <TableRow key={exp.id} className={!exp.is_active ? "opacity-50" : ""}>
                  <TableCell>
                    <Badge variant="outline">{exp.job_grade}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{exp.job_level}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`font-semibold ${getScoreColor(
                        exp.min_competency_score || 0
                      )}`}
                    >
                      {exp.min_competency_score?.toFixed(1) || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-semibold">
                      {exp.min_goal_achievement_percent?.toFixed(0) || "-"}%
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm text-muted-foreground truncate">
                      {exp.progression_criteria || "-"}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    {exp.is_active ? (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {exp.effective_from}
                    {exp.effective_to && ` - ${exp.effective_to}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenDialog(exp.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          setSelectedId(exp.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {selectedId ? "Edit" : "Add"} Level Expectations
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Grade *</Label>
                <Select
                  value={formData.job_grade}
                  onValueChange={(value) =>
                    setFormData({ ...formData, job_grade: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_GRADES.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Job Level *</Label>
                <Select
                  value={formData.job_level}
                  onValueChange={(value) =>
                    setFormData({ ...formData, job_level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Competency Score</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={formData.min_competency_score}
                  onChange={(e) =>
                    setFormData({ ...formData, min_competency_score: e.target.value })
                  }
                  placeholder="e.g., 3.0"
                />
                {suggestions && suggestions.competencyScore && suggestions.confidence !== 'low' && (
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        min_competency_score: suggestions.competencyScore!.toString(),
                      })
                    }
                  >
                    <Lightbulb className="h-3 w-3" />
                    Suggested: {suggestions.competencyScore}
                  </button>
                )}
                <p className="text-xs text-muted-foreground">
                  Average competency rating required (1-5 scale)
                </p>
              </div>
              <div className="space-y-2">
                <Label>Minimum Goal Achievement %</Label>
                <Input
                  type="number"
                  step="5"
                  min="0"
                  max="100"
                  value={formData.min_goal_achievement_percent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_goal_achievement_percent: e.target.value,
                    })
                  }
                  placeholder="e.g., 80"
                />
                {suggestions && suggestions.goalPercent && suggestions.confidence !== 'low' && (
                  <button
                    type="button"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        min_goal_achievement_percent: suggestions.goalPercent!.toString(),
                      })
                    }
                  >
                    <Lightbulb className="h-3 w-3" />
                    Suggested: {suggestions.goalPercent}%
                  </button>
                )}
                <p className="text-xs text-muted-foreground">
                  Goal achievement percentage required
                </p>
              </div>
            </div>

            {suggestions && suggestions.message && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                {suggestions.message}
              </p>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Progression Criteria</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  disabled={isGenerating || !formData.job_grade || !formData.job_level}
                  onClick={async () => {
                    const result = await generateProgressionCriteria(
                      formData.job_level,
                      formData.job_grade
                    );
                    if (result) {
                      setFormData({
                        ...formData,
                        progression_criteria: result.criteria,
                        progression_criteria_en: result.criteria_en,
                      });
                    }
                  }}
                >
                  {isGenerating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  Generate with AI
                </Button>
              </div>
              <Textarea
                value={formData.progression_criteria}
                onChange={(e) =>
                  setFormData({ ...formData, progression_criteria: e.target.value })
                }
                placeholder="What is required to advance to the next level..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Describe requirements for promotion to the next level
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Effective From *</Label>
                <Input
                  type="date"
                  value={formData.effective_from}
                  onChange={(e) =>
                    setFormData({ ...formData, effective_from: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Effective To</Label>
                <Input
                  type="date"
                  value={formData.effective_to}
                  onChange={(e) =>
                    setFormData({ ...formData, effective_to: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes..."
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            {/* Validation Warnings */}
            {warnings.length > 0 && (
              <Collapsible open={warningsOpen} onOpenChange={setWarningsOpen}>
                <CollapsibleTrigger asChild>
                  <Alert className="cursor-pointer border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="flex items-center justify-between">
                      <span>{warnings.length} Warning{warnings.length > 1 ? 's' : ''}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${warningsOpen ? 'rotate-180' : ''}`} />
                    </AlertTitle>
                  </Alert>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {warnings.map((warning, idx) => (
                    <div
                      key={idx}
                      className="rounded-md border border-amber-200 bg-amber-50/50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950/50"
                    >
                      <p className="font-medium text-amber-700 dark:text-amber-400">
                        {warning.message}
                      </p>
                      {warning.recommendation && (
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                          💡 {warning.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            {warnings.length > 0 && (
              <Button
                variant="secondary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Anyway
              </Button>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Level Expectations?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the level expectations. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
