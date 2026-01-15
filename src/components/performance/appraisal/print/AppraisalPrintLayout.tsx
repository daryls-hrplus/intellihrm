import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppraisalPrintLayoutProps {
  children: ReactNode;
  title?: string;
  onPrint?: () => void;
  templateCode?: string;
  templateVersion?: number;
  companyName?: string;
  isPreview?: boolean;
}

export function AppraisalPrintLayout({
  children,
  title = "Appraisal Form",
  onPrint,
  templateCode,
  templateVersion,
  companyName,
  isPreview = false,
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

      {/* Print Content */}
      <div className="print-content">
        {/* Preview Watermark */}
        {isPreview && (
          <div className="preview-watermark no-print fixed inset-0 flex items-center justify-center pointer-events-none z-10">
            <span className="text-[120px] font-bold text-muted-foreground/10 rotate-[-30deg] select-none">
              PREVIEW
            </span>
          </div>
        )}

        {/* Running Header for Print */}
        <div className="print-running-header hidden print:block mb-4 pb-2 border-b border-muted">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{companyName || "Company"}</span>
            <span className="font-medium">Performance Appraisal Form</span>
            <span>
              {templateCode && `${templateCode}`}
              {templateVersion && ` v${templateVersion}`}
            </span>
          </div>
        </div>

        {children}

        {/* Document Control Footer */}
        <div className="print-document-control mt-8 pt-4 border-t">
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
        @media print {
          .no-print {
            display: none !important;
          }
          
          .preview-watermark {
            display: none !important;
          }
          
          .print-content {
            padding: 0 !important;
            max-width: none !important;
            margin: 0 !important;
          }
          
          .print-running-header {
            display: block !important;
          }
          
          @page {
            size: A4 portrait;
            margin: 1.5cm 1cm;
          }
          
          @page :first {
            margin-top: 1cm;
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
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          tfoot {
            display: table-footer-group;
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
          
          /* Document control */
          .print-document-control {
            margin-top: 2rem;
            page-break-inside: avoid;
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
        }
        
        @media screen {
          .print-content {
            max-width: 210mm;
            margin: 0 auto;
            padding: 2rem;
            background: white;
            min-height: calc(100vh - 60px);
            position: relative;
          }
          
          .print-running-header {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
