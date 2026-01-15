import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RATING_SCALE_DEFINITIONS } from "./RatingScaleLegend";

interface AppraisalPrintLayoutProps {
  children: ReactNode;
  title?: string;
  onPrint?: () => void;
  templateCode?: string;
  templateVersion?: number;
  companyName?: string;
  isPreview?: boolean;
  minRating?: number;
  maxRating?: number;
  // Employee context for headers
  employeeName?: string;
  employeePosition?: string;
  employeeDepartment?: string;
  cycleName?: string;
}

export function AppraisalPrintLayout({
  children,
  title = "Appraisal Form",
  onPrint,
  templateCode,
  templateVersion,
  companyName,
  isPreview = false,
  minRating = 1,
  maxRating = 5,
  employeeName,
  employeePosition,
  employeeDepartment,
  cycleName,
}: AppraisalPrintLayoutProps) {
  const navigate = useNavigate();

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const filteredLevels = RATING_SCALE_DEFINITIONS.filter(
    (level) => level.level >= minRating && level.level <= maxRating
  );

  return (
    <div className="min-h-screen bg-background appraisal-print-container">
      {/* Screen Header - Always visible on screen with employee context */}
      <div className="no-print sticky top-0 z-50 bg-background border-b">
        {/* Controls row */}
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <X className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{employeeName || title}</h1>
              <p className="text-sm text-muted-foreground">
                {cycleName && <span>{cycleName}</span>}
                {employeePosition && <span> • {employeePosition}</span>}
                {employeeDepartment && <span> • {employeeDepartment}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Rating scale bar */}
        <div className="px-6 py-2 border-t bg-muted/30">
          <div className="flex items-center gap-1 text-xs">
            <span className="font-medium text-muted-foreground mr-2">Rating Scale:</span>
            {filteredLevels.map((level) => (
              <span key={level.level} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background border">
                <span className={`w-2 h-2 rounded-full rating-dot-screen-${level.level}`} />
                <span className="font-medium">{level.level}</span>
                <span className="text-muted-foreground">= {level.shortLabel}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Print Content - Using table structure for repeating headers/footers */}
      <div className="print-content">
        {/* Preview Watermark */}
        {isPreview && (
          <div className="preview-watermark no-print fixed inset-0 flex items-center justify-center pointer-events-none z-10">
            <span className="text-[120px] font-bold text-muted-foreground/10 rotate-[-30deg] select-none">
              PREVIEW
            </span>
          </div>
        )}

        {/* Print Table Structure for Running Header/Footer */}
        <table className="print-page-table">
          <thead className="print-page-header">
            <tr>
              <td>
                {/* Running Header - Enhanced with employee context */}
                <div className="print-running-header">
                  {/* Row 1: Company + Document Title + Code */}
                  <div className="header-row-1">
                    <span className="company-name">{companyName || "Company"}</span>
                    <span className="doc-title">PERFORMANCE APPRAISAL</span>
                    <span className="doc-code">
                      {templateCode && `${templateCode}`}
                      {templateVersion && ` v${templateVersion}`}
                    </span>
                  </div>

                  {/* Row 2: Employee Context */}
                  <div className="header-row-2 employee-context">
                    <span><strong>Employee:</strong> {employeeName || "N/A"}</span>
                    <span className="separator">|</span>
                    <span><strong>Position:</strong> {employeePosition || "N/A"}</span>
                    <span className="separator">|</span>
                    <span><strong>Dept:</strong> {employeeDepartment || "N/A"}</span>
                  </div>

                  {/* Row 3: Cycle + Rating Scale */}
                  <div className="header-row-3">
                    <span className="cycle-name">
                      <strong>Cycle:</strong> {cycleName || "Annual Review"}
                    </span>
                    <div className="rating-legend-inline">
                      {filteredLevels.map((level) => (
                        <span key={level.level} className="rating-item">
                          <span className={`rating-dot rating-dot-${level.level}`} />
                          {level.level}={level.shortLabel}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </thead>
          <tfoot className="print-page-footer">
            <tr>
              <td>
                <div className="print-running-footer">
                  <span className="footer-left">
                    Form: {templateCode || "N/A"} v{templateVersion || "1.0"}
                  </span>
                  <span className="footer-center">
                    CONFIDENTIAL – Do Not Distribute
                  </span>
                  <span className="footer-right">
                    Page <span className="page-number" /> of <span className="page-total" />
                  </span>
                </div>
              </td>
            </tr>
          </tfoot>
          <tbody className="print-page-body">
            <tr>
              <td className="print-body-cell">
                {children}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Document Control Footer (visible on screen only) */}
        <div className="print-document-control no-print mt-8 pt-4 border-t">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>
              {templateCode && `Document: ${templateCode}`}
              {templateVersion && ` | Version: ${templateVersion}`}
            </span>
            <span>Generated: {currentDate}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 italic text-center">
            This document is confidential and intended for internal use only.
            Unauthorized disclosure or distribution is prohibited.
          </p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        /* Screen Styles */
        @media screen {
          .print-content {
            max-width: 210mm;
            margin: 0 auto;
            padding: 2rem;
            background: white;
            min-height: calc(100vh - 120px);
            position: relative;
          }
          
          .print-page-table {
            width: 100%;
          }
          
          .print-page-header,
          .print-page-footer {
            display: none;
          }
          
          .print-body-cell {
            display: block;
          }
          
          /* Screen rating dots */
          .rating-dot-screen-1 { background-color: hsl(0, 84%, 60%); }
          .rating-dot-screen-2 { background-color: hsl(25, 95%, 53%); }
          .rating-dot-screen-3 { background-color: hsl(142, 71%, 45%); }
          .rating-dot-screen-4 { background-color: hsl(217, 91%, 60%); }
          .rating-dot-screen-5 { background-color: hsl(271, 81%, 56%); }
        }
        
        /* Print Styles */
        @media print {
          .no-print {
            display: none !important;
          }
          
          .preview-watermark {
            display: none !important;
          }
          
          html, body {
            margin: 0;
            padding: 0;
          }
          
          .print-content {
            padding: 0 !important;
            max-width: none !important;
            margin: 0 !important;
          }
          
          @page {
            size: A4 portrait;
            margin: 18mm 12mm 22mm 12mm;
          }
          
          body {
            font-size: 9pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
          
          .appraisal-print-container {
            background: white !important;
          }
          
          /* Table-based header/footer for repeating on each page */
          .print-page-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .print-page-header {
            display: table-header-group;
          }
          
          .print-page-footer {
            display: table-footer-group;
          }
          
          .print-page-body {
            display: table-row-group;
          }
          
          .print-body-cell {
            display: block;
          }
          
          /* Running Header Styles - Enhanced */
          .print-running-header {
            padding-bottom: 8px;
            margin-bottom: 10px;
            border-bottom: 2px solid #1f2937;
          }
          
          .print-running-header .header-row-1 {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9pt;
            color: #1f2937;
            margin-bottom: 6px;
          }
          
          .print-running-header .company-name {
            font-weight: 700;
            font-size: 10pt;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .print-running-header .doc-title {
            font-weight: 700;
            font-size: 11pt;
            color: #111827;
            letter-spacing: 1px;
          }
          
          .print-running-header .doc-code {
            font-size: 8pt;
            color: #6b7280;
            font-family: monospace;
          }
          
          .print-running-header .header-row-2.employee-context {
            display: flex;
            justify-content: flex-start;
            gap: 16px;
            font-size: 8pt;
            color: #374151;
            padding: 4px 0;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 4px;
          }
          
          .print-running-header .header-row-2 .separator {
            color: #d1d5db;
          }
          
          .print-running-header .header-row-2 strong {
            color: #6b7280;
            font-weight: 600;
          }
          
          .print-running-header .header-row-3 {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 7pt;
            background: #f3f4f6;
            padding: 4px 10px;
            border-radius: 4px;
          }
          
          .print-running-header .cycle-name {
            color: #374151;
          }
          
          .print-running-header .cycle-name strong {
            color: #6b7280;
          }
          
          .print-running-header .rating-legend-inline {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .print-running-header .rating-item {
            display: inline-flex;
            align-items: center;
            gap: 3px;
            color: #374151;
          }
          
          .print-running-header .rating-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            border: 1px solid rgba(0,0,0,0.1);
          }
          
          .print-running-header .rating-dot-1 { background-color: #ef4444; }
          .print-running-header .rating-dot-2 { background-color: #f97316; }
          .print-running-header .rating-dot-3 { background-color: #22c55e; }
          .print-running-header .rating-dot-4 { background-color: #3b82f6; }
          .print-running-header .rating-dot-5 { background-color: #a855f7; }
          
          /* Running Footer Styles - Enhanced */
          .print-running-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 7pt;
            color: #6b7280;
            padding-top: 10px;
            margin-top: 10px;
            border-top: 1px solid #d1d5db;
          }
          
          .print-running-footer .footer-left {
            font-family: monospace;
            font-size: 7pt;
          }
          
          .print-running-footer .footer-center {
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #374151;
          }
          
          .print-running-footer .footer-right {
            font-size: 8pt;
          }
          
          /* Page Numbers - Using CSS counters */
          .print-running-footer .page-number::after {
            content: counter(page);
          }
          
          .print-running-footer .page-total::after {
            content: counter(pages);
          }
          
          /* Table print styles */
          .print-table {
            font-size: 8pt;
            width: 100%;
          }
          
          .print-table th,
          .print-table td {
            padding: 4px 6px !important;
            word-wrap: break-word;
          }
          
          /* Prevent page breaks inside important elements */
          table.print-page-table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          /* Each appraisal item on its own page */
          .appraisal-item-card-wrapper {
            page-break-inside: avoid;
            page-break-after: always;
          }
          
          /* Last item should not force a page break after */
          .appraisal-item-card-wrapper:last-child {
            page-break-after: auto;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          .page-break-after {
            page-break-after: always;
          }
          
          .avoid-break {
            page-break-inside: avoid;
          }
          
          /* Show line clamp content fully in print */
          .line-clamp-2,
          .line-clamp-3 {
            -webkit-line-clamp: unset !important;
            display: block !important;
          }
          
          /* Print specific visibility */
          .print\\:block {
            display: block !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          /* Signature lines */
          .print-signature-line {
            display: block !important;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px dashed #ccc;
          }
          
          .print-signature-line .sig-line {
            height: 2rem;
            border-bottom: 1px solid #666;
            margin-bottom: 0.25rem;
          }
          
          /* Hide screen document control in print */
          .print-document-control.no-print {
            display: none !important;
          }
          
          /* Rating colors for print */
          .text-green-600 { color: #16a34a !important; }
          .text-blue-600 { color: #2563eb !important; }
          .text-amber-600 { color: #d97706 !important; }
          .text-red-600 { color: #dc2626 !important; }
          
          /* Badge colors for print */
          .bg-blue-100 { background-color: #dbeafe !important; }
          .bg-purple-100 { background-color: #f3e8ff !important; }
          .bg-amber-100 { background-color: #fef3c7 !important; }
          .bg-green-100 { background-color: #dcfce7 !important; }
          .bg-pink-100 { background-color: #fce7f3 !important; }
          
          /* Border colors for print */
          .border-l-red-500 { border-left-color: #ef4444 !important; }
          .border-l-orange-500 { border-left-color: #f97316 !important; }
          .border-l-green-500 { border-left-color: #22c55e !important; }
          .border-l-blue-500 { border-left-color: #3b82f6 !important; }
          .border-l-purple-500 { border-left-color: #a855f7 !important; }
          .border-l-amber-500 { border-left-color: #f59e0b !important; }
          .border-l-pink-500 { border-left-color: #ec4899 !important; }
          .border-l-slate-500 { border-left-color: #64748b !important; }
        }
      `}</style>
    </div>
  );
}
