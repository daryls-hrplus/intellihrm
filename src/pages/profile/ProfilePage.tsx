import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  Camera,
  Loader2,
  Save,
  Shield,
  UserCog,
} from "lucide-react";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  department: z.string().max(100).optional().or(z.literal("")),
  job_title: z.string().max(100).optional().or(z.literal("")),
  emergency_contact_name: z.string().max(100).optional().or(z.literal("")),
  emergency_contact_phone: z.string().max(20).optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, profile, roles } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: "",
    phone: "",
    address: "",
    department: "",
    job_title: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: "",
        address: "",
        department: "",
        job_title: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
      });
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const newAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: newAvatarUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
      toast({
        title: "Photo updated",
        description: "Your profile photo has been updated successfully.",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setErrors({});
    const result = profileSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: formData.full_name })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = () => {
    if (roles.includes("admin")) {
      return { label: "Admin", icon: Shield, color: "bg-destructive/10 text-destructive" };
    }
    if (roles.includes("hr_manager")) {
      return { label: "HR Manager", icon: UserCog, color: "bg-primary/10 text-primary" };
    }
    return { label: "Employee", icon: User, color: "bg-muted text-muted-foreground" };
  };

  const roleBadge = getRoleBadge();
  const RoleIcon = roleBadge.icon;

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-1 text-muted-foreground">
            View and update your personal information
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-slide-up">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="relative">
              <button
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="group relative h-28 w-28 overflow-hidden rounded-full bg-primary/10 transition-all hover:ring-4 hover:ring-primary/20 disabled:opacity-50"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary">
                    {getInitials(formData.full_name)}
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/50 opacity-0 transition-opacity group-hover:opacity-100">
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-background" />
                  ) : (
                    <Camera className="h-6 w-6 text-background" />
                  )}
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-semibold text-card-foreground">
                {formData.full_name || "Your Name"}
              </h2>
              <p className="mt-1 text-muted-foreground">{profile?.email}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                    roleBadge.color
                  )}
                >
                  <RoleIcon className="h-3.5 w-3.5" />
                  {roleBadge.label}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              Personal Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={cn(
                      "h-11 w-full rounded-lg border bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
                      errors.full_name ? "border-destructive" : "border-input"
                    )}
                  />
                </div>
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="h-11 w-full rounded-lg border border-input bg-muted pl-10 pr-4 text-muted-foreground"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Main St, City, Country"
                    className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "150ms" }}>
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              Work Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Department
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Engineering"
                    className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Job Title
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleChange}
                    placeholder="Software Engineer"
                    className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: "200ms" }}>
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">
              Emergency Contact
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  className="h-11 w-full rounded-lg border border-input bg-background px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 987-6543"
                  className="h-11 w-full rounded-lg border border-input bg-background px-4 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
