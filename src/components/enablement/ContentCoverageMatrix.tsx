import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  FileText,
  Video,
  BookOpen,
  MousePointer,
  Package,
  CheckCircle2,
  Circle,
  Clock,
  Download,
  Filter,
  LayoutGrid,
} from "lucide-react";
import { useEnablementContentStatus, useEnablementReleases } from "@/hooks/useEnablementData";
import { FEATURE_REGISTRY } from "@/lib/featureRegistry";
import { cn } from "@/lib/utils";

const STATUS_ICONS = {
  not_started: { icon: Circle, color: "text-muted-foreground/40" },
  in_progress: { icon: Clock, color: "text-blue-500" },
  complete: { icon: CheckCircle2, color: "text-green-500" },
  na: { icon: Circle, color: "text-muted-foreground/20" },
};

export function ContentCoverageMatrix() {
  const { t } = useTranslation();
  const { contentItems, isLoading } = useEnablementContentStatus();
  const { releases } = useEnablementReleases();
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Get all features from registry
  const allFeatures = useMemo(() => {
    const features: Array<{
      module_code: string;
      feature_code: string;
      feature_name: string;
    }> = [];

    Object.entries(FEATURE_REGISTRY).forEach(([moduleCode, moduleData]) => {
      Object.entries(moduleData.features).forEach(([featureCode, featureData]) => {
        features.push({
          module_code: moduleCode,
          feature_code: featureCode,
          feature_name: featureData.name,
        });
      });
    });

    return features;
  }, []);

  // Merge features with content status
  const mergedData = useMemo(() => {
    const contentMap = new Map(
      contentItems.map((item) => [`${item.module_code}:${item.feature_code}`, item])
    );

    return allFeatures.map((feature) => {
      const key = `${feature.module_code}:${feature.feature_code}`;
      const content = contentMap.get(key);

      return {
        ...feature,
        documentation_status: content?.documentation_status || "not_started",
        scorm_lite_status: content?.scorm_lite_status || "not_started",
        rise_course_status: content?.rise_course_status || "not_started",
        video_status: content?.video_status || "not_started",
        dap_guide_status: content?.dap_guide_status || "not_started",
        workflow_status: content?.workflow_status || "backlog",
        complexity_score: content?.complexity_score,
        recommended_tool: content?.recommended_tool,
      };
    });
  }, [allFeatures, contentItems]);

  // Filter data
  const filteredData = useMemo(() => {
    return mergedData.filter((item) => {
      const matchesSearch =
        item.feature_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.feature_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.module_code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesModule = moduleFilter === "all" || item.module_code === moduleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "complete" &&
          item.documentation_status === "complete" &&
          (item.scorm_lite_status === "complete" || item.rise_course_status === "complete")) ||
        (statusFilter === "in_progress" &&
          (item.documentation_status === "in_progress" ||
            item.scorm_lite_status === "in_progress" ||
            item.rise_course_status === "in_progress")) ||
        (statusFilter === "not_started" &&
          item.documentation_status === "not_started" &&
          item.scorm_lite_status === "not_started" &&
          item.rise_course_status === "not_started");

      return matchesSearch && matchesModule && matchesStatus;
    });
  }, [mergedData, searchQuery, moduleFilter, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = mergedData.length;
    const documented = mergedData.filter((i) => i.documentation_status === "complete").length;
    const scormLite = mergedData.filter((i) => i.scorm_lite_status === "complete").length;
    const rise = mergedData.filter((i) => i.rise_course_status === "complete").length;
    const videos = mergedData.filter((i) => i.video_status === "complete").length;
    const dap = mergedData.filter((i) => i.dap_guide_status === "complete").length;

    return { total, documented, scormLite, rise, videos, dap };
  }, [mergedData]);

  const modules = useMemo(() => {
    return Object.keys(FEATURE_REGISTRY).sort();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total Features"
          value={stats.total}
          icon={LayoutGrid}
          color="text-primary"
        />
        <StatCard
          label="Documented"
          value={stats.documented}
          total={stats.total}
          icon={FileText}
          color="text-blue-500"
        />
        <StatCard
          label="SCORM-Lite"
          value={stats.scormLite}
          total={stats.total}
          icon={Package}
          color="text-purple-500"
        />
        <StatCard
          label="Rise Courses"
          value={stats.rise}
          total={stats.total}
          icon={BookOpen}
          color="text-orange-500"
        />
        <StatCard
          label="Videos"
          value={stats.videos}
          total={stats.total}
          icon={Video}
          color="text-pink-500"
        />
        <StatCard
          label="DAP Guides"
          value={stats.dap}
          total={stats.total}
          icon={MousePointer}
          color="text-green-500"
        />
      </div>

      {/* Matrix */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Content Coverage Matrix</CardTitle>
              <CardDescription>
                Track content completion across all features
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Feature</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead className="text-center w-[80px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <FileText className="h-4 w-4 mx-auto" />
                        </TooltipTrigger>
                        <TooltipContent>Documentation</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead className="text-center w-[80px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Package className="h-4 w-4 mx-auto" />
                        </TooltipTrigger>
                        <TooltipContent>SCORM-Lite</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead className="text-center w-[80px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <BookOpen className="h-4 w-4 mx-auto" />
                        </TooltipTrigger>
                        <TooltipContent>Rise Course</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead className="text-center w-[80px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Video className="h-4 w-4 mx-auto" />
                        </TooltipTrigger>
                        <TooltipContent>Video</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead className="text-center w-[80px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <MousePointer className="h-4 w-4 mx-auto" />
                        </TooltipTrigger>
                        <TooltipContent>DAP Guide</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead className="w-[100px]">AI Rec</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.slice(0, 50).map((item) => (
                  <TableRow key={`${item.module_code}:${item.feature_code}`}>
                    <TableCell className="font-medium">
                      {item.feature_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {item.module_code.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusIcon status={item.documentation_status} />
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusIcon status={item.scorm_lite_status} />
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusIcon status={item.rise_course_status} />
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusIcon status={item.video_status} />
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusIcon status={item.dap_guide_status} />
                    </TableCell>
                    <TableCell>
                      {item.recommended_tool && (
                        <Badge variant="secondary" className="text-xs">
                          {item.recommended_tool === "scorm_lite" ? "Lite" : "Rise"}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredData.length > 50 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Showing 50 of {filteredData.length} features
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  total,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  total?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  const percentage = total ? Math.round((value / total) * 100) : undefined;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-muted", color)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground truncate">{label}</p>
          </div>
        </div>
        {percentage !== undefined && (
          <Progress value={percentage} className="h-1 mt-3" />
        )}
      </CardContent>
    </Card>
  );
}

function StatusIcon({ status }: { status: string }) {
  const config = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || STATUS_ICONS.not_started;
  const Icon = config.icon;

  return <Icon className={cn("h-4 w-4 mx-auto", config.color)} />;
}
