import {
  CountryCode,
  StatutoryRuleCheck,
  SiteStartupData,
  CountryRulesResult,
} from "./types";

/**
 * Statutory site startup requirements matrix by jurisdiction.
 */
export const COUNTRY_RULES_DEFINITION: Record<
  CountryCode,
  Omit<StatutoryRuleCheck, "status">[]
> = {
  US: [
    {
      id: "US-IRB",
      name: "IRB / Ethics Approval",
      jurisdiction: "US",
      description:
        "Institutional Review Board approval pursuant to 21 CFR Part 56.",
      statutoryReference: "21 CFR 56.103",
      mandatory: true,
    },
    {
      id: "US-1572",
      name: "FDA Form 1572",
      jurisdiction: "US",
      description:
        "Statement of Investigator executed by Principal Investigator.",
      statutoryReference: "21 CFR 312.60",
      mandatory: true,
    },
    {
      id: "US-CTA",
      name: "Clinical Trial Agreement & Financial Disclosure",
      jurisdiction: "US",
      description:
        "Fully executed CTA and Financial Disclosure Form 3454/3455.",
      statutoryReference: "21 CFR 54.4",
      mandatory: true,
    },
    {
      id: "US-DOA",
      name: "PI Delegation of Authority Log",
      jurisdiction: "US",
      description:
        "Active electronic DOA log signed by Principal Investigator.",
      statutoryReference: "ICH E6(R2) 4.1.5 / 21 CFR 312.60",
      mandatory: true,
    },
    {
      id: "US-GCP",
      name: "GCP & Human Subject Protection Training",
      jurisdiction: "US",
      description: "100% training completion for all active site personnel.",
      statutoryReference: "21 CFR 312.60 / GCP E6",
      mandatory: true,
    },
    {
      id: "US-IP",
      name: "IP Release Authorization",
      jurisdiction: "US",
      description:
        "Investigational Product shipment authorization and site release.",
      statutoryReference: "21 CFR 312.62",
      mandatory: true,
    },
  ],
  EU: [
    {
      id: "EU-CTIS",
      name: "EU CTIS Application Approval",
      jurisdiction: "EU",
      description:
        "Clinical Trials Information System single application authorization.",
      statutoryReference: "EU CTR No 536/2014 Art. 8",
      mandatory: true,
    },
    {
      id: "EU-ETHICS",
      name: "National Ethics Committee Favorable Opinion",
      jurisdiction: "EU",
      description: "Member State ethics approval recorded in CTIS portal.",
      statutoryReference: "EU CTR No 536/2014 Art. 9",
      mandatory: true,
    },
    {
      id: "EU-CTA",
      name: "Clinical Trial & Financial Agreement",
      jurisdiction: "EU",
      description:
        "Executed CTA adhering to EU Data Protection / GDPR requirements.",
      statutoryReference: "EU CTR No 536/2014 Art. 28",
      mandatory: true,
    },
    {
      id: "EU-EISF",
      name: "eISF Section 1-7 Binder Completeness",
      jurisdiction: "EU",
      description:
        "Section 1-7 electronic Investigator Site File ready for monitoring.",
      statutoryReference: "EU CTR No 536/2014 Art. 57",
      mandatory: true,
    },
    {
      id: "EU-GCP",
      name: "ICH GCP E6(R2/R3) Site Staff Training",
      jurisdiction: "EU",
      description:
        "GCP training certificates verified for all delegated personnel.",
      statutoryReference: "ICH E6(R2) Section 2.8",
      mandatory: true,
    },
    {
      id: "EU-DOA",
      name: "PI Delegation of Authority Log",
      jurisdiction: "EU",
      description: "Validated delegation matrix with PI e-signature.",
      statutoryReference: "ICH E6(R2) 4.1.5",
      mandatory: true,
    },
  ],
  JP: [
    {
      id: "JP-PMDA",
      name: "PMDA Clinical Trial Notification (CTN)",
      jurisdiction: "JP",
      description:
        "PMDA notification filed and 30-day review period expired without objection.",
      statutoryReference: "MHLW Ordinance No. 28 / PMDA Law Art. 80-2",
      mandatory: true,
    },
    {
      id: "JP-IRB",
      name: "Institutional Review Board Approval",
      jurisdiction: "JP",
      description: "Japanese local IRB approval and written confirmation.",
      statutoryReference: "J-GCP Ordinance Art. 27",
      mandatory: true,
    },
    {
      id: "JP-GCP",
      name: "J-GCP Compliance & Training",
      jurisdiction: "JP",
      description:
        "J-GCP qualification verified for Principal Investigator and Sub-Investigators.",
      statutoryReference: "J-GCP Ordinance Art. 42",
      mandatory: true,
    },
    {
      id: "JP-CTA",
      name: "Three-Party Clinical Trial Agreement",
      jurisdiction: "JP",
      description:
        "Executed contract between Sponsor, Site, and Site Management Organization (if applicable).",
      statutoryReference: "J-GCP Ordinance Art. 13",
      mandatory: true,
    },
    {
      id: "JP-DOA",
      name: "Delegation of Authority Log",
      jurisdiction: "JP",
      description:
        "PI delegation log registered with Japanese site administration.",
      statutoryReference: "J-GCP Ordinance Art. 43",
      mandatory: true,
    },
    {
      id: "JP-IP",
      name: "IP Import Permit & Site Release",
      jurisdiction: "JP",
      description:
        "Investigational product import certificate and release document.",
      statutoryReference: "J-GCP Ordinance Art. 16",
      mandatory: true,
    },
  ],
  GB: [
    {
      id: "GB-MHRA",
      name: "MHRA Clinical Trial Authorization (CTA)",
      jurisdiction: "GB",
      description:
        "Medicines and Healthcare products Regulatory Agency CTA issue.",
      statutoryReference: "UK SI 2004/1031 Reg 12",
      mandatory: true,
    },
    {
      id: "GB-REC",
      name: "NHS Research Ethics Committee Approval",
      jurisdiction: "GB",
      description: "NHS REC favorable opinion letter.",
      statutoryReference: "UK SI 2004/1031 Reg 14",
      mandatory: true,
    },
    {
      id: "GB-HRA",
      name: "HRA & Care Organisation Approval",
      jurisdiction: "GB",
      description: "Health Research Authority and NHS Trust confirmation.",
      statutoryReference: "UK Health and Social Care Act 2012",
      mandatory: true,
    },
    {
      id: "GB-CTA",
      name: "Model Clinical Trial Agreement (mCTA)",
      jurisdiction: "GB",
      description: "Executed mCTA or CRO template agreement.",
      statutoryReference: "NHS Commercial Contract Research Framework",
      mandatory: true,
    },
    {
      id: "GB-GCP",
      name: "UK GCP Training Certificate",
      jurisdiction: "GB",
      description:
        "Valid GCP certificate (renewed within 24 months) for site staff.",
      statutoryReference: "UK SI 2004/1031 Reg 28",
      mandatory: true,
    },
    {
      id: "GB-DOA",
      name: "PI Delegation of Authority Log",
      jurisdiction: "GB",
      description: "Current DOA log signed by Principal Investigator.",
      statutoryReference: "ICH E6(R2) 4.1.5 / UK GCP",
      mandatory: true,
    },
  ],
  Global: [
    {
      id: "GL-ETHICS",
      name: "Ethics Committee Favorable Opinion",
      jurisdiction: "Global",
      description: "Independent Ethics Committee (IEC) / IRB approval.",
      statutoryReference: "ICH E6(R2/R3) Section 3.1",
      mandatory: true,
    },
    {
      id: "GL-REG",
      name: "Regulatory Authority Clearance",
      jurisdiction: "Global",
      description:
        "National Regulatory Authority clinical trial authorization.",
      statutoryReference: "ICH E6(R2/R3) Section 5.10",
      mandatory: true,
    },
    {
      id: "GL-CTA",
      name: "Clinical Trial Agreement",
      jurisdiction: "Global",
      description: "Executed financial and clinical agreement.",
      statutoryReference: "ICH E6(R2/R3) Section 5.9",
      mandatory: true,
    },
    {
      id: "GL-EISF",
      name: "eISF Binder Completeness",
      jurisdiction: "Global",
      description: "Essential site regulatory documents on file.",
      statutoryReference: "ICH E6(R2/R3) Section 8",
      mandatory: true,
    },
    {
      id: "GL-DOA",
      name: "Delegation of Authority Log",
      jurisdiction: "Global",
      description: "PI delegation log active with role assignments.",
      statutoryReference: "ICH E6(R2/R3) Section 4.1.5",
      mandatory: true,
    },
    {
      id: "GL-GCP",
      name: "GCP Training Certificate",
      jurisdiction: "Global",
      description: "Site staff GCP compliance training recorded.",
      statutoryReference: "ICH E6(R2/R3) Section 2.8",
      mandatory: true,
    },
  ],
};

/**
 * Evaluates site startup data against statutory country rules matrix.
 */
export function evaluateCountryRules(
  jurisdiction: CountryCode,
  siteData: SiteStartupData
): CountryRulesResult {
  const rules =
    COUNTRY_RULES_DEFINITION[jurisdiction] ||
    COUNTRY_RULES_DEFINITION["Global"];
  const evaluatedRules: StatutoryRuleCheck[] = [];
  const passedRules: string[] = [];
  const missingRequirements: string[] = [];

  for (const ruleDef of rules) {
    let status: StatutoryRuleCheck["status"] = "PENDING";

    switch (ruleDef.id) {
      // US Rules
      case "US-IRB":
      case "EU-ETHICS":
      case "JP-IRB":
      case "GB-REC":
      case "GL-ETHICS": {
        const isApproved = Boolean(siteData.irbApprovalDate);
        const notExpired = siteData.irbExpirationDate
          ? new Date(siteData.irbExpirationDate).getTime() > Date.now()
          : true;
        status = isApproved && notExpired ? "PASSED" : "FAILED";
        break;
      }
      case "US-1572": {
        status = Boolean(siteData.form1572Signed) ? "PASSED" : "FAILED";
        break;
      }
      case "US-CTA":
      case "EU-CTA":
      case "JP-CTA":
      case "GB-CTA":
      case "GL-CTA": {
        status = Boolean(siteData.ctaExecuted) ? "PASSED" : "FAILED";
        break;
      }
      case "US-DOA":
      case "EU-DOA":
      case "JP-DOA":
      case "GB-DOA":
      case "GL-DOA": {
        status = Boolean(siteData.doaSignedByPi) ? "PASSED" : "FAILED";
        break;
      }
      case "US-GCP":
      case "EU-GCP":
      case "JP-GCP":
      case "GB-GCP":
      case "GL-GCP": {
        const training = siteData.trainingCompletionPercent ?? 0;
        status = training >= 100 ? "PASSED" : "FAILED";
        break;
      }
      case "US-IP":
      case "JP-IP": {
        status = Boolean(siteData.ipReleaseAuthorized) ? "PASSED" : "FAILED";
        break;
      }

      // EU Specific
      case "EU-CTIS": {
        status = Boolean(siteData.euCtisRegistered) ? "PASSED" : "FAILED";
        break;
      }
      case "EU-EISF":
      case "GL-EISF": {
        const isComplete = Boolean(siteData.eIsfComplete);
        const noMissing =
          !siteData.eIsfMissingDocuments ||
          siteData.eIsfMissingDocuments.length === 0;
        status = isComplete && noMissing ? "PASSED" : "FAILED";
        break;
      }

      // JP Specific
      case "JP-PMDA": {
        status = Boolean(siteData.pmdaNotificationFiled) ? "PASSED" : "FAILED";
        break;
      }

      // GB Specific
      case "GB-MHRA":
      case "GB-HRA":
      case "GL-REG": {
        status = Boolean(siteData.mhraApprovalReceived) ? "PASSED" : "FAILED";
        break;
      }

      default:
        status = "PASSED";
    }

    const checkItem: StatutoryRuleCheck = {
      ...ruleDef,
      status,
    };

    evaluatedRules.push(checkItem);

    if (status === "PASSED") {
      passedRules.push(ruleDef.id);
    } else if (ruleDef.mandatory) {
      missingRequirements.push(
        `${ruleDef.name} (${ruleDef.statutoryReference})`
      );
    }
  }

  const passedCount = passedRules.length;
  const totalCount = evaluatedRules.length;
  const complianceScore =
    totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  const isCompliant = missingRequirements.length === 0;

  return {
    jurisdiction,
    isCompliant,
    complianceScore,
    evaluatedRules,
    passedRules,
    missingRequirements,
  };
}
