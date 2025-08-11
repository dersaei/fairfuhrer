// fairfuhrer/components/GoogleTag.tsx
"use client";

import Script from "next/script";
import { useEffect } from "react";

interface GoogleTagProps {
  tagId: string;
}

export default function GoogleTag({ tagId }: GoogleTagProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Inicjalizuj dataLayer i gtag tylko raz
      window.dataLayer = window.dataLayer || [];
      if (!window.gtag) {
        window.gtag = function (...args: unknown[]) {
          window.dataLayer.push(args);
        };
      }

      // Ustaw domyślny consent (DENIED dla wszystkiego)
      window.gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        functionality_storage: "denied",
        personalization_storage: "denied",
        wait_for_update: 500,
      });

      console.log("🏷️ Google Tag consent default set to DENIED");
    }
  }, []);

  return (
    <>
      {/* Google Tag (gtag.js) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${tagId}`}
        strategy="afterInteractive"
        onLoad={() => console.log("📊 Google Tag script loaded")}
      />

      {/* Konfiguracja - używaj TYLKO Google Analytics ID */}
      <Script
        id="google-tag-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            gtag('js', new Date());
            
            // Skonfiguruj Google Analytics 4
            gtag('config', '${tagId}', {
              send_page_view: false, // Nie wysyłaj automatycznie page_view
              cookie_flags: 'secure;samesite=lax',
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false
            });
            
            console.log('📈 Google Analytics configured: ${tagId}');
          `,
        }}
      />
    </>
  );
}
