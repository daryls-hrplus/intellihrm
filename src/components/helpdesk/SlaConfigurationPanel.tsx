import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Settings, Clock, Save, RotateCcw } from "lucide-react";

interface Priority {
  id: string;
  name: string;
  code: string;
  color: string;
  response_time_hours: number;
  resolution_time_hours: number;
  display_order: number;
}

export function SlaConfigurationPanel() {
  const queryClient = useQueryClient();
  const [editedPriorities, setEditedPriorities] = useState<Record<string, { response: number; resolution: number }>>({});

  const { data: priorities = [], isLoading } = useQuery({
    queryKey: ["sla-priorities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_priorities")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      if (error) throw error;
      return data as Priority[];
    },
  });

  const updateSlaMutation = useMutation({
    mutationFn: async ({ id, response_time_hours, resolution_time_hours }: { id: string; response_time_hours: number; resolution_time_hours: number }) => {
      const { error } = await supabase
        .from("ticket_priorities")
        .update({ response_time_hours, resolution_time_hours })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla-priorities"] });
      queryClient.invalidateQueries({ queryKey: ["ticket-priorities"] });
      toast.success("SLA targets updated");
    },
    onError: (error: any) => toast.error(error.message),
  });

  const handleChange = (id: string, field: "response" | "resolution", value: string) => {
    const numValue = parseInt(value) || 0;
    setEditedPriorities(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: numValue,
      },
    }));
  };

  const getEditedValue = (priority: Priority, field: "response" | "resolution") => {
    if (editedPriorities[priority.id]?.[field] !== undefined) {
      return editedPriorities[priority.id][field];
    }
    return field === "response" ? priority.response_time_hours : priority.resolution_time_hours;
  };

  const hasChanges = (priority: Priority) => {
    const edited = editedPriorities[priority.id];
    if (!edited) return false;
    return (
      (edited.response !== undefined && edited.response !== priority.response_time_hours) ||
      (edited.resolution !== undefined && edited.resolution !== priority.resolution_time_hours)
    );
  };

  const handleSave = (priority: Priority) => {
    const edited = editedPriorities[priority.id];
    updateSlaMutation.mutate({
      id: priority.id,
      response_time_hours: edited?.response ?? priority.response_time_hours,
      resolution_time_hours: edited?.resolution ?? priority.resolution_time_hours,
    });
    setEditedPriorities(prev => {
      const { [priority.id]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleReset = (priority: Priority) => {
    setEditedPriorities(prev => {
      const { [priority.id]: _, ...rest } = prev;
      return rest;
    });
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
          Loading SLA configuration...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            SLA Configuration
          </CardTitle>
          <CardDescription>
            Configure response and resolution time targets for each priority level.
            Changes take effect immediately for new and existing tickets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {priorities.map((priority) => (
              <div
                key={priority.id}
                className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3 min-w-[140px]">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: priority.color }}
                  />
                  <div>
                    <p className="font-medium">{priority.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {priority.code}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`response-${priority.id}`} className="text-sm flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Response Time (hours)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`response-${priority.id}`}
                        type="number"
                        min={1}
                        max={720}
                        value={getEditedValue(priority, "response")}
                        onChange={(e) => handleChange(priority.id, "response", e.target.value)}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        ({formatHours(getEditedValue(priority, "response"))})
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`resolution-${priority.id}`} className="text-sm flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Resolution Time (hours)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`resolution-${priority.id}`}
                        type="number"
                        min={1}
                        max={720}
                        value={getEditedValue(priority, "resolution")}
                        onChange={(e) => handleChange(priority.id, "resolution", e.target.value)}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">
                        ({formatHours(getEditedValue(priority, "resolution"))})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {hasChanges(priority) && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReset(priority)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSave(priority)}
                        disabled={updateSlaMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SLA Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Response Time</h4>
              <p className="text-sm text-muted-foreground">
                The maximum time allowed for an agent to provide the first response to a ticket.
                Measured from ticket creation to the first agent comment.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Resolution Time</h4>
              <p className="text-sm text-muted-foreground">
                The maximum time allowed to fully resolve a ticket.
                Measured from ticket creation to when the status changes to resolved or closed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
