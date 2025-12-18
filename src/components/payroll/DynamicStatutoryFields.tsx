import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatutoryType } from "@/hooks/useCountryStatutories";

interface DynamicStatutoryFieldsProps {
  statutoryTypes: StatutoryType[];
  values: Record<string, number>;
  onChange: (code: string, value: number, isEmployer?: boolean) => void;
  disabled?: boolean;
}

export function DynamicStatutoryFields({
  statutoryTypes,
  values,
  onChange,
  disabled = false,
}: DynamicStatutoryFieldsProps) {
  if (statutoryTypes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No statutory deductions configured for this country
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statutoryTypes.map((stat) => {
        const empFieldKey = `ytd_${stat.statutory_code.toLowerCase()}`;
        const erFieldKey = `ytd_employer_${stat.statutory_code.toLowerCase()}`;

        return (
          <div key={stat.id} className="space-y-3 p-3 border rounded-md bg-muted/20">
            <h4 className="font-medium text-sm">{stat.statutory_name}</h4>
            
            <div className="space-y-2">
              <Label className="text-xs">Employee YTD</Label>
              <Input
                type="number"
                step="0.01"
                value={values[empFieldKey] || 0}
                onChange={(e) => onChange(stat.statutory_code, parseFloat(e.target.value) || 0, false)}
                disabled={disabled}
              />
            </div>

            {stat.has_employer_contribution && (
              <div className="space-y-2">
                <Label className="text-xs">Employer YTD</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={values[erFieldKey] || 0}
                  onChange={(e) => onChange(stat.statutory_code, parseFloat(e.target.value) || 0, true)}
                  disabled={disabled}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
