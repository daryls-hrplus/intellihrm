import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useModuleImplementations } from "@/hooks/useModuleImplementations";
import { toast } from "sonner";

interface ApplicationModule {
  id: string;
  module_code: string;
  module_name: string;
  description: string | null;
  icon_name: string | null;
}

interface AddModuleImplementationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: string;
  onSuccess: () => void;
}

export function AddModuleImplementationDialog({
  open,
  onOpenChange,
  companyId,
  onSuccess,
}: AddModuleImplementationDialogProps) {
  const [modules, setModules] = useState<ApplicationModule[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [implementationOrder, setImplementationOrder] = useState<number>(1);
  const [targetGoLive, setTargetGoLive] = useState<Date>();
  const [notes, setNotes] = useState("");

  const { createImplementation, implementations } = useModuleImplementations(companyId);

  useEffect(() => {
    if (open) {
      fetchAvailableModules();
    }
  }, [open, companyId]);

  const fetchAvailableModules = async () => {
    setIsLoadingModules(true);
    try {
      const { data, error } = await supabase
        .from("application_modules")
        .select("id, module_code, module_name, description, icon_name")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      
      // Filter out already implemented modules
      const implementedModuleIds = implementations.map(i => i.module_id);
      const available = (data || []).filter(m => !implementedModuleIds.includes(m.id));
      setModules(available);
      
      // Set default order to next in sequence
      setImplementationOrder(implementations.length + 1);
    } catch (err) {
      console.error("Error fetching modules:", err);
      toast.error("Failed to load modules");
    } finally {
      setIsLoadingModules(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedModuleId || !companyId) {
      toast.error("Please select a module and ensure a client is selected");
      return;
    }

    setIsSubmitting(true);
    try {
      await createImplementation({
        module_id: selectedModuleId,
        company_id: companyId,
        implementation_order: implementationOrder,
        target_go_live: targetGoLive?.toISOString(),
        notes: notes || undefined,
      });
      
      toast.success("Module added to implementation plan");
      resetForm();
      onSuccess();
    } catch (err) {
      console.error("Error creating implementation:", err);
      toast.error("Failed to add module");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedModuleId("");
    setImplementationOrder(1);
    setTargetGoLive(undefined);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Module to Implementation</DialogTitle>
          <DialogDescription>
            Select a module to add to this client's implementation plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="module">Module</Label>
            <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingModules ? "Loading modules..." : "Select a module"} />
              </SelectTrigger>
              <SelectContent>
                {modules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    <div className="flex flex-col">
                      <span>{module.module_name}</span>
                      {module.description && (
                        <span className="text-xs text-muted-foreground">{module.description}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
                {modules.length === 0 && !isLoadingModules && (
                  <SelectItem value="none" disabled>
                    No modules available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Implementation Order</Label>
            <Input
              id="order"
              type="number"
              min={1}
              value={implementationOrder}
              onChange={(e) => setImplementationOrder(parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">
              Determines the sequence in which modules will be implemented.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Target Go-Live Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !targetGoLive && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetGoLive ? format(targetGoLive, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={targetGoLive}
                  onSelect={setTargetGoLive}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this implementation..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedModuleId}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Module
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
