import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ManualPrintSettings } from "@/hooks/useManualPrintSettings";
import { BrandColors } from "@/hooks/useEnablementBranding";
import { CoverPage } from "./CoverPage";
import { TableOfContents } from "./TableOfContents";
import { PrintHeader } from "./PrintHeader";
import { PrintFooter } from "./PrintFooter";
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

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF(settings.layout.orientation === 'landscape' ? 'l' : 'p', 'mm', settings.layout.pageSize.toLowerCase() as 'a4' | 'letter' | 'legal');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = settings.layout.margins;
      const contentWidth = pageWidth - margin.left - margin.right;
      let yPosition = margin.top;
      let pageNumber = 0;

      const addNewPageIfNeeded = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin.bottom) {
          pdf.addPage();
          pageNumber++;
          yPosition = margin.top;
          
          // Add header
          if (settings.sections.includeHeaders && settings.branding.headerStyle !== 'none') {
            pdf.setFontSize(9);
            pdf.setTextColor(100);
            pdf.text(settings.sections.headerContent, margin.left, 12);
            yPosition = margin.top + 5;
          }
        }
      };

      // Cover page
      if (settings.sections.includeCover) {
        pageNumber++;
        pdf.setFillColor(parseInt(brandColors.primaryColor.slice(1, 3), 16), parseInt(brandColors.primaryColor.slice(3, 5), 16), parseInt(brandColors.primaryColor.slice(5, 7), 16));
        
        if (settings.branding.coverStyle === 'branded') {
          pdf.rect(0, 0, pageWidth, pageHeight, 'F');
          pdf.setTextColor(255, 255, 255);
        } else {
          pdf.setTextColor(parseInt(brandColors.primaryColor.slice(1, 3), 16), parseInt(brandColors.primaryColor.slice(3, 5), 16), parseInt(brandColors.primaryColor.slice(5, 7), 16));
        }

        pdf.setFontSize(14);
        pdf.text(brandColors.companyName, pageWidth / 2, pageHeight / 3, { align: 'center' });
        
        pdf.setFontSize(28);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Appraisals Administrator', pageWidth / 2, pageHeight / 2 - 5, { align: 'center' });
        pdf.text('Manual', pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Version 1.3.0 | ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 30, { align: 'center' });
        
        pdf.addPage();
        pageNumber++;
        yPosition = margin.top;
      }

      // Table of Contents
      if (settings.sections.includeTableOfContents) {
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Table of Contents', margin.left, yPosition);
        yPosition += 15;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        
        const tocItems = [
          '1. Module Overview & Conceptual Foundation',
          '2. Setup & Configuration Guide',
          '3. Operational Workflows',
          '4. Calibration & Quality Management',
          '5. AI-Assisted Features',
          '6. Analytics & Reporting',
          '7. Cross-Module Integration',
          '8. Troubleshooting & Support'
        ];

        tocItems.forEach((item, idx) => {
          pdf.text(item, margin.left, yPosition);
          yPosition += 8;
        });

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

      parts.forEach((part) => {
        // Part header
        addNewPageIfNeeded(25);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(parseInt(brandColors.primaryColor.slice(1, 3), 16), parseInt(brandColors.primaryColor.slice(3, 5), 16), parseInt(brandColors.primaryColor.slice(5, 7), 16));
        pdf.text(part.title, margin.left, yPosition);
        yPosition += 12;
        pdf.setTextColor(0, 0, 0);

        // Sections
        part.sections.forEach((section) => {
          addNewPageIfNeeded(20);

          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(section.title, margin.left, yPosition);
          yPosition += 7;

          pdf.setFontSize(settings.formatting.baseFontSize);
          pdf.setFont('helvetica', 'normal');

          section.content.forEach((line) => {
            const lines = pdf.splitTextToSize(line, contentWidth);
            addNewPageIfNeeded(lines.length * 5);
            pdf.text(lines, margin.left, yPosition);
            yPosition += lines.length * 5 * settings.formatting.lineHeight;
          });

          yPosition += 5;
        });

        yPosition += 10;
      });

      // Add page numbers if enabled
      if (settings.sections.includePageNumbers) {
        const totalPgs = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPgs; i++) {
          pdf.setPage(i);
          pdf.setFontSize(9);
          pdf.setTextColor(100);
          
          let pageText = '';
          switch (settings.sections.pageNumberFormat) {
            case 'simple':
              pageText = String(i);
              break;
            case 'pageOf':
              pageText = `Page ${i}`;
              break;
            case 'pageOfTotal':
              pageText = `Page ${i} of ${totalPgs}`;
              break;
          }

          const xPos = settings.sections.pageNumberPosition === 'left' 
            ? margin.left 
            : settings.sections.pageNumberPosition === 'center'
            ? pageWidth / 2
            : pageWidth - margin.right;
          
          const align = settings.sections.pageNumberPosition === 'left' 
            ? 'left' 
            : settings.sections.pageNumberPosition === 'center'
            ? 'center'
            : 'right';

          pdf.text(pageText, xPos, pageHeight - 10, { align: align as 'left' | 'center' | 'right' });

          // Footer content
          if (settings.sections.includeFooters && i > (settings.sections.includeCover ? 1 : 0)) {
            pdf.text(settings.sections.footerContent, margin.left, pageHeight - 10);
          }
        }
      }

      const date = new Date().toISOString().split('T')[0];
      pdf.save(`appraisals-admin-manual-${date}.pdf`);

      toast({
        title: "PDF exported successfully",
        description: "The manual has been downloaded with your print settings applied.",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
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
            className="print-preview-content mx-auto space-y-8"
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              width: settings.layout.pageSize === 'A4' ? '210mm' : '8.5in'
            }}
          >
            {/* Cover Page */}
            {settings.sections.includeCover && (
              <div className="bg-white shadow-lg rounded overflow-hidden" style={{ aspectRatio: '210/297' }}>
                <CoverPage
                  title="Appraisals Administrator Manual"
                  subtitle="Comprehensive guide for Performance Appraisals configuration and management"
                  version="1.3.0"
                  date={new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  companyName={brandColors.companyName}
                  style={settings.branding.coverStyle}
                  brandColors={brandColors}
                />
              </div>
            )}

            {/* Table of Contents */}
            {settings.sections.includeTableOfContents && (
              <div className="bg-white shadow-lg rounded overflow-hidden" style={{ minHeight: '297mm' }}>
                {settings.sections.includeHeaders && (
                  <PrintHeader 
                    content={settings.sections.headerContent}
                    style={settings.branding.headerStyle}
                    brandColors={brandColors}
                  />
                )}
                <TableOfContents
                  brandColors={brandColors}
                  depth={settings.sections.tocDepth}
                  showPageNumbers={settings.sections.includePageNumbers}
                />
                {settings.sections.includeFooters && (
                  <PrintFooter
                    content={settings.sections.footerContent}
                    pageNumber={2}
                    totalPages={totalPages}
                    position={settings.sections.pageNumberPosition}
                    format={settings.sections.pageNumberFormat}
                    brandColors={brandColors}
                  />
                )}
              </div>
            )}

            {/* Sample Content Page */}
            <div className="bg-white shadow-lg rounded overflow-hidden flex flex-col" style={{ minHeight: '297mm' }}>
              {settings.sections.includeHeaders && (
                <PrintHeader 
                  content={settings.sections.headerContent}
                  style={settings.branding.headerStyle}
                  brandColors={brandColors}
                  sectionTitle="1. Module Overview"
                />
              )}
              
              <div className="flex-1 p-12">
                <h2 
                  className="text-2xl font-bold mb-6"
                  style={{ color: brandColors.primaryColor }}
                >
                  1. Module Overview & Conceptual Foundation
                </h2>
                
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-lg font-semibold mb-3">1.1 Introduction to Appraisals in HRplus</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    The HRplus Performance Appraisals module is a comprehensive, enterprise-grade solution designed to manage the complete performance evaluation lifecycle. This module integrates seamlessly with other HRplus components to create an intelligent talent management ecosystem.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Built with AI-first principles, the module provides predictive insights, prescriptive recommendations, and automated actions to reduce administrative burden while improving evaluation quality and objectivity.
                  </p>
                  
                  <h3 className="text-lg font-semibold mb-3 mt-6">Key Features</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Multi-dimensional evaluation using the CRGV model (Competencies, Responsibilities, Goals, Values)</li>
                    <li>Configurable rating scales and weighting systems</li>
                    <li>AI-assisted narrative generation and calibration</li>
                    <li>360-degree feedback integration</li>
                    <li>Automatic downstream actions (PIP, IDP, Succession)</li>
                  </ul>
                </div>
              </div>

              {settings.sections.includeFooters && (
                <PrintFooter
                  content={settings.sections.footerContent}
                  pageNumber={3}
                  totalPages={totalPages}
                  position={settings.sections.pageNumberPosition}
                  format={settings.sections.pageNumberFormat}
                  brandColors={brandColors}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
