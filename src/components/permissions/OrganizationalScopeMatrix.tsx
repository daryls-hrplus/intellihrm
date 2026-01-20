import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Building2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PermissionCell } from "./PermissionCell";
import { RoleData } from "@/hooks/usePermissionsOverview";

interface OrganizationalScopeMatrixProps {
  roles: RoleData[];
}

interface Company {
  id: string;
  company_name: string;
  company_code: string;
}

interface RoleCompanyAccess {
  role_id: string;
  company_id: string;
  has_access: boolean;
}

export function OrganizationalScopeMatrix({ roles }: OrganizationalScopeMatrixProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [accessData, setAccessData] = useState<RoleCompanyAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch companies
      const { data: companiesData } = await supabase
        .from("companies")
        .select("id, name, code")
        .eq("is_active", true)
        .order("name")
        .limit(20); // Limit for performance

      setCompanies((companiesData || []).map((c: any) => ({
        id: c.id,
        company_name: c.name,
        company_code: c.code,
      })));

      // Fetch role company access if exists
      const { data: roleAccessData } = await supabase
        .from("role_company_access")
        .select("role_id, company_id, access_level");

      setAccessData((roleAccessData || []).map((a: any) => ({
        role_id: a.role_id,
        company_id: a.company_id,
        has_access: a.access_level !== "none",
      })));
    } catch (error) {
      console.error("Error fetching org scope data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccess = (roleId: string, companyId: string): boolean => {
    const access = accessData.find(
      a => a.role_id === roleId && a.company_id === companyId
    );
    // Default to true (full access) if no specific restriction exists
    return access?.has_access ?? true;
  };

  const filteredRoles = roles.filter((role) => {
    return (
      !searchQuery ||
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Companies Configured</h3>
        <p className="text-muted-foreground text-sm">
          Add companies to configure organizational scope restrictions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Control which roles have access to which companies/entities.
            Green indicates full access, yellow indicates limited access.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Matrix */}
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="sticky left-0 bg-muted/50 min-w-[180px] z-10">
                Role
              </TableHead>
              {companies.map((company) => (
                <TableHead
                  key={company.id}
                  className="text-center min-w-[80px]"
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs font-medium cursor-help truncate block">
                          {company.company_code || company.company_name.slice(0, 8)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{company.company_name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              ))}
              <TableHead className="text-center w-[100px]">Scope Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={companies.length + 2}
                  className="text-center py-8 text-muted-foreground"
                >
                  No roles found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => {
                const accessCount = companies.filter(c => getAccess(role.id, c.id)).length;
                const hasFullAccess = accessCount === companies.length;
                const hasNoAccess = accessCount === 0;

                return (
                  <TableRow
                    key={role.id}
                    className={cn(role.is_seeded && "bg-muted/20")}
                  >
                    <TableCell className="sticky left-0 bg-card z-10">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{role.name}</span>
                        {role.is_seeded && (
                          <Badge variant="outline" className="text-[10px] h-4">
                            System
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    {companies.map((company) => {
                      const hasAccess = getAccess(role.id, company.id);
                      return (
                        <TableCell key={company.id} className="text-center">
                          <PermissionCell
                            level={hasAccess ? "full" : "denied"}
                            size="sm"
                            label={hasAccess ? "Full Access" : "No Access"}
                          />
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center">
                      {hasFullAccess ? (
                        <Badge className="bg-success/10 text-success border-0 text-[10px]">
                          Global
                        </Badge>
                      ) : hasNoAccess ? (
                        <Badge className="bg-destructive/10 text-destructive border-0 text-[10px]">
                          None
                        </Badge>
                      ) : (
                        <Badge className="bg-warning/10 text-warning border-0 text-[10px]">
                          Limited ({accessCount})
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <PermissionCell level="full" size="sm" showTooltip={false} />
          <span>Full Access</span>
        </div>
        <div className="flex items-center gap-2">
          <PermissionCell level="denied" size="sm" showTooltip={false} />
          <span>No Access</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-warning/10 text-warning border-0 text-[10px]">Limited</Badge>
          <span>Restricted to specific companies</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filteredRoles.length} roles × {companies.length} companies
      </p>
    </div>
  );
}
