import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ReviewCycle {
  id: string;
  name: string;
  status: string;
}

interface Review360AnalyticsFiltersProps {
  cycles: ReviewCycle[];
  selectedCycleId: string;
  onCycleChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  reviewerTypeFilter: string;
  onReviewerTypeChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function Review360AnalyticsFilters({
  cycles,
  selectedCycleId,
  onCycleChange,
  statusFilter,
  onStatusChange,
  reviewerTypeFilter,
  onReviewerTypeChange,
  hasActiveFilters,
  onClearFilters,
}: Review360AnalyticsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Cycle Filter */}
      <Select value={selectedCycleId} onValueChange={onCycleChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All Cycles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cycles</SelectItem>
          {cycles.map((cycle) => (
            <SelectItem key={cycle.id} value={cycle.id}>
              {cycle.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {/* Reviewer Type Filter */}
      <Select value={reviewerTypeFilter} onValueChange={onReviewerTypeChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All Reviewer Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="self">Self</SelectItem>
          <SelectItem value="manager">Manager</SelectItem>
          <SelectItem value="peer">Peer</SelectItem>
          <SelectItem value="direct_report">Direct Report</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
