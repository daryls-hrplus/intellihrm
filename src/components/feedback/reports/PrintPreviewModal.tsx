import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Printer, FileDown, X, Eye } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PrintPreviewSection {
  id: string;
  label: string;
  defaultIncluded: boolean;
}

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sections: PrintPreviewSection[];
  onPrint: (includedSections: string[]) => void;
  onDownload?: (includedSections: string[]) => void;
  previewContent?: React.ReactNode;
  isLoading?: boolean;
}

export function PrintPreviewModal({
  isOpen,
  onClose,
  title,
  sections,
  onPrint,
  onDownload,
  previewContent,
  isLoading = false,
}: PrintPreviewModalProps) {
  const [includedSections, setIncludedSections] = useState<string[]>(
    sections.filter(s => s.defaultIncluded).map(s => s.id)
  );
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset sections when modal opens
    if (isOpen) {
      setIncludedSections(sections.filter(s => s.defaultIncluded).map(s => s.id));
    }
  }, [isOpen, sections]);

  const toggleSection = (sectionId: string) => {
    setIncludedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handlePrint = () => {
    onPrint(includedSections);
  };

  const handleDownload = () => {
    onDownload?.(includedSections);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Print Preview: {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Section selection sidebar */}
          <div className="w-64 shrink-0 border-r pr-4">
            <h4 className="font-medium text-sm mb-3">Include Sections</h4>
            <div className="space-y-3">
              {sections.map(section => (
                <div key={section.id} className="flex items-center gap-2">
                  <Checkbox
                    id={section.id}
                    checked={includedSections.includes(section.id)}
                    onCheckedChange={() => toggleSection(section.id)}
                  />
                  <Label
                    htmlFor={section.id}
                    className="text-sm cursor-pointer"
                  >
                    {section.label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{includedSections.length}</span>
                <span>of</span>
                <span>{sections.length}</span>
                <span>sections selected</span>
              </div>
            </div>
          </div>

          {/* Preview area */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div
                ref={previewRef}
                className="bg-white p-8 shadow-inner border rounded-lg min-h-full"
                style={{
                  // A4-like aspect ratio for preview
                  maxWidth: '210mm',
                  margin: '0 auto',
                }}
              >
                {previewContent ? (
                  previewContent
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Preview will appear here</p>
                    <p className="text-xs mt-1">
                      Selected sections: {includedSections.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          
          {onDownload && (
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={isLoading || includedSections.length === 0}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          )}
          
          <Button
            onClick={handlePrint}
            disabled={isLoading || includedSections.length === 0}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
