import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, FileSignature, CheckCircle2 } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

export function AgreementsSignatures() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-3">Overview</h3>
        <p className="text-muted-foreground mb-4">
          Agreements and signatures tracking manages employment contracts, policy acknowledgments, 
          and e-signature workflows for audit-ready record keeping.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Agreement Types</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FileSignature className="h-4 w-4 text-primary" />
              Employment Agreements
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Employment contract</li>
              <li>• NDA / Confidentiality</li>
              <li>• Non-compete agreement</li>
              <li>• Intellectual property assignment</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Policy Acknowledgments
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Employee handbook</li>
              <li>• Code of conduct</li>
              <li>• IT acceptable use policy</li>
              <li>• Safety policies</li>
            </ul>
          </div>
        </div>
      </section>

      <ScreenshotPlaceholder
        caption="Figure 4.26: Agreements and Signatures management"
        alt="Agreement list showing contracts and policy acknowledgments with signature status"
      />

      <Alert className="border-border bg-muted/50">
        <Info className="h-4 w-4" />
        <AlertTitle>E-Signature Support</AlertTitle>
        <AlertDescription>
          Intelli HRM supports electronic signatures with timestamp and IP logging 
          for legally binding document acknowledgments.
        </AlertDescription>
      </Alert>
    </div>
  );
}
