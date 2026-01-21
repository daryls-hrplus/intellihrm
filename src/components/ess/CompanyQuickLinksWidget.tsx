import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CompanyQuickLinksWidget() {
  const navigate = useNavigate();

  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-sm">Company</span>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                Find colleagues & updates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/employee-directory")}
            >
              <Users className="h-4 w-4 mr-1.5" />
              Directory
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/ess/announcements")}
            >
              <Megaphone className="h-4 w-4 mr-1.5" />
              News
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
