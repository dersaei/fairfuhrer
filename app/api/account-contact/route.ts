import "server-only";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.subject?.trim() || !body.message?.trim()) {
      return NextResponse.json(
        { error: "Betreff und Nachricht sind erforderlich." },
        { status: 400 }
      );
    }

    const directusUrl = process.env.DIRECTUS_URL;
    const directusToken = process.env.DIRECTUS_TOKEN;

    if (!directusUrl) {
      return NextResponse.json(
        { error: "Serverkonfigurationsfehler." },
        { status: 500 }
      );
    }

    const response = await fetch(`${directusUrl}/items/account_contact_messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(directusToken && { Authorization: `Bearer ${directusToken}` }),
      },
      body: JSON.stringify({
        user_id: body.user_id ?? null,
        email: body.email ?? null,
        name: body.name ?? null,
        username: body.username ?? null,
        account_type: body.account_type ?? null,
        subject: body.subject.trim(),
        message: body.message.trim(),
        date_created: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error("Directus error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Fehler beim Speichern der Nachricht." },
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
