// app/fonts.ts - Font definitions for FairFührer Guide
import { Anton, Fira_Sans_Condensed } from "next/font/google";

/**
 * Anton - Display font for bold headings
 * Single weight: 400 (Regular)
 */
export const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/**
 * Fira Sans Condensed - Condensed sans-serif for body and UI text
 * Weights: 400 (Regular), 700 (Bold)
 */
export const firaSansCondensed = Fira_Sans_Condensed({
  variable: "--font-fira",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});
