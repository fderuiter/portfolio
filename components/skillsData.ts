export interface SkillConfig {
  name: string;
  tooltipText: string;
  terminalLogs: string[];
}

export const skillsData: Record<string, SkillConfig> = {
  "clinical-integrations": {
    name: "Clinical Integrations",
    tooltipText: "Clinical Integrations: Translating cryptic medical telemetry into clear, human-readable pipelines because HIPAA audits are not on my bucket list.",
    terminalLogs: [
      "CLINICAL_TELEMETRY: [INFO] CDISC ODM streaming feed active on port 8443.",
      "CLINICAL_TELEMETRY: [SUCCESS] Decrypted FDA-compliant SDTM dataset payload. Zero compliance drift.",
      "CLINICAL_TELEMETRY: [WARN] High heartrate telemetry detected. Cause: developer viewed local server logs.",
      "CLINICAL_TELEMETRY: [SYSTEM] HIPAA token rotation completed successfully."
    ]
  },
  "layout-physics": {
    name: "Layout Physics",
    tooltipText: "Layout Physics: Crafting buttery-smooth canvas rendering loops to cheat browser reflows because 59fps is an absolute disgrace.",
    terminalLogs: [
      "LAYOUT_PHYSICS: [INFO] Initializing DOM-free canvas loop rendering on requestAnimationFrame thread.",
      "LAYOUT_PHYSICS: [SUCCESS] Layer composite cache warmed up. Reflow thrashes bypassed: 142/142.",
      "LAYOUT_PHYSICS: [PERF] Physics execution time: 0.23ms. 60Hz loop timing nominal.",
      "LAYOUT_PHYSICS: [DEBUG] Dynamic layout boundary recalibrated. Zero shifting detected."
    ]
  },
  "serverless-scaling": {
    name: "Serverless Scaling",
    tooltipText: "Serverless Scaling: Orchestrating serverless database pools that scale up effortlessly and spin down when my credit card cries.",
    terminalLogs: [
      "SERVERLESS_SCALING: [INFO] Managing connection pool allocations with database shard routing rules.",
      "SERVERLESS_SCALING: [SUCCESS] WebSocket connection established. Client telemetry synced in 1.2ms.",
      "SERVERLESS_SCALING: [OPTIMIZE] Scale down sequence triggered. Prevented an unexpected cloud billing alert.",
      "SERVERLESS_SCALING: [DB] Connection pool warm-up complete. Active connections: 8/200."
    ]
  },
  "full-stack-security": {
    name: "Full-Stack Security",
    tooltipText: "Full-Stack Security: Wrapping everything in sanitizers and encryption because 'trusting your users' is a highly critical system vulnerability.",
    terminalLogs: [
      "SECURITY_AUDIT: [INFO] Performing automated XSS content sanitization scan on inbound architectural narratives.",
      "SECURITY_AUDIT: [SUCCESS] JWT validation signature verified. Active HMAC rotation successful.",
      "SECURITY_AUDIT: [SECURE] Content Content Security Policy (CSP) headers verified. 100% sanitize rate on all HTML outputs.",
      "SECURITY_AUDIT: [WARN] Blocked suspected SQL injection attempt. Sanitizer output: safe."
    ]
  }
};

export const homepageTooltips = {
  "systems-rigor": "Ensuring reliability for users so the platform never goes down when they need it most.",
  "architectural-narratives": "The human story behind the code—why this was built and who it helps."
};
