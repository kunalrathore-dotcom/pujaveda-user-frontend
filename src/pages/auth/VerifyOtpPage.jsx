import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, ArrowRight, RotateCw } from "lucide-react";
import { api } from "../../services/api";
import PujavedaLogo from "../../components/common/PujavedaLogo";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const trimmedOtp = otp.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setError("Please enter the 6-digit numeric verification code.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/verify-reset-otp", {
        email: email.trim().toLowerCase(),
        otp: trimmedOtp,
      });

      const resetToken = response.resetToken || response.data?.resetToken;
      if (!resetToken) {
        throw new Error("Reset token not received from server.");
      }

      setSuccessMessage("Code verified successfully! Redirecting...");
      setTimeout(() => {
        navigate("/reset-password", {
          state: {
            email: email.trim().toLowerCase(),
            resetToken,
          },
        });
      }, 1000);
    } catch (err) {
      setError(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError("");
    setSuccessMessage("");
    setResending(true);

    try {
      await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      setSuccessMessage("A fresh verification code has been dispatched.");
      setCooldown(60);
    } catch (err) {
      if (err.message && err.message.includes("Unable to deliver OTP email")) {
        setError(err.message + " Check terminal for [DEV NOTICE] OTP if testing locally.");
        setCooldown(60);
      } else {
        setError(err.message || "Failed to resend code.");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF5ED] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[#EEDBC5] bg-[#FFFDF9] p-6 shadow-xl shadow-[#5C0F17]/5 sm:p-9">
        <div className="flex justify-center">
          <PujavedaLogo size="md" subtitle="Sacred Verification" />
        </div>

        <div className="mt-8 text-center">
          <h1 className="font-serif text-2xl font-bold text-[#5C0F17]">Verify Code</h1>
          <p className="mt-2 text-sm text-[#2D1C13]/70">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-[#5C0F17]">{email || "your email"}</span>
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-3.5 text-xs text-red-600 font-medium border border-red-200">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mt-6 rounded-xl bg-emerald-50 p-3.5 text-xs text-emerald-700 font-medium border border-emerald-200">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleVerify} noValidate className="mt-6 space-y-4">
          {!initialEmail && (
            <div>
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-[#5C0F17]">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-2 w-full rounded-xl border border-[#EEDBC5] bg-white px-4 py-3 text-sm text-[#2D1C13] outline-none transition focus:border-[#5C0F17] focus:ring-2 focus:ring-[#DA9B26]/20"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="otp" className="text-xs font-bold uppercase tracking-wider text-[#5C0F17]">
              6-Digit Verification Code
            </label>
            <div className="relative mt-2">
              <input
                id="otp"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full tracking-widest text-center text-xl font-bold font-mono rounded-xl border border-[#EEDBC5] bg-white py-3 outline-none transition focus:border-[#5C0F17] focus:ring-2 focus:ring-[#DA9B26]/20 text-[#5C0F17]"
                required
              />
              <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#DA9B26]" size={18} />
            </div>
            <p className="mt-1.5 text-xs text-[#2D1C13]/60">Code expires in 10 minutes (maximum 5 attempts)</p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5C0F17] py-3.5 text-sm font-bold text-white transition hover:bg-[#4A0D15] disabled:cursor-not-allowed disabled:opacity-60 shadow-md shadow-[#5C0F17]/20"
          >
            {loading ? "Verifying..." : "Verify Code"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between border-t border-[#EEDBC5] pt-5 text-xs">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-1 font-semibold text-[#2D1C13]/70 hover:text-[#5C0F17]"
          >
            <ArrowLeft size={14} /> Change Email
          </Link>

          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="inline-flex items-center gap-1 font-bold text-[#5C0F17] hover:underline disabled:text-neutral-400 disabled:no-underline"
          >
            <RotateCw size={12} className={resending ? "animate-spin" : ""} />
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
          </button>
        </div>
      </div>
    </main>
  );
}
