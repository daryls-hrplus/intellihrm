import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  Download, 
  FileText, 
  FileImage, 
  Printer, 
  ChevronDown,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export type ExportFormat = 'pdf' | 'docx' | 'print';

interface ReportDownloadButtonProps {
  onExport: (format: ExportFormat) => Promise<void>;
  isExporting?: boolean;
  currentFormat?: ExportFormat | null;
  disabled?: boolean;
  label?: string;
  supportedFormats?: ExportFormat[];
}

const formatConfig: Record<ExportFormat, { icon: typeof FileText; label: string; description: string }> = {
  pdf: {
    icon: FileText,
    label: 'PDF Document',
    description: 'Best for sharing and archiving',
  },
  docx: {
    icon: FileImage,
    label: 'Word Document',
    description: 'Editable format for customization',
  },
  print: {
    icon: Printer,
    label: 'Print',
    description: 'Print directly or save as PDF',
  },
};

export function ReportDownloadButton({
  onExport,
  isExporting = false,
  currentFormat = null,
  disabled = false,
  label = 'Download Report',
  supportedFormats = ['pdf', 'docx', 'print'],
}: ReportDownloadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setIsOpen(false);
    try {
      await onExport(format);
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error);
      toast.error(`Failed to export report`, { description: String(error) });
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled || isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting {currentFormat ? formatConfig[currentFormat].label : ''}...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              {label}
              <ChevronDown className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {supportedFormats.map((format) => {
          const config = formatConfig[format];
          const Icon = config.icon;
          
          return (
            <DropdownMenuItem
              key={format}
              onClick={() => handleExport(format)}
              className="flex items-start gap-3 py-2"
            >
              <Icon className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">{config.label}</div>
                <div className="text-xs text-muted-foreground">
                  {config.description}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
