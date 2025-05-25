import type { Metadata } from "next";
import { Lato, Oswald, Work_Sans } from "next/font/google";
import "../styles/reset.css";

import Header from "../components/Header";

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
const workSans = Work_Sans({
  subsets: ["latin"],
  weight: "400", // Poprawione: pojedyncza wartość jako string
  variable: "--font-work-sans", // Poprawione: myślnik zamiast podkreślenia
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
        className={`${lato.variable} ${oswald.variable} ${workSans.variable}`}
      >
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
