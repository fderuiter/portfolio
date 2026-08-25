import { NextResponse } from "next/server";
import { SiteGreenlightRequestSchema } from "@/lib/schemas";
import {
  evaluateGreenlight,
  computeFacetHash,
  issueGreenlightToken,
} from "@/lib/site-governance/greenlight-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = SiteGreenlightRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid site greenlight request parameters",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const evaluation = evaluateGreenlight(
      {
        siteId: data.siteId,
        siteName: `Site ${data.siteId}`,
        countryCode: data.countryCode,
        irbApprovalDate: data.irbApprovalDate,
        irbExpirationDate: data.irbExpirationDate,
        ctaExecuted: data.ctaExecuted,
        ctaExecutionDate: data.ctaExecutionDate,
        eIsfComplete: data.eIsfComplete,
        eIsfMissingDocuments: data.eIsfMissingDocuments,
        doaSignedByPi: data.doaSignedByPi,
        doaPiSignatureDate: data.doaPiSignatureDate,
        trainingCompletionPercent: data.trainingCompletionPercent,
        ipReleaseAuthorized: data.ipReleaseAuthorized,
        ipReleaseDate: data.ipReleaseDate,
        form1572Signed: data.form1572Signed,
        euCtisRegistered: data.euCtisRegistered,
        pmdaNotificationFiled: data.pmdaNotificationFiled,
        mhraApprovalReceived: data.mhraApprovalReceived,
      },
      data.studyId
    );

    const facetHash = computeFacetHash(evaluation.facets);
    const token = issueGreenlightToken(
      evaluation.siteId,
      evaluation.studyId,
      evaluation.status,
      facetHash
    );

    return NextResponse.json({
      success: true,
      evaluation,
      token,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          (error as Error).message ||
          "Internal server error during site evaluation",
      },
      { status: 500 }
    );
  }
}
