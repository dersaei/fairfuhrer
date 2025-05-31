// layout.tsx
import type { Metadata } from "next";
import {
  Lato,
  Oswald,
  Work_Sans,
  Staatliches,
  Oxanium,
} from "next/font/google";
import "../styles/reset.css";

import Header from "../components/Header";

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
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-oswald",
});
const workSans = Work_Sans({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-work-sans",
});

// nowy import Oxanium
const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  weight: ["400", "700"], // tutaj dobierz te wagi, których potrzebujesz
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
          ${oswald.variable}
          ${workSans.variable}
          ${staatliches.variable}
          ${oxanium.variable}  /* dodajemy Oxanium na body */
        `}
      >
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
