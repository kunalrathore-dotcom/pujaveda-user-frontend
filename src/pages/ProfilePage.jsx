import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Camera,
  MapPin,
  Package,
  Heart,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Plus,
  Trash2,
  Check,
  X,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { profileService } from "../services/profileService";
import { resolveImageUrl } from "../utils/imageHelper";

export default function ProfilePage() {
  const { user: authUser, updateUser, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fileInputRef = useRef(null);

  // Profile data & loading
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ totalOrders: 0, wishlistCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Personal Details state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState(null);

  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const [avatarSuccess, setAvatarSuccess] = useState(null);

  // Address Modal/Form state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState(null);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, location]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await profileService.getProfile();
      if (res && res.success && res.user) {
        setProfile(res.user);
        setEditName(res.user.name || "");
        setEditPhone(res.user.phone || "");
        if (res.stats) {
          setStats(res.stats);
        }
        // Sync context
        updateUser(res.user);
      } else {
        setError(res?.message || "Failed to load profile.");
      }
    } catch (err) {
      console.error("Profile load error:", err);
      setError(err.message || "Failed to load customer profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated]);

  // Handle Avatar selection and upload
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = "";

    // Client-side validations
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Please select a JPEG, PNG, or WebP image.");
      setTimeout(() => setAvatarError(null), 4000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Profile photo cannot exceed 5MB.");
      setTimeout(() => setAvatarError(null), 4000);
      return;
    }

    try {
      setUploadingAvatar(true);
      setAvatarError(null);
      setAvatarSuccess(null);

      const res = await profileService.uploadAvatar(file);
      if (res && res.success && res.user) {
        setProfile(res.user);
        updateUser(res.user);
        setAvatarSuccess("Profile photo updated successfully!");
        setTimeout(() => setAvatarSuccess(null), 4000);
      } else {
        setAvatarError(res?.message || "Failed to upload photo.");
      }
    } catch (err) {
      console.error("Avatar upload error:", err);
      setAvatarError(err.message || "Failed to upload profile photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle Personal Details update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = editName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setProfileErrorMsg("Name must be at least 2 characters long.");
      return;
    }

    try {
      setSavingProfile(true);
      setProfileErrorMsg(null);
      setProfileSuccessMsg(null);

      const res = await profileService.updateProfile({
        name: trimmedName,
        phone: editPhone.trim(),
      });

      if (res && res.success && res.user) {
        setProfile(res.user);
        updateUser(res.user);
        setIsEditingProfile(false);
        setProfileSuccessMsg("Profile details updated successfully.");
        setTimeout(() => setProfileSuccessMsg(null), 4000);
      } else {
        setProfileErrorMsg(res?.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setProfileErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Address Management
  const handleOpenAddAddress = () => {
    setEditingAddressIndex(null);
    setAddressForm({
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      isDefault: profile?.addresses?.length === 0,
    });
    setAddressError(null);
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr, index) => {
    setEditingAddressIndex(index);
    setAddressForm({
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "India",
      isDefault: Boolean(addr.isDefault),
    });
    setAddressError(null);
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.street.trim() || !addressForm.city.trim() || !addressForm.state.trim() || !addressForm.postalCode.trim()) {
      setAddressError("Please fill in all address fields.");
      return;
    }

    try {
      setSavingAddress(true);
      setAddressError(null);

      const existing = Array.isArray(profile?.addresses) ? [...profile.addresses] : [];
      let updatedList = [];

      if (editingAddressIndex !== null && editingAddressIndex >= 0) {
        // Edit existing
        updatedList = existing.map((a, i) => (i === editingAddressIndex ? { ...addressForm } : a));
      } else {
        // Add new
        updatedList = [...existing, { ...addressForm }];
      }

      // If marked as default, unset other defaults
      if (addressForm.isDefault) {
        const targetIdx = editingAddressIndex !== null ? editingAddressIndex : updatedList.length - 1;
        updatedList = updatedList.map((a, i) => ({
          ...a,
          isDefault: i === targetIdx,
        }));
      }

      const res = await profileService.updateProfile({ addresses: updatedList });
      if (res && res.success && res.user) {
        setProfile(res.user);
        updateUser(res.user);
        setShowAddressModal(false);
      } else {
        setAddressError(res?.message || "Failed to save address.");
      }
    } catch (err) {
      console.error("Address save error:", err);
      setAddressError(err.message || "Failed to save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (indexToDelete) => {
    if (!window.confirm("Are you sure you want to remove this delivery address?")) return;

    try {
      const existing = Array.isArray(profile?.addresses) ? [...profile.addresses] : [];
      const updatedList = existing.filter((_, i) => i !== indexToDelete);

      const res = await profileService.updateProfile({ addresses: updatedList });
      if (res && res.success && res.user) {
        setProfile(res.user);
        updateUser(res.user);
      }
    } catch (err) {
      console.error("Address delete error:", err);
      alert(err.message || "Failed to delete address.");
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center bg-[#FAF6F0]/40">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#5C0F17] border-t-transparent" />
          <p className="text-xs font-bold text-[#5C0F17] tracking-wider uppercase">
            Loading your sacred profile...
          </p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-[50vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full rounded-3xl border border-rose-200 bg-rose-50/60 p-8 text-center shadow-xs">
          <AlertCircle size={36} className="mx-auto text-rose-600 mb-3" />
          <h2 className="text-lg font-black text-neutral-900">Profile Unavailable</h2>
          <p className="mt-1 text-xs text-neutral-600">{error || "Could not retrieve account details."}</p>
          <button
            type="button"
            onClick={loadProfile}
            className="mt-5 rounded-full bg-[#5C0F17] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#4A0D15] transition"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const avatarUrl = resolveImageUrl(profile.avatar);
  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : "D";

  return (
    <main className="min-h-screen bg-[#FAF6F0]/50 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Alerts / Feedback */}
        {profileSuccessMsg && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 shadow-xs">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            {profileSuccessMsg}
          </div>
        )}
        {avatarSuccess && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 shadow-xs">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            {avatarSuccess}
          </div>
        )}
        {(profileErrorMsg || avatarError) && (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-800 shadow-xs">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            {profileErrorMsg || avatarError}
          </div>
        )}

        {/* ============================================================ */}
        {/* A. Top Profile Overview Hero Banner                          */}
        {/* ============================================================ */}
        <section className="rounded-3xl border border-[#3E0F16] bg-gradient-to-r from-[#25080D] via-[#330A12] to-[#4A0D15] p-6 sm:p-8 text-[#FAF5ED] shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Avatar with Camera Button */}
              <div className="relative group">
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden border-4 border-[#DA9B26]/80 bg-[#1A0508] shadow-lg flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-serif text-3xl sm:text-4xl font-black text-[#DA9B26]">
                      {initial}
                    </span>
                  )}
                </div>

                {/* Upload Button Overlay */}
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  title="Upload profile photo"
                  className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#DA9B26] text-[#2D0A10] shadow-md transition hover:bg-[#F5B038] hover:scale-105 active:scale-95 disabled:opacity-60"
                  aria-label="Upload photo"
                >
                  {uploadingAvatar ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  aria-label="Profile photo upload file input"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-serif text-2xl sm:text-3xl font-black tracking-tight text-[#FFFDF9]">
                    {profile.name}
                  </h1>
                  <span className="rounded-full bg-[#DA9B26]/20 border border-[#DA9B26]/40 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#DA9B26]">
                    Puja Devotee
                  </span>
                </div>

                <p className="mt-1 text-xs text-[#D8C7B8] flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail size={13} className="text-[#DA9B26]" /> {profile.email}
                </p>
                {profile.phone && (
                  <p className="mt-0.5 text-xs text-[#D8C7B8] flex items-center justify-center sm:justify-start gap-1.5">
                    <Phone size={13} className="text-[#DA9B26]" /> {profile.phone}
                  </p>
                )}

                <p className="mt-2 text-[11px] text-[#A89688]">
                  Devotee Member since{" "}
                  {profile.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
                        month: "long",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Edit Profile Action */}
            <button
              type="button"
              onClick={() => {
                setIsEditingProfile(!isEditingProfile);
                setEditName(profile.name || "");
                setEditPhone(profile.phone || "");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#DA9B26]/60 bg-[#DA9B26]/10 px-5 py-2 text-xs font-bold text-[#DA9B26] hover:bg-[#DA9B26] hover:text-[#2D0A10] transition shadow-xs"
            >
              <Edit3 size={14} />
              {isEditingProfile ? "Cancel Editing" : "Edit Profile"}
            </button>
          </div>
        </section>

        {/* ============================================================ */}
        {/* B. Account Quick Stats Navigation                            */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/orders"
            className="rounded-3xl border border-[#EEDBC5] bg-white p-5 shadow-xs hover:border-[#DA9B26] hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5C0F17]/10 text-[#5C0F17] group-hover:bg-[#5C0F17] group-hover:text-white transition">
                <Package size={20} />
              </span>
              <span className="font-mono text-2xl font-black text-[#5C0F17]">
                {stats.totalOrders}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#2D1C13]">My Puja Orders</h3>
            <p className="text-[11px] text-neutral-500">Track current shipments and order history</p>
          </Link>

          <Link
            to="/favourites"
            className="rounded-3xl border border-[#EEDBC5] bg-white p-5 shadow-xs hover:border-[#DA9B26] hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition">
                <Heart size={20} />
              </span>
              <span className="font-mono text-2xl font-black text-rose-700">
                {stats.wishlistCount}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#2D1C13]">Sacred Wishlist</h3>
            <p className="text-[11px] text-neutral-500">View saved divine items and samagri</p>
          </Link>

          <Link
            to="/cart"
            className="rounded-3xl border border-[#EEDBC5] bg-white p-5 shadow-xs hover:border-[#DA9B26] hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DA9B26]/10 text-[#DA9B26] group-hover:bg-[#DA9B26] group-hover:text-[#2D0A10] transition">
                <ShoppingBag size={20} />
              </span>
              <ArrowRight size={18} className="text-neutral-400 group-hover:translate-x-1 transition" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#2D1C13]">Shopping Cart</h3>
            <p className="text-[11px] text-neutral-500">Proceed to checkout with sacred items</p>
          </Link>
        </div>

        {/* ============================================================ */}
        {/* C. Personal Details Section                                  */}
        {/* ============================================================ */}
        <section className="rounded-3xl border border-[#EEDBC5] bg-white p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#EEDBC5]/60 pb-4 mb-5">
            <div>
              <h2 className="font-serif text-lg font-black text-[#5C0F17]">Personal Details</h2>
              <p className="text-xs text-neutral-500">Your profile information for communications and orders</p>
            </div>
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1C13] mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={50}
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-2.5 text-xs text-[#2D1C13] outline-none focus:border-[#5C0F17] focus:ring-2 focus:ring-[#5C0F17]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2D1C13] mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  maxLength={15}
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-2xl border border-neutral-300 px-4 py-2.5 text-xs text-[#2D1C13] outline-none focus:border-[#5C0F17] focus:ring-2 focus:ring-[#5C0F17]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Email Address (Account Security)
                </label>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-xs text-neutral-500 cursor-not-allowed"
                />
                <p className="text-[11px] text-neutral-400 mt-1">
                  Your registered email is linked to your login credentials and verified authentication.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-full bg-[#5C0F17] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#4A0D15] transition disabled:opacity-50 flex items-center gap-2"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  type="button"
                  disabled={savingProfile}
                  onClick={() => setIsEditingProfile(false)}
                  className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="rounded-2xl bg-[#FAF6F0]/60 border border-[#EEDBC5]/60 p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Full Name</span>
                <span className="font-bold text-base text-[#2D1C13] block">{profile.name}</span>
              </div>

              <div className="rounded-2xl bg-[#FAF6F0]/60 border border-[#EEDBC5]/60 p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Email Address</span>
                <span className="font-semibold text-base text-[#2D1C13] block">{profile.email}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 mt-1">
                  <ShieldCheck size={13} /> Verified Account
                </span>
              </div>

              <div className="rounded-2xl bg-[#FAF6F0]/60 border border-[#EEDBC5]/60 p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Phone Number</span>
                <span className="font-semibold text-base text-[#2D1C13] block">
                  {profile.phone || "No phone added yet"}
                </span>
              </div>

              <div className="rounded-2xl bg-[#FAF6F0]/60 border border-[#EEDBC5]/60 p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Account ID</span>
                <span className="font-mono text-xs text-neutral-600 block truncate">{profile._id}</span>
                <span className="text-[11px] text-neutral-400">Database Record Key</span>
              </div>
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* D. Saved Delivery Addresses Section                          */}
        {/* ============================================================ */}
        <section className="rounded-3xl border border-[#EEDBC5] bg-white p-6 sm:p-7 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEDBC5]/60 pb-4 mb-5">
            <div>
              <h2 className="font-serif text-lg font-black text-[#5C0F17]">Saved Delivery Addresses</h2>
              <p className="text-xs text-neutral-500">Manage addresses for fast, effortless puja checkout</p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddAddress}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#5C0F17] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#4A0D15] transition"
            >
              <Plus size={14} /> Add Address
            </button>
          </div>

          {Array.isArray(profile.addresses) && profile.addresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.addresses.map((addr, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl border p-4 text-xs relative flex flex-col justify-between transition ${
                    addr.isDefault
                      ? "border-[#DA9B26] bg-[#FFFDF9] shadow-xs"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-[#2D1C13] flex items-center gap-1">
                        <MapPin size={14} className="text-[#DA9B26]" /> Address #{idx + 1}
                      </span>
                      {addr.isDefault && (
                        <span className="rounded-full bg-[#DA9B26]/15 border border-[#DA9B26]/30 px-2 py-0.5 text-[10px] font-bold text-[#5C0F17]">
                          Default Delivery Address
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-neutral-700">{addr.street}</p>
                    <p className="text-neutral-600">
                      {addr.city}, {addr.state} {addr.postalCode ? `- ${addr.postalCode}` : ""}
                    </p>
                    <p className="text-neutral-400">{addr.country || "India"}</p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-neutral-100 mt-4 justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenEditAddress(addr, idx)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5C0F17] hover:underline"
                    >
                      <Edit3 size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(idx)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:underline"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#EEDBC5] p-8 text-center">
              <MapPin size={32} className="mx-auto text-neutral-300 mb-2" />
              <h3 className="text-sm font-bold text-neutral-700">No saved addresses yet</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Add your home or temple delivery address to save time on future puja orders.
              </p>
              <button
                type="button"
                onClick={handleOpenAddAddress}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#5C0F17] px-4 py-2 text-xs font-bold text-[#5C0F17] hover:bg-[#5C0F17] hover:text-white transition"
              >
                <Plus size={14} /> Add First Address
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ============================================================ */}
      {/* Address Add / Edit Modal                                     */}
      {/* ============================================================ */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-neutral-100">
            <button
              type="button"
              onClick={() => setShowAddressModal(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <h3 className="font-serif text-lg font-black text-[#5C0F17]">
              {editingAddressIndex !== null ? "Edit Address" : "Add New Address"}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5 mb-4">
              Enter your accurate street and PIN details for sacred delivery.
            </p>

            {addressError && (
              <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
                {addressError}
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#2D1C13] mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="House/Flat No., Building, Street Name"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs outline-none focus:border-[#5C0F17]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2D1C13] mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Varanasi, Delhi"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs outline-none focus:border-[#5C0F17]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D1C13] mb-1">State</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Uttar Pradesh"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs outline-none focus:border-[#5C0F17]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2D1C13] mb-1">Postal / PIN Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 221001"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs outline-none focus:border-[#5C0F17]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D1C13] mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs outline-none focus:border-[#5C0F17]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="rounded text-[#5C0F17] focus:ring-[#5C0F17]"
                  />
                  <span className="font-semibold text-neutral-700">Set as default delivery address</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="rounded-full border border-neutral-300 px-4 py-2 font-bold text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="rounded-full bg-[#5C0F17] px-6 py-2 font-bold text-white shadow-xs hover:bg-[#4A0D15] disabled:opacity-50"
                >
                  {savingAddress ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
