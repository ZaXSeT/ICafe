"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthContext";
import { useRouter } from "next/navigation";
import { Coffee, Mail, Lock, Loader2, ArrowRight, MailCheck, RefreshCw, ArrowLeft as ArrowBack } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function MobileAppLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const { signIn, signInWithGoogle, resendVerification } = useAuth();
  const router = useRouter();

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      router.push("/app");
    } catch (err: any) {
      if (err.code === "auth/email-not-verified") {
        setNeedsVerification(true);
        setResendCooldown(60);
      } else {
        toast.error(err.message || "Failed to sign in. Please check your credentials.");
      }
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      await resendVerification(email, password);
      toast.success("Verification email sent! Check your inbox.");
      setResendCooldown(60);
    } catch (err: any) {
      toast.error("Failed to resend verification email.");
    }
    setIsResending(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      router.push("/app");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        toast.error("Failed to sign in with Google.");
      }
      setIsLoading(false);
    }
  };

  // ─── Verification Needed Screen ───
  if (needsVerification) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/images/cafe_hero.png" alt="ICafe" fill sizes="100vw" className="object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/90 to-transparent" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-amber-500/5">
            <MailCheck className="w-10 h-10 text-amber-400" />
          </div>

          <h1 className="font-heading font-bold text-2xl text-white mb-3">Verify Your Email</h1>
          <p className="text-stone-400 text-sm mb-2 leading-relaxed">
            We've sent a verification link to
          </p>
          <p className="text-primary font-bold text-sm mb-6">{email}</p>
          <p className="text-stone-500 text-xs mb-8 leading-relaxed max-w-[280px]">
            Please check your inbox (and spam folder) and click the verification link. Then come back here and sign in.
          </p>

          {/* Resend Button */}
          <button
            onClick={handleResendVerification}
            disabled={resendCooldown > 0 || isResending}
            className="flex items-center gap-2 bg-white/10 border border-white/10 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isResending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend Verification Email"}
          </button>

          {/* Back to Login */}
          <button
            onClick={() => setNeedsVerification(false)}
            className="text-stone-400 hover:text-stone-200 text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            <ArrowBack className="w-3.5 h-3.5" />
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ─── Normal Login Screen ───
  return (
    <div className="min-h-screen bg-stone-900 flex flex-col relative overflow-hidden">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/cafe_hero.png"
          alt="ICafe interior"
          fill
          sizes="100vw"
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/80 to-transparent" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-end px-6 pb-12 pt-20">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
          <Coffee className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="font-heading font-bold text-3xl text-white mb-2 text-center">
          Welcome to ICafe
        </h1>
        <p className="text-stone-400 mb-8 text-center text-sm">
          Please log in to continue your mobile experience.
        </p>

        <form onSubmit={handleEmailLogin} className="w-full max-w-sm space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-stone-800/80 border border-stone-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all backdrop-blur-sm"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-800/80 border border-stone-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all backdrop-blur-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="w-full max-w-sm mt-6 flex items-center gap-4">
          <div className="h-px bg-stone-800 flex-1" />
          <span className="text-xs text-stone-500 font-medium">OR CONTINUE WITH</span>
          <div className="h-px bg-stone-800 flex-1" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full max-w-sm mt-6 bg-white hover:bg-stone-100 text-stone-900 font-bold py-3.5 rounded-xl transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </button>
        
        <p className="mt-8 text-stone-400 text-sm">
          Don't have an account?{" "}
          <Link href="/app/register" className="text-primary font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
