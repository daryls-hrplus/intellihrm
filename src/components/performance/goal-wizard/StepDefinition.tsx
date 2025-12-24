import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEVEL_FIELD_CONFIG, GoalLevel } from "./LevelFieldConfig";
import { Lightbulb } from "lucide-react";

interface JobGoal {
  id: string;
  goal_name: string;
  goal_description: string | null;
  weighting: number;
}

interface StepDefinitionProps {
  goalLevel: GoalLevel;
  formData: {
    title: string;
    description: string;
    category: string;
    start_date: string;
    due_date: string;
    status: string;
    employee_id: string;
    parent_goal_id: string;
    goal_source: string;
  };
  onChange: (updates: Partial<StepDefinitionProps["formData"]>) => void;
  employees: { id: string; full_name: string }[];
  parentGoals: { id: string; title: string }[];
  jobGoals: JobGoal[];
  onSelectJobGoal: (jobGoal: JobGoal) => void;
}

export function StepDefinition({
  goalLevel,
  formData,
  onChange,
  employees,
  parentGoals,
  jobGoals,
  onSelectJobGoal,
}: StepDefinitionProps) {
  const levelConfig = LEVEL_FIELD_CONFIG[goalLevel];

  return (
    <div className="space-y-5">
      {/* Employee Selector - Individual goals only */}
      {levelConfig.showEmployee && (
        <div className="space-y-2">
          <Label htmlFor="employee_id">Employee *</Label>
          <Select
            value={formData.employee_id || "none"}
            onValueChange={(value) => onChange({ employee_id: value === "none" ? "" : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Select an employee</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Job Goals Suggestions - Individual level with employee selected */}
      {levelConfig.showJobGoals && jobGoals.length > 0 && (
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            Suggested Goals from Job
          </Label>
          <div className="p-3 border rounded-lg bg-amber-50/50 dark:bg-amber-950/20 max-h-28 overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-2">Click to use as template:</p>
            <div className="space-y-1">
              {jobGoals.map((jg) => (
                <button
                  type="button"
                  key={jg.id}
                  onClick={() => onSelectJobGoal(jg)}
                  className="w-full text-left p-2 text-sm rounded hover:bg-accent transition-colors"
                >
                  <span className="font-medium">{jg.goal_name}</span>
                  {jg.weighting && (
                    <span className="text-xs text-muted-foreground ml-2">({jg.weighting}%)</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Goal Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Enter a clear, actionable goal title"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe what success looks like..."
          rows={3}
        />
      </div>

      {/* Dates and Status Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date *</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => onChange({ start_date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => onChange({ due_date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => onChange({ status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category and Source Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => onChange({ category: e.target.value })}
            placeholder="e.g., Sales, Development"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goal_source">Source</Label>
          <Select
            value={formData.goal_source}
            onValueChange={(value) => onChange({ goal_source: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="self_created">Self-Created</SelectItem>
              <SelectItem value="manager_assigned">Manager Assigned</SelectItem>
              <SelectItem value="cascaded">Cascaded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Parent Goal Alignment */}
      {levelConfig.showParentGoalAlignment && parentGoals.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="parent_goal_id">Align to Parent Goal</Label>
          <Select
            value={formData.parent_goal_id || "none"}
            onValueChange={(value) => onChange({ parent_goal_id: value === "none" ? "" : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parent goal for alignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (standalone goal)</SelectItem>
              {parentGoals.map((pg) => (
                <SelectItem key={pg.id} value={pg.id}>
                  {pg.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Aligning to a parent goal enables weight inheritance and cascade tracking.
          </p>
        </div>
      )}
    </div>
  );
}
