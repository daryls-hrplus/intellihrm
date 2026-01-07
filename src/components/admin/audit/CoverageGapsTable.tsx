import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CoverageGap, formatEntityType } from "@/utils/auditCoverageUtils";
import { Clock, Search, FileCode, ChevronDown, ChevronUp } from "lucide-react";

interface CoverageGapsTableProps {
  gaps: CoverageGap[];
  isLoading?: boolean;
}

export function CoverageGapsTable({ gaps, isLoading }: CoverageGapsTableProps) {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState(true);

  // Get unique modules for filter
  const modules = Array.from(new Set(gaps.map(g => g.module))).sort();

  // Filter gaps
  const filteredGaps = gaps.filter(gap => {
    const matchesSearch = gap.entityType.toLowerCase().includes(search.toLowerCase()) ||
      gap.module.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === "all" || gap.module === moduleFilter;
    const matchesStatus = statusFilter === "all" || gap.status === statusFilter;
    return matchesSearch && matchesModule && matchesStatus;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Coverage Gaps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-muted rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (gaps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-success" />
            Pending Activation
          </CardTitle>
          <CardDescription>
            All pages have been visited and are logging!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <span className="text-success font-medium">
              ✓ All audit hooks are active
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="p-0 h-auto hover:bg-transparent"
            onClick={() => setExpanded(!expanded)}
          >
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-info" />
              Pending Activation
              <Badge variant="outline" className="ml-2">
                {gaps.length}
              </Badge>
              {expanded ? (
                <ChevronUp className="h-4 w-4 ml-1" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-1" />
              )}
            </CardTitle>
          </Button>
        </div>
        <CardDescription>
          Pages with audit hooks that haven't been visited yet. They will start logging on first visit.
        </CardDescription>
      </CardHeader>
      
      {expanded && (
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entity types..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map(module => (
                  <SelectItem key={module} value={module}>{module}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_activation">Pending</SelectItem>
                <SelectItem value="orphaned">Unmapped</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border max-h-[400px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Recommendation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGaps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No gaps match your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGaps.slice(0, 50).map((gap) => (
                    <TableRow key={`${gap.module}-${gap.entityType}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileCode className="h-4 w-4 text-muted-foreground" />
                          {formatEntityType(gap.entityType)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{gap.module}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={gap.status === 'pending_activation' ? 'border-info text-info' : ''}
                        >
                          {gap.status === 'pending_activation' ? 'Pending' : 'Unmapped'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-xs truncate">
                        {gap.status === 'pending_activation' 
                          ? 'Visit page to activate logging' 
                          : gap.recommendation}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {filteredGaps.length > 50 && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Showing 50 of {filteredGaps.length} gaps
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
