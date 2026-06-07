"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthContext";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Save, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function ProfilePage() {
  const { user, profile, loading, updateUserProfile } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPreviewUrl(profile.photoURL || null);
    }
  }, [profile]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile(name, photoFile);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 bg-background">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-background rounded-3xl shadow-xl p-8 md:p-12 border border-border/30">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Profile Settings</h1>

          <form onSubmit={handleSave} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-32 h-32 rounded-full overflow-hidden bg-stone-100 border-4 border-white shadow-lg relative">
                  {previewUrl ? (
                    <Image src={previewUrl} alt="Avatar" fill sizes="128px" className="object-cover" />
                  ) : (
                    <UserIcon className="w-16 h-16 text-stone-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                />
              </div>
              <div className="flex-1 pt-2 text-center sm:text-left">
                <h3 className="font-bold text-lg text-foreground mb-1">Profile Picture</h3>
                <p className="text-sm text-stone-500 mb-4">
                  JPG, PNG or WEBP. Max size of 5MB.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-full transition-colors"
                >
                  Change Picture
                </button>
              </div>
            </div>

            <div className="h-px bg-stone-100 w-full" />

            {/* Info Section */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-stone-600 mb-2">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || user.email || ""}
                  className="w-full bg-foreground/5 border border-border/30 text-foreground/70 rounded-xl py-3 px-4 cursor-not-allowed"
                />
                <p className="text-xs text-stone-400 mt-2">Email address cannot be changed.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-600 mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-transparent border border-border/30 text-foreground rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 px-8 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
