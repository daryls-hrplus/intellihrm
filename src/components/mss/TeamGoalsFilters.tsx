import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Download, Filter } from "lucide-react";

interface DirectReport {
  employee_id: string;
  employee_name: string;
}

interface TeamGoalsFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedEmployee: string;
  onEmployeeChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedPriority: string;
  onPriorityChange: (value: string) => void;
  directReports: DirectReport[];
  onExport: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function TeamGoalsFilters({
  searchQuery,
  onSearchChange,
  selectedEmployee,
  onEmployeeChange,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange,
  directReports,
  onExport,
  onClearFilters,
  hasActiveFilters,
}: TeamGoalsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Employee Filter */}
        <Select value={selectedEmployee} onValueChange={onEmployeeChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Employees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {directReports.map((report) => (
              <SelectItem key={report.employee_id} value={report.employee_id}>
                {report.employee_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority/Weight Filter */}
        <Select value={selectedPriority} onValueChange={onPriorityChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Weights" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Weights</SelectItem>
            <SelectItem value="high">High (≥30%)</SelectItem>
            <SelectItem value="medium">Medium (15-29%)</SelectItem>
            <SelectItem value="low">Low (&lt;15%)</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <Button variant="outline" size="sm" onClick={onExport}>
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
    </div>
  );
}
