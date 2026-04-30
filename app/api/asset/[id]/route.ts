import "server-only";

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const directusUrl = process.env.DIRECTUS_URL;
  const directusToken = process.env.DIRECTUS_TOKEN;
  if (!directusUrl || !directusToken) {
    return new NextResponse("Serverkonfigurationsfehler.", { status: 500 });
  }

  const upstream = await fetch(`${directusUrl}/assets/${id}`, {
    headers: { Authorization: `Bearer ${directusToken}` },
  });

  if (!upstream.ok) {
    return new NextResponse("Not found.", { status: upstream.status });
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
