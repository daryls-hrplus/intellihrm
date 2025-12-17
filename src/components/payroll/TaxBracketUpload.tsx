import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Upload, Sparkles, FileText, CheckCircle, AlertCircle, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getTodayString } from "@/utils/dateUtils";

interface ExtractedBracket {
  band_name: string;
  min_amount: number;
  max_amount: number | null;
  employee_rate: number | null;
  employer_rate: number | null;
  fixed_amount: number | null;
  calculation_method: string;
  pay_frequency: string;
  min_age: number | null;
  max_age: number | null;
  notes: string;
}

interface TaxBracketUploadProps {
  statutoryTypeId: string;
  statutoryTypeName: string;
  country: string;
  onBracketsImported: () => void;
}

export function TaxBracketUpload({ 
  statutoryTypeId, 
  statutoryTypeName, 
  country,
  onBracketsImported 
}: TaxBracketUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [effectiveDate, setEffectiveDate] = useState(getTodayString());
  const [endDate, setEndDate] = useState<string>("");
  const [extractedBrackets, setExtractedBrackets] = useState<ExtractedBracket[]>([]);
  const [selectedBrackets, setSelectedBrackets] = useState<Set<number>>(new Set());
  const [analysisNotes, setAnalysisNotes] = useState("");
  const [rawExtraction, setRawExtraction] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractedBrackets([]);
      setSelectedBrackets(new Set());
      setAnalysisNotes("");
      setRawExtraction(null);
    }
  };

  const analyzeDocument = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      const fileContent = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const { data, error } = await supabase.functions.invoke('analyze-statutory-document', {
        body: {
          documentContent: fileContent,
          documentName: selectedFile.name,
          country: country,
          statutoryType: statutoryTypeName,
          analysisType: 'extract_brackets',
          effectiveDate: effectiveDate,
        }
      });

      if (error) throw error;

      if (data.brackets && Array.isArray(data.brackets)) {
        setExtractedBrackets(data.brackets);
        setSelectedBrackets(new Set(data.brackets.map((_: any, i: number) => i)));
      }
      
      if (data.notes) {
        setAnalysisNotes(data.notes);
      }
      
      setRawExtraction(data);
      toast.success("Document analyzed successfully");
    } catch (error) {
      console.error('Error analyzing document:', error);
      toast.error("Failed to analyze document");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleBracketSelection = (index: number) => {
    const newSelected = new Set(selectedBrackets);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedBrackets(newSelected);
  };

  const selectAll = () => {
    setSelectedBrackets(new Set(extractedBrackets.map((_, i) => i)));
  };

  const deselectAll = () => {
    setSelectedBrackets(new Set());
  };

  const importSelectedBrackets = async () => {
    if (selectedBrackets.size === 0) {
      toast.error("Please select at least one bracket to import");
      return;
    }

    setIsImporting(true);
    try {
      const bracketsToImport = extractedBrackets
        .filter((_, i) => selectedBrackets.has(i))
        .map((bracket, index) => ({
          statutory_type_id: statutoryTypeId,
          band_name: bracket.band_name,
          min_amount: bracket.min_amount,
          max_amount: bracket.max_amount,
          employee_rate: bracket.employee_rate,
          employer_rate: bracket.employer_rate,
          fixed_amount: bracket.fixed_amount,
          calculation_method: bracket.calculation_method || 'percentage',
          pay_frequency: bracket.pay_frequency || 'monthly',
          min_age: bracket.min_age,
          max_age: bracket.max_age,
          is_active: true,
          start_date: effectiveDate,
          end_date: endDate || null,
          notes: bracket.notes,
          display_order: index,
        }));

      const { error } = await supabase
        .from('statutory_rate_bands')
        .insert(bracketsToImport);

      if (error) throw error;

      toast.success(`Successfully imported ${bracketsToImport.length} tax brackets`);
      onBracketsImported();
      setIsOpen(false);
      resetState();
    } catch (error) {
      console.error('Error importing brackets:', error);
      toast.error("Failed to import tax brackets");
    } finally {
      setIsImporting(false);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setExtractedBrackets([]);
    setSelectedBrackets(new Set());
    setAnalysisNotes("");
    setRawExtraction(null);
  };

  const formatRate = (rate: number | null) => {
    if (rate === null) return '-';
    return `${(rate * 100).toFixed(2)}%`;
  };

  const formatAmount = (amount: number | null) => {
    if (amount === null) return '-';
    return amount.toLocaleString();
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Upload className="h-4 w-4 mr-2" />
        AI Import Brackets
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetState(); }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Tax Bracket Import - {statutoryTypeName}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="upload" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">1. Upload Document</TabsTrigger>
              <TabsTrigger value="review" disabled={extractedBrackets.length === 0}>
                2. Review Brackets
              </TabsTrigger>
              <TabsTrigger value="notes" disabled={!rawExtraction}>
                3. Analysis Notes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="flex-1 overflow-auto space-y-4 p-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Upload Tax Document</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload a PDF, spreadsheet (CSV/Excel), or image containing tax brackets for {statutoryTypeName} in {country}.
                    The AI will extract and structure the tax brackets automatically.
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Document File</Label>
                      <Input
                        type="file"
                        accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                      />
                      {selectedFile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          {selectedFile.name}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Effective Date *</Label>
                        <Input
                          type="date"
                          value={effectiveDate}
                          onChange={(e) => setEffectiveDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Date (Optional)</Label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={analyzeDocument} 
                    disabled={!selectedFile || isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Document...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze & Extract Brackets
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="review" className="flex-1 overflow-hidden flex flex-col p-1">
              {extractedBrackets.length > 0 && (
                <Card className="flex-1 overflow-hidden flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Extracted Tax Brackets ({extractedBrackets.length})
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={selectAll}>
                          Select All
                        </Button>
                        <Button variant="outline" size="sm" onClick={deselectAll}>
                          Deselect All
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Review and select the brackets you want to import. Selected: {selectedBrackets.size}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-[350px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Select</TableHead>
                            <TableHead>Band Name</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead className="text-right">Min Amount</TableHead>
                            <TableHead className="text-right">Max Amount</TableHead>
                            <TableHead className="text-right">Employee Rate</TableHead>
                            <TableHead className="text-right">Employer Rate</TableHead>
                            <TableHead>Age Range</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {extractedBrackets.map((bracket, index) => (
                            <TableRow 
                              key={index}
                              className={selectedBrackets.has(index) ? "bg-primary/5" : ""}
                            >
                              <TableCell>
                                <Switch
                                  checked={selectedBrackets.has(index)}
                                  onCheckedChange={() => toggleBracketSelection(index)}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{bracket.band_name}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {bracket.calculation_method === 'fixed' ? 'Fixed' : 
                                   bracket.calculation_method === 'per_monday' ? 'Per Monday' : 'Percentage'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">{formatAmount(bracket.min_amount)}</TableCell>
                              <TableCell className="text-right">{formatAmount(bracket.max_amount)}</TableCell>
                              <TableCell className="text-right">
                                {bracket.calculation_method === 'fixed' 
                                  ? formatAmount(bracket.fixed_amount)
                                  : formatRate(bracket.employee_rate)}
                              </TableCell>
                              <TableCell className="text-right">{formatRate(bracket.employer_rate)}</TableCell>
                              <TableCell>
                                {bracket.min_age || bracket.max_age ? (
                                  <span className="text-xs text-muted-foreground">
                                    {bracket.min_age || 0} - {bracket.max_age || '∞'}
                                  </span>
                                ) : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="notes" className="flex-1 overflow-auto p-1">
              {rawExtraction && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">AI Analysis Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysisNotes && (
                      <div className="space-y-2">
                        <Label>Extraction Notes</Label>
                        <Textarea 
                          value={analysisNotes} 
                          readOnly 
                          className="min-h-[100px]"
                        />
                      </div>
                    )}

                    {rawExtraction.warnings && rawExtraction.warnings.length > 0 && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-amber-600">
                          <AlertCircle className="h-4 w-4" />
                          Warnings
                        </Label>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {rawExtraction.warnings.map((w: string, i: number) => (
                            <li key={i}>• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {rawExtraction.assumptions && rawExtraction.assumptions.length > 0 && (
                      <div className="space-y-2">
                        <Label>Assumptions Made</Label>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {rawExtraction.assumptions.map((a: string, i: number) => (
                            <li key={i}>• {a}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={importSelectedBrackets}
              disabled={selectedBrackets.size === 0 || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Import {selectedBrackets.size} Brackets
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
