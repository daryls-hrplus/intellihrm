import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, X, Plus, Minus, ArrowLeft, Loader2 } from 'lucide-react';

const ALL_MODULES = [
  { code: 'workforce', name: 'Workforce Management', description: 'Employee data, org structure' },
  { code: 'leave', name: 'Leave Management', description: 'Leave requests and balances' },
  { code: 'ess', name: 'Employee Self-Service', description: 'Employee portal' },
  { code: 'mss', name: 'Manager Self-Service', description: 'Manager portal' },
  { code: 'compensation', name: 'Compensation', description: 'Salary and pay management' },
  { code: 'payroll', name: 'Payroll', description: 'Payroll processing' },
  { code: 'time_attendance', name: 'Time & Attendance', description: 'Clock in/out, timesheets' },
  { code: 'benefits', name: 'Benefits', description: 'Employee benefits' },
  { code: 'performance', name: 'Performance', description: 'Reviews, goals, feedback' },
  { code: 'training', name: 'Training & LMS', description: 'Learning management' },
  { code: 'succession', name: 'Succession Planning', description: 'Talent management' },
  { code: 'recruitment', name: 'Recruitment', description: 'Hiring and onboarding' },
  { code: 'hse', name: 'Health & Safety', description: 'Workplace safety' },
  { code: 'employee_relations', name: 'Employee Relations', description: 'Grievances, recognition' },
  { code: 'property', name: 'Company Property', description: 'Asset management' }
];

const MODULE_PRICE = 15; // Per module per month base
const MODULE_PRICE_PER_EMPLOYEE = 0.50; // Per module per employee

export default function UpgradePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, company } = useAuth();
  const { subscription, tiers, isLoading, calculatePrice } = useSubscription();

  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [employeeCount, setEmployeeCount] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subscription) {
      setSelectedModules(subscription.selected_modules || []);
      setEmployeeCount(subscription.active_employee_count || 10);
    }
  }, [subscription]);

  const currentTier = tiers.find(t => t.id === subscription?.tier_id);
  const currentModules = currentTier?.modules || [];

  const toggleModule = (moduleCode: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleCode)
        ? prev.filter(m => m !== moduleCode)
        : [...prev, moduleCode]
    );
  };

  const addedModules = selectedModules.filter(m => !currentModules.includes(m));
  const removedModules = currentModules.filter(m => !selectedModules.includes(m));
  
  const calculateModulePrice = (count: number) => {
    const basePrice = count * MODULE_PRICE;
    const employeePrice = count * MODULE_PRICE_PER_EMPLOYEE * employeeCount;
    return basePrice + employeePrice;
  };

  const currentPrice = subscription?.monthly_amount || 0;
  const addedPrice = calculateModulePrice(addedModules.length);
  const removedPrice = calculateModulePrice(removedModules.length);
  const newPrice = currentPrice + addedPrice - removedPrice;
  const priceDifference = newPrice - currentPrice;

  const handleSubmitChange = async () => {
    if (!subscription?.id) return;

    setIsSubmitting(true);
    try {
      // Record the change request
      const { error: changeError } = await supabase
        .from('subscription_changes')
        .insert({
          subscription_id: subscription.id,
          change_type: addedModules.length > removedModules.length ? 'upgrade' : 'downgrade',
          old_modules: currentModules,
          new_modules: selectedModules,
          old_employee_count: subscription.active_employee_count,
          new_employee_count: employeeCount,
          old_amount: currentPrice,
          new_amount: newPrice,
          status: 'pending',
          requested_by: user?.id
        });

      if (changeError) throw changeError;

      // Update subscription
      const { error: subError } = await supabase
        .from('company_subscriptions')
        .update({
          selected_modules: selectedModules,
          active_employee_count: employeeCount,
          monthly_amount: newPrice
        })
        .eq('id', subscription.id);

      if (subError) throw subError;

      toast({
        title: "Subscription Updated",
        description: "Your module selection has been updated successfully."
      });

      navigate('/admin');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Upgrade Your Plan</h1>
          <p className="text-muted-foreground">
            Add or remove modules to customize your subscription
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Module Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Modules</CardTitle>
                <CardDescription>
                  Choose the modules you want to include in your subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label>Number of Employees</Label>
                  <Input
                    type="number"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-32 mt-1"
                    min={1}
                  />
                </div>
                <Separator className="my-4" />
                <div className="space-y-3">
                  {ALL_MODULES.map((module) => {
                    const isIncluded = currentModules.includes(module.code);
                    const isSelected = selectedModules.includes(module.code);
                    const isAdded = isSelected && !isIncluded;
                    const isRemoved = !isSelected && isIncluded;

                    return (
                      <div
                        key={module.code}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors
                          ${isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'}
                          ${isRemoved ? 'opacity-50' : ''}
                        `}
                        onClick={() => toggleModule(module.code)}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox checked={isSelected} />
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {module.name}
                              {isIncluded && (
                                <Badge variant="secondary" className="text-xs">Current</Badge>
                              )}
                              {isAdded && (
                                <Badge className="text-xs bg-green-100 text-green-800">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Adding
                                </Badge>
                              )}
                              {isRemoved && (
                                <Badge variant="destructive" className="text-xs">
                                  <Minus className="h-3 w-3 mr-1" />
                                  Removing
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">{module.description}</div>
                          </div>
                        </div>
                        {!isIncluded && (
                          <div className="text-sm text-muted-foreground">
                            +${(MODULE_PRICE + MODULE_PRICE_PER_EMPLOYEE * employeeCount).toFixed(2)}/mo
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Plan</span>
                    <span>{currentTier?.name || 'Custom'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Price</span>
                    <span>${currentPrice.toFixed(2)}/mo</span>
                  </div>
                </div>

                {addedModules.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-green-800 mb-2">Adding:</div>
                    {addedModules.map(m => (
                      <div key={m} className="text-sm text-green-700 flex items-center gap-1">
                        <Plus className="h-3 w-3" />
                        {ALL_MODULES.find(mod => mod.code === m)?.name}
                      </div>
                    ))}
                    <div className="text-sm font-medium text-green-800 mt-2">
                      +${addedPrice.toFixed(2)}/mo
                    </div>
                  </div>
                )}

                {removedModules.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-red-800 mb-2">Removing:</div>
                    {removedModules.map(m => (
                      <div key={m} className="text-sm text-red-700 flex items-center gap-1">
                        <Minus className="h-3 w-3" />
                        {ALL_MODULES.find(mod => mod.code === m)?.name}
                      </div>
                    ))}
                    <div className="text-sm font-medium text-red-800 mt-2">
                      -${removedPrice.toFixed(2)}/mo
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>New Total</span>
                  <span>${newPrice.toFixed(2)}/mo</span>
                </div>

                {priceDifference !== 0 && (
                  <div className={`text-sm ${priceDifference > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    {priceDifference > 0 ? '+' : ''}{priceDifference.toFixed(2)}/mo difference
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  disabled={isSubmitting || (addedModules.length === 0 && removedModules.length === 0)}
                  onClick={handleSubmitChange}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Changes'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
