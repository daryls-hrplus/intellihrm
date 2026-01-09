import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Eye, 
  Palette, 
  BookOpen, 
  FileText, 
  FileCheck, 
  Zap, 
  Check,
  LayoutTemplate
} from "lucide-react";
import { DocumentTemplate, DEFAULT_TEMPLATES } from "./DocumentTemplateConfig";
import { TemplateLivePreview } from "./TemplateLivePreview";
import { DOCUMENT_TYPE_LABELS, DocumentType } from "@/hooks/useDocumentTemplates";

interface TemplatePreviewCardProps {
  template: DocumentTemplate | null;
  documentType: DocumentType;
  isDefault?: boolean;
  onViewFullPreview?: () => void;
  onChangeTemplate?: () => void;
  compact?: boolean;
}

const getDocumentTypeIcon = (type: string) => {
  switch (type) {
    case 'training_guide': return <BookOpen className="h-4 w-4" />;
    case 'user_manual': return <FileText className="h-4 w-4" />;
    case 'sop': return <FileCheck className="h-4 w-4" />;
    case 'quick_start': return <Zap className="h-4 w-4" />;
    default: return <LayoutTemplate className="h-4 w-4" />;
  }
};

export function TemplatePreviewCard({
  template,
  documentType,
  isDefault = true,
  onViewFullPreview,
  onChangeTemplate,
  compact = false
}: TemplatePreviewCardProps) {
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  
  // Use template or fallback to system default for document type
  const displayTemplate = template || DEFAULT_TEMPLATES.find(t => t.type === documentType) || DEFAULT_TEMPLATES[0];
  const { branding } = displayTemplate;

  const handleViewPreview = () => {
    if (onViewFullPreview) {
      onViewFullPreview();
    } else {
      setShowPreviewDialog(true);
    }
  };

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
          {/* Mini Preview Thumbnail */}
          <div className="w-12 h-10 border rounded overflow-hidden flex-shrink-0 bg-background">
            <div 
              className="h-2.5 flex items-center px-1"
              style={{ backgroundColor: (branding.primaryColor || '#1e40af') + '20' }}
            >
              <div 
                className="w-1.5 h-1.5 rounded-sm"
                style={{ backgroundColor: branding.primaryColor }}
              />
            </div>
            <div className="p-0.5 space-y-0.5">
              <div className="h-0.5 bg-muted rounded-full w-3/4" />
              <div className="h-0.5 bg-muted rounded-full w-full" />
            </div>
          </div>

          {/* Template Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{displayTemplate.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div 
                className="w-2.5 h-2.5 rounded-full border"
                style={{ backgroundColor: branding.primaryColor }}
              />
              <div 
                className="w-2.5 h-2.5 rounded-full border"
                style={{ backgroundColor: branding.secondaryColor || '#6b7280' }}
              />
              {isDefault && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1">Default</Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <Button variant="ghost" size="sm" onClick={handleViewPreview}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Template Preview: {displayTemplate.name}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-auto max-h-[70vh]">
              <TemplateLivePreview template={displayTemplate} />
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Header with branding colors */}
          <div 
            className="p-3 border-b"
            style={{ backgroundColor: (branding.primaryColor || '#1e40af') + '10' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="p-1.5 rounded"
                  style={{ backgroundColor: branding.primaryColor + '20' }}
                >
                  {getDocumentTypeIcon(documentType)}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{displayTemplate.name}</h4>
                  <p className="text-xs text-muted-foreground">{DOCUMENT_TYPE_LABELS[documentType]}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isDefault && (
                  <Badge variant="default" className="text-xs gap-1">
                    <Check className="h-3 w-3" />
                    Active
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Mini Preview */}
          <div className="p-3">
            <div className="aspect-[16/10] border rounded-lg overflow-hidden bg-background mb-3">
              <div 
                className="h-6 flex items-center px-2 border-b"
                style={{ backgroundColor: (branding.primaryColor || '#1e40af') + '10' }}
              >
                <div 
                  className="w-4 h-4 rounded-sm"
                  style={{ backgroundColor: branding.primaryColor }}
                />
                <span className="ml-2 text-[10px] font-medium truncate">
                  {branding.companyName || 'Document Title'}
                </span>
              </div>
              <div className="p-2 space-y-1.5">
                <div className="h-1.5 bg-muted rounded-full w-3/4" />
                <div className="h-1 bg-muted rounded-full w-full" />
                <div className="h-1 bg-muted rounded-full w-5/6" />
                <div className="h-1 bg-muted rounded-full w-2/3" />
                <div className="mt-2 p-1 rounded" style={{ backgroundColor: branding.primaryColor + '10' }}>
                  <div className="h-1 bg-muted rounded-full w-4/5" />
                </div>
              </div>
            </div>

            {/* Color Palette */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <Palette className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Colors:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div 
                  className="w-5 h-5 rounded-full border-2 border-background shadow-sm"
                  style={{ backgroundColor: branding.primaryColor }}
                  title="Primary"
                />
                <div 
                  className="w-5 h-5 rounded-full border-2 border-background shadow-sm"
                  style={{ backgroundColor: branding.secondaryColor || '#6b7280' }}
                  title="Secondary"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={handleViewPreview}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              {onChangeTemplate && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex-1"
                  onClick={onChangeTemplate}
                >
                  Change
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Template Preview: {displayTemplate.name}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh]">
            <TemplateLivePreview template={displayTemplate} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
