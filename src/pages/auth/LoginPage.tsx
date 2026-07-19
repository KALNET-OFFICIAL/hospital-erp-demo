import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  BedDouble,
  Calendar,
  Receipt,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/stores";
import type { UserRole } from "@/types";

const roles: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Administrator" },
  { value: "doctor", label: "Doctor" },
  { value: "reception", label: "Reception" },
  { value: "pharmacist", label: "Pharmacist" },
];

const featurePills = [
  { icon: BedDouble, title: "OPD & IPD Flow" },
  { icon: Calendar, title: "Scheduling & Queue" },
  { icon: Receipt, title: "Billing & Pharmacy" },
  { icon: Users, title: "Patient CRM & EMR" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [email, setEmail] = useState("admin@hospital.com");
  const [password, setPassword] = useState("password");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      return;
    }
    login(selectedRole);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
        <section className="relative overflow-hidden bg-[linear-gradient(140deg,#0a0a0a_0%,#1d1d1f_45%,#2e2e2e_100%)] p-10 text-white lg:p-14">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0%, transparent 35%)" }} />
          <div className="relative z-10 flex h-full max-w-xl flex-col justify-center">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10">
                <span className="text-lg font-bold">K</span>
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">KALNET</p>
                <p className="text-xs text-white/60">Hospital OS</p>
              </div>
            </div>

            <h1 className="text-4xl font-bold leading-tight">The Digital Operating System for Modern Hospitals</h1>
            <p className="mt-5 text-lg text-white/80">
              Manage patients, consultations, billing, referrals, and handovers from one unified dashboard.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {featurePills.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
                      <Icon size={15} />
                    </div>
                    <p className="text-sm font-medium">{item.title}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 flex gap-12 text-white">
              <div>
                <p className="text-4xl font-bold">10+</p>
                <p className="text-sm text-white/60">Core Modules</p>
              </div>
              <div>
                <p className="text-4xl font-bold">5+</p>
                <p className="text-sm text-white/60">Integrations</p>
              </div>
              <div>
                <p className="text-4xl font-bold">99.9%</p>
                <p className="text-sm text-white/60">Uptime</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-8 lg:p-14">
          <div className="w-full max-w-[420px]">
            <h2 className="text-5xl font-bold text-ink">Welcome back</h2>
            <p className="mt-3 text-lg text-ink-muted">Enter your credentials to access your account</p>

            <div className="mt-10 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-muted">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-line bg-paper text-ink pl-11 pr-4 text-[15px] outline-none transition focus:border-primary-500"
                    type="email"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-muted">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-line bg-paper text-ink pl-11 pr-12 text-[15px] outline-none transition focus:border-primary-500"
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-muted">Login As</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="h-12 w-full rounded-2xl border border-line bg-paper text-ink px-4 text-[15px] outline-none transition focus:border-primary-500"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-ink-muted">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-line accent-primary-600"
                  />
                  Remember me
                </label>
                <button className="text-primary-600 hover:underline">Forgot password?</button>
              </div>

              <button
                onClick={handleLogin}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 text-lg font-semibold text-on-ink transition hover:bg-primary-700"
              >
                Sign in
                <LogIn size={18} />
              </button>
            </div>

            <p className="mt-10 text-center text-sm text-ink-muted">© 2026 KALNET. All rights reserved.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
