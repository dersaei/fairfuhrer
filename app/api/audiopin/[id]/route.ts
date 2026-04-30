import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pinId } = await params;

    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    // Weryfikacja: użytkownik musi być premium i posiadać ten pin
    const { data: partnerProfile } = await supabase
      .from("partner_profiles")
      .select("pin_id, premium_until")
      .eq("id", user.id)
      .single();

    const isPremium = partnerProfile?.premium_until
      ? new Date(partnerProfile.premium_until) > new Date()
      : false;

    if (!isPremium) {
      return NextResponse.json({ error: "Premium erforderlich." }, { status: 403 });
    }

    if (String(partnerProfile?.pin_id) !== String(pinId)) {
      return NextResponse.json({ error: "Zugriff verweigert." }, { status: 403 });
    }

    const directusUrl = process.env.DIRECTUS_URL;
    const directusToken = process.env.DIRECTUS_TOKEN;
    if (!directusUrl || !directusToken) {
      return NextResponse.json({ error: "Serverkonfigurationsfehler." }, { status: 500 });
    }

    const body = await request.json();

    // Dozwolone pola do edycji przez partnera
    const allowedFields = [
      "Name", "Adresse", "Stadt", "Land", "Telefon", "Vollbeschreibung",
      "Link_URL", "Link_Text", "Titelbild", "Audio", "location",
    ];

    const patchData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        patchData[field] = body[field];
      }
    }

    // Kategorie — zastąp wszystkie (delete + create przez Directus nested mutation)
    if (Array.isArray(body.Kategorie)) {
      patchData.Kategorie = {
        delete: body.Kategorie_delete ?? [],
        create: body.Kategorie.map((id: number) => ({ Kategorie_id: id })),
      };
    }

    // Zertifizierungen — zastąp wszystkie
    if (Array.isArray(body.Zertifizierungen)) {
      patchData.Zertifizierungen = {
        delete: body.Zertifizierungen_delete ?? [],
        create: body.Zertifizierungen.map((id: string) => ({ Zertifizierungen_id: id })),
      };
    }

    // Galerie — dodaj nowe pliki przez junction
    if (Array.isArray(body.Galerie_add) && body.Galerie_add.length > 0) {
      patchData.Galerie = {
        create: body.Galerie_add.map((fileId: string) => ({ directus_files_id: fileId })),
      };
    }

    // Galerie — usuń wybrane junction rekordy
    if (Array.isArray(body.Galerie_delete) && body.Galerie_delete.length > 0) {
      patchData.Galerie = {
        ...((patchData.Galerie as object) ?? {}),
        delete: body.Galerie_delete,
      };
    }

    if (Object.keys(patchData).length === 0) {
      return NextResponse.json({ error: "Keine Änderungen." }, { status: 400 });
    }

    const response = await fetch(`${directusUrl}/items/Orte/${pinId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${directusToken}`,
      },
      body: JSON.stringify(patchData),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("Directus PATCH error:", response.status, errText);
      return NextResponse.json({ error: "Fehler beim Aktualisieren." }, { status: 500 });
    }

    const updated = await response.json();
    return NextResponse.json({ success: true, data: updated.data });
  } catch (error) {
    console.error("PATCH audiopin error:", error);
    return NextResponse.json({ error: "Es ist ein Serverfehler aufgetreten." }, { status: 500 });
  }
}

// Pobierz aktualny pin z Directusa (do załadowania formularza edycji)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pinId } = await params;

    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const { data: partnerProfile } = await supabase
      .from("partner_profiles")
      .select("pin_id, premium_until")
      .eq("id", user.id)
      .single();

    if (String(partnerProfile?.pin_id) !== String(pinId)) {
      return NextResponse.json({ error: "Zugriff verweigert." }, { status: 403 });
    }

    const directusUrl = process.env.DIRECTUS_URL;
    const directusToken = process.env.DIRECTUS_TOKEN;
    if (!directusUrl || !directusToken) {
      return NextResponse.json({ error: "Serverkonfigurationsfehler." }, { status: 500 });
    }

    const fields = [
      "id", "Name", "Adresse", "Stadt", "Land", "Telefon", "Vollbeschreibung",
      "Link_URL", "Link_Text", "Titelbild", "Audio",
      "location",
      "Kategorie.Kategorie_id",
      "Zertifizierungen.Zertifizierungen_id",
    ].join(",");

    const [pinResponse, galerieResponse] = await Promise.all([
      fetch(`${directusUrl}/items/Orte/${pinId}?fields=${fields}`, {
        headers: { Authorization: `Bearer ${directusToken}` },
      }),
      fetch(
        `${directusUrl}/items/Orte_files?filter[Orte_id][_eq]=${pinId}&fields=id,directus_files_id&limit=20`,
        { headers: { Authorization: `Bearer ${directusToken}` } }
      ),
    ]);

    if (!pinResponse.ok) {
      return NextResponse.json({ error: "Pin nicht gefunden." }, { status: 404 });
    }

    const pinData = await pinResponse.json();
    const galerieData = galerieResponse.ok ? await galerieResponse.json() : { data: [] };

    const result = {
      ...pinData.data,
      Galerie: (galerieData.data ?? []) as { id: number; directus_files_id: string }[],
    };

    console.log("[audiopin GET] Stadt:", result.Stadt, "Land:", result.Land, "Adresse:", result.Adresse);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET audiopin error:", error);
    return NextResponse.json({ error: "Es ist ein Serverfehler aufgetreten." }, { status: 500 });
  }
}
