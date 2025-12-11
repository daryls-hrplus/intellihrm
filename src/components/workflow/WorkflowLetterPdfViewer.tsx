import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, Printer, CheckCircle2, QrCode, Shield, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface WorkflowSignature {
  id: string;
  signer_name: string;
  signer_email: string;
  signer_position: string | null;
  signature_text: string;
  signature_hash: string;
  signed_at: string;
}

interface WorkflowLetter {
  id: string;
  generated_content: string;
  verification_code: string;
  status: string;
  created_at: string;
  signed_at: string | null;
  template: {
    name: string;
    subject: string;
  };
  employee: {
    full_name: string;
    email: string;
  };
}

interface WorkflowLetterPdfViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflowInstanceId: string;
}

export function WorkflowLetterPdfViewer({
  open,
  onOpenChange,
  workflowInstanceId,
}: WorkflowLetterPdfViewerProps) {
  const [letter, setLetter] = useState<WorkflowLetter | null>(null);
  const [signatures, setSignatures] = useState<WorkflowSignature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && workflowInstanceId) {
      fetchLetterData();
    }
  }, [open, workflowInstanceId]);

  const fetchLetterData = async () => {
    setIsLoading(true);
    try {
      // Fetch letter
      const { data: letterData, error: letterError } = await supabase
        .from("workflow_letters")
        .select(`
          *,
          template:letter_templates(name, subject),
          employee:profiles!workflow_letters_employee_id_fkey(full_name, email)
        `)
        .eq("workflow_instance_id", workflowInstanceId)
        .single();

      if (letterError && letterError.code !== "PGRST116") throw letterError;
      
      if (letterData) {
        setLetter(letterData as unknown as WorkflowLetter);
      }

      // Fetch signatures
      const { data: sigData, error: sigError } = await supabase
        .from("workflow_signatures")
        .select("*")
        .eq("instance_id", workflowInstanceId)
        .order("signed_at", { ascending: true });

      if (sigError) throw sigError;
      setSignatures(sigData as WorkflowSignature[]);
    } catch (error) {
      console.error("Error fetching letter data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCodeData = () => {
    if (!letter) return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}/verify/${letter.verification_code}`;
  };

  const handleDownloadPdf = async () => {
    if (!contentRef.current || !letter) return;

    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${letter.verification_code}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handlePrint = () => {
    const printContent = contentRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Letter</title>
          <style>
            body { font-family: Georgia, serif; padding: 40px; line-height: 1.6; }
            .signature-block { margin-top: 30px; padding: 20px; border: 1px solid #ddd; }
            .signature-item { margin-bottom: 20px; }
            .signature-line { border-bottom: 1px solid #333; padding-bottom: 5px; font-style: italic; }
            .verification { margin-top: 40px; padding: 20px; background: #f5f5f5; text-align: center; }
            .qr-placeholder { width: 100px; height: 100px; border: 1px dashed #999; margin: 10px auto; display: flex; align-items: center; justify-content: center; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const renderSignatureBlock = () => {
    if (signatures.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          No signatures collected yet
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {signatures.map((sig, index) => (
          <div key={sig.id} className="border rounded-lg p-4 bg-muted/30">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{sig.signer_name}</span>
                </div>
                {sig.signer_position && (
                  <p className="text-sm text-muted-foreground">{sig.signer_position}</p>
                )}
                <p className="text-xs text-muted-foreground">{sig.signer_email}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                Step {index + 1}
              </Badge>
            </div>
            
            <Separator className="my-3" />
            
            <div className="space-y-2">
              <div className="font-serif italic text-lg border-b border-foreground/30 pb-1">
                {sig.signature_text}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(sig.signed_at), "PPP 'at' p")}
                </span>
              </div>
              <div className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                Hash: {sig.signature_hash.substring(0, 24)}...
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!letter) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>No Letter Found</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No letter has been generated for this workflow yet.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {letter.template.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={letter.status === "signed" ? "default" : "secondary"}>
                {letter.status === "signed" ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" />Signed</>
                ) : letter.status}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>

        <ScrollArea className="h-[600px]">
          <div ref={contentRef} className="bg-white dark:bg-gray-900 p-8 rounded-lg border">
            {/* Letter Content */}
            <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed mb-8">
              {letter.generated_content
                .replace("{{COMPANY_LETTERHEAD}}", "[Company Letterhead]")
                .replace("{{AUTO_GENERATED}}", letter.verification_code)
                .replace("{{SIGNATURE_BLOCK}}", "")}
            </div>

            {/* Signatures Section */}
            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-4 w-4" />
                Digital Signatures
              </h3>
              {renderSignatureBlock()}
            </div>

            {/* Verification Section */}
            <div className="border-t pt-6 mt-6 bg-muted/30 -mx-8 px-8 pb-8 -mb-8 rounded-b-lg">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    Document Verification
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    This document can be verified using the code below
                  </p>
                  <div className="font-mono text-lg font-bold text-primary">
                    {letter.verification_code}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Generated: {format(new Date(letter.created_at), "PPP 'at' p")}
                    {letter.signed_at && (
                      <> • Signed: {format(new Date(letter.signed_at), "PPP 'at' p")}</>
                    )}
                  </p>
                </div>
                
                {/* QR Code Placeholder */}
                <div className="text-center">
                  <div className="w-24 h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center bg-white">
                    <QrCode className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Scan to verify</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}