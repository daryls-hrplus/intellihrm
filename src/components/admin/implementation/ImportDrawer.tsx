import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Upload, ArrowRight } from "lucide-react";

interface ImportDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  importType: string | null;
  onComplete: () => void;
}

// Map import types to user-friendly labels
const IMPORT_TYPE_LABELS: Record<string, string> = {
  companies: "Companies",
  divisions: "Divisions",
  departments: "Departments",
  sections: "Sections",
  branch_locations: "Branch Locations",
  job_families: "Job Families",
  jobs: "Jobs",
  positions: "Positions",
  employees: "Employees",
  employee_assignments: "Employee Assignments",
  responsibilities: "Responsibilities",
  competencies: "Competencies",
  pay_elements: "Pay Elements",
  salary_grades: "Salary Grades",
  pay_groups: "Pay Groups",
  work_schedules: "Work Schedules",
  leave_types: "Leave Types",
  holidays: "Holidays",
};

export function ImportDrawer({ open, onOpenChange, importType, onComplete }: ImportDrawerProps) {
  const navigate = useNavigate();

  const handleGoToImport = () => {
    // Navigate to the HR Hub data import page with the import type pre-selected
    const importPath = `/hr-hub/data-import${importType ? `?type=${importType}` : ''}`;
    navigate(importPath);
    onOpenChange(false);
  };

  const label = importType ? IMPORT_TYPE_LABELS[importType] || importType : "Data";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import {label}
          </SheetTitle>
          <SheetDescription>
            Import {label.toLowerCase()} data from a spreadsheet to quickly populate your system.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Info Section */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <h4 className="font-medium">What you can import:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Upload CSV or Excel files</li>
              <li>• Map columns to system fields</li>
              <li>• Preview and validate data before import</li>
              <li>• Track import history and results</li>
            </ul>
          </div>

          {/* Prerequisites Warning */}
          <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
            <h4 className="font-medium text-amber-600">Before importing:</h4>
            <p className="text-sm text-muted-foreground mt-1">
              The import wizard will check that all prerequisite data exists. 
              For example, importing employees requires companies and departments to be set up first.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button onClick={handleGoToImport} className="w-full">
              Open Import Wizard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>

          {/* After Import Note */}
          <p className="text-xs text-muted-foreground text-center">
            After completing the import, return here to mark the step as complete.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
