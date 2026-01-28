import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useContentReview } from "@/hooks/useContentReview";
import { Check, X, Pencil, Eye, GitCompare, Loader2, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ContentReviewPanelProps {
  sectionId: string | null;
  onClose: () => void;
  onApprove: (sectionId: string) => Promise<void>;
  onReject: (sectionId: string, reason: string) => Promise<void>;
  onEdit: (sectionId: string, content: string) => Promise<void>;
  isApproving: boolean;
  isRejecting: boolean;
  isEditing: boolean;
}

export function ContentReviewPanel({
  sectionId,
  onClose,
  onApprove,
  onReject,
  onEdit,
  isApproving,
  isRejecting,
  isEditing,
}: ContentReviewPanelProps) {
  const { useSectionDetails } = useContentReview();
  const { data: section, isLoading } = useSectionDetails(sectionId);

  const [viewMode, setViewMode] = useState<"side-by-side" | "proposed" | "edit">("side-by-side");
  const [editedContent, setEditedContent] = useState<string>("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  // Extract markdown content from JSONB - handle various content shapes
  const extractMarkdown = (content: unknown): string => {
    if (!content) return "";
    if (typeof content === 'string') return content;
    if (typeof content === 'object' && content !== null) {
      const obj = content as Record<string, unknown>;
      if (typeof obj.markdown === 'string') return obj.markdown;
      if (typeof obj.content === 'string') return obj.content;
    }
    return "";
  };
  
  const currentContent = extractMarkdown(section?.content) || "(No existing content)";
  
  const proposedContent = extractMarkdown(section?.draft_content) || "(No proposed content)";

  // Reset edit content when section changes
  useEffect(() => {
    if (proposedContent) {
      setEditedContent(proposedContent);
    }
  }, [proposedContent]);

  const handleApprove = async () => {
    if (sectionId) {
      await onApprove(sectionId);
    }
  };

  const handleReject = async () => {
    if (sectionId && rejectReason.trim()) {
      await onReject(sectionId, rejectReason);
      setRejectDialogOpen(false);
      setRejectReason("");
    }
  };

  const handleSaveEdit = async () => {
    if (sectionId && editedContent.trim()) {
      await onEdit(sectionId, editedContent);
    }
  };

  const isProcessing = isApproving || isRejecting || isEditing;

  return (
    <Sheet open={!!sectionId} onOpenChange={() => onClose()}>
      <SheetContent side="right" className="w-[90vw] max-w-6xl overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : section ? (
          <>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Review: {section.title}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                <Badge variant="outline">{section.section_number}</Badge>
                <span>•</span>
                <span>{(section.manual_definitions as any)?.manual_name}</span>
              </SheetDescription>
            </SheetHeader>

            {/* View Mode Tabs */}
            <div className="mt-4">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="side-by-side" className="flex items-center gap-1">
                    <GitCompare className="h-4 w-4" />
                    Compare
                  </TabsTrigger>
                  <TabsTrigger value="proposed" className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="flex items-center gap-1">
                    <Pencil className="h-4 w-4" />
                    Edit
                  </TabsTrigger>
                </TabsList>

                {/* Side by Side View */}
                <TabsContent value="side-by-side" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Badge variant="secondary">Current</Badge>
                          Published Content
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="prose prose-sm max-w-none dark:prose-invert max-h-[60vh] overflow-y-auto">
                        {currentContent === "(No existing content)" ? (
                          <p className="text-muted-foreground italic">{currentContent}</p>
                        ) : (
                          <ReactMarkdown>{currentContent}</ReactMarkdown>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card className="border-primary/50">
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Badge>Proposed</Badge>
                          Draft Content
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="prose prose-sm max-w-none dark:prose-invert max-h-[60vh] overflow-y-auto">
                        {proposedContent === "(No proposed content)" ? (
                          <p className="text-muted-foreground italic">{proposedContent}</p>
                        ) : (
                          <ReactMarkdown>{proposedContent}</ReactMarkdown>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Preview View */}
                <TabsContent value="proposed" className="mt-4">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Proposed Content Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none dark:prose-invert max-h-[70vh] overflow-y-auto">
                      <ReactMarkdown>{proposedContent}</ReactMarkdown>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Edit View */}
                <TabsContent value="edit" className="mt-4">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Edit Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="min-h-[50vh] font-mono text-sm"
                        placeholder="Edit the content..."
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Use Markdown formatting. Changes will be saved when you click "Save & Approve".
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer Actions */}
            <SheetFooter className="mt-6 flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                Cancel
              </Button>
              
              {/* Reject Dialog */}
              <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" disabled={isProcessing}>
                    <X className="h-4 w-4 mr-1" />
                    Request Changes
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Changes</DialogTitle>
                    <DialogDescription>
                      Explain what changes are needed. This feedback will be sent to the content creator.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="reason">Feedback</Label>
                      <Textarea
                        id="reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Describe what needs to be changed..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleReject}
                      disabled={!rejectReason.trim() || isRejecting}
                    >
                      {isRejecting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                      Submit Feedback
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {viewMode === "edit" ? (
                <Button onClick={handleSaveEdit} disabled={isProcessing || !editedContent.trim()}>
                  {isEditing && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  <Check className="h-4 w-4 mr-1" />
                  Save & Approve
                </Button>
              ) : (
                <Button onClick={handleApprove} disabled={isProcessing}>
                  {isApproving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              )}
            </SheetFooter>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Section not found
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
