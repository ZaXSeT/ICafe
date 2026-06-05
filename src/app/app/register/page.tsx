"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthContext";
import { useRouter } from "next/navigation";
import { Coffee, Mail, Lock, User, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function MobileAppRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await signUp(email, password, name);
      toast.success("Account created! Please check your email to verify.");
      router.push("/app/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to create account.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/latte_art.png"
          alt="ICafe latte art"
          fill
          sizes="100vw"
          className="object-cover opacity-15"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/85 to-transparent" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-6 pb-10 pt-12">
        {/* Back button */}
        <Link href="/app/login" className="text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1.5 text-sm font-medium mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="flex-1 flex flex-col justify-center">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-5 shadow-xl shadow-primary/20">
            <Coffee className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-white mb-1">Create Account</h1>
          <p className="text-stone-400 mb-6 text-sm">Join ICafe and start ordering.</p>

          <form onSubmit={handleRegister} className="w-full space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 ml-1">Full Name</label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-800/80 border border-stone-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all backdrop-blur-sm"
                  placeholder="Your name"
                />
              </div>
            </div>

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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-800/80 border border-stone-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all backdrop-blur-sm"
                  placeholder="Min. 6 characters"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-stone-800/80 border text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all backdrop-blur-sm ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-500"
                      : "border-stone-700"
                  }`}
                  placeholder="Re-enter your password"
                />
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-red-400 text-xs ml-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-stone-400 text-sm text-center">
            Already have an account?{" "}
            <Link href="/app/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
