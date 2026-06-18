import { NextRequest, NextResponse } from "next/server";
import { UnifiedAccountEngine } from "@/app/lib/account-engine";

export const dynamic = "force-dynamic";

const engine = new UnifiedAccountEngine();

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { action, payloadData } = payload;

    switch (action) {
      case "initiate-verification":
        const initResult = await engine.initiateVerification(payloadData.phoneNumber);
        return NextResponse.json(initResult, { status: 200 });

      case "verify-otp":
        const verifyResult = await engine.verifyOTPAndResolveLink(payloadData.verificationId, payloadData.code);
        if (!verifyResult.success) {
          return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }
        return NextResponse.json(verifyResult, { status: 200 });

      case "transition-account":
        await engine.transitionAccountType(payloadData.accountId, payloadData.newType);
        return NextResponse.json({ success: true }, { status: 200 });

      case "merge-identities":
        await engine.mergeIdentities(payloadData.sourceAccountId, payloadData.targetAccountId);
        return NextResponse.json({ success: true }, { status: 200 });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err: unknown) {
    console.error("Account Engine Error:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
