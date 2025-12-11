import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Award,
  Download,
  ExternalLink,
  Loader2,
  Calendar,
  CheckCircle,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Certificate {
  id: string;
  certificate_number: string;
  issued_at: string;
  expires_at: string | null;
  final_score: number | null;
  verification_code: string;
  course: {
    title: string;
    code: string;
    category: {
      name: string;
    } | null;
  };
}

export default function CertificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("lms_certificates")
        .select(`
          *,
          course:lms_courses(
            title, code,
            category:lms_categories(name)
          )
        `)
        .eq("user_id", user!.id)
        .order("issued_at", { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyVerificationLink = (code: string) => {
    const url = `${window.location.origin}/verify-certificate/${code}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Verification link copied to clipboard" });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Training", href: "/training" },
            { label: "Certifications" },
          ]}
        />

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
            <Award className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              My Certifications
            </h1>
            <p className="text-muted-foreground">
              View and share your earned certificates
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <Award className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Certificates</p>
                <p className="text-2xl font-bold">{certificates.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {certificates.filter((c) => !isExpired(c.expires_at)).length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2">
                <Calendar className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold">
                  {certificates.filter((c) => isExpired(c.expires_at)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : certificates.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <Award className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold text-foreground">
              No certificates yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete courses to earn certificates
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => {
              const expired = isExpired(cert.expires_at);
              return (
                <div
                  key={cert.id}
                  className={`rounded-xl border bg-card shadow-card transition-all ${
                    expired ? "border-destructive/30 opacity-75" : "border-border"
                  }`}
                >
                  {/* Certificate Visual */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-gradient-to-br from-warning/20 via-warning/10 to-warning/5 p-6">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Award className="mx-auto h-16 w-16 text-warning" />
                        <p className="mt-2 text-xs font-medium text-warning uppercase tracking-wider">
                          Certificate of Completion
                        </p>
                      </div>
                    </div>
                    {expired && (
                      <Badge className="absolute right-2 top-2 bg-destructive">
                        Expired
                      </Badge>
                    )}
                  </div>

                  {/* Certificate Details */}
                  <div className="p-4">
                    {cert.course.category && (
                      <span className="text-xs font-medium text-muted-foreground">
                        {cert.course.category.name}
                      </span>
                    )}
                    <h3 className="mt-1 font-semibold text-foreground line-clamp-2">
                      {cert.course.title}
                    </h3>

                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Issued: {new Date(cert.issued_at).toLocaleDateString()}
                      </p>
                      {cert.expires_at && (
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Expires: {new Date(cert.expires_at).toLocaleDateString()}
                        </p>
                      )}
                      {cert.final_score && (
                        <p className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Score: {cert.final_score}%
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyVerificationLink(cert.verification_code)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground text-center">
                      Certificate #{cert.certificate_number}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
