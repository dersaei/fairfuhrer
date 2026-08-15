"use server";

import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyTurnstileToken } from "@/lib/turnstile";
import type {
  AuthResult,
  AuthUser,
  OAuthProvider,
  PartnerProfile,
  Profile,
} from "@/types/auth";
import { getCountry, getTaxBucket } from "@/lib/countries";


async function getRemoteIp(): Promise<string | undefined> {
  const h = await headers();
  return (
    h.get("CF-Connecting-IP") ?? h.get("X-Forwarded-For") ?? undefined
  );
}

export async function loginWithEmail(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const turnstileToken = formData.get("turnstileToken") as string;

  if (!email || !password) {
    return { success: false, error: "E-Mail und Passwort sind erforderlich." };
  }

  if (!turnstileToken || !(await verifyTurnstileToken(turnstileToken, await getRemoteIp()))) {
    return { success: false, error: "Sicherheitsüberprüfung fehlgeschlagen. Bitte versuchen Sie es erneut." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("loginWithEmail error:", error.message);
    if (error.message.includes("Invalid login credentials")) {
      return { success: false, error: "E-Mail oder Passwort ist falsch." };
    }
    if (error.message.includes("Email not confirmed")) {
      return {
        success: false,
        error: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.",
      };
    }
    return { success: false, error: "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut." };
  }

  return { success: true, redirectTo: "/konto" };
}

export async function loginWithMagicLink(
  formData: FormData
): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const turnstileToken = formData.get("turnstileToken") as string;

  if (!email) {
    return { success: false, error: "Bitte geben Sie Ihre E-Mail-Adresse ein." };
  }

  if (!turnstileToken || !(await verifyTurnstileToken(turnstileToken, await getRemoteIp()))) {
    return { success: false, error: "Sicherheitsüberprüfung fehlgeschlagen. Bitte versuchen Sie es erneut." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL}/callback`,
    },
  });

  if (error) {
    console.error("loginWithMagicLink error:", error.message);
    return { success: false, error: "Magic Link konnte nicht gesendet werden." };
  }

  return {
    success: true,
    error: undefined,
  };
}

export async function loginWithOAuth(
  provider: OAuthProvider
): Promise<{ url: string } | AuthResult> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL}/callback`,
    },
  });

  if (error || !data.url) {
    console.error("loginWithOAuth error:", error?.message);
    return { success: false, error: "OAuth-Anmeldung fehlgeschlagen." };
  }

  return { url: data.url };
}

export async function registerConsumer(
  formData: FormData
): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const username = formData.get("username") as string;
  const turnstileToken = formData.get("turnstileToken") as string;

  if (!email || !password || !username) {
    return { success: false, error: "Alle Pflichtfelder müssen ausgefüllt werden." };
  }

  if (!turnstileToken || !(await verifyTurnstileToken(turnstileToken, await getRemoteIp()))) {
    return { success: false, error: "Sicherheitsüberprüfung fehlgeschlagen. Bitte versuchen Sie es erneut." };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Die Passwörter stimmen nicht überein." };
  }

  if (password.length < 8) {
    return { success: false, error: "Das Passwort muss mindestens 8 Zeichen lang sein." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "consumer",
        username,
      },
      emailRedirectTo: `${process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL}/callback`,
    },
  });

  if (error) {
    console.error("registerConsumer error:", error.message);
    if (error.message.includes("already registered")) {
      return { success: false, error: "Diese E-Mail-Adresse ist bereits registriert." };
    }
    return { success: false, error: "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut." };
  }

  return { success: true, redirectTo: "/konto" };
}

export async function registerPartner(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const companyName = formData.get("companyName") as string;
  const street = formData.get("street") as string;
  const postalCode = formData.get("postalCode") as string;
  const city = formData.get("city") as string;
  const country = formData.get("country") as string;
  const businessEmail = formData.get("businessEmail") as string;
  const turnstileToken = formData.get("turnstileToken") as string;

  if (!email || !password || !firstName || !lastName || !companyName || !street || !postalCode || !city) {
    return { success: false, error: "Alle Pflichtfelder müssen ausgefüllt werden." };
  }

  if (!turnstileToken || !(await verifyTurnstileToken(turnstileToken, await getRemoteIp()))) {
    return { success: false, error: "Sicherheitsüberprüfung fehlgeschlagen. Bitte versuchen Sie es erneut." };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Die Passwörter stimmen nicht überein." };
  }

  if (password.length < 8) {
    return { success: false, error: "Das Passwort muss mindestens 8 Zeichen lang sein." };
  }

  const supabase = await getSupabaseServerClient();
  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "partner",
        first_name: firstName,
        last_name: lastName,
      },
      emailRedirectTo: `${process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL}/callback`,
    },
  });

  if (error) {
    console.error("registerPartner error:", error.message);
    if (error.message.includes("already registered")) {
      return { success: false, error: "Diese E-Mail-Adresse ist bereits registriert." };
    }
    return { success: false, error: "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut." };
  }

  // Zapisz dane firmy do partner_profiles (przez admin client — user nie jest jeszcze zalogowany)
  if (signUpData.user) {
    const phone = formData.get("phone") as string;
    const taxIdValue = (formData.get("taxIdValue") as string)?.trim() || null;
    const noEuVat = formData.get("noEuVat") === "true";
    const websiteUrl = formData.get("websiteUrl") as string;

    const countryCode = country || "DE";
    const countryMeta = getCountry(countryCode);
    const taxGroup = countryMeta?.taxGroup ?? "THIRD";
    const hasEuVatId = taxGroup === "EU" && !noEuVat && !!taxIdValue;
    const taxBucket = getTaxBucket(countryCode, hasEuVatId);
    const crossBorderB2c = taxBucket === "eu_no_vat";

    // Mapuj tax_id_value na właściwe pole legacy (vat_eu lub tax_id)
    const vatEu = taxGroup === "EU" && !noEuVat ? taxIdValue : null;
    const taxId = taxGroup === "DE" ? taxIdValue : null;

    const { error: upsertError } = await supabaseAdmin.from("partner_profiles").upsert({
      id: signUpData.user.id,
      company_name: companyName,
      street,
      postal_code: postalCode,
      city,
      country: countryCode,
      business_email: businessEmail || null,
      phone_number: phone || null,
      tax_id: taxId,
      vat_eu: vatEu,
      website_url: websiteUrl || null,
      // nowe kolumny VAT
      tax_group: taxGroup,
      tax_bucket: taxBucket,
      tax_id_field_key: countryMeta?.taxIdFieldKey ?? "foreign_tax_id",
      tax_id_value: taxIdValue,
      no_eu_vat: noEuVat,
      cross_border_b2c: crossBorderB2c,
    });
    if (upsertError) {
      console.error("registerPartner upsert error:", upsertError.message);
    }
  }

  return { success: true, redirectTo: "/konto/partner" };
}

export async function deleteAccount(): Promise<AuthResult> {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Nicht autorisiert." };
  }

  // Usuń usera z Auth (cascade usunie profiles i partner_profiles)
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("deleteAccount error:", deleteError.message);
    return { success: false, error: "Konto konnte nicht gelöscht werden." };
  }

  return { success: true };
}

export async function logout(): Promise<void> {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPassword(email: string): Promise<AuthResult> {
  if (!email) {
    return { success: false, error: "Bitte geben Sie Ihre E-Mail-Adresse ein." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL}/passwort-zuruecksetzen`,
  });

  if (error) {
    console.error("resetPassword error:", error.message);
    return { success: false, error: "E-Mail konnte nicht gesendet werden." };
  }

  return { success: true };
}

export async function updateEmail(newEmail: string): Promise<AuthResult> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    { emailRedirectTo: `${process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL}/konto` }
  );
  if (error) {
    console.error("updateEmail error:", error.message);
    return { success: false, error: "E-Mail-Adresse konnte nicht geändert werden." };
  }
  return { success: true };
}

export async function updatePassword(password: string): Promise<AuthResult> {
  if (!password || password.length < 8) {
    return { success: false, error: "Das Passwort muss mindestens 8 Zeichen lang sein." };
  }

  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error("updatePassword error:", error.message);
    return { success: false, error: "Passwort konnte nicht aktualisiert werden." };
  }

  return { success: true, redirectTo: "/konto" };
}

export async function updateConsumerProfile(
  data: Partial<Pick<Profile, "username" | "first_name" | "last_name">>
): Promise<AuthResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Nicht autorisiert." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ ...data })
    .eq("id", user.id);

  if (error) {
    console.error("updateConsumerProfile error:", error.message);
    return { success: false, error: "Profil konnte nicht gespeichert werden." };
  }

  return { success: true };
}

export async function updatePartnerProfile(
  data: Partial<Omit<PartnerProfile, "id" | "created_at" | "updated_at">>
): Promise<AuthResult> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Nicht autorisiert." };
  }

  const { error } = await supabase
    .from("partner_profiles")
    .update(data)
    .eq("id", user.id);

  if (error) {
    console.error("updatePartnerProfile error:", error.message);
    return { success: false, error: "Partnerprofil konnte nicht gespeichert werden." };
  }

  return { success: true };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  let partnerProfile = null;
  if (profile?.role === "partner") {
    const { data } = await supabase
      .from("partner_profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    partnerProfile = data;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    profile: profile ?? null,
    partnerProfile,
  };
}
