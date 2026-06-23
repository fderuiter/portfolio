import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ["@tabler/icons-react", "framer-motion"],
  },
};

const analyzerConfig = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default analyzerConfig(
  withSentryConfig(nextConfig, {
    silent: true,
    org: process.env.SENTRY_ORG || "dummy-org",
    project: process.env.SENTRY_PROJECT || "dummy-project",
    widenClientFileUpload: true,
    sourcemaps: {
      disable: false,
    },
  })
);
