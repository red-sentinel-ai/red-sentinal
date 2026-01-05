import { NextResponse } from "next/server";
import { sendManifestoConfirmationEmail } from "@/lib/emailUtils";
import { supabaseServiceClient } from "@/db/config/server";

export async function POST(request: Request) {
  try {
    const { email, hasAgreed } = await request.json();

    if (!email || !hasAgreed) {
      return NextResponse.json(
        { error: "Email and agreement are required." },
        { status: 400 }
      );
    }

    const { error: dbError } = await supabaseServiceClient
      .from("ss_manifesto_signatures")
      .upsert(
        {
          email,
          signed_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );

    if (dbError) {
      console.error("Database Insert Error:", dbError);
      return NextResponse.json(
        { error: "Failed to record signature in database." },
        { status: 500 }
      );
    }

    const emailResult = await sendManifestoConfirmationEmail(email);

    if (!emailResult.success) {
      console.error("Email Send Error:", emailResult.error);
      return NextResponse.json(
        {
          success: false,
          warning: "Signature saved, but failed to send confirmation email.",
          code: "EMAIL_FAILED",
        },
        { status: 424 }
      );
    }

    const { error: updateError } = await supabaseServiceClient
      .from("ss_manifesto_signatures")
      .update({
        email_sent_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (updateError) {
      console.error("Failed to update email_sent_at:", updateError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Manifesto API Fatal Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
