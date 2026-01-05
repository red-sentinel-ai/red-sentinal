import { NextResponse } from "next/server";
import { sendManifestoConfirmationEmail } from "@/lib/emailUtils";

export async function POST(request: Request) {
  try {
    const { email, hasAgreed } = await request.json();

    if (!email || !hasAgreed) {
      return NextResponse.json(
        { error: "Email and agreement are required." },
        { status: 400 }
      );
    }

    // 1. (Optional) Save to Database - Assuming a table structure based on your other tables
    // If you don't have this table yet, you can comment this block out.
    // const { error: dbError } = await supabaseServiceClient
    //   .from("manifesto_signatures") // Ensure this table exists in Supabase
    //   .insert([{ email }]);

    // if (dbError) {
    //   // If error is "duplicate key", we proceed to send email anyway (idempotent for user)
    //   if (!dbError.message.includes("duplicate")) {
    //     console.error("Database error:", dbError);
    //   }
    // }

    // 2. Send Confirmation Email
    const emailResult = await sendManifestoConfirmationEmail(email);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send confirmation email." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Manifesto API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
