import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, Calendar as CalendarIcon, Download, FileSpreadsheet, 
  FileType, Presentation, Loader2 
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { 
  useReportWriter, 
  ReportTemplate, 
  ReportParameter 
} from '@/hooks/useReportWriter';

interface ReportRunnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ReportTemplate;
}

const OUTPUT_FORMATS = [
  { value: 'pdf', label: 'PDF Document', icon: FileText },
  { value: 'excel', label: 'Excel Spreadsheet', icon: FileSpreadsheet },
  { value: 'csv', label: 'CSV File', icon: FileType },
  { value: 'pptx', label: 'PowerPoint Presentation', icon: Presentation }
];

export function ReportRunnerDialog({
  open,
  onOpenChange,
  template
}: ReportRunnerDialogProps) {
  const { generateReport, isLoading } = useReportWriter();
  
  const [parameters, setParameters] = useState<Record<string, unknown>>({});
  const [outputFormat, setOutputFormat] = useState<'pdf' | 'excel' | 'csv' | 'pptx'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (open && template) {
      // Initialize parameters with default values
      const initialParams: Record<string, unknown> = {};
      template.parameters?.forEach(param => {
        if (param.defaultValue !== undefined) {
          initialParams[param.name] = param.defaultValue;
        }
      });
      setParameters(initialParams);
    }
  }, [open, template]);

  const handleGenerate = async () => {
    // Validate required parameters
    const missingRequired = template.parameters?.filter(
      p => p.required && !parameters[p.name]
    );

    if (missingRequired && missingRequired.length > 0) {
      return;
    }

    setIsGenerating(true);
    const result = await generateReport(template.id, parameters, outputFormat);
    setIsGenerating(false);

    if (result) {
      onOpenChange(false);
    }
  };

  const updateParameter = (name: string, value: unknown) => {
    setParameters(prev => ({ ...prev, [name]: value }));
  };

  const renderParameterInput = (param: ReportParameter) => {
    switch (param.type) {
      case 'text':
        return (
          <Input
            value={(parameters[param.name] as string) || ''}
            onChange={e => updateParameter(param.name, e.target.value)}
            placeholder={`Enter ${param.label.toLowerCase()}`}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={(parameters[param.name] as number) || ''}
            onChange={e => updateParameter(param.name, parseFloat(e.target.value))}
            placeholder={`Enter ${param.label.toLowerCase()}`}
          />
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !parameters[param.name] && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {parameters[param.name] 
                  ? format(new Date(parameters[param.name] as string), 'PPP')
                  : 'Select date'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={parameters[param.name] ? new Date(parameters[param.name] as string) : undefined}
                onSelect={date => updateParameter(param.name, date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'dateRange':
        const range = (parameters[param.name] as { from?: string; to?: string }) || {};
        return (
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'flex-1 justify-start text-left font-normal',
                    !range.from && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {range.from ? format(new Date(range.from), 'PP') : 'From'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={range.from ? new Date(range.from) : undefined}
                  onSelect={date => updateParameter(param.name, { ...range, from: date?.toISOString() })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'flex-1 justify-start text-left font-normal',
                    !range.to && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {range.to ? format(new Date(range.to), 'PP') : 'To'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={range.to ? new Date(range.to) : undefined}
                  onSelect={date => updateParameter(param.name, { ...range, to: date?.toISOString() })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case 'select':
        return (
          <Select
            value={(parameters[param.name] as string) || ''}
            onValueChange={value => updateParameter(param.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${param.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            value={(parameters[param.name] as string) || ''}
            onChange={e => updateParameter(param.name, e.target.value)}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Run Report: {template.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {template.parameters && template.parameters.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Report Parameters</h4>
              {template.parameters.map(param => (
                <div key={param.name} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    {param.label}
                    {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                  </Label>
                  {renderParameterInput(param)}
                </div>
              ))}
            </div>
          )}

          {template.parameters && template.parameters.length > 0 && <Separator />}

          <div className="space-y-4">
            <h4 className="font-medium">Output Format</h4>
            <div className="grid grid-cols-2 gap-2">
              {OUTPUT_FORMATS.map(format => {
                const Icon = format.icon;
                return (
                  <Button
                    key={format.value}
                    type="button"
                    variant={outputFormat === format.value ? 'default' : 'outline'}
                    className="justify-start"
                    onClick={() => setOutputFormat(format.value as typeof outputFormat)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {format.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isLoading || isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
