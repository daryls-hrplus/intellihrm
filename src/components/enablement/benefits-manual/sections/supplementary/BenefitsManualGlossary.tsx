import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const GLOSSARY_TERMS = [
  { term: "Benefit Category", definition: "A classification grouping similar types of benefits (e.g., Medical, Dental, Vision, Retirement)." },
  { term: "Benefit Plan", definition: "A specific benefit offering within a category, with defined coverage levels, costs, and eligibility rules." },
  { term: "COBRA", definition: "Consolidated Omnibus Budget Reconciliation Act - allows continuation of health coverage after qualifying events." },
  { term: "Contribution", definition: "The amount paid toward benefit premiums by either the employer or employee." },
  { term: "Coverage Level", definition: "The extent of coverage selected (Employee Only, Employee+Spouse, Employee+Children, Family)." },
  { term: "Deductible", definition: "The amount an employee must pay out-of-pocket before insurance coverage begins." },
  { term: "Dependent", definition: "A family member (spouse, child) who can be added to an employee's benefit coverage." },
  { term: "Effective Date", definition: "The date when benefit coverage begins or a change takes effect." },
  { term: "Eligibility", definition: "The criteria an employee must meet to enroll in a benefit plan (employment status, hours, waiting period)." },
  { term: "Enrollment", definition: "The process of an employee selecting and signing up for benefit coverage." },
  { term: "FSA", definition: "Flexible Spending Account - a tax-advantaged account for healthcare or dependent care expenses." },
  { term: "HSA", definition: "Health Savings Account - a tax-advantaged savings account paired with high-deductible health plans." },
  { term: "Life Event", definition: "A qualifying change (marriage, birth, loss of coverage) that triggers a special enrollment period." },
  { term: "Open Enrollment", definition: "An annual period when employees can enroll in or change their benefit elections." },
  { term: "Plan Year", definition: "The 12-month period for which benefit coverage is effective." },
  { term: "Premium", definition: "The total cost of benefit coverage, typically split between employer and employee." },
  { term: "Provider", definition: "The insurance company or carrier that administers a benefit plan." },
  { term: "Qualifying Life Event (QLE)", definition: "An event that allows benefit changes outside of open enrollment (marriage, divorce, birth, adoption, loss of coverage)." },
  { term: "Special Enrollment Period", definition: "A window (typically 30 days) following a life event during which benefit changes are allowed." },
  { term: "Waiting Period", definition: "The time an employee must wait after hire before becoming eligible for benefits." },
  { term: "Waiver", definition: "An employee's decision to decline offered benefit coverage." },
  { term: "401(k)", definition: "An employer-sponsored retirement savings plan with tax advantages and often employer matching." },
  { term: "Vesting", definition: "The process by which an employee earns non-forfeitable rights to employer contributions." },
  { term: "Beneficiary", definition: "The person(s) designated to receive benefits (e.g., life insurance payout) upon the employee's death." },
  { term: "Co-pay", definition: "A fixed amount paid by the employee for a covered healthcare service." },
  { term: "Co-insurance", definition: "The percentage of costs an employee pays after meeting their deductible." },
  { term: "Out-of-Pocket Maximum", definition: "The maximum amount an employee pays in a plan year; after this, insurance covers 100%." },
  { term: "Auto-Enrollment", definition: "Automatic enrollment of eligible employees into specified benefit plans unless they opt out." },
  { term: "Claim", definition: "A request for reimbursement or payment for covered benefits." },
  { term: "Evidence of Insurability (EOI)", definition: "Health information required for certain coverage levels or late enrollments." },
];

export function BenefitsManualGlossary() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredTerms = GLOSSARY_TERMS.filter(
    item => 
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="space-y-8" id="glossary" data-manual-anchor="glossary">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-500" />
            <CardTitle>Glossary</CardTitle>
          </div>
          <CardDescription>
            Key terms and definitions for Benefits administration
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTerms.map((item, index) => (
              <div key={item.term} className="pb-4 border-b last:border-0">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5 shrink-0">
                    {item.term.charAt(0)}
                  </Badge>
                  <div>
                    <h4 className="font-medium text-sm">{item.term}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{item.definition}</p>
                  </div>
                </div>
              </div>
            ))}
            {filteredTerms.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No terms found matching "{searchTerm}"
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
