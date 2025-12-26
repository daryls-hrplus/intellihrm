import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Edit2,
  Save,
  X,
  Search,
  Filter
} from "lucide-react";

interface WizardStepReviewProps {
  importType: string;
  parsedData: any[] | null;
  validationResult: any;
  onDataChange: (data: any[]) => void;
}

export function WizardStepReview({ 
  importType, 
  parsedData, 
  validationResult,
  onDataChange 
}: WizardStepReviewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});

  const data = parsedData || [];
  const issues = validationResult?.basicIssues || [];
  const aiIssues = validationResult?.aiIssues || [];

  // Get all unique headers from data
  const headers = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  // Create a map of row -> field -> issue for quick lookup
  const issueMap = useMemo(() => {
    const map: Record<number, Record<string, any>> = {};
    [...issues, ...aiIssues].forEach((issue: any) => {
      if (!map[issue.row]) map[issue.row] = {};
      map[issue.row][issue.field] = issue;
    });
    return map;
  }, [issues, aiIssues]);

  // Filter data based on search and error filter
  const filteredData = useMemo(() => {
    let result = data.map((row, index) => ({ ...row, _rowIndex: index + 2 })); // +2 because row 1 is header

    if (searchTerm) {
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (showErrorsOnly) {
      result = result.filter((row) => issueMap[row._rowIndex]);
    }

    return result;
  }, [data, searchTerm, showErrorsOnly, issueMap]);

  const handleEdit = (rowIndex: number, row: any) => {
    setEditingRow(rowIndex);
    setEditedValues({ ...row });
  };

  const handleSave = (originalIndex: number) => {
    const newData = [...data];
    const { _rowIndex, ...values } = editedValues;
    newData[originalIndex] = values;
    onDataChange(newData);
    setEditingRow(null);
    setEditedValues({});
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditedValues({});
  };

  const getCellStatus = (rowNum: number, field: string) => {
    const issue = issueMap[rowNum]?.[field];
    if (!issue) return null;
    return issue.severity === "error" ? "error" : "warning";
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No data to review. Please upload a file first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-1">Review Data</h2>
        <p className="text-muted-foreground">
          Review your data before importing. You can edit cells with issues.
        </p>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {validationResult?.validRowCount || 0} valid
          </Badge>
          {validationResult?.basicErrorCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              {validationResult.basicErrorCount} errors
            </Badge>
          )}
          {validationResult?.aiErrorCount > 0 && (
            <Badge variant="outline" className="gap-1 text-yellow-600">
              <AlertTriangle className="h-3 w-3" />
              {validationResult.aiErrorCount} warnings
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <Button
            variant={showErrorsOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowErrorsOnly(!showErrorsOnly)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Errors Only
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] sticky top-0 bg-background">Row</TableHead>
                  {headers.map((header) => (
                    <TableHead key={header} className="sticky top-0 bg-background">
                      {header}
                    </TableHead>
                  ))}
                  <TableHead className="w-[100px] sticky top-0 bg-background">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row, displayIndex) => {
                  const originalIndex = data.findIndex((d) => 
                    headers.every((h) => d[h] === row[h])
                  );
                  const rowNum = row._rowIndex;
                  const hasIssue = !!issueMap[rowNum];
                  const isEditing = editingRow === originalIndex;

                  return (
                    <TableRow
                      key={displayIndex}
                      className={hasIssue ? "bg-destructive/5" : ""}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {rowNum}
                      </TableCell>
                      {headers.map((header) => {
                        const cellStatus = getCellStatus(rowNum, header);
                        const issue = issueMap[rowNum]?.[header];

                        return (
                          <TableCell
                            key={header}
                            className={`
                              ${cellStatus === "error" ? "bg-destructive/20" : ""}
                              ${cellStatus === "warning" ? "bg-yellow-500/20" : ""}
                            `}
                          >
                            {isEditing ? (
                              <Input
                                value={editedValues[header] || ""}
                                onChange={(e) =>
                                  setEditedValues((prev) => ({
                                    ...prev,
                                    [header]: e.target.value,
                                  }))
                                }
                                className="h-8 text-sm"
                              />
                            ) : (
                              <div className="relative group">
                                <span className="font-mono text-sm">{row[header]}</span>
                                {issue && (
                                  <div className="hidden group-hover:block absolute z-10 bg-popover border rounded-md shadow-lg p-2 text-xs max-w-[200px] top-full left-0 mt-1">
                                    <p className="font-medium">{issue.issue}</p>
                                    {issue.suggestion && (
                                      <p className="text-muted-foreground mt-1">
                                        💡 {issue.suggestion}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell>
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSave(originalIndex)}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancel}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(originalIndex, row)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-destructive/20 rounded" />
          <span>Error (must fix)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500/20 rounded" />
          <span>Warning (review)</span>
        </div>
      </div>

      {validationResult?.basicErrorCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {validationResult.basicErrorCount} error(s) that should be fixed before importing. 
            Only valid rows will be imported.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
