import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash2, AlertTriangle, Users, Clock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const escalationRuleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  priority_id: z.string().optional(),
  escalation_level: z.coerce.number().min(1).max(5),
  escalate_after_hours: z.coerce.number().min(1).max(168),
  notify_emails: z.string().optional(),
  is_active: z.boolean(),
});

type EscalationRuleForm = z.infer<typeof escalationRuleSchema>;

interface EscalationRule {
  id: string;
  name: string;
  description: string | null;
  priority_id: string | null;
  escalation_level: number;
  escalate_after_hours: number;
  notify_emails: string[];
  notify_governance_body_id: string | null;
  is_active: boolean;
  created_at: string;
  priority?: { name: string; code: string; color: string } | null;
}

export function EscalationRulesPanel() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<EscalationRule | null>(null);

  const form = useForm<EscalationRuleForm>({
    resolver: zodResolver(escalationRuleSchema),
    defaultValues: {
      name: "",
      description: "",
      priority_id: "",
      escalation_level: 1,
      escalate_after_hours: 1,
      notify_emails: "",
      is_active: true,
    },
  });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["escalation-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("escalation_rules")
        .select(`
          *,
          priority:ticket_priorities(name, code, color)
        `)
        .order("escalation_level")
        .order("escalate_after_hours");
      if (error) throw error;
      return data as EscalationRule[];
    },
  });

  const { data: priorities = [] } = useQuery({
    queryKey: ["ticket-priorities-for-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_priorities")
        .select("id, name, code, color")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: EscalationRuleForm) => {
      const emails = values.notify_emails
        ? values.notify_emails.split(",").map(e => e.trim()).filter(e => e)
        : [];
      const { error } = await supabase.from("escalation_rules").insert({
        name: values.name,
        description: values.description || null,
        priority_id: values.priority_id || null,
        escalation_level: values.escalation_level,
        escalate_after_hours: values.escalate_after_hours,
        notify_emails: emails,
        is_active: values.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-rules"] });
      toast.success("Escalation rule created");
      handleCloseDialog();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: EscalationRuleForm }) => {
      const emails = values.notify_emails
        ? values.notify_emails.split(",").map(e => e.trim()).filter(e => e)
        : [];
      const { error } = await supabase
        .from("escalation_rules")
        .update({
          name: values.name,
          description: values.description || null,
          priority_id: values.priority_id || null,
          escalation_level: values.escalation_level,
          escalate_after_hours: values.escalate_after_hours,
          notify_emails: emails,
          is_active: values.is_active,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-rules"] });
      toast.success("Escalation rule updated");
      handleCloseDialog();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("escalation_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-rules"] });
      toast.success("Escalation rule deleted");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const handleOpenDialog = (rule?: EscalationRule) => {
    if (rule) {
      setEditingRule(rule);
      form.reset({
        name: rule.name,
        description: rule.description || "",
        priority_id: rule.priority_id || "",
        escalation_level: rule.escalation_level,
        escalate_after_hours: rule.escalate_after_hours,
        notify_emails: rule.notify_emails.join(", "),
        is_active: rule.is_active,
      });
    } else {
      setEditingRule(null);
      form.reset({
        name: "",
        description: "",
        priority_id: "",
        escalation_level: 1,
        escalate_after_hours: 1,
        notify_emails: "",
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRule(null);
    form.reset();
  };

  const onSubmit = (values: EscalationRuleForm) => {
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const formatHours = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Loading escalation rules...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Escalation Rules
              </CardTitle>
              <CardDescription>
                Configure automatic escalation rules for SLA breaches by priority level
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingRule ? "Edit Escalation Rule" : "Create Escalation Rule"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rule Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Critical - Level 1 Escalation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe when this rule triggers..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="priority_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="All priorities" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">All Priorities</SelectItem>
                                {priorities.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: p.color }}
                                      />
                                      {p.name}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Leave empty to apply to all priorities
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="escalation_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Escalation Level</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} max={5} {...field} />
                            </FormControl>
                            <FormDescription>
                              Level 1-5 (higher = more severe)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="escalate_after_hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Escalate After (hours)</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} max={168} {...field} />
                          </FormControl>
                          <FormDescription>
                            Hours after SLA breach to trigger this escalation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notify_emails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notify Emails</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="manager@company.com, director@company.com"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Comma-separated list of emails to notify
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Enable this escalation rule
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                      >
                        {editingRule ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No escalation rules configured</p>
              <p className="text-sm">Create rules to automatically escalate SLA breaches</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Escalate After</TableHead>
                  <TableHead>Notify</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        {rule.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {rule.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rule.priority ? (
                        <Badge
                          variant="outline"
                          style={{ borderColor: rule.priority.color, color: rule.priority.color }}
                        >
                          {rule.priority.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">All</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Level {rule.escalation_level}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        {formatHours(rule.escalate_after_hours)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {rule.notify_emails.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-sm">{rule.notify_emails.length} email(s)</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Default</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.is_active ? "default" : "secondary"}>
                        {rule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(rule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Delete this escalation rule?")) {
                              deleteMutation.mutate(rule.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How Escalation Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>1. SLA Breach Detection:</strong> When a ticket breaches its SLA (response or resolution), 
            the system checks for matching escalation rules.
          </p>
          <p>
            <strong>2. Rule Matching:</strong> Rules are matched based on the ticket's priority. 
            Rules without a specific priority apply to all tickets.
          </p>
          <p>
            <strong>3. Time-Based Escalation:</strong> Each rule triggers after the specified hours 
            following an SLA breach. Higher levels trigger later.
          </p>
          <p>
            <strong>4. Notifications:</strong> Configured recipients receive escalation emails 
            with ticket details and recommended actions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
