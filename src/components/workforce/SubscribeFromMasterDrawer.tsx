import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Search, Globe, Loader2, CheckCircle2 } from "lucide-react";
import { getTodayString } from "@/utils/dateUtils";

interface MasterJobFamily {
  id: string;
  code: string;
  name: string;
  description: string | null;
  industry_category: string | null;
}

interface SubscribeFromMasterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  existingMasterIds: string[];
  onSuccess: () => void;
}

export function SubscribeFromMasterDrawer({
  open,
  onOpenChange,
  companyId,
  existingMasterIds,
  onSuccess,
}: SubscribeFromMasterDrawerProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: masterFamilies = [], isLoading } = useQuery({
    queryKey: ["master-job-families-available", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("master_job_families")
        .select("id, code, name, description, industry_category")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as MasterJobFamily[];
    },
    enabled: open,
  });

  // Filter out already subscribed ones
  const availableFamilies = masterFamilies.filter(
    (f) => !existingMasterIds.includes(f.id)
  );

  const filteredFamilies = availableFamilies.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.code.toLowerCase().includes(search.toLowerCase())
  );

  const subscribeMutation = useMutation({
    mutationFn: async (masterIds: string[]) => {
      const selectedMasters = masterFamilies.filter((f) => masterIds.includes(f.id));
      
      const records = selectedMasters.map((master) => ({
        company_id: companyId,
        code: master.code,
        name: master.name,
        description: master.description,
        master_job_family_id: master.id,
        is_active: true,
        start_date: getTodayString(),
      }));

      const { error } = await supabase.from("job_families").insert(records);
      if (error) throw error;
      return records.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["job-families"] });
      toast.success(`Subscribed to ${count} master job ${count === 1 ? "family" : "families"}`);
      setSelectedIds([]);
      onOpenChange(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to subscribe");
    },
  });

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubscribe = () => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one master job family");
      return;
    }
    subscribeMutation.mutate(selectedIds);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Subscribe from Master Library
          </SheetTitle>
          <SheetDescription>
            Select global job families to add to your company. These will be linked to the master definitions for consistency and updates.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search master job families..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              {selectedIds.length} selected
            </Badge>
            {availableFamilies.length < masterFamilies.length && (
              <span className="text-xs text-muted-foreground">
                {masterFamilies.length - availableFamilies.length} already subscribed
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : availableFamilies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-success" />
              <p className="font-medium">All subscribed!</p>
              <p className="text-sm">Your company has all available master job families.</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="space-y-2 pr-4">
                {filteredFamilies.map((family) => (
                  <div
                    key={family.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedIds.includes(family.id)
                        ? "bg-primary/5 border-primary"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => toggleSelection(family.id)}
                  >
                    <Checkbox
                      checked={selectedIds.includes(family.id)}
                      onCheckedChange={() => toggleSelection(family.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-0.5 bg-muted rounded text-sm font-mono">
                          {family.code}
                        </code>
                        <span className="font-medium">{family.name}</span>
                      </div>
                      {family.industry_category && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {family.industry_category}
                        </Badge>
                      )}
                      {family.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {family.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {availableFamilies.length > 0 && (
            <Button
              className="w-full"
              onClick={handleSubscribe}
              disabled={selectedIds.length === 0 || subscribeMutation.isPending}
            >
              {subscribeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subscribing...
                </>
              ) : (
                `Subscribe to ${selectedIds.length} ${selectedIds.length === 1 ? "Family" : "Families"}`
              )}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
