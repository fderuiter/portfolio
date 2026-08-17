import type { MetadataRoute } from "next";
import { env, isProductionEnvironment } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const isProd = isProductionEnvironment();

  if (isProd) {
    const baseUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
    return {
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"]
      },
      sitemap: `${baseUrl}/sitemap.xml`
    };
  }

  return {
    rules: {
      userAgent: "*",
      disallow: "/"
    }
  };
}
