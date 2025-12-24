import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Database,
  Search,
  Layers,
  FolderTree,
  FileText,
  ExternalLink,
  Loader2,
  Filter,
  LayoutGrid,
  List,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface DatabaseFeature {
  id: string;
  feature_code: string;
  feature_name: string;
  description: string | null;
  module_code: string | null;
  group_code: string | null;
  group_name: string | null;
  icon_name: string | null;
  route_path: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export default function FeatureDatabasePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedFeature, setSelectedFeature] = useState<DatabaseFeature | null>(null);

  const { data: features = [], isLoading } = useQuery({
    queryKey: ["database-features"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("application_features")
        .select("*")
        .order("module_code", { ascending: true })
        .order("group_name", { ascending: true })
        .order("feature_name", { ascending: true });
      if (error) throw error;
      return data as DatabaseFeature[];
    },
  });

  // Get unique modules for filter
  const modules = [...new Set(features.map((f) => f.module_code).filter(Boolean))].sort();

  // Filter features
  const filteredFeatures = features.filter((feature) => {
    const matchesSearch =
      !searchQuery ||
      feature.feature_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.feature_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.module_code?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesModule = moduleFilter === "all" || feature.module_code === moduleFilter;

    return matchesSearch && matchesModule;
  });

  // Group by module for stats
  const moduleStats = features.reduce((acc, f) => {
    const mod = f.module_code || "unknown";
    acc[mod] = (acc[mod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getIcon = (iconName: string | null) => {
    if (!iconName) return LucideIcons.FileText;
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.FileText;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/enablement")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              Feature Database
            </h1>
            <p className="text-muted-foreground">
              View all {features.length} features stored in the database
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1">
          <Database className="h-3 w-3" />
          Live Data
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Features</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{features.length}</div>
            <p className="text-xs text-muted-foreground">In database</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modules</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modules.length}</div>
            <p className="text-xs text-muted-foreground">Unique modules</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {features.filter((f) => f.is_active !== false).length}
            </div>
            <p className="text-xs text-muted-foreground">Enabled features</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtered</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredFeatures.length}</div>
            <p className="text-xs text-muted-foreground">Matching filters</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, code, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map((mod) => (
                  <SelectItem key={mod} value={mod!}>
                    {mod} ({moduleStats[mod!]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : viewMode === "table" ? (
        <Card>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-[50px]">Icon</TableHead>
                  <TableHead>Feature Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead className="w-[80px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeatures.map((feature) => {
                  const Icon = getIcon(feature.icon_name);
                  return (
                    <TableRow
                      key={feature.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedFeature(feature)}
                    >
                      <TableCell>
                        <div className="p-1.5 rounded bg-primary/10 w-fit">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{feature.feature_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {feature.feature_code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {feature.module_code || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {feature.group_name || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground max-w-[200px] truncate">
                        {feature.route_path || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={feature.is_active !== false ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {feature.is_active !== false ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredFeatures.map((feature) => {
            const Icon = getIcon(feature.icon_name);
            return (
              <Card
                key={feature.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedFeature(feature)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{feature.feature_name}</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {feature.module_code} → {feature.group_name || "Ungrouped"}
                      </p>
                      {feature.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {feature.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {feature.feature_code}
                        </Badge>
                        <Badge
                          variant={feature.is_active !== false ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {feature.is_active !== false ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Feature Detail Dialog */}
      <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedFeature && (
                <>
                  <div className="p-2 rounded-lg bg-primary/10">
                    {(() => {
                      const Icon = getIcon(selectedFeature.icon_name);
                      return <Icon className="h-5 w-5 text-primary" />;
                    })()}
                  </div>
                  {selectedFeature.feature_name}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedFeature && (
            <div className="space-y-4">
              {selectedFeature.description && (
                <p className="text-muted-foreground">{selectedFeature.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Feature Code</span>
                  <p className="font-mono">{selectedFeature.feature_code}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Module</span>
                  <p>{selectedFeature.module_code || "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Group</span>
                  <p>{selectedFeature.group_name || "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <p>
                    <Badge variant={selectedFeature.is_active !== false ? "default" : "secondary"}>
                      {selectedFeature.is_active !== false ? "Active" : "Inactive"}
                    </Badge>
                  </p>
                </div>
              </div>

              {selectedFeature.route_path && (
                <div>
                  <span className="text-sm text-muted-foreground">Route Path</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="font-mono text-xs">
                      {selectedFeature.route_path}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(selectedFeature.route_path!)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground pt-4 border-t">
                <div>
                  <span>Created</span>
                  <p>{new Date(selectedFeature.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span>Updated</span>
                  <p>{new Date(selectedFeature.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}