"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User, Car, Bike, Star, Loader2, Save, Upload,
  CheckCircle2, AlertTriangle, Edit3, X, Shield,
  Phone, BookOpen, MapPin
} from "lucide-react";

// ── Section Divider ────────────────────────────────────────
function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
      <span
        className="text-[10px] font-bold uppercase tracking-widest px-2"
        style={{ color: "var(--text-tertiary)" }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
    </div>
  );
}

// ── Read-Only Field ────────────────────────────────────────
function ReadOnlyField({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div className="space-y-1.5">
      <label
        className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
        style={{ color: "var(--text-tertiary)" }}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      <div
        className="w-full px-4 py-3 rounded-xl text-sm font-medium"
        style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-secondary)",
        }}
      >
        {value || "—"}
      </div>
    </div>
  );
}

// ── Editable Input ─────────────────────────────────────────
function EditableInput({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  icon: Icon,
  type = "text",
  uppercase = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  placeholder?: string;
  icon?: React.ElementType;
  type?: string;
  uppercase?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
        style={{ color: "var(--text-tertiary)" }}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(uppercase ? e.target.value.toUpperCase() : e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="ui-input w-full px-4 py-3 rounded-xl text-sm font-medium disabled:opacity-60 disabled:cursor-default"
        style={{ color: "var(--text-primary)" }}
      />
    </div>
  );
}

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
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
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
      toast.error("File too large. Max 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 256;
        let w = img.width, h = img.height;
        if (w > h && w > MAX) { h *= MAX / w; w = MAX; }
        else if (h > MAX) { w *= MAX / h; h = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
        setAvatarUrl(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const updateProfile = useMutation({
    mutationFn: async () => {
      const vehicleRegex = /^(AP|TS|TG|KA|MH|TN|DL|UP|RJ|GJ|HR|KL|MP|WB|BR|OR|PB|CG|JH|AS|NL|MN|SK|ML|TR|MZ|AR|AN|CH|DD|DN|JK|LA|LD|PY)\s?[0-9]{2}\s?[A-Z]{1,2}\s?[0-9]{4}$/i;
      if (carNumber && !vehicleRegex.test(carNumber.trim())) {
        throw new Error("Invalid car number format (e.g., TS 08 AB 1234)");
      }
      if (bikeNumber && !vehicleRegex.test(bikeNumber.trim())) {
        throw new Error("Invalid bike number format (e.g., TS 08 AB 1234)");
      }
      const { error } = await supabase.from("users").update({
        car_number: carNumber,
        bike_number: bikeNumber,
        full_name: fullName,
        avatar_url: avatarUrl,
      }).eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated!");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  const handleCancel = () => {
    setCarNumber(user?.car_number || "");
    setBikeNumber(user?.bike_number || "");
    setFullName(user?.full_name || "");
    setAvatarUrl(user?.avatar_url || "");
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: "var(--accent-price)" }} />
      </div>
    );
  }

  const averageRating = user?.rating_count > 0
    ? (user.rating_sum / user.rating_count).toFixed(1)
    : null;

  return (
    <div className="space-y-0 pb-4">
      {/* ── Profile Hero ── */}
      <div
        className="rounded-3xl p-5 mb-4"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-white text-2xl font-black shadow-lg"
              style={{ background: "linear-gradient(135deg, #6366F1, #A855F7)" }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.full_name?.charAt(0).toUpperCase() || "?"
              )}
            </div>
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                <Upload className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black truncate" style={{ color: "var(--text-primary)" }}>
              {user?.full_name}
            </h2>
            <p className="text-xs font-medium mt-0.5 truncate" style={{ color: "var(--text-secondary)" }}>
              {user?.roll_no} • {user?.branch}
            </p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{ background: "rgba(99,102,241,0.1)", color: "var(--accent-primary)" }}
              >
                <Shield className="w-2.5 h-2.5 inline mr-0.5" />
                Verified VNRian
              </span>
              {averageRating && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  ★ {averageRating} ({user.rating_count} {user.rating_count === 1 ? "rating" : "ratings"})
                </span>
              )}
            </div>
          </div>

          {/* Edit toggle */}
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2.5 rounded-xl transition-colors flex-shrink-0"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              <Edit3 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="p-2.5 rounded-xl transition-colors flex-shrink-0"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#EF4444",
              }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Section 1: Personal Information ── */}
      <div
        className="rounded-3xl p-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
      >
        <h3
          className="text-sm font-bold flex items-center gap-2 mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          <User className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />
          Personal Information
        </h3>

        <div className="space-y-4">
          {/* Full Name — editable */}
          <EditableInput
            label="Full Name"
            value={fullName}
            onChange={setFullName}
            disabled={!isEditing}
            placeholder="Your full name"
            icon={User}
          />

          {/* Photo upload button */}
          {isEditing && (
            <div className="space-y-1.5">
              <label
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                Profile Photo
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-input)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Upload className="w-4 h-4" />
                  {avatarUrl ? "Change Photo" : "Upload Photo"}
                </button>
                {avatarUrl && (
                  <button
                    onClick={() => setAvatarUrl("")}
                    className="text-xs font-semibold text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Read-only fields */}
          <div className="grid grid-cols-1 gap-4">
            <ReadOnlyField label="Email" value={user?.email || ""} icon={BookOpen} />
            <div className="grid grid-cols-2 gap-3">
              <ReadOnlyField label="Roll No." value={user?.roll_no || ""} />
              <ReadOnlyField label="Branch" value={user?.branch || ""} />
            </div>
            <ReadOnlyField label="Mobile" value={user?.mobile_number || ""} icon={Phone} />
          </div>
        </div>
      </div>

      <SectionDivider label="Vehicle Registration" />

      {/* ── Section 2: Vehicle Registration ── */}
      <div
        className="rounded-3xl p-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
      >
        <h3
          className="text-sm font-bold flex items-center gap-2 mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          <Car className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />
          Your Vehicles
        </h3>
        <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>
          Required to offer rides. Format: TS 08 AB 1234
        </p>

        <div className="grid grid-cols-1 gap-4">
          <EditableInput
            label="Car Number"
            value={carNumber}
            onChange={setCarNumber}
            disabled={!isEditing}
            placeholder="e.g. TS 07 AB 1234"
            icon={Car}
            uppercase
          />
          <EditableInput
            label="Bike Number"
            value={bikeNumber}
            onChange={setBikeNumber}
            disabled={!isEditing}
            placeholder="e.g. TS 08 XY 9876"
            icon={Bike}
            uppercase
          />
        </div>

        {/* Save button */}
        {isEditing && (
          <div className="flex gap-3 mt-5 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <button
              onClick={handleCancel}
              className="flex-1 py-3 rounded-xl font-bold text-sm transition-colors"
              style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
              disabled={updateProfile.isPending}
            >
              Cancel
            </button>
            <button
              onClick={() => updateProfile.mutate()}
              disabled={updateProfile.isPending}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: "var(--accent-primary)", boxShadow: "var(--shadow-button)" }}
            >
              {updateProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>

      <SectionDivider label="Safety & Trust" />

      {/* ── Section 3: Safety Guidelines (moved from Dashboard sidebar) ── */}
      <div
        className="rounded-3xl p-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
      >
        <h3
          className="text-sm font-bold flex items-center gap-2 mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Safety Guidelines
        </h3>

        <ul className="space-y-3">
          {[
            { icon: Shield, text: "Always verify the driver's college ID before boarding." },
            { icon: MapPin, text: "Share your live location with a friend before every ride." },
            { icon: CheckCircle2, text: "Payments are made directly to the driver via UPI only. VNR Pool never handles money." },
            { icon: CheckCircle2, text: "Only ride with verified @vnrvjiet.in students." },
            { icon: AlertTriangle, text: "Report any issues to the college transport committee." },
          ].map(({ icon: Icon, text }, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <Icon
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: idx >= 3 ? "#F59E0B" : "var(--accent-success)" }}
              />
              <span className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {text}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
