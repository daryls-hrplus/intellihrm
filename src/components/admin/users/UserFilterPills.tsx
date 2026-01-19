import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface RoleDefinition {
  id: string;
  code: string;
  name: string;
}

interface Company {
  id: string;
  name: string;
  code: string;
}

interface UserFilterPillsProps {
  filterStatus: string;
  filterRole: string;
  filterCompany: string;
  roleDefinitions: RoleDefinition[];
  companies: Company[];
  onClearStatus: () => void;
  onClearRole: () => void;
  onClearCompany: () => void;
  onClearAll: () => void;
}

export function UserFilterPills({
  filterStatus,
  filterRole,
  filterCompany,
  roleDefinitions,
  companies,
  onClearStatus,
  onClearRole,
  onClearCompany,
  onClearAll,
}: UserFilterPillsProps) {
  const hasActiveFilters = filterStatus !== "all" || filterRole !== "all" || filterCompany !== "all";
  
  if (!hasActiveFilters) return null;

  const getRoleName = (roleCode: string) => 
    roleDefinitions.find(r => r.code === roleCode)?.name || roleCode;
  
  const getCompanyName = (companyId: string) => 
    companies.find(c => c.id === companyId)?.name || companyId;

  return (
    <div className="flex flex-wrap items-center gap-2 animate-fade-in">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      
      {filterStatus !== "all" && (
        <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1">
          Status: {filterStatus === "active" ? "Active" : "Disabled"}
          <button
            onClick={onClearStatus}
            className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      
      {filterRole !== "all" && (
        <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1">
          Role: {getRoleName(filterRole)}
          <button
            onClick={onClearRole}
            className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      
      {filterCompany !== "all" && (
        <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-1">
          Company: {getCompanyName(filterCompany)}
          <button
            onClick={onClearCompany}
            className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      
      <Button variant="ghost" size="sm" onClick={onClearAll} className="h-7 text-xs">
        Clear all
      </Button>
    </div>
  );
}
