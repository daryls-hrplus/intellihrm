import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ManualPrintSettings } from "@/hooks/useManualPrintSettings";
import { BrandColors } from "@/hooks/useEnablementBranding";
import { CoverPage } from "./CoverPage";
import { TableOfContents } from "./TableOfContents";
import { PrintHeader } from "./PrintHeader";
import { PrintFooter } from "./PrintFooter";
import { RevisionHistory } from "./RevisionHistory";
import { Watermark } from "./Watermark";
import { ChapterTitlePage } from "./ChapterTitlePage";
import { X, ZoomIn, ZoomOut, Printer, Settings, ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import { MANUAL_CONTENT } from "@/utils/appraisalsManualDocx";
import { toast } from "@/hooks/use-toast";

interface ManualPrintPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ManualPrintSettings;
  brandColors: BrandColors;
  onConfigureClick: () => void;
  totalReadTime: number;
}

const ZOOM_LEVELS = [50, 75, 100, 125, 150];

export function ManualPrintPreview({
  open,
  onOpenChange,
  settings,
  brandColors,
  onConfigureClick,
  totalReadTime
}: ManualPrintPreviewProps) {
  const [zoom, setZoom] = useState(75);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Calculate total pages based on content
  const calculateTotalPages = () => {
    let pages = 0;
    if (settings.sections.includeCover) pages += 1;
    if (settings.sections.includeTableOfContents) pages += 1;
    if (settings.sections.includeRevisionHistory) pages += 1;
    // Estimate ~2 pages per 10 min read time
    pages += Math.ceil(totalReadTime / 5);
    // Add appendices
    pages += 8; // Quick ref, diagrams, glossary, version history
    return pages;
  };

  const totalPages = calculateTotalPages();

  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    
    // Create a print-specific stylesheet
    const style = document.createElement('style');
    style.id = 'print-styles';
    style.textContent = `
      @media print {
        body * { visibility: hidden; }
        .print-preview-content, .print-preview-content * { visibility: visible; }
        .print-preview-content { 
          position: absolute; 
          left: 0; 
          top: 0;
          width: 100%;
        }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
      window.print();
      document.getElementById('print-styles')?.remove();
      setIsPrinting(false);
    }, 100);
  };

  // Helper to parse hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : { r: 0, g: 0, b: 0 };
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF(
        settings.layout.orientation === 'landscape' ? 'l' : 'p',
        'mm',
        settings.layout.pageSize.toLowerCase() as 'a4' | 'letter' | 'legal'
      );
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = settings.layout.margins;
      const contentWidth = pageWidth - margin.left - margin.right;
      let yPosition = margin.top;
      let pageNumber = 0;

      const primaryRgb = hexToRgb(brandColors.primaryColor);
      const secondaryRgb = hexToRgb(brandColors.secondaryColor);

      // Get font family for PDF
      const getFontFamily = () => {
        switch (settings.formatting.fontFamily) {
          case 'Times New Roman':
            return 'times';
          case 'Georgia':
            return 'times';
          default:
            return 'helvetica';
        }
      };

      const fontFamily = getFontFamily();

      const addHeader = (isOddPage: boolean = true, sectionTitle?: string) => {
        if (settings.sections.includeHeaders && settings.branding.headerStyle !== 'none') {
          const headerContent = settings.sections.useAlternatingHeaders
            ? (isOddPage ? (settings.sections.alternateHeaderRight || settings.sections.headerContent) : (settings.sections.alternateHeaderLeft || settings.sections.headerContent))
            : settings.sections.headerContent;

          if (settings.branding.headerStyle === 'branded') {
            pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
            pdf.rect(0, 0, pageWidth, 12, 'F');
            pdf.setTextColor(255, 255, 255);
          } else {
            pdf.setTextColor(100, 100, 100);
          }
          pdf.setFont(fontFamily, 'normal');
          pdf.setFontSize(9);
          
          // Header content
          pdf.text(headerContent, margin.left, 8);
          
          // Document ID if set
          if (settings.sections.documentId) {
            pdf.setFontSize(7);
            pdf.text(settings.sections.documentId, margin.left, 11);
          }
          
          // Version in header
          if (settings.sections.showVersionInHeader) {
            pdf.setFontSize(8);
            pdf.text('v1.3.0', pageWidth - margin.right, 8, { align: 'right' });
          }
          
          // Section title
          if (sectionTitle) {
            pdf.setFontSize(8);
            pdf.text(sectionTitle, pageWidth / 2, 8, { align: 'center' });
          }
          
          pdf.setTextColor(0, 0, 0);
          
          // Accent line
          if (settings.branding.showHeaderAccentLine && settings.branding.headerStyle === 'branded') {
            pdf.setFillColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
            pdf.rect(0, 12, pageWidth, 1, 'F');
          }
        }
      };

      const addWatermark = () => {
        if (settings.branding.watermarkText) {
          pdf.setFont(fontFamily, 'bold');
          pdf.setFontSize(60);
          pdf.setTextColor(150, 150, 150);
          
          // Save graphics state
          const currentOpacity = settings.branding.watermarkOpacity;
          
          // Add watermark text diagonally
          pdf.saveGraphicsState();
          pdf.setGState(pdf.GState({ opacity: currentOpacity }));
          
          // Rotate and position watermark
          const centerX = pageWidth / 2;
          const centerY = pageHeight / 2;
          
          pdf.text(settings.branding.watermarkText.toUpperCase(), centerX, centerY, {
            align: 'center',
            angle: 45
          });
          
          pdf.restoreGraphicsState();
          pdf.setTextColor(0, 0, 0);
        }
      };

      const addNewPageIfNeeded = (requiredSpace: number, sectionTitle?: string) => {
        if (yPosition + requiredSpace > pageHeight - margin.bottom) {
          pdf.addPage();
          pageNumber++;
          yPosition = margin.top;
          addHeader(pageNumber % 2 === 1, sectionTitle);
          addWatermark();
          if (settings.sections.includeHeaders && settings.branding.headerStyle !== 'none') {
            yPosition = margin.top + 8;
          }
        }
      };

      // Cover page
      if (settings.sections.includeCover) {
        pageNumber++;

        if (settings.branding.coverStyle === 'branded') {
          // Full color background
          pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');
          pdf.setTextColor(255, 255, 255);
        } else if (settings.branding.coverStyle === 'corporate') {
          // White background with colored bands
          pdf.setFillColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
          pdf.rect(0, 0, pageWidth, 30, 'F');
          pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
          pdf.rect(0, pageHeight - 25, pageWidth, 25, 'F');
          pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        } else {
          // Minimal - white with accent line
          pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
          pdf.setLineWidth(2);
          pdf.line(margin.left, pageHeight / 2 + 30, pageWidth - margin.right, pageHeight / 2 + 30);
          pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        }

        pdf.setFont(fontFamily, 'normal');
        pdf.setFontSize(14);
        pdf.text(brandColors.companyName, pageWidth / 2, pageHeight / 3, { align: 'center' });

        pdf.setFontSize(28);
        pdf.setFont(fontFamily, 'bold');
        pdf.text('Appraisals Administrator', pageWidth / 2, pageHeight / 2 - 5, { align: 'center' });
        pdf.text('Manual', pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });

        pdf.setFontSize(10);
        pdf.setFont(fontFamily, 'normal');
        const versionY = settings.branding.coverStyle === 'corporate' ? pageHeight - 35 : pageHeight - 30;
        if (settings.branding.coverStyle === 'corporate') {
          pdf.setTextColor(255, 255, 255);
        }
        
        let versionText = `Version 1.3.0 | ${new Date().toLocaleDateString()}`;
        if (settings.sections.documentId) {
          versionText = `${settings.sections.documentId} | ${versionText}`;
        }
        pdf.text(versionText, pageWidth / 2, versionY, { align: 'center' });

        pdf.addPage();
        pageNumber++;
        yPosition = margin.top;
      }

      // Table of Contents
      if (settings.sections.includeTableOfContents) {
        addHeader(pageNumber % 2 === 1);
        addWatermark();
        if (settings.sections.includeHeaders && settings.branding.headerStyle !== 'none') {
          yPosition = margin.top + 8;
        }

        pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.setFontSize(18);
        pdf.setFont(fontFamily, 'bold');
        pdf.text('Table of Contents', margin.left, yPosition);
        yPosition += 15;

        pdf.setFontSize(10);
        pdf.setFont(fontFamily, 'normal');
        pdf.setTextColor(0, 0, 0);

        const tocItems = [
          { title: '1. Module Overview & Conceptual Foundation', page: 3 },
          { title: '2. Setup & Configuration Guide', page: 8 },
          { title: '3. Operational Workflows', page: 15 },
          { title: '4. Calibration & Quality Management', page: 22 },
          { title: '5. AI-Assisted Features', page: 28 },
          { title: '6. Analytics & Reporting', page: 34 },
          { title: '7. Cross-Module Integration', page: 40 },
          { title: '8. Troubleshooting & Support', page: 45 },
        ];

        tocItems.forEach((item) => {
          const dotLeader = '.'.repeat(Math.max(0, 60 - item.title.length));
          pdf.text(item.title, margin.left, yPosition);
          if (settings.sections.includePageNumbers) {
            pdf.text(`${dotLeader} ${item.page}`, margin.left + 80, yPosition);
          }
          yPosition += 8;
        });

        pdf.addPage();
        pageNumber++;
        yPosition = margin.top;
      }

      // Revision History page
      if (settings.sections.includeRevisionHistory) {
        addHeader(pageNumber % 2 === 1);
        addWatermark();
        if (settings.sections.includeHeaders && settings.branding.headerStyle !== 'none') {
          yPosition = margin.top + 8;
        }

        pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.setFontSize(18);
        pdf.setFont(fontFamily, 'bold');
        pdf.text('Revision History', margin.left, yPosition);
        yPosition += 12;

        if (settings.sections.documentId) {
          pdf.setFontSize(9);
          pdf.setFont(fontFamily, 'normal');
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Document ID: ${settings.sections.documentId}`, margin.left, yPosition);
          yPosition += 8;
        }

        // Table headers
        pdf.setFontSize(10);
        pdf.setFont(fontFamily, 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text('Version', margin.left, yPosition);
        pdf.text('Date', margin.left + 25, yPosition);
        pdf.text('Author', margin.left + 55, yPosition);
        pdf.text('Description', margin.left + 90, yPosition);
        yPosition += 5;
        
        // Divider line
        pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.setLineWidth(0.5);
        pdf.line(margin.left, yPosition, pageWidth - margin.right, yPosition);
        yPosition += 5;

        // Revision entries
        const revisions = [
          { version: '1.3.0', date: '2026-01-02', author: 'System', description: 'Added AI-assisted features documentation' },
          { version: '1.2.0', date: '2025-11-15', author: 'System', description: 'Updated calibration workflows' },
          { version: '1.1.0', date: '2025-09-01', author: 'System', description: 'Added cross-module integration' },
          { version: '1.0.0', date: '2025-06-01', author: 'System', description: 'Initial release' },
        ];

        pdf.setFont(fontFamily, 'normal');
        pdf.setFontSize(9);
        revisions.forEach((rev) => {
          pdf.text(rev.version, margin.left, yPosition);
          pdf.text(rev.date, margin.left + 25, yPosition);
          pdf.text(rev.author, margin.left + 55, yPosition);
          pdf.text(rev.description, margin.left + 90, yPosition);
          yPosition += 6;
        });

        yPosition += 10;
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text('This document is controlled. Printed copies are uncontrolled.', margin.left, yPosition);

        pdf.addPage();
        pageNumber++;
        yPosition = margin.top;
      }

      // Content pages
      const parts = [
        MANUAL_CONTENT.part1,
        MANUAL_CONTENT.part2,
        MANUAL_CONTENT.part3,
        MANUAL_CONTENT.part4,
        MANUAL_CONTENT.part5,
        MANUAL_CONTENT.part6,
        MANUAL_CONTENT.part7,
        MANUAL_CONTENT.part8,
      ];

      pdf.setTextColor(0, 0, 0);

      parts.forEach((part, partIndex) => {
        // Chapter title page if enabled
        if (settings.sections.chapterStartsNewPage && partIndex > 0) {
          pdf.addPage();
          pageNumber++;
          
          if (settings.branding.coverStyle === 'branded') {
            pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            pdf.setTextColor(255, 255, 255);
          } else if (settings.branding.coverStyle === 'corporate') {
            pdf.setFillColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
            pdf.rect(0, 0, pageWidth, 8, 'F');
            pdf.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
            pdf.rect(0, pageHeight - 40, pageWidth, 40, 'F');
            pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
          } else {
            pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
            pdf.setLineWidth(2);
            pdf.line(margin.left, pageHeight / 2 + 20, margin.left + 40, pageHeight / 2 + 20);
            pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
          }

          pdf.setFont(fontFamily, 'normal');
          pdf.setFontSize(12);
          pdf.text(`Chapter ${partIndex + 1}`, pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
          
          pdf.setFont(fontFamily, 'bold');
          pdf.setFontSize(24);
          pdf.text(part.title.replace(/^\d+\.\s*/, ''), pageWidth / 2, pageHeight / 2, { align: 'center' });

          pdf.addPage();
          pageNumber++;
          yPosition = margin.top;
        }

        addNewPageIfNeeded(25, part.title);
        addHeader(pageNumber % 2 === 1, part.title);
        addWatermark();
        
        if (settings.sections.includeHeaders && settings.branding.headerStyle !== 'none') {
          yPosition = Math.max(yPosition, margin.top + 15);
        }

        pdf.setFont(fontFamily, 'bold');
        pdf.setFontSize(settings.formatting.headingFontSize);
        pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
        pdf.text(part.title, margin.left, yPosition);
        yPosition += 12;
        pdf.setTextColor(0, 0, 0);

        // Section divider
        if (settings.sections.includeSectionDividers) {
          pdf.setDrawColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
          pdf.setLineWidth(0.5);
          pdf.line(margin.left, yPosition - 4, margin.left + 40, yPosition - 4);
          yPosition += 4;
        }

        part.sections.forEach((section) => {
          addNewPageIfNeeded(20, part.title);

          pdf.setFontSize(12);
          pdf.setFont(fontFamily, 'bold');
          pdf.text(section.title, margin.left, yPosition);
          yPosition += 7;

          pdf.setFontSize(settings.formatting.baseFontSize);
          pdf.setFont(fontFamily, 'normal');

          section.content.forEach((line) => {
            const lines = pdf.splitTextToSize(line, contentWidth);
            addNewPageIfNeeded(lines.length * 5, part.title);
            pdf.text(lines, margin.left, yPosition);
            yPosition += lines.length * 5 * settings.formatting.lineHeight;
          });

          yPosition += 5;
        });

        yPosition += 10;
      });

      // Add page numbers and footers
      const totalPgs = pdf.getNumberOfPages();
      const skipCover = settings.sections.includeCover ? 1 : 0;

      for (let i = 1; i <= totalPgs; i++) {
        pdf.setPage(i);
        pdf.setFont(fontFamily, 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);

        // Skip page numbers on cover
        if (settings.sections.includePageNumbers && i > skipCover) {
          let pageText = '';
          switch (settings.sections.pageNumberFormat) {
            case 'simple':
              pageText = String(i - skipCover);
              break;
            case 'pageOf':
              pageText = `Page ${i - skipCover}`;
              break;
            case 'pageOfTotal':
              pageText = `Page ${i - skipCover} of ${totalPgs - skipCover}`;
              break;
          }

          const xPos =
            settings.sections.pageNumberPosition === 'left'
              ? margin.left
              : settings.sections.pageNumberPosition === 'center'
              ? pageWidth / 2
              : pageWidth - margin.right;

          const align =
            settings.sections.pageNumberPosition === 'left'
              ? 'left'
              : settings.sections.pageNumberPosition === 'center'
              ? 'center'
              : 'right';

          pdf.text(pageText, xPos, pageHeight - 10, { align: align as 'left' | 'center' | 'right' });
        }

        // Footer content
        if (settings.sections.includeFooters && i > skipCover) {
          pdf.setFontSize(8);
          
          // Bottom accent line
          if (settings.branding.showBottomBorderAccent) {
            pdf.setFillColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
            pdf.rect(0, pageHeight - 20, pageWidth, 0.5, 'F');
          }
          
          // Footer text
          pdf.text(settings.sections.footerContent, margin.left, pageHeight - 15);
          
          // Metadata line
          const metadataItems: string[] = [];
          if (settings.sections.effectiveDate) {
            metadataItems.push(`Effective: ${settings.sections.effectiveDate}`);
          }
          if (settings.sections.showLastUpdated) {
            metadataItems.push(`Updated: ${new Date().toLocaleDateString()}`);
          }
          if (settings.sections.showPrintDate) {
            metadataItems.push(`Printed: ${new Date().toLocaleDateString()}`);
          }
          
          if (metadataItems.length > 0) {
            pdf.text(metadataItems.join(' | '), margin.left, pageHeight - 11);
          }
          
          // Copyright
          if (settings.sections.copyrightText) {
            pdf.text(settings.sections.copyrightText, pageWidth - margin.right, pageHeight - 15, { align: 'right' });
          }
        }
      }

      const date = new Date().toISOString().split('T')[0];
      pdf.save(`appraisals-admin-manual-${date}.pdf`);

      toast({
        title: 'PDF exported successfully',
        description: 'The manual has been downloaded with your print settings applied.',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[95vh] p-0 gap-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50 no-print">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
            <h2 className="font-semibold">Print Preview</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom === ZOOM_LEVELS[0]}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Select value={String(zoom)} onValueChange={(v) => setZoom(Number(v))}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ZOOM_LEVELS.map((level) => (
                  <SelectItem key={level} value={String(level)}>{level}%</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[100px] text-center">
              Page {currentPage} of {totalPages}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onConfigureClick}>
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={isExporting}>
              {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </Button>
            <Button size="sm" onClick={handlePrint} disabled={isPrinting}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto bg-muted/30 p-8">
          <div 
            ref={previewRef}
            className="print-preview-content mx-auto flex flex-col items-center gap-8"
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              width: settings.layout.pageSize === 'A4' ? '210mm' : '8.5in'
            }}
          >
            {/* Cover Page */}
            {settings.sections.includeCover && (
              <div 
                className="bg-white shadow-lg rounded overflow-hidden flex-shrink-0"
                style={{ 
                  width: '210mm',
                  height: '297mm',
                  position: 'relative'
                }}
              >
                <CoverPage
                  title="Appraisals Administrator Manual"
                  subtitle="Comprehensive guide for Performance Appraisals configuration and management"
                  version="1.3.0"
                  date={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  companyName={brandColors.companyName}
                  style={settings.branding.coverStyle}
                  brandColors={brandColors}
                  logoUrl={brandColors.logoUrl}
                />
              </div>
            )}

            {/* Table of Contents */}
            {settings.sections.includeTableOfContents && (
              <div 
                className="bg-white shadow-lg rounded overflow-hidden flex flex-col flex-shrink-0"
                style={{ 
                  width: '210mm',
                  height: '297mm',
                  position: 'relative'
                }}
              >
                {settings.branding.watermarkText && (
                  <Watermark 
                    text={settings.branding.watermarkText}
                    opacity={settings.branding.watermarkOpacity}
                  />
                )}
                {settings.sections.includeHeaders && (
                  <PrintHeader 
                    content={settings.sections.headerContent}
                    style={settings.branding.headerStyle}
                    brandColors={brandColors}
                    logoUrl={brandColors.logoUrl}
                    showVersion={settings.sections.showVersionInHeader}
                    documentId={settings.sections.documentId}
                    showAccentLine={settings.branding.showHeaderAccentLine}
                  />
                )}
                <div className="flex-1 overflow-hidden">
                  <TableOfContents
                    brandColors={brandColors}
                    depth={settings.sections.tocDepth}
                    showPageNumbers={settings.sections.includePageNumbers}
                  />
                </div>
                {settings.sections.includeFooters && (
                  <PrintFooter
                    content={settings.sections.footerContent}
                    pageNumber={2}
                    totalPages={totalPages}
                    position={settings.sections.pageNumberPosition}
                    format={settings.sections.pageNumberFormat}
                    brandColors={brandColors}
                    style={settings.branding.footerStyle}
                    copyrightText={settings.sections.copyrightText}
                    showPrintDate={settings.sections.showPrintDate}
                    showLastUpdated={settings.sections.showLastUpdated}
                    effectiveDate={settings.sections.effectiveDate}
                    showBottomAccent={settings.branding.showBottomBorderAccent}
                  />
                )}
              </div>
            )}

            {/* Revision History Page */}
            {settings.sections.includeRevisionHistory && (
              <div 
                className="bg-white shadow-lg rounded overflow-hidden flex flex-col flex-shrink-0"
                style={{ 
                  width: '210mm',
                  height: '297mm',
                  position: 'relative'
                }}
              >
                {settings.branding.watermarkText && (
                  <Watermark 
                    text={settings.branding.watermarkText}
                    opacity={settings.branding.watermarkOpacity}
                  />
                )}
                {settings.sections.includeHeaders && (
                  <PrintHeader 
                    content={settings.sections.headerContent}
                    style={settings.branding.headerStyle}
                    brandColors={brandColors}
                    logoUrl={brandColors.logoUrl}
                    showVersion={settings.sections.showVersionInHeader}
                    documentId={settings.sections.documentId}
                    showAccentLine={settings.branding.showHeaderAccentLine}
                  />
                )}
                <div className="flex-1 overflow-hidden">
                  <RevisionHistory
                    brandColors={brandColors}
                    documentId={settings.sections.documentId}
                  />
                </div>
                {settings.sections.includeFooters && (
                  <PrintFooter
                    content={settings.sections.footerContent}
                    pageNumber={3}
                    totalPages={totalPages}
                    position={settings.sections.pageNumberPosition}
                    format={settings.sections.pageNumberFormat}
                    brandColors={brandColors}
                    style={settings.branding.footerStyle}
                    copyrightText={settings.sections.copyrightText}
                    showPrintDate={settings.sections.showPrintDate}
                    showLastUpdated={settings.sections.showLastUpdated}
                    effectiveDate={settings.sections.effectiveDate}
                    showBottomAccent={settings.branding.showBottomBorderAccent}
                  />
                )}
              </div>
            )}

            {/* Chapter Title Page Sample */}
            {settings.sections.chapterStartsNewPage && (
              <div 
                className="bg-white shadow-lg rounded overflow-hidden flex-shrink-0"
                style={{ 
                  width: '210mm',
                  height: '297mm',
                  position: 'relative'
                }}
              >
                <ChapterTitlePage
                  chapterNumber={1}
                  title="Module Overview & Conceptual Foundation"
                  description="Understanding the architecture and philosophy behind the HRplus Appraisals module"
                  brandColors={brandColors}
                  style={settings.branding.coverStyle}
                />
              </div>
            )}

            {/* Sample Content Page */}
            <div 
              className="bg-white shadow-lg rounded overflow-hidden flex flex-col flex-shrink-0"
              style={{ 
                width: '210mm',
                height: '297mm',
                position: 'relative'
              }}
            >
              {settings.branding.watermarkText && (
                <Watermark 
                  text={settings.branding.watermarkText}
                  opacity={settings.branding.watermarkOpacity}
                />
              )}
              {settings.sections.includeHeaders && (
                <PrintHeader 
                  content={settings.sections.headerContent}
                  style={settings.branding.headerStyle}
                  brandColors={brandColors}
                  sectionTitle="1. Module Overview"
                  logoUrl={brandColors.logoUrl}
                  showVersion={settings.sections.showVersionInHeader}
                  documentId={settings.sections.documentId}
                  showAccentLine={settings.branding.showHeaderAccentLine}
                  useAlternating={settings.sections.useAlternatingHeaders}
                  alternateContentLeft={settings.sections.alternateHeaderLeft}
                  alternateContentRight={settings.sections.alternateHeaderRight}
                />
              )}
              
              <div className="flex-1 p-12 overflow-hidden">
                <h2 
                  className="text-2xl font-bold mb-4"
                  style={{ 
                    color: brandColors.primaryColor,
                    fontFamily: settings.formatting.headingFontFamily === 'inherit' 
                      ? settings.formatting.fontFamily 
                      : settings.formatting.headingFontFamily
                  }}
                >
                  1. Module Overview & Conceptual Foundation
                </h2>
                
                {settings.sections.includeSectionDividers && (
                  <div 
                    className="h-0.5 w-16 mb-6"
                    style={{ backgroundColor: brandColors.secondaryColor }}
                  />
                )}
                
                <div 
                  className="prose prose-sm max-w-none"
                  style={{ fontFamily: settings.formatting.fontFamily }}
                >
                  <h3 className="text-lg font-semibold mb-3">1.1 Introduction to Appraisals in HRplus</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    The HRplus Performance Appraisals module is a comprehensive, enterprise-grade solution designed to manage the complete performance evaluation lifecycle. This module integrates seamlessly with other HRplus components to create an intelligent talent management ecosystem.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Built with AI-first principles, the module provides predictive insights, prescriptive recommendations, and automated actions to reduce administrative burden while improving evaluation quality and objectivity.
                  </p>
                  
                  <h3 className="text-lg font-semibold mb-3 mt-6">Key Features</h3>
                  <ul 
                    className="pl-6 space-y-2 text-muted-foreground"
                    style={{ 
                      listStyleType: settings.formatting.showBulletColors ? 'none' : 'disc',
                    }}
                  >
                    {['Multi-dimensional evaluation using the CRGV model', 'Configurable rating scales and weighting systems', 'AI-assisted narrative generation and calibration', '360-degree feedback integration', 'Automatic downstream actions (PIP, IDP, Succession)'].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        {settings.formatting.showBulletColors && (
                          <span 
                            className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                            style={{ backgroundColor: brandColors.primaryColor }}
                          />
                        )}
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {settings.sections.includeFooters && (
                <PrintFooter
                  content={settings.sections.footerContent}
                  pageNumber={4}
                  totalPages={totalPages}
                  position={settings.sections.pageNumberPosition}
                  format={settings.sections.pageNumberFormat}
                  brandColors={brandColors}
                  style={settings.branding.footerStyle}
                  copyrightText={settings.sections.copyrightText}
                  showPrintDate={settings.sections.showPrintDate}
                  showLastUpdated={settings.sections.showLastUpdated}
                  effectiveDate={settings.sections.effectiveDate}
                  showBottomAccent={settings.branding.showBottomBorderAccent}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
