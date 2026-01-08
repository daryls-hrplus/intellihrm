import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface RequestFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  typeFilter: string;
  onTypeChange: (value: string) => void;
}

const REQUEST_TYPES = [
  { value: "all", label: "All Types" },
  { value: "personal_contact", label: "Personal Contact" },
  { value: "emergency_contact", label: "Emergency Contact" },
  { value: "address", label: "Address" },
  { value: "name_change", label: "Name Change" },
  { value: "banking", label: "Banking Details" },
  { value: "qualification", label: "Qualification" },
  { value: "dependent", label: "Dependent" },
  { value: "government_id", label: "Government ID" },
  { value: "medical_info", label: "Medical Information" },
  { value: "marital_status", label: "Marital Status" },
];

export function RequestFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
}: RequestFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by employee name or ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="info_required">Info Required</SelectItem>
          <SelectItem value="applied">Applied</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Select value={typeFilter} onValueChange={onTypeChange}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="Request Type" />
        </SelectTrigger>
        <SelectContent>
          {REQUEST_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
