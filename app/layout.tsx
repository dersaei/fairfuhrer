// fairfuhrer/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Lato, Montserrat, Staatliches, Oxanium } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import "../styles/reset.css";
import "../styles/ios-safari-fixes.css";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { PayPalProvider } from "../components/PayPalProvider";
import { CookieProvider } from "../context/CookieContext";
import CookieBanner from "../components/CookieBanner";
import HotjarTag from "../components/HotjarTag";

// Environment Variables
const HOTJAR_SITE_ID = process.env.NEXT_PUBLIC_HOTJAR_SITE_ID
  ? parseInt(process.env.NEXT_PUBLIC_HOTJAR_SITE_ID)
  : null;

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const staatliches = Staatliches({
  variable: "--font-staatliches",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#fc6c14",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.fairfuehrer.guide"),
  title: {
    default: "Fair Führer Guide",
    template: "%s | Fair Führer Guide",
  },
  description:
    "Der Digitale Reiseführer Für Nachhaltiges Leben & Reisen Am Bodensee Und Im Allgäu",
  keywords: [
    "nachhaltiges reisen",
    "Bodensee",
    "Allgäu",
    "digitaler reiseführer",
    "öko tourismus",
    "nachhaltiger tourismus",
    "umweltfreundlich reisen",
    "Bayern",
    "Baden-Württemberg",
  ],
  authors: [{ name: "Seenergien GmbH" }],
  creator: "Bogusław Siemiątkowski",
  publisher: "Seenergien GmbH",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://www.fairfuehrer.guide",
    title: "Fair Führer Guide",
    description:
      "Der Digitale Reiseführer Für Nachhaltiges Leben & Reisen Am Bodensee Und Im Allgäu",
    siteName: "Fair Führer Guide",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fair Führer Guide",
    description:
      "Der Digitale Reiseführer Für Nachhaltiges Leben & Reisen Am Bodensee Und Im Allgäu",
  },
  alternates: {
    canonical: "https://www.fairfuehrer.guide",
    languages: {
      "de-DE": "https://www.fairfuehrer.guide",
    },
  },
  verification: {
    google: "2bjmGVzCiAjpyN8vCrhb4NlhcbPh9mlFESnC866cCQE",
  },
  other: {
    "msapplication-TileColor": "#fc6c14",
    "preconnect-fonts": "https://fonts.googleapis.com",
    "preconnect-gstatic": "https://fonts.gstatic.com",
    // iPhone Safari specific meta tags
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Fair Führer Guide",
    "mobile-web-app-capable": "yes",
    "format-detection": "telephone=no",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`
          ${lato.variable}
          ${staatliches.variable}
          ${oxanium.variable}
          ${montserrat.variable}
        `}
      >
        <CookieProvider>
          {/* Hotjar Tag */}
          {HOTJAR_SITE_ID && <HotjarTag siteId={HOTJAR_SITE_ID} />}

          <PayPalProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </PayPalProvider>

          <CookieBanner />
        </CookieProvider>

        {/* Structured Data für Organisation */}
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Fair Führer Guide",
              description:
                "Der Digitale Reiseführer Für Nachhaltiges Leben & Reisen Am Bodensee Und Im Allgäu",
              url: "https://www.fairfuehrer.guide",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                availableLanguage: "German",
              },
            }),
          }}
        />

        {/* Enhanced viewport height fix for iPhone Safari */}
        <Script
          id="viewport-fix"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function setRealViewportHeight() {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', vh + 'px');
              }
              
              // Initial set
              setRealViewportHeight();
              
              // Enhanced event listeners for iPhone Safari
              window.addEventListener('resize', setRealViewportHeight);
              window.addEventListener('orientationchange', function() {
                setTimeout(setRealViewportHeight, 100);
              });
              
              // Additional iPhone Safari specific events
              window.addEventListener('load', setRealViewportHeight);
              if (window.screen && window.screen.orientation) {
                window.screen.orientation.addEventListener('change', function() {
                  setTimeout(setRealViewportHeight, 150);
                });
              }
            `,
          }}
        />

        {/* iPhone Safari audio context enabler */}
        <Script
          id="ios-audio-fix"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Enable audio context on iOS after user interaction
              function enableIOSAudio() {
                try {
                  const AudioContext = window.AudioContext || window.webkitAudioContext;
                  if (AudioContext) {
                    const audioContext = new AudioContext();
                    if (audioContext.state === 'suspended') {
                      audioContext.resume();
                    }
                  }
                } catch (e) {
                  console.log('Audio context not available');
                }
              }
              
              const events = ['touchstart', 'touchend', 'mousedown', 'keydown'];
              const onFirstInteraction = () => {
                enableIOSAudio();
                events.forEach(event => {
                  document.removeEventListener(event, onFirstInteraction);
                });
              };
              
              events.forEach(event => {
                document.addEventListener(event, onFirstInteraction, { once: true });
              });
            `,
          }}
        />
      </body>
      <GoogleAnalytics gaId="G-RZ7CM3J072" />
    </html>
  );
}
