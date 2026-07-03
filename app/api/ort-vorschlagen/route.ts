import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    // Auth: wymagane. Cookies (web) LUB Bearer token (mobile).
    // BREAKING CHANGE: mobile 1.1.2 nie ma Bearer, wiec obecny hook nie zadziala
    // do momentu wypuszczenia mobile 1.1.3 z auth header. Anti-spoofing:
    // wczesniej user mogl podac dowolny email w body — teraz email czytamy
    // z zweryfikowanej sesji, nigdy z body.
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    // Profil dla imienia/nazwiska — supabaseAdmin omija RLS.
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("first_name, last_name, username")
      .eq("id", user.id)
      .single();

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
        // Wszystkie identyfikatory uzytkownika z ZWERYFIKOWANEJ sesji,
        // nigdy z body. Zapobiega spoofingowi tozsamosci.
        Eingereicht_von_Email: user.email ?? null,
        Benutzername: profile?.username ?? null,
        Vorname: profile?.first_name ?? null,
        Nachname: profile?.last_name ?? null,
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
