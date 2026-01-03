import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Edit, Trash2, Lock, Sparkles, Copy, Info } from "lucide-react";
import {
  useTalentSignalDefinitions,
  useManageSignalDefinition,
  useDeleteSignalDefinition,
} from "@/hooks/feedback/useTalentSignals";
import type { SignalCategory, AggregationMethod } from "@/types/talentSignals";

interface SignalDefinitionsManagerProps {
  companyId: string;
}

const SIGNAL_CATEGORIES: { value: SignalCategory; label: string }[] = [
  { value: "leadership", label: "Leadership" },
  { value: "teamwork", label: "Teamwork" },
  { value: "technical", label: "Technical" },
  { value: "values", label: "Values" },
  { value: "general", label: "General" },
];

const AGGREGATION_METHODS: { value: AggregationMethod; label: string; description: string }[] = [
  { value: "weighted_average", label: "Weighted Average", description: "Uses rater weights" },
  { value: "simple_average", label: "Simple Average", description: "Equal weight for all" },
  { value: "median", label: "Median", description: "Middle value" },
  { value: "max", label: "Maximum", description: "Highest score" },
  { value: "min", label: "Minimum", description: "Lowest score" },
];

const categoryColors: Record<SignalCategory, string> = {
  leadership: "bg-purple-600 text-white dark:bg-purple-500",
  teamwork: "bg-blue-600 text-white dark:bg-blue-500",
  technical: "bg-emerald-600 text-white dark:bg-emerald-500",
  values: "bg-amber-500 text-white dark:bg-amber-400 dark:text-amber-950",
  general: "bg-slate-500 text-white dark:bg-slate-400 dark:text-slate-950",
};

export function SignalDefinitionsManager({ companyId }: SignalDefinitionsManagerProps) {
  const { data: definitions, isLoading } = useTalentSignalDefinitions(companyId);
  const manageMutation = useManageSignalDefinition();
  const deleteMutation = useDeleteSignalDefinition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState<any>(null);
  const [form, setForm] = useState({
    code: "",
    name: "",
    name_en: "",
    description: "",
    signal_category: "general" as SignalCategory,
    aggregation_method: "weighted_average" as AggregationMethod,
    confidence_threshold: 0.6,
    is_active: true,
  });

  // Separate system and custom signals
  const systemSignals = definitions?.filter((s) => s.is_system_defined === true) || [];
  const customSignals = definitions?.filter((s) => s.is_system_defined !== true) || [];

  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      name_en: "",
      description: "",
      signal_category: "general",
      aggregation_method: "weighted_average",
      confidence_threshold: 0.6,
      is_active: true,
    });
    setEditingSignal(null);
  };

  const handleEdit = (signal: any) => {
    setEditingSignal(signal);
    setForm({
      code: signal.code,
      name: signal.name,
      name_en: signal.name_en || "",
      description: signal.description || "",
      signal_category: signal.signal_category,
      aggregation_method: signal.aggregation_method,
      confidence_threshold: signal.confidence_threshold,
      is_active: signal.is_active,
    });
    setDialogOpen(true);
  };

  const handleClone = (signal: any) => {
    setEditingSignal(null); // Not editing, creating new
    setForm({
      code: `${signal.code}_custom`,
      name: `${signal.name} (Custom)`,
      name_en: signal.name_en ? `${signal.name_en} (Custom)` : "",
      description: signal.description || "",
      signal_category: signal.signal_category,
      aggregation_method: signal.aggregation_method,
      confidence_threshold: signal.confidence_threshold,
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    await manageMutation.mutateAsync({
      id: editingSignal?.id,
      company_id: companyId,
      ...form,
    });
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this signal definition?")) return;
    await deleteMutation.mutateAsync(id);
  };

  const renderSignalRow = (signal: any, isSystem: boolean) => (
    <TableRow key={signal.id} className={isSystem ? "bg-muted/30" : ""}>
      <TableCell>
        <div className="flex items-center gap-2">
          {isSystem && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>System signal - read-only. Clone to customize.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <div>
            <p className="font-medium">{signal.name}</p>
            <p className="text-xs text-muted-foreground">{signal.code}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={categoryColors[signal.signal_category as SignalCategory] || categoryColors.general}>
          {SIGNAL_CATEGORIES.find((c) => c.value === signal.signal_category)?.label || signal.signal_category}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">
        {AGGREGATION_METHODS.find((m) => m.value === signal.aggregation_method)?.label}
      </TableCell>
      <TableCell className="text-sm">{(signal.confidence_threshold * 100).toFixed(0)}%</TableCell>
      <TableCell>
        <Badge variant={signal.is_active ? "default" : "secondary"}>
          {signal.is_active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {isSystem ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => handleClone(signal)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clone to custom signal</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <>
            <Button variant="ghost" size="icon" onClick={() => handleEdit(signal)} title="Edit">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(signal.id)} title="Delete">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </>
        )}
      </TableCell>
    </TableRow>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Signal Definitions
          </CardTitle>
          <CardDescription>Configure talent signals tracked from 360° feedback cycles</CardDescription>
        </div>
        <Button
          size="sm"
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Signal
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info banner */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">System signals</span> (🔒) are shared templates that cannot be modified.
            Click the <Copy className="h-3 w-3 inline mx-1" /> clone button to create an editable custom version, or
            add new signals specific to your organization.
          </AlertDescription>
        </Alert>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* System Signals Section */}
            {systemSignals.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Lock className="h-3.5 w-3.5" />
                  System Signals ({systemSignals.length})
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Signal</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Aggregation</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{systemSignals.map((signal) => renderSignalRow(signal, true))}</TableBody>
                </Table>
              </div>
            )}

            {/* Custom Signals Section */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Custom Signals ({customSignals.length})
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Signal</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Aggregation</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customSignals.length > 0 ? (
                    customSignals.map((signal) => renderSignalRow(signal, false))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No custom signals yet. Add your first signal or clone a system signal to customize.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSignal ? "Edit Signal Definition" : "Add Custom Signal"}</DialogTitle>
            <DialogDescription>Define a talent signal that will be extracted from 360° feedback</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Code *</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                  placeholder="e.g., collaboration"
                />
              </div>
              <div>
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Collaboration"
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What does this signal measure?"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={form.signal_category}
                  onValueChange={(v) => setForm({ ...form, signal_category: v as SignalCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIGNAL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Aggregation Method</Label>
                <Select
                  value={form.aggregation_method}
                  onValueChange={(v) => setForm({ ...form, aggregation_method: v as AggregationMethod })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGGREGATION_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Confidence Threshold (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.confidence_threshold * 100}
                  onChange={(e) =>
                    setForm({ ...form, confidence_threshold: Math.min(1, Math.max(0, parseInt(e.target.value) / 100)) })
                  }
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.is_active} onCheckedChange={(c) => setForm({ ...form, is_active: c })} />
                <Label>Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.code || !form.name || manageMutation.isPending}>
              {manageMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}