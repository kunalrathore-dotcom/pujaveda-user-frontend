import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { authService } from "../../services/authService";
import PujavedaLogo from "../../components/common/PujavedaLogo";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await authService.forgotPassword(trimmedEmail);
      setSuccessMessage(res.message || "Verification code sent to your email.");
      setTimeout(() => {
        navigate(`/verify-otp?email=${encodeURIComponent(trimmedEmail)}`);
      }, 1500);
    } catch (err) {
      if (err.message && err.message.includes("Unable to deliver OTP email")) {
        setError(err.message + " Check terminal for [DEV NOTICE] OTP if testing locally.");
        setTimeout(() => {
          navigate(`/verify-otp?email=${encodeURIComponent(trimmedEmail)}`);
        }, 2000);
      } else {
        setError(err.message || "Unable to request password reset code.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF6F0] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[#EEDBC5] bg-[#FFFDF9] p-6 shadow-xl shadow-[#5C0F17]/5 sm:p-9">
        <div className="flex justify-center">
          <Link to="/">
            <PujavedaLogo size="lg" />
          </Link>
        </div>

        <div className="mt-8 text-center">
          <h1 className="text-2xl font-black font-devotional text-[#4A0D15]">Recover Devotee Account</h1>
          <p className="mt-2 text-xs sm:text-sm text-[#756255]">
            Enter your account email to receive a 6-digit verification code
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-3.5 text-xs text-red-600 font-medium border border-red-200">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-6 rounded-xl bg-emerald-50 p-3.5 text-xs text-emerald-800 font-medium border border-emerald-200">
            {successMessage} Redirecting to OTP verification...
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-xs sm:text-sm font-bold text-[#3D2619]">
              Email Address
            </label>
            <div className="relative mt-2">
              <input
                id="email"
                type="email"
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-[#EEDBC5] bg-white px-4 py-3 pl-11 text-sm outline-none transition focus:border-[#DA9B26] focus:ring-2 focus:ring-[#DA9B26]/10"
                required
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756255]" size={18} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5C0F17] py-3.5 text-sm font-bold text-white transition hover:bg-[#43080E] disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
          >
            {loading ? "Sending Code..." : "Send Verification Code"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#756255] hover:text-[#5C0F17]"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
