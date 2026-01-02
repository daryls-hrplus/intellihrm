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
import { BrandColors, useEnablementBranding } from "@/hooks/useEnablementBranding";
import { FileText, Layout, Type, Palette, BookOpen, FileCode, Droplets } from "lucide-react";
import { LogoUpload } from "./LogoUpload";

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
  const { saveBrandColors } = useEnablementBranding();
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
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="cover" className="text-xs gap-1">
              <BookOpen className="h-3 w-3" />
              Cover
            </TabsTrigger>
            <TabsTrigger value="metadata" className="text-xs gap-1">
              <FileCode className="h-3 w-3" />
              Document
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
            <TabsTrigger value="watermark" className="text-xs gap-1">
              <Droplets className="h-3 w-3" />
              Watermark
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

          {/* Document Metadata Tab - NEW */}
          <TabsContent value="metadata" className="space-y-4 mt-4">
            <div>
              <Label>Document ID</Label>
              <Input
                value={localSettings.sections.documentId}
                onChange={(e) => updateSections({ documentId: e.target.value })}
                placeholder="e.g., HRP-APR-ADM-001"
                className="mt-1 font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Unique identifier shown in headers
              </p>
            </div>

            <div>
              <Label>Effective Date</Label>
              <Input
                type="date"
                value={localSettings.sections.effectiveDate}
                onChange={(e) => updateSections({ effectiveDate: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Copyright Text</Label>
              <Input
                value={localSettings.sections.copyrightText}
                onChange={(e) => updateSections({ copyrightText: e.target.value })}
                placeholder="e.g., © 2026 Company Name. All rights reserved."
                className="mt-1"
              />
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Version in Header</Label>
                  <p className="text-sm text-muted-foreground">Display version number</p>
                </div>
                <Switch
                  checked={localSettings.sections.showVersionInHeader}
                  onCheckedChange={(checked) => updateSections({ showVersionInHeader: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Print Date</Label>
                  <p className="text-sm text-muted-foreground">Add print date to footer</p>
                </div>
                <Switch
                  checked={localSettings.sections.showPrintDate}
                  onCheckedChange={(checked) => updateSections({ showPrintDate: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Last Updated</Label>
                  <p className="text-sm text-muted-foreground">Display last update date</p>
                </div>
                <Switch
                  checked={localSettings.sections.showLastUpdated}
                  onCheckedChange={(checked) => updateSections({ showLastUpdated: checked })}
                />
              </div>
            </div>
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

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Header Accent Line</Label>
                    <p className="text-sm text-muted-foreground">Show colored line below header</p>
                  </div>
                  <Switch
                    checked={localSettings.branding.showHeaderAccentLine}
                    onCheckedChange={(checked) => updateBranding({ showHeaderAccentLine: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alternating Headers</Label>
                    <p className="text-sm text-muted-foreground">Different headers for odd/even pages</p>
                  </div>
                  <Switch
                    checked={localSettings.sections.useAlternatingHeaders}
                    onCheckedChange={(checked) => updateSections({ useAlternatingHeaders: checked })}
                  />
                </div>

                {localSettings.sections.useAlternatingHeaders && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <Label className="text-xs">Left Page Header</Label>
                      <Input
                        value={localSettings.sections.alternateHeaderLeft}
                        onChange={(e) => updateSections({ alternateHeaderLeft: e.target.value })}
                        placeholder="Left page content"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Right Page Header</Label>
                      <Input
                        value={localSettings.sections.alternateHeaderRight}
                        onChange={(e) => updateSections({ alternateHeaderRight: e.target.value })}
                        placeholder="Right page content"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
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
              <div className="space-y-3">
                <div>
                  <Label>Footer Content</Label>
                  <Input
                    value={localSettings.sections.footerContent}
                    onChange={(e) => updateSections({ footerContent: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Footer Style</Label>
                  <Select
                    value={localSettings.branding.footerStyle}
                    onValueChange={(value) => updateBranding({ footerStyle: value as 'branded' | 'simple' })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="branded">Branded - With accent colors</SelectItem>
                      <SelectItem value="simple">Simple - Minimal style</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bottom Accent Line</Label>
                    <p className="text-sm text-muted-foreground">Show colored line above footer</p>
                  </div>
                  <Switch
                    checked={localSettings.branding.showBottomBorderAccent}
                    onCheckedChange={(checked) => updateBranding({ showBottomBorderAccent: checked })}
                  />
                </div>
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

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Include Revision History</Label>
                <p className="text-sm text-muted-foreground">Add revision history page after TOC</p>
              </div>
              <Switch
                checked={localSettings.sections.includeRevisionHistory}
                onCheckedChange={(checked) => updateSections({ includeRevisionHistory: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Chapter Starts New Page</Label>
                <p className="text-sm text-muted-foreground">Each chapter begins on a new page</p>
              </div>
              <Switch
                checked={localSettings.sections.chapterStartsNewPage}
                onCheckedChange={(checked) => updateSections({ chapterStartsNewPage: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Section Dividers</Label>
                <p className="text-sm text-muted-foreground">Add lines between sections</p>
              </div>
              <Switch
                checked={localSettings.sections.includeSectionDividers}
                onCheckedChange={(checked) => updateSections({ includeSectionDividers: checked })}
              />
            </div>
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
              <Label>Font Family</Label>
              <Select
                value={localSettings.formatting.fontFamily}
                onValueChange={(value) => updateFormatting({ fontFamily: value as 'Inter' | 'Arial' | 'Times New Roman' | 'Georgia' })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter (Modern)</SelectItem>
                  <SelectItem value="Arial">Arial (Classic)</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman (Traditional)</SelectItem>
                  <SelectItem value="Georgia">Georgia (Elegant)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Heading Font Family</Label>
              <Select
                value={localSettings.formatting.headingFontFamily}
                onValueChange={(value) => updateFormatting({ headingFontFamily: value as 'inherit' | 'Georgia' | 'Arial' })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inherit">Same as body</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Arial">Arial</SelectItem>
                </SelectContent>
              </Select>
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

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Colored Bullets</Label>
                <p className="text-sm text-muted-foreground">Use brand color for bullet points</p>
              </div>
              <Switch
                checked={localSettings.formatting.showBulletColors}
                onCheckedChange={(checked) => updateFormatting({ showBulletColors: checked })}
              />
            </div>

            <div>
              <Label>Callout Box Style</Label>
              <Select
                value={localSettings.formatting.calloutStyle}
                onValueChange={(value) => updateFormatting({ calloutStyle: value as 'boxed' | 'bordered' | 'highlighted' })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boxed">Boxed - Full background</SelectItem>
                  <SelectItem value="bordered">Bordered - Left accent</SelectItem>
                  <SelectItem value="highlighted">Highlighted - Subtle tint</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-4 mt-4">
            <LogoUpload 
              logoUrl={brandColors.logoUrl}
              onLogoChange={(url) => {
                saveBrandColors.mutate({
                  ...brandColors,
                  logoUrl: url
                });
              }}
            />

            <div className="flex items-center justify-between pt-4 border-t">
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

          {/* Watermark Tab - NEW */}
          <TabsContent value="watermark" className="space-y-4 mt-4">
            <div>
              <Label>Watermark Text</Label>
              <Input
                value={localSettings.branding.watermarkText}
                onChange={(e) => updateBranding({ watermarkText: e.target.value })}
                placeholder="e.g., DRAFT, CONFIDENTIAL"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty for no watermark
              </p>
            </div>

            {localSettings.branding.watermarkText && (
              <div>
                <Label>Watermark Opacity: {Math.round(localSettings.branding.watermarkOpacity * 100)}%</Label>
                <Slider
                  value={[localSettings.branding.watermarkOpacity * 100]}
                  onValueChange={([value]) => updateBranding({ watermarkOpacity: value / 100 })}
                  min={3}
                  max={20}
                  step={1}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower values are more subtle
                </p>
              </div>
            )}

            {/* Preview */}
            {localSettings.branding.watermarkText && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <div className="aspect-[3/4] rounded border bg-white relative overflow-hidden max-h-32 flex items-center justify-center">
                    <span
                      className="text-2xl font-bold uppercase"
                      style={{
                        color: '#888888',
                        opacity: localSettings.branding.watermarkOpacity,
                        transform: 'rotate(-45deg)',
                      }}
                    >
                      {localSettings.branding.watermarkText}
                    </span>
                    <div className="absolute inset-4 border border-dashed border-muted-foreground/20 rounded">
                      <div className="h-2 bg-muted-foreground/10 m-2 rounded" />
                      <div className="h-2 bg-muted-foreground/10 m-2 rounded w-3/4" />
                    </div>
                  </div>
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
