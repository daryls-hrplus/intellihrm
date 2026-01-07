import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/layout/AppLayout';
import { usePageAudit } from '@/hooks/usePageAudit';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { 
  BookOpen, 
  Layers, 
  GitBranch, 
  FileText, 
  ArrowRightLeft, 
  Download,
  Building2,
  Link2,
  Settings2
} from 'lucide-react';
import { DraggableModuleCards, ModuleCardItem } from '@/components/ui/DraggableModuleCards';

const GLDashboardPage = () => {
  const { t } = useTranslation();
  usePageAudit('gl_interface_dashboard', 'Payroll');

  const features: ModuleCardItem[] = [
    {
      title: t('payroll.gl.chartOfAccounts', 'Chart of Accounts'),
      description: t('payroll.gl.chartOfAccountsDesc', 'Manage GL account codes and hierarchy'),
      icon: BookOpen,
      href: '/payroll/gl/accounts',
      color: 'bg-blue-500/10 text-blue-600',
      tabCode: 'chart_of_accounts',
    },
    {
      title: t('payroll.gl.costCenterSegments', 'Cost Center Segments'),
      description: t('payroll.gl.costCenterSegmentsDesc', 'Define cost center structure and segments'),
      icon: Layers,
      href: '/payroll/gl/segments',
      color: 'bg-purple-500/10 text-purple-600',
      tabCode: 'cost_center_segments',
    },
    {
      title: t('payroll.gl.costCenters', 'Cost Centers'),
      description: t('payroll.gl.costCentersDesc', 'Manage cost centers with flexible segment values'),
      icon: Building2,
      href: '/payroll/gl/cost-centers',
      color: 'bg-green-500/10 text-green-600',
      tabCode: 'cost_centers',
    },
    {
      title: t('payroll.gl.entityMappings', 'Entity Segment Mappings'),
      description: t('payroll.gl.entityMappingsDesc', 'Assign GL segment codes to organizational entities'),
      icon: Link2,
      href: '/payroll/gl/entity-mappings',
      color: 'bg-indigo-500/10 text-indigo-600',
      tabCode: 'entity_mappings',
    },
    {
      title: t('payroll.gl.accountMappings', 'Account Mappings'),
      description: t('payroll.gl.accountMappingsDesc', 'Map pay elements to GL accounts'),
      icon: GitBranch,
      href: '/payroll/gl/mappings',
      color: 'bg-orange-500/10 text-orange-600',
      tabCode: 'account_mappings',
    },
    {
      title: t('payroll.gl.costReallocations', 'Cost Reallocations'),
      description: t('payroll.gl.costReallocationsDesc', 'Redirect costs between cost centers'),
      icon: ArrowRightLeft,
      href: '/payroll/gl/reallocations',
      color: 'bg-red-500/10 text-red-600',
      tabCode: 'cost_reallocations',
    },
    {
      title: t('payroll.gl.journalBatches', 'Journal Batches'),
      description: t('payroll.gl.journalBatchesDesc', 'View and manage GL journal entries'),
      icon: FileText,
      href: '/payroll/gl/batches',
      color: 'bg-cyan-500/10 text-cyan-600',
      tabCode: 'journal_batches',
    },
    {
      title: t('payroll.gl.exportHistory', 'Export History'),
      description: t('payroll.gl.exportHistoryDesc', 'View GL export history and download files'),
      icon: Download,
      href: '/payroll/gl/exports',
      color: 'bg-gray-500/10 text-gray-600',
      tabCode: 'export_history',
    },
    {
      title: t('payroll.gl.overrideRules', 'Override Rules'),
      description: t('payroll.gl.overrideRulesDesc', 'Configure GL segment override routing rules'),
      icon: Settings2,
      href: '/payroll/gl/override-rules',
      color: 'bg-amber-500/10 text-amber-600',
      tabCode: 'override_rules',
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

        <DraggableModuleCards 
          modules={features} 
          preferenceKey="gl_interface_dashboard_order" 
        />
      </div>
    </AppLayout>
  );
};

export default GLDashboardPage;
