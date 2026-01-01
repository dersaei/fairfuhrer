// app/actions/cookies.ts
"use server";

import { cookies } from "next/headers";
import { CookiePreferences } from "@/context/CookieContext";

/**
 * Server Action to save cookie preferences
 * Uses Next.js cookies() API for server-side cookie management with security options
 */
export async function saveCookiePreferences(
  preferences: CookiePreferences
): Promise<void> {
  const cookieStore = await cookies();

  // Cookie options for security and longevity
  const cookieOptions = {
    httpOnly: false, // Must be false so client-side JS can read it
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict" as const, // CSRF protection
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  };

  // Save preferences as JSON
  cookieStore.set(
    "cookie-preferences",
    JSON.stringify(preferences),
    cookieOptions
  );

  // Save consent flag
  cookieStore.set("cookie-consent-given", "true", cookieOptions);
}

/**
 * Server Action to get cookie preferences
 * Returns null if preferences don't exist or are invalid
 */
export async function getCookiePreferences(): Promise<CookiePreferences | null> {
  const cookieStore = await cookies();
  const preferencesCookie = cookieStore.get("cookie-preferences");

  if (!preferencesCookie) {
    return null;
  }

  try {
    const parsed = JSON.parse(preferencesCookie.value);

    // Validate the parsed object has the correct structure
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.necessary === "boolean" &&
      typeof parsed.functional === "boolean" &&
      typeof parsed.analytics === "boolean"
    ) {
      return parsed as CookiePreferences;
    }

    return null;
  } catch (error) {
    console.error("Failed to parse cookie preferences:", error);
    return null;
  }
}

/**
 * Server Action to check if user has given consent
 */
export async function hasUserConsented(): Promise<boolean> {
  const cookieStore = await cookies();
  const consentCookie = cookieStore.get("cookie-consent-given");
  return consentCookie?.value === "true";
}

/**
 * Server Action to delete cookie preferences
 */
export async function deleteCookiePreferences(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("cookie-preferences");
  cookieStore.delete("cookie-consent-given");
}
