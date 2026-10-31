import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ExternalLink } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import PujavedaLogo from "../../components/common/PujavedaLogo";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");

    if (!validate()) return;

    try {
      await login({ email: email.trim(), password });

      const redirectPath = location.state?.from?.pathname || "/";
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setServerError(error.message || "Unable to sign in.");
    }
  };

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#EEDBC5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#DA9B26] focus:ring-2 focus:ring-[#DA9B26]/10";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF6F0] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-[#EEDBC5] bg-[#FFFDF9] p-6 shadow-xl shadow-[#5C0F17]/5 sm:p-9">
        <div className="flex justify-center">
          <Link to="/">
            <PujavedaLogo size="lg" />
          </Link>
        </div>

        <div className="mt-8 text-center">
          <h1 className="text-2xl font-black font-devotional text-[#4A0D15]">Devotee Sign In</h1>
          <p className="mt-2 text-xs sm:text-sm text-[#756255]">
            Sign in to track orders, save sacred items and checkout quickly
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="text-xs sm:text-sm font-bold text-[#3D2619]">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              maxLength={254}
              autoComplete="username"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
              className={inputClass}
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-xs sm:text-sm font-bold text-[#3D2619]">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-[#E85D04] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                maxLength={72}
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((prev) => ({ ...prev, password: "" }));
                }}
                className={`${inputClass} pr-12`}
                placeholder="Enter your password"
                aria-invalid={Boolean(errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#756255]"
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.password}</p>
            )}
          </div>

          {serverError && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs sm:text-sm font-medium text-red-600 border border-red-200">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#5C0F17] py-3.5 text-sm font-bold text-white transition hover:bg-[#43080E] disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
          >
            {loading ? "Signing in..." : "Sign In to Pujaveda"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs sm:text-sm text-[#756255]">
          New to Pujaveda?{" "}
          <Link to="/register" className="font-bold text-[#E85D04] hover:underline">
            Create account
          </Link>
        </p>

        <div className="mt-8 border-t border-[#EEDBC5]/70 pt-6 text-center">
          <p className="text-xs text-[#756255]">Store Administrator?</p>
          <a
            href={import.meta.env.VITE_ADMIN_URL || "http://localhost:5174/login"}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#5C0F17] hover:text-[#E85D04] transition"
          >
            Go to PUJAVEDA Admin Console <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </main>
  );
}
