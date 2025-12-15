import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useLanguage } from "@/hooks/useLanguage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NineBoxGrid } from "@/components/succession/NineBoxGrid";
import { NineBoxAssessmentDialog } from "@/components/succession/NineBoxAssessmentDialog";
import { useSuccession, NineBoxAssessment } from "@/hooks/useSuccession";
import { supabase } from "@/integrations/supabase/client";
import { Grid3X3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Company {
  id: string;
  name: string;
  code: string;
}

export default function NineBoxPage() {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<NineBoxAssessment | null>(null);
  const [nineBoxAssessments, setNineBoxAssessments] = useState<NineBoxAssessment[]>([]);

  const { 
    fetchNineBoxAssessments,
    createNineBoxAssessment,
    updateNineBoxAssessment,
  } = useSuccession(selectedCompanyId);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadAssessments();
    }
  }, [selectedCompanyId]);

  const loadCompanies = async () => {
    const { data } = await supabase
      .from('companies')
      .select('id, name, code')
      .eq('is_active', true)
      .order('name');
    
    if (data && data.length > 0) {
      setCompanies(data);
      setSelectedCompanyId(data[0].id);
    }
  };

  const loadAssessments = async () => {
    const assessments = await fetchNineBoxAssessments();
    setNineBoxAssessments(assessments);
  };

  const handleEmployeeClick = (assessment: NineBoxAssessment) => {
    setEditingAssessment(assessment);
    setShowAssessmentDialog(true);
  };

  const breadcrumbItems = [
    { label: t("succession.dashboard.title"), href: "/succession" },
    { label: t("succession.tabs.nineBox") },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Grid3X3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {t("succession.tabs.nineBox")}
              </h1>
              <p className="text-muted-foreground">
                {t("succession.nineBox.description")}
              </p>
            </div>
          </div>
          <Button onClick={() => { setEditingAssessment(null); setShowAssessmentDialog(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            {t("succession.actions.newAssessment")}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={t("common.selectCompany")} />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCompanyId ? (
          <NineBoxGrid 
            assessments={nineBoxAssessments} 
            onEmployeeClick={handleEmployeeClick}
          />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{t("succession.dashboard.selectCompany")}</p>
            </CardContent>
          </Card>
        )}

        <NineBoxAssessmentDialog
          open={showAssessmentDialog}
          onOpenChange={setShowAssessmentDialog}
          assessment={editingAssessment}
          companyId={selectedCompanyId}
          onSuccess={() => {
            setShowAssessmentDialog(false);
            setEditingAssessment(null);
            loadAssessments();
          }}
          onCreate={createNineBoxAssessment}
          onUpdate={updateNineBoxAssessment}
        />
      </div>
    </AppLayout>
  );
}
