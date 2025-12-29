import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SDIResult {
  sdi: number;
  baseSalary: number;
  integrationFactor: number;
  components: {
    aguinaldo: number;
    vacationPremium: number;
    other: number;
  };
}

interface ISRResult {
  grossISR: number;
  subsidioAlEmpleo: number;
  netISR: number;
  effectiveRate: number;
  bracket: {
    lowerLimit: number;
    upperLimit: number;
    fixedFee: number;
    rate: number;
  };
}

interface IMSSResult {
  employeeTotal: number;
  employerTotal: number;
  grandTotal: number;
  components: {
    enfermedadMaternidad: { employee: number; employer: number };
    invalidezVida: { employee: number; employer: number };
    cesantiaVejez: { employee: number; employer: number };
    retiro: { employee: number; employer: number };
    infonavit: { employee: number; employer: number };
    riesgoTrabajo: { employee: number; employer: number };
    guarderias: { employee: number; employer: number };
  };
  sbc: number;
  sbcCapped: number;
  workDays: number;
}

interface ISNResult {
  taxableAmount: number;
  rate: number;
  taxAmount: number;
  stateCode: string;
  stateName: string;
}

interface MexicanPayrollResult {
  grossPay: number;
  sdi: SDIResult;
  isr: ISRResult;
  imss: IMSSResult;
  isn: ISNResult;
  netPay: number;
  totalDeductions: number;
  totalEmployerCost: number;
}

export function useMexicanPayroll() {
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const calculateSDI = async (
    employeeId: string,
    baseSalary: number,
    aguinaldoDays: number = 15,
    vacationDays: number = 12,
    vacationPremiumRate: number = 0.25
  ): Promise<SDIResult | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('mx-calculate-sdi', {
        body: {
          employeeId,
          baseSalary,
          aguinaldoDays,
          vacationDays,
          vacationPremiumRate
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('SDI calculation error:', error);
      toast({
        title: 'Error calculating SDI',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      return null;
    }
  };

  const calculateISR = async (
    taxableIncome: number,
    period: 'monthly' | 'biweekly' | 'weekly' = 'monthly',
    year: number = new Date().getFullYear()
  ): Promise<ISRResult | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('mx-calculate-isr', {
        body: { taxableIncome, period, year }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('ISR calculation error:', error);
      toast({
        title: 'Error calculating ISR',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      return null;
    }
  };

  const calculateIMSS = async (
    sbc: number,
    riskClass: number = 1,
    workDays: number = 30
  ): Promise<IMSSResult | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('mx-calculate-imss', {
        body: { sbc, riskClass, workDays }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('IMSS calculation error:', error);
      toast({
        title: 'Error calculating IMSS',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      return null;
    }
  };

  const calculateISN = async (
    taxablePayroll: number,
    stateCode: string
  ): Promise<ISNResult | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('mx-calculate-isn', {
        body: { taxablePayroll, stateCode }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('ISN calculation error:', error);
      toast({
        title: 'Error calculating ISN',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      return null;
    }
  };

  const calculateFullPayroll = async (
    employeeId: string,
    companyId: string,
    grossPay: number,
    period: 'monthly' | 'biweekly' | 'weekly' = 'monthly'
  ): Promise<MexicanPayrollResult | null> => {
    setIsCalculating(true);
    try {
      const { data, error } = await supabase.functions.invoke('mx-payroll-calculate', {
        body: { employeeId, companyId, grossPay, period }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Full payroll calculation error:', error);
      toast({
        title: 'Error calculating payroll',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    isCalculating,
    calculateSDI,
    calculateISR,
    calculateIMSS,
    calculateISN,
    calculateFullPayroll
  };
}
