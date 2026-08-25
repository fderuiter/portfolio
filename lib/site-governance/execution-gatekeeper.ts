import {
  ExecutionAction,
  GatekeeperResult,
  GreenlightTokenPayload,
} from "./types";
import { verifyGreenlightToken } from "./greenlight-engine";

export class SovereignGatekeeperException extends Error {
  public readonly siteId: string;
  public readonly action: ExecutionAction;
  public readonly violationCode: string;

  constructor(
    siteId: string,
    action: ExecutionAction,
    violationCode: string,
    message: string
  ) {
    super(message);
    this.name = "SovereignGatekeeperException";
    this.siteId = siteId;
    this.action = action;
    this.violationCode = violationCode;
  }
}

/**
 * Sovereign Site Execution Gatekeeper middleware preventing subject randomization
 * and eCRF write access on non-greenlight sites.
 */
export function verifyExecutionAccess(params: {
  siteId: string;
  action: ExecutionAction;
  tokenPayload?: GreenlightTokenPayload;
  secretKey?: string;
}): GatekeeperResult {
  const { siteId, action, tokenPayload, secretKey } = params;
  const timestamp = new Date().toISOString();

  if (!tokenPayload) {
    return {
      allowed: false,
      siteId,
      action,
      status: "BLOCKED",
      reason: `Execution action '${action}' denied for Site '${siteId}': Missing Greenlight HMAC token`,
      violationCode: "MISSING_GREENLIGHT_TOKEN",
      timestamp,
    };
  }

  const verification = verifyGreenlightToken(tokenPayload, secretKey);
  if (!verification.valid) {
    return {
      allowed: false,
      siteId,
      action,
      status: "BLOCKED",
      reason: `Execution action '${action}' denied for Site '${siteId}': ${verification.reason || "Invalid HMAC token"}`,
      violationCode: "INVALID_HMAC_TOKEN",
      timestamp,
    };
  }

  if (tokenPayload.siteId !== siteId) {
    return {
      allowed: false,
      siteId,
      action,
      status: "BLOCKED",
      reason: `Execution action '${action}' denied for Site '${siteId}': Token site ID mismatch ('${tokenPayload.siteId}' vs '${siteId}')`,
      violationCode: "SITE_ID_MISMATCH",
      timestamp,
    };
  }

  if (tokenPayload.status === "BLOCKED") {
    return {
      allowed: false,
      siteId,
      action,
      status: "BLOCKED",
      reason: `Execution action '${action}' denied: Site '${siteId}' is in BLOCKED state and cannot perform eCRF writes or subject randomization`,
      violationCode: "GATEKEEPER_SITE_NOT_GREENLIT",
      timestamp,
    };
  }

  return {
    allowed: true,
    siteId,
    action,
    status: tokenPayload.status,
    reason: `Access granted for action '${action}' on Site '${siteId}' via verified HMAC token (status: ${tokenPayload.status})`,
    timestamp,
  };
}

/**
 * Asserts that site execution is permitted, throwing SovereignGatekeeperException if blocked.
 */
export function assertExecutionAllowed(
  siteId: string,
  action: ExecutionAction,
  tokenPayload?: GreenlightTokenPayload,
  secretKey?: string
): void {
  const result = verifyExecutionAccess({
    siteId,
    action,
    tokenPayload,
    secretKey,
  });
  if (!result.allowed) {
    throw new SovereignGatekeeperException(
      siteId,
      action,
      result.violationCode || "GATEKEEPER_DENIAL",
      result.reason
    );
  }
}
