import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, Users, ShieldAlert, Settings } from "lucide-react";

interface RoleInfoBannersProps {
  role: {
    code: string;
    role_type: string;
    name: string;
  };
}

export function RoleInfoBanners({ role }: RoleInfoBannersProps) {
  const isSeeded = role.role_type === "seeded";
  const isSystem = role.role_type === "system";
  const isEmployee = role.code === "employee";

  return (
    <div className="space-y-3">
      {/* System Role Banner */}
      {isSystem && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>System Role - Read Only</AlertTitle>
          <AlertDescription>
            This is a protected system role used for core platform operations. 
            Permissions cannot be modified to ensure system integrity and security.
          </AlertDescription>
        </Alert>
      )}

      {/* Template Role Banner */}
      {isSeeded && !isEmployee && (
        <Alert className="border-violet-200 bg-violet-50 dark:bg-violet-950/20">
          <Info className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          <AlertTitle className="text-violet-800 dark:text-violet-300">Template Role</AlertTitle>
          <AlertDescription className="text-violet-700 dark:text-violet-400">
            This is a pre-configured template role. You can customize module and 
            organizational permissions, but the role name and code cannot be changed. 
            All permission changes will be saved and persist.
          </AlertDescription>
        </Alert>
      )}

      {/* Employee Role Banner */}
      {isEmployee && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300">Employee Self-Service Role</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400">
            <p className="mb-2">
              This role controls which modules employees can access through self-service. 
              To configure which specific fields employees can view or edit within those modules, 
              use ESS Administration.
            </p>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/admin/ess-administration">
                <Settings className="h-4 w-4" />
                Configure ESS Settings
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
