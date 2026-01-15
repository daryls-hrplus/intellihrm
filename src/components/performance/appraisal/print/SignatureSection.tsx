import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface SignatureEntry {
  role: string;
  name?: string;
  date?: string;
  status: "pending" | "completed" | "overdue";
}

interface SignatureSectionProps {
  signatures: SignatureEntry[];
  finalStatus?: string;
}

export function SignatureSection({ signatures, finalStatus }: SignatureSectionProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/30 px-4 py-3 border-b flex items-center justify-between">
        <h3 className="font-semibold">Signatures & Acknowledgments</h3>
        {finalStatus && (
          <Badge 
            variant={finalStatus === "completed" ? "default" : "secondary"}
            className={finalStatus === "completed" ? "bg-green-600" : ""}
          >
            {finalStatus}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
        {signatures.map((sig, index) => (
          <div key={index} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{sig.role}</span>
              {getStatusIcon(sig.status)}
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="text-xs text-muted-foreground block">Name</span>
                <span className="font-medium">{sig.name || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Date</span>
                <span className="text-sm">{formatDate(sig.date)}</span>
              </div>
              <div className="pt-1">
                {getStatusBadge(sig.status)}
              </div>
            </div>

            {/* Signature Line for Print */}
            <div className="mt-4 pt-4 border-t border-dashed print:block hidden">
              <div className="h-8 border-b border-gray-400"></div>
              <span className="text-xs text-muted-foreground">Signature</span>
            </div>
          </div>
        ))}
      </div>

      {/* Print Footer */}
      <div className="px-4 py-3 bg-muted/10 border-t text-xs text-muted-foreground text-center print:block hidden">
        This document was generated on {new Date().toLocaleDateString()} and is an official record of the performance appraisal.
      </div>
    </div>
  );
}
