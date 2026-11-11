import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/i/"],
        disallow: [
          "/api/upload",
          "/api/auth/",
          "/api/account/",
          "/api/images/",
          "/api/meta/",
          "/api/recent",
          "/account",
          "/sign-in",
          "/sign-up",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: new URL(siteUrl).host,
  };
}
