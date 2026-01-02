import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface LogoUploadProps {
  logoUrl?: string;
  onLogoChange: (url: string | undefined) => void;
}

export function LogoUpload({ logoUrl, onLogoChange }: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be smaller than 2MB");
      return;
    }

    setIsUploading(true);
    try {
      // Convert to base64 data URL for storage
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onLogoChange(dataUrl);
        toast.success("Logo uploaded successfully");
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read image file");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload logo");
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    onLogoChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <Label>Company Logo</Label>
      <p className="text-sm text-muted-foreground">
        Upload your company logo for covers and headers (PNG, JPG, max 2MB)
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {logoUrl ? (
        <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
          <div className="w-24 h-16 bg-white rounded border flex items-center justify-center p-2">
            <img 
              src={logoUrl} 
              alt="Company logo preview" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Logo uploaded</p>
            <p className="text-xs text-muted-foreground">Click to replace or remove</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-1" />
              Replace
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRemoveLogo}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer"
        >
          <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">
            {isUploading ? "Uploading..." : "Click to upload logo"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG up to 2MB
          </p>
        </button>
      )}
    </div>
  );
}