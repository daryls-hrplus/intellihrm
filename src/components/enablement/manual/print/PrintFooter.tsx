import { BrandColors } from "@/hooks/useEnablementBranding";

interface PrintFooterProps {
  content: string;
  pageNumber: number;
  totalPages?: number;
  position: 'left' | 'center' | 'right';
  format: 'simple' | 'pageOf' | 'pageOfTotal';
  brandColors: BrandColors;
}

export function PrintFooter({ 
  content, 
  pageNumber, 
  totalPages,
  position, 
  format, 
  brandColors 
}: PrintFooterProps) {
  const getPageNumberText = () => {
    switch (format) {
      case 'simple':
        return String(pageNumber);
      case 'pageOf':
        return `Page ${pageNumber}`;
      case 'pageOfTotal':
        return `Page ${pageNumber} of ${totalPages || '—'}`;
      default:
        return String(pageNumber);
    }
  };

  const pageNumberElement = (
    <span 
      className="text-sm font-medium"
      style={{ color: brandColors.primaryColor }}
    >
      {getPageNumberText()}
    </span>
  );

  return (
    <div className="print-footer w-full flex items-center justify-between px-6 py-3 border-t mt-auto">
      <div className="flex-1 text-left">
        {position === 'left' ? pageNumberElement : (
          <span className="text-xs text-muted-foreground">{content}</span>
        )}
      </div>
      
      <div className="flex-1 text-center">
        {position === 'center' && pageNumberElement}
      </div>
      
      <div className="flex-1 text-right">
        {position === 'right' ? pageNumberElement : (
          <span className="text-xs text-muted-foreground">{content}</span>
        )}
      </div>
    </div>
  );
}
