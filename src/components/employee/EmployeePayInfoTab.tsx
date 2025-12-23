import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeBankAccountsTab } from "./EmployeeBankAccountsTab";
import { EmployeePayGroupTab } from "./EmployeePayGroupTab";
import { EmployeeTaxAllowancesTab } from "./EmployeeTaxAllowancesTab";
import { Building2, DollarSign, Receipt } from "lucide-react";

interface EmployeePayInfoTabProps {
  employeeId: string;
  companyId?: string;
}

export function EmployeePayInfoTab({ employeeId, companyId }: EmployeePayInfoTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay Information</CardTitle>
        <CardDescription>Manage bank accounts, pay groups, and tax allowances</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="bank_accounts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="bank_accounts" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Bank Accounts
            </TabsTrigger>
            <TabsTrigger value="pay_groups" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pay Groups
            </TabsTrigger>
            <TabsTrigger value="tax_allowances" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Tax Allowances
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bank_accounts">
            <EmployeeBankAccountsTab employeeId={employeeId} />
          </TabsContent>
          <TabsContent value="pay_groups">
            <EmployeePayGroupTab employeeId={employeeId} />
          </TabsContent>
          <TabsContent value="tax_allowances">
            <EmployeeTaxAllowancesTab employeeId={employeeId} companyId={companyId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
