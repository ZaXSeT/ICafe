"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, User, Mail, Lock, Eye, EyeOff } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (!name || name.length < 3 || !/^[a-zA-Z0-9_ ]+$/.test(name)) return;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (!password || password.length < 8) return;

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed");
      } else {
        toast.success("Account created! Please verify your email.");
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Full Name */}
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-semibold text-foreground">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => {
              const val = e.target.value;
              if (val.length <= 30) {
                setName(val);
              }
            }}
            required
            minLength={3}
            maxLength={30}
            pattern="^[a-zA-Z0-9_ ]+$"
            className={`w-full pl-10 pr-4 py-3 rounded-xl border text-foreground placeholder:text-muted-foreground/60 text-sm outline-none transition-all focus:ring-2 ${
              (isSubmitted || name) && (!name || name.length < 3 || !/^[a-zA-Z0-9_ ]+$/.test(name))
                ? "border-destructive focus:border-destructive focus:ring-destructive/20 bg-destructive/5"
                : "border-border/40 bg-foreground/[0.03] focus:border-primary focus:ring-primary/20"
            }`}
          />
        </div>
        {(isSubmitted || name) && (!name || name.length < 3) && (
          <p className="text-xs text-destructive mt-1">Username must be at least 3 characters</p>
        )}
        {(isSubmitted || name) && name.length >= 3 && !/^[a-zA-Z0-9_ ]+$/.test(name) && (
          <p className="text-xs text-destructive mt-1">Only letters, numbers, spaces, and underscores allowed</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-foreground">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={50}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border text-foreground placeholder:text-muted-foreground/60 text-sm outline-none transition-all focus:ring-2 ${
              (isSubmitted || email) && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                ? "border-destructive focus:border-destructive focus:ring-destructive/20 bg-destructive/5"
                : "border-border/40 bg-foreground/[0.03] focus:border-primary focus:ring-primary/20"
            }`}
          />
        </div>
        {(isSubmitted || email) && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) && (
          <p className="text-xs text-destructive mt-1">Please enter a valid email address</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-foreground">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            maxLength={64}
            className={`w-full pl-10 pr-12 py-3 rounded-xl border text-foreground placeholder:text-muted-foreground/60 text-sm outline-none transition-all focus:ring-2 ${
              (isSubmitted || password) && (!password || password.length < 8)
                ? "border-destructive focus:border-destructive focus:ring-destructive/20 bg-destructive/5"
                : "border-border/40 bg-foreground/[0.03] focus:border-primary focus:ring-primary/20"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {(isSubmitted || password) && (!password || password.length < 8) && (
          <p className="text-xs text-destructive mt-1">Password must be at least 8 characters</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label htmlFor="confirm" className="text-sm font-semibold text-foreground">
          Re-enter Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="confirm"
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            maxLength={64}
            className={`w-full pl-10 pr-12 py-3 rounded-xl border text-foreground placeholder:text-muted-foreground/60 text-sm outline-none transition-all focus:ring-2 ${
              confirm && password !== confirm
                ? "border-destructive focus:border-destructive focus:ring-destructive/20 bg-destructive/5"
                : "border-border/40 bg-foreground/[0.03] focus:border-primary focus:ring-primary/20"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {confirm && password !== confirm && (
          <p className="text-xs text-destructive mt-1">Passwords do not match</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 mt-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-border/40" />
        <span className="text-xs text-muted-foreground font-medium">or</span>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      {/* Browse as Guest */}
      <a
        href="/"
        className="w-full h-11 rounded-xl border border-border/40 text-foreground/70 font-semibold text-sm flex items-center justify-center hover:border-foreground/30 hover:text-foreground transition-all"
      >
        Browse as Guest
      </a>
    </form>
  );
}
