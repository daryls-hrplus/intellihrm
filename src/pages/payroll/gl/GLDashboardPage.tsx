import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  Layers, 
  GitBranch, 
  FileText, 
  ArrowRightLeft, 
  Download,
  Building2
} from 'lucide-react';

const GLDashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    {
      title: t('payroll.gl.chartOfAccounts', 'Chart of Accounts'),
      description: t('payroll.gl.chartOfAccountsDesc', 'Manage GL account codes and hierarchy'),
      icon: BookOpen,
      link: '/payroll/gl/accounts',
      color: 'bg-blue-500'
    },
    {
      title: t('payroll.gl.costCenterSegments', 'Cost Center Segments'),
      description: t('payroll.gl.costCenterSegmentsDesc', 'Define cost center structure and segments'),
      icon: Layers,
      link: '/payroll/gl/segments',
      color: 'bg-purple-500'
    },
    {
      title: t('payroll.gl.costCenters', 'Cost Centers'),
      description: t('payroll.gl.costCentersDesc', 'Manage cost centers with flexible segment values'),
      icon: Building2,
      link: '/payroll/gl/cost-centers',
      color: 'bg-green-500'
    },
    {
      title: t('payroll.gl.accountMappings', 'Account Mappings'),
      description: t('payroll.gl.accountMappingsDesc', 'Map pay elements to GL accounts'),
      icon: GitBranch,
      link: '/payroll/gl/mappings',
      color: 'bg-orange-500'
    },
    {
      title: t('payroll.gl.costReallocations', 'Cost Reallocations'),
      description: t('payroll.gl.costReallocationsDesc', 'Redirect costs between cost centers'),
      icon: ArrowRightLeft,
      link: '/payroll/gl/reallocations',
      color: 'bg-red-500'
    },
    {
      title: t('payroll.gl.journalBatches', 'Journal Batches'),
      description: t('payroll.gl.journalBatchesDesc', 'View and manage GL journal entries'),
      icon: FileText,
      link: '/payroll/gl/journals',
      color: 'bg-cyan-500'
    },
    {
      title: t('payroll.gl.exportHistory', 'Export History'),
      description: t('payroll.gl.exportHistoryDesc', 'View GL export history and download files'),
      icon: Download,
      link: '/payroll/gl/exports',
      color: 'bg-gray-500'
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t('payroll.title', 'Payroll'), href: '/payroll' },
            { label: t('payroll.gl.title', 'GL Interface') }
          ]}
        />

        <div>
          <h1 className="text-3xl font-bold">{t('payroll.gl.title', 'GL Interface')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('payroll.gl.subtitle', 'General Ledger integration for payroll accounting')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.link}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(feature.link)}
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-lg ${feature.color}`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default GLDashboardPage;
