// app/layout.tsx

import type { Metadata } from "next";
import { Lato, Montserrat, Staatliches, Oxanium } from "next/font/google";
import "../styles/reset.css";

import Header from "../components/Header";
import Footer from "../components/Footer";

// pozostałe fonty
const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const staatliches = Staatliches({
  variable: "--font-staatliches",
  subsets: ["latin"],
  weight: "400",
});

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// nowy font Montserrat
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Fair Guide",
  description:
    "DER DIGITALE REISEFÜHRER FÜR NACHHALTIGESLEBEN & REISEN AM BODENSEE UND IM ALLGÄU",
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
        <Header />
        <main>{children}</main>
        <Footer />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Fix dla paska adresu na mobile
              function setRealViewportHeight() {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', vh + 'px');
              }
             
              setRealViewportHeight();
              window.addEventListener('resize', setRealViewportHeight);
              window.addEventListener('orientationchange', function() {
                setTimeout(setRealViewportHeight, 100);
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
