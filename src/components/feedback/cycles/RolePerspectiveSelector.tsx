import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { User, UserCircle, Shield } from "lucide-react";

export type RolePerspective = "employee" | "manager" | "hr";

interface RolePerspectiveSelectorProps {
  value: RolePerspective;
  onChange: (value: RolePerspective) => void;
  disabled?: boolean;
}

export function RolePerspectiveSelector({
  value,
  onChange,
  disabled = false,
}: RolePerspectiveSelectorProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => val && onChange(val as RolePerspective)}
      disabled={disabled}
      className="justify-start"
    >
      <ToggleGroupItem
        value="employee"
        aria-label="Employee View"
        className="gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        <User className="h-4 w-4" />
        Employee
      </ToggleGroupItem>
      <ToggleGroupItem
        value="manager"
        aria-label="Manager View"
        className="gap-2 data-[state=on]:bg-info data-[state=on]:text-info-foreground"
      >
        <UserCircle className="h-4 w-4" />
        Manager
      </ToggleGroupItem>
      <ToggleGroupItem
        value="hr"
        aria-label="HR Admin View"
        className="gap-2 data-[state=on]:bg-success data-[state=on]:text-success-foreground"
      >
        <Shield className="h-4 w-4" />
        HR Admin
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
