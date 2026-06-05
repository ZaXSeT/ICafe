"use client";

import { useState, useEffect } from "react";
import { loginStaff } from "@/app/actions/staff.actions";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Suspense } from "react";

function LoginForm() {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerUrl, setCustomerUrl] = useState("/");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callback = searchParams.get("callback");

  useEffect(() => {
    setCustomerUrl(`${window.location.protocol}//${window.location.host.replace("admin.", "").replace("pos.", "")}`);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field (just in case we add one later)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key >= "0" && e.key <= "9") {
        setPin(prev => prev.length < 6 ? prev + e.key : prev);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        setPin(prev => prev.slice(0, -1));
      } else if (e.key === "Enter") {
        if (pin.length >= 6 && !loading) {
          handleSubmit();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin, loading]); // Need pin and loading in deps for Enter key check

  const handleKeyPress = (digit: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (pin.length < 6) {
      toast.error("PIN must be at least 6 digits");
      return;
    }

    setLoading(true);
    try {
      const res = await loginStaff(pin);
      if (res.success) {
        sessionStorage.setItem("tab_session_active", "true");
        toast.success("Login successful");
        
        // Detect context: if we're at /pos/login, go to /pos
        const isPosLogin = window.location.pathname.startsWith("/pos");
        if (isPosLogin) {
          window.location.href = "/pos";
        } else if (callback === "pos") {
          const baseHost = window.location.host.replace("admin.", "");
          window.location.href = `${window.location.protocol}//pos.${baseHost}/`;
        } else {
          window.location.href = "/";
        }
      } else {
        toast.error(res.error || "Login failed");
        setPin("");
      }
    } catch (e) {
      toast.error("An error occurred. Please try again.");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm flex flex-col items-center">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center text-stone-600 mb-6">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-stone-800 mb-2">Staff Login</h1>
        <p className="text-stone-500 text-sm mb-8 text-center">
          Enter your 6-digit PIN to access the management dashboard or POS.
        </p>

        {/* PIN Display */}
        <div className="flex gap-3 mb-8">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-colors ${
                i < pin.length ? "bg-amber-700" : "bg-stone-200"
              }`}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-[240px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit.toString())}
              className="h-16 rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200/50 text-2xl font-semibold text-stone-800 transition-colors active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleBackspace}
            className="h-16 rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200/50 text-xl font-semibold text-stone-500 transition-colors active:scale-95 flex items-center justify-center"
          >
            DEL
          </button>
          <button
            onClick={() => handleKeyPress("0")}
            className="h-16 rounded-full bg-stone-50 hover:bg-stone-100 border border-stone-200/50 text-2xl font-semibold text-stone-800 transition-colors active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || pin.length < 6}
            className="h-16 rounded-full bg-amber-700 hover:bg-amber-800 text-white font-semibold transition-colors active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "OK"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-100 flex items-center justify-center p-4"><Loader2 className="w-8 h-8 animate-spin text-stone-500" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
