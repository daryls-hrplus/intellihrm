import { useParams } from 'react-router-dom';
import { UniversalManualViewer } from '@/components/enablement/manuals/UniversalManualViewer';
import { AppLayout } from '@/components/layout/AppLayout';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

/**
 * Universal manual viewer page - streams content from database
 * Route: /enablement/manuals/:manualId
 */
export default function ManualViewerPage() {
  const { manualId } = useParams<{ manualId: string }>();
  
  const formatTitle = (id: string) => {
    return id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <AppLayout>
      <div className="p-6">
        <Breadcrumbs 
          items={[
            { label: 'Enablement', href: '/enablement' },
            { label: 'Manuals', href: '/enablement/administrator-manuals' },
            { label: manualId ? formatTitle(manualId) : 'Manual' },
          ]}
        />
        
        <div className="mt-6">
          <UniversalManualViewer />
        </div>
      </div>
    </AppLayout>
  );
}
