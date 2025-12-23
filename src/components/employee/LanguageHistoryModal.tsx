import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, History, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { NUMERIC_PROFICIENCY, CEFR_PROFICIENCY } from "@/constants/languageConstants";

interface LanguageHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  languageRecordId: string;
  languageName: string;
}

interface HistoryRecord {
  id: string;
  change_type: string;
  previous_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  changed_at: string;
  changed_by: string | null;
  profiles?: { full_name: string } | null;
}

const getProficiencyLabel = (value: string | undefined, scale: string | undefined) => {
  if (!value) return "-";
  const options = scale === "cefr" ? CEFR_PROFICIENCY : NUMERIC_PROFICIENCY;
  const found = options.find(o => o.value === value);
  return found ? found.label : value;
};

export function LanguageHistoryModal({
  open,
  onOpenChange,
  languageRecordId,
  languageName,
}: LanguageHistoryModalProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ["language-history", languageRecordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_languages_history")
        .select(`
          id,
          change_type,
          previous_values,
          new_values,
          changed_at,
          changed_by,
          profiles:changed_by(full_name)
        `)
        .eq("language_record_id", languageRecordId)
        .order("changed_at", { ascending: false });

      if (error) throw error;
      return data as HistoryRecord[];
    },
    enabled: open && !!languageRecordId,
  });

  const getChangeTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      created: "default",
      updated: "secondary",
      deleted: "destructive",
    };
    return (
      <Badge variant={variants[type] || "secondary"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const renderProficiencyChange = (
    label: string,
    oldVal: string | undefined,
    newVal: string | undefined,
    scale: string | undefined
  ) => {
    if (oldVal === newVal) return null;
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{label}:</span>
        <span className="text-destructive/70">{getProficiencyLabel(oldVal, scale)}</span>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <span className="text-primary">{getProficiencyLabel(newVal, scale)}</span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            History: {languageName}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !history?.length ? (
            <p className="text-center text-muted-foreground py-8">No history found.</p>
          ) : (
            <div className="space-y-4">
              {history.map((record) => {
                const prev = record.previous_values as Record<string, string> | null;
                const curr = record.new_values as Record<string, string> | null;
                const scale = curr?.proficiency_scale || prev?.proficiency_scale;

                return (
                  <div
                    key={record.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      {getChangeTypeBadge(record.change_type)}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(record.changed_at), "PPp")}
                      </span>
                    </div>

                    {record.profiles && (
                      <p className="text-sm text-muted-foreground">
                        By: {record.profiles.full_name}
                      </p>
                    )}

                    {record.change_type === "updated" && prev && curr && (
                      <div className="pt-2 space-y-1 border-t">
                        {renderProficiencyChange("Overall", prev.overall_proficiency, curr.overall_proficiency, scale)}
                        {renderProficiencyChange("Speaking", prev.speaking_proficiency, curr.speaking_proficiency, scale)}
                        {renderProficiencyChange("Reading", prev.reading_proficiency, curr.reading_proficiency, scale)}
                        {renderProficiencyChange("Writing", prev.writing_proficiency, curr.writing_proficiency, scale)}
                        
                        {prev.certification_exam !== curr.certification_exam && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Certification: </span>
                            <span className="text-destructive/70">{prev.certification_exam || "-"}</span>
                            <ArrowRight className="inline h-3 w-3 mx-1 text-muted-foreground" />
                            <span className="text-primary">{curr.certification_exam || "-"}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {record.change_type === "created" && curr && (
                      <div className="pt-2 border-t text-sm text-muted-foreground">
                        Initial proficiency: {getProficiencyLabel(curr.overall_proficiency, scale)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
