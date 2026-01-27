import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Unlink2,
  Link2,
  FileText,
  Activity,
  Trash2,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { useDocumentationValidation, DocumentationValidation, OrphanedSection } from "@/hooks/useDocumentationValidation";
import { cn } from "@/lib/utils";

export function DocumentationHealthPanel() {
  const {
    validation,
    isValidating,
    validateDocumentation,
    removeOrphanedCodes,
    isRemovingOrphanedCodes,
  } = useDocumentationValidation();

  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    validateDocumentation();
  }, []);

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-destructive";
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Warning</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  const handleRemoveOrphanedCodes = async (sectionId: string, codes: string[]) => {
    const success = await removeOrphanedCodes(sectionId, codes);
    if (success) {
      await validateDocumentation();
    }
  };

  if (isValidating && !validation) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Validating documentation...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!validation) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <FileSearch className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium mb-2">No Validation Data</p>
            <p className="text-sm text-muted-foreground mb-4">Run validation to check documentation health</p>
            <Button onClick={validateDocumentation}>
              <Activity className="h-4 w-4 mr-2" />
              Run Validation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileSearch className="h-5 w-5" />
            Documentation Health
          </h2>
          <p className="text-sm text-muted-foreground">
            Bi-directional validation of features and documentation
          </p>
        </div>
        <Button
          variant="outline"
          onClick={validateDocumentation}
          disabled={isValidating}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isValidating && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Health Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={cn("text-2xl font-bold", getHealthColor(validation.summary.healthScore))}>
                {validation.summary.healthScore}%
              </span>
              {validation.summary.healthScore >= 80 ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : validation.summary.healthScore >= 60 ? (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </div>
            <Progress value={validation.summary.healthScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valid Mappings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-500">
                {validation.validMappings}
              </span>
              <Link2 className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sections correctly linked to features
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orphaned References
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-2xl font-bold",
                validation.summary.orphanedCount > 0 ? "text-destructive" : "text-green-500"
              )}>
                {validation.summary.orphanedCount}
              </span>
              <Unlink2 className={cn(
                "h-5 w-5",
                validation.summary.orphanedCount > 0 ? "text-destructive" : "text-muted-foreground"
              )} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Docs referencing non-existent features
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unmapped Sections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-2xl font-bold",
                validation.summary.unmappedCount > 0 ? "text-yellow-500" : "text-green-500"
              )}>
                {validation.summary.unmappedCount}
              </span>
              <FileText className={cn(
                "h-5 w-5",
                validation.summary.unmappedCount > 0 ? "text-yellow-500" : "text-muted-foreground"
              )} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sections with no feature mapping
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Alert */}
      {validation.summary.orphanedCount > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Orphaned Documentation Detected</AlertTitle>
          <AlertDescription>
            {validation.summary.orphanedCount} documentation section(s) reference features that don't exist in the database.
            Review and remove invalid feature codes to maintain documentation integrity.
          </AlertDescription>
        </Alert>
      )}

      {validation.summary.unmappedCount > 0 && validation.summary.orphanedCount === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unmapped Sections Found</AlertTitle>
          <AlertDescription>
            {validation.summary.unmappedCount} documentation sections have no feature mapping.
            Consider linking them to relevant features for accurate coverage analysis.
          </AlertDescription>
        </Alert>
      )}

      {validation.summary.orphanedCount === 0 && validation.summary.unmappedCount === 0 && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">All Documentation Healthy</AlertTitle>
          <AlertDescription className="text-green-600">
            All {validation.validMappings} mapped documentation sections reference valid features.
          </AlertDescription>
        </Alert>
      )}

      {/* Detail Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="orphaned" className="gap-2">
            <Unlink2 className="h-4 w-4" />
            Orphaned ({validation.summary.orphanedCount})
          </TabsTrigger>
          <TabsTrigger value="unmapped" className="gap-2">
            <FileText className="h-4 w-4" />
            Unmapped ({validation.summary.unmappedCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Validation Summary</CardTitle>
              <CardDescription>
                Bi-directional check between application_features and manual_sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Forward Check</p>
                    <p className="text-sm">Features → Documentation</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Which features lack documentation?
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Reverse Check</p>
                    <p className="text-sm">Documentation → Features</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Which docs reference non-existent features?
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="font-medium mb-2">Total Sections Analyzed: {validation.totalSections}</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Valid Mappings:</span>
                      <span className="ml-2 font-medium text-green-600">{validation.validMappings}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Orphaned Codes:</span>
                      <span className="ml-2 font-medium text-destructive">{validation.summary.orphanedCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Unmapped:</span>
                      <span className="ml-2 font-medium text-yellow-600">{validation.summary.unmappedCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orphaned" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Orphaned Documentation</CardTitle>
              <CardDescription>
                Sections referencing features that don't exist in application_features
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validation.orphanedDocumentation.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="font-medium">No Orphaned References</p>
                  <p className="text-sm text-muted-foreground">All documentation references valid features</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Section</TableHead>
                        <TableHead>Manual</TableHead>
                        <TableHead>Orphaned Codes</TableHead>
                        <TableHead>Valid Codes</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validation.orphanedDocumentation.map((section) => (
                        <TableRow key={`${section.manual_code}-${section.section_number}`}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{section.section_number}</p>
                              <p className="text-xs text-muted-foreground">{section.section_title}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{section.manual_code}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {section.orphaned_codes.map((code) => (
                                <Badge key={code} variant="destructive" className="text-xs">
                                  {code}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {section.valid_codes.map((code) => (
                                <Badge key={code} variant="outline" className="text-xs bg-green-50 text-green-700">
                                  {code}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getSeverityBadge(section.severity)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveOrphanedCodes(section.section_id, section.orphaned_codes)}
                              disabled={isRemovingOrphanedCodes}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unmapped" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Unmapped Sections</CardTitle>
              <CardDescription>
                Sections with no feature codes assigned - invisible to coverage analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validation.unmappedSections.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="font-medium">All Sections Mapped</p>
                  <p className="text-sm text-muted-foreground">Every section has feature codes assigned</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Section</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Manual</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validation.unmappedSections.slice(0, 50).map((section) => (
                        <TableRow key={section.section_id}>
                          <TableCell>
                            <Badge variant="outline">{section.section_number}</Badge>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{section.title}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{section.manual_code}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline">
                              <Settings className="h-3 w-3 mr-1" />
                              Link Features
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {validation.unmappedSections.length > 50 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Showing 50 of {validation.unmappedSections.length} unmapped sections
                    </p>
                  )}
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
