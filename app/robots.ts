import type { MetadataRoute } from "next";
import { isProductionEnvironment } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const isProd = isProductionEnvironment();

  if (isProd) {
    return {
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"]
      },
      sitemap: "https://fderuiter-portfolio.vercel.app/sitemap.xml"
    };
  }

  return {
    rules: {
      userAgent: "*",
      disallow: "/"
    }
  };
}
