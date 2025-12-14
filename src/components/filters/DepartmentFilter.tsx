import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building } from "lucide-react";

interface Department {
  id: string;
  name: string;
}

interface DepartmentFilterProps {
  companyId: string;
  selectedDepartmentId: string;
  onDepartmentChange: (departmentId: string) => void;
}

export function DepartmentFilter({ 
  companyId, 
  selectedDepartmentId, 
  onDepartmentChange 
}: DepartmentFilterProps) {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    if (companyId) {
      supabase
        .from("departments")
        .select("id, name")
        .eq("company_id", companyId)
        .eq("is_active", true)
        .order("name")
        .then(({ data }) => {
          if (data) setDepartments(data);
        });
    } else {
      // If no company selected, fetch all departments
      supabase
        .from("departments")
        .select("id, name")
        .eq("is_active", true)
        .order("name")
        .then(({ data }) => {
          if (data) setDepartments(data);
        });
    }
  }, [companyId]);

  if (departments.length === 0) {
    return null;
  }

  return (
    <Select value={selectedDepartmentId} onValueChange={onDepartmentChange}>
      <SelectTrigger className="w-[200px]">
        <Building className="mr-2 h-4 w-4" />
        <SelectValue placeholder="All Departments" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Departments</SelectItem>
        {departments.map((d) => (
          <SelectItem key={d.id} value={d.id}>
            {d.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function useDepartmentFilter() {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("all");

  return {
    selectedDepartmentId,
    setSelectedDepartmentId,
  };
}
