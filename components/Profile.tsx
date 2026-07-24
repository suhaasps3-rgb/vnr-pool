"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, Car, Bike, Star, Loader2, Save, Image as ImageIcon, Upload } from "lucide-react";
import { useRef } from "react";

export default function Profile({ userId }: { userId: string }) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [carNumber, setCarNumber] = useState("");
  const [bikeNumber, setBikeNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (user) {
      setCarNumber(user.car_number || "");
      setBikeNumber(user.bike_number || "");
      setFullName(user.full_name || "");
      setAvatarUrl(user.avatar_url || "");
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large! Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Compress as JPEG
        const base64String = canvas.toDataURL("image/jpeg", 0.7);
        setAvatarUrl(base64String);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('users')
        .update({
          car_number: carNumber,
          bike_number: bikeNumber,
          full_name: fullName,
          avatar_url: avatarUrl
        })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile");
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  const averageRating = user?.rating_count > 0 
    ? (user.rating_sum / user.rating_count).toFixed(1) 
    : "New";

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white dark:bg-[#1E293B] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100 dark:border-white/5">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-3xl font-black shadow-inner overflow-hidden relative flex-shrink-0">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            user?.full_name?.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your Full Name"
              className="text-2xl font-black text-gray-900 dark:text-white bg-transparent border-b-2 border-[#2563EB] outline-none w-full pb-1 mb-1"
            />
          ) : (
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              {user?.full_name}
            </h2>
          )}
          <div className="flex items-center gap-4 text-sm mt-1">
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              {user?.roll_no} • {user?.branch}
            </span>
            <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 px-2.5 py-0.5 rounded-full font-bold">
              <Star className="w-4 h-4 fill-current" />
              {averageRating}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Car className="w-5 h-5 text-gray-400" /> Vehicle Registration
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Update your profile photo URL or vehicle registration numbers below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Profile Photo
            </label>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />
            <div className="flex items-center gap-4">
              {avatarUrl && (
                <img src={avatarUrl} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm" />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!isEditing}
                className="flex items-center gap-2 bg-slate-100 dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" /> 
                {avatarUrl ? "Change Photo" : "Upload Photo"}
              </button>
              {avatarUrl && isEditing && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl("")}
                  className="text-sm text-red-500 font-medium hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Car className="w-4 h-4" /> Car Number
            </label>
            <input
              type="text"
              placeholder="e.g. TS 07 AB 1234"
              value={carNumber}
              onChange={(e) => setCarNumber(e.target.value.toUpperCase())}
              disabled={!isEditing}
              className="w-full bg-slate-50 dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:border-[#2563EB] disabled:opacity-70 font-medium uppercase"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Bike className="w-4 h-4" /> Bike Number
            </label>
            <input
              type="text"
              placeholder="e.g. TS 08 XY 9876"
              value={bikeNumber}
              onChange={(e) => setBikeNumber(e.target.value.toUpperCase())}
              disabled={!isEditing}
              className="w-full bg-slate-50 dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-4 py-3 rounded-xl outline-none focus:border-[#2563EB] disabled:opacity-70 font-medium uppercase"
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCarNumber(user?.car_number || "");
                  setBikeNumber(user?.bike_number || "");
                  setFullName(user?.full_name || "");
                  setAvatarUrl(user?.avatar_url || "");
                  setIsEditing(false);
                }}
                className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                disabled={updateProfile.isPending}
              >
                Cancel
              </button>
              <button
                onClick={() => updateProfile.mutate()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-[#2563EB] text-white hover:bg-blue-700 transition-colors shadow-sm"
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-white/5 text-gray-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
