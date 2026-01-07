import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { 
  getNotInstrumentedPages, 
  getInstrumentationSummaryByModule,
  PageInstrumentationStatus 
} from "@/utils/pageInstrumentationRegistry";
import { Clock, Search, FileCode, ChevronDown, ChevronUp, AlertCircle, Code2 } from "lucide-react";

interface CoverageGapsTableProps {
  gaps: CoverageGap[];
  isLoading?: boolean;
}

export function CoverageGapsTable({ gaps, isLoading }: CoverageGapsTableProps) {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("pending");

  // Get not instrumented pages
  const notInstrumentedPages = getNotInstrumentedPages();
  const instrumentationSummary = getInstrumentationSummaryByModule();

  // Get unique modules for filter - combine from both sources
  const pendingModules = Array.from(new Set(gaps.map(g => g.module))).sort();
  const notImplModules = Array.from(new Set(notInstrumentedPages.map(p => p.module))).sort();
  const allModules = Array.from(new Set([...pendingModules, ...notImplModules])).sort();

  // Filter pending activation gaps
  const filteredGaps = gaps.filter(gap => {
    const matchesSearch = gap.entityType.toLowerCase().includes(search.toLowerCase()) ||
      gap.module.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === "all" || gap.module === moduleFilter;
    return matchesSearch && matchesModule && gap.status === 'pending_activation';
  });

  // Filter not instrumented pages
  const filteredNotImpl = notInstrumentedPages.filter(page => {
    const matchesSearch = page.pageName.toLowerCase().includes(search.toLowerCase()) ||
      page.module.toLowerCase().includes(search.toLowerCase()) ||
      page.entityType.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === "all" || page.module === moduleFilter;
    return matchesSearch && matchesModule;
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

  const pendingCount = gaps.filter(g => g.status === 'pending_activation').length;
  const notImplCount = notInstrumentedPages.length;

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
              <Code2 className="h-5 w-5 text-primary" />
              Instrumentation Status
              {expanded ? (
                <ChevronUp className="h-4 w-4 ml-1" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-1" />
              )}
            </CardTitle>
          </Button>
        </div>
        <CardDescription>
          Track which pages have audit hooks implemented and which are pending activation.
        </CardDescription>
      </CardHeader>
      
      {expanded && (
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="not-implemented" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Not Implemented
                <Badge variant="destructive" className="ml-1">
                  {notImplCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Activation
                <Badge variant="outline" className="ml-1">
                  {pendingCount}
                </Badge>
              </TabsTrigger>
            </TabsList>

            {/* Filters - shared between tabs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
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
                  {allModules.map(module => (
                    <SelectItem key={module} value={module}>
                      {module}
                      {instrumentationSummary[module] && (
                        <span className="ml-2 text-muted-foreground text-xs">
                          ({instrumentationSummary[module].percentage}%)
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Not Implemented Tab */}
            <TabsContent value="not-implemented">
              <div className="mb-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  These pages need <code className="px-1 py-0.5 bg-destructive/20 rounded">usePageAudit()</code> hooks added to enable audit logging.
                </p>
              </div>

              <div className="rounded-md border max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead>Page Name</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead className="hidden md:table-cell">Path</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotImpl.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          {moduleFilter !== "all" 
                            ? `All pages in ${moduleFilter} are instrumented! 🎉`
                            : "No pages match your filters"
                          }
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredNotImpl.slice(0, 100).map((page) => (
                        <TableRow key={`${page.module}-${page.entityType}`}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileCode className="h-4 w-4 text-destructive" />
                              {page.pageName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{page.module}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground font-mono">
                            {page.entityType}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground font-mono">
                            {page.pagePath}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {filteredNotImpl.length > 100 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Showing 100 of {filteredNotImpl.length} pages
                </p>
              )}
            </TabsContent>

            {/* Pending Activation Tab */}
            <TabsContent value="pending">
              <div className="mb-3 p-3 bg-info/10 rounded-lg border border-info/20">
                <p className="text-sm text-info">
                  <Clock className="h-4 w-4 inline mr-2" />
                  These pages have hooks implemented but haven't been visited yet. They will start logging on first visit.
                </p>
              </div>

              {pendingCount === 0 ? (
                <div className="flex items-center justify-center p-8 text-muted-foreground border rounded-lg">
                  <span className="text-success font-medium">
                    ✓ All instrumented pages have been activated
                  </span>
                </div>
              ) : (
                <>
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
                              No pending pages match your filters
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredGaps.slice(0, 50).map((gap) => (
                            <TableRow key={`${gap.module}-${gap.entityType}`}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <FileCode className="h-4 w-4 text-info" />
                                  {formatEntityType(gap.entityType)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{gap.module}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="border-info text-info">
                                  Pending
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-xs truncate">
                                Visit page to activate logging
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {filteredGaps.length > 50 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Showing 50 of {filteredGaps.length} pages
                    </p>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}
