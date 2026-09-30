import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { authService } from "../../services/authService";
import type { Role } from "../../types/auth";
import medicareBanner from "../../assets/medicare.jpg";

const roles: { value: Role; label: string }[] = [
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "receptionist", label: "Receptionist" },
  { value: "admin", label: "Administrator" },
];

const input =
  "mt-1.5 w-full rounded-lg border border-[#cfdad7] bg-white px-3.5 py-2.5 text-sm text-[#12302d] " +
  "outline-none transition placeholder:text-[#9aabA8] focus:border-[#0f766e] focus:ring-2 focus:ring-[#0f766e]/25";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "receptionist" as Role });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await authService.register(form);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6"
      style={{
        fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
        backgroundImage: `url(${medicareBanner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark teal overlay so the card stays readable on any photo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-[#062a2a]/85 via-[#0b3b3a]/75 to-[#0f766e]/60"
      />

      {/* Card: stacked on phones, two columns from lg (1024px) */}
      <div className="relative z-10 grid w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_25px_60px_-10px_rgba(0,0,0,0.55)] lg:max-w-4xl lg:grid-cols-[1fr_1.05fr]">
        {/* Brand panel (hidden on small screens) */}
        <aside className="relative hidden lg:block">
          <img
            src={medicareBanner}
            alt="MediCare Intensive Care Clinics"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#062a2a]/90 via-[#062a2a]/30 to-transparent" />
          <div className="relative flex h-full min-h-[600px] flex-col justify-end p-8 text-white">
            <h2 className="text-2xl font-semibold leading-snug">
              Join the team
              <br />
              caring for patients.
            </h2>
            <p className="mt-2 max-w-xs text-sm text-white/80">
              Create your staff account to manage records, appointments and ward updates.
            </p>
          </div>
        </aside>

        {/* Form panel */}
        <section className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f766e] text-white shadow-md">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                <path d="M10 3h4a1 1 0 0 1 1 1v5h5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-5v5a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-5H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h5V4a1 1 0 0 1 1-1Z" />
              </svg>
            </span>
            <span className="text-lg font-semibold text-[#12302d]">MediCare</span>
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-[#12302d]">Create a staff account</h1>
          <p className="mt-1 text-sm text-[#5b6b69]">An administrator can change your role later.</p>

          <form onSubmit={handleSubmit} className="mt-6">
            {error && (
              <p
                role="alert"
                className="mb-4 rounded-r border-l-4 border-[#b4432f] bg-[#fbeeea] px-3 py-2 text-sm text-[#8a2f1f]"
              >
                {error}
              </p>
            )}

            <label className="block text-sm font-medium text-[#12302d]" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              required
              autoComplete="name"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={input}
            />

            <label className="mt-4 block text-sm font-medium text-[#12302d]" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="name@hospital.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={input}
            />

            <label className="mt-4 block text-sm font-medium text-[#12302d]" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className={input}
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

            <label className="mt-4 block text-sm font-medium text-[#12302d]" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className={`${input} pr-16`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 mt-[3px] -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-[#0f766e] hover:bg-[#e6f3f1] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/40"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <Button type="submit" disabled={loading} className="mt-6 w-full disabled:opacity-60">
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#5b6b69]">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-[#0f766e] underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}