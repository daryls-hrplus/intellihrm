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
      {/* Print Controls - Hidden when printing */}
      <div className="no-print sticky top-0 z-50 bg-background border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <X className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">{title}</h1>
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
                {/* Running Header */}
                <div className="print-running-header">
                  <div className="header-row-1">
                    <span className="company-name">{companyName || "Company"}</span>
                    <span className="doc-title">Performance Appraisal Form</span>
                    <span className="doc-code">
                      {templateCode && `${templateCode}`}
                      {templateVersion && ` v${templateVersion}`}
                    </span>
                  </div>
                  <div className="header-row-2">
                    <span className="rating-label">Rating Scale:</span>
                    {filteredLevels.map((level) => (
                      <span key={level.level} className="rating-item">
                        <span className={`rating-dot rating-dot-${level.level}`} />
                        {level.level} ({level.shortLabel})
                      </span>
                    ))}
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
                    {templateCode && `Doc: ${templateCode}`}
                    {templateVersion && ` v${templateVersion}`}
                    {" | "}Generated: {currentDate}
                  </span>
                  <span className="footer-center">Confidential - Internal Use Only</span>
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

        {/* Document Control Footer (visible on screen and last page) */}
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
            min-height: calc(100vh - 60px);
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
            margin: 15mm 10mm 20mm 10mm;
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
          
          /* Running Header Styles */
          .print-running-header {
            padding-bottom: 6px;
            margin-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .print-running-header .header-row-1 {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 8pt;
            color: #6b7280;
            margin-bottom: 4px;
          }
          
          .print-running-header .doc-title {
            font-weight: 600;
            color: #374151;
          }
          
          .print-running-header .header-row-2 {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 7pt;
            color: #6b7280;
            background: #f9fafb;
            padding: 3px 8px;
            border-radius: 4px;
          }
          
          .print-running-header .rating-label {
            font-weight: 600;
            margin-right: 4px;
          }
          
          .print-running-header .rating-item {
            display: inline-flex;
            align-items: center;
            gap: 3px;
          }
          
          .print-running-header .rating-dot {
            display: inline-block;
            width: 6px;
            height: 6px;
            border-radius: 50%;
          }
          
          .print-running-header .rating-dot-1 { background-color: #ef4444; }
          .print-running-header .rating-dot-2 { background-color: #f97316; }
          .print-running-header .rating-dot-3 { background-color: #22c55e; }
          .print-running-header .rating-dot-4 { background-color: #3b82f6; }
          .print-running-header .rating-dot-5 { background-color: #a855f7; }
          
          /* Running Footer Styles */
          .print-running-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 7pt;
            color: #6b7280;
            padding-top: 8px;
            margin-top: 8px;
            border-top: 1px solid #e5e7eb;
          }
          
          .print-running-footer .footer-center {
            font-style: italic;
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
