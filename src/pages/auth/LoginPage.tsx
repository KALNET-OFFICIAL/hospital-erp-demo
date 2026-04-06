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
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
        <section className="relative overflow-hidden bg-[linear-gradient(140deg,#172746_0%,#1f3158_40%,#334b72_100%)] p-10 text-white lg:p-14">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #60a5fa 0%, transparent 35%)" }} />
          <div className="relative z-10 flex h-full max-w-xl flex-col justify-center">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/90">
                <span className="text-lg font-bold">K</span>
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">KALNET</p>
                <p className="text-xs text-slate-300">Hospital OS</p>
              </div>
            </div>

            <h1 className="text-4xl font-bold leading-tight">The Digital Operating System for Modern Hospitals</h1>
            <p className="mt-5 text-lg text-slate-200">
              Manage patients, consultations, billing, referrals, and handovers from one unified dashboard.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {featurePills.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
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
                <p className="text-sm text-slate-300">Core Modules</p>
              </div>
              <div>
                <p className="text-4xl font-bold">5+</p>
                <p className="text-sm text-slate-300">Integrations</p>
              </div>
              <div>
                <p className="text-4xl font-bold">99.9%</p>
                <p className="text-sm text-slate-300">Uptime</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-8 lg:p-14">
          <div className="w-full max-w-[420px]">
            <h2 className="text-5xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-3 text-lg text-slate-500">Enter your credentials to access your account</p>

            <div className="mt-10 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-4 text-[15px] outline-none transition focus:border-primary-500"
                    type="email"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-300 bg-white pl-11 pr-12 text-[15px] outline-none transition focus:border-primary-500"
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Login As</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-[15px] outline-none transition focus:border-primary-500"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Remember me
                </label>
                <button className="text-primary-600 hover:underline">Forgot password?</button>
              </div>

              <button
                onClick={handleLogin}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 text-lg font-semibold text-white transition hover:bg-sky-600"
              >
                Sign in
                <LogIn size={18} />
              </button>
            </div>

            <p className="mt-10 text-center text-sm text-slate-500">© 2026 KALNET. All rights reserved.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
