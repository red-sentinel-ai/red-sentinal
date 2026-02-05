import { NextResponse } from "next/server";
import { supabaseServiceClient } from "@/db/config/server";

export async function GET() {
  try {
    const { count, error } = await supabaseServiceClient
      .from("ss_manifesto_signatures")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Database Error:", error);
      return NextResponse.json(
        { error: "Failed to fetch signature count" },
        { status: 500 }
      );
    }

    return NextResponse.json({ count: count ?? 0 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
