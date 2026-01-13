import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FileSignature, Clock, AlertCircle, ChevronRight, RefreshCw } from "lucide-react";
import { useHRDocumentSignature, PendingSignature } from "@/hooks/useHRDocumentSignature";
import { HRDocumentSignatureDialog } from "./HRDocumentSignatureDialog";
import { format, formatDistanceToNow, isPast } from "date-fns";

interface PendingSignaturesWidgetProps {
  variant?: "compact" | "full";
  showHRView?: boolean;
  onRefresh?: () => void;
}

export function PendingSignaturesWidget({
  variant = "compact",
  showHRView = false,
  onRefresh,
}: PendingSignaturesWidgetProps) {
  const { getPendingSignatures, getAllPendingSignatures, isLoading } = useHRDocumentSignature();
  const [pendingSignatures, setPendingSignatures] = useState<PendingSignature[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<PendingSignature | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSignatures = async () => {
    setIsRefreshing(true);
    try {
      const signatures = showHRView 
        ? await getAllPendingSignatures() 
        : await getPendingSignatures();
      setPendingSignatures(signatures);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSignatures();
  }, [showHRView]);

  const handleSigned = () => {
    fetchSignatures();
    onRefresh?.();
  };

  const getStatusBadge = (signature: PendingSignature) => {
    if (signature.dueDate && isPast(new Date(signature.dueDate))) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (signature.status === "pending") {
      return <Badge variant="secondary">Pending</Badge>;
    }
    return <Badge variant="outline">{signature.status}</Badge>;
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "pip":
        return "📋";
      case "disciplinary":
        return "⚠️";
      case "promotion":
        return "🎉";
      case "compensation":
        return "💰";
      default:
        return "📄";
    }
  };

  if (isLoading && pendingSignatures.length === 0) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileSignature className="h-5 w-5 text-primary" />
                {showHRView ? "All Pending Signatures" : "Documents to Sign"}
              </CardTitle>
              <CardDescription>
                {pendingSignatures.length === 0
                  ? "No documents pending signature"
                  : `${pendingSignatures.length} document${pendingSignatures.length > 1 ? "s" : ""} awaiting signature`}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchSignatures}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pendingSignatures.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileSignature className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>All caught up!</p>
              <p className="text-sm">No documents require your signature.</p>
            </div>
          ) : (
            <ScrollArea className={variant === "compact" ? "h-[200px]" : "h-[400px]"}>
              <div className="space-y-2">
                {pendingSignatures.map((signature) => (
                  <div
                    key={signature.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedDocument(signature)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getDocumentIcon(signature.documentType)}
                      </span>
                      <div>
                        <div className="font-medium text-sm">
                          {signature.documentName}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {showHRView && (
                            <span>{signature.employeeName}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(signature.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(signature)}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <HRDocumentSignatureDialog
        open={!!selectedDocument}
        onOpenChange={(open) => !open && setSelectedDocument(null)}
        document={selectedDocument}
        onSigned={handleSigned}
      />
    </>
  );
}
