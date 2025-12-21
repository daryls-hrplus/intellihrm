import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { RoleType, PiiLevel } from "@/types/roles";

interface RoleFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleTypeFilter: RoleType | "all";
  onRoleTypeChange: (value: RoleType | "all") => void;
  seededFilter: "all" | "seeded" | "custom";
  onSeededChange: (value: "all" | "seeded" | "custom") => void;
  piiFilter: PiiLevel | "all";
  onPiiChange: (value: PiiLevel | "all") => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusChange: (value: "all" | "active" | "inactive") => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function RoleFilters({
  searchTerm,
  onSearchChange,
  roleTypeFilter,
  onRoleTypeChange,
  seededFilter,
  onSeededChange,
  piiFilter,
  onPiiChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
  hasActiveFilters,
}: RoleFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={roleTypeFilter} onValueChange={(v) => onRoleTypeChange(v as RoleType | "all")}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Role Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="internal">Internal</SelectItem>
          </SelectContent>
        </Select>

        <Select value={seededFilter} onValueChange={(v) => onSeededChange(v as "all" | "seeded" | "custom")}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Origin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="seeded">Seeded</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        <Select value={piiFilter} onValueChange={(v) => onPiiChange(v as PiiLevel | "all")}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="PII Access" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All PII</SelectItem>
            <SelectItem value="none">No PII</SelectItem>
            <SelectItem value="limited">Limited</SelectItem>
            <SelectItem value="full">Full</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as "all" | "active" | "inactive")}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
