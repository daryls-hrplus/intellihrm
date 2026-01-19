import { Button } from "@/components/ui/button";
import { Users, UserPlus, FilterX } from "lucide-react";

interface UserEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onInviteUser: () => void;
}

export function UserEmptyState({
  hasActiveFilters,
  onClearFilters,
  onInviteUser,
}: UserEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Users className="h-10 w-10 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold mb-1">
        {hasActiveFilters ? "No users match your filters" : "No users found"}
      </h3>
      
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        {hasActiveFilters 
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Get started by inviting your first team member to the platform."}
      </p>
      
      {hasActiveFilters ? (
        <Button variant="outline" onClick={onClearFilters}>
          <FilterX className="mr-2 h-4 w-4" />
          Clear all filters
        </Button>
      ) : (
        <Button onClick={onInviteUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Your First User
        </Button>
      )}
    </div>
  );
}
