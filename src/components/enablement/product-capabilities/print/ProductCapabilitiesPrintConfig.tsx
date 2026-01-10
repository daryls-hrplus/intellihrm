import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ProductCapabilitiesPrintSettings,
  DocumentClassification,
  DocumentStatus,
  WatermarkType,
  RevisionHistoryEntry,
  CLASSIFICATION_WATERMARKS,
  DEFAULT_PRODUCT_CAPABILITIES_PRINT_SETTINGS
} from "@/hooks/useProductCapabilitiesPrintSettings";
import { 
  FileText, 
  Layout, 
  Palette, 
  BookOpen, 
  FileCode, 
  Droplets, 
  CalendarIcon,
  Shield,
  ListChecks,
  Plus,
  Trash2,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ProductCapabilitiesPrintConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ProductCapabilitiesPrintSettings;
  onSave: (settings: ProductCapabilitiesPrintSettings) => void;
  isSaving?: boolean;
}

export function ProductCapabilitiesPrintConfig({
  open,
  onOpenChange,
  settings,
  onSave,
  isSaving
}: ProductCapabilitiesPrintConfigProps) {
  const [localSettings, setLocalSettings] = useState<ProductCapabilitiesPrintSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const updateLayout = (updates: Partial<ProductCapabilitiesPrintSettings['layout']>) => {
    setLocalSettings(prev => ({
      ...prev,
      layout: { ...prev.layout, ...updates }
    }));
  };

  const updateDocument = (updates: Partial<ProductCapabilitiesPrintSettings['document']>) => {
    setLocalSettings(prev => ({
      ...prev,
      document: { ...prev.document, ...updates }
    }));
  };

  const updateHeaders = (updates: Partial<ProductCapabilitiesPrintSettings['headers']>) => {
    setLocalSettings(prev => ({
      ...prev,
      headers: { ...prev.headers, ...updates }
    }));
  };

  const updateSections = (updates: Partial<ProductCapabilitiesPrintSettings['sections']>) => {
    setLocalSettings(prev => ({
      ...prev,
      sections: { ...prev.sections, ...updates }
    }));
  };

  const updateBranding = (updates: Partial<ProductCapabilitiesPrintSettings['branding']>) => {
    setLocalSettings(prev => ({
      ...prev,
      branding: { ...prev.branding, ...updates }
    }));
  };

  const addRevision = () => {
    const newRevision: RevisionHistoryEntry = {
      version: localSettings.document.version,
      date: format(new Date(), 'yyyy-MM-dd'),
      author: '',
      changes: ''
    };
    updateDocument({
      revisions: [...localSettings.document.revisions, newRevision]
    });
  };

  const updateRevision = (index: number, updates: Partial<RevisionHistoryEntry>) => {
    const newRevisions = [...localSettings.document.revisions];
    newRevisions[index] = { ...newRevisions[index], ...updates };
    updateDocument({ revisions: newRevisions });
  };

  const removeRevision = (index: number) => {
    const newRevisions = localSettings.document.revisions.filter((_, i) => i !== index);
    updateDocument({ revisions: newRevisions });
  };

  const handleSave = () => {
    onSave(localSettings);
  };

  const classificationConfig = CLASSIFICATION_WATERMARKS[localSettings.document.classification];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>PDF Export Configuration</DialogTitle>
          <DialogDescription>
            Configure how the Product Capabilities document appears when exported or printed
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="cover" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="cover" className="text-xs gap-1">
              <BookOpen className="h-3 w-3" />
              Cover
            </TabsTrigger>
            <TabsTrigger value="document" className="text-xs gap-1">
              <FileCode className="h-3 w-3" />
              Document
            </TabsTrigger>
            <TabsTrigger value="classification" className="text-xs gap-1">
              <Shield className="h-3 w-3" />
              Classification
            </TabsTrigger>
            <TabsTrigger value="headers" className="text-xs gap-1">
              <FileText className="h-3 w-3" />
              Headers
            </TabsTrigger>
            <TabsTrigger value="sections" className="text-xs gap-1">
              <ListChecks className="h-3 w-3" />
              Sections
            </TabsTrigger>
            <TabsTrigger value="layout" className="text-xs gap-1">
              <Layout className="h-3 w-3" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="branding" className="text-xs gap-1">
              <Palette className="h-3 w-3" />
              Branding
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <div className="pr-4">
              {/* Cover Tab */}
              <TabsContent value="cover" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include Cover Page</Label>
                    <p className="text-sm text-muted-foreground">Add a branded cover page</p>
                  </div>
                  <Switch
                    checked={localSettings.document.includeCover}
                    onCheckedChange={(checked) => updateDocument({ includeCover: checked })}
                  />
                </div>

                {localSettings.document.includeCover && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Document Title</Label>
                        <Input
                          value={localSettings.document.title}
                          onChange={(e) => updateDocument({ title: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Subtitle</Label>
                        <Input
                          value={localSettings.document.subtitle}
                          onChange={(e) => updateDocument({ subtitle: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Version</Label>
                        <Input
                          value={localSettings.document.version}
                          onChange={(e) => updateDocument({ version: e.target.value })}
                          className="mt-1"
                          placeholder="1.0.0"
                        />
                      </div>
                      <div>
                        <Label>Cover Style</Label>
                        <Select
                          value={localSettings.document.coverStyle}
                          onValueChange={(value) => updateDocument({ coverStyle: value as 'branded' | 'minimal' | 'corporate' })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="branded">Branded - Full color background</SelectItem>
                            <SelectItem value="minimal">Minimal - Clean white design</SelectItem>
                            <SelectItem value="corporate">Corporate - Professional bands</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Cover preview */}
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                        <div 
                          className="aspect-[3/4] rounded border overflow-hidden flex flex-col"
                          style={{ 
                            backgroundColor: localSettings.document.coverStyle === 'branded' 
                              ? localSettings.branding.primaryColor 
                              : localSettings.document.coverStyle === 'corporate'
                              ? '#f5f5f5'
                              : 'white',
                            maxHeight: '150px'
                          }}
                        >
                          {localSettings.document.coverStyle === 'corporate' && (
                            <div 
                              className="h-8 w-full"
                              style={{ backgroundColor: localSettings.branding.secondaryColor }}
                            />
                          )}
                          <div className="flex-1 flex flex-col items-center justify-center p-2">
                            <span 
                              className="text-xs font-bold text-center"
                              style={{ 
                                color: localSettings.document.coverStyle === 'branded' ? 'white' : localSettings.branding.primaryColor 
                              }}
                            >
                              {localSettings.document.title}
                            </span>
                            <span 
                              className="text-[8px] text-center mt-1"
                              style={{ 
                                color: localSettings.document.coverStyle === 'branded' ? 'rgba(255,255,255,0.8)' : '#666' 
                              }}
                            >
                              {localSettings.document.subtitle}
                            </span>
                          </div>
                          {localSettings.document.coverStyle === 'corporate' && (
                            <div 
                              className="h-1 w-full"
                              style={{ backgroundColor: localSettings.branding.accentColor }}
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Document Control Tab */}
              <TabsContent value="document" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Document ID</Label>
                    <Input
                      value={localSettings.document.documentId}
                      onChange={(e) => updateDocument({ documentId: e.target.value })}
                      placeholder="IHRM-CAP-2026-001"
                      className="mt-1 font-mono"
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={localSettings.document.status}
                      onValueChange={(value) => updateDocument({ status: value as DocumentStatus })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="review">Under Review</SelectItem>
                        <SelectItem value="released">Released</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Effective Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full mt-1 justify-start text-left font-normal",
                            !localSettings.document.effectiveDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {localSettings.document.effectiveDate 
                            ? format(new Date(localSettings.document.effectiveDate), "PPP") 
                            : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={localSettings.document.effectiveDate ? new Date(localSettings.document.effectiveDate) : undefined}
                          onSelect={(date) => updateDocument({ effectiveDate: date ? format(date, "yyyy-MM-dd") : "" })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Review Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full mt-1 justify-start text-left font-normal",
                            !localSettings.document.reviewDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {localSettings.document.reviewDate 
                            ? format(new Date(localSettings.document.reviewDate), "PPP") 
                            : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={localSettings.document.reviewDate ? new Date(localSettings.document.reviewDate) : undefined}
                          onSelect={(date) => updateDocument({ reviewDate: date ? format(date, "yyyy-MM-dd") : "" })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Document Owner</Label>
                    <Input
                      value={localSettings.document.owner}
                      onChange={(e) => updateDocument({ owner: e.target.value })}
                      placeholder="Product Management"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Approved By</Label>
                    <Input
                      value={localSettings.document.approver}
                      onChange={(e) => updateDocument({ approver: e.target.value })}
                      placeholder="Approver name"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label>Include Document Control Page</Label>
                    <p className="text-sm text-muted-foreground">Adds metadata and revision history</p>
                  </div>
                  <Switch
                    checked={localSettings.document.includeDocumentControl}
                    onCheckedChange={(checked) => updateDocument({ includeDocumentControl: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include Legal/Disclaimer Page</Label>
                    <p className="text-sm text-muted-foreground">Copyright and disclaimer notices</p>
                  </div>
                  <Switch
                    checked={localSettings.document.includeLegalPage}
                    onCheckedChange={(checked) => updateDocument({ includeLegalPage: checked })}
                  />
                </div>

                {/* Revision History */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <Label>Revision History</Label>
                    <Button variant="outline" size="sm" onClick={addRevision}>
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  
                  {localSettings.document.revisions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No revisions recorded</p>
                  ) : (
                    <div className="space-y-2">
                      {localSettings.document.revisions.map((rev, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                          <Input
                            value={rev.version}
                            onChange={(e) => updateRevision(idx, { version: e.target.value })}
                            placeholder="1.0.0"
                            className="col-span-2 text-xs"
                          />
                          <Input
                            value={rev.date}
                            onChange={(e) => updateRevision(idx, { date: e.target.value })}
                            placeholder="Date"
                            className="col-span-2 text-xs"
                          />
                          <Input
                            value={rev.author}
                            onChange={(e) => updateRevision(idx, { author: e.target.value })}
                            placeholder="Author"
                            className="col-span-3 text-xs"
                          />
                          <Input
                            value={rev.changes}
                            onChange={(e) => updateRevision(idx, { changes: e.target.value })}
                            placeholder="Description"
                            className="col-span-4 text-xs"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="col-span-1 h-8 w-8"
                            onClick={() => removeRevision(idx)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Classification Tab */}
              <TabsContent value="classification" className="space-y-4 mt-0">
                <div>
                  <Label>Document Classification</Label>
                  <Select
                    value={localSettings.document.classification}
                    onValueChange={(value) => updateDocument({ classification: value as DocumentClassification })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">DRAFT</Badge>
                          <span>Draft - Not for distribution</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="confidential">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-red-500/10 text-red-600">CONFIDENTIAL</Badge>
                          <span>Confidential - Authorized only</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="internal">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-600">INTERNAL</Badge>
                          <span>Internal Use Only</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="customer">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-500/10 text-green-600">CUSTOMER</Badge>
                          <span>Customer Copy - No restrictions</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="sample">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-600">SAMPLE</Badge>
                          <span>Sample Documentation</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card className="mt-4">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Droplets className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Watermark Preview</span>
                    </div>
                    <div 
                      className="h-24 border rounded-lg flex items-center justify-center bg-white relative overflow-hidden"
                    >
                      {classificationConfig.text && (
                        <span 
                          className="text-2xl font-bold text-gray-400 rotate-[-30deg] absolute"
                          style={{ opacity: classificationConfig.opacity * 5 }}
                        >
                          {classificationConfig.text}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground z-10">Document content area</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Footer will show: "{classificationConfig.footerText || 'Standard copyright'}"
                    </p>
                  </CardContent>
                </Card>

                <div className="pt-4 border-t">
                  <Label>Watermark Type</Label>
                  <Select
                    value={localSettings.branding.watermarkType}
                    onValueChange={(value) => updateBranding({ watermarkType: value as WatermarkType })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No watermark</SelectItem>
                      <SelectItem value="classification">Based on classification</SelectItem>
                      <SelectItem value="custom">Custom text</SelectItem>
                      <SelectItem value="date-based">Date-based expiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {localSettings.branding.watermarkType === 'custom' && (
                  <div>
                    <Label>Custom Watermark Text</Label>
                    <Input
                      value={localSettings.branding.watermarkText}
                      onChange={(e) => updateBranding({ watermarkText: e.target.value })}
                      placeholder="Enter watermark text"
                      className="mt-1"
                    />
                  </div>
                )}

                {localSettings.branding.watermarkType === 'date-based' && (
                  <div>
                    <Label>Expiry Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full mt-1 justify-start text-left font-normal",
                            !localSettings.branding.watermarkExpiryDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {localSettings.branding.watermarkExpiryDate 
                            ? format(new Date(localSettings.branding.watermarkExpiryDate), "PPP") 
                            : <span>Pick expiry date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={localSettings.branding.watermarkExpiryDate ? new Date(localSettings.branding.watermarkExpiryDate) : undefined}
                          onSelect={(date) => updateBranding({ watermarkExpiryDate: date ? format(date, "yyyy-MM-dd") : "" })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                {localSettings.branding.watermarkType !== 'none' && localSettings.branding.watermarkType !== 'classification' && (
                  <div>
                    <Label>Watermark Opacity: {Math.round(localSettings.branding.watermarkOpacity * 100)}%</Label>
                    <Slider
                      value={[localSettings.branding.watermarkOpacity * 100]}
                      onValueChange={([value]) => updateBranding({ watermarkOpacity: value / 100 })}
                      max={30}
                      min={5}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                )}
              </TabsContent>

              {/* Headers Tab */}
              <TabsContent value="headers" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include Headers</Label>
                    <p className="text-sm text-muted-foreground">Show header on each page</p>
                  </div>
                  <Switch
                    checked={localSettings.headers.includeHeaders}
                    onCheckedChange={(checked) => updateHeaders({ includeHeaders: checked })}
                  />
                </div>

                {localSettings.headers.includeHeaders && (
                  <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                    <div>
                      <Label>Header Content</Label>
                      <Input
                        value={localSettings.headers.headerContent}
                        onChange={(e) => updateHeaders({ headerContent: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Header Style</Label>
                      <Select
                        value={localSettings.headers.headerStyle}
                        onValueChange={(value) => updateHeaders({ headerStyle: value as 'branded' | 'simple' | 'none' })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="branded">Branded - With accent colors</SelectItem>
                          <SelectItem value="simple">Simple - Minimal text</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={localSettings.headers.showLogo}
                          onCheckedChange={(checked) => updateHeaders({ showLogo: checked })}
                        />
                        <Label className="text-sm">Show Logo</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={localSettings.headers.showVersionInHeader}
                          onCheckedChange={(checked) => updateHeaders({ showVersionInHeader: checked })}
                        />
                        <Label className="text-sm">Show Version</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={localSettings.headers.showSectionName}
                          onCheckedChange={(checked) => updateHeaders({ showSectionName: checked })}
                        />
                        <Label className="text-sm">Show Section</Label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Alternating Headers</Label>
                        <p className="text-xs text-muted-foreground">Different for odd/even pages</p>
                      </div>
                      <Switch
                        checked={localSettings.headers.useAlternatingHeaders}
                        onCheckedChange={(checked) => updateHeaders({ useAlternatingHeaders: checked })}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={localSettings.headers.showHeaderAccentLine}
                        onCheckedChange={(checked) => updateHeaders({ showHeaderAccentLine: checked })}
                      />
                      <Label className="text-sm">Header Accent Line</Label>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label>Include Footers</Label>
                    <p className="text-sm text-muted-foreground">Show footer on each page</p>
                  </div>
                  <Switch
                    checked={localSettings.headers.includeFooters}
                    onCheckedChange={(checked) => updateHeaders({ includeFooters: checked })}
                  />
                </div>

                {localSettings.headers.includeFooters && (
                  <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                    <div>
                      <Label>Footer Content</Label>
                      <Input
                        value={localSettings.headers.footerContent}
                        onChange={(e) => updateHeaders({ footerContent: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={localSettings.headers.showDocumentId}
                          onCheckedChange={(checked) => updateHeaders({ showDocumentId: checked })}
                        />
                        <Label className="text-sm">Document ID</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={localSettings.headers.showPrintDate}
                          onCheckedChange={(checked) => updateHeaders({ showPrintDate: checked })}
                        />
                        <Label className="text-sm">Print Date</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={localSettings.headers.showCopyright}
                          onCheckedChange={(checked) => updateHeaders({ showCopyright: checked })}
                        />
                        <Label className="text-sm">Copyright</Label>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={localSettings.headers.showFooterAccentLine}
                        onCheckedChange={(checked) => updateHeaders({ showFooterAccentLine: checked })}
                      />
                      <Label className="text-sm">Footer Accent Line</Label>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label>Page Numbers</Label>
                    <p className="text-sm text-muted-foreground">Show page numbers</p>
                  </div>
                  <Switch
                    checked={localSettings.headers.includePageNumbers}
                    onCheckedChange={(checked) => updateHeaders({ includePageNumbers: checked })}
                  />
                </div>

                {localSettings.headers.includePageNumbers && (
                  <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                    <div>
                      <Label>Position</Label>
                      <Select
                        value={localSettings.headers.pageNumberPosition}
                        onValueChange={(value) => updateHeaders({ pageNumberPosition: value as 'left' | 'center' | 'right' })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Format</Label>
                      <Select
                        value={localSettings.headers.pageNumberFormat}
                        onValueChange={(value) => updateHeaders({ pageNumberFormat: value as 'simple' | 'pageOf' | 'pageOfTotal' })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">1, 2, 3...</SelectItem>
                          <SelectItem value="pageOf">Page 1, Page 2...</SelectItem>
                          <SelectItem value="pageOfTotal">Page 1 of 10</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Sections Tab */}
              <TabsContent value="sections" className="space-y-4 mt-0">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Front Matter</p>
                  <div className="flex items-center justify-between pl-4">
                    <Label>Table of Contents</Label>
                    <Switch
                      checked={localSettings.sections.includeTableOfContents}
                      onCheckedChange={(checked) => updateSections({ includeTableOfContents: checked })}
                    />
                  </div>
                  {localSettings.sections.includeTableOfContents && (
                    <div className="pl-8">
                      <Label className="text-sm">TOC Depth</Label>
                      <Select
                        value={String(localSettings.sections.tocDepth)}
                        onValueChange={(value) => updateSections({ tocDepth: Number(value) as 1 | 2 | 3 })}
                      >
                        <SelectTrigger className="mt-1 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Acts only</SelectItem>
                          <SelectItem value="2">Acts + Modules</SelectItem>
                          <SelectItem value="3">All levels</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <p className="text-sm font-medium">Content Sections</p>
                  {[
                    { key: 'includeExecutiveOverview', label: 'Executive Overview' },
                    { key: 'includePlatformAtGlance', label: 'Platform at a Glance' },
                    { key: 'includeModuleIntegration', label: 'Module Integration Diagram' },
                    { key: 'includeActDividers', label: 'Act Divider Pages' },
                    { key: 'includeModuleDetails', label: 'Module Detail Pages' },
                    { key: 'includeCrossCutting', label: 'Cross-Cutting Capabilities' },
                    { key: 'includeDependencyAnalysis', label: 'Dependency Analysis' },
                    { key: 'includeGettingStarted', label: 'Getting Started' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between pl-4">
                      <Label>{label}</Label>
                      <Switch
                        checked={localSettings.sections[key as keyof typeof localSettings.sections] as boolean}
                        onCheckedChange={(checked) => updateSections({ [key]: checked })}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <p className="text-sm font-medium">Back Matter</p>
                  {[
                    { key: 'includeModuleIndex', label: 'Module Index' },
                    { key: 'includeGlossary', label: 'Glossary of Terms' },
                    { key: 'includeQuickReference', label: 'Quick Reference Card' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between pl-4">
                      <Label>{label}</Label>
                      <Switch
                        checked={localSettings.sections[key as keyof typeof localSettings.sections] as boolean}
                        onCheckedChange={(checked) => updateSections({ [key]: checked })}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <p className="text-sm font-medium">Formatting</p>
                  <div className="flex items-center justify-between pl-4">
                    <div>
                      <Label>Chapter Starts New Page</Label>
                      <p className="text-xs text-muted-foreground">Each Act on new page</p>
                    </div>
                    <Switch
                      checked={localSettings.sections.chapterStartsNewPage}
                      onCheckedChange={(checked) => updateSections({ chapterStartsNewPage: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between pl-4">
                    <div>
                      <Label>Module Starts New Page</Label>
                      <p className="text-xs text-muted-foreground">Each module on new page</p>
                    </div>
                    <Switch
                      checked={localSettings.sections.moduleStartsNewPage}
                      onCheckedChange={(checked) => updateSections({ moduleStartsNewPage: checked })}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Layout Tab */}
              <TabsContent value="layout" className="space-y-4 mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Page Size</Label>
                    <Select
                      value={localSettings.layout.pageSize}
                      onValueChange={(value) => updateLayout({ pageSize: value as 'A4' | 'Letter' | 'Legal' })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4 (210 × 297 mm)</SelectItem>
                        <SelectItem value="Letter">Letter (8.5 × 11 in)</SelectItem>
                        <SelectItem value="Legal">Legal (8.5 × 14 in)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Orientation</Label>
                    <Select
                      value={localSettings.layout.orientation}
                      onValueChange={(value) => updateLayout({ orientation: value as 'portrait' | 'landscape' })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Margins (mm)</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Top</Label>
                      <Input
                        type="number"
                        value={localSettings.layout.margins.top}
                        onChange={(e) => updateLayout({ 
                          margins: { ...localSettings.layout.margins, top: Number(e.target.value) } 
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Bottom</Label>
                      <Input
                        type="number"
                        value={localSettings.layout.margins.bottom}
                        onChange={(e) => updateLayout({ 
                          margins: { ...localSettings.layout.margins, bottom: Number(e.target.value) } 
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Left</Label>
                      <Input
                        type="number"
                        value={localSettings.layout.margins.left}
                        onChange={(e) => updateLayout({ 
                          margins: { ...localSettings.layout.margins, left: Number(e.target.value) } 
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Right</Label>
                      <Input
                        type="number"
                        value={localSettings.layout.margins.right}
                        onChange={(e) => updateLayout({ 
                          margins: { ...localSettings.layout.margins, right: Number(e.target.value) } 
                        })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Branding Tab */}
              <TabsContent value="branding" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Apply Brand Colors</Label>
                    <p className="text-sm text-muted-foreground">Use company brand colors</p>
                  </div>
                  <Switch
                    checked={localSettings.branding.applyBrandColors}
                    onCheckedChange={(checked) => updateBranding({ applyBrandColors: checked })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Primary Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={localSettings.branding.primaryColor}
                        onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                        className="w-12 h-9 p-1"
                      />
                      <Input
                        value={localSettings.branding.primaryColor}
                        onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={localSettings.branding.secondaryColor}
                        onChange={(e) => updateBranding({ secondaryColor: e.target.value })}
                        className="w-12 h-9 p-1"
                      />
                      <Input
                        value={localSettings.branding.secondaryColor}
                        onChange={(e) => updateBranding({ secondaryColor: e.target.value })}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Accent Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={localSettings.branding.accentColor}
                        onChange={(e) => updateBranding({ accentColor: e.target.value })}
                        className="w-12 h-9 p-1"
                      />
                      <Input
                        value={localSettings.branding.accentColor}
                        onChange={(e) => updateBranding({ accentColor: e.target.value })}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label>Use Act Colors</Label>
                    <p className="text-sm text-muted-foreground">Color-code each Act section</p>
                  </div>
                  <Switch
                    checked={localSettings.branding.useActColors}
                    onCheckedChange={(checked) => updateBranding({ useActColors: checked })}
                  />
                </div>

                <div className="pt-4 border-t">
                  <Label>Copyright Information</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Copyright Holder</Label>
                      <Input
                        value={localSettings.document.copyrightHolder}
                        onChange={(e) => updateDocument({ copyrightHolder: e.target.value })}
                        placeholder="Company Name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Copyright Year</Label>
                      <Input
                        value={localSettings.document.copyrightYear}
                        onChange={(e) => updateDocument({ copyrightYear: e.target.value })}
                        placeholder="2026"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Label>Disclaimer Text</Label>
                  <Textarea
                    value={localSettings.document.disclaimerText}
                    onChange={(e) => updateDocument({ disclaimerText: e.target.value })}
                    className="mt-1 min-h-[80px]"
                    placeholder="The information in this document..."
                  />
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
