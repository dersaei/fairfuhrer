// fairfuhrer/app/layout.tsx - Next.js 16.0.7 + React 19.2.1
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
import GlobalLoadingIndicator from "../components/GlobalLoadingIndicator";

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
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.fairfuehrer.guide"),
  title: {
    default: "FairFührer Guide",
    template: "%s | FairFührer Guide",
  },
  description:
    "Der Reiseführer für nachhaltiges Leben & Reisen Am Bodensee Und Im Allgäu",
  keywords: [
    "nachhaltiges reisen",
    "Bodensee",
    "Allgäu",
    "öko tourismus",
    "nachhaltiger tourismus",
    "umweltfreundlich reisen",
    "Bayern",
    "Baden-Württemberg",
  ],
  authors: [{ name: "Seenergien GmbH" }],
  creator: "Bogusław Siemiątkowski",
  publisher: "Seenergien GmbH",
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
        {/* ✅ Global Loading Indicator - Next.js 16 useLinkStatus */}
        <GlobalLoadingIndicator />

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
              name: "FairFührer Guide",
              description: "Der Reiseführer für nachhaltiges Leben & Reisen",
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
