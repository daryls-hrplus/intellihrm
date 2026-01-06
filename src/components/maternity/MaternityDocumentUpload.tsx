import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface Props {
  maternityRequestId: string;
  companyId: string;
  requiredDocuments: string[];
}

export function MaternityDocumentUpload({ maternityRequestId, companyId, requiredDocuments }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Document upload functionality coming soon
        </p>
      </CardContent>
    </Card>
  );
}
