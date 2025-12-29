import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Loader2, FileText, Download, XCircle, Search, 
  CheckCircle, Clock, AlertTriangle, RefreshCw, Stamp
} from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CFDIRecord {
  id: string;
  payroll_record_id: string;
  company_id: string;
  employee_id: string;
  cfdi_uuid: string | null;
  folio: string | null;
  serie: string | null;
  xml_content: string | null;
  pdf_url: string | null;
  timbrado_date: string | null;
  pac_provider: string | null;
  sat_seal: string | null;
  cfdi_status: string;
  cancellation_status: string | null;
  cancellation_date: string | null;
  cancellation_reason: string | null;
  related_cfdi_uuid: string | null;
  version: string | null;
  nomina_version: string | null;
  created_at: string;
  updated_at: string;
}

interface CFDIDashboardProps {
  companyId: string;
  payrollRunId?: string;
}

const CANCELLATION_REASONS = [
  { code: '01', label: 'Comprobante emitido con errores con relación' },
  { code: '02', label: 'Comprobante emitido con errores sin relación' },
  { code: '03', label: 'No se llevó a cabo la operación' },
  { code: '04', label: 'Operación nominativa relacionada en una factura global' }
];

export function CFDIDashboard({ companyId, payrollRunId }: CFDIDashboardProps) {
  const [records, setRecords] = useState<CFDIRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isStampingAll, setIsStampingAll] = useState(false);
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; record: CFDIRecord | null }>({ open: false, record: null });
  const [cancelReason, setCancelReason] = useState('02');
  const [cancelNotes, setCancelNotes] = useState('');
  const { toast } = useToast();

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('mx_cfdi_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (payrollRunId) {
        query = query.eq('payroll_record_id', payrollRunId);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching CFDI records:', error);
      toast({
        title: 'Error loading CFDI records',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [companyId, payrollRunId]);

  const getStatusBadge = (status: string, cancellationStatus: string | null) => {
    if (cancellationStatus === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    if (cancellationStatus === 'pending_cancellation') {
      return <Badge variant="outline" className="text-orange-500 border-orange-500">Cancellation Pending</Badge>;
    }
    
    switch (status) {
      case 'stamped':
        return <Badge className="bg-green-500">Stamped</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'stamped':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleStamp = async (recordId: string) => {
    setIsProcessing(recordId);
    try {
      const { data, error } = await supabase.functions.invoke('mx-cfdi-stamp', {
        body: { cfdiRecordId: recordId, companyId }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: 'CFDI stamped successfully',
          description: `UUID: ${data.uuid}`
        });
      } else {
        throw new Error(data?.error || 'Stamping failed');
      }
      
      await fetchRecords();
    } catch (error) {
      toast({
        title: 'Stamping failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleStampAll = async () => {
    const pendingRecords = records.filter(r => r.cfdi_status === 'pending');
    if (pendingRecords.length === 0) return;

    setIsStampingAll(true);
    let successCount = 0;
    let errorCount = 0;

    for (const record of pendingRecords) {
      try {
        const { data, error } = await supabase.functions.invoke('mx-cfdi-stamp', {
          body: { cfdiRecordId: record.id, companyId }
        });

        if (error || !data?.success) {
          errorCount++;
        } else {
          successCount++;
        }
      } catch {
        errorCount++;
      }
    }

    toast({
      title: 'Batch stamping complete',
      description: `${successCount} stamped, ${errorCount} errors`
    });

    await fetchRecords();
    setIsStampingAll(false);
  };

  const handleCancel = async () => {
    if (!cancelDialog.record) return;

    setIsProcessing(cancelDialog.record.id);
    try {
      const { data, error } = await supabase.functions.invoke('mx-cfdi-cancel', {
        body: { 
          cfdiRecordId: cancelDialog.record.id, 
          companyId,
          reasonCode: cancelReason,
          notes: cancelNotes
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: 'Cancellation initiated',
          description: data.message || 'CFDI cancellation request submitted'
        });
      } else {
        throw new Error(data?.error || 'Cancellation failed');
      }
      
      await fetchRecords();
    } catch (error) {
      toast({
        title: 'Cancellation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(null);
      setCancelDialog({ open: false, record: null });
      setCancelReason('02');
      setCancelNotes('');
    }
  };

  const handleDownloadXML = async (record: CFDIRecord) => {
    if (!record.xml_content) {
      toast({
        title: 'No XML available',
        description: 'This CFDI has not been stamped yet',
        variant: 'destructive'
      });
      return;
    }
    
    const blob = new Blob([record.xml_content], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CFDI_${record.cfdi_uuid || record.folio || record.id}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'XML Downloaded',
      description: `CFDI ${record.cfdi_uuid?.substring(0, 8) || record.folio} downloaded`
    });
  };

  const handleDownloadPDF = async (record: CFDIRecord) => {
    if (!record.cfdi_uuid) {
      toast({
        title: 'No PDF available',
        description: 'This CFDI has not been stamped yet',
        variant: 'destructive'
      });
      return;
    }
    
    toast({
      title: 'Generating PDF',
      description: 'PDF generation in progress...'
    });

    // In production, this would call an edge function to generate the PDF
    try {
      const { data, error } = await supabase.functions.invoke('mx-cfdi-generate-pdf', {
        body: { cfdiRecordId: record.id, companyId }
      });

      if (error) throw error;
      
      if (data?.pdfBase64) {
        const byteCharacters = atob(data.pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CFDI_${record.cfdi_uuid || record.folio || record.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast({
        title: 'PDF generation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  const filteredRecords = records.filter(record => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      record.cfdi_uuid?.toLowerCase().includes(search) ||
      record.folio?.toLowerCase().includes(search) ||
      record.serie?.toLowerCase().includes(search)
    );
  });

  const pendingCount = records.filter(r => r.cfdi_status === 'pending').length;
  const stampedCount = records.filter(r => r.cfdi_status === 'stamped').length;
  const errorCount = records.filter(r => r.cfdi_status === 'error').length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total CFDIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Stamped
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stampedCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{errorCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                CFDI Records
              </CardTitle>
              <CardDescription>
                Electronic payroll receipts (Comprobantes Fiscales Digitales)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchRecords} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {pendingCount > 0 && (
                <Button size="sm" onClick={handleStampAll} disabled={isStampingAll}>
                  {isStampingAll && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Stamp className="h-4 w-4 mr-2" />
                  Stamp All Pending ({pendingCount})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by UUID, folio, or serie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No CFDI records found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Serie / Folio</TableHead>
                  <TableHead>UUID</TableHead>
                  <TableHead>Stamped Date</TableHead>
                  <TableHead>PAC</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.cfdi_status)}
                        {getStatusBadge(record.cfdi_status, record.cancellation_status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.serie && record.folio 
                        ? `${record.serie}-${record.folio}`
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {record.cfdi_uuid 
                        ? `${record.cfdi_uuid.substring(0, 8)}...`
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {record.timbrado_date 
                        ? format(new Date(record.timbrado_date), 'PPp')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {record.pac_provider || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {record.cfdi_status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStamp(record.id)}
                            disabled={isProcessing === record.id}
                          >
                            {isProcessing === record.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Stamp'
                            )}
                          </Button>
                        )}
                        {record.cfdi_status === 'stamped' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownloadXML(record)}
                              title="Download XML"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDownloadPDF(record)}
                              title="Download PDF"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            {!record.cancellation_status && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                title="Cancel CFDI"
                                onClick={() => setCancelDialog({ open: true, record })}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                        {record.cfdi_status === 'error' && (
                          <span className="text-xs text-destructive max-w-[200px] truncate">
                            Error - check logs
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={cancelDialog.open} onOpenChange={(open) => !open && setCancelDialog({ open: false, record: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel CFDI</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to cancel CFDI {cancelDialog.record?.cfdi_uuid?.substring(0, 8)}...
              This action will notify the SAT and may require recipient acceptance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Cancellation Reason (SAT)</Label>
              <Select value={cancelReason} onValueChange={setCancelReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CANCELLATION_REASONS.map((reason) => (
                    <SelectItem key={reason.code} value={reason.code}>
                      {reason.code} - {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea 
                value={cancelNotes}
                onChange={(e) => setCancelNotes(e.target.value)}
                placeholder="Internal notes for this cancellation..."
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Keep CFDI</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancel}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isProcessing === cancelDialog.record?.id}
            >
              {isProcessing === cancelDialog.record?.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Cancel CFDI
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
