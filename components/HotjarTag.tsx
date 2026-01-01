// fairfuhrer/app/components/HotjarTag.tsx
"use client";

import { useEffect, useRef } from "react";
import Hotjar from "@hotjar/browser";
import { useCookies } from "../context/CookieContext";

interface HotjarTagProps {
  siteId: number;
  hotjarVersion?: number;
}

/**
 * Hotjar integration component with proper initialization handling
 * Prevents duplicate initialization and manages consent-based loading
 */
export default function HotjarTag({
  siteId,
  hotjarVersion = 6,
}: HotjarTagProps) {
  const { preferences, hasConsented } = useCookies();
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Validate site ID
    if (!siteId || isNaN(siteId)) {
      console.warn("Hotjar: Invalid site ID provided");
      return;
    }

    // Initialize Hotjar if user has consented to analytics
    if (hasConsented && preferences.analytics) {
      // Only initialize once
      if (!isInitializedRef.current) {
        try {
          Hotjar.init(siteId, hotjarVersion);
          isInitializedRef.current = true;
          console.log("✅ Hotjar initialized successfully");
        } catch (error) {
          console.error("❌ Failed to initialize Hotjar:", error);
        }
      }
    } else if (hasConsented && !preferences.analytics) {
      // User has declined analytics - clear Hotjar cookies
      if (isInitializedRef.current || typeof window !== "undefined") {
        try {
          // Clear Hotjar cookies
          const hotjarCookies = document.cookie
            .split(";")
            .filter((cookie) => cookie.trim().startsWith("_hj"));

          hotjarCookies.forEach((cookie) => {
            const cookieName = cookie.split("=")[0].trim();
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          });

          isInitializedRef.current = false;
          console.log("🧹 Hotjar disabled and cookies cleared");
        } catch (error) {
          console.error("❌ Failed to clear Hotjar data:", error);
        }
      }
    }
  }, [siteId, hotjarVersion, hasConsented, preferences.analytics]);

  // This component doesn't render anything - it only manages the Hotjar script
  return null;
}
