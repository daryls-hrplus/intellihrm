import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

interface LeaveHistoryExportProps {
  companyId?: string;
}

const EXPORT_FIELDS = [
  { key: 'request_number', label: 'Request Number' },
  { key: 'employee_name', label: 'Employee Name' },
  { key: 'employee_email', label: 'Employee Email' },
  { key: 'leave_type', label: 'Leave Type' },
  { key: 'start_date', label: 'Start Date' },
  { key: 'end_date', label: 'End Date' },
  { key: 'duration', label: 'Duration (Days)' },
  { key: 'status', label: 'Status' },
  { key: 'reason', label: 'Reason' },
  { key: 'submitted_at', label: 'Submitted Date' },
  { key: 'reviewed_by', label: 'Reviewed By' },
  { key: 'reviewed_at', label: 'Reviewed Date' },
];

export function LeaveHistoryExport({ companyId }: LeaveHistoryExportProps) {
  const { company } = useAuth();
  const effectiveCompanyId = companyId || company?.id;
  
  const [isExporting, setIsExporting] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedFields, setSelectedFields] = useState<string[]>(EXPORT_FIELDS.map(f => f.key));
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  const toggleField = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleExport = async () => {
    if (!effectiveCompanyId) return;
    
    setIsExporting(true);
    try {
      // Build query
      let query = (supabase
        .from("leave_requests")
        .select(`
          *,
          leave_type:leave_types(name, code),
          employee:profiles!leave_requests_employee_id_fkey(full_name, email),
          reviewer:profiles!leave_requests_reviewed_by_fkey(full_name)
        `) as any)
        .eq("company_id", effectiveCompanyId)
        .order("created_at", { ascending: false });
      
      if (dateFrom) {
        query = query.gte("start_date", dateFrom);
      }
      if (dateTo) {
        query = query.lte("end_date", dateTo);
      }
      if (status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform data
      const transformedData = (data || []).map((row: any) => {
        const record: Record<string, any> = {};
        selectedFields.forEach(field => {
          switch (field) {
            case 'request_number':
              record[field] = row.request_number;
              break;
            case 'employee_name':
              record[field] = row.employee?.full_name || '';
              break;
            case 'employee_email':
              record[field] = row.employee?.email || '';
              break;
            case 'leave_type':
              record[field] = row.leave_type?.name || '';
              break;
            case 'start_date':
              record[field] = row.start_date;
              break;
            case 'end_date':
              record[field] = row.end_date;
              break;
            case 'duration':
              record[field] = row.duration;
              break;
            case 'status':
              record[field] = row.status;
              break;
            case 'reason':
              record[field] = row.reason || '';
              break;
            case 'submitted_at':
              record[field] = row.submitted_at || '';
              break;
            case 'reviewed_by':
              record[field] = row.reviewer?.full_name || '';
              break;
            case 'reviewed_at':
              record[field] = row.reviewed_at || '';
              break;
          }
        });
        return record;
      });

      // Generate export
      let content: string;
      let mimeType: string;
      let fileExtension: string;

      if (exportFormat === 'csv') {
        const headers = selectedFields.map(f => EXPORT_FIELDS.find(ef => ef.key === f)?.label || f);
        const csvRows = [headers.join(',')];
        transformedData.forEach(row => {
          const values = selectedFields.map(field => {
            const value = row[field];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value ?? '';
          });
          csvRows.push(values.join(','));
        });
        content = csvRows.join('\n');
        mimeType = 'text/csv';
        fileExtension = 'csv';
      } else {
        content = JSON.stringify(transformedData, null, 2);
        mimeType = 'application/json';
        fileExtension = 'json';
      }

      // Download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leave_history_export_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.${fileExtension}`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Exported ${transformedData.length} records`);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Export Leave History
        </CardTitle>
        <CardDescription>Download leave request data for reporting and analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>From Date</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>To Date</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={exportFormat} onValueChange={(v: 'csv' | 'json') => setExportFormat(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Field Selection */}
        <div className="space-y-2">
          <Label>Fields to Export</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 border rounded-lg">
            {EXPORT_FIELDS.map(field => (
              <div key={field.key} className="flex items-center gap-2">
                <Checkbox
                  id={field.key}
                  checked={selectedFields.includes(field.key)}
                  onCheckedChange={() => toggleField(field.key)}
                />
                <label htmlFor={field.key} className="text-sm cursor-pointer">
                  {field.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <Button 
          onClick={handleExport} 
          disabled={isExporting || selectedFields.length === 0}
          className="w-full md:w-auto"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isExporting ? 'Exporting...' : 'Export Leave History'}
        </Button>
      </CardContent>
    </Card>
  );
}
