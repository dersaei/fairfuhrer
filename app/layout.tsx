import type { Metadata } from "next";
import { Geist, Geist_Mono, Lato, Oswald } from "next/font/google";
import "../styles/reset.css";

import Header from "../components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
});
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-oswald",
});

export const metadata: Metadata = {
  title: "Fair Führer",
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
        className={`${geistSans.variable} ${geistMono.variable} ${lato.variable} ${oswald.variable}`}
      >
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
