# Security Policy

## Layout Engine & Core Framework (`@chenglou/pretext`)

This project relies on the `@chenglou/pretext` library as its core text layout engine to achieve high performance. Since this library processes user-facing and dynamically injected text, it is important to understand its security posture.

- The `pretext` library maintains specific security boundaries and policies regarding vulnerabilities, such as Denial-of-Service (DoS) behaviors that could theoretically stem from processing extremely long or maliciously crafted text inputs.
- If you discover or suspect any upstream vulnerabilities within the layout engine itself, **do not** open public issues. Instead, report them privately through the official GitHub vulnerability reporting flow for the [pretext repository](https://github.com/chenglou/pretext).
- In the event that local security auditing detects a dependency vulnerability affecting `@chenglou/pretext` or related layout core components, the audit tool raises an immediate security alert and halts the pipeline. These issues require private disclosure and core framework mitigation rather than standard third-party override suppression.

## Automated Vulnerability Audits & Local CLI

The repository features an automated vulnerability audit tool that evaluates lockfile dependencies against known advisory databases.

### Local Audit Execution

Developers can run local security audits using the following CLI command:

```bash
npm run audit:security
```

This command executes `npx tsx scripts/security-audit.ts`, which parses `npm audit --json` output and enforces repository security policies.

### Severity Thresholds

The security audit CLI evaluates vulnerability severity levels and enforces the following policy:

- **High & Critical Severities:** Automatically trigger failure of the security check unless matched by a valid, active vulnerability override rule in `security-audit-ignore.json`.
- **Low & Moderate Severities:** Do not block execution by default, though developers are encouraged to remediate them during routine maintenance.

## CI Pipeline Security Gate Enforcement

Automated security checks are enforced across continuous integration and release workflows:

- **Pre-Commit Hook Gate:** Local commits perform dependency security vulnerability checks via `npm run audit:security` in `.husky/pre-commit` before remote push.
- **Pull Request & Branch CI Gate:** In `.github/workflows/ci.yml`, the `security-gate` job executes `npm run audit:security` on every pull request and push to primary branches (`main`/`master`). Pull requests with unhandled or expired vulnerabilities cannot pass CI.
- **Release Gate Pipeline:** Pre-deployment release operations execute `npm run release:gate` (`scripts/release-gate.ts`), which runs the vulnerability security audit step (`runSecurityAudit`) prior to database migration deployments and production builds. Any unhandled high or critical vulnerabilities halt the release pipeline immediately.

## Vulnerability Override Governance Rules

When a high or critical third-party vulnerability cannot be immediately resolved upstream (e.g., dev-only dependencies or non-exploitable utility modules), temporary suppressions can be configured in `security-audit-ignore.json` (at the root of the repository or in `scripts/security-audit-ignore.json`).

### Mandatory Override Parameters

All suppression rules in `security-audit-ignore.json` must strictly adhere to the following governance requirements:

1. **Advisory Identifier (`advisory` / `advisoryId` / `cve` / `ghsa` / `id`):** Must specify a valid advisory identifier (e.g., `GHSA-c2qf-rxjj-4v5w` or `CVE-XXXX-XXXX`). Entries missing an advisory ID are invalid and rejected by the audit tool.
2. **Business Justification (`reason` / `justification`):** Must contain a clear description of why the vulnerability is non-actionable or safe in the current deployment context (e.g., dev-only tool, build-time utility with no production runtime exposure).
3. **Risk Owner (`owner`):** Must name the person or accountable repository role responsible for resolving or renewing the exception.
4. **Follow-Up Ticket (`followUp`):** Must reference the visible issue that owns re-evaluation before expiry.
5. **Expiration Date & Maximum 90-Day Lifespan (`expiresAt` / `expires`):** Must provide a valid ISO timestamp specifying when the override expires. Overrides are capped at a **maximum lifespan of 90 days** from creation/execution. Overrides exceeding 90 days are flagged as invalid and fail the audit.
6. **Target Package Scope (`package` / `name`):** Optional parameter to restrict the override to a specific package name.

### Override Validation & Enforcement

During local or CI execution, the audit tool validates all active override rules:

- **Expired Rules:** Rules whose expiration date has passed (`expiresAt <= now`) are rejected and cause the security audit to fail.
- **Invalid Rules:** Rules missing an advisory, rationale, owner, follow-up ticket, expiration, or exceeding the 90-day limit trigger explicit validation errors and fail the audit.
- **Active Rules:** Valid, unexpired rules temporarily suppress matching high or critical vulnerabilities and log active remaining lifespan (in days) to console output.
