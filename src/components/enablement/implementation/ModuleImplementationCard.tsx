import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreVertical,
  Play,
  CheckCircle2,
  Pause,
  Trash2,
  Calendar,
  Clock,
  ChevronRight,
  Settings2,
} from "lucide-react";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { useNavigate } from "react-router-dom";
import type { ModuleImplementation, ImplementationStatus } from "@/types/implementation";
import * as LucideIcons from "lucide-react";

interface ModuleImplementationCardProps {
  implementation: ModuleImplementation;
  viewMode: "grid" | "list";
  onStart: () => void;
  onComplete: () => void;
  onHold: () => void;
  onDelete: () => void;
}

const statusConfig: Record<ImplementationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  not_started: { 
    label: "Not Started", 
    color: "bg-slate-500/10 text-slate-600 border-slate-200",
    icon: <Clock className="h-3 w-3" />
  },
  in_progress: { 
    label: "In Progress", 
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    icon: <Play className="h-3 w-3" />
  },
  completed: { 
    label: "Completed", 
    color: "bg-green-500/10 text-green-600 border-green-200",
    icon: <CheckCircle2 className="h-3 w-3" />
  },
  on_hold: { 
    label: "On Hold", 
    color: "bg-amber-500/10 text-amber-600 border-amber-200",
    icon: <Pause className="h-3 w-3" />
  },
};

export function ModuleImplementationCard({
  implementation,
  viewMode,
  onStart,
  onComplete,
  onHold,
  onDelete,
}: ModuleImplementationCardProps) {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const status = statusConfig[implementation.status];
  const module = implementation.module;
  
  // Get icon component safely
  const getIconComponent = (iconName?: string | null) => {
    if (!iconName) return Settings2;
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
    return icons[iconName] || Settings2;
  };
  
  const IconComponent = getIconComponent(module?.icon_name);

  // Calculate mock progress (in real app, this would come from feature implementations)
  const progress = implementation.status === "completed" ? 100 
    : implementation.status === "in_progress" ? 45 
    : 0;

  const handleViewDetails = () => {
    navigate(`/enablement/implementation/${implementation.id}`);
  };

  if (viewMode === "list") {
    return (
      <>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <IconComponent className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{module?.module_name || "Unknown Module"}</h3>
                  <Badge variant="outline" className={status.color}>
                    {status.icon}
                    <span className="ml-1">{status.label}</span>
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {module?.description || "No description"}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="hidden md:flex items-center gap-2 w-40">
                  <Progress value={progress} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-10">{progress}%</span>
                </div>
                {implementation.target_go_live && (
                  <div className="hidden lg:flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDateForDisplay(implementation.target_go_live)}
                  </div>
                )}
                <Button variant="ghost" size="sm" onClick={handleViewDetails}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {implementation.status === "not_started" && (
                      <DropdownMenuItem onClick={onStart}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Implementation
                      </DropdownMenuItem>
                    )}
                    {implementation.status === "in_progress" && (
                      <>
                        <DropdownMenuItem onClick={onComplete}>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark Complete
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onHold}>
                          <Pause className="h-4 w-4 mr-2" />
                          Put On Hold
                        </DropdownMenuItem>
                      </>
                    )}
                    {implementation.status === "on_hold" && (
                      <DropdownMenuItem onClick={onStart}>
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Implementation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {module?.module_name} from this client's implementation plan?
                This will also remove all feature implementations and task progress.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Grid view
  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <IconComponent className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{module?.module_name || "Unknown Module"}</CardTitle>
                <p className="text-sm text-muted-foreground">Order: {implementation.implementation_order}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {implementation.status === "not_started" && (
                  <DropdownMenuItem onClick={onStart}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Implementation
                  </DropdownMenuItem>
                )}
                {implementation.status === "in_progress" && (
                  <>
                    <DropdownMenuItem onClick={onComplete}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Complete
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onHold}>
                      <Pause className="h-4 w-4 mr-2" />
                      Put On Hold
                    </DropdownMenuItem>
                  </>
                )}
                {implementation.status === "on_hold" && (
                  <DropdownMenuItem onClick={onStart}>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {module?.description || "No description available"}
          </p>

          <div className="flex items-center justify-between">
            <Badge variant="outline" className={status.color}>
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
            {implementation.target_go_live && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDateForDisplay(implementation.target_go_live, "MMM d")}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            size="sm"
            onClick={handleViewDetails}
          >
            View Details
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Implementation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {module?.module_name} from this client's implementation plan?
              This will also remove all feature implementations and task progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
