import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { userService, type SocialLinksPayload } from "@/services/userService";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

import {
  Camera,
  Pencil,
  Save,
  X,
  BadgeCheck,
  Globe,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Github,
} from "lucide-react";

// ─── Zod Schemas ────────────────────────────────────────────────────
const profileSchema = z.object({
  fullname: z.string().min(3, "Họ tên ít nhất 3 ký tự"),
  username: z.string().min(3, "Username ít nhất 3 ký tự"),
  bio: z.string().max(500, "Bio tối đa 500 ký tự").optional().or(z.literal("")),
});

const optionalUrl = z
  .string()
  .url("URL không hợp lệ")
  .optional()
  .or(z.literal(""));

const socialSchema = z.object({
  youtube: optionalUrl,
  instagram: optionalUrl,
  facebook: optionalUrl,
  twitter: optionalUrl,
  github: optionalUrl,
  website: optionalUrl,
});

type ProfileFormData = z.infer<typeof profileSchema>;
type SocialLinksFormData = z.infer<typeof socialSchema>;

const defaultSocial: SocialLinksFormData = {
  youtube: "",
  instagram: "",
  facebook: "",
  twitter: "",
  github: "",
  website: "",
};

// ─── Social config ──────────────────────────────────────────────────
const socialConfig = [
  {
    key: "website",
    label: "Website",
    icon: Globe,
    placeholder: "https://example.com",
  },
  {
    key: "github",
    label: "GitHub",
    icon: Github,
    placeholder: "https://github.com/username",
  },
  {
    key: "twitter",
    label: "Twitter / X",
    icon: Twitter,
    placeholder: "https://x.com/username",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: Instagram,
    placeholder: "https://instagram.com/username",
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: Facebook,
    placeholder: "https://facebook.com/username",
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: Youtube,
    placeholder: "https://youtube.com/@channel",
  },
] as const;

// ─── Component ──────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, updateProfile, fetchMe } = useAuthStore();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSocial, setLoadingSocial] = useState(true);

  // Avatar
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // ─── React Hook Form – Profile ────────────────────────────────────
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullname: "", username: "", bio: "" },
  });

  // ─── React Hook Form – Social Links ──────────────────────────────
  const {
    register: registerSocial,
    reset: resetSocial,
    getValues: getSocialValues,
    formState: { errors: socialErrors },
    trigger: triggerSocial,
  } = useForm<SocialLinksFormData>({
    resolver: zodResolver(socialSchema),
    defaultValues: { ...defaultSocial },
  });

  // Keep a snapshot of the last-saved social links for dirty checking
  const [originalSocial, setOriginalSocial] =
    useState<SocialLinksFormData>(defaultSocial);

  // ─── Sync forms with user / API data ──────────────────────────────
  useEffect(() => {
    if (user) {
      const profileValues: ProfileFormData = {
        fullname: user.fullname ?? "",
        username: user.username ?? "",
        bio: user.bio ?? "",
      };
      resetProfile(profileValues);

      if (user.social_links) {
        const s: SocialLinksFormData = {
          youtube: user.social_links.youtube ?? "",
          instagram: user.social_links.instagram ?? "",
          facebook: user.social_links.facebook ?? "",
          twitter: user.social_links.twitter ?? "",
          github: user.social_links.github ?? "",
          website: user.social_links.website ?? "",
        };
        resetSocial(s);
        setOriginalSocial(s);
        setLoadingSocial(false);
      } else {
        fetchSocialLinks();
      }
    }
  }, [user?.id]);

  const fetchSocialLinks = useCallback(async () => {
    try {
      setLoadingSocial(true);
      const res = await userService.getSocialLinks();
      const s: SocialLinksFormData = {
        youtube: res.social_links.youtube ?? "",
        instagram: res.social_links.instagram ?? "",
        facebook: res.social_links.facebook ?? "",
        twitter: res.social_links.twitter ?? "",
        github: res.social_links.github ?? "",
        website: res.social_links.website ?? "",
      };
      resetSocial(s);
      setOriginalSocial(s);
    } catch {
      // ignore – will show empty
    } finally {
      setLoadingSocial(false);
    }
  }, [resetSocial]);

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleAvatarClick = () => {
    if (uploadingAvatar) return;
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      await updateProfile(fd);
      await fetchMe();
    } catch (error) {
      console.error(error);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (user) {
      resetProfile({
        fullname: user.fullname ?? "",
        username: user.username ?? "",
        bio: user.bio ?? "",
      });
    }
    resetSocial({ ...originalSocial });
  };

  const onSubmit = async (profileData: ProfileFormData) => {
    if (!user) return;

    // Validate social links first
    const socialValid = await triggerSocial();
    if (!socialValid) return;

    setSaving(true);
    try {
      // 1. Update profile text fields
      const fd = new FormData();
      fd.append("fullname", profileData.fullname);
      fd.append("username", profileData.username);
      fd.append("bio", profileData.bio ?? "");

      const result = await updateProfile(fd);

      // 2. Update social links if changed
      const socialData = getSocialValues();
      const socialChanged = (
        Object.keys(socialData) as (keyof SocialLinksFormData)[]
      ).some((k) => socialData[k] !== originalSocial[k]);

      if (socialChanged) {
        const payload: SocialLinksPayload = { ...socialData };
        await userService.updateSocialLinks(payload);
        setOriginalSocial({ ...socialData });
        if (result) toast.success("Cập nhật liên kết xã hội thành công!");
      }
      await fetchMe();
      setEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      {/* ── Header ─────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-1.5">
          Manage your personal information
        </p>
      </div>

      <form
        onSubmit={handleProfileSubmit(onSubmit)}
        className="rounded-2xl border bg-card shadow-sm overflow-hidden"
      >
        <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-8 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            <div className="relative group">
              <Avatar className="size-24 ring-4 ring-background shadow-lg">
                <AvatarImage
                  src={user?.profile_img ?? undefined}
                  alt={user.fullname}
                />
                <AvatarFallback className="text-2xl font-semibold bg-primary/20 text-primary">
                  {user?.fullname?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className={`absolute inset-0 flex items-center justify-center rounded-full transition-opacity cursor-pointer ${
                  uploadingAvatar
                    ? "bg-black/50 opacity-100"
                    : "bg-black/40 opacity-0 group-hover:opacity-100"
                }`}
                aria-label="Change avatar"
              >
                {uploadingAvatar ? (
                  <Spinner className="size-6 text-white" />
                ) : (
                  <Camera className="size-6 text-white" />
                )}
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Name & meta */}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h2 className="text-xl font-semibold">{user.fullname}</h2>
              <p className="text-muted-foreground text-sm">@{user.username}</p>
              <div className="flex items-center gap-2 justify-center sm:justify-start mt-1">
                {user.verified && (
                  <Badge
                    variant="secondary"
                    className="gap-1 text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
                  >
                    <BadgeCheck className="size-3.5" />
                    Verified
                  </Badge>
                )}
                {user.google_auth && (
                  <Badge variant="secondary" className="gap-1">
                    Google
                  </Badge>
                )}
              </div>
            </div>

            {/* Edit / Save buttons */}
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    <X className="size-4 mr-1" />
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={saving}>
                    {saving ? (
                      <Spinner className="size-4 mr-1" />
                    ) : (
                      <Save className="size-4 mr-1" />
                    )}
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="size-4 mr-1" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* ── About ────────────────────────────────── */}
        <section className="px-6 py-6 sm:px-8">
          <h3 className="text-xl font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            About
          </h3>
          {editing ? (
            <div>
              <Textarea
                {...registerProfile("bio")}
                placeholder="Tell people about yourself..."
                rows={3}
                maxLength={500}
                className="resize-none"
              />
              {profileErrors.bio && (
                <p className="text-sm text-destructive mt-1">
                  {profileErrors.bio.message}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-foreground/80">
              {user.bio || (
                <span className="italic text-muted-foreground">
                  No bio yet.
                </span>
              )}
            </p>
          )}
        </section>

        <Separator />

        {/* ── Personal Information ─────────────────── */}
        <section className="px-6 py-6 sm:px-8">
          <h3 className="text-xl font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Full Name
              </label>
              {editing ? (
                <div>
                  <Input
                    {...registerProfile("fullname")}
                    placeholder="Your full name"
                  />
                  {profileErrors.fullname && (
                    <p className="text-sm text-destructive mt-1">
                      {profileErrors.fullname.message}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm font-medium py-2">{user.fullname}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                Email Address
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold tracking-wider"
                >
                  PRIMARY
                </Badge>
              </label>
              <p className="text-sm font-medium py-2 text-foreground/80">
                {user.email}
              </p>
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Username
              </label>
              {editing ? (
                <div>
                  <Input
                    {...registerProfile("username")}
                    placeholder="username"
                  />
                  {profileErrors.username && (
                    <p className="text-sm text-destructive mt-1">
                      {profileErrors.username.message}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm font-medium py-2">@{user.username}</p>
              )}
            </div>
          </div>
        </section>

        <Separator />

        {/* ── Connected Accounts (Social Links) ────── */}
        <section className="px-6 py-6 sm:px-8">
          <h3 className="text-xl font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Connected Accounts
          </h3>

          {loadingSocial ? (
            <div className="flex justify-center py-6">
              <Spinner className="size-6" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {socialConfig.map(({ key, label, icon: Icon, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Icon className="size-3.5" />
                    {label}
                  </label>
                  {editing ? (
                    <div>
                      <Input
                        {...registerSocial(key as keyof SocialLinksFormData)}
                        placeholder={placeholder}
                      />
                      {socialErrors[key as keyof SocialLinksFormData] && (
                        <p className="text-sm text-destructive mt-1">
                          {
                            socialErrors[key as keyof SocialLinksFormData]
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between py-2">
                      {originalSocial[key as keyof SocialLinksFormData] ? (
                        <a
                          href={
                            originalSocial[key as keyof SocialLinksFormData]
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate max-w-[90%]"
                        >
                          {originalSocial[key as keyof SocialLinksFormData]}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          Not connected
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </form>
    </div>
  );
}
