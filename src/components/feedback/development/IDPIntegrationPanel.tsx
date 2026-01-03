import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Link2, 
  Plus, 
  CheckCircle2, 
  Target,
  FileText,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLinkThemeToIDP } from '@/hooks/feedback/useDevelopmentThemes';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { IDPLinkType } from '@/types/developmentThemes';

interface IDPIntegrationPanelProps {
  themeId: string;
  themeName: string;
  employeeId: string;
  cycleId?: string;
  isEditable?: boolean;
}

interface IDPItem {
  id: string;
  title: string;
  goal_type: string;
  status: string;
}

interface IDP {
  id: string;
  title: string;
  status: string;
  items: IDPItem[];
}

const linkTypeLabels: Record<IDPLinkType, string> = {
  derived: 'Derived from feedback',
  informed: 'Informed by feedback',
  validated: 'Validated by feedback',
};

export function IDPIntegrationPanel({
  themeId,
  themeName,
  employeeId,
  cycleId,
  isEditable = true,
}: IDPIntegrationPanelProps) {
  const [selectedIDP, setSelectedIDP] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [linkType, setLinkType] = useState<IDPLinkType>('derived');
  const linkToIDP = useLinkThemeToIDP();

  // Fetch employee's IDPs
  const { data: idps, isLoading: loadingIDPs } = useQuery({
    queryKey: ['employee-idps', employeeId],
    queryFn: async (): Promise<IDP[]> => {
      // First fetch IDPs for the employee
      const { data: idpData, error: idpError } = await supabase
        .from('individual_development_plans')
        .select('id, title, status')
        .eq('employee_id', employeeId)
        .in('status', ['draft', 'active', 'in_progress']);

      if (idpError) throw idpError;
      if (!idpData || idpData.length === 0) return [];

      // Create IDPs with empty items initially
      const idpsWithItems: IDP[] = idpData.map((idp: any) => ({
        id: idp.id,
        title: idp.title || 'Untitled',
        status: idp.status || 'draft',
        items: [],
      }));

      // Fetch items for each IDP separately to avoid type issues
      for (const idp of idpsWithItems) {
        const { data: itemsData } = await supabase
          .from('idp_items' as any)
          .select('id, title, goal_type, status')
          .eq('idp_id', idp.id);

        if (itemsData) {
          idp.items = (itemsData as any[]).map((item: any) => ({
            id: item.id,
            title: item.title || '',
            goal_type: item.goal_type || '',
            status: item.status || '',
          }));
        }
      }

      return idpsWithItems;
    },
    enabled: !!employeeId,
  });

  // Fetch existing links for this theme
  const { data: existingLinks, isLoading: loadingLinks } = useQuery({
    queryKey: ['idp-feedback-links', themeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('idp_feedback_links')
        .select('*')
        .eq('source_theme_id', themeId);

      if (error) throw error;
      return data;
    },
    enabled: !!themeId,
  });

  const selectedIDPData = idps?.find(i => i.id === selectedIDP);
  const availableItems = selectedIDPData?.items || [];

  const handleCreateLink = () => {
    if (!selectedIDP) return;

    linkToIDP.mutate({
      idp_id: selectedIDP,
      idp_item_id: selectedItem || null,
      source_theme_id: themeId,
      source_cycle_id: cycleId || null,
      link_type: linkType,
    });

    // Reset form
    setSelectedIDP('');
    setSelectedItem('');
  };

  if (loadingIDPs || loadingLinks) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-5 w-5 text-primary" />
          IDP Integration
        </CardTitle>
        <CardDescription>
          Link "{themeName}" to development plans for tracking and follow-up.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing links */}
        {existingLinks && existingLinks.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Linked Items</span>
            {existingLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30"
              >
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className="text-xs">
                    {linkTypeLabels[link.link_type as IDPLinkType]}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Create new link */}
        {isEditable && (
          <div className="space-y-3 pt-2 border-t">
            <span className="text-sm font-medium">Create New Link</span>

            {!idps || idps.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                <FileText className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p>No active development plans found.</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Plus className="h-4 w-4 mr-1" />
                  Create IDP
                </Button>
              </div>
            ) : (
              <>
                <Select value={selectedIDP} onValueChange={setSelectedIDP}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Development Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {idps.map((idp) => (
                      <SelectItem key={idp.id} value={idp.id}>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          {idp.title}
                          <Badge variant="outline" className="text-xs ml-1">
                            {idp.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedIDP && availableItems.length > 0 && (
                  <Select value={selectedItem} onValueChange={setSelectedItem}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specific item (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select value={linkType} onValueChange={(v) => setLinkType(v as IDPLinkType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Link type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="derived">Derived from feedback</SelectItem>
                    <SelectItem value="informed">Informed by feedback</SelectItem>
                    <SelectItem value="validated">Validated by feedback</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  className="w-full"
                  onClick={handleCreateLink}
                  disabled={!selectedIDP || linkToIDP.isPending}
                >
                  {linkToIDP.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4 mr-2" />
                  )}
                  Link to IDP
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
