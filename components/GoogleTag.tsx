// fairfuhrer/app/components/GoogleTag.tsx
"use client";

import Script from "next/script";
import { useEffect } from "react";

interface GoogleTagProps {
  tagId: string;
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export default function GoogleTag({ tagId }: GoogleTagProps) {
  useEffect(() => {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    // Initialize gtag function
    window.gtag = function (...args: unknown[]) {
      window.dataLayer.push(args);
    };

    // Set default consent PRZED załadowaniem Google Tag
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
      wait_for_update: 2000,
    });

    console.log("Google Tag initialized with consent mode");
  }, []);

  return (
    <>
      {/* Google Tag Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${tagId}`}
        strategy="afterInteractive"
      />

      {/* Google Tag Configuration */}
      <Script
        id="google-tag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${tagId}');
          `,
        }}
      />
    </>
  );
}
