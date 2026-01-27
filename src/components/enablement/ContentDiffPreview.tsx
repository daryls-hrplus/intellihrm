// Diff preview dialog for reviewing changes before applying
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ContentDiffViewer } from "@/components/kb/ContentDiffViewer";
import { Check, X, Loader2, BookOpen, Send } from "lucide-react";

interface ContentDiffPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  sectionTitle: string;
  sectionNumber: string;
  currentContent: string;
  proposedContent: string;
  onApply: () => Promise<void>;
  onApplyAndPublish?: () => Promise<void>;
  isApplying: boolean;
}

export function ContentDiffPreview({
  isOpen,
  onClose,
  sectionTitle,
  sectionNumber,
  currentContent,
  proposedContent,
  onApply,
  onApplyAndPublish,
  isApplying,
}: ContentDiffPreviewProps) {
  const handleApply = async () => {
    await onApply();
    onClose();
  };

  const handleApplyAndPublish = async () => {
    if (onApplyAndPublish) {
      await onApplyAndPublish();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isApplying && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="flex items-center gap-2">
                Review Changes
                <Badge variant="outline" className="font-mono text-xs">
                  {sectionNumber}
                </Badge>
              </DialogTitle>
              <DialogDescription className="truncate">
                {sectionTitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="flex-1 min-h-0 overflow-auto py-4">
          <ContentDiffViewer
            oldContent={currentContent || "No existing content"}
            newContent={proposedContent || "No proposed content"}
            oldVersionLabel="Current Version"
            newVersionLabel="Proposed Changes"
            showStats={true}
          />
        </div>

        <Separator />

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isApplying}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>

          <Button
            variant="default"
            onClick={handleApply}
            disabled={isApplying}
          >
            {isApplying ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Apply Changes
          </Button>

          {onApplyAndPublish && (
            <Button
              variant="default"
              onClick={handleApplyAndPublish}
              disabled={isApplying}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApplying ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Apply & Publish
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
