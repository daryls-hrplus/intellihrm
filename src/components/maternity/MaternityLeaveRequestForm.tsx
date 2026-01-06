import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Baby, 
  Calendar, 
  ArrowLeft, 
  Save, 
  User, 
  MapPin,
  AlertCircle,
  Clock,
  DollarSign,
  FileText
} from "lucide-react";
import { format, addWeeks, addDays, differenceInDays } from "date-fns";
import { 
  useCreateMaternityLeaveRequest, 
  useMaternityComplianceRule,
  useMaternityPaymentConfigs 
} from "@/hooks/useMaternityLeave";
import { REGION_LABELS, type ComplianceRegion } from "@/types/maternityLeave";
import { getCountryLanguage } from "@/lib/countryLanguages";

interface Props {
  companyId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

// Country to region mapping
const countryToRegion: Record<string, ComplianceRegion> = {
  TT: "caribbean", JM: "caribbean", BB: "caribbean", GY: "caribbean", BS: "caribbean",
  LC: "caribbean", GD: "caribbean", VC: "caribbean", AG: "caribbean", KN: "caribbean",
  DO: "latin_america", MX: "latin_america", CO: "latin_america", BR: "latin_america",
  AR: "latin_america", PE: "latin_america", CL: "latin_america", EC: "latin_america",
  NG: "africa", GH: "africa", ZA: "africa", KE: "africa", TZ: "africa",
  UG: "africa", RW: "africa", ZM: "africa", ZW: "africa",
};

export function MaternityLeaveRequestForm({ companyId, onCancel, onSuccess }: Props) {
  const [employeeId, setEmployeeId] = useState("");
  const [expectedDueDate, setExpectedDueDate] = useState<Date | undefined>();
  const [pregnancyConfirmationDate, setPregnancyConfirmationDate] = useState<Date | undefined>();
  const [numberOfChildren, setNumberOfChildren] = useState(1);
  const [countryCode, setCountryCode] = useState("");
  const [paymentConfigId, setPaymentConfigId] = useState("");
  const [phasedReturnEnabled, setPhasedReturnEnabled] = useState(false);
  const [notes, setNotes] = useState("");

  const createRequest = useCreateMaternityLeaveRequest();
  const { data: complianceRule } = useMaternityComplianceRule(countryCode);
  const { data: paymentConfigs = [] } = useMaternityPaymentConfigs(companyId);

  // Fetch female employees only
  const { data: employees = [] } = useQuery({
    queryKey: ["female-employees", companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, employee_id, gender")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .in("gender", ["Female", "female", "F"])
        .order("first_name");
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });

  // Countries with compliance rules
  const { data: countries = [] } = useQuery({
    queryKey: ["maternity-countries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maternity_compliance_rules")
        .select("country_code, region")
        .eq("is_active", true)
        .order("country_code");
      if (error) throw error;
      return data;
    },
  });

  const region = countryCode ? countryToRegion[countryCode] : undefined;

  // Calculate leave dates based on compliance rules
  const calculateLeaveDates = () => {
    if (!expectedDueDate || !complianceRule) return null;

    const prenatalWeeks = complianceRule.mandatory_prenatal_weeks || 6;
    const postnatalWeeks = complianceRule.mandatory_postnatal_weeks || 8;
    const totalWeeks = complianceRule.legal_minimum_weeks;

    const prenatalStart = addWeeks(expectedDueDate, -prenatalWeeks);
    const prenatalEnd = addDays(expectedDueDate, -1);
    const postnatalStart = expectedDueDate;
    const postnatalEnd = addWeeks(expectedDueDate, postnatalWeeks);
    const plannedReturn = addDays(postnatalEnd, 1);

    return {
      prenatalStart,
      prenatalEnd,
      postnatalStart,
      postnatalEnd,
      plannedReturn,
      totalDays: differenceInDays(postnatalEnd, prenatalStart) + 1,
      prenatalWeeks,
      postnatalWeeks,
      totalWeeks,
    };
  };

  const leaveDates = calculateLeaveDates();

  const handleSubmit = async () => {
    if (!employeeId || !expectedDueDate || !countryCode) return;

    await createRequest.mutateAsync({
      company_id: companyId,
      employee_id: employeeId,
      expected_due_date: format(expectedDueDate, "yyyy-MM-dd"),
      pregnancy_confirmation_date: pregnancyConfirmationDate 
        ? format(pregnancyConfirmationDate, "yyyy-MM-dd") 
        : undefined,
      number_of_children: numberOfChildren,
      country_code: countryCode,
      compliance_region: region,
      prenatal_start_date: leaveDates ? format(leaveDates.prenatalStart, "yyyy-MM-dd") : undefined,
      prenatal_end_date: leaveDates ? format(leaveDates.prenatalEnd, "yyyy-MM-dd") : undefined,
      postnatal_start_date: leaveDates ? format(leaveDates.postnatalStart, "yyyy-MM-dd") : undefined,
      postnatal_end_date: leaveDates ? format(leaveDates.postnatalEnd, "yyyy-MM-dd") : undefined,
      planned_return_date: leaveDates ? format(leaveDates.plannedReturn, "yyyy-MM-dd") : undefined,
      total_leave_days: leaveDates?.totalDays,
      statutory_payment_weeks: complianceRule?.legal_minimum_weeks,
      payment_config_id: paymentConfigId || undefined,
      phased_return_enabled: phasedReturnEnabled,
      notes: notes || undefined,
    });

    onSuccess();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Baby className="h-6 w-6 text-pink-500" />
            New Maternity Leave Request
          </h1>
          <p className="text-muted-foreground">
            Create a maternity leave request with regional compliance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employee Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select value={employeeId} onValueChange={setEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                        {emp.employee_id && ` (${emp.employee_id})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {employees.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No female employees found in this company
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expected Due Date *</Label>
                  <DatePicker
                    value={expectedDueDate ? format(expectedDueDate, "yyyy-MM-dd") : ""}
                    onChange={(val) => setExpectedDueDate(val ? new Date(val) : undefined)}
                    placeholder="Select due date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pregnancy Confirmation Date</Label>
                  <DatePicker
                    value={pregnancyConfirmationDate ? format(pregnancyConfirmationDate, "yyyy-MM-dd") : ""}
                    onChange={(val) => setPregnancyConfirmationDate(val ? new Date(val) : undefined)}
                    placeholder="Select date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Number of Children</Label>
                <Select 
                  value={numberOfChildren.toString()} 
                  onValueChange={(v) => setNumberOfChildren(parseInt(v))}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 (Single)</SelectItem>
                    <SelectItem value="2">2 (Twins)</SelectItem>
                    <SelectItem value="3">3 (Triplets)</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Regional Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Regional Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Country *</Label>
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.country_code} value={c.country_code}>
                        {c.country_code} - {getCountryLanguage(c.country_code)} ({REGION_LABELS[c.region as ComplianceRegion]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {complianceRule && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">
                        {complianceRule.country_code} Legal Requirements ({REGION_LABELS[complianceRule.region as ComplianceRegion]})
                      </p>
                      <ul className="text-sm space-y-1">
                        <li>• Minimum leave: <strong>{complianceRule.legal_minimum_weeks} weeks</strong></li>
                        <li>• Payment: <strong>{complianceRule.legal_payment_percentage}%</strong> of salary</li>
                        <li>• Pre-natal: {complianceRule.mandatory_prenatal_weeks} weeks</li>
                        <li>• Post-natal: {complianceRule.mandatory_postnatal_weeks} weeks</li>
                        {complianceRule.nursing_breaks_daily && (
                          <li>
                            • Nursing breaks: {complianceRule.nursing_breaks_daily}x {complianceRule.nursing_break_duration_minutes} mins/day 
                            for {complianceRule.nursing_breaks_until_months} months
                          </li>
                        )}
                        {complianceRule.legislation_reference && (
                          <li className="text-muted-foreground">
                            Ref: {complianceRule.legislation_reference}
                          </li>
                        )}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Payment Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5" />
                Payment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Plan</Label>
                <Select value={paymentConfigId} onValueChange={setPaymentConfigId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment configuration (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Use Statutory Only</SelectItem>
                    {paymentConfigs
                      .filter((c) => c.country_code === countryCode)
                      .map((config) => (
                        <SelectItem key={config.id} value={config.id}>
                          {config.config_name}
                          {config.employer_topup_enabled && " (with Top-up)"}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Return to Work */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Return to Work Planning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Phased Return</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow gradual return with reduced hours
                  </p>
                </div>
                <Switch
                  checked={phasedReturnEnabled}
                  onCheckedChange={setPhasedReturnEnabled}
                />
              </div>

              {phasedReturnEnabled && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    A detailed phased return plan can be configured after the request is approved.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes or special requirements..."
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Leave Summary */}
        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Leave Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!expectedDueDate || !complianceRule ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Select an employee, due date, and country to see the leave schedule
                </p>
              ) : leaveDates ? (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Expected Due Date</span>
                      <span className="font-medium">
                        {format(expectedDueDate, "MMM d, yyyy")}
                      </span>
                    </div>
                    <Separator />
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-purple-600">Pre-natal Leave</p>
                      <div className="pl-3 border-l-2 border-purple-200 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Start</span>
                          <span>{format(leaveDates.prenatalStart, "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">End</span>
                          <span>{format(leaveDates.prenatalEnd, "MMM d, yyyy")}</span>
                        </div>
                        <Badge variant="outline" className="mt-1">
                          {leaveDates.prenatalWeeks} weeks
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-pink-600">Post-natal Leave</p>
                      <div className="pl-3 border-l-2 border-pink-200 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Start</span>
                          <span>{format(leaveDates.postnatalStart, "MMM d, yyyy")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">End</span>
                          <span>{format(leaveDates.postnatalEnd, "MMM d, yyyy")}</span>
                        </div>
                        <Badge variant="outline" className="mt-1">
                          {leaveDates.postnatalWeeks} weeks
                        </Badge>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Leave</span>
                      <Badge className="bg-pink-100 text-pink-800">
                        {leaveDates.totalDays} days ({leaveDates.totalWeeks} weeks)
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Planned Return</span>
                      <span className="font-medium text-green-600">
                        {format(leaveDates.plannedReturn, "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>

                  {complianceRule.required_documents && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-2">Required Documents</p>
                        <div className="flex flex-wrap gap-1">
                          {(complianceRule.required_documents as string[]).map((doc) => (
                            <Badge key={doc} variant="secondary" className="text-xs">
                              {doc.replace(/_/g, " ")}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : null}

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onCancel}>
                  Cancel
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleSubmit}
                  disabled={!employeeId || !expectedDueDate || !countryCode || createRequest.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {createRequest.isPending ? "Creating..." : "Create Request"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
