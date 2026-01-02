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
import { ManualPrintSettings } from "@/hooks/useManualPrintSettings";
import { BrandColors } from "@/hooks/useEnablementBranding";
import { FileText, Layout, Type, Palette, BookOpen } from "lucide-react";

interface PrintConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ManualPrintSettings;
  brandColors: BrandColors;
  onSave: (settings: ManualPrintSettings) => void;
  isSaving?: boolean;
}

export function PrintConfigDialog({
  open,
  onOpenChange,
  settings,
  brandColors,
  onSave,
  isSaving
}: PrintConfigDialogProps) {
  const [localSettings, setLocalSettings] = useState<ManualPrintSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const updateLayout = (updates: Partial<ManualPrintSettings['layout']>) => {
    setLocalSettings(prev => ({
      ...prev,
      layout: { ...prev.layout, ...updates }
    }));
  };

  const updateSections = (updates: Partial<ManualPrintSettings['sections']>) => {
    setLocalSettings(prev => ({
      ...prev,
      sections: { ...prev.sections, ...updates }
    }));
  };

  const updateFormatting = (updates: Partial<ManualPrintSettings['formatting']>) => {
    setLocalSettings(prev => ({
      ...prev,
      formatting: { ...prev.formatting, ...updates }
    }));
  };

  const updateBranding = (updates: Partial<ManualPrintSettings['branding']>) => {
    setLocalSettings(prev => ({
      ...prev,
      branding: { ...prev.branding, ...updates }
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Print Configuration</DialogTitle>
          <DialogDescription>
            Configure how the manual appears when printed or exported as PDF
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="cover" className="mt-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="cover" className="text-xs gap-1">
              <BookOpen className="h-3 w-3" />
              Cover
            </TabsTrigger>
            <TabsTrigger value="headers" className="text-xs gap-1">
              <FileText className="h-3 w-3" />
              Headers
            </TabsTrigger>
            <TabsTrigger value="toc" className="text-xs gap-1">
              <Layout className="h-3 w-3" />
              TOC
            </TabsTrigger>
            <TabsTrigger value="layout" className="text-xs gap-1">
              <Type className="h-3 w-3" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="branding" className="text-xs gap-1">
              <Palette className="h-3 w-3" />
              Branding
            </TabsTrigger>
          </TabsList>

          {/* Cover Tab */}
          <TabsContent value="cover" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Include Cover Page</Label>
                <p className="text-sm text-muted-foreground">Add a branded cover page</p>
              </div>
              <Switch
                checked={localSettings.sections.includeCover}
                onCheckedChange={(checked) => updateSections({ includeCover: checked })}
              />
            </div>

            {localSettings.sections.includeCover && (
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Cover Style</Label>
                  <Select
                    value={localSettings.branding.coverStyle}
                    onValueChange={(value) => updateBranding({ coverStyle: value as 'branded' | 'minimal' | 'corporate' })}
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

                {/* Cover preview */}
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                    <div 
                      className="aspect-[3/4] rounded border overflow-hidden"
                      style={{ 
                        backgroundColor: localSettings.branding.coverStyle === 'branded' 
                          ? brandColors.primaryColor 
                          : localSettings.branding.coverStyle === 'corporate'
                          ? '#f5f5f5'
                          : 'white',
                        maxHeight: '120px'
                      }}
                    >
                      {localSettings.branding.coverStyle === 'corporate' && (
                        <div 
                          className="h-6 w-full"
                          style={{ backgroundColor: brandColors.secondaryColor }}
                        />
                      )}
                      <div className="flex items-center justify-center h-full">
                        <span 
                          className="text-xs font-semibold"
                          style={{ 
                            color: localSettings.branding.coverStyle === 'branded' ? 'white' : brandColors.primaryColor 
                          }}
                        >
                          Manual Title
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Headers & Footers Tab */}
          <TabsContent value="headers" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Include Headers</Label>
                <p className="text-sm text-muted-foreground">Show header on each page</p>
              </div>
              <Switch
                checked={localSettings.sections.includeHeaders}
                onCheckedChange={(checked) => updateSections({ includeHeaders: checked })}
              />
            </div>

            {localSettings.sections.includeHeaders && (
              <div className="space-y-3">
                <div>
                  <Label>Header Content</Label>
                  <Input
                    value={localSettings.sections.headerContent}
                    onChange={(e) => updateSections({ headerContent: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Header Style</Label>
                  <Select
                    value={localSettings.branding.headerStyle}
                    onValueChange={(value) => updateBranding({ headerStyle: value as 'branded' | 'simple' | 'none' })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="branded">Branded - With accent color</SelectItem>
                      <SelectItem value="simple">Simple - Minimal text</SelectItem>
                      <SelectItem value="none">None - No header</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Include Footers</Label>
                <p className="text-sm text-muted-foreground">Show footer on each page</p>
              </div>
              <Switch
                checked={localSettings.sections.includeFooters}
                onCheckedChange={(checked) => updateSections({ includeFooters: checked })}
              />
            </div>

            {localSettings.sections.includeFooters && (
              <div>
                <Label>Footer Content</Label>
                <Input
                  value={localSettings.sections.footerContent}
                  onChange={(e) => updateSections({ footerContent: e.target.value })}
                  className="mt-1"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Page Numbers</Label>
                <p className="text-sm text-muted-foreground">Show page numbers</p>
              </div>
              <Switch
                checked={localSettings.sections.includePageNumbers}
                onCheckedChange={(checked) => updateSections({ includePageNumbers: checked })}
              />
            </div>

            {localSettings.sections.includePageNumbers && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Position</Label>
                  <Select
                    value={localSettings.sections.pageNumberPosition}
                    onValueChange={(value) => updateSections({ pageNumberPosition: value as 'left' | 'center' | 'right' })}
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
                    value={localSettings.sections.pageNumberFormat}
                    onValueChange={(value) => updateSections({ pageNumberFormat: value as 'simple' | 'pageOf' | 'pageOfTotal' })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">1</SelectItem>
                      <SelectItem value="pageOf">Page 1</SelectItem>
                      <SelectItem value="pageOfTotal">Page 1 of 120</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Table of Contents Tab */}
          <TabsContent value="toc" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Include Table of Contents</Label>
                <p className="text-sm text-muted-foreground">Auto-generate TOC from sections</p>
              </div>
              <Switch
                checked={localSettings.sections.includeTableOfContents}
                onCheckedChange={(checked) => updateSections({ includeTableOfContents: checked })}
              />
            </div>

            {localSettings.sections.includeTableOfContents && (
              <div className="space-y-4">
                <div>
                  <Label>TOC Depth: {localSettings.sections.tocDepth} level(s)</Label>
                  <Slider
                    value={[localSettings.sections.tocDepth]}
                    onValueChange={([value]) => updateSections({ tocDepth: value as 1 | 2 | 3 })}
                    min={1}
                    max={3}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {localSettings.sections.tocDepth === 1 && "Only main sections"}
                    {localSettings.sections.tocDepth === 2 && "Sections and subsections"}
                    {localSettings.sections.tocDepth === 3 && "All levels including sub-subsections"}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-4 mt-4">
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
              <div className="grid grid-cols-4 gap-2 mt-1">
                <div>
                  <Label className="text-xs text-muted-foreground">Top</Label>
                  <Input
                    type="number"
                    value={localSettings.layout.margins.top}
                    onChange={(e) => updateLayout({ margins: { ...localSettings.layout.margins, top: Number(e.target.value) }})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Bottom</Label>
                  <Input
                    type="number"
                    value={localSettings.layout.margins.bottom}
                    onChange={(e) => updateLayout({ margins: { ...localSettings.layout.margins, bottom: Number(e.target.value) }})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Left</Label>
                  <Input
                    type="number"
                    value={localSettings.layout.margins.left}
                    onChange={(e) => updateLayout({ margins: { ...localSettings.layout.margins, left: Number(e.target.value) }})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Right</Label>
                  <Input
                    type="number"
                    value={localSettings.layout.margins.right}
                    onChange={(e) => updateLayout({ margins: { ...localSettings.layout.margins, right: Number(e.target.value) }})}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Base Font Size: {localSettings.formatting.baseFontSize}pt</Label>
              <Slider
                value={[localSettings.formatting.baseFontSize]}
                onValueChange={([value]) => updateFormatting({ baseFontSize: value })}
                min={9}
                max={14}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Line Height: {localSettings.formatting.lineHeight}</Label>
              <Slider
                value={[localSettings.formatting.lineHeight * 10]}
                onValueChange={([value]) => updateFormatting({ lineHeight: value / 10 })}
                min={12}
                max={20}
                step={1}
                className="mt-2"
              />
            </div>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Apply Brand Colors</Label>
                <p className="text-sm text-muted-foreground">Use company colors throughout</p>
              </div>
              <Switch
                checked={localSettings.branding.applyBrandColors}
                onCheckedChange={(checked) => updateBranding({ applyBrandColors: checked })}
              />
            </div>

            {localSettings.branding.applyBrandColors && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-3">Current Brand Colors</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: brandColors.primaryColor }}
                      />
                      <div>
                        <p className="text-sm font-medium">Primary</p>
                        <p className="text-xs text-muted-foreground">{brandColors.primaryColor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: brandColors.secondaryColor }}
                      />
                      <div>
                        <p className="text-sm font-medium">Secondary</p>
                        <p className="text-xs text-muted-foreground">{brandColors.secondaryColor}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: brandColors.accentColor }}
                      />
                      <div>
                        <p className="text-sm font-medium">Accent</p>
                        <p className="text-xs text-muted-foreground">{brandColors.accentColor}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    To change these colors, go to Enablement → Templates → Brand Settings
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
