import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, FileSignature, Shield, Clock, CheckCircle2 } from "lucide-react";
import { useHRDocumentSignature, PendingSignature } from "@/hooks/useHRDocumentSignature";
import { format } from "date-fns";

interface HRDocumentSignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: PendingSignature | null;
  onSigned?: () => void;
}

export function HRDocumentSignatureDialog({
  open,
  onOpenChange,
  document,
  onSigned,
}: HRDocumentSignatureDialogProps) {
  const { signDocument, isLoading } = useHRDocumentSignature();
  const [signatureText, setSignatureText] = useState("");
  const [comment, setComment] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  const handleSign = async () => {
    if (!document || !signatureText.trim() || !acknowledged) return;

    const success = await signDocument(
      document.instanceId,
      signatureText,
      comment || undefined
    );

    if (success) {
      setSignatureText("");
      setComment("");
      setAcknowledged(false);
      onOpenChange(false);
      onSigned?.();
    }
  };

  const handleClose = () => {
    setSignatureText("");
    setComment("");
    setAcknowledged(false);
    onOpenChange(false);
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-primary" />
            Sign Document: {document.documentName}
          </DialogTitle>
          <DialogDescription>
            Please review the document below and provide your digital signature
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Document Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(new Date(document.createdAt), "MMM d, yyyy")}
            </div>
            <Badge variant="outline">{document.documentType}</Badge>
            {document.verificationCode && (
              <Badge variant="secondary" className="font-mono text-xs">
                {document.verificationCode}
              </Badge>
            )}
          </div>

          {/* Document Content */}
          {document.letterContent && (
            <Card>
              <CardContent className="p-4">
                <ScrollArea className="h-[250px]">
                  <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
                    {document.letterContent}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Signature Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4 text-primary" />
              Digital Signature
            </div>

            <div className="space-y-2">
              <Label htmlFor="signature">Type your full name as signature</Label>
              <Input
                id="signature"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="Enter your full legal name"
                className="font-signature text-lg"
              />
              <p className="text-xs text-muted-foreground">
                By typing your name, you are creating a legally binding digital signature
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comments (optional)</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add any comments or notes..."
                rows={2}
              />
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
              <Checkbox
                id="acknowledge"
                checked={acknowledged}
                onCheckedChange={(checked) => setAcknowledged(checked === true)}
              />
              <Label htmlFor="acknowledge" className="text-sm leading-relaxed cursor-pointer">
                I acknowledge that I have read and understood this document. I understand that 
                my digital signature has the same legal effect as a handwritten signature.
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSign}
            disabled={isLoading || !signatureText.trim() || !acknowledged}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Sign Document
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
