import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp-store";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Missing email or code." },
        { status: 400 }
      );
    }

    const result = verifyOtp(email, code);

    if (!result.valid) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("verify-otp error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}