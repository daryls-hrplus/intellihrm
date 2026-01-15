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
        return <Badge variant="default" className="bg-green-600 text-xs">Signed</Badge>;
      case "overdue":
        return <Badge variant="destructive" className="text-xs">Overdue</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Pending</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="signature-section border rounded-lg overflow-hidden avoid-break">
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
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{sig.role}</span>
              {getStatusIcon(sig.status)}
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Name</span>
                <span className="font-medium">{sig.name || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Date</span>
                <span>{formatDate(sig.date)}</span>
              </div>
              <div className="pt-1">
                {getStatusBadge(sig.status)}
              </div>
            </div>

            {/* Signature Line for Print */}
            <div className="print-signature-line hidden print:block mt-4 pt-4 border-t border-dashed">
              <div className="sig-line h-8 border-b border-gray-400 mb-1"></div>
              <span className="text-xs text-muted-foreground">Signature</span>
            </div>
          </div>
        ))}
      </div>

      {/* Acknowledgment Statement */}
      <div className="px-4 py-3 bg-muted/10 border-t text-xs text-muted-foreground">
        <p className="mb-2">
          <strong>Employee Acknowledgment:</strong> My signature indicates that I have reviewed and discussed
          this appraisal with my supervisor. It does not necessarily indicate agreement with the ratings.
        </p>
        <p>
          <strong>Manager Certification:</strong> I certify that this appraisal represents my professional
          assessment of the employee's performance during the review period.
        </p>
      </div>
    </div>
  );
}
