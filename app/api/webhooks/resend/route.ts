import { NextRequest, NextResponse } from "next/server";
import { ResendWebhookEventSchema } from "@/lib/schemas";
import { EmailService, verifySvixSignature } from "@/lib/services/email-service";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

/**
 * Resend deliverability webhook receiver.
 * Validates Svix cryptographic signatures and manages bounce/complaint suppression lists.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: "Missing required Svix webhook verification headers" },
        { status: 400 }
      );
    }

    const rawBody = await req.text();

    const isValid = verifySvixSignature({
      payload: rawBody,
      svixId,
      svixTimestamp,
      svixSignature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Svix webhook signature" },
        { status: 401 }
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const parseResult = ResendWebhookEventSchema.safeParse(parsedJson);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Payload does not match Resend webhook schema",
          details: parseResult.error.issues,
        },
        { status: 422 }
      );
    }

    const result = await EmailService.handleWebhookEvent(parseResult.data);

    return NextResponse.json(
      {
        received: true,
        processedEvent: parseResult.data.type,
        suppressed: result.suppressed || false,
      },
      { status: 200 }
    );
  } catch (err) {
    Sentry.captureException(err);
    console.error("Unhandled error processing Resend webhook:", err);
    return NextResponse.json(
      { error: "Internal server error processing webhook" },
      { status: 500 }
    );
  }
}
