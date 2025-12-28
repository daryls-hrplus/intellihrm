import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, FileText, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { ResumptionOfDuty, useRODMutations } from "@/hooks/useResumptionOfDuty";
import { formatDateForDisplay, getTodayString } from "@/utils/dateUtils";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  fitToWork: z.boolean(),
  actualResumptionDate: z.string().min(1, "Please enter your actual resumption date"),
  employeeNotes: z.string().optional(),
  medicalClearanceNotes: z.string().optional()
});

interface ResumptionOfDutyFormProps {
  rod: ResumptionOfDuty;
  onSuccess?: () => void;
}

export function ResumptionOfDutyForm({ rod, onSuccess }: ResumptionOfDutyFormProps) {
  const { t } = useTranslation();
  const { submitRod } = useRODMutations();
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fitToWork: true,
      actualResumptionDate: getTodayString(),
      employeeNotes: "",
      medicalClearanceNotes: ""
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${rod.employee_id}/${rod.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(`medical-clearances/${fileName}`, file);

      if (uploadError) throw uploadError;
      setUploadedFile(`medical-clearances/${fileName}`);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (rod.requires_medical_clearance && !uploadedFile) {
      form.setError("root", { message: "Medical clearance document is required" });
      return;
    }

    await submitRod.mutateAsync({
      rodId: rod.id,
      fitToWork: values.fitToWork,
      actualResumptionDate: values.actualResumptionDate,
      employeeNotes: values.employeeNotes,
      medicalClearanceFilePath: uploadedFile || undefined,
      medicalClearanceNotes: values.medicalClearanceNotes
    });

    onSuccess?.();
  };

  const leaveType = rod.leave_requests?.leave_types?.name || "Leave";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resumption of Duty Form
            </CardTitle>
            <CardDescription>
              {leaveType} • {rod.leave_requests?.request_number}
            </CardDescription>
          </div>
          <Badge variant={rod.status === 'rejected' ? 'destructive' : 'secondary'}>
            {rod.status === 'rejected' ? 'Returned' : 'Action Required'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {rod.status === 'rejected' && rod.rejection_reason && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Returned by manager:</strong> {rod.rejection_reason}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Leave Period</p>
            <p className="font-medium">
              {formatDateForDisplay(rod.leave_requests?.start_date)} - {formatDateForDisplay(rod.leave_requests?.end_date)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-medium">{rod.leave_requests?.duration} day(s)</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Expected Return</p>
            <p className="font-medium">{formatDateForDisplay(rod.leave_end_date)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Medical Clearance</p>
            <p className="font-medium">{rod.requires_medical_clearance ? 'Required' : 'Not Required'}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="actualResumptionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Actual Resumption Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>The date you actually returned to work</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fitToWork"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Fit to Work Declaration</FormLabel>
                    <FormDescription>
                      I confirm that I am fit and ready to resume my duties
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {rod.requires_medical_clearance && (
              <div className="space-y-4 p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Medical Clearance Required</span>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Medical Clearance Document</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="flex-1"
                    />
                    {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {uploadedFile && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                  </div>
                  {uploadedFile && (
                    <p className="text-sm text-green-600">Document uploaded successfully</p>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="medicalClearanceNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional notes regarding your medical clearance..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="employeeNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any comments or notes about your return to work..."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={submitRod.isPending}
            >
              {submitRod.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Resumption of Duty'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
