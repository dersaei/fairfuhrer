import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getCountryLabel } from "@/lib/countries";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const KATEGORIEN = [
  { id: 1, name: "Erlebnisse" },
  { id: 2, name: "Gastronomie & Übernachten" },
  { id: 3, name: "Einkaufen" },
  { id: 5, name: "Engagement" },
  { id: 8, name: "Unternehmen" },
] as const;

const ZERTIFIZIERUNGEN = [
  { id: "0b65943d-f041-4ba4-8977-f1130182b165", name: "Bioland" },
  { id: "316f5bd4-1161-4987-975e-0ceb58fb260c", name: "Unverpackt Verband" },
  { id: "3a2f6b5e-5573-4268-a730-9de111f0c2b1", name: "Fairtrade" },
  { id: "434a2b04-3a73-49c0-8ed0-2fb76ce5da40", name: "Fairbusiness" },
  { id: "613717b2-ba00-45b8-9f3d-bbd834b0497a", name: "Naturland fair" },
  { id: "85cc8c45-bbfd-4324-af38-4b6ae5789588", name: "Cradle to Cradle" },
  { id: "875901cf-245d-4892-aa92-752a60d7fc21", name: "GWÖ" },
  { id: "d454e097-1a75-481a-939e-8e2b85359561", name: "Demeter" },
  { id: "df8d53d4-03a7-472e-9275-4709c87354e0", name: "Bürgerkarte" },
] as const;

export { KATEGORIEN, ZERTIFIZIERUNGEN };

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, first_name, last_name")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "partner") {
      return NextResponse.json({ error: "Nur für Partner." }, { status: 403 });
    }

    const { data: partnerProfile } = await supabase
      .from("partner_profiles")
      .select("company_name, country, business_email, phone_number, premium_until")
      .eq("id", user.id)
      .single();

    const isPremium = partnerProfile?.premium_until
      ? new Date(partnerProfile.premium_until) > new Date()
      : false;

    const body = await request.json();

    if (!body.Name || !body.Adresse || !body.Stadt) {
      return NextResponse.json(
        { error: "Name, Adresse und Stadt sind erforderlich." },
        { status: 400 }
      );
    }

    const directusUrl = process.env.DIRECTUS_URL;
    if (!directusUrl) {
      return NextResponse.json({ error: "Serverkonfigurationsfehler." }, { status: 500 });
    }

    // Buduj obiekt pinu
    const pinData: Record<string, unknown> = {
      Name: body.Name,
      Adresse: body.Adresse,
      Stadt: body.Stadt,
      Land: partnerProfile?.country ? getCountryLabel(partnerProfile.country) : null,
      Telefon: body.Telefon ?? null,
      Vollbeschreibung: body.Vollbeschreibung ?? null,
      Link_URL: body.Link_URL ?? null,
      Link_Text: body.Link_Text ?? null,
      Kontaktperson:
        [profile?.first_name, profile?.last_name]
          .filter(Boolean)
          .join(" ") || null,
      Email: partnerProfile?.business_email ?? null,
      Partner_ID: user.id,
      Unternehmensname: partnerProfile?.company_name ?? null,
      Pin_Typ: isPremium ? "premium" : "standard",
      Bearbeitungsstatus: "ausstehend",
    };

    // Lokalizacja — tylko jeśli wybrano adres z autocomplete
    if (body.Breite && body.Lange) {
      pinData.location = {
        type: "Point",
        coordinates: [body.Lange, body.Breite],
      };
    }

    // Główne zdjęcie (Titelbild)
    if (body.Titelbild) {
      pinData.Titelbild = body.Titelbild;
    }

    // Tworzymy pin w Directus
    console.log("Sending to Directus:", JSON.stringify(pinData, null, 2));
    const response = await fetch(`${directusUrl}/items/Orte`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pinData),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("Directus error:", response.status, errText);
      return NextResponse.json(
        { error: "Fehler beim Speichern des Pins." },
        { status: 500 }
      );
    }

    const created = await response.json();
    const pinId = created.data?.id;

    // Relacje MTM: Kategorie
    if (Array.isArray(body.Kategorie) && body.Kategorie.length > 0 && pinId) {
      for (const kategorieId of body.Kategorie) {
        await fetch(`${directusUrl}/items/Orte_Kategorie`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Orte_id: pinId, Kategorie_id: kategorieId }),
        });
      }
    }

    // Relacje MTM: Zertifizierungen
    if (Array.isArray(body.Zertifizierungen) && body.Zertifizierungen.length > 0 && pinId) {
      for (const zertId of body.Zertifizierungen) {
        await fetch(`${directusUrl}/items/Orte_Zertifizierungen`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Orte_id: pinId, Zertifizierungen_id: zertId }),
        });
      }
    }

    return NextResponse.json({ success: true, id: pinId }, { status: 201 });
  } catch (error) {
    console.error("API audiopin error:", error);
    return NextResponse.json(
      { error: "Es ist ein Serverfehler aufgetreten." },
      { status: 500 }
    );
  }
}
