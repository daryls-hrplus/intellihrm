import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays } from "lucide-react";

interface AppraisalCycle {
  id: string;
  name: string;
  status: string;
}

interface AppraisalCycleFilterProps {
  companyId?: string;
  selectedCycleId: string;
  onCycleChange: (cycleId: string) => void;
}

export function AppraisalCycleFilter({ 
  companyId, 
  selectedCycleId, 
  onCycleChange 
}: AppraisalCycleFilterProps) {
  const [cycles, setCycles] = useState<AppraisalCycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCycles() {
      setLoading(true);
      let query = supabase
        .from("appraisal_cycles")
        .select("id, name, status")
        .order("start_date", { ascending: false });

      if (companyId && companyId !== "all") {
        query = query.eq("company_id", companyId);
      }

      const { data } = await query;
      if (data) {
        setCycles(data);
      }
      setLoading(false);
    }

    fetchCycles();
  }, [companyId]);

  if (loading || cycles.length === 0) {
    return null;
  }

  return (
    <Select value={selectedCycleId} onValueChange={onCycleChange}>
      <SelectTrigger className="w-[220px]">
        <CalendarDays className="mr-2 h-4 w-4" />
        <SelectValue placeholder="All Cycles" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Cycles</SelectItem>
        {cycles.map((cycle) => (
          <SelectItem key={cycle.id} value={cycle.id}>
            <span className="flex items-center gap-2">
              {cycle.name}
              {cycle.status === "active" && (
                <span className="text-xs bg-green-500/20 text-green-600 px-1.5 py-0.5 rounded">
                  Active
                </span>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function useAppraisalCycleFilter() {
  const [selectedCycleId, setSelectedCycleId] = useState<string>("all");
  
  return {
    selectedCycleId,
    setSelectedCycleId,
    cycleId: selectedCycleId !== "all" ? selectedCycleId : undefined,
  };
}
