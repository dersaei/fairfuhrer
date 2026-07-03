import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

// Sehenswertes = id 1 w Directus.
// Wymuszamy po stronie serwera — user nie moze przez modyfikacje body dodac
// pinu w kategorii komercyjnej przez ten endpoint.
const SEHENSWERTES_KATEGORIE_ID = 1;

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

    // Kazdy zalogowany Reisender moze dodawac Sehenswertes. Partner tez
    // (Sehenswertes jest redakcyjne / darmowe dla wszystkich). Odrzucamy
    // tylko role ktore nie sa podpiete pod user account.
    // Uwaga: rola "reisender" w UI = wartosc "consumer" w bazie profiles.
    if (!profile || (profile.role !== "consumer" && profile.role !== "partner")) {
      return NextResponse.json(
        { error: "Nur für angemeldete Nutzer." },
        { status: 403 },
      );
    }

    const body = await request.json();

    if (!body.Name || !body.Adresse || !body.Stadt) {
      return NextResponse.json(
        { error: "Name, Adresse und Stadt sind erforderlich." },
        { status: 400 },
      );
    }

    const directusUrl = process.env.DIRECTUS_URL;
    if (!directusUrl) {
      return NextResponse.json(
        { error: "Serverkonfigurationsfehler." },
        { status: 500 },
      );
    }

    // Buduj obiekt pinu. Kluczowe roznice vs audiopin (Partner):
    //   - Bearbeitungsstatus: ausstehend (zawsze moderacja)
    //   - Pin_Typ: standard (Reisender nigdy nie ma premium pin)
    //   - Partner_ID: null
    //   - Unternehmensname: null (Reisender nie ma firmy)
    const pinData: Record<string, unknown> = {
      Name: body.Name,
      Adresse: body.Adresse,
      Stadt: body.Stadt,
      Land: body.Land ?? null,
      Vollbeschreibung: body.Vollbeschreibung ?? null,
      Kontaktperson:
        [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
        null,
      Email: user.email ?? null,
      Partner_ID: null,
      Unternehmensname: null,
      Pin_Typ: "standard",
      Bearbeitungsstatus: "ausstehend",
    };

    // Lokalizacja (Point z Mapbox autocomplete).
    if (body.Breite && body.Lange) {
      pinData.location = {
        type: "Point",
        coordinates: [body.Lange, body.Breite],
      };
    }

    // Titelbild (UUID directus_files).
    if (body.Titelbild) {
      pinData.Titelbild = body.Titelbild;
    }

    // Audio (UUID directus_files).
    if (body.Audio) {
      pinData.Audio = body.Audio;
    }

    // Galerie (m2m przez Orte_files).
    if (Array.isArray(body.Galerie) && body.Galerie.length > 0) {
      pinData.Galerie = {
        create: body.Galerie.map((fileId: string) => ({
          directus_files_id: fileId,
        })),
      };
    }

    // Tworzymy pin w Directus.
    const response = await fetch(`${directusUrl}/items/Orte`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.DIRECTUS_TOKEN && {
          Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}`,
        }),
      },
      body: JSON.stringify(pinData),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("Directus error (redaktion):", response.status, errText);
      return NextResponse.json(
        { error: "Fehler beim Speichern des Pins." },
        { status: 500 },
      );
    }

    const created = await response.json();
    const pinId = created.data?.id;

    // Relacja M2M: Kategorie — wymuszamy Sehenswertes (nie ufamy body).
    if (pinId) {
      await fetch(`${directusUrl}/items/Orte_Kategorie`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.DIRECTUS_TOKEN && {
            Authorization: `Bearer ${process.env.DIRECTUS_TOKEN}`,
          }),
        },
        body: JSON.stringify({
          Orte_id: pinId,
          Kategorie_id: SEHENSWERTES_KATEGORIE_ID,
        }),
      });
    }

    return NextResponse.json({ success: true, id: pinId }, { status: 201 });
  } catch (error) {
    console.error("API redaktion error:", error);
    return NextResponse.json(
      { error: "Es ist ein Serverfehler aufgetreten." },
      { status: 500 },
    );
  }
}
