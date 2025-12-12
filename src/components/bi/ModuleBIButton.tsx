import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { BarChart3 } from 'lucide-react';
import { BIDashboardsList } from './BIDashboardsList';

interface ModuleBIButtonProps {
  module: string;
  companyId?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ModuleBIButton({ 
  module, 
  companyId,
  variant = 'outline',
  size = 'default',
  className
}: ModuleBIButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <BarChart3 className="h-4 w-4 mr-2" />
          BI Tool
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[900px] sm:max-w-[900px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Business Intelligence
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <BIDashboardsList 
            module={module} 
            companyId={companyId}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
