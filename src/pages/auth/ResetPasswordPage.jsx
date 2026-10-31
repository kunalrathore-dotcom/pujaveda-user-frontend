import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";
import { api } from "../../services/api";
import PujavedaLogo from "../../components/common/PujavedaLogo";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const resetToken = location.state?.resetToken || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !resetToken) {
      setError("Session expired or missing reset token. Please restart password reset.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        resetToken,
        password,
        confirmPassword,
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF5ED] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[#EEDBC5] bg-[#FFFDF9] p-6 shadow-xl shadow-[#5C0F17]/5 sm:p-9">
        <div className="flex justify-center">
          <PujavedaLogo size="md" subtitle="Sacred Credentials" />
        </div>

        {isSuccess ? (
          <div className="mt-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={36} />
            </div>
            <h1 className="mt-4 font-serif text-2xl font-bold text-[#5C0F17]">Password Reset Complete!</h1>
            <p className="mt-2 text-sm text-[#2D1C13]/70">
              Your password has been securely updated. Redirecting to sign in...
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5C0F17] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4A0D15] shadow-md shadow-[#5C0F17]/20"
              >
                Sign In Now <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-8 text-center">
              <h1 className="font-serif text-2xl font-bold text-[#5C0F17]">Create New Password</h1>
              <p className="mt-2 text-sm text-[#2D1C13]/70">
                Choose a strong new password for{" "}
                <span className="font-semibold text-[#5C0F17]">{email || "your account"}</span>
              </p>
            </div>

            {error && (
              <div className="mt-6 rounded-xl bg-red-50 p-3.5 text-xs text-red-600 font-medium border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <div>
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-[#5C0F17]">
                  New Password
                </label>
                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    maxLength={128}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-xl border border-[#EEDBC5] bg-white px-4 py-3 pl-11 pr-11 text-sm text-[#2D1C13] outline-none transition focus:border-[#5C0F17] focus:ring-2 focus:ring-[#DA9B26]/20"
                    required
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#DA9B26]" size={18} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-[#5C0F17]">
                  Confirm New Password
                </label>
                <div className="relative mt-2">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    maxLength={128}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full rounded-xl border border-[#EEDBC5] bg-white px-4 py-3 pl-11 pr-11 text-sm text-[#2D1C13] outline-none transition focus:border-[#5C0F17] focus:ring-2 focus:ring-[#DA9B26]/20"
                    required
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#DA9B26]" size={18} />
                </div>
              </div>

              <div className="rounded-xl bg-[#FAF5ED] border border-[#EEDBC5] p-3 text-xs text-[#2D1C13]/70 space-y-1">
                <p className={password.length >= 8 ? "text-emerald-700 font-medium" : ""}>
                  ✓ Minimum 8 characters
                </p>
                <p className={password && password === confirmPassword ? "text-emerald-700 font-medium" : ""}>
                  ✓ Passwords match
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !password || password !== confirmPassword}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5C0F17] py-3.5 text-sm font-bold text-white transition hover:bg-[#4A0D15] disabled:cursor-not-allowed disabled:opacity-60 shadow-md shadow-[#5C0F17]/20"
              >
                {loading ? "Updating Password..." : "Reset Password"}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-xs font-semibold text-[#2D1C13]/70 hover:text-[#5C0F17]"
              >
                Cancel and return to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
