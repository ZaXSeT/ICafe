"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error("Invalid credentials", {
          description: "Please check your email and password.",
        });
      } else {
        toast.success("Welcome back!");
        router.push("/");
        router.refresh();
      }
    } catch (_error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
              email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                ? "border-destructive focus:border-destructive focus:ring-destructive/20 bg-destructive/5"
                : "border-border/40 bg-foreground/[0.03] focus:border-primary focus:ring-primary/20"
            }`}
          />
        </div>
        {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
          <p className="text-xs text-destructive mt-1">Please enter a valid email address</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-semibold text-foreground">
            Password
          </label>
          <a href="#" className="text-xs text-primary font-medium hover:underline">
            Forgot password?
          </a>
        </div>
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
              password && password.length < 8
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
        {password && password.length < 8 && (
          <p className="text-xs text-destructive mt-1">Password must be at least 8 characters</p>
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
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 py-1">
        <div className="flex-1 h-px bg-border/40" />
        <span className="text-xs text-muted-foreground font-medium">or continue as</span>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      {/* Guest */}
      <a
        href="/"
        className="w-full h-11 rounded-xl border border-border/40 text-foreground/70 font-semibold text-sm flex items-center justify-center hover:border-foreground/30 hover:text-foreground transition-all"
      >
        Browse as Guest
      </a>
    </form>
  );
}
