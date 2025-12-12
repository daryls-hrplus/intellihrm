import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { FileText } from 'lucide-react';
import { ReportTemplatesList } from './ReportTemplatesList';

interface ModuleReportsButtonProps {
  module: string;
  companyId?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ModuleReportsButton({ 
  module, 
  companyId,
  variant = 'outline',
  size = 'default',
  className
}: ModuleReportsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <FileText className="h-4 w-4 mr-2" />
          Reports
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[800px] sm:max-w-[800px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Module Reports
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <ReportTemplatesList 
            module={module} 
            companyId={companyId}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
