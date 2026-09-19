import { env, isBuildPhase } from "@/lib/env";

/**
 * Raised when a data source a production build depends on is unreachable.
 *
 * Deliberately not caught by the services that raise it: the point is to stop
 * the build rather than to substitute content.
 */
export class DataSourceUnavailableError extends Error {
  readonly source: string;

  constructor(source: string, cause: unknown) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    super(
      `Production build aborted: ${source} could not reach its data source.\n\n` +
        `${detail}\n\n` +
        `Static generation would otherwise have substituted fallback content ` +
        `and exited successfully, publishing a deployment whose pages do not ` +
        `reflect the database. Fix the data source, or build in a non-production ` +
        `environment where fallbacks are intended.`
    );
    this.name = "DataSourceUnavailableError";
    this.source = source;
    this.cause = cause;
  }
}

/**
 * Converts a caught data-source failure into a build failure, but only while a
 * production build is generating pages.
 *
 * The content services fall back to static data whenever a query fails, which is
 * correct when serving traffic: Neon suspends its compute after five minutes of
 * inactivity (AGENTS.md section 22) and a visitor should still get a page. During
 * static generation the same behaviour is a hazard, because the fallback is baked
 * into the deployed output and the build reports success.
 *
 * Only genuine failures reach here. A query that succeeds and returns no rows is
 * not a failure and does not call this.
 *
 * Non-production builds are unaffected, so local builds and CI runs without a
 * database continue to fall back as before.
 */
export function failBuildOnDataSourceError(
  source: string,
  cause: unknown
): void {
  if (!isBuildPhase()) return;
  if (env.VERCEL_ENV !== "production") return;

  // Emergency override, mirroring ALLOW_DANGEROUS_GIT in AGENTS.md section 15.
  // Publishing fallback content as though it were real is the failure this guard
  // exists to prevent, so reaching for this should be a deliberate, temporary
  // act by an operator who has accepted that outcome -- never a default.
  if (env.ALLOW_FALLBACK_PRODUCTION_BUILD === "1") {
    console.error(
      `[build-integrity] ${source} could not reach its data source. ` +
        `Continuing with fallback content because ` +
        `ALLOW_FALLBACK_PRODUCTION_BUILD=1 is set. The resulting deployment ` +
        `will not reflect the database.`
    );
    return;
  }

  throw new DataSourceUnavailableError(source, cause);
}
