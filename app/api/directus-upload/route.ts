import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const directusUrl = process.env.DIRECTUS_URL;
    const directusToken = process.env.DIRECTUS_TOKEN;
    if (!directusUrl || !directusToken) {
      return NextResponse.json({ error: "Serverkonfigurationsfehler." }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Keine Datei empfangen." }, { status: 400 });
    }

    const directusForm = new FormData();
    directusForm.append("file", file);

    const res = await fetch(`${directusUrl}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${directusToken}`,
      },
      body: directusForm,
    });

    const resText = await res.text();
    console.log("Directus upload response:", res.status, resText);

    if (!res.ok) {
      return NextResponse.json({ error: "Upload zu Directus fehlgeschlagen." }, { status: 500 });
    }

    if (!resText) {
      return NextResponse.json({ error: "Directus hat keine ID zurückgegeben." }, { status: 500 });
    }

    const data = JSON.parse(resText);
    const fileId = data.data?.id as string;

    if (!fileId) {
      return NextResponse.json({ error: "Keine Datei-ID erhalten." }, { status: 500 });
    }

    return NextResponse.json({ id: fileId }, { status: 201 });
  } catch (error) {
    console.error("directus-upload error:", error);
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}
