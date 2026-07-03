import "server-only";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.address || !body.description) {
      return NextResponse.json(
        { error: "Alle Felder sind erforderlich." },
        { status: 400 }
      );
    }

    // Sehenswertes (id=1) idzie przez /api/redaktion (pelny formularz).
    // Ort-vorschlagen jest tylko dla kategorii komercyjnych.
    const KATEGORIEN_KOMMERZIELL = [2, 3, 5, 8];
    if (body.kategorie_id !== undefined && body.kategorie_id !== null) {
      if (!KATEGORIEN_KOMMERZIELL.includes(Number(body.kategorie_id))) {
        return NextResponse.json(
          { error: "Sehenswertes bitte über die Redaktion einreichen." },
          { status: 400 }
        );
      }
    }

    const directusUrl = process.env.DIRECTUS_URL;
    if (!directusUrl) {
      return NextResponse.json(
        { error: "Serverkonfigurationsfehler." },
        { status: 500 }
      );
    }

    const directusToken = process.env.DIRECTUS_TOKEN;

    const response = await fetch(`${directusUrl}/items/ort_vorschlaege`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(directusToken && { Authorization: `Bearer ${directusToken}` }),
      },
      body: JSON.stringify({
        Name_des_Ortes: body.name,
        Adresse: body.address,
        Beschreibung: body.description,
        Kategorie_id: body.kategorie_id ?? null,
        Eingereicht_von_Email: body.submitted_by ?? null,
        Benutzername: body.submitted_by_username ?? null,
        Vorname: body.submitted_by_first_name ?? null,
        Nachname: body.submitted_by_last_name ?? null,
      }),
    });

    if (!response.ok) {
      console.error("Directus error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Fehler beim Speichern des Vorschlags." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Es ist ein Serverfehler aufgetreten." },
      { status: 500 }
    );
  }
}
