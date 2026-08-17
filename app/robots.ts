import type { MetadataRoute } from "next";
import { isProductionEnvironment } from "@/lib/env";
import { resolveBaseUrl } from "@/lib/domain";

export default function robots(): MetadataRoute.Robots {
  const isProd = isProductionEnvironment();

  if (isProd) {
    return {
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"]
      },
      sitemap: `${resolveBaseUrl()}/sitemap.xml`
    };
  }

  return {
    rules: {
      userAgent: "*",
      disallow: "/"
    }
  };
}
