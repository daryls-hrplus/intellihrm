import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppraisalPrintLayoutProps {
  children: ReactNode;
  title?: string;
  onPrint?: () => void;
}

export function AppraisalPrintLayout({ children, title = "Appraisal Form", onPrint }: AppraisalPrintLayoutProps) {
  const navigate = useNavigate();

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
        {children}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .print-content {
            padding: 0 !important;
          }
          
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
          
          body {
            font-size: 10pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          table {
            page-break-inside: avoid;
          }
          
          tr {
            page-break-inside: avoid;
          }
          
          .page-break {
            page-break-before: always;
          }
        }
        
        @media screen {
          .print-content {
            max-width: 210mm;
            margin: 0 auto;
            padding: 2rem;
            background: white;
            min-height: calc(100vh - 60px);
          }
        }
      `}</style>
    </div>
  );
}
