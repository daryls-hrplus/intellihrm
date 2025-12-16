import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, Loader2 } from "lucide-react";
import { generateStaffLoanDesignDocument } from "@/utils/staffLoanDesignDocument";

export default function StaffLoanDesignDocumentPage() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await generateStaffLoanDesignDocument();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Staff Loan Management Module</CardTitle>
          <CardDescription>
            Design Document for Multi-Territory Staff Loan System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Click the button below to download the complete design document in Word format.
            The document includes:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Executive Summary</li>
            <li>Core Loan Types (8 categories across 8 territories)</li>
            <li>Functional Requirements (7 major areas)</li>
            <li>Data Model Specification</li>
            <li>Integration Points</li>
            <li>Development Estimate (32 days / 6-7 weeks)</li>
            <li>Phased Delivery Recommendation</li>
            <li>Territory-Specific Requirements</li>
          </ul>
          <Button 
            onClick={handleDownload} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Download Design Document (.docx)
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
