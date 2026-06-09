"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallAppButton() {
  return (
    <a
      href="https://github.com/ZaXSeT/ICafe/releases/latest/download/ICafe_Mobile.apk"
      download="ICafe_Mobile.apk"
      className="flex items-center gap-1.5 text-sm font-semibold text-primary border border-primary/30 bg-primary/5 hover:bg-primary hover:text-primary-foreground px-3.5 py-1.5 rounded-full transition-all duration-200 hover:-translate-y-0.5"
      title="Download ICafe Mobile App"
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Get App</span>
    </a>
  );
}

/**
 * Mobile install banner — shows at the bottom of the mobile menu
 */
export function MobileInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowBanner(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !showBanner || dismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Smartphone className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">Install ICafe</p>
        <p className="text-xs text-muted-foreground">Add to your home screen for faster access</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-full hover:bg-foreground/5 text-muted-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          onClick={handleInstall}
          className="bg-primary text-primary-foreground font-bold text-xs px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
        >
          Install
        </button>
      </div>
    </div>
  );
}
