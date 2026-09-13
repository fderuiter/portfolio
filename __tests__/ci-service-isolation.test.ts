import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * The workflow runs a Postgres service container published on a host port.
 * Steps that deliberately run *without* a database use a placeholder DSN, and
 * that placeholder must not land on the service's port.
 *
 * lib/db.ts drives @neondatabase/serverless over a WebSocket. Aimed at the
 * Postgres container it sends an HTTP upgrade request to a server speaking the
 * Postgres wire protocol, receives no HTTP response, and waits with no
 * handshake timeout. The build step hung for over ninety minutes this way,
 * which is invisible locally because nothing listens on 5432 there and the
 * connection is refused immediately.
 */
describe("CI Service Container Isolation", () => {
  const workflowDir = path.join(process.cwd(), ".github/workflows");
  const ciPath = path.join(workflowDir, "ci.yml");
  const ci = fs.readFileSync(ciPath, "utf8");

  /** Host ports published by service containers, from `- <host>:<container>`. */
  const servicePorts = [...ci.matchAll(/^\s*-\s*"?(\d+):(\d+)"?\s*$/gm)].map(
    (m) => Number(m[1])
  );

  /** Placeholder DSNs: the ones that name a throwaway credential. */
  const placeholderDsns = [
    ...ci.matchAll(/DATABASE_URL:\s*"([^"]*dummy[^"]*)"/g),
  ].map((m) => m[1]);

  it("publishes at least one service container port", () => {
    expect(servicePorts.length).toBeGreaterThan(0);
    expect(servicePorts).toContain(5432);
  });

  it("declares placeholder database URLs for database-free steps", () => {
    expect(placeholderDsns.length).toBeGreaterThan(0);
  });

  it.each(placeholderDsns)(
    "placeholder DSN %s does not target a live service container port",
    (dsn) => {
      const port = Number(new URL(dsn).port);
      expect(Number.isNaN(port)).toBe(false);
      expect(servicePorts).not.toContain(port);
    }
  );

  it("bounds every job so a hang fails fast instead of running to the 6h default", () => {
    const jobsBlock = ci.slice(ci.indexOf("\njobs:"));
    const runsOn = (jobsBlock.match(/^\s{4}runs-on:/gm) ?? []).length;
    const timeouts = (jobsBlock.match(/^\s{4}timeout-minutes:/gm) ?? []).length;

    expect(runsOn).toBeGreaterThan(0);
    expect(timeouts).toBe(runsOn);
  });
});
