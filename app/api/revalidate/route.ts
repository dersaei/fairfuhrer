import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, tags } = body;

    const revalidateSecret = process.env.REVALIDATE_SECRET_TOKEN;

    if (!revalidateSecret) {
      console.error("REVALIDATE_SECRET_TOKEN not configured");
      return NextResponse.json(
        { error: "Revalidation not configured" },
        { status: 500 },
      );
    }

    if (secret !== revalidateSecret) {
      return NextResponse.json(
        { error: "Invalid secret token" },
        { status: 401 },
      );
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty tags array" },
        { status: 400 },
      );
    }

    for (const tag of tags) {
      revalidateTag(tag, { expire: 0 });
      console.log(`Revalidated tag: ${tag}`);
    }

    return NextResponse.json({
      revalidated: true,
      tags,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in revalidation endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
