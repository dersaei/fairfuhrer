import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Keine Datei angegeben." }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Nur JPEG, PNG, WebP und GIF sind erlaubt." },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Die Datei darf nicht größer als 10 MB sein." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `${user.id}/gallery/${filename}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("partner-galleries")
      .upload(path, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Gallery upload error:", uploadError.message);
      return NextResponse.json(
        { error: "Datei konnte nicht hochgeladen werden." },
        { status: 500 }
      );
    }

    // Zapisz ścieżkę w partner_profiles.gallery_paths
    const { data: existing } = await supabase
      .from("partner_profiles")
      .select("gallery_paths")
      .eq("id", user.id)
      .single();

    const currentPaths: string[] = existing?.gallery_paths ?? [];
    const updatedPaths = [...currentPaths, path];

    await supabase
      .from("partner_profiles")
      .update({ gallery_paths: updatedPaths })
      .eq("id", user.id);

    return NextResponse.json({ success: true, path }, { status: 200 });
  } catch (error) {
    console.error("Gallery route error:", error);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
    }

    const { path } = await request.json();

    if (!path || !path.startsWith(`${user.id}/`)) {
      return NextResponse.json({ error: "Ungültiger Pfad." }, { status: 400 });
    }

    const { error: deleteError } = await supabase.storage
      .from("partner-galleries")
      .remove([path]);

    if (deleteError) {
      console.error("Gallery delete error:", deleteError.message);
      return NextResponse.json(
        { error: "Datei konnte nicht gelöscht werden." },
        { status: 500 }
      );
    }

    const { data: existing } = await supabase
      .from("partner_profiles")
      .select("gallery_paths")
      .eq("id", user.id)
      .single();

    const updatedPaths = (existing?.gallery_paths ?? []).filter(
      (p: string) => p !== path
    );

    await supabase
      .from("partner_profiles")
      .update({ gallery_paths: updatedPaths })
      .eq("id", user.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Gallery delete route error:", error);
    return NextResponse.json({ error: "Serverfehler" }, { status: 500 });
  }
}
