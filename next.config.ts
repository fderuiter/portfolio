import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: {
      exclude: ["error", "warn"],
    },
  },
  async redirects() {
    return [
      {
        source: "/transparency",
        destination: "/proof",
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG || "dummy-org",
  project: process.env.SENTRY_PROJECT || "dummy-project",
  widenClientFileUpload: true,
  sourcemaps: {
    disable: false,
  },
});
