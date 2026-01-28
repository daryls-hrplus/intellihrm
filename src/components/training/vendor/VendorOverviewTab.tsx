import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  FileText,
  Edit,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import type { Vendor } from "@/types/vendor";

interface VendorOverviewTabProps {
  vendor: Vendor;
  onEdit?: () => void;
}

export function VendorOverviewTab({ vendor, onEdit }: VendorOverviewTabProps) {
  const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";
    try {
      return format(parseISO(date), "MMM d, yyyy");
    } catch {
      return "—";
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* General Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            General Information
          </CardTitle>
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Vendor Code</p>
              <p className="font-medium">{vendor.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium capitalize">
                {vendor.vendor_type?.replace(/_/g, " ") || "—"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-sm">{vendor.description || "No description provided"}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className={
                vendor.status === "active"
                  ? "bg-success/10 text-success"
                  : vendor.status === "pending"
                  ? "bg-warning/10 text-warning"
                  : "bg-muted text-muted-foreground"
              }
            >
              {vendor.status}
            </Badge>
            {vendor.is_preferred && (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                <Star className="h-3 w-3 mr-1 fill-warning" />
                Preferred
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {vendor.contact_name && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {vendor.contact_name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium">{vendor.contact_name}</p>
                <p className="text-sm text-muted-foreground">Primary Contact</p>
              </div>
            </div>
          )}
          {vendor.contact_email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${vendor.contact_email}`} className="text-primary hover:underline">
                {vendor.contact_email}
              </a>
            </div>
          )}
          {vendor.contact_phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{vendor.contact_phone}</span>
            </div>
          )}
          {vendor.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a
                href={vendor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {vendor.website}
              </a>
            </div>
          )}
          {(vendor.address || vendor.city || vendor.country) && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                {vendor.address && <p>{vendor.address}</p>}
                <p>
                  {[vendor.city, vendor.country].filter(Boolean).join(", ") || "—"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Contract Start</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{formatDate(vendor.contract_start_date)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contract End</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{formatDate(vendor.contract_end_date)}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Contract Value</p>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{formatCurrency(vendor.contract_value)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Terms</p>
              <p className="font-medium">{vendor.payment_terms || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {vendor.performance_score?.toFixed(1) || "—"}
              </div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
            {vendor.performance_score && (
              <div className="flex-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${(vendor.performance_score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Review</p>
            <p className="font-medium">{formatDate(vendor.last_review_date)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {vendor.notes && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{vendor.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
