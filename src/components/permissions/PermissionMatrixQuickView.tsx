import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Minus,
  LayoutGrid,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AccessStatus = "full" | "partial" | "none";

interface ModuleAccessInfo {
  moduleCode: string;
  moduleName: string;
  tabCount: number;
  accessibleTabs: number;
  canView: boolean | "partial";
  canCreate: boolean | "partial";
  canEdit: boolean | "partial";
  canDelete: boolean | "partial";
  status: AccessStatus;
}

interface PermissionMatrixQuickViewProps {
  modules: ModuleAccessInfo[];
  onModuleClick?: (moduleCode: string) => void;
  onExport?: () => void;
}

export function PermissionMatrixQuickView({
  modules,
  onModuleClick,
  onExport,
}: PermissionMatrixQuickViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const renderPermissionIcon = (value: boolean | "partial") => {
    if (value === true) {
      return <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    } else if (value === "partial") {
      return <Minus className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
    }
    return <X className="h-4 w-4 text-muted-foreground/50" />;
  };

  const getStatusBadge = (status: AccessStatus) => {
    switch (status) {
      case "full":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 text-xs">
            Full
          </Badge>
        );
      case "partial":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 text-xs">
            Partial
          </Badge>
        );
      case "none":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">
            None
          </Badge>
        );
    }
  };

  const fullAccessCount = modules.filter((m) => m.status === "full").length;
  const partialAccessCount = modules.filter((m) => m.status === "partial").length;
  const noAccessCount = modules.filter((m) => m.status === "none").length;

  return (
    <Card className="border-dashed">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto hover:bg-transparent gap-2">
                <LayoutGrid className="h-4 w-4" />
                <CardTitle className="text-sm font-medium">
                  Permission Matrix Quick View
                </CardTitle>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{fullAccessCount}</span> Full
                <span className="mx-1">•</span>
                <span className="text-amber-600 dark:text-amber-400 font-medium">{partialAccessCount}</span> Partial
                <span className="mx-1">•</span>
                <span className="font-medium">{noAccessCount}</span> None
              </div>
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport} className="h-7 text-xs gap-1">
                  <Download className="h-3 w-3" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Module</TableHead>
                    <TableHead className="text-center w-[60px]">Tabs</TableHead>
                    <TableHead className="text-center w-[60px]">View</TableHead>
                    <TableHead className="text-center w-[60px]">Create</TableHead>
                    <TableHead className="text-center w-[60px]">Edit</TableHead>
                    <TableHead className="text-center w-[60px]">Delete</TableHead>
                    <TableHead className="text-center w-[80px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => (
                    <TableRow
                      key={module.moduleCode}
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        module.status === "none" && "opacity-60"
                      )}
                      onClick={() => onModuleClick?.(module.moduleCode)}
                    >
                      <TableCell className="font-medium">{module.moduleName}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {module.accessibleTabs}/{module.tabCount}
                      </TableCell>
                      <TableCell className="text-center">
                        {renderPermissionIcon(module.canView)}
                      </TableCell>
                      <TableCell className="text-center">
                        {renderPermissionIcon(module.canCreate)}
                      </TableCell>
                      <TableCell className="text-center">
                        {renderPermissionIcon(module.canEdit)}
                      </TableCell>
                      <TableCell className="text-center">
                        {renderPermissionIcon(module.canDelete)}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(module.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
