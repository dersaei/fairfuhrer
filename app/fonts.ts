// app/fonts.ts - Font definitions for FairFührer Guide
import { Lato, Montserrat, Staatliches, Oxanium } from "next/font/google";

/**
 * Lato - Sans-serif font for body text
 * No variable font available - using static weights
 * Weights: 400 (Regular), 700 (Bold)
 */
export const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

/**
 * Montserrat - Variable font for versatile usage
 * Variable font available with weight axis (100-900)
 * Removing weight array to use full variable range
 */
export const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Oxanium - Variable futuristic font
 * Variable font available with weight axis
 * Removing weight array to use full variable range
 */
export const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Staatliches - Display font for titles
 * No variable font available - single weight only
 * Weight: 400 (Regular)
 */
export const staatliches = Staatliches({
  variable: "--font-staatliches",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
