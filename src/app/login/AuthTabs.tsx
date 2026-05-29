"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Eye, EyeOff, User } from "lucide-react";

export function AuthTabs() {
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const router = useRouter();

  // Sign In state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Register state
  const [regPassword, setRegPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    try {
      const res = await signIn("credentials", { redirect: false, email, password });
      if (res?.error) {
        toast.error("Invalid credentials", { description: "Please check your email and password." });
      } else {
        toast.success("Welcome back!");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== confirm) { toast.error("Passwords do not match"); return; }
    setIsRegistering(true);
    setTimeout(() => {
      toast.success("Account created! Please sign in.");
      setTab("signin");
      setIsRegistering(false);
    }, 1500);
  };

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-border/40 bg-foreground/[0.03] text-foreground placeholder:text-muted-foreground/50 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";
  const inputClassRight = "w-full pl-10 pr-12 py-3 rounded-xl border border-border/40 bg-foreground/[0.03] text-foreground placeholder:text-muted-foreground/50 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";
  const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none";
  const eyeBtn = "absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors";

  return (
    <div>
      {/* Tab Switcher */}
      <div className="flex bg-secondary rounded-xl p-1 mb-8">
        <button
          onClick={() => setTab("signin")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            tab === "signin"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setTab("register")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            tab === "register"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Sign In Form */}
      {tab === "signin" && (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Welcome back</h1>
            <p className="text-muted-foreground text-sm">Sign in to continue to your account</p>
          </div>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">Email</label>
              <div className="relative">
                <Mail className={iconClass} />
                <input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-foreground">Password</label>
                <a href="#" className="text-xs text-primary font-medium hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className={iconClass} />
                <input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className={inputClassRight} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={eyeBtn}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isSigningIn} className="w-full h-12 mt-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
              {isSigningIn ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in...</> : "Sign In"}
            </button>
            <div className="flex items-center gap-3"><div className="flex-1 h-px bg-border/40" /><span className="text-xs text-muted-foreground font-medium">or</span><div className="flex-1 h-px bg-border/40" /></div>
            <a href="/" className="w-full h-11 rounded-xl border border-border/40 text-foreground/70 font-semibold text-sm flex items-center justify-center hover:border-foreground/30 hover:text-foreground transition-all">Browse as Guest</a>
          </form>
        </div>
      )}

      {/* Register Form */}
      {tab === "register" && (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-heading font-bold text-foreground mb-1">Create an account</h1>
            <p className="text-muted-foreground text-sm">Join us and start earning rewards today</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-foreground">Full Name</label>
              <div className="relative">
                <User className={iconClass} />
                <input id="name" type="text" placeholder="John Doe" required className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-sm font-semibold text-foreground">Email</label>
              <div className="relative">
                <Mail className={iconClass} />
                <input id="reg-email" type="email" placeholder="you@example.com" required className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="text-sm font-semibold text-foreground">Password</label>
              <div className="relative">
                <Lock className={iconClass} />
                <input id="reg-password" type={showRegPassword ? "text" : "password"} placeholder="••••••••" value={regPassword} onChange={e => setRegPassword(e.target.value)} required className={inputClassRight} />
                <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className={eyeBtn}>
                  {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirm" className="text-sm font-semibold text-foreground">Re-enter Password</label>
              <div className="relative">
                <Lock className={iconClass} />
                <input id="confirm" type={showConfirm ? "text" : "password"} placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} required
                  className={`${inputClassRight} ${confirm && regPassword !== confirm ? "border-destructive focus:ring-destructive/20" : ""}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className={eyeBtn}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirm && regPassword !== confirm && <p className="text-xs text-destructive">Passwords do not match</p>}
            </div>
            <button type="submit" disabled={isRegistering} className="w-full h-12 mt-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
              {isRegistering ? <><Loader2 className="h-4 w-4 animate-spin" />Creating account...</> : "Create Account"}
            </button>
            <div className="flex items-center gap-3"><div className="flex-1 h-px bg-border/40" /><span className="text-xs text-muted-foreground font-medium">or</span><div className="flex-1 h-px bg-border/40" /></div>
            <a href="/" className="w-full h-11 rounded-xl border border-border/40 text-foreground/70 font-semibold text-sm flex items-center justify-center hover:border-foreground/30 hover:text-foreground transition-all">Browse as Guest</a>
          </form>
        </div>
      )}
    </div>
  );
}
