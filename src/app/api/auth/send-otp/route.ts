import { NextRequest, NextResponse } from "next/server";
import { setOtp } from "@/lib/otp-store";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Please provide an email address." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@gmail\.com$/i.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid Gmail address." },
        { status: 400 }
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(email, code);

    await sendOtpEmail(email, code);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("send-otp error:", err);
    return NextResponse.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }
}