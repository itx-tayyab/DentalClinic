"use client";

import React, { useEffect, useState } from "react";
import { DownloadIcon } from "./ui/icons";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return sessionStorage.getItem("brightsmile_pwa_dismissed") === "true";
      } catch {
        return false;
      }
    }
    return false;
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("brightsmile_pwa_dismissed", "true");
    } catch {
      // ignore
    }
  };

  return (
    <aside
      aria-label="Install app notice"
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md rounded-2xl border border-teal-200 bg-teal-900/95 p-4 text-white shadow-xl backdrop-blur-md"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-800 text-teal-100">
            <DownloadIcon size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold leading-tight">
              Add to Home Screen
            </h4>
            <p className="mt-0.5 text-xs text-teal-200">
              Instant doctor access between patients
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-teal-900 shadow-xs hover:bg-teal-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Install
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg p-1.5 text-teal-300 hover:text-white transition-colors focus-visible:outline-none"
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      </div>
    </aside>
  );
}
