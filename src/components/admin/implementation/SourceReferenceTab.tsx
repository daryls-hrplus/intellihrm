import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BookMarked, 
  Calendar, 
  ExternalLink, 
  FileText, 
  History,
  Info,
  CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  HANDBOOK_VERSION, 
  SOURCE_REFERENCES, 
  HANDBOOK_CHANGE_LOG,
  PHASE_MANUAL_MAPPING 
} from "@/data/handbookVersionHistory";

export function SourceReferenceTab() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Handbook Version Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Handbook Version Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Current Version</p>
              <p className="text-lg font-semibold">{HANDBOOK_VERSION.version}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-lg font-semibold">{new Date(HANDBOOK_VERSION.date).toLocaleDateString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Author</p>
              <p className="text-lg font-semibold">{HANDBOOK_VERSION.author}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Next Review</p>
              <p className="text-lg font-semibold">{new Date(HANDBOOK_VERSION.nextReviewDate).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Manuals Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookMarked className="h-5 w-5" />
            Source Manuals
          </CardTitle>
          <CardDescription>
            Reference documentation used to structure this Implementation Handbook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Manual</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Phases</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SOURCE_REFERENCES.map((ref) => (
                <TableRow key={ref.id}>
                  <TableCell className="font-medium">{ref.manualName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ref.version}</Badge>
                  </TableCell>
                  <TableCell>{new Date(ref.lastUpdated).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {ref.phasesUsed.map((phase, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {phase}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(ref.routePath)}
                      className="gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Chapter References */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Chapter References by Manual
          </CardTitle>
          <CardDescription>
            Specific chapters from each manual used in the handbook structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SOURCE_REFERENCES.map((ref) => (
              <div key={ref.id} className="p-4 rounded-lg border">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <BookMarked className="h-4 w-4 text-primary" />
                  {ref.manualName}
                </h4>
                <ul className="space-y-2">
                  {ref.chaptersReferenced.map((chapter, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {chapter}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Version History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
          <CardDescription>
            Changelog tracking handbook updates and manual synchronization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {HANDBOOK_CHANGE_LOG.map((entry, index) => (
              <AccordionItem key={entry.version} value={entry.version}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      {entry.version}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    {index === 0 && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                        Current
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 pl-4">
                    {entry.changes.map((change, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">•</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Phase-to-Manual Mapping */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Phase Source Mapping
          </CardTitle>
          <CardDescription>
            Which manuals inform each implementation phase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(PHASE_MANUAL_MAPPING).map(([phaseId, manualIds]) => (
              <div 
                key={phaseId} 
                className="p-3 rounded-lg border bg-muted/30 flex items-center justify-between"
              >
                <span className="font-medium text-sm capitalize">
                  {phaseId.replace(/-/g, ' ')}
                </span>
                <div className="flex gap-1">
                  {manualIds.length > 0 ? (
                    manualIds.map((manualId) => {
                      const manual = SOURCE_REFERENCES.find(r => r.id === manualId);
                      return (
                        <Badge key={manualId} variant="outline" className="text-xs">
                          {manual?.id === 'workforce' ? 'WF' : 
                           manual?.id === 'hr-hub' ? 'HRH' :
                           manual?.id === 'appraisals' ? 'APR' :
                           manual?.id === 'admin-security' ? 'SEC' : manualId}
                        </Badge>
                      );
                    })
                  ) : (
                    <Badge variant="secondary" className="text-xs">Internal</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span><Badge variant="outline" className="mr-1">WF</Badge> Workforce Manual</span>
            <span><Badge variant="outline" className="mr-1">HRH</Badge> HR Hub Manual</span>
            <span><Badge variant="outline" className="mr-1">APR</Badge> Appraisals Manual</span>
            <span><Badge variant="outline" className="mr-1">SEC</Badge> Security Manual</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
