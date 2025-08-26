// @/app/user/profile/page.tsx

"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  User,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Shield,
  Pencil,
  Camera
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    createdAt: string;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
  };
  profile?: {
    id: string;
    firstName: string;
    bio?: string;
  };
}

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  // editing state
  const [editField, setEditField] = useState<null | "name" | "firstName" | "bio" | "image">(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.id) return;
      setIsFetching(true);
      try {
        const res = await fetch(`/api/profile/${session.user.id}`);
        if (res.ok) {
          const data: ProfileData = await res.json();
          setProfileData(data);
        }
      } catch {
        toast.error("Error loading profile data");
      } finally {
        setIsFetching(false);
      }
    }
    if (!isPending) fetchProfile();
  }, [session, isPending]);

  // save logic for all types
  const handleSave = async (field: "name" | "firstName" | "bio" | "image", value?: string) => {
    if (!profileData?.user?.id) return;
    setIsSaving(true);
    try {
      let updatePayload: any = {
        name: field === "name" ? (value ?? editValue) : profileData.user.name,
        firstName: field === "firstName" ? (value ?? editValue) : profileData.profile?.firstName,
        bio: field === "bio" ? (value ?? editValue) : profileData.profile?.bio,
        image: field === "image" ? (value ?? editValue) : profileData.user.image,
      };
      const res = await fetch(`/api/profile/${profileData.user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfileData(updated);
        toast.success("Profile updated");
        setEditField(null);
      } else {
        toast.error("Can't update");
      }
    } catch {
      toast.error("Error updating profile");
    }
    setIsSaving(false);
  };

  // inline edit activation
  const activateEdit = (field: "name" | "firstName" | "bio") => {
    if (field === "name") setEditValue(profileData?.user?.name || "");
    if (field === "firstName") setEditValue(profileData?.profile?.firstName || "");
    if (field === "bio") setEditValue(profileData?.profile?.bio || "");
    setEditField(field);
  };

  const handleEditKey = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, field: "name" | "firstName" | "bio") => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave(field);
    }
    if (e.key === "Escape") setEditField(null);
  };

  // photo
  const handleAvatarClick = () => {
    if (editField !== "image" && fileInputRef.current) fileInputRef.current.click();
  };
  const convertToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = err => reject(err);
    });
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }
    setEditField("image");
    setIsSaving(true);
    try {
      const base64 = await convertToBase64(file);
      await handleSave("image", base64);
    } finally {
      setIsSaving(false);
      setEditField(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isPending || isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
      </div>
    );
  }
  if (!profileData?.user) return null;
  const user = profileData.user;
  const profile = profileData.profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto max-w-3xl p-6">
        {/* Header avec gradient - TOUT DANS LA DIV COLORÉE */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar
                className="h-24 w-24 border-4 border-white shadow-xl ring-2 ring-white/30 cursor-pointer transition hover:ring-white/60"
                onClick={handleAvatarClick}
              >
                <AvatarImage src={user.image} className="object-cover" />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {/* Icône pour éditer la photo */}
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow text-blue-700 border border-blue-200 transition hover:bg-blue-50"
                onClick={() => fileInputRef.current?.click()}
                title="Edit photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {/* Nom et Email dans la div colorée */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <div className="flex gap-2 items-center">
                  {editField === "name" ? (
                    <Input
                      autoFocus
                      value={editValue}
                      disabled={isSaving}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => handleSave("name")}
                      onKeyDown={e => handleEditKey(e, "name")}
                      className="max-w-sm bg-white/20 backdrop-blur text-white placeholder:text-white/70 border-white/30"
                    />
                  ) : (
                    <>
                      <span className="text-2xl sm:text-3xl font-bold text-white">
                        {user.name || "Anonymous User"}
                      </span>
                      <button
                        className="ml-1 text-white/80 hover:text-white"
                        onClick={() => activateEdit("name")}
                        aria-label="Edit name"
                        type="button"
                      >
                        <Pencil className="w-4 h-4 inline" />
                      </button>
                    </>
                  )}
                </div>
                <span 
                  className={
                    "flex items-center text-base sm:text-lg " +
                    (user.email === "test@test.com" ? "font-bold text-yellow-300" : "text-white/90")
                  }
                >
                  <Mail className="h-4 w-4 mr-1" />
                  {user.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* FirstName inline */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">First Name</label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border-l-4 border-green-400">
                {editField === "firstName" ? (
                  <Input
                    autoFocus
                    value={editValue}
                    disabled={isSaving}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={() => handleSave("firstName")}
                    onKeyDown={e => handleEditKey(e, "firstName")}
                    className="max-w-xs"
                  />
                ) : (
                  <>
                    <span className="font-medium text-gray-800">
                      {profile?.firstName || "Not set"}
                    </span>
                    <button
                      className="ml-1 text-green-500"
                      onClick={() => activateEdit("firstName")}
                      aria-label="Edit first name"
                      type="button"
                    >
                      <Pencil className="w-4 h-4 inline" />
                    </button>
                  </>
                )}
              </div>
            </div>
            <Separator />
            {/* Bio inline */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Biography</label>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-4">
                {editField === "bio" ? (
                  <Textarea
                    autoFocus
                    value={editValue}
                    disabled={isSaving}
                    rows={3}
                    maxLength={500}
                    onChange={e => setEditValue(e.target.value)}
                    onBlur={() => handleSave("bio")}
                    onKeyDown={e => handleEditKey(e, "bio")}
                    className="max-w-xl"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 leading-relaxed flex-1">
                      {profile?.bio || "Tell the world a bit about yourself."}
                    </span>
                    <button
                      className="ml-1 text-purple-500"
                      onClick={() => activateEdit("bio")}
                      aria-label="Edit bio"
                      type="button"
                    >
                      <Pencil className="w-4 h-4 inline" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <Separator />
            {/* Email et compte */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Member since <span className="font-medium">
                    {new Date(user.createdAt || "").toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Email Verified</span>
                  </div>
                  {user.emailVerified ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      <XCircle className="h-3 w-3 mr-1" /> Not Verified
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Two Factor Auth</span>
                  </div>
                  {user.twoFactorEnabled ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" /> Enabled
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <XCircle className="h-3 w-3 mr-1" /> Disabled
                    </Badge>
                  )}
                  </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
