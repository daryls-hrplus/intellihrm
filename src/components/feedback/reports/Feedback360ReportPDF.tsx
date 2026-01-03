import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { 
  generateFeedback360PDF, 
  downloadPDF, 
  type Feedback360ReportData,
  type PDFGenerationOptions 
} from '@/utils/feedback360ReportPdf';
import { toast } from 'sonner';

interface Feedback360ReportPDFProps {
  data: Feedback360ReportData;
  options?: PDFGenerationOptions;
  filename?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function Feedback360ReportPDF({
  data,
  options = {},
  filename,
  variant = 'outline',
  size = 'default',
  className,
}: Feedback360ReportPDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateFeedback360PDF(data, options);
      const defaultFilename = `360_Feedback_${data.employeeName.replace(/\s+/g, '_')}_${data.cycleName.replace(/\s+/g, '_')}.pdf`;
      downloadPDF(blob, filename || defaultFilename);
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4 mr-2" />
          Download PDF
        </>
      )}
    </Button>
  );
}
