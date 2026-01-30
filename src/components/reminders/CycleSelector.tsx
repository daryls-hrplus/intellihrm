import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Clock, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AppraisalCycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  self_assessment_deadline?: string;
  manager_review_deadline?: string;
}

interface ReviewCycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  nomination_deadline?: string;
  feedback_deadline?: string;
}

interface CycleSelectorProps {
  companyId: string;
  cycleType: 'appraisal' | '360';
  selectedCycleId: string | null;
  onSelect: (cycleId: string | null) => void;
}

export function CycleSelector({
  companyId,
  cycleType,
  selectedCycleId,
  onSelect,
}: CycleSelectorProps) {
  const [cycles, setCycles] = useState<(AppraisalCycle | ReviewCycle)[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState<AppraisalCycle | ReviewCycle | null>(null);

  useEffect(() => {
    async function fetchCycles() {
      setLoading(true);
      try {
        if (cycleType === 'appraisal') {
          const { data } = await supabase
            .from('appraisal_cycles')
            .select('id, name, start_date, end_date, status, self_assessment_deadline, manager_review_deadline')
            .eq('company_id', companyId)
            .order('start_date', { ascending: false });
          setCycles(data || []);
        } else {
          const { data } = await supabase
            .from('review_cycles')
            .select('id, name, start_date, end_date, status, nomination_deadline, feedback_deadline')
            .eq('company_id', companyId)
            .order('start_date', { ascending: false });
          setCycles(data || []);
        }
      } catch (error) {
        console.error('Error fetching cycles:', error);
      } finally {
        setLoading(false);
      }
    }

    if (companyId) {
      fetchCycles();
    }
  }, [companyId, cycleType]);

  useEffect(() => {
    if (selectedCycleId && cycles.length > 0) {
      const found = cycles.find(c => c.id === selectedCycleId);
      setSelectedCycle(found || null);
    } else {
      setSelectedCycle(null);
    }
  }, [selectedCycleId, cycles]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'draft':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      case 'archived':
        return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          Loading cycles...
        </Label>
      </div>
    );
  }

  if (cycles.length === 0) {
    return (
      <div className="space-y-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            No {cycleType === 'appraisal' ? 'appraisal' : '360 review'} cycles found
          </span>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-500">
          Create a cycle in the Performance module first to link this rule to specific cycle dates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          {cycleType === 'appraisal' ? 'Appraisal Cycle' : '360 Review Cycle'} (Optional)
        </Label>
        <Select
          value={selectedCycleId || 'all'}
          onValueChange={(v) => onSelect(v === 'all' ? null : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All cycles (generic dates)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="text-muted-foreground">All cycles (generic timing)</span>
            </SelectItem>
            {cycles.map((cycle) => (
              <SelectItem key={cycle.id} value={cycle.id}>
                <div className="flex items-center gap-2">
                  <span>{cycle.name}</span>
                  <Badge variant="outline" className={cn("text-[10px] px-1.5", getStatusColor(cycle.status))}>
                    {cycle.status}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Link to a specific cycle for accurate notification timing based on actual dates.
        </p>
      </div>

      {/* Selected Cycle Info Card */}
      {selectedCycle && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span className="font-medium">{selectedCycle.name}</span>
              </div>
              <Badge variant="outline" className={cn(getStatusColor(selectedCycle.status))}>
                {selectedCycle.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Start Date</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{format(parseISO(selectedCycle.start_date), 'MMM d, yyyy')}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">End Date</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{format(parseISO(selectedCycle.end_date), 'MMM d, yyyy')}</span>
                </div>
              </div>
              
              {/* Appraisal-specific deadlines */}
              {cycleType === 'appraisal' && (selectedCycle as AppraisalCycle).self_assessment_deadline && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Self-Assessment Due</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-amber-500" />
                    <span>{format(parseISO((selectedCycle as AppraisalCycle).self_assessment_deadline!), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              )}
              {cycleType === 'appraisal' && (selectedCycle as AppraisalCycle).manager_review_deadline && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Manager Review Due</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-amber-500" />
                    <span>{format(parseISO((selectedCycle as AppraisalCycle).manager_review_deadline!), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              )}
              
              {/* 360-specific deadlines */}
              {cycleType === '360' && (selectedCycle as ReviewCycle).nomination_deadline && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Nomination Due</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-amber-500" />
                    <span>{format(parseISO((selectedCycle as ReviewCycle).nomination_deadline!), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              )}
              {cycleType === '360' && (selectedCycle as ReviewCycle).feedback_deadline && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Feedback Due</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-amber-500" />
                    <span>{format(parseISO((selectedCycle as ReviewCycle).feedback_deadline!), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
