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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Users, CreditCard, Building, Clock, ArrowRight } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const MODULE_LABELS: Record<string, string> = {
  workforce: 'Workforce Management',
  leave: 'Leave Management',
  ess: 'Employee Self-Service',
  mss: 'Manager Self-Service',
  compensation: 'Compensation',
  payroll: 'Payroll',
  time_attendance: 'Time & Attendance',
  benefits: 'Benefits',
  performance: 'Performance',
  training: 'Training & LMS',
  succession: 'Succession Planning',
  recruitment: 'Recruitment',
  hse: 'Health & Safety',
  employee_relations: 'Employee Relations',
  property: 'Company Property'
};

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, company } = useAuth();
  const { subscription, tiers, isLoading, calculatePrice, getDaysRemaining } = useSubscription();
  
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [employeeCount, setEmployeeCount] = useState(10);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'wire_transfer'>('credit_card');
  const [step, setStep] = useState<'plan' | 'details' | 'confirm'>('plan');
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subscription?.tier_id) {
      setSelectedTier(subscription.tier_id);
    }
    if (subscription?.active_employee_count) {
      setEmployeeCount(subscription.active_employee_count);
    }
    if (subscription?.billing_cycle) {
      setBillingCycle(subscription.billing_cycle);
    }
    if (subscription?.contact_name) {
      setContactInfo({
        name: subscription.contact_name || '',
        email: subscription.contact_email || '',
        phone: subscription.contact_phone || '',
        address: subscription.billing_address || ''
      });
    }
  }, [subscription]);

  const selectedTierData = tiers.find(t => t.id === selectedTier);
  const pricing = selectedTierData ? calculatePrice(selectedTierData, employeeCount, billingCycle) : null;

  const handleSubmitSubscription = async () => {
    if (!selectedTier || !company?.id) return;
    
    setIsSubmitting(true);
    try {
      const tier = tiers.find(t => t.id === selectedTier);
      if (!tier) throw new Error('Invalid tier selected');

      const pricing = calculatePrice(tier, employeeCount, billingCycle);
      
      // Create or update subscription
      const subscriptionData = {
        company_id: company.id,
        tier_id: selectedTier,
        status: 'active' as const,
        billing_cycle: billingCycle,
        payment_method: paymentMethod,
        active_employee_count: employeeCount,
        monthly_amount: pricing.monthly,
        annual_amount: pricing.annual,
        selected_modules: tier.modules,
        contact_name: contactInfo.name,
        contact_email: contactInfo.email,
        contact_phone: contactInfo.phone,
        billing_address: contactInfo.address,
        subscription_started_at: new Date().toISOString(),
        next_billing_date: billingCycle === 'annual' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      if (subscription?.id) {
        const { error } = await supabase
          .from('company_subscriptions')
          .update(subscriptionData)
          .eq('id', subscription.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_subscriptions')
          .insert(subscriptionData);
        
        if (error) throw error;
      }

      // Note: Invoice creation requires subscription_id which we may not have yet
      // This would typically be handled in a backend function
      toast({
        title: "Subscription Updated",
        description: paymentMethod === 'wire_transfer' 
          ? "Your subscription request has been submitted. You'll receive an invoice shortly."
          : "Please complete the payment to activate your subscription."
      });

      navigate('/');
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
      <div className="max-w-6xl mx-auto">
        {/* Trial Banner */}
        {subscription?.status === 'trial' && (
          <div className="mb-8 bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium">
                Trial Period: {getDaysRemaining()} days remaining
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              All modules are available during your trial
            </span>
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the plan that best fits your organization's needs. All plans include core features with additional modules based on your tier.
          </p>
        </div>

        <Tabs value={step} onValueChange={(v) => setStep(v as typeof step)}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="plan">1. Select Plan</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedTier}>2. Details</TabsTrigger>
            <TabsTrigger value="confirm" disabled={!selectedTier || !contactInfo.name}>3. Confirm</TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="space-y-8">
            {/* Employee Count */}
            <div className="max-w-md mx-auto">
              <Label className="text-base mb-2 block">Number of Active Employees</Label>
              <div className="flex items-center gap-4">
                <Users className="h-5 w-5 text-muted-foreground" />
                <Input
                  type="number"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  className="w-32"
                />
                <span className="text-muted-foreground">employees</span>
              </div>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="flex justify-center gap-4 items-center">
              <span className={billingCycle === 'monthly' ? 'font-medium' : 'text-muted-foreground'}>
                Monthly
              </span>
              <Button
                variant="outline"
                className="relative"
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              >
                <div className={`w-12 h-6 rounded-full transition-colors ${billingCycle === 'annual' ? 'bg-primary' : 'bg-muted'}`}>
                  <div className={`w-5 h-5 rounded-full bg-background shadow transition-transform absolute top-1/2 -translate-y-1/2 ${billingCycle === 'annual' ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
              </Button>
              <span className={billingCycle === 'annual' ? 'font-medium' : 'text-muted-foreground'}>
                Annual
              </span>
              {billingCycle === 'annual' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  1 month free!
                </Badge>
              )}
            </div>

            {/* Tier Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {tiers.map((tier) => {
                const tierPricing = calculatePrice(tier, employeeCount, billingCycle);
                const isSelected = selectedTier === tier.id;

                return (
                  <Card 
                    key={tier.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedTier(tier.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{tier.name}</CardTitle>
                        {tier.code === 'professional' && (
                          <Badge>Popular</Badge>
                        )}
                      </div>
                      <CardDescription>{tier.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <div className="text-3xl font-bold">
                          ${billingCycle === 'annual' 
                            ? Math.round(tierPricing.annual / 12).toLocaleString()
                            : tierPricing.monthly.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          per month {billingCycle === 'annual' && '(billed annually)'}
                        </div>
                        {billingCycle === 'annual' && tierPricing.savings > 0 && (
                          <div className="text-sm text-green-600 mt-1">
                            Save ${tierPricing.savings.toLocaleString()}/year
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium mb-2">Included Modules:</div>
                        {tier.modules.map((mod) => (
                          <div key={mod} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>{MODULE_LABELS[mod] || mod}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant={isSelected ? 'default' : 'outline'}
                      >
                        {isSelected ? 'Selected' : 'Select Plan'}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-center">
              <Button 
                size="lg" 
                disabled={!selectedTier}
                onClick={() => setStep('details')}
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="details" className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Contact & Billing Information
                </CardTitle>
                <CardDescription>
                  Please provide your contact and billing details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={contactInfo.name}
                      onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Contact Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                      placeholder="john@company.com"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactPhone">Phone Number</Label>
                    <Input
                      id="contactPhone"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="billingAddress">Billing Address</Label>
                  <Input
                    id="billingAddress"
                    value={contactInfo.address}
                    onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                    placeholder="123 Business St, City, Country"
                  />
                </div>

                <div className="pt-4">
                  <Label className="text-base mb-3 block">Payment Method</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
                    className="grid md:grid-cols-2 gap-4"
                  >
                    <div className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer ${paymentMethod === 'credit_card' ? 'border-primary bg-primary/5' : ''}`}>
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <Label htmlFor="credit_card" className="flex items-center gap-2 cursor-pointer">
                        <CreditCard className="h-5 w-5" />
                        Credit Card
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer ${paymentMethod === 'wire_transfer' ? 'border-primary bg-primary/5' : ''}`}>
                      <RadioGroupItem value="wire_transfer" id="wire_transfer" />
                      <Label htmlFor="wire_transfer" className="flex items-center gap-2 cursor-pointer">
                        <Building className="h-5 w-5" />
                        Wire Transfer
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('plan')}>
                  Back
                </Button>
                <Button 
                  disabled={!contactInfo.name || !contactInfo.email}
                  onClick={() => setStep('confirm')}
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="confirm" className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Confirm Your Subscription</CardTitle>
                <CardDescription>
                  Review your selection before submitting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedTierData && pricing && (
                  <>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plan</span>
                        <span className="font-medium">{selectedTierData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Employees</span>
                        <span className="font-medium">{employeeCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Billing Cycle</span>
                        <span className="font-medium capitalize">{billingCycle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payment Method</span>
                        <span className="font-medium">
                          {paymentMethod === 'credit_card' ? 'Credit Card' : 'Wire Transfer'}
                        </span>
                      </div>
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span>
                            ${billingCycle === 'annual' 
                              ? pricing.annual.toLocaleString() + '/year'
                              : pricing.monthly.toLocaleString() + '/month'}
                          </span>
                        </div>
                        {billingCycle === 'annual' && pricing.savings > 0 && (
                          <div className="text-sm text-green-600 text-right">
                            You save ${pricing.savings.toLocaleString()} with annual billing
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Included Modules</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTierData.modules.map((mod) => (
                          <Badge key={mod} variant="secondary">
                            {MODULE_LABELS[mod] || mod}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {paymentMethod === 'wire_transfer' ? (
                        <p>
                          After submitting, you will receive an invoice with wire transfer details.
                          Your subscription will be activated once payment is received.
                        </p>
                      ) : (
                        <p>
                          You will receive an invoice to complete your payment.
                          Your subscription will be activated once payment is confirmed.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('details')}>
                  Back
                </Button>
                <Button 
                  onClick={handleSubmitSubscription}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Submit Subscription'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
