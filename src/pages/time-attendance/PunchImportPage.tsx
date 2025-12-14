import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";
import { Upload, Download, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ImportBatch {
  id: string;
  file_name: string;
  source_system: string | null;
  total_records: number;
  success_records: number;
  error_records: number;
  status: string;
  created_at: string;
}

interface ParsedPunch {
  employee_id: string;
  badge_number: string;
  punch_time: string;
  punch_type: string;
  valid: boolean;
  error?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-700",
  processing: "bg-blue-500/20 text-blue-700",
  completed: "bg-green-500/20 text-green-700",
  failed: "bg-red-500/20 text-red-700",
};

export default function PunchImportPage() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedPunch[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (profile?.company_id) loadBatches();
  }, [profile?.company_id]);

  const loadBatches = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("punch_import_batches")
      .select("*")
      .eq("company_id", profile?.company_id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setBatches(data);
    setIsLoading(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split("\n").filter(l => l.trim());
    const parsed: ParsedPunch[] = [];

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim().replace(/"/g, ""));
      if (cols.length >= 3) {
        parsed.push({
          employee_id: "",
          badge_number: cols[0],
          punch_time: cols[1],
          punch_type: cols[2]?.toLowerCase() || "clock_in",
          valid: !!cols[0] && !!cols[1],
          error: !cols[0] ? t("timeAttendance.punchImport.missingBadge") : !cols[1] ? t("timeAttendance.punchImport.missingTime") : undefined,
        });
      }
    }

    setParsedData(parsed);
    setShowPreview(true);
  };

  const handleImport = async () => {
    if (!profile?.company_id || parsedData.length === 0) return;
    setIsUploading(true);

    try {
      // Create batch record
      const { data: batch, error } = await supabase
        .from("punch_import_batches")
        .insert({
          company_id: profile.company_id,
          file_name: fileInputRef.current?.files?.[0]?.name || "import.csv",
          total_records: parsedData.length,
          status: "processing",
          imported_by: user?.id,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Process valid punches
      const validPunches = parsedData.filter(p => p.valid);
      let successCount = 0;
      let errorCount = 0;

      for (const punch of validPunches) {
        // Look up employee by badge
        const companyId = String(profile.company_id);
        const badgeNumber = String(punch.badge_number);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profilesTable = supabase.from("profiles") as any;
        const { data: employeeData } = await profilesTable
          .select("id")
          .eq("employee_id", badgeNumber)
          .eq("company_id", companyId)
          .limit(1);

        const employee = employeeData?.[0];
        if (employee) {
          await supabase.from("timeclock_punch_queue").insert({
            device_id: null as unknown as string,
            employee_id: employee.id,
            employee_badge: punch.badge_number,
            punch_time: punch.punch_time,
            punch_type: punch.punch_type,
            processed: false,
          });
          successCount++;
        } else {
          errorCount++;
        }
      }

      // Update batch status
      await supabase.from("punch_import_batches").update({
        status: "completed",
        success_records: successCount,
        error_records: errorCount + parsedData.filter(p => !p.valid).length,
        completed_at: new Date().toISOString(),
      }).eq("id", batch.id);

      toast({ title: t("timeAttendance.punchImport.importCompleted"), description: t("timeAttendance.punchImport.recordsImported", { count: successCount }) });
      setShowPreview(false);
      setParsedData([]);
      loadBatches();
    } catch (error) {
      toast({ title: t("timeAttendance.punchImport.importFailed"), variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = "badge_number,punch_time,punch_type\nEMP001,2024-01-15 09:00:00,clock_in\nEMP001,2024-01-15 17:30:00,clock_out";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "punch_import_template.csv";
    a.click();
  };

  if (isLoading) {
    return <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("navigation.timeAttendance"), href: "/time-attendance" }, { label: t("timeAttendance.punchImport.title") }]} />

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10"><Upload className="h-6 w-6 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">{t("timeAttendance.punchImport.title")}</h1>
            <p className="text-muted-foreground">{t("timeAttendance.punchImport.subtitle")}</p>
          </div>
        </div>

        {!showPreview ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{t("timeAttendance.punchImport.uploadFile")}</CardTitle>
                <CardDescription>{t("timeAttendance.punchImport.uploadDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="max-w-md" />
                  <Button variant="outline" onClick={downloadTemplate}><Download className="h-4 w-4 mr-2" />{t("timeAttendance.punchImport.downloadTemplate")}</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>{t("timeAttendance.punchImport.importHistory")}</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.file")}</TableHead>
                      <TableHead>{t("common.date")}</TableHead>
                      <TableHead>{t("common.total")}</TableHead>
                      <TableHead>{t("common.success")}</TableHead>
                      <TableHead>{t("common.errors")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{t("timeAttendance.punchImport.noImports")}</TableCell></TableRow>
                    ) : batches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">{batch.file_name}</TableCell>
                        <TableCell>{format(parseISO(batch.created_at), "MMM d, yyyy HH:mm")}</TableCell>
                        <TableCell>{batch.total_records}</TableCell>
                        <TableCell className="text-green-600">{batch.success_records}</TableCell>
                        <TableCell className="text-red-600">{batch.error_records}</TableCell>
                        <TableCell><Badge className={statusColors[batch.status]}>{batch.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t("timeAttendance.punchImport.previewImport")}</CardTitle>
              <CardDescription>{t("timeAttendance.punchImport.recordsFound", { total: parsedData.length, valid: parsedData.filter(p => p.valid).length, invalid: parsedData.filter(p => !p.valid).length })}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("timeAttendance.punchImport.badge")}</TableHead>
                      <TableHead>{t("timeAttendance.punchImport.punchTime")}</TableHead>
                      <TableHead>{t("common.type")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 50).map((punch, i) => (
                      <TableRow key={i}>
                        <TableCell>{punch.badge_number}</TableCell>
                        <TableCell>{punch.punch_time}</TableCell>
                        <TableCell>{punch.punch_type}</TableCell>
                        <TableCell>
                          {punch.valid ? (
                            <Badge className="bg-green-500/20 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />{t("common.valid")}</Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-700"><XCircle className="h-3 w-3 mr-1" />{punch.error}</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setShowPreview(false); setParsedData([]); }}>{t("common.cancel")}</Button>
                <Button onClick={handleImport} disabled={isUploading || parsedData.filter(p => p.valid).length === 0}>
                  {isUploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t("timeAttendance.punchImport.importing")}</> : <><Upload className="h-4 w-4 mr-2" />{t("timeAttendance.punchImport.importRecords", { count: parsedData.filter(p => p.valid).length })}</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
