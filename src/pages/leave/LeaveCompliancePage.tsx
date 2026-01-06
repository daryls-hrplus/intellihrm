import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PolicyAcknowledgmentTracker } from "@/components/leave/compliance/PolicyAcknowledgmentTracker";
import { MedicalCertificateVerification } from "@/components/leave/compliance/MedicalCertificateVerification";
import { BradfordFactorAnalysis } from "@/components/leave/compliance/BradfordFactorAnalysis";
import { LeavePolicyVersionHistory } from "@/components/leave/compliance/LeavePolicyVersionHistory";
import { ComplianceAlerts } from "@/components/leave/compliance/ComplianceAlerts";
import { FileCheck, Stethoscope, Calculator, History, Bell } from "lucide-react";

export default function LeaveCompliancePage() {
  const { company, isAdmin } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState(company?.id || "");

  const { data: companies = [] } = useQuery({
    queryKey: ["companies-for-selector"],
    queryFn: async () => {
      const { data } = await supabase.from("companies").select("id, name").order("name");
      return data || [];
    },
    enabled: isAdmin,
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave Compliance</h1>
          <p className="text-muted-foreground">
            Policy acknowledgments, medical verification, absence analysis, and audit trails
          </p>
        </div>
        {isAdmin && companies.length > 0 && (
          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c: { id: string; name: string }) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="acknowledgments" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Acknowledgments
          </TabsTrigger>
          <TabsTrigger value="medical" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Medical Certs
          </TabsTrigger>
          <TabsTrigger value="bradford" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Bradford Factor
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Policy History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <ComplianceAlerts companyId={selectedCompanyId} />
        </TabsContent>

        <TabsContent value="acknowledgments">
          <PolicyAcknowledgmentTracker companyId={selectedCompanyId} />
        </TabsContent>

        <TabsContent value="medical">
          <MedicalCertificateVerification companyId={selectedCompanyId} />
        </TabsContent>

        <TabsContent value="bradford">
          <BradfordFactorAnalysis companyId={selectedCompanyId} />
        </TabsContent>

        <TabsContent value="history">
          <LeavePolicyVersionHistory companyId={selectedCompanyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
