"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    const clearLegacyRuntime = async () => {
      try {
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
        }
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.filter((key) => key.startsWith("bar-ops-")).map((key) => caches.delete(key)));
        }
      } catch (error) {
        console.error("Bar Ops runtime cleanup failed", error);
      }
    };
    void clearLegacyRuntime();
  }, []);
  return null;
}
