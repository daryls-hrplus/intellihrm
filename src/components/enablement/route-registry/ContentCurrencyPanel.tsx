import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Play,
  Loader2,
  FileSearch,
  BookOpen,
  FileText,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Info,
  Download,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useContentCurrencyValidation } from "@/hooks/useContentCurrencyValidation";
import { ContentCurrencyIssue } from "@/types/contentCurrency";
import { cn } from "@/lib/utils";

export function ContentCurrencyPanel() {
  const [activeDocTab, setActiveDocTab] = useState("all");
  
  const {
    runValidation,
    getQuickSummary,
    isValidating,
    lastReport,
  } = useContentCurrencyValidation();

  const quickSummary = getQuickSummary();

  const handleRunValidation = async () => {
    try {
      await runValidation();
      toast.success("Content Currency validation complete");
    } catch (error) {
      toast.error("Validation failed");
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-destructive";
  };

  const getDocumentIcon = (docType: string) => {
    switch (docType) {
      case 'product_capabilities': return <FileText className="h-4 w-4" />;
      case 'implementation_handbook': return <BookOpen className="h-4 w-4" />;
      case 'admin_manual': return <Shield className="h-4 w-4" />;
      default: return <FileSearch className="h-4 w-4" />;
    }
  };

  const renderIssueTable = (issues: ContentCurrencyIssue[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px]"></TableHead>
          <TableHead>Route</TableHead>
          <TableHead>Module</TableHead>
          <TableHead>Feature</TableHead>
          <TableHead>Suggested Section</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {issues.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <p className="text-sm text-muted-foreground">All code routes are documented!</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          issues.map((issue) => (
            <TableRow key={issue.id}>
              <TableCell>{getSeverityIcon(issue.severity)}</TableCell>
              <TableCell className="font-mono text-sm">{issue.routePath}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {issue.moduleCode}
                </Badge>
              </TableCell>
              <TableCell>{issue.featureName}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {issue.suggestedSection}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Content Currency Validation
          </h3>
          <p className="text-sm text-muted-foreground">
            Detect implemented features missing from documentation (Code → Document)
          </p>
        </div>
        <Button onClick={handleRunValidation} disabled={isValidating}>
          {isValidating ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Run Check
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{quickSummary.totalCodeRoutes}</p>
                <p className="text-xs text-muted-foreground">Code Routes</p>
              </div>
              <FileSearch className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{quickSummary.capabilitiesModules}</p>
                <p className="text-xs text-muted-foreground">Capability Modules</p>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{quickSummary.handbookTasks}</p>
                <p className="text-xs text-muted-foreground">Handbook Tasks</p>
              </div>
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{quickSummary.adminManualSections}</p>
                <p className="text-xs text-muted-foreground">Manual Sections</p>
              </div>
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Content */}
      {!lastReport ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="font-medium">No validation report yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Run a check to see which code features are missing from documentation
              </p>
              <Button onClick={handleRunValidation} disabled={isValidating}>
                {isValidating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Run Content Currency Check
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Currency Score */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Documentation Currency Score</CardTitle>
                  <CardDescription>
                    How up-to-date are the documents with implemented code
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className={cn("text-3xl font-bold", getScoreColor(lastReport.summary.currencyScore))}>
                    {lastReport.summary.currencyScore}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last run: {lastReport.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={lastReport.summary.currencyScore} className="h-3" />
              <div className="flex justify-between mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span>Documented: {lastReport.summary.documentedInCapabilities}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span>Gaps: {lastReport.summary.undocumentedCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coverage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={cn(
              "border-l-4",
              lastReport.byDocument.product_capabilities.length === 0 
                ? "border-l-green-500" 
                : "border-l-yellow-500"
            )}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Product Capabilities</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {lastReport.summary.documentedInCapabilities}
                    </p>
                    <p className="text-xs text-muted-foreground">Documented</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600">
                      {lastReport.byDocument.product_capabilities.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Gaps</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "border-l-4",
              lastReport.byDocument.implementation_handbook.length === 0 
                ? "border-l-green-500" 
                : "border-l-yellow-500"
            )}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">Implementation Handbook</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {lastReport.summary.documentedInHandbook}
                    </p>
                    <p className="text-xs text-muted-foreground">Covered</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600">
                      {lastReport.byDocument.implementation_handbook.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Gaps</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "border-l-4",
              lastReport.byDocument.admin_manual.length === 0 
                ? "border-l-green-500" 
                : "border-l-yellow-500"
            )}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium">Admin & Security Manual</span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {lastReport.summary.documentedInManual}
                    </p>
                    <p className="text-xs text-muted-foreground">Covered</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-yellow-600">
                      {lastReport.byDocument.admin_manual.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Gaps</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gap Details */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Documentation Gaps</CardTitle>
                <Button variant="outline" size="sm" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeDocTab} onValueChange={setActiveDocTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all" className="text-xs">
                    All Gaps
                    <Badge variant="outline" className="ml-1 h-5 px-1 text-xs">
                      {lastReport.issues.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="capabilities" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    Capabilities
                    <Badge variant="outline" className="ml-1 h-5 px-1 text-xs">
                      {lastReport.byDocument.product_capabilities.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="handbook" className="text-xs">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Handbook
                    <Badge variant="outline" className="ml-1 h-5 px-1 text-xs">
                      {lastReport.byDocument.implementation_handbook.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    Manual
                    <Badge variant="outline" className="ml-1 h-5 px-1 text-xs">
                      {lastReport.byDocument.admin_manual.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[400px] mt-4">
                  <TabsContent value="all" className="mt-0">
                    {renderIssueTable(lastReport.issues)}
                  </TabsContent>
                  
                  <TabsContent value="capabilities" className="mt-0">
                    {renderIssueTable(lastReport.byDocument.product_capabilities)}
                  </TabsContent>
                  
                  <TabsContent value="handbook" className="mt-0">
                    {renderIssueTable(lastReport.byDocument.implementation_handbook)}
                  </TabsContent>
                  
                  <TabsContent value="manual" className="mt-0">
                    {renderIssueTable(lastReport.byDocument.admin_manual)}
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
