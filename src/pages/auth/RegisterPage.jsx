import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import PujavedaLogo from "../../components/common/PujavedaLogo";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setServerError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Full name is required.";
    } else if (form.name.trim().length < 2) {
      nextErrors.name = "Name must contain at least 2 characters.";
    } else if (form.name.trim().length > 50) {
      nextErrors.name = "Name cannot exceed 50 characters.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(form.password)) {
      nextErrors.password = "Include at least one uppercase letter.";
    } else if (!/[a-z]/.test(form.password)) {
      nextErrors.password = "Include at least one lowercase letter.";
    } else if (!/[0-9]/.test(form.password)) {
      nextErrors.password = "Include at least one number.";
    } else if (!/[^A-Za-z0-9]/.test(form.password)) {
      nextErrors.password = "Include at least one special character.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");

    if (!validate()) return;

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      navigate("/", { replace: true });
    } catch (error) {
      setServerError(error.message || "Unable to create account.");
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

        <div className="mt-7 text-center">
          <h1 className="text-2xl font-black font-devotional text-[#4A0D15]">Create Devotee Account</h1>
          <p className="mt-2 text-xs sm:text-sm text-[#756255]">
            Join Pujaveda and discover authentic puja essentials for your family
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
          <div>
            <label htmlFor="name" className="text-xs sm:text-sm font-bold text-[#3D2619]">
              Full Name
            </label>
            <input
              id="name"
              maxLength={50}
              autoComplete="name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className={inputClass}
              placeholder="Your full name"
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="text-xs sm:text-sm font-bold text-[#3D2619]">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              maxLength={254}
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className={inputClass}
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="text-xs sm:text-sm font-bold text-[#3D2619]">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                maxLength={72}
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                className={`${inputClass} pr-12`}
                placeholder="Min. 8 characters (A-Z, a-z, 0-9, symbol)"
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

          <div>
            <label htmlFor="confirmPassword" className="text-xs sm:text-sm font-bold text-[#3D2619]">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                maxLength={72}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(event) =>
                  updateField("confirmPassword", event.target.value)
                }
                className={`${inputClass} pr-12`}
                placeholder="Re-enter your password"
                aria-invalid={Boolean(errors.confirmPassword)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#756255]"
              >
                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.confirmPassword}
              </p>
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
            {loading ? "Creating account..." : "Join Pujaveda"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs sm:text-sm text-[#756255]">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-[#E85D04] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
